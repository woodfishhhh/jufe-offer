#!/usr/bin/env bash

set -Eeuo pipefail
umask 027

readonly APP_ROOT="/opt/jufe-offer"
readonly APP_USER="jufe-offer"
readonly RELEASES_DIR="$APP_ROOT/releases"
readonly INCOMING_DIR="$APP_ROOT/incoming"
readonly SHARED_DIR="$APP_ROOT/shared"
readonly SLOTS_DIR="$APP_ROOT/slots"
readonly BACKUPS_DIR="$APP_ROOT/backups"
readonly DB_PATH="$APP_ROOT/data/prod.db"
readonly SWITCH_HELPER="/usr/local/sbin/jufe-offer-switch-upstream"
readonly PUBLIC_HEALTH_URL="https://jufe.woodfish.site/api/health"
readonly NPM_BIN="/usr/bin/npm"

command_name="${1:-}"
release_id="${2:-}"
migration_mode="${3:-maintenance}"

candidate_slot=""
candidate_service=""
candidate_port=""
traffic_switched=false
metadata_committed=false
active_slot=""
active_service=""
active_port=""
active_release=""
active_revision=""
maintenance_started=false
compatible_migration_applied=false
database_migration_started=false
database_existed=false
backup_file=""

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '[deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

validate_deploy_identity() {
  local expected_uid
  local expected_gid

  expected_uid="$(id -u "$APP_USER")" || fail "Deploy user $APP_USER does not exist."
  expected_gid="$(id -g "$APP_USER")" || fail "Deploy group for $APP_USER does not exist."

  if [[ "$(id -u)" != "$expected_uid" || "$(id -g)" != "$expected_gid" ]]; then
    fail "This script must run as $APP_USER, not $(id -un)."
  fi
}

validate_deploy_directories() {
  local expected_owner
  local directory
  local actual_owner

  expected_owner="$(id -u "$APP_USER"):$(id -g "$APP_USER")"
  for directory in \
    "$RELEASES_DIR" \
    "$INCOMING_DIR" \
    "$SHARED_DIR" \
    "$SLOTS_DIR" \
    "$BACKUPS_DIR"; do
    if [[ ! -d "$directory" ]]; then
      fail "Deploy directory is missing: $directory"
    fi
    actual_owner="$(stat -c '%u:%g' "$directory")"
    if [[ "$actual_owner" != "$expected_owner" ]]; then
      fail "Deploy directory has unexpected ownership: $directory ($actual_owner, expected $expected_owner)"
    fi
    if [[ ! -w "$directory" ]]; then
      fail "Deploy directory is not writable by $APP_USER: $directory"
    fi
  done
}

validate_release_id() {
  if [[ ! "$release_id" =~ ^[0-9a-f]{40}$ ]]; then
    printf 'Invalid release id.\n' >&2
    exit 2
  fi
}

slot_port() {
  case "$1" in
    blue) printf '3020\n' ;;
    green) printf '3021\n' ;;
    *) return 1 ;;
  esac
}

other_slot() {
  case "$1" in
    blue) printf 'green\n' ;;
    green) printf 'blue\n' ;;
    *) return 1 ;;
  esac
}

safe_remove_release_tree() {
  local target="$1"
  local error_log
  local error_count
  local first_error

  if [[ ! "$target" =~ ^/opt/jufe-offer/releases/(\.staging-)?[0-9a-f]{40}$ ]]; then
    printf 'Refusing to remove unsafe release path: %s\n' "$target" >&2
    return 1
  fi

  if [[ -e "$target" ]]; then
    error_log="$(mktemp "${TMPDIR:-/tmp}/jufe-release-cleanup.XXXXXX")"
    if rm -rf --one-file-system -- "$target" 2>"$error_log"; then
      rm -f -- "$error_log"
      return 0
    fi

    error_count="$(wc -l <"$error_log" | tr -d '[:space:]')"
    first_error="$(sed -n '1p' "$error_log" | tr -d '\r\n')"
    printf '[deploy] CLEANUP_WARNING release=%s errors=%s detail=%s\n' \
      "${target##*/}" "$error_count" "$first_error" >&2
    rm -f -- "$error_log"
    return 1
  fi
}

atomic_symlink() {
  local target="$1"
  local link_path="$2"
  local temporary_link="${link_path}.next-$$"

  rm -f -- "$temporary_link"
  ln -s "$target" "$temporary_link"
  mv -Tf "$temporary_link" "$link_path"
}

validate_release_tree() {
  local release_root="$1"
  local required_path
  local link_path
  local resolved_target

  for required_path in \
    .next/standalone/server.js \
    .next/standalone/.next/static \
    .next/standalone/public \
    package.json \
    prisma/schema.prisma \
    prisma/migrations \
    REVISION \
    release.manifest.sha256; do
    if [[ ! -e "$release_root/$required_path" ]]; then
      printf 'Incomplete release: missing %s.\n' "$required_path" >&2
      return 1
    fi
  done

  if [[ "$(tr -d '\r\n' <"$release_root/REVISION")" != "$release_id" ]]; then
    printf 'Release revision file does not match %s.\n' "$release_id" >&2
    return 1
  fi

  if ! (
    cd "$release_root"
    sha256sum --strict --check release.manifest.sha256 >/dev/null
  ); then
    printf 'Release manifest verification failed.\n' >&2
    return 1
  fi

  while IFS= read -r -d '' link_path; do
    resolved_target="$(readlink -f "$link_path" 2>/dev/null || true)"
    case "$resolved_target" in
      "$release_root"/* | "$APP_ROOT/.env" | "$SHARED_DIR/cache") ;;
      *)
        printf 'Unsafe or broken release symlink: %s -> %s\n' "$link_path" "$resolved_target" >&2
        return 1
        ;;
    esac
  done < <(find "$release_root" -xdev -type l -print0)
}

prepare_runtime_links() {
  local release_root="$1"
  local cache_path="$release_root/.next/standalone/.next/cache"

  if [[ -e "$release_root/.env" || -L "$release_root/.env" ]]; then
    fail 'A release payload must not contain .env.'
  fi

  if [[ -e "$cache_path" || -L "$cache_path" ]]; then
    rm -rf --one-file-system -- "$cache_path"
  fi

  ln -s "$APP_ROOT/.env" "$release_root/.env"
  ln -s "$SHARED_DIR/cache" "$cache_path"
}

write_slot_environment() {
  local slot="$1"
  local port="$2"
  local release_root="$3"
  local env_path="$SHARED_DIR/$slot.env"
  local temporary_env

  temporary_env="$(mktemp "$SHARED_DIR/.${slot}.env.XXXXXX")"
  {
    printf 'PORT=%s\n' "$port"
    printf 'HOSTNAME=0.0.0.0\n'
    printf 'APP_REVISION=%s\n' "$release_id"
    printf 'RELEASE_DIR=%s\n' "$release_root"
  } >"$temporary_env"
  chmod 0640 "$temporary_env"
  mv -f "$temporary_env" "$env_path"
}

health_matches() {
  local url="$1"
  local expected_revision="$2"
  local response

  response="$(curl --fail --silent --show-error --max-time 8 "$url" 2>/dev/null)" || return 1
  node -e '
    const payload = JSON.parse(process.argv[1]);
    if (payload.ok !== true || payload.revision !== process.argv[2]) process.exit(1);
  ' "$response" "$expected_revision"
}

wait_for_health() {
  local url="$1"
  local expected_revision="$2"
  for _ in {1..30}; do
    if health_matches "$url" "$expected_revision"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

wait_for_https_health() {
  local expected_revision="$1"
  local response
  for _ in {1..20}; do
    response="$(
      curl --fail --silent --show-error --max-time 10 \
        --resolve jufe.woodfish.site:443:127.0.0.1 \
        "$PUBLIC_HEALTH_URL" 2>/dev/null
    )" || {
      sleep 1
      continue
    }

    if node -e '
      const payload = JSON.parse(process.argv[1]);
      if (payload.ok !== true || payload.revision !== process.argv[2]) process.exit(1);
    ' "$response" "$expected_revision"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

wait_for_previous_health() {
  local legacy_health_bundle="$active_release/.next/standalone/.next/server/app/api/health/route.js"

  if [[ -f "$legacy_health_bundle" ]]; then
    wait_for_health "http://127.0.0.1:${active_port}/api/health" "$active_revision"
    return
  fi

  log "Previous release $active_revision predates revision health; using root-page recovery check once."
  for _ in {1..20}; do
    if curl --fail --silent --show-error --max-time 8 \
      "http://127.0.0.1:${active_port}/" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

compare_migrations() {
  local current_migrations="$active_release/prisma/migrations"
  local candidate_migrations="$RELEASES_DIR/$release_id/prisma/migrations"
  local status

  if [[ ! -d "$current_migrations" || ! -d "$candidate_migrations" ]]; then
    printf 'different\n'
    return 0
  fi

  if diff --brief --recursive --no-dereference \
    "$current_migrations" "$candidate_migrations" >/dev/null; then
    printf 'same\n'
    return 0
  else
    status=$?
  fi

  if [[ "$status" -eq 1 ]]; then
    printf 'different\n'
    return 0
  fi

  printf 'Unable to compare production and candidate migrations.\n' >&2
  return "$status"
}

ensure_prisma_tool() {
  local release_root="$RELEASES_DIR/$release_id"
  local prisma_version
  local prisma_tool_staging

  prisma_version="$(
    node -e '
      const pkg = require(process.argv[1]);
      const spec = pkg.devDependencies?.prisma ?? pkg.dependencies?.prisma;
      const version = spec?.match(/\d+\.\d+\.\d+/)?.[0];
      if (!version) process.exit(1);
      process.stdout.write(version);
    ' "$release_root/package.json"
  )" || return 1

  if [[ ! "$prisma_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    printf 'Invalid Prisma CLI version.\n' >&2
    return 1
  fi

  prisma_tool_dir="$SHARED_DIR/prisma/$prisma_version"
  if [[ ! -x "$prisma_tool_dir/node_modules/.bin/prisma" ]]; then
    prisma_tool_staging="$SHARED_DIR/prisma/.staging-$prisma_version"
    rm -rf --one-file-system -- "$prisma_tool_staging" "$prisma_tool_dir"
    mkdir -p "$prisma_tool_staging"
    printf '{"private":true}\n' >"$prisma_tool_staging/package.json"
    (
      cd "$prisma_tool_staging"
      "$NPM_BIN" install \
        --omit=dev \
        --no-audit \
        --no-fund \
        --no-package-lock \
        --no-save \
        "prisma@$prisma_version"
    ) || return 1
    mv "$prisma_tool_staging" "$prisma_tool_dir"
  fi

  (
    cd "$release_root"
    "$prisma_tool_dir/node_modules/.bin/prisma" validate --schema prisma/schema.prisma >/dev/null
  )
}

backup_database() {
  local checkpoint_first="$1"
  local integrity_result

  database_existed=false
  backup_file=""
  if [[ ! -f "$DB_PATH" ]]; then
    return 0
  fi

  database_existed=true
  backup_file="$BACKUPS_DIR/prod-before-${release_id}-$(date -u +%Y%m%dT%H%M%SZ).db"

  if [[ "$checkpoint_first" == true ]]; then
    sqlite3 "$DB_PATH" 'PRAGMA wal_checkpoint(FULL);' >/dev/null || return 1
  fi

  sqlite3 "$DB_PATH" ".timeout 10000" ".backup '$backup_file'" || return 1
  integrity_result="$(sqlite3 "$backup_file" 'PRAGMA integrity_check;')" || return 1
  if [[ "$integrity_result" != ok ]]; then
    printf 'SQLite backup integrity check failed: %s\n' "$integrity_result" >&2
    return 1
  fi
}

run_migrations() {
  local release_root="$RELEASES_DIR/$release_id"

  (
    cd "$release_root"
    "$prisma_tool_dir/node_modules/.bin/prisma" migrate deploy --schema prisma/schema.prisma
  )
}

restore_database() {
  local restore_path="$APP_ROOT/data/.prod.db.restore-$$"
  local integrity_result

  rm -f -- "$DB_PATH-wal" "$DB_PATH-shm" "$restore_path"
  if [[ "$database_existed" == true ]]; then
    if [[ -z "$backup_file" || ! -f "$backup_file" ]]; then
      printf 'Database backup is unavailable; refusing an incomplete restore.\n' >&2
      return 1
    fi
    cp -p "$backup_file" "$restore_path" || return 1
    mv -f "$restore_path" "$DB_PATH" || return 1
    sudo /usr/bin/chown jufe-offer:jufe-offer "$DB_PATH" || return 1
    sudo /usr/bin/chmod 0640 "$DB_PATH" || return 1
    integrity_result="$(sqlite3 "$DB_PATH" 'PRAGMA integrity_check;')" || return 1
    [[ "$integrity_result" == ok ]] || return 1
  else
    rm -f -- "$DB_PATH"
  fi
}

cleanup_candidate() {
  if [[ -n "$candidate_service" ]]; then
    sudo /usr/bin/systemctl stop "$candidate_service" >/dev/null 2>&1 || true
    sudo /usr/bin/systemctl disable "$candidate_service" >/dev/null 2>&1 || true
  fi
}

restore_maintenance_production() {
  local restored=true

  cleanup_candidate
  sudo /usr/bin/systemctl stop "$active_service" >/dev/null 2>&1 || true

  if [[ "$database_migration_started" == true ]]; then
    if ! restore_database; then
      printf '[deploy] CRITICAL: database restore failed; active service remains stopped.\n' >&2
      restored=false
    fi
  fi

  if [[ "$restored" == true ]]; then
    sudo /usr/bin/systemctl enable "$active_service" >/dev/null 2>&1 || restored=false
    sudo /usr/bin/systemctl start "$active_service" || restored=false
    if [[ "$restored" == true ]] && ! wait_for_previous_health; then
      printf '[deploy] CRITICAL: old service did not recover its expected revision.\n' >&2
      restored=false
    fi
  fi

  [[ "$restored" == true ]]
}

fail_before_switch() {
  local reason="$1"
  trap - ERR
  set +e
  printf '[deploy] Candidate rejected before traffic switch: %s\n' "$reason" >&2

  if [[ "$maintenance_started" == true ]]; then
    restore_maintenance_production || true
  else
    cleanup_candidate
    if [[ "$compatible_migration_applied" == true ]]; then
      printf '[deploy] Compatible migration is intentionally retained; the old app was declared compatible.\n' >&2
    fi
  fi
  exit 1
}

fail_after_switch() {
  local reason="$1"
  trap - ERR
  set +e
  printf '[deploy] Production path failed after traffic switch: %s\n' "$reason" >&2

  if ! sudo "$SWITCH_HELPER" "$active_slot"; then
    printf '[deploy] CRITICAL: unable to restore the previous Nginx upstream.\n' >&2
  fi
  atomic_symlink "$active_release" "$APP_ROOT/current" || true

  if [[ "$maintenance_started" == true ]]; then
    restore_maintenance_production || true
  else
    cleanup_candidate
    sudo /usr/bin/systemctl enable "$active_service" >/dev/null 2>&1 || true
    sudo /usr/bin/systemctl start "$active_service" >/dev/null 2>&1 || true
    if ! wait_for_previous_health; then
      printf '[deploy] CRITICAL: previous application health could not be confirmed.\n' >&2
    fi
  fi
  exit 1
}

unexpected_error() {
  local line="$1"
  local status="$2"

  if [[ "$metadata_committed" == true ]]; then
    printf '[deploy] Post-commit cleanup failed at line %s (status %s); new production remains active.\n' \
      "$line" "$status" >&2
    exit "$status"
  fi
  if [[ "$traffic_switched" == true ]]; then
    fail_after_switch "unexpected error at line $line (status $status)"
  fi
  fail_before_switch "unexpected error at line $line (status $status)"
}

cleanup_old_releases() {
  local current_target
  local previous_target
  local blue_target
  local green_target
  local old_release
  local rank=0
  local release_count=0
  local protected_count=0
  local candidate_count=0
  local removed_count=0
  local removed_ids='none'
  local failed_release_ids=()
  local removed_release_ids=()

  current_target="$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)"
  previous_target="$(readlink -f "$APP_ROOT/previous" 2>/dev/null || true)"
  blue_target="$(readlink -f "$SLOTS_DIR/blue" 2>/dev/null || true)"
  green_target="$(readlink -f "$SLOTS_DIR/green" 2>/dev/null || true)"

  while IFS= read -r old_release; do
    rank=$((rank + 1))
    release_count=$((release_count + 1))
    if [[ "$rank" -le 5 ]] \
      || [[ "$old_release" == "$current_target" ]] \
      || [[ "$old_release" == "$previous_target" ]] \
      || [[ "$old_release" == "$blue_target" ]] \
      || [[ "$old_release" == "$green_target" ]]; then
      protected_count=$((protected_count + 1))
      continue
    fi
    candidate_count=$((candidate_count + 1))
    if safe_remove_release_tree "$old_release"; then
      removed_count=$((removed_count + 1))
      removed_release_ids+=("${old_release##*/}")
    else
      failed_release_ids+=("${old_release##*/}")
    fi
  done < <(
    find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d \
      -regextype posix-extended -regex '.*/[0-9a-f]{40}' -printf '%T@ %p\n' \
      | sort -nr \
      | awk '{ print $2 }'
  )

  if (( removed_count > 0 )); then
    removed_ids="${removed_release_ids[*]}"
  fi
  log "Release cleanup: scanned=$release_count protected=$protected_count candidates=$candidate_count removed=$removed_count failed=${#failed_release_ids[@]} removed_ids=$removed_ids."

  if (( ${#failed_release_ids[@]} > 0 )); then
    printf '[deploy] CLEANUP_WARNING failed_release_count=%s release_ids=%s\n' \
      "${#failed_release_ids[@]}" "${failed_release_ids[*]}" >&2
    return 1
  fi
}

cleanup_stale_staging() {
  local staging_dir
  local scanned_count=0
  local removed_count=0
  local removed_ids='none'
  local failed_staging_ids=()
  local removed_staging_ids=()

  while IFS= read -r staging_dir; do
    scanned_count=$((scanned_count + 1))
    if safe_remove_release_tree "$staging_dir"; then
      removed_count=$((removed_count + 1))
      removed_staging_ids+=("${staging_dir##*/}")
    else
      failed_staging_ids+=("${staging_dir##*/}")
    fi
  done < <(
    find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d \
      -mmin +1440 -regextype posix-extended \
      -regex '.*/\.staging-[0-9a-f]{40}' -printf '%T@ %p\n' \
      | sort -nr \
      | awk '{ print $2 }'
  )

  if (( removed_count > 0 )); then
    removed_ids="${removed_staging_ids[*]}"
  fi
  log "Staging cleanup: scanned=$scanned_count removed=$removed_count failed=${#failed_staging_ids[@]} removed_ids=$removed_ids."

  if (( ${#failed_staging_ids[@]} > 0 )); then
    printf '[deploy] CLEANUP_WARNING failed_staging_count=%s staging_ids=%s\n' \
      "${#failed_staging_ids[@]}" "${failed_staging_ids[*]}" >&2
    return 1
  fi
}

cleanup_old_backups() {
  local old_backup

  while IFS= read -r old_backup; do
    if [[ "$old_backup" =~ ^/opt/jufe-offer/backups/prod-before-[0-9a-f]{40}-[0-9]{8}T[0-9]{6}Z\.db$ ]]; then
      rm -f -- "$old_backup"
    fi
  done < <(
    find "$BACKUPS_DIR" -maxdepth 1 -type f -name 'prod-before-*.db' -printf '%T@ %p\n' \
      | sort -nr \
      | awk 'NR > 10 { print $2 }'
  )
}

prepare_staging() {
  local staging_dir="$RELEASES_DIR/.staging-$release_id"

  mkdir -p "$RELEASES_DIR" "$INCOMING_DIR" "$SHARED_DIR/cache" \
    "$SHARED_DIR/pnpm-store" "$SHARED_DIR/prisma" "$SLOTS_DIR" "$BACKUPS_DIR"
  validate_deploy_directories
  safe_remove_release_tree "$staging_dir"
  mkdir -p "$staging_dir"
  log "Prepared $staging_dir for rsync."
}

activate_release() {
  local staging_dir="$RELEASES_DIR/.staging-$release_id"
  local release_dir="$RELEASES_DIR/$release_id"
  local active_slot_file="$SHARED_DIR/active-slot"
  local current_target
  local migration_state

  if [[ "$migration_mode" != maintenance && "$migration_mode" != compatible ]]; then
    fail 'Migration mode must be maintenance or compatible.'
  fi

  mkdir -p "$RELEASES_DIR" "$SHARED_DIR/cache" "$SHARED_DIR/pnpm-store" \
    "$SHARED_DIR/prisma" "$SLOTS_DIR" "$BACKUPS_DIR"
  validate_deploy_directories
  exec 9>"$APP_ROOT/.deploy.lock"
  flock -n 9 || fail 'Another deployment is already running.'

  if [[ ! -d "$staging_dir" && ! -d "$release_dir" ]]; then
    fail 'Candidate staging directory is missing.'
  fi

  if [[ -d "$staging_dir" ]]; then
    validate_release_tree "$staging_dir" || fail 'Candidate release validation failed.'
  fi

  if [[ -d "$release_dir" ]]; then
    validate_release_tree "$release_dir" || fail 'Existing immutable release is invalid.'
    if [[ -d "$staging_dir" ]]; then
      cmp -s "$staging_dir/release.manifest.sha256" "$release_dir/release.manifest.sha256" \
        || fail 'A different payload already exists for this Git SHA.'
      safe_remove_release_tree "$staging_dir"
    fi
  else
    prepare_runtime_links "$staging_dir"
    mv "$staging_dir" "$release_dir"
    validate_release_tree "$release_dir" || fail 'Formal release validation failed.'
  fi

  if [[ ! -f "$active_slot_file" ]]; then
    fail 'Blue-green bootstrap is incomplete: active-slot is missing.'
  fi
  active_slot="$(tr -d '\r\n' <"$active_slot_file")"
  active_port="$(slot_port "$active_slot")" || fail 'Invalid active slot state.'
  active_service="jufe-offer@${active_slot}.service"
  active_release="$(readlink -f "$SLOTS_DIR/$active_slot" 2>/dev/null || true)"
  if [[ ! "$active_release" =~ ^/opt/jufe-offer/releases/[0-9a-f]{40}$ ]] \
    || [[ ! -d "$active_release" ]]; then
    fail 'Active slot does not point to a valid release.'
  fi
  active_revision="$(basename "$active_release")"

  current_target="$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)"
  if [[ "$current_target" != "$active_release" ]]; then
    log "Repairing stale current metadata from $current_target to $active_release."
    atomic_symlink "$active_release" "$APP_ROOT/current"
  fi

  if [[ "$active_release" == "$release_dir" ]]; then
    if wait_for_health "http://127.0.0.1:${active_port}/api/health" "$release_id" \
      && wait_for_https_health "$release_id"; then
      log "Release $release_id is already active and healthy."
      return 0
    fi
    fail 'The requested release is marked active but is not healthy.'
  fi

  candidate_slot="$(other_slot "$active_slot")"
  candidate_port="$(slot_port "$candidate_slot")"
  candidate_service="jufe-offer@${candidate_slot}.service"

  sudo /usr/bin/systemctl stop "$candidate_service" >/dev/null 2>&1 || true
  sudo /usr/bin/systemctl disable "$candidate_service" >/dev/null 2>&1 || true
  atomic_symlink "$release_dir" "$SLOTS_DIR/$candidate_slot"
  write_slot_environment "$candidate_slot" "$candidate_port" "$release_dir"

  migration_state="$(compare_migrations)" || fail 'Migration comparison failed.'
  log "Migration comparison: $migration_state (production $active_revision -> candidate $release_id)."

  if [[ "$migration_state" == different ]]; then
    ensure_prisma_tool || fail_before_switch 'Prisma CLI preparation or schema validation failed.'

    if [[ "$migration_mode" == maintenance ]]; then
      log 'Migration policy: maintenance; stopping the active slot before touching SQLite.'
      maintenance_started=true
      sudo /usr/bin/systemctl stop "$active_service" \
        || fail_before_switch 'Unable to stop the active service for maintenance.'
      sudo /usr/bin/systemctl disable "$active_service" \
        || fail_before_switch 'Unable to disable the active service during maintenance.'
      backup_database true || fail_before_switch 'SQLite backup failed.'
      database_migration_started=true
      run_migrations || fail_before_switch 'Prisma migration failed.'
    else
      log 'Migration policy: compatible; old production remains online by explicit operator assertion.'
      backup_database false || fail_before_switch 'Online SQLite backup failed.'
      if ! run_migrations; then
        printf '[deploy] Migration failed. The old app remains online; backup retained and no write-losing restore was attempted.\n' >&2
        fail_before_switch 'Compatible Prisma migration failed.'
      fi
      compatible_migration_applied=true
    fi
  else
    log 'No migration change: database backup, migration, and active-service stop were skipped.'
  fi

  trap 'unexpected_error "$LINENO" "$?"' ERR

  sudo /usr/bin/systemctl start "$candidate_service" \
    || fail_before_switch 'Candidate service did not start.'
  wait_for_health "http://127.0.0.1:${candidate_port}/api/health" "$release_id" \
    || fail_before_switch 'Candidate local health check failed.'
  log "Candidate $candidate_slot passed local health on port $candidate_port."

  sudo /usr/bin/systemctl enable "$candidate_service" \
    || fail_before_switch 'Candidate service could not be enabled for reboot persistence.'
  sudo "$SWITCH_HELPER" "$candidate_slot" \
    || fail_before_switch 'Nginx configuration test or graceful reload failed.'
  traffic_switched=true
  log "Nginx traffic switched to $candidate_slot after configuration validation."

  wait_for_https_health "$release_id" \
    || fail_after_switch 'Local HTTPS end-to-end health check failed.'

  atomic_symlink "$active_release" "$APP_ROOT/previous" \
    || fail_after_switch 'Unable to update previous release metadata.'
  atomic_symlink "$release_dir" "$APP_ROOT/current" \
    || fail_after_switch 'Unable to update current release metadata.'
  metadata_committed=true
  trap - ERR

  if ! sudo /usr/bin/systemctl stop "$active_service"; then
    log "WARNING: previous slot $active_slot could not be stopped; new production remains active."
  fi
  if ! sudo /usr/bin/systemctl disable "$active_service"; then
    log "WARNING: previous slot $active_slot could not be disabled; inspect reboot state manually."
  fi

  cleanup_old_releases || log 'WARNING: release retention cleanup failed.'
  cleanup_stale_staging || log 'WARNING: stale staging cleanup failed.'
  cleanup_old_backups || log 'WARNING: database backup retention cleanup failed.'

  log "Deployment successful: $release_id is active on $candidate_slot."
}

validate_release_id
validate_deploy_identity
case "$command_name" in
  prepare) prepare_staging ;;
  activate) activate_release ;;
  *)
    printf 'Usage: %s {prepare|activate} <40-char-git-sha> [maintenance|compatible]\n' "$0" >&2
    exit 2
    ;;
esac

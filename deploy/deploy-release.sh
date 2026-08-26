#!/usr/bin/env bash

set -Eeuo pipefail
umask 027

readonly APP_ROOT="/opt/jufe-offer"
readonly RELEASES_DIR="$APP_ROOT/releases"
readonly INCOMING_DIR="$APP_ROOT/incoming"
readonly SHARED_DIR="$APP_ROOT/shared"
readonly BACKUPS_DIR="$APP_ROOT/backups"
readonly SERVICE_NAME="jufe-offer.service"
readonly LOCAL_HEALTH_URL="http://127.0.0.1:3020/api/health"
readonly PUBLIC_HEALTH_URL="https://jufe.woodfish.site/api/health"

release_id="${1:-}"
archive="${2:-}"

if [[ ! "$release_id" =~ ^[0-9a-f]{40}$ ]]; then
  printf 'Invalid release id.\n' >&2
  exit 2
fi

expected_archive="$INCOMING_DIR/jufe-offer-$release_id.tar.gz"
if [[ "$archive" != "$expected_archive" || ! -f "$archive" ]]; then
  printf 'Release archive is missing or outside the incoming directory.\n' >&2
  exit 2
fi

mkdir -p "$RELEASES_DIR" "$SHARED_DIR/cache" "$SHARED_DIR/pnpm-store" "$BACKUPS_DIR"
exec 9>"$APP_ROOT/.deploy.lock"
flock -n 9 || {
  printf 'Another deployment is already running.\n' >&2
  exit 3
}

release_dir="$RELEASES_DIR/$release_id"
staging_dir="$RELEASES_DIR/.staging-$release_id"
current_target="$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)"
previous_revision="$(basename "${current_target:-unknown}")"
backup_file="$BACKUPS_DIR/prod-before-$release_id.db"

rollback() {
  local reason="${1:-deployment failed}"
  printf 'Deployment failed: %s\n' "$reason" >&2

  sudo /usr/bin/systemctl stop "$SERVICE_NAME" || true

  if [[ -n "$current_target" && -d "$current_target" ]]; then
    ln -sfn "$current_target" "$APP_ROOT/current.next"
    mv -Tf "$APP_ROOT/current.next" "$APP_ROOT/current"
    printf 'APP_REVISION=%s\n' "$previous_revision" >"$APP_ROOT/release.env"
  fi

  if [[ -f "$backup_file" ]]; then
    cp -f "$backup_file" "$APP_ROOT/data/prod.db"
  fi

  sudo /usr/bin/systemctl start "$SERVICE_NAME" || true
  exit 1
}

health_matches() {
  local url="$1"
  local response

  response="$(curl --fail --silent --show-error --max-time 8 "$url" 2>/dev/null)" || return 1
  node -e '
    const payload = JSON.parse(process.argv[1]);
    if (payload.ok !== true || payload.revision !== process.argv[2]) process.exit(1);
  ' "$response" "$release_id"
}

wait_for_health() {
  local url="$1"
  local attempt

  for attempt in {1..20}; do
    if health_matches "$url"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

if [[ "$current_target" == "$release_dir" ]]; then
  if wait_for_health "$LOCAL_HEALTH_URL" && wait_for_health "$PUBLIC_HEALTH_URL"; then
    rm -f "$archive" "$INCOMING_DIR/deploy-release.sh"
    printf 'Release %s is already active and healthy.\n' "$release_id"
    exit 0
  fi

  printf 'Release %s is already active but unhealthy; refusing to replace it in place.\n' "$release_id" >&2
  exit 5
fi

rm -rf --one-file-system "$staging_dir"
mkdir -p "$staging_dir"
tar -xzf "$archive" -C "$staging_dir" --no-same-owner

for required_path in \
  .next/standalone/server.js \
  .next/standalone/.next/static \
  .next/standalone/public \
  package.json \
  prisma/schema.prisma; do
  if [[ ! -e "$staging_dir/$required_path" ]]; then
    rm -rf --one-file-system "$staging_dir"
    printf 'Incomplete release: missing %s.\n' "$required_path" >&2
    exit 4
  fi
done

ln -sfn "$APP_ROOT/.env" "$staging_dir/.env"
rm -rf --one-file-system "$staging_dir/.next/standalone/.next/cache"
ln -s "$SHARED_DIR/cache" "$staging_dir/.next/standalone/.next/cache"

prisma_version="$(
  node -e '
    const pkg = require(process.argv[1]);
    const spec = pkg.devDependencies?.prisma ?? pkg.dependencies?.prisma;
    const version = spec?.match(/\d+\.\d+\.\d+/)?.[0];
    if (!version) process.exit(1);
    process.stdout.write(version);
  ' "$staging_dir/package.json"
)" || {
  rm -rf --one-file-system "$staging_dir"
  printf 'Unable to determine the Prisma CLI version.\n' >&2
  exit 4
}

prisma_tool_dir="$SHARED_DIR/prisma/$prisma_version"
if [[ ! -x "$prisma_tool_dir/node_modules/.bin/prisma" ]]; then
  prisma_tool_staging="$SHARED_DIR/prisma/.staging-$prisma_version"
  rm -rf --one-file-system "$prisma_tool_staging"
  rm -rf --one-file-system "$prisma_tool_dir"
  mkdir -p "$prisma_tool_staging"
  printf '{"private":true}\n' >"$prisma_tool_staging/package.json"
  corepack pnpm \
    --dir "$prisma_tool_staging" \
    add --prod --save-exact "prisma@$prisma_version" \
    --store-dir "$SHARED_DIR/pnpm-store"
  mkdir -p "$SHARED_DIR/prisma"
  mv "$prisma_tool_staging" "$prisma_tool_dir"
fi

rm -rf --one-file-system "$release_dir"
mv "$staging_dir" "$release_dir"

sudo /usr/bin/systemctl stop "$SERVICE_NAME"

if [[ -f "$APP_ROOT/data/prod.db" ]]; then
  sqlite3 "$APP_ROOT/data/prod.db" ".backup '$backup_file'" || rollback "database backup failed"
fi

(
  cd "$release_dir"
  "$prisma_tool_dir/node_modules/.bin/prisma" migrate deploy --schema prisma/schema.prisma
) || rollback "database migration failed"

ln -sfn "$release_dir" "$APP_ROOT/current.next"
mv -Tf "$APP_ROOT/current.next" "$APP_ROOT/current"
printf 'APP_REVISION=%s\n' "$release_id" >"$APP_ROOT/release.env"

sudo /usr/bin/systemctl start "$SERVICE_NAME" || rollback "service did not start"
wait_for_health "$LOCAL_HEALTH_URL" || rollback "local health check failed"
wait_for_health "$PUBLIC_HEALTH_URL" || rollback "public health check failed"

if [[ -n "$current_target" && -d "$current_target" ]]; then
  ln -sfn "$current_target" "$APP_ROOT/previous"
fi

rm -f "$archive" "$INCOMING_DIR/deploy-release.sh"

mapfile -t old_releases < <(
  find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -name '[0-9a-f]*' -printf '%T@ %p\n' \
    | sort -nr \
    | awk 'NR > 5 { print $2 }'
)

for old_release in "${old_releases[@]}"; do
  if [[ "$old_release" =~ ^"$RELEASES_DIR"/[0-9a-f]{40}$ ]] \
    && [[ "$old_release" != "$(readlink -f "$APP_ROOT/current")" ]] \
    && [[ "$old_release" != "$(readlink -f "$APP_ROOT/previous" 2>/dev/null || true)" ]]; then
    rm -rf --one-file-system "$old_release"
  fi
done

find "$BACKUPS_DIR" -maxdepth 1 -type f -name 'prod-before-*.db' -printf '%T@ %p\n' \
  | sort -nr \
  | awk 'NR > 10 { print $2 }' \
  | while IFS= read -r old_backup; do
      [[ "$old_backup" =~ ^"$BACKUPS_DIR"/prod-before-[0-9a-f]{40}\.db$ ]] && rm -f "$old_backup"
    done

printf 'Deployed %s successfully.\n' "$release_id"

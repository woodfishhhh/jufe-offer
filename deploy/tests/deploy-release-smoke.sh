#!/usr/bin/env bash

set -Eeuo pipefail

if [[ ! -f /.dockerenv ]]; then
  printf 'This smoke test intentionally runs only inside a disposable container.\n' >&2
  exit 2
fi

readonly APP_ROOT="/opt/jufe-offer"
readonly ACTIVE_REVISION="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
readonly SUCCESS_REVISION="bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
readonly FAILURE_REVISION="cccccccccccccccccccccccccccccccccccccccc"
readonly MIGRATION_FAILURE_REVISION="dddddddddddddddddddddddddddddddddddddddd"
readonly COMPATIBLE_FAILURE_REVISION="eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
readonly DEPLOY_SCRIPT="/workspace/deploy/deploy-release.sh"
readonly APP_USER="jufe-offer"

if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd --system --user-group --no-create-home "$APP_USER"
fi

install -d \
  "$APP_ROOT/releases" \
  "$APP_ROOT/incoming" \
  "$APP_ROOT/shared/cache" \
  "$APP_ROOT/slots" \
  "$APP_ROOT/backups" \
  "$APP_ROOT/data" \
  /usr/local/sbin
touch "$APP_ROOT/.env"

make_release() {
  local release_root="$1"
  local revision="$2"
  local migration_sql="${3:-CREATE TABLE fixture (id INTEGER PRIMARY KEY);}"

  install -d \
    "$release_root/.next/standalone/.next/static" \
    "$release_root/.next/standalone/public" \
    "$release_root/prisma/migrations/20260825060754_init"
  printf 'console.log("fixture");\n' >"$release_root/.next/standalone/server.js"
  printf '{"devDependencies":{"prisma":"6.19.3"}}\n' >"$release_root/package.json"
  printf 'datasource db { provider = "sqlite" url = env("DATABASE_URL") }\n' \
    >"$release_root/prisma/schema.prisma"
  printf '%s\n' "$migration_sql" \
    >"$release_root/prisma/migrations/20260825060754_init/migration.sql"
  printf 'provider = "sqlite"\n' >"$release_root/prisma/migrations/migration_lock.toml"
  printf '%s\n' "$revision" >"$release_root/REVISION"
  (
    cd "$release_root"
    manifest_file="$(mktemp /tmp/jufe-release-manifest.XXXXXX)"
    find . -type f ! -name release.manifest.sha256 -print0 \
      | LC_ALL=C sort -z \
      | xargs -0 --no-run-if-empty sha256sum \
      >"$manifest_file"
    mv "$manifest_file" release.manifest.sha256
  )
  chown -R "$APP_USER:$APP_USER" "$release_root"
}

install -d /tmp/jufe-stubs
cat >/tmp/jufe-stubs/systemctl <<'STUB'
#!/usr/bin/env bash
printf 'systemctl %s\n' "$*" >>/tmp/deploy-events
STUB
cat >/usr/local/bin/sudo <<'STUB'
#!/usr/bin/env bash
exec "$@"
STUB
cat >/usr/local/bin/curl <<'STUB'
#!/usr/bin/env bash
url="${*: -1}"
case "$url" in
  *"127.0.0.1:3020/api/health")
    [[ "${TEST_FAIL_PORT:-}" == 3020 ]] && exit 22
    revision="$TEST_BLUE_REVISION"
    ;;
  *"127.0.0.1:3021/api/health")
    [[ "${TEST_FAIL_PORT:-}" == 3021 ]] && exit 22
    revision="$TEST_GREEN_REVISION"
    ;;
  *) revision="$TEST_PUBLIC_REVISION" ;;
esac
printf '{"ok":true,"revision":"%s"}\n' "$revision"
STUB
cat >/usr/local/bin/sleep <<'STUB'
#!/usr/bin/env bash
exit 0
STUB
cat >/usr/local/sbin/jufe-offer-switch-upstream <<'STUB'
#!/usr/bin/env bash
printf '%s\n' "$1" > /opt/jufe-offer/shared/active-slot
printf 'switch %s\n' "$1" >>/tmp/deploy-events
STUB
cat >/usr/local/bin/sqlite3 <<'STUB'
#!/usr/bin/env bash
database_path="$1"
case "$*" in
  *".backup '"*)
    backup_command="${*: -1}"
    backup_path="${backup_command#*.backup \'}"
    backup_path="${backup_path%\'}"
    cp "$database_path" "$backup_path"
    ;;
  *"PRAGMA integrity_check;"*) printf 'ok\n' ;;
  *"PRAGMA wal_checkpoint(FULL);"*) printf '0|0|0\n' ;;
  *) exit 1 ;;
esac
STUB
chmod 0755 \
  /tmp/jufe-stubs/systemctl \
  /usr/local/bin/sudo \
  /usr/local/bin/curl \
  /usr/local/bin/sqlite3 \
  /usr/local/bin/sleep \
  /usr/local/sbin/jufe-offer-switch-upstream
install -m 0755 /tmp/jufe-stubs/systemctl /usr/bin/systemctl
chmod 0666 /tmp/deploy-events
chown -R "$APP_USER:$APP_USER" "$APP_ROOT"

run_deploy() {
  runuser -u "$APP_USER" -- bash "$DEPLOY_SCRIPT" "$@"
}

make_release "$APP_ROOT/releases/$ACTIVE_REVISION" "$ACTIVE_REVISION"
make_release "$APP_ROOT/releases/.staging-$SUCCESS_REVISION" "$SUCCESS_REVISION"
ln -s "$APP_ROOT/releases/$ACTIVE_REVISION" "$APP_ROOT/current"
ln -s "$APP_ROOT/releases/$ACTIVE_REVISION" "$APP_ROOT/slots/blue"
printf 'blue\n' >"$APP_ROOT/shared/active-slot"

export TEST_BLUE_REVISION="$ACTIVE_REVISION"
export TEST_GREEN_REVISION="$SUCCESS_REVISION"
export TEST_PUBLIC_REVISION="$SUCCESS_REVISION"
export TEST_FAIL_PORT=""
: >/tmp/deploy-events
run_deploy activate "$SUCCESS_REVISION" maintenance

[[ "$(readlink -f "$APP_ROOT/current")" == "$APP_ROOT/releases/$SUCCESS_REVISION" ]]
[[ "$(readlink -f "$APP_ROOT/previous")" == "$APP_ROOT/releases/$ACTIVE_REVISION" ]]
[[ "$(tr -d '\r\n' <"$APP_ROOT/shared/active-slot")" == green ]]
[[ -z "$(find "$APP_ROOT/backups" -maxdepth 1 -type f -print -quit)" ]]

switch_line="$(grep -n '^switch green$' /tmp/deploy-events | cut -d: -f1)"
old_stop_line="$(grep -n '^systemctl stop jufe-offer@blue.service$' /tmp/deploy-events | tail -1 | cut -d: -f1)"
[[ -n "$switch_line" && -n "$old_stop_line" && "$switch_line" -lt "$old_stop_line" ]]

make_release "$APP_ROOT/releases/.staging-$FAILURE_REVISION" "$FAILURE_REVISION"
export TEST_BLUE_REVISION="$FAILURE_REVISION"
export TEST_GREEN_REVISION="$SUCCESS_REVISION"
export TEST_PUBLIC_REVISION="$SUCCESS_REVISION"
export TEST_FAIL_PORT=3020
: >/tmp/deploy-events
if run_deploy activate "$FAILURE_REVISION" maintenance; then
  printf 'Expected the unhealthy candidate deployment to fail.\n' >&2
  exit 1
fi

[[ "$(readlink -f "$APP_ROOT/current")" == "$APP_ROOT/releases/$SUCCESS_REVISION" ]]
[[ "$(tr -d '\r\n' <"$APP_ROOT/shared/active-slot")" == green ]]
if grep -q '^switch blue$' /tmp/deploy-events; then
  printf 'Traffic switched even though candidate local health failed.\n' >&2
  exit 1
fi

make_release \
  "$APP_ROOT/releases/.staging-$MIGRATION_FAILURE_REVISION" \
  "$MIGRATION_FAILURE_REVISION" \
  'CREATE TABLE fixture_v2 (id INTEGER PRIMARY KEY);'
install -d "$APP_ROOT/shared/prisma/6.19.3/node_modules/.bin"
cat >"$APP_ROOT/shared/prisma/6.19.3/node_modules/.bin/prisma" <<'STUB'
#!/usr/bin/env bash
case "$*" in
  *"validate"*) exit 0 ;;
  *"migrate deploy"*)
    printf 'migrated-database\n' >/opt/jufe-offer/data/prod.db
    printf 'prisma migrate deploy\n' >>/tmp/deploy-events
    ;;
  *) exit 1 ;;
esac
STUB
chmod 0755 "$APP_ROOT/shared/prisma/6.19.3/node_modules/.bin/prisma"
printf 'original-database\n' >"$APP_ROOT/data/prod.db"
export TEST_BLUE_REVISION="$MIGRATION_FAILURE_REVISION"
export TEST_GREEN_REVISION="$SUCCESS_REVISION"
export TEST_PUBLIC_REVISION="$SUCCESS_REVISION"
export TEST_FAIL_PORT=3020
: >/tmp/deploy-events
if run_deploy activate "$MIGRATION_FAILURE_REVISION" maintenance; then
  printf 'Expected the unhealthy migrated candidate deployment to fail.\n' >&2
  exit 1
fi

[[ "$(cat "$APP_ROOT/data/prod.db")" == original-database ]]
[[ "$(readlink -f "$APP_ROOT/current")" == "$APP_ROOT/releases/$SUCCESS_REVISION" ]]
[[ "$(tr -d '\r\n' <"$APP_ROOT/shared/active-slot")" == green ]]
grep -q '^prisma migrate deploy$' /tmp/deploy-events
grep -q '^systemctl start jufe-offer@green.service$' /tmp/deploy-events
if grep -q '^switch blue$' /tmp/deploy-events; then
  printf 'Traffic switched even though the migrated candidate failed local health.\n' >&2
  exit 1
fi

make_release \
  "$APP_ROOT/releases/.staging-$COMPATIBLE_FAILURE_REVISION" \
  "$COMPATIBLE_FAILURE_REVISION" \
  'CREATE TABLE fixture_v3 (id INTEGER PRIMARY KEY);'
printf 'compatible-original\n' >"$APP_ROOT/data/prod.db"
export TEST_BLUE_REVISION="$COMPATIBLE_FAILURE_REVISION"
export TEST_GREEN_REVISION="$SUCCESS_REVISION"
export TEST_PUBLIC_REVISION="$SUCCESS_REVISION"
export TEST_FAIL_PORT=3020
: >/tmp/deploy-events
if run_deploy activate "$COMPATIBLE_FAILURE_REVISION" compatible; then
  printf 'Expected the unhealthy compatible-migration candidate to fail.\n' >&2
  exit 1
fi

[[ "$(cat "$APP_ROOT/data/prod.db")" == migrated-database ]]
[[ "$(readlink -f "$APP_ROOT/current")" == "$APP_ROOT/releases/$SUCCESS_REVISION" ]]
[[ "$(tr -d '\r\n' <"$APP_ROOT/shared/active-slot")" == green ]]
grep -q '^prisma migrate deploy$' /tmp/deploy-events
if grep -q '^systemctl stop jufe-offer@green.service$' /tmp/deploy-events; then
  printf 'Compatible migration stopped the active production slot.\n' >&2
  exit 1
fi
if grep -q '^switch blue$' /tmp/deploy-events; then
  printf 'Traffic switched even though the compatible candidate failed local health.\n' >&2
  exit 1
fi

printf 'deploy-release smoke test passed\n'

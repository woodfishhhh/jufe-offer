#!/usr/bin/env bash

set -Eeuo pipefail
umask 027

readonly APP_ROOT="/opt/jufe-offer"
readonly APP_USER="jufe-offer"
readonly LEGACY_SERVICE="jufe-offer.service"
readonly BLUE_SERVICE="jufe-offer@blue.service"
readonly TEMPLATE_PATH="/etc/systemd/system/jufe-offer@.service"
readonly SWITCH_HELPER_PATH="/usr/local/sbin/jufe-offer-switch-upstream"
readonly NGINX_SITE_PATH="/opt/blog-stack/nginx/conf.d/jufe.woodfish.site.conf"
readonly NGINX_INCLUDE_PATH="/opt/blog-stack/nginx/conf.d/jufe-offer-upstream.inc"
readonly NGINX_CONTAINER="blog-nginx"

revision="${1:-}"
asset_dir="${2:-/tmp/jufe-offer-blue-green}"
template_source="$asset_dir/jufe-offer@.service"
helper_source="$asset_dir/jufe-offer-switch-upstream"
site_source="$asset_dir/jufe.woodfish.site.conf"
include_source="$asset_dir/jufe-offer-upstream.inc"

if [[ "$(id -u)" -ne 0 ]]; then
  printf 'Run this bootstrap script as root.\n' >&2
  exit 2
fi

if [[ ! "$revision" =~ ^[0-9a-f]{40}$ ]]; then
  printf 'A 40-character current production revision is required.\n' >&2
  exit 2
fi

if [[ ! "$asset_dir" =~ ^/tmp/jufe-offer-blue-green(/[A-Za-z0-9._@-]+)*$ ]]; then
  printf 'Asset directory must stay below /tmp/jufe-offer-blue-green.\n' >&2
  exit 2
fi

for required_source in \
  "$template_source" \
  "$helper_source" \
  "$site_source" \
  "$include_source"; do
  if [[ ! -f "$required_source" ]]; then
    printf 'Bootstrap asset is missing: %s\n' "$required_source" >&2
    exit 2
  fi
done

if ! id "$APP_USER" >/dev/null 2>&1; then
  printf 'Create the %s deploy user and its SSH key first.\n' "$APP_USER" >&2
  exit 2
fi

for required_command in node pnpm sqlite3 rsync docker curl flock systemctl visudo; do
  if ! command -v "$required_command" >/dev/null 2>&1; then
    printf 'Required server command is missing: %s\n' "$required_command" >&2
    exit 2
  fi
done
if [[ ! -x /usr/bin/node ]]; then
  printf 'The systemd template requires Node.js at /usr/bin/node.\n' >&2
  exit 2
fi
if [[ ! -x /usr/bin/pnpm ]]; then
  printf 'Prisma tool caching requires pnpm at /usr/bin/pnpm.\n' >&2
  exit 2
fi

if ! docker inspect "$NGINX_CONTAINER" >/dev/null 2>&1; then
  printf 'Expected Nginx container %s is unavailable.\n' "$NGINX_CONTAINER" >&2
  exit 2
fi

current_release="$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)"
if [[ "$current_release" != "$APP_ROOT/releases/$revision" ]] \
  || [[ ! -f "$current_release/.next/standalone/server.js" ]]; then
  printf 'Current release does not match the supplied revision: %s\n' "$current_release" >&2
  exit 3
fi

current_cache="$(readlink -f "$current_release/.next/standalone/.next/cache" 2>/dev/null || true)"
if [[ "$current_cache" != "$APP_ROOT/shared/cache" ]]; then
  printf 'Current release cache must already point to %s before bootstrap.\n' \
    "$APP_ROOT/shared/cache" >&2
  exit 3
fi

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
legacy_unit_path="/etc/systemd/system/$LEGACY_SERVICE"
legacy_unit_backup="${legacy_unit_path}.pre-blue-green-${timestamp}"
site_backup="${NGINX_SITE_PATH}.pre-blue-green-${timestamp}"
include_backup="${NGINX_INCLUDE_PATH}.pre-blue-green-${timestamp}"
had_include=false

install -d -m 0755 -o "$APP_USER" -g "$APP_USER" \
  "$APP_ROOT/releases" \
  "$APP_ROOT/incoming" \
  "$APP_ROOT/shared" \
  "$APP_ROOT/shared/cache" \
  "$APP_ROOT/shared/pnpm-store" \
  "$APP_ROOT/shared/prisma" \
  "$APP_ROOT/slots" \
  "$APP_ROOT/backups"

cp -a "$legacy_unit_path" "$legacy_unit_backup"
cp -a "$NGINX_SITE_PATH" "$site_backup"
if [[ -f "$NGINX_INCLUDE_PATH" ]]; then
  cp -a "$NGINX_INCLUDE_PATH" "$include_backup"
  had_include=true
fi

restore_legacy() {
  trap - ERR
  set +e
  printf 'Bootstrap failed; restoring the legacy service and Nginx files.\n' >&2

  systemctl disable --now "$BLUE_SERVICE" >/dev/null 2>&1 || true
  cp -a "$legacy_unit_backup" "$legacy_unit_path"
  cp -a "$site_backup" "$NGINX_SITE_PATH"
  if [[ "$had_include" == true ]]; then
    cp -a "$include_backup" "$NGINX_INCLUDE_PATH"
  else
    rm -f -- "$NGINX_INCLUDE_PATH"
  fi
  systemctl daemon-reload
  systemctl enable "$LEGACY_SERVICE" >/dev/null 2>&1 || true
  systemctl start "$LEGACY_SERVICE" || true
  docker exec "$NGINX_CONTAINER" nginx -t >/dev/null 2>&1 \
    && docker kill --signal HUP "$NGINX_CONTAINER" >/dev/null 2>&1 || true
  exit 1
}
trap restore_legacy ERR

install -m 0644 "$template_source" "$TEMPLATE_PATH"
install -m 0755 "$helper_source" "$SWITCH_HELPER_PATH"
install -m 0644 "$site_source" "$NGINX_SITE_PATH"
install -m 0644 "$include_source" "$NGINX_INCLUDE_PATH"

ln -sfn "$current_release" "$APP_ROOT/slots/blue.next"
mv -Tf "$APP_ROOT/slots/blue.next" "$APP_ROOT/slots/blue"
cat >"$APP_ROOT/shared/blue.env" <<EOF
PORT=3020
HOSTNAME=0.0.0.0
APP_REVISION=$revision
RELEASE_DIR=$current_release
EOF
chown "$APP_USER:$APP_USER" "$APP_ROOT/shared/blue.env"
chmod 0640 "$APP_ROOT/shared/blue.env"

cat >"/etc/sudoers.d/jufe-offer-deploy" <<'SUDOERS'
Cmnd_Alias JUFE_SLOT_SYSTEMD = /usr/bin/systemctl start jufe-offer@blue.service, /usr/bin/systemctl stop jufe-offer@blue.service, /usr/bin/systemctl enable jufe-offer@blue.service, /usr/bin/systemctl disable jufe-offer@blue.service, /usr/bin/systemctl start jufe-offer@green.service, /usr/bin/systemctl stop jufe-offer@green.service, /usr/bin/systemctl enable jufe-offer@green.service, /usr/bin/systemctl disable jufe-offer@green.service
Cmnd_Alias JUFE_NGINX_SWITCH = /usr/local/sbin/jufe-offer-switch-upstream blue, /usr/local/sbin/jufe-offer-switch-upstream green
jufe-offer ALL=(root) NOPASSWD: JUFE_SLOT_SYSTEMD, JUFE_NGINX_SWITCH
SUDOERS
chmod 0440 "/etc/sudoers.d/jufe-offer-deploy"
visudo -cf "/etc/sudoers.d/jufe-offer-deploy"

docker exec "$NGINX_CONTAINER" nginx -t
docker kill --signal HUP "$NGINX_CONTAINER" >/dev/null
systemctl daemon-reload
systemctl enable "$BLUE_SERVICE"

systemctl stop "$LEGACY_SERVICE"
systemctl start "$BLUE_SERVICE"

for attempt in {1..30}; do
  if curl --fail --silent --show-error --max-time 8 http://127.0.0.1:3020/ >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" -eq 30 ]]; then
    printf 'Blue-slot bootstrap health check timed out.\n' >&2
    false
  fi
  sleep 1
done

"$SWITCH_HELPER_PATH" blue
systemctl disable "$LEGACY_SERVICE"

trap - ERR
printf 'Blue-green bootstrap completed at %s. The legacy unit backup is %s.\n' \
  "$revision" "$legacy_unit_backup"

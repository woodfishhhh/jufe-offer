#!/usr/bin/env bash

set -Eeuo pipefail
umask 027

readonly APP_ROOT="/opt/jufe-offer"
readonly APP_USER="jufe-offer"
readonly SERVICE_NAME="jufe-offer.service"
readonly UNIT_PATH="/etc/systemd/system/$SERVICE_NAME"
readonly UNIT_SOURCE="${2:-/tmp/jufe-offer.service}"

revision="${1:-}"

if [[ "$(id -u)" -ne 0 ]]; then
  printf 'Run this bootstrap script as root.\n' >&2
  exit 2
fi

if [[ ! "$revision" =~ ^[0-9a-f]{40}$ ]]; then
  printf 'A 40-character bootstrap revision is required.\n' >&2
  exit 2
fi

if ! id "$APP_USER" >/dev/null 2>&1; then
  printf 'Create the %s deploy user and its SSH key first.\n' "$APP_USER" >&2
  exit 2
fi

if [[ ! -f "$UNIT_SOURCE" ]]; then
  printf 'Systemd unit source not found: %s\n' "$UNIT_SOURCE" >&2
  exit 2
fi

install -d -m 0755 -o "$APP_USER" -g "$APP_USER" \
  "$APP_ROOT/releases" \
  "$APP_ROOT/incoming" \
  "$APP_ROOT/shared" \
  "$APP_ROOT/shared/cache" \
  "$APP_ROOT/shared/pnpm-store" \
  "$APP_ROOT/backups"

bootstrap_release="$APP_ROOT/releases/$revision"
if [[ ! -e "$APP_ROOT/current" ]]; then
  if [[ -e "$bootstrap_release" ]]; then
    printf 'Bootstrap release already exists without a current link.\n' >&2
    exit 3
  fi

  install -d -m 0755 -o "$APP_USER" -g "$APP_USER" "$bootstrap_release"
  tar \
    --exclude='./.env' \
    --exclude='./.next/cache' \
    --exclude='./backups' \
    --exclude='./current' \
    --exclude='./data' \
    --exclude='./incoming' \
    --exclude='./previous' \
    --exclude='./release.env' \
    --exclude='./releases' \
    --exclude='./shared' \
    -C "$APP_ROOT" -cpf - . \
    | tar -C "$bootstrap_release" -xpf -

  chown -R "$APP_USER:$APP_USER" "$bootstrap_release"
  ln -sfn "$bootstrap_release" "$APP_ROOT/current.next"
  mv -Tf "$APP_ROOT/current.next" "$APP_ROOT/current"
fi

install -d -m 0755 -o "$APP_USER" -g "$APP_USER" "$bootstrap_release/.next/standalone/.next"
if [[ ! -e "$bootstrap_release/.next/standalone/public" ]]; then
  cp -a "$bootstrap_release/public" "$bootstrap_release/.next/standalone/public"
fi
if [[ ! -e "$bootstrap_release/.next/standalone/.next/static" ]]; then
  cp -a "$bootstrap_release/.next/static" "$bootstrap_release/.next/standalone/.next/static"
fi
if [[ ! -e "$bootstrap_release/.next/standalone/.next/cache" ]]; then
  ln -s "$APP_ROOT/shared/cache" "$bootstrap_release/.next/standalone/.next/cache"
fi
chown -R "$APP_USER:$APP_USER" "$bootstrap_release"
chmod 0755 "$bootstrap_release"

printf 'APP_REVISION=%s\n' "$revision" >"$APP_ROOT/release.env"
chown "$APP_USER:$APP_USER" "$APP_ROOT/release.env"
chmod 0640 "$APP_ROOT/release.env"

chown "$APP_USER:$APP_USER" "$APP_ROOT" "$APP_ROOT/.env" "$APP_ROOT/data" "$APP_ROOT/data/prod.db"
chmod 0755 "$APP_ROOT" "$APP_ROOT/data"
chmod 0600 "$APP_ROOT/.env"
chmod 0640 "$APP_ROOT/data/prod.db"

cat >"/etc/sudoers.d/jufe-offer-deploy" <<'SUDOERS'
jufe-offer ALL=(root) NOPASSWD: /usr/bin/systemctl start jufe-offer.service, /usr/bin/systemctl stop jufe-offer.service, /usr/bin/systemctl restart jufe-offer.service
SUDOERS
chmod 0440 "/etc/sudoers.d/jufe-offer-deploy"
visudo -cf "/etc/sudoers.d/jufe-offer-deploy"

unit_backup="${UNIT_PATH}.pre-cicd"
cp -a "$UNIT_PATH" "$unit_backup"

restore_unit() {
  cp -a "$unit_backup" "$UNIT_PATH"
  systemctl daemon-reload
  systemctl restart "$SERVICE_NAME" || true
}
trap restore_unit ERR

install -m 0644 "$UNIT_SOURCE" "$UNIT_PATH"
systemctl daemon-reload
systemctl restart "$SERVICE_NAME"
for attempt in {1..20}; do
  if curl --fail --silent --show-error --max-time 8 http://127.0.0.1:3020/ >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" -eq 20 ]]; then
    printf 'Bootstrap health check timed out.\n' >&2
    exit 1
  fi
  sleep 1
done

trap - ERR
printf 'Server bootstrap completed at %s.\n' "$revision"

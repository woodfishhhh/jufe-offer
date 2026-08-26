#!/usr/bin/env bash

set -Eeuo pipefail

unit_source="${1:-}"
if [[ ! -f "$unit_source" ]]; then
  printf 'Usage: %s /absolute/path/to/jufe-offer@.service\n' "$0" >&2
  exit 2
fi

test_root="$(mktemp -d /tmp/jufe-systemd-XXXXXX)"
cleanup() {
  case "$test_root" in
    /tmp/jufe-systemd-*) rm -rf -- "$test_root" ;;
    *) printf 'Refusing unsafe temporary cleanup: %s\n' "$test_root" >&2 ;;
  esac
}
trap cleanup EXIT

install -d \
  "$test_root/etc/systemd/system" \
  "$test_root/usr/bin" \
  "$test_root/opt/jufe-offer/slots/blue/.next/standalone" \
  "$test_root/opt/jufe-offer/shared"
install -m 0644 "$unit_source" "$test_root/etc/systemd/system/jufe-offer@.service"
install -m 0755 /dev/null "$test_root/usr/bin/node"
touch "$test_root/opt/jufe-offer/.env" "$test_root/opt/jufe-offer/shared/blue.env"
for target in sysinit.target network.target multi-user.target; do
  printf '[Unit]\nDescription=Fixture %s\n' "$target" \
    >"$test_root/etc/systemd/system/$target"
done

systemd-analyze verify --root="$test_root" jufe-offer@blue.service
printf 'systemd template smoke test passed\n'

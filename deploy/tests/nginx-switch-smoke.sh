#!/usr/bin/env bash

set -Eeuo pipefail

if [[ ! -f /.dockerenv ]]; then
  printf 'This smoke test intentionally runs only inside a disposable container.\n' >&2
  exit 2
fi

readonly HELPER="/workspace/deploy/jufe-offer-switch-upstream"
readonly INCLUDE="/opt/blog-stack/nginx/conf.d/jufe-offer-upstream.inc"
readonly ACTIVE_SLOT="/opt/jufe-offer/shared/active-slot"

if ! id jufe-offer >/dev/null 2>&1; then
  useradd --system --no-create-home jufe-offer
fi
install -d /opt/blog-stack/nginx/conf.d /opt/jufe-offer/shared /usr/local/bin

cat >/usr/local/bin/docker <<'STUB'
#!/usr/bin/env bash
printf 'docker %s\n' "$*" >>/tmp/nginx-helper-events
case "$1" in
  inspect) exit 0 ;;
  exec)
    [[ "${FAKE_NGINX_TEST_FAIL:-false}" == true ]] && exit 1
    exit 0
    ;;
  kill) exit 0 ;;
  *) exit 1 ;;
esac
STUB
chmod 0755 /usr/local/bin/docker

printf 'proxy_pass http://172.18.0.1:3020;\n' >"$INCLUDE"
printf 'blue\n' >"$ACTIVE_SLOT"
: >/tmp/nginx-helper-events
export FAKE_NGINX_TEST_FAIL=false
bash "$HELPER" green

[[ "$(cat "$INCLUDE")" == 'proxy_pass http://172.18.0.1:3021;' ]]
[[ "$(tr -d '\r\n' <"$ACTIVE_SLOT")" == green ]]
grep -q '^docker exec blog-nginx nginx -t$' /tmp/nginx-helper-events
grep -q '^docker kill --signal HUP blog-nginx$' /tmp/nginx-helper-events

export FAKE_NGINX_TEST_FAIL=true
if bash "$HELPER" blue; then
  printf 'Expected an invalid Nginx candidate configuration to fail.\n' >&2
  exit 1
fi

[[ "$(cat "$INCLUDE")" == 'proxy_pass http://172.18.0.1:3021;' ]]
[[ "$(tr -d '\r\n' <"$ACTIVE_SLOT")" == green ]]
printf 'nginx switch helper smoke test passed\n'

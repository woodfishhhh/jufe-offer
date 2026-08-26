#!/usr/bin/env bash

set -Eeuo pipefail

test_root="$(mktemp -d /tmp/jufe-rsync-XXXXXX)"
cleanup() {
  case "$test_root" in
    /tmp/jufe-rsync-*) rm -rf -- "$test_root" ;;
    *) printf 'Refusing unsafe temporary cleanup: %s\n' "$test_root" >&2 ;;
  esac
}
trap cleanup EXIT

install -d "$test_root/release-a" "$test_root/source" "$test_root/staging"
printf 'unchanged\n' >"$test_root/release-a/same.txt"
printf 'old\n' >"$test_root/release-a/changed.txt"
printf 'unchanged\n' >"$test_root/source/same.txt"
printf 'new\n' >"$test_root/source/changed.txt"
ln -s "$test_root/release-a" "$test_root/current"

rsync \
  --archive \
  --compress \
  --checksum \
  --delete-delay \
  --partial \
  --partial-dir=.rsync-partial \
  --safe-links \
  --link-dest="$test_root/current" \
  "$test_root/source/" "$test_root/staging/"

[[ "$(stat -c '%i' "$test_root/release-a/same.txt")" \
  == "$(stat -c '%i' "$test_root/staging/same.txt")" ]]
[[ "$(stat -c '%i' "$test_root/release-a/changed.txt")" \
  != "$(stat -c '%i' "$test_root/staging/changed.txt")" ]]
[[ "$(cat "$test_root/release-a/changed.txt")" == old ]]
[[ "$(cat "$test_root/staging/changed.txt")" == new ]]

printf 'rsync link-dest smoke test passed\n'

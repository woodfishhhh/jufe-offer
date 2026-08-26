#!/usr/bin/env bash

set -Eeuo pipefail
umask 022

readonly RELEASE_ID="${1:-}"
readonly OUTPUT_ROOT="dist/release"
readonly ARCHIVE_PATH="dist/jufe-offer-${RELEASE_ID}.tar.gz"

if [[ ! "$RELEASE_ID" =~ ^[0-9a-f]{40}$ ]]; then
  printf 'A 40-character lowercase Git SHA is required.\n' >&2
  exit 2
fi

if [[ ! -f package.json || ! -d .next/standalone || ! -d prisma ]]; then
  printf 'Run this script from a built repository root.\n' >&2
  exit 2
fi

rm -rf -- "$OUTPUT_ROOT"
mkdir -p "$OUTPUT_ROOT/.next"
cp -a .next/standalone "$OUTPUT_ROOT/.next/standalone"
rm -rf -- "$OUTPUT_ROOT/.next/standalone/public"
cp -a public "$OUTPUT_ROOT/.next/standalone/public"
mkdir -p "$OUTPUT_ROOT/.next/standalone/.next"
rm -rf -- "$OUTPUT_ROOT/.next/standalone/.next/static"
cp -a .next/static "$OUTPUT_ROOT/.next/standalone/.next/static"
rm -rf -- "$OUTPUT_ROOT/.next/standalone/.next/cache"
cp -a prisma "$OUTPUT_ROOT/prisma"
find "$OUTPUT_ROOT/prisma" -type f \
  \( -name '*.db' -o -name '*.db-journal' -o -name '*.db-wal' -o -name '*.db-shm' \) \
  -delete
cp package.json "$OUTPUT_ROOT/package.json"
printf '%s\n' "$RELEASE_ID" >"$OUTPUT_ROOT/REVISION"

unexpected_env="$(find "$OUTPUT_ROOT" -name '.env*' -print -quit)"
if [[ -n "$unexpected_env" ]]; then
  printf 'Release payload contains a forbidden environment file: %s\n' "$unexpected_env" >&2
  exit 1
fi

while IFS= read -r -d '' link_path; do
  resolved_path="$(readlink -f "$link_path" 2>/dev/null || true)"
  case "$resolved_path" in
    "$PWD/$OUTPUT_ROOT"/*) ;;
    *)
      printf 'Release contains an external or broken symlink: %s -> %s\n' \
        "$link_path" "$resolved_path" >&2
      exit 1
      ;;
  esac
done < <(find "$OUTPUT_ROOT" -type l -print0)

manifest_file="$(mktemp "${RUNNER_TEMP:-/tmp}/jufe-release-manifest.XXXXXX")"
cleanup() {
  rm -f -- "$manifest_file"
}
trap cleanup EXIT

(
  cd "$OUTPUT_ROOT"
  find . -type f ! -name release.manifest.sha256 -print0 \
    | LC_ALL=C sort -z \
    | xargs -0 --no-run-if-empty sha256sum \
    >"$manifest_file"
  mv "$manifest_file" release.manifest.sha256
  sha256sum --strict --check --quiet release.manifest.sha256
)

tar -czf "$ARCHIVE_PATH" -C "$OUTPUT_ROOT" .
printf 'Release %s assembled at %s.\n' "$RELEASE_ID" "$OUTPUT_ROOT"

#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
TEST_DIR=$(mktemp -d)
trap 'rm -rf "$TEST_DIR"' EXIT
mkdir -p "$TEST_DIR/bin" "$TEST_DIR/deploy"
export DEPLOY_DIR="$TEST_DIR/deploy" TEST_LOG="$TEST_DIR/docker.log"
export PATH="$TEST_DIR/bin:$PATH"
cat > "$TEST_DIR/bin/docker" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
echo "$*" >> "$TEST_LOG"
case "$*" in
  'compose -f compose.yaml -f compose.prod.yaml config --images')
    if [ "${MOCK_FAIL_CONFIG:-0}" = 1 ]; then exit 1; fi
    for service in api web worker migrate; do echo "ghcr.io/example/mori-$service:current"; done
    ;;
  'image ls '*)
    repo="${4#reference=}"
    repo="${repo%:\*}"
    printf '%s:current\n%s:old\n' "$repo" "$repo"
    ;;
  'image rm '*)
    [[ "$3" != *:current ]] || exit 99
    if [ "${MOCK_FAIL_REMOVE:-0}" = 1 ]; then exit 1; fi
    ;;
  'system df') ;;
  *) echo "Unexpected Docker command: $*" >&2; exit 1 ;;
esac
MOCK
chmod +x "$TEST_DIR/bin/docker"
bash "$SCRIPT_DIR/clean-vps.sh" >/dev/null
[ "$(grep -c '^image rm ' "$TEST_LOG")" -eq 4 ]
! grep -q '^image rm .*:current$' "$TEST_LOG"
! grep -Eq 'volume|network|container prune|image prune' "$TEST_LOG"
: > "$TEST_LOG"
if MOCK_FAIL_CONFIG=1 bash "$SCRIPT_DIR/clean-vps.sh" >/dev/null 2>&1; then
  echo 'Cleanup should fail when Compose configuration fails' >&2; exit 1
fi
! grep -q '^image rm ' "$TEST_LOG"
if MOCK_FAIL_REMOVE=1 bash "$SCRIPT_DIR/clean-vps.sh" >/dev/null 2>&1; then
  echo 'Cleanup should report image removal failures' >&2; exit 1
fi
echo 'Cleanup safety checks passed'

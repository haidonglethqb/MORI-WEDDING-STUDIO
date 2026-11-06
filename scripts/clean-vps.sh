#!/usr/bin/env bash
set -euo pipefail

# Only remove stale tags from the four MORI application repositories. Compose's
# configured references include the one-shot migration image, which has no
# running container to protect it from a general image prune.
cd "${DEPLOY_DIR:-/opt/mori}"
image_list=$(docker compose -f compose.yaml -f compose.prod.yaml config --images)
if [ -z "$image_list" ]; then
  echo 'Could not determine current Compose images; refusing cleanup.' >&2
  exit 1
fi
mapfile -t configured <<< "$image_list"

repos=()
for ref in "${configured[@]}"; do
  repo="${ref%:*}"
  case "$repo" in
    */mori-api|*/mori-web|*/mori-worker|*/mori-migrate) repos+=("$repo") ;;
  esac
done
if [ "${#repos[@]}" -ne 4 ]; then
  echo 'Expected four MORI image repositories in Compose; refusing cleanup.' >&2
  exit 1
fi

echo '=== Removing obsolete MORI image tags ==='
failed=0
for repo in "${repos[@]}"; do
  tags=$(docker image ls --filter "reference=$repo:*" --format '{{.Repository}}:{{.Tag}}')
  while IFS= read -r ref; do
    [ -n "$ref" ] || continue
    keep=0
    for current in "${configured[@]}"; do
      if [ "$ref" = "$current" ]; then keep=1; break; fi
    done
    if [ "$keep" -eq 0 ]; then
      echo "Removing $ref if unused"
      # No --force: Docker protects images referenced by running or stopped containers.
      if ! docker image rm "$ref"; then
        echo "Could not remove $ref; it may still be in use." >&2
        failed=1
      fi
    fi
  done <<< "$tags"
done

echo '=== Disk usage after cleanup ==='
df -h /
docker system df
exit "$failed"

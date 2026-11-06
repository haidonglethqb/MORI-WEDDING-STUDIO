#!/usr/bin/env bash
set -euo pipefail

# MORI Wedding Studio - Server Maintenance & Garbage Cleaner
echo "=== [1/4] Pruning Stopped Containers ==="
docker container prune -f

echo "=== [2/4] Pruning Unused Images & Layers ==="
docker image prune -af --filter "until=2h"

echo "=== [3/4] Pruning Build Cache & Networks ==="
docker builder prune -af 2>/dev/null || true
docker network prune -f

echo "=== [4/4] Vacuuming Logs & Apt Cache ==="
journalctl --vacuum-time=3d 2>/dev/null || true
apt-get clean 2>/dev/null || true

echo "=== System Disk Space Summary ==="
df -h /
docker system df

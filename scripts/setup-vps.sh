#!/usr/bin/env bash
set -euo pipefail

# MORI Wedding Studio - VPS Setup Script for Ubuntu 22.04 LTS
echo "=== [1/5] Checking System Requirements ==="
if [ "$(id -u)" -ne 0 ]; then
  echo "Error: This script must be run as root." >&2
  exit 1
fi

echo "Memory & Swap status:"
free -h

# 1. Setup Swap if missing (crucial for 2GB RAM instances)
echo "=== [2/5] Configuring Swap (4GB) ==="
if [ "$(swapon --show | wc -l)" -le 1 ]; then
  echo "No active swap found. Creating 4GB swapfile..."
  fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  sysctl vm.swappiness=20
  echo 'vm.swappiness=20' > /etc/sysctl.d/99-swappiness.conf
  echo "Swap created successfully:"
  free -h
else
  echo "Swap already configured."
fi

# 2. Install Docker & Docker Compose Plugin
echo "=== [3/5] Installing Docker Engine & Compose ==="
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release

install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker

# 3. Create Deployment Directory
echo "=== [4/5] Preparing /opt/mori Directory ==="
mkdir -p /opt/mori
mkdir -p /opt/mori/media
chmod 755 /opt/mori

# 4. Firewall adjustments (Ensure port 24700 is explicitly open)
echo "=== [5/5] Checking Firewall ==="
if command -v ufw >/dev/null 2>&1; then
  ufw allow 24700/tcp comment 'SSH custom port' || true
  ufw allow 80/tcp comment 'HTTP Web' || true
  ufw allow 443/tcp comment 'HTTPS Web' || true
  ufw allow 3000/tcp comment 'Direct Web' || true
fi

echo "=== VPS Setup Complete ==="
docker --version
docker compose version
free -h

#!/usr/bin/env bash
set -euo pipefail

# MORI Wedding Studio - Automated Production Deployment Script
DEPLOY_DIR="/opt/mori"
echo "=== [1/6] Preparing Deployment Directory ==="
mkdir -p "$DEPLOY_DIR/media"
cd "$DEPLOY_DIR"

# 1. Ensure .env exists; if already present, preserve existing credentials
echo "=== [2/6] Verifying Environment Configuration ==="
if [ ! -f .env ]; then
  echo "No existing .env found. Generating initial configuration..."
  RAND_PASS=$(openssl rand -hex 16)
  cat <<EOF > .env
APP_ENV=production
NODE_ENV=production
POSTGRES_USER=mori
POSTGRES_DB=mori_db
POSTGRES_PASSWORD=${RAND_PASS}
IMAGE_REGISTRY=ghcr.io
IMAGE_REPO=${REPO_OWNER:-haidonglethqb}
IMAGE_TAG=${IMAGE_TAG:-latest}
PUBLIC_APP_ORIGIN=http://${SERVER_HOST:-43.240.117.146}
PUBLIC_INVITE_ORIGIN=http://${SERVER_HOST:-43.240.117.146}
API_INTERNAL_ORIGIN=http://api:4000
PORT=4000
EOF
  chmod 600 .env
  echo "Created fresh .env with generated PostgreSQL credentials."
else
  echo ".env file already exists. Preserving existing database and secrets."
fi

# Synchronize AI and Origin Secrets if provided
sync_env_var() {
  local key="$1"
  local val="${!key:-}"
  if [ -n "$val" ]; then
    if grep -q "^${key}=" .env; then
      sed -i "s|^${key}=.*|${key}=${val}|" .env
    else
      echo "${key}=${val}" >> .env
    fi
  fi
}

sync_env_var "CODEX_API_KEY"
sync_env_var "CODEX_BASE_URL"
sync_env_var "GROQ_API_KEY"
sync_env_var "PUBLIC_APP_ORIGIN"
sync_env_var "PUBLIC_INVITE_ORIGIN"

# 2. GHCR authentication (if token provided by GitHub Actions)
if [ -n "${GHCR_TOKEN:-}" ] && [ -n "${GHCR_USER:-}" ]; then
  echo "Authenticating with GitHub Container Registry..."
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin >/dev/null 2>&1 || true
fi

# 3. Pull latest images
echo "=== [3/6] Pulling Latest Container Images ==="
docker compose -f compose.yaml -f compose.prod.yaml pull

# 4. Start DB & Cache, wait for healthy status
echo "=== [4/6] Starting Database and Running Migrations ==="
docker compose -f compose.yaml -f compose.prod.yaml up -d postgres redis

echo "Waiting for PostgreSQL to pass healthcheck..."
for i in {1..30}; do
  if docker compose -f compose.yaml -f compose.prod.yaml ps postgres | grep -q "(healthy)"; then
    echo "PostgreSQL is healthy."
    break
  fi
  sleep 2
done

# Run Prisma migrations to deploy all new database schema changes
echo "Executing Prisma migration deploy..."
docker compose -f compose.yaml -f compose.prod.yaml run --rm migrate

# 5. Start all application services
echo "=== [5/6] Launching Application Services ==="
docker compose -f compose.yaml -f compose.prod.yaml up -d --remove-orphans

# 6. Strict Health Check Verification
echo "=== [6/6] Verifying Health & Readiness ==="
READY=0
for i in {1..30}; do
  API_STATUS=$(curl -s http://127.0.0.1:4000/api/v1/health/ready || true)
  WEB_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:80/ || true)
  
  if [[ "$API_STATUS" == *"\"status\":\"ok\""* ]] && [ "$WEB_CODE" -ge 200 ] && [ "$WEB_CODE" -lt 500 ]; then
    echo "Deployment verification PASSED:"
    echo " - API Readiness: OK (Database connected)"
    echo " - Web Frontend: HTTP $WEB_CODE"
    READY=1
    break
  fi
  echo "Waiting for services to become ready... (attempt $i/30)"
  sleep 2
done

if [ "$READY" -ne 1 ]; then
  echo "Deployment verification FAILED! Inspecting logs:"
  docker compose -f compose.yaml -f compose.prod.yaml ps
  docker compose -f compose.yaml -f compose.prod.yaml logs --tail=50
  exit 1
fi

echo "Cleaning up unused container images..."
docker image prune -f >/dev/null 2>&1 || true
echo "=== MORI Wedding Studio Successfully Deployed ==="

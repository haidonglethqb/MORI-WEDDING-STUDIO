# Commands and CI

**Spec:** 17.4–17.5 | See `MORI_PROJECT_PLAN.md` sections 17.4–17.5 (Commands, CI/CD)

## Essential Commands

```bash
# Setup
corepack enable && corepack pnpm install && docker-compose up -d && pnpm db:migrate

# Development
pnpm dev                 # Watch mode
pnpm api:generate        # OpenAPI from Zod

# Testing
pnpm test                # Unit + integration
pnpm test:e2e            # Playwright E2E

# Database
pnpm db:migrate          # Run migrations
pnpm db:reset            # Dev reset
```

## Docker Multi-Stage Build

Three targets: `app-web` (Next.js, port 3000), `app-api` (NestJS, port 3001), `app-worker` (background, port 3002). P00 spike finalizes Dockerfile strategy.

## CI/CD

- **GitHub Actions:** Lint, typecheck, test (all unit/integration on real services), build
- **Automated gates:** Tests pass, no coverage decrease, migrations reversible
- **No hand-edits:** `docs/api/openapi.json` is generated; never edit by hand

### Production Compose Deployment

The deploy workflow builds immutable images tagged with the commit SHA, uploads the Compose and maintenance scripts,
then deploys that exact tag to the VPS. Configure these GitHub Actions repository secrets:

| Secret | Value |
| --- | --- |
| `SSH_HOST` | `43.240.117.146` |
| `SSH_PORT` | `24700` |
| `SSH_USER` | `root` (a dedicated deploy user with Docker access is preferred) |
| `SSH_KEY` | Full PEM private-key contents; do not use a workstation file path |
| `SMTP_PASSWORD` | Password for the OxMail mailbox `mori@moriwedding.xyz` |

The host installs Docker Engine and Compose v2 if either is missing, starts PostgreSQL/Redis, waits for PostgreSQL
health, runs the one-shot Prisma migration service, then starts the app and checks API readiness plus the HTTPS web
origin. Caddy listens on ports 80/443, obtains and renews certificates, and reverse-proxies to the private web
container port. Set Cloudflare SSL/TLS to Full (Strict). Cleanup runs only after health checks succeed. It removes
unused containers/images/build cache, apt cache, and old journal entries; named Docker volumes and
`/opt/mori/media` are retained. Production deployment does not run the development seed or create predictable demo
accounts. OxMail uses `mail.moriwedding.xyz`; set `mail` to DNS-only in Cloudflare. The API uses authenticated SMTP
with implicit TLS on port 465 by default; the password is injected from the GitHub secret and never committed.

## Related

- [Compose services](./compose-services.md) — Local stack
- [Env and secrets](./env-and-secrets.md) — Config validation
- [Release policy](../testing/release-policy.md) — Test gates

---

**Principle:** Commands are scripted; CI is automated; builds are deterministic.

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

## Related

- [Compose services](./compose-services.md) — Local stack
- [Env and secrets](./env-and-secrets.md) — Config validation
- [Release policy](../testing/release-policy.md) — Test gates

---

**Principle:** Commands are scripted; CI is automated; builds are deterministic.

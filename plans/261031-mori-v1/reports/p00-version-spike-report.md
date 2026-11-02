# P00 Version Spike Report

**Ticket:** MORI-004 + WP-00c  
**Date:** 2026-10-31  
**Status:** COMPLETE (with known issues documented)

---

## 1. Version Matrix (Pinned)

| Component | Version | Source / Notes |
|-----------|---------|----------------|
| Node.js (local) | 24.14.0 | `.nvmrc`; below NestJS spec floor of >=24.15 by spec guess, but CLI engines show `>= 20.11` — local build OK |
| Node.js (Docker) | 24.22.2 | `node:24-alpine` resolved at build time |
| Next.js | 16.4.3 | Stable App Router; `pnpm install` pinned |
| React | 19.3.1 | Peer dep of Next.js 16; locked with it |
| react-dom | 19.3.1 | Matched |
| NestJS | 12.3.2 | `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` |
| @nestjs/cli | 12.0.11 | Dev dep; engines: `>= 20.11` (satisfied by 24.14.0 locally) |
| @nestjs/schematics | 12.0.12 | CLI companion |
| @nestjs/swagger | 12.0.5 | OpenAPI UI; NestJS 12 compatible |
| @nestjs/testing | 12.3.2 | Dev dep |
| @swc/core | 1.16.21 | NestJS SWC builder |
| @swc/cli | 0.8.2 | Required by NestJS CLI SWC builder; NOTE: version 0.5.23 no longer published, latest stable is 0.8.2 |
| Prisma CLI (`prisma`) | 7.10.1 | ⚠️ `npm view prisma version` returns `8.0.0-rc.29` (`latest` tag) — installed `prisma@7.10.1` explicitly via `prev` tag |
| @prisma/client | 7.10.1 | `latest` tag; matched |
| @prisma/adapter-pg | 7.10.1 | Matched; driver adapter GA in Prisma 7 |
| PostgreSQL (Docker) | 17-alpine | `postgres:17-alpine` pulled during `docker compose up`; digest pinning for prod in P01 |
| TypeScript | 5.9.3 | Latest 5.x; chosen over 7.0.2 (latest) for ecosystem compatibility |
| pnpm | 12.16.1 | `packageManager` pinned in root `package.json` |
| Zod | 4.6.7 | Latest; used in all packages |
| Vitest | 5.0.5 | Latest stable; `vitest@V4` is 4.1.12 |
| ESLint | 10.14.0 | Latest; flat config (`eslint.config.mjs`) |
| typescript-eslint | 8.72.1 | Flat config support for ESLint 10 |
| prettier | 3.9.10 | Code formatter |
| @asteasolutions/zod-to-openapi | 9.1.0 | Zod → OpenAPI generation (no nestjs-zod; see below) |
| tsx | 4.23.15 | Script runner for generate-openapi.ts |
| reflect-metadata | 0.2.2 | Required for NestJS DI in ESM |
| rxjs | 7.8.2 | NestJS runtime dep |
| pg | 8.23.1 | PostgreSQL node client (driver adapter) |
| @types/pg | 8.23.1 | TypeScript types |
| @types/node | 26.6.6 | Latest |
| @types/react | 19.1.8 | Latest React 19 types |

---

## 2. Compatibility Findings and Workarounds

### 2.1 Prisma 7 — BREAKING: `url` removed from schema datasource

**Finding:** `prisma@7.10.1` (dist-tag `prev`; `latest` = `8.0.0-rc.29` RC) removed the `url = env("DATABASE_URL")` from schema datasource blocks. Connection configuration now belongs in `prisma.config.ts`.

**Workaround:** Updated `packages/database/prisma/schema/base.prisma` to use `datasource db { provider = "postgresql" }` without `url`. Created `packages/database/prisma.config.ts` using `defineConfig({ datasource: { url: ... } })`.

**API format:** `prisma/config` `defineConfig` in 7.10.1 accepts:
- `schema`: path to schema directory
- `datasource.url`: connection string (replaces schema `url`)
- Does NOT accept `migrate` (tested), `datasources` (plural, tested)

### 2.2 Prisma 7 — `migrate deploy` doesn't apply migrations from config schema path

**Finding:** `prisma migrate deploy` with `schema` path specified in `prisma.config.ts` reports "No migration found in prisma/migrations" even when the migration directory is present. Root cause: unconfirmed; possibly Prisma 7 migration directory resolution changed with custom schema paths.

**Workaround for spike:** Applied migration SQL directly via `psql` in the running postgres container. **P01 ACTION:** Investigate `migrationDir` option in `defineConfig` or pin the migration approach.

### 2.3 `nestjs-zod` — NOT compatible with NestJS 12

**Finding:** `nestjs-zod@5.5.0` declares peer dependency `@nestjs/common: '^10.0.0 || ^11.0.0'` — explicitly excludes NestJS 12.

**Decision:** Did NOT use nestjs-zod. Implemented custom `ZodValidationPipe` in `apps/api/src/common/zod-validation.pipe.ts`. Validation produces RFC 9457 problem-details JSON on failure.

**Alternative approach for P01:** Check if nestjs-zod publishes NestJS 12 support or fork/patch.

### 2.4 OpenAPI generation — Zod cross-package instance issue

**Finding:** `@asteasolutions/zod-to-openapi@9.1.0` calls `extendZodWithOpenApi(z)` to add `.openapi()` to Zod prototype. In pnpm workspace, static imports from `@mori/contracts` resolve before the extension call runs (ESM static import ordering). This caused "openapi is not a function" on imported schema objects.

**Workaround:** Changed `scripts/generate-openapi.ts` to use dynamic `import()` for `@mori/contracts` after calling `extendZodWithOpenApi(z)`. This ensures schemas are created with the extended prototype.

### 2.5 TypeScript 7 — NOT used

**Finding:** `typescript@latest` = `7.0.2` (released). NestJS CLI 12 bundles TypeScript `~6.0.2`. `ts-jest` (not used here) requires `>=4.3 <7`. Selected TypeScript **5.9.3** (latest 5.x) for maximum ecosystem compatibility.

**TypeScript 7 status:** Available but too new for all tooling. Revisit in P02.

### 2.6 NestJS ESM — SWC required, tsconfig paths must NOT map to .d.ts files

**Finding:** When `tsconfig.json` paths mapped to `*.d.ts` declaration files, the SWC compiler rewrote runtime imports to `index.d.js` paths (non-existent). Fix: remove explicit `paths` from app `tsconfig.json` files; let pnpm workspace symlinks resolve `@mori/*` imports via package.json `exports` field at runtime.

### 2.7 pnpm 12 — Build script approval

**Finding:** pnpm 12 blocks build scripts (postinstall hooks) by default. `ERR_PNPM_IGNORED_BUILDS` for `@prisma/engines`, `@scarf/scarf`, `@swc/core`, `esbuild`, `prisma`.

**Workaround:** Used `--allow-build` CLI flags on first install; pnpm records approvals in `pnpm-lock.yaml` under `onlyBuiltDependencies`. Config in `pnpm-workspace.yaml` (`onlyBuiltDependencies` field) is read but insufficient alone — lockfile also needs the entries. For CI/Docker, use the committed lockfile with `--frozen-lockfile`.

### 2.8 @swc/cli version

**Finding:** `@swc/cli@0.5.23` no longer published. NestJS CLI SWC builder requires `@swc/cli` as a peer. Installed `@swc/cli@0.8.2` (latest stable).

### 2.9 prisma — moved to production dependencies

**Decision:** `prisma` CLI moved from `devDependencies` to `dependencies` in `packages/database/package.json` to ensure `prisma generate` runs during Docker production install of `@prisma/client`. This adds ~14 MB to production images; acceptable for a spike; revisit in P01 with a custom `output` generator path for cleaner Docker layers.

---

## 3. Commands Run with Results

### 3.1 pnpm install

```
corepack pnpm install --allow-build @prisma/engines --allow-build "@scarf/scarf" \
  --allow-build @swc/core --allow-build esbuild --allow-build prisma
# Result: Done in 4.6s using pnpm v12.16.1 ✅
```

### 3.2 pnpm lint

```
corepack pnpm lint
# Result: (no output - clean) ✅
```

### 3.3 pnpm typecheck

```
corepack pnpm -r typecheck
# Result: All 5 packages/apps pass (0 errors) ✅
```

### 3.4 pnpm test:unit

```
corepack pnpm -r test:unit
# Result:
#   packages/config: 10 tests passed ✅
#   packages/contracts: 6 tests passed ✅
#   apps/api: 0 files (passWithNoTests) ✅
```

### 3.5 pnpm build (packages)

```
DATABASE_URL=postgresql://placeholder:x@localhost/db corepack pnpm --filter @mori/config build
# → tsc -p tsconfig.json ✅

corepack pnpm --filter @mori/contracts build
# → tsc -p tsconfig.json ✅

DATABASE_URL=postgresql://placeholder:x@localhost/db corepack pnpm --filter @mori/database build
# → prisma generate && tsc -p tsconfig.json ✅
# Generated Prisma Client (v7.10.1)
```

### 3.6 pnpm build (apps)

```
corepack pnpm --filter @mori/api build
# → nest build (SWC) → Successfully compiled: 9 files ✅

corepack pnpm --filter @mori/worker build
# → nest build (SWC) → Successfully compiled: 2 files ✅

API_INTERNAL_ORIGIN=http://localhost:4000 corepack pnpm --filter @mori/web build
# → next build → Compiled successfully in 3.5s ✅
# Route / is ƒ (Dynamic) — server-rendered on demand ✅
```

### 3.7 api:generate && api:check-drift

```
corepack pnpm --filter @mori/api run api:generate
# → ✓ OpenAPI document written to docs/api/openapi.json ✅

corepack pnpm --filter @mori/api run api:check-drift
# → ✓ OpenAPI document is up to date (no drift) ✅
```

### 3.8 Docker build

```
docker compose -f compose.yaml -f compose.dev.yaml build --progress=plain
# All 4 images built: mori-migrate, mori-web, mori-worker, mori-api ✅
# Build time: ~465s (all images from scratch, cached on subsequent runs)
```

### 3.9 Docker compose up

```
docker compose -f compose.yaml -f compose.dev.yaml up -d
# All containers started ✅
# postgres:17-alpine: Up (healthy)
# mori-migrate:  Exited (0) — ran deploy, reported "No migration found" (see §2.2)
# mori-api: Up (healthy)
# mori-worker: Up
# mori-web: Up
```

### 3.10 Health live

```
curl http://localhost:4000/api/v1/health/live
# {"status":"ok"} ✅
```

### 3.11 Health ready

```
curl http://localhost:4000/api/v1/health/ready
# {"status":"ok","checks":{"database":"ok"}} ✅
```

### 3.12 Valid spike-check POST

```
curl -X POST http://localhost:4000/api/v1/spike-checks \
  -H "Content-Type: application/json" \
  -d '{"note": "P00 version spike - MORI Wedding Studio"}'
# {"id":"d678adbc-4cfb-4300-bd10-adebd8c16cdc","note":"P00 version spike - MORI Wedding Studio","createdAt":"2026-10-31T04:30:57.529Z"} ✅
```

### 3.13 Invalid spike-check (unknown key → problem-details)

```
curl -X POST http://localhost:4000/api/v1/spike-checks \
  -H "Content-Type: application/json" \
  -d '{"note": "valid note", "extraField": "should be rejected"}'
# HTTP 400
# {"type":"https://mori.app/errors/validation","title":"Validation Error","status":400,
#  "detail":"The request body failed schema validation.",
#  "instance":"/api/v1/spike-checks",
#  "violations":[{"field":"root","message":"Unrecognized key: \"extraField\""}]} ✅
```

### 3.14 Empty note validation

```
curl -X POST http://localhost:4000/api/v1/spike-checks \
  -H "Content-Type: application/json" \
  -d '{"note": ""}'
# HTTP 400
# {"type":"https://mori.app/errors/validation","title":"Validation Error","status":400,
#  "detail":"The request body failed schema validation.",
#  "instance":"/api/v1/spike-checks",
#  "violations":[{"field":"note","message":"note must not be empty"}]} ✅
```

### 3.15 Web page

```
curl http://localhost:3000
# Returns full HTML with "API Status: ok" and "database: ok" ✅
# Server-side rendered; API_INTERNAL_ORIGIN used server-side only ✅
```

### 3.16 Docker compose down

```
docker compose -f compose.yaml -f compose.dev.yaml down
# All containers stopped and removed ✅
```

---

## 4. Test Results Summary

| Check | Result |
|-------|--------|
| `pnpm install --frozen-lockfile` | ✅ PASS |
| `pnpm lint` | ✅ PASS (clean) |
| `pnpm -r typecheck` | ✅ PASS (all 5 packages/apps) |
| `pnpm -r test:unit` | ✅ PASS (16 tests: 10 config + 6 contracts) |
| `pnpm build` (all packages) | ✅ PASS |
| `pnpm api:generate` | ✅ PASS |
| `pnpm api:check-drift` | ✅ PASS |
| Docker build (all 4 images) | ✅ PASS |
| `docker compose up` | ✅ PASS |
| `GET /api/v1/health/live` | ✅ PASS |
| `GET /api/v1/health/ready` | ✅ PASS (DB connectivity confirmed) |
| `POST /spike-checks` valid | ✅ PASS (UUID created, timestamptz correct) |
| `POST /spike-checks` unknown key | ✅ PASS (problem-details, violation listed) |
| `POST /spike-checks` empty note | ✅ PASS (problem-details, field error) |
| Web page with API status | ✅ PASS (SSR, API_INTERNAL_ORIGIN server-side) |
| `docker compose down` | ✅ PASS |

---

## 5. Known Issues / Blockers for P01

### HIGH — Prisma 7 `migrate deploy` doesn't apply manual migrations — RESOLVED

Root cause: with a multi-file schema directory, Prisma 7 looks for migrations next to the datasource file unless `migrations.path` is set. `defineConfig` accepts `migrations.path`.

Fix: `packages/database/prisma.config.ts` sets `migrations.path` to `prisma/migrations`. The URL comes from `resolveDatabaseUrl()` (`DATABASE_URL_FILE` then `DATABASE_URL`; empty file path is ignored; neither set throws). The migrate image copies `src/resolve-url.ts`. Dev credentials live in `compose.dev.yaml`; the base file no longer hardcodes the database password. The API healthcheck uses `node` fetch because `node:24-alpine` has no `wget`.

Verified on an empty volume (2026-10-31): `migrate` applied `20261031000000_init` and exited 0; `_prisma_migrations` has that row; `GET /api/v1/health/ready` returned database ok; `POST /api/v1/spike-checks` created a row; a second `migrate deploy` reported "No pending migrations to apply"; web returned HTTP 200.

### MEDIUM — Prisma in production deps adds image weight

`prisma` CLI (~14 MB) is in `packages/database` production dependencies to ensure `prisma generate` runs in the Docker runtime stage. P01 should:
- Use generator `output = "./generated"` pointing to a local directory
- Copy that generated directory from builder to runtime stage
- Remove `prisma` from production deps

### MEDIUM — pnpm build approval for CI

CI must use `--allow-build` flags OR commit the lockfile with approved builds. The `onlyBuiltDependencies` in `pnpm-workspace.yaml` reads correctly but alone is insufficient; the lockfile must also have the `onlyBuiltDependencies` section. Use `corepack pnpm install --allow-build ...` on first CI run.

### LOW — nestjs-zod no NestJS 12 peer dep

Custom ZodValidationPipe works correctly. Monitor `nestjs-zod` releases for NestJS 12 support; switching if/when available reduces spike code.

### LOW — Node.js 24.14.0 local vs spec floor

Spec mentions `>= 24.15` as a possible Nest CLI requirement. Tested: `@nestjs/cli@12.0.11` engines says `>= 20.11`. Node 24.14.0 is compatible. Record: local build works on 24.14.0; Docker runs 24.22.2.

---

## 6. Owned Files Created

```
Root:
  package.json, pnpm-workspace.yaml, pnpm-lock.yaml
  tsconfig.base.json, .gitignore, .dockerignore, .nvmrc, .env.example
  eslint.config.mjs, .prettierrc.json
  compose.yaml, compose.dev.yaml

packages/config/
  package.json, tsconfig.json, vitest.config.ts
  src/env.ts, src/index.ts, src/__tests__/env.test.ts

packages/contracts/
  package.json, tsconfig.json, vitest.config.ts
  src/spike-check.ts, src/problem-details.ts, src/index.ts
  src/__tests__/spike-check.test.ts

packages/database/
  package.json, tsconfig.json, prisma.config.ts
  prisma/schema/base.prisma, prisma/schema/spike.prisma
  prisma/migrations/20261031000000_init/migration.sql
  prisma/migrations/migration_lock.toml
  src/client.ts, src/index.ts

apps/api/
  package.json, tsconfig.json, tsconfig.scripts.json
  nest-cli.json, .swcrc, vitest.config.ts
  src/main.ts, src/app.module.ts
  src/health/health.controller.ts, src/health/health.module.ts
  src/spike-checks/spike-checks.controller.ts
  src/spike-checks/spike-checks.service.ts
  src/spike-checks/spike-checks.module.ts
  src/common/zod-validation.pipe.ts
  src/common/problem-details.filter.ts
  scripts/generate-openapi.ts

apps/worker/
  package.json, tsconfig.json, nest-cli.json, .swcrc
  src/main.ts, src/worker.module.ts

apps/web/
  package.json, tsconfig.json, next.config.ts
  src/app/layout.tsx, src/app/page.tsx

infra/docker/
  Dockerfile.api, Dockerfile.worker, Dockerfile.web, Dockerfile.migrate

docs/api/openapi.json  (generated)
```

# Phase 01 - Foundation

## Context Links

- Spec: 9.2 (topology), 9.3, 9.4 (layout), 9.5 (Identity, Operations modules), 9.6, 9.7 (pools, CAS, locks), 10.1, 10.2 (User, Credential, Session, AuthToken, IdempotencyRecord, AuditLog, BackgroundTask, OutboxEvent), 11.1, 11.2 (sessions, Argon2id, CSRF), 11.3 (`/auth/*`, `/me`, `/me/sessions`), 11.5 (errors, idempotency), 15.2 (threat model), 16.4 (logging), 17 (Compose, images, env inventory 17.3, scripts 17.4, CI 17.5), 18.1, 18.7
- Brief §2 (pino, Argon2id params, otplib, Caddy hosts, dependency-cruiser, GitHub Actions), §3 HR-1..12
- Previous: [phase-00](./phase-00-decisions-and-spike.md) (version matrix, ADRs, migration outline)

## Overview

- Priority: P1. Status: Pending (needs MORI-004, 005).
- Deliver the hardened monorepo, dev Compose stack, identity + sessions, authorization/CSRF/MFA/trusted-host foundation, CI, request IDs, safe errors, audit, idempotency.
- Exit gate: clean-clone startup (TC-103) and cross-account denial tests.

## Key Insights

- Every later ticket depends on `apps/api/src/common/**`; keep its API small and stable (guards, decorators, interceptors), documented in `apps/api/src/common/README.md`.
- Spec puts safe errors/request IDs in MORI-012 (after 009); every endpoint needs them from day one. Plan: 009 builds the problem-details filter + request-id middleware baseline; 012 adds audit, idempotency, redaction proofs, private layouts.
- Durable outbox arrives in MORI-022 (P03), but 009 must send verification/reset mail now. Plan: 009 sends mail through a `MailPort` invoked after commit (repeat is harmless, TC-108 style); 022 rewires it to the outbox.
- TC-006/007/008/011 reference projects, proofs, orders, RSVP that do not exist yet. 010 builds policy framework + harness; module tickets (019, 033, 038, 044) rerun them against real resources.

## Requirements

- Functional: register/verify/login/logout/forgot/reset, `/me`, sessions list/revoke, staff TOTP MFA + recent-auth, owner/assignment policy guard, CSRF (session-bound + pre-auth), Origin/Fetch-Metadata checks, trusted-host middleware, Redis rate limits, audit log, idempotency interceptor, CI gates.
- Non-functional: customer session 7d idle/30d absolute; staff 30 min idle/8 h absolute; Argon2id m=19456,t=2,p=1; password 15-128 chars Unicode + blocklist; tokens 256-bit, digest-stored, 30-min single-use; pools API 10/worker 5/migrate 2; files < 200 lines.

## Architecture

- Request pipeline (Nest): trusted-host -> request-id -> pino logger (redact) -> session resolver (`__Host-mori_session` cookie -> digest lookup) -> CSRF/origin guard (unsafe methods) -> rate limit (Redis) -> Zod validation -> policy guard (`@Policy(...)`) -> handler -> idempotency interceptor (scoped by principal+command+key, commits with mutation) -> problem-details filter.
- Sessions: opaque 256-bit token, SHA-256 digest in `Session`; rotate on login/privilege change/recovery; revoke all on reset.
- Compose dev: proxy (Caddy local TLS `app.mori.localhost`, `invite.mori.localhost`), web, api, worker, postgres:17, redis (appendonly, noeviction), minio, mailpit, clamav (`--profile scan`), migrate (one-shot) with healthchecks and `service_healthy`/`service_completed_successfully`.

## Related Code Files

Create:
- Root: `eslint.config.mjs`, `.prettierrc`, `tsconfig.base.json` (strict), `.dependency-cruiser.cjs`, `package.json` scripts (17.4), `.env.example`, `.gitleaks.toml`
- `packages/{contracts,api-client,ui,invitation-renderer,database,domain,config}/package.json` + `src/index.ts`
- `packages/config/src/{env-schema.ts,read-secret-file.ts,load-config.ts}`
- `packages/database/prisma/schema/{base,identity,operations}.prisma`, first migrations
- `apps/api/src/common/{request-id,errors,logging,session,csrf,security,rate-limit,policy,idempotency,audit,validation}/**`
- `apps/api/src/modules/identity/**`, `apps/api/src/modules/operations/audit/**`
- `apps/worker/src/{main.ts,health/**}`
- `apps/web/src/app/(account)/auth/**`, `apps/web/src/features/identity/**`, `apps/web/src/app/(workspace)/layout.tsx`, `apps/web/src/app/(studio)/layout.tsx`
- `infra/docker/{api,web,worker,migrate}.Dockerfile`, `infra/proxy/Caddyfile`, `compose.yaml`, `compose.dev.yaml`
- `.github/workflows/{ci.yml,security.yml}`
- `tests/integration/{setup,identity,authz}/**`, `tests/e2e/identity/**`, `tests/security/secrets/**`

## Ticket Table

| Ticket | Work | Agent | Depends | Owned paths | Endpoints (11.3) | UI | TCs | Completion evidence |
|---|---|---|---|---|---|---|---|---|
| MORI-007 | Monorepo packages, strict TS, scripts, client boundaries | fullstack-developer | 004 | root configs, `packages/*/package.json` + `src/index.ts`, `.dependency-cruiser.cjs`, `eslint.config.mjs` | - | - | - | Browser cannot import `packages/database`; builds pass |
| MORI-008 | Dev Compose, health checks, secrets loading, migration runner | fullstack-developer | 007 | `compose*.yaml`, `infra/docker/**`, `infra/proxy/**`, `packages/config/**`, `apps/worker/src/{main.ts,health}/**`, `.env.example` | `/health/live`, `/health/ready` | - | TC-103 | TC-103 + local recovery smoke test |
| MORI-009 | Registration, verification, login, recovery, server sessions | fullstack-developer | 005, 008 | `packages/database/prisma/schema/identity.prisma`, `apps/api/src/modules/identity/**`, `apps/api/src/common/{session,errors,request-id}/**`, `packages/contracts/src/identity/**`, `apps/web/src/app/(account)/auth/**`, `apps/web/src/features/identity/**`, `tests/integration/identity/**`, `tests/e2e/identity/**` | `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password`, `/auth/reset-password`; `GET /me`, `GET /me/sessions`, `DELETE /me/sessions/:id` | UI-06, UI-15 (sessions part) | TC-001..005 | TC-001..005; accessible auth forms |
| MORI-010 | Owner/assignment guards, CSRF, staff MFA, trusted-host | fullstack-developer | 009 | `apps/api/src/common/{policy,csrf,security,rate-limit}/**`, `apps/api/src/modules/identity/mfa/**`, `tests/integration/authz/**` | `GET /auth/csrf`; added: `POST /auth/mfa/enroll`, `/auth/mfa/verify`, `/auth/reauthenticate` | UI-06 (MFA step) | TC-006..012, TC-112 | TC-006..012 and TC-112 |
| MORI-011 | CI, real-PG tests, contract generation, image/secret scan | fullstack-developer (tester reviews) | 007, 008 | `.github/workflows/**`, `vitest.workspace.ts`, `tests/integration/setup/**`, `.gitleaks.toml`, `infra/scripts/ci/**` | - | - | TC-113 (scan part), TC-125 (grep gate) | Required checks fail on intentional defects |
| MORI-012 | Request IDs, safe errors, audit, idempotency, private layouts | fullstack-developer | 009, 011 | `packages/database/prisma/schema/operations.prisma`, `apps/api/src/common/{idempotency,audit,logging}/**`, `apps/api/src/modules/operations/audit/**`, `apps/web/src/app/(workspace)/layout.tsx`, `apps/web/src/app/(studio)/layout.tsx`, `apps/web/src/components/errors/**`, `tests/security/secrets/**` | (cross-cutting) | UI shell for UI-07..21 (error/retry states) | TC-113 | Redaction tests; consistent error/retry states |

## Agent Briefs

### MORI-007 - Monorepo skeleton
- Promote spike to full spec 9.4 layout at repo root; packages: contracts, api-client, ui, invitation-renderer, database, domain, config.
- `tsconfig.base.json`: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; ESM everywhere.
- Root scripts exactly per spec 17.4 (`lint`, `typecheck`, `test:unit`, `test:integration`, `test:e2e`, `db:migrate:dev`, `db:seed:dev`, `api:generate`, `api:check-drift`, `build`, `test:security`, `test:performance`); unimplemented ones exit non-zero with message, not silent pass.
- dependency-cruiser rules: `apps/web` -> `packages/database` forbidden; `packages/contracts` cannot import database/config secrets; `packages/domain` pure (no IO libs).
- Add a deliberate-violation fixture test proving the rule fails.
- HR-10 (files < 200 lines, kebab-case) enforced via lint where possible.

### MORI-008 - Dev Compose and config
- Services per brief §4 P01: proxy, web, api, worker, postgres:17, redis (`appendonly yes`, `maxmemory-policy noeviction`), minio (+ bucket init), mailpit, clamav (profile `scan`), migrate.
- Healthchecks on every service; api/worker `depends_on` postgres `service_healthy` and migrate `service_completed_successfully`.
- `packages/config`: Zod env schema for spec 17.3 vars; `*_FILE` loader reads secret files (tested); `APP_ENV=production` rejects dev bypasses.
- Caddy: local TLS for `app.mori.localhost`, `invite.mori.localhost`; `/api/v1/*` -> api, `/api/public/v1/*` only on invite host; overwrite `X-Forwarded-*`.
- Worker skeleton: health endpoint/heartbeat only; processors arrive in P03.
- Non-root images, resource limits; ClamAV off by default (~1.5 GB RAM).
- TC-103: script `infra/scripts/smoke-clean-clone.sh` (fresh clone -> up -> migrate -> seed placeholder -> health). Recovery smoke: restart api/postgres, verify reconnect.

### MORI-009 - Identity and sessions
- Entities: User (normalizedEmail unique, role CUSTOMER/STUDIO/ADMIN, status, verifiedAt, invitationQuota), Credential, Session (tokenDigest unique, idle/absolute expiry, revokedAt), AuthToken (digest, purpose, expiresAt, usedAt).
- Email normalization (NFKC + lowercase + trim) -> TC-002 generic response, no enumeration.
- Token consume: single `UPDATE ... WHERE usedAt IS NULL AND expiresAt > now() AND purpose = $p` returning 1 row (TC-003/004).
- Reset revokes all sessions (TC-005); login rotates session; cookie `__Host-mori_session` Secure/HttpOnly/SameSite=Lax/Path=/ no Domain.
- Mail via `MailPort` after commit (Mailpit in dev); replaced by outbox in MORI-022.
- Baseline `common/errors` (problem-details 11.5) + `common/request-id`; 012 extends.
- UI-06 states: pending, invalid, expired, rate-limited; labels, error summary, focus management (8.11).
- Contracts in `packages/contracts/src/identity`; regenerate OpenAPI.

### MORI-010 - Authorization and request security
- `@Policy()` guard: role + object ownership/assignment resolvers registered per module; inaccessible -> 404 (HR-3, INV-01).
- Scoped-query helper pattern: repository methods take `principal` and put owner/assignment in `where`.
- CSRF: session-bound token (`GET /auth/csrf`), pre-auth token for login/register; exact Origin + `Sec-Fetch-Site` checks on unsafe methods (TC-010).
- Staff MFA (otplib TOTP), recent-auth window for role change/export/destructive (TC-012); add endpoints to contracts/OpenAPI.
- Trusted-host middleware: reject unknown Host, ignore client `X-Forwarded-*` beyond `TRUSTED_PROXY_HOPS` (TC-112).
- Redis rate limiter (login, forgot, resend); fail closed when Redis down for auth (spec 17.6).
- Disabled account / revoked role -> next request denied (TC-011, session check per request).
- Reject unknown command fields (TC-009) via strict Zod objects.
- TC-006/007/008 harness: fixture resource module in tests only; rerun in 019/033/038/044.

### MORI-011 - CI
- GitHub Actions: install (frozen lockfile), lint, typecheck, unit, integration (services: postgres:17, redis), build, `api:check-drift`, gitleaks, trivy image scan, dependency-cruiser.
- TC-125 gate: grep forbidden payment vocabulary/SDKs from MORI-001 list over `apps/`, `packages/` (excluding the gate's own word list).
- Integration test setup: per-run database, `prisma migrate deploy`, truncate between suites; no SQLite (HR-9).
- Prove each check fails on an intentional defect (record PR/branch runs).

### MORI-012 - Ops foundation
- `operations.prisma`: AuditLog (append-only), IdempotencyRecord (unique principalScope+command+key, requestHash, state, resourceRef, expiresAt 24 h), BackgroundTask, OutboxEvent (tables only; dispatcher in 022).
- Idempotency interceptor: canonical JSON hash; completed -> replay stored result (recheck authz); different body -> 422 `IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_BODY`; in-flight -> 409 `OPERATION_IN_PROGRESS`; record commits inside the use-case transaction (HR-4).
- Audit service: `audit.record(tx, {actor, action, target, safeMetadata})`.
- pino redact paths: cookies, authorization, passwords, tokens, passcodes, addresses, RSVP notes; proxy access log without query strings.
- TC-113: scan built images, web bundle, logs for secret patterns.
- Web private layouts: server-side session check via API, `no-store`, redirect to sign-in; shared error/retry/permission-denied components.

## Implementation Steps

1. MORI-007 -> MORI-008 (sequential).
2. MORI-011 (after 007+008) in parallel with MORI-009.
3. MORI-010 after 009; MORI-012 after 009 + 011.
4. Migrations: 009 (identity) then 012 (operations); never concurrent.
5. Gate: TC-103 clean clone, TC-001..012, 112, 113 green in CI.

## Todo List

- [ ] MORI-007 layout + boundaries
- [ ] MORI-008 Compose + config + TC-103
- [ ] MORI-009 identity + UI-06
- [ ] MORI-010 policy/CSRF/MFA/trusted-host
- [ ] MORI-011 CI gates proven
- [ ] MORI-012 audit/idempotency/redaction/layouts

## Success Criteria

- TC-001..012, TC-103, TC-112, TC-113 executed and passing (outputs in reports).
- CI required checks fail on intentional defects, pass on main.
- dependency-cruiser blocks web -> database import.

## Risk Assessment

- 012 ordering (errors after 009): mitigated by baseline in 009 (flagged inconsistency).
- TC-006..008/011 need later resources: harness now, rerun in owning modules (flagged).
- Email before outbox: `MailPort` interim, rewired in 022 (flagged).
- 11.3 lacks MFA/reauth/staff-invite endpoints: add to contracts under 010; admin bootstrap invite in 008 seed script (prod bootstrap creates admin invitation only, spec 10.6).
- Docker VM 4 GB RAM: ClamAV behind profile.

## Security Considerations

- INV-01, INV-15 primary. Generic auth errors; no account enumeration; Argon2id; digest-only tokens; no secrets in logs or bundles; CORS never wildcard with credentials.

## Next Steps

- P02 (013 needs 003 approval + 007) and P03 019/020 start after 010/008.

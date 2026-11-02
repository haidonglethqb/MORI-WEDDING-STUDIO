# MORI v1 - Agent Handoff Brief

Source of truth: `docs/MORI_PROJECT_PLAN.md` (the "spec"). This brief tells agents how to execute it.
When this brief and the spec disagree, the spec wins unless an ADR in `docs/adr/` says otherwise.

## 1. Environment facts (checked 2026-10-31)

- Repo is empty except docs and agent kit; no commits yet. Monorepo lives at the **repo root** (not `mori/`).
- Local: Node 24.14.0, corepack 0.34.6, no global pnpm (use `corepack enable` / `corepack pnpm`), Docker 29.2.1, Compose v5.0.2.
- Docker daemon: 8 CPU, ~4 GB RAM. Docker commands need sandbox escape (`required_permissions: ["all"]`).
- ClamAV needs ~1.5 GB RAM; keep it behind a Compose profile (`--profile scan`) for dev.
- Nest CLI may need Node >= 24.15: run builds inside `node:24` images or pin a compatible CLI; record result.

## 2. Accepted technical defaults (record as ADRs; changeable by user)

| Topic | Default |
| --- | --- |
| Shared contracts (spec 9.6) | Zod schemas in `packages/contracts`; Nest validation via `nestjs-zod` (or a thin custom pipe if incompatible); OpenAPI generated from Zod (ADR-16) |
| Frontend server state / forms | TanStack Query, react-hook-form + zod resolver |
| Dev storage / mail | MinIO, Mailpit |
| Image processing | `sharp`, `file-type`, ClamAV `clamd` |
| PDF proof rendering | poppler `pdftoppm` in sandboxed worker container (no network, CPU/mem/PID limits) |
| Password / passcode hashing | `@node-rs/argon2`, Argon2id m=19456 KiB, t=2, p=1 |
| Sessions | Custom opaque PostgreSQL sessions per spec 11.2 (no auth library) |
| Staff MFA | TOTP via `otplib` |
| Logging | `pino` with redact paths |
| Dev hosts | Caddy with local TLS: `app.mori.localhost`, `invite.mori.localhost` |
| Prisma schema | Multi-file: `packages/database/prisma/schema/<module>.prisma` |
| Tests | Vitest (unit + integration on real Postgres/Redis), Playwright (E2E), fast-check (money/tiers), k6 (load) |
| Import boundary | `dependency-cruiser`: `apps/web` must not import `packages/database` |
| CI | GitHub Actions |

## 3. Hard rules for every agent (put in every PR description)

1. No payments: no entity/status/SDK/"Pay/Deposit/Paid" copy (INV-13, TC-125).
2. Next.js never touches Prisma; business rules/authz/pricing live in NestJS (ADR-02).
3. Private queries filter by owner/assignment in the `where`; inaccessible resource -> 404.
4. Commands marked **I** in spec 11.3 require `Idempotency-Key`; **Vsn** require `expectedVersion`.
5. Money = `BigInt` VND; JSON decimal strings; never float.
6. Proof/quote/publication/order snapshots are immutable; changes create new rows.
7. Guest/invitation routes and media: `Cache-Control: private, no-store`; public DTO allowlist only.
8. Lock in the order of spec 9.7; never hold a transaction while awaiting AI/email/storage.
9. Never claim a test passed without running it; integration tests use real Postgres/Redis.
10. Code files < 200 lines; kebab-case file names.
11. Each PR/ticket report lists: ticket, BR/UR, affected INV, TCs passed.
12. Missing real input (prices, print specs, assets, domains, AI provider, legal copy) -> use fixtures flagged `isFixture`, never invent; stop and report on spec contradictions or incompatible versions.

## 4. Parallelism rules

- Only one agent creates Prisma migrations at a time; on rebase, delete own migration and regenerate.
- `docs/api/openapi.json` is generated (`pnpm api:generate`); never hand-edit.
- Each lane owns `apps/api/src/modules/<m>/**`, `apps/web/src/features/<m>/**`, `packages/database/prisma/schema/<m>.prisma`. Shared files (`packages/ui`, `packages/contracts/common`) change in a dedicated ticket.
- Lanes: after P01 -> P02 (catalogue/UI) || MORI-020..022 (media/worker). MORI-023/024 wait for MORI-013 tokens. After P03 -> Digital lane (P04->P05) || Studio lane (P06->P07). After P06 -> P08 || P09.
- Human gates: MORI-003 design, 018 real content, 036 pilot, 049/054 printer, 058 AI eval, 062 security, 066 launch.

## 5. Phase work packages (summary; detail lives in phase-XX files)

- **P00** (001-006; spec 1-4, 9.1, 21, 22): agent docs hub + ADRs + launch-inputs; version spike (pnpm workspace, Nest ESM `/health/live|ready`, Next standalone, Prisma 7 + `@prisma/adapter-pg` one table, multi-stage Dockerfiles, compose with postgres:17); contract spike (one Zod schema -> Nest validation + OpenAPI + web type, `api:generate`/`api:check-drift`); design direction prototypes UI-01/03/10/12/22 (human-gated); data-model review vs INV-01..16.
- **P01** (007-012; spec 9.2-9.7, 11.1-11.2, 11.5, 15.2, 16.4, 17): full layout 9.4, strict TS, lint, scripts 17.4, dependency-cruiser; Compose dev (proxy, web, api, worker, postgres, redis appendonly+noeviction, minio, mailpit, clamav profile, migrate) with healthchecks; `packages/config` Zod env + `*_FILE`; Prisma identity + operations schemas; `apps/api/src/common` (request-id, problem-details, idempotency interceptor, audit, policy guard, trusted-host + origin/Fetch-Metadata, CSRF, Redis rate limit, pino redaction); `/auth/*`, `/me*`; `__Host-mori_session`; staff MFA + recent auth; GitHub Actions CI (lint, typecheck, unit, integration with services, build, drift, gitleaks, trivy). Tests TC-001..012, 103, 112, 113.
- **P02** (013-018; spec 8.1-8.6, 8.11-8.12, 3.3, 10.2 catalogue, 10.6, 16.2-16.3): `packages/ui` tokens/primitives/fonts/i18n; catalogue schema; pure BigInt pricing in `packages/domain/pricing` + fast-check; catalogue + estimate APIs; UI-01/02/03/19; deterministic dev seed 24 paper (12 flat/12 bi-fold) + 6 digital fixtures; content validation. Tests TC-013..020, 024, 128, 129.
- **P03** (019-024; spec 7.1-7.2, 9.7, 10.2, 14, 15.1): projects/assignments; upload sessions (presigned staging key, complete verifies bytes); worker processors (sniff, scan, sharp re-encode/strip EXIF/derivatives, immutable final key); task ledger + outbox + BullMQ + reconciler; `packages/invitation-renderer` 3 families x 2 presets; editor UI-12 with 800 ms autosave/CAS/conflict UI. Tests TC-044, 045, 049, 058-062, 105-108, 135.
- **P04** (025-030; spec 6.5, 7.3-7.7, 7.10, 8.9, 11.3 public, 15.3): PublishInvitation use case with lock order; guest host SSR no-store + host middleware + proxy deny rules; PublicInvitationView allowlist; media gateway; passcode/guest fragment grants/access epoch/rotate/revoke; share panel + QR + safe OG; RFC 5545 ics, directions, music. Tests TC-043, 046-057, 064, 121-124, 127, 130-132, 137, 138.
- **P05** (031-036; spec 7.5, 7.8-7.9, 15.4, 18.5): RSVP schema + CHECK constraints; SubmitRsvp with lock order and real concurrency tests; owner dashboard UI-14; CSV export with formula escaping; moderation UI-20, retention jobs; pilot feature flags. Tests TC-065..088, 133, 134.
- **P06** (037-042; spec 5.1-5.2, 6.1-6.2, 8.7, 8.10, 13.2): design schema; pure state machines in `packages/domain/state-machines`; sandboxed PDF render + manifest hash; UI-09/10/16/17; approval binds manifest/scope hash. Tests TC-026..032, 101.
- **P07** (043-048; spec 3.3, 6.3-6.4, 10.4-10.5, 11.4): quotes/orders/fulfillment schema with partial unique indexes; PlaceOrder use case; UI-11/18; holds/rework/cancellation requests; notifications. Tests TC-021..023, 025, 033..042, 125, 139.
- **P08** (049-054; spec 13): ProductionProfile entry (human data); lazy three/R3F flat + bi-fold; fallbacks; preflight. Tests TC-097..102.
- **P09** (055-060; spec 12): typed preferences, deterministic ranking 40/30/20/10, AiProvider (disabled/fake/real), quotas/reservations, circuit breaker, 60-prompt eval, staff assist, chat UI. Tests TC-089..096.
- **P10** (061-066): WAL backups + restore drill, security review, k6 + a11y, runbooks, launch rehearsal. Tests TC-104, 109-111, 114-116, 136, 140.

## 6. Agent prompt template

```
Ticket: MORI-0xx - <title>
Work context: /Users/duchaichu/Documents/GitHub/MORI-WEDDING-STUDIO
Plans: ./plans/261031-mori-v1/   Reports: ./plans/261031-mori-v1/reports/
Read first: AGENTS.md, this brief, spec sections <x>, INV-.., ADR-..
Done dependencies: MORI-0aa, MORI-0bb
Owned paths: ...   Do not modify: ...
Endpoints / UI states / TCs: copied from spec 11.3 / 8.5 / 18
Done when: completion evidence in spec 19.3 + DoD 19.4, commands actually run
Report: files changed, commands run with results, open issues, blockers
```

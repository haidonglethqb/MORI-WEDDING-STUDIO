# Phase 00 - Decisions and compatibility spike

## Context Links

- Spec `docs/MORI_PROJECT_PLAN.md`: 1 (executive decision), 2 (requirement map BR-01..17, UR-01..03), 3 (scope, roles, no-payment rules, defaults), 4 (INV-01..16), 6 (state machines), 9.1 (version policy), 9.4 (layout), 9.6 (contracts), 10 (data model), 11.1/11.5 (API envelope, errors), 19.3 P00, 21 (risks, launch inputs), 22 (ADR-01..15)
- Brief: [handoff-brief.md](./handoff-brief.md) §1 environment, §2 accepted defaults, §3 HR-1..12
- Docs hub being built concurrently: `docs/system/README.md` (link new docs from it; do not rewrite it)

## Overview

- Priority: P1 (blocks everything). Status: Completed.
- Turn scope, architecture, versions, contracts, and real-vs-fixture inputs into recorded decisions plus a minimal pinned build that proves the stack works together.
- Exit gate: approved ADRs, compatible minimal Docker build, no unresolved architecture blocker.

## Key Insights

- Repo has docs + agent kit only; monorepo lives at repo root (spec 9.4 shows `mori/`; brief overrides).
- Nest 12 CLI wants Node >= 24.15; local Node is 24.14.0. Spike must build inside `node:24` images or pin a compatible CLI and record it.
- Prisma 7 needs `prisma.config.ts` + `@prisma/adapter-pg`; Prisma 8 is RC: do not use (ADR-10).
- Contract approach (Zod in `packages/contracts` -> `nestjs-zod` -> OpenAPI -> web types) is the riskiest integration; prove it with one schema before P01.
- Human gates in this phase: MORI-003 (design direction), MORI-006 (input register).

## Requirements

- Functional: requirement matrix (BR/UR -> tickets -> TCs), ADR-01..16 recorded, pinned version matrix, minimal API/web/db Docker build, one end-to-end contract, design reference layouts, data-model review vs INV-01..16, launch-input register.
- Non-functional: exact versions pinned (no `latest`), reproducible build, no secrets in repo, all docs English.

## Architecture

- Spike shape: `pnpm-workspace.yaml` -> `apps/api` (Nest ESM, `/health/live`, `/health/ready` checking Postgres), `apps/web` (Next 16 standalone, one page calling API server-side), `packages/database` (Prisma 7 multi-file schema, one `spike_ping` table, adapter-pg), `packages/contracts` (one Zod schema), compose with `postgres:17`.
- Contract pipeline: Zod schema -> Nest validation pipe -> OpenAPI JSON (`docs/api/openapi.json`, generated) -> `packages/api-client` types -> web import. `api:check-drift` fails when generated output differs.

## Related Code Files

Create (spike; P01 MORI-007 hardens and may replace):
- `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `tsconfig.base.json`, `.nvmrc`
- `apps/api/{package.json,nest-cli.json,src/main.ts,src/app.module.ts,src/health/**}`
- `apps/web/{package.json,next.config.ts,src/app/page.tsx,src/app/layout.tsx}`
- `packages/database/{package.json,prisma.config.ts,prisma/schema/base.prisma,prisma/schema/spike.prisma,src/client.ts}`
- `packages/contracts/src/spike/**`, `packages/api-client/**`
- `infra/docker/{api.Dockerfile,web.Dockerfile}`, `compose.yaml`, `compose.dev.yaml`
- Docs: `AGENTS.md` (modify, append MORI section), `docs/requirements/requirement-matrix.md`, `docs/adr/ADR-01..16-*.md`, `docs/architecture/version-matrix.md`, `docs/architecture/data-model-review.md`, `docs/launch-inputs.md`, `docs/design/reference-layouts/**`

## Ticket Table

| Ticket | Work | Agent | Depends | Owned paths | Endpoints (11.3) | UI (8.5) | TCs | Completion evidence (19.3) |
|---|---|---|---|---|---|---|---|---|
| MORI-001 | BR/UR + exclusions -> tracked scope | docs-manager | None | `docs/requirements/**`, `AGENTS.md` (MORI section) | - | - | TC-125 (scope only) | Requirement matrix + no-payment exclusion approved |
| MORI-002 | Approve monolith, ownership, publication, order boundaries | docs-manager | 001 | `docs/adr/ADR-01..06*.md`, `ADR-16*.md` | - | - | - | ADR-01..06 recorded |
| MORI-003 | Screen compositions, tokens, typography, content direction | ui-ux-designer + **human** | 001 | `docs/design/**` | - | UI-01, 03, 10, 12, 22 | TC-117 (prep) | Reference layouts reviewed at 390/1440 px |
| MORI-004 | Spike Node/Next/Nest/Prisma/PG versions, ESM build | fullstack-developer | 001 | root workspace files, `apps/api/**`, `apps/web/**`, `packages/database/**`, `packages/contracts/src/spike/**`, `packages/api-client/**`, `infra/docker/**`, `compose*.yaml`, `docs/architecture/version-matrix.md` | `/health/live`, `/health/ready` | - | TC-103 (smoke) | Minimal API/db/web Docker build; pinned matrix |
| MORI-005 | Review data model, state machines, invariants, API envelope | planner/docs-manager | 002, 004 | `docs/architecture/data-model-review.md`, `docs/architecture/migration-outline.md`, `docs/adr/ADR-07..15*.md` | all (review) | - | - | Migration outline + contracts support every INV |
| MORI-006 | Separate real inputs from fixtures; launch blockers | docs-manager + **human** | 003, 005 | `docs/launch-inputs.md` | - | - | - | Input register: prices, print specs, assets, domains, policies |

## Agent Briefs

### MORI-001 - Requirement matrix
- Build table: BR-01..17, UR-01..03 (spec 2.2) -> phase -> tickets -> TCs (use spec 20.2 as seed; fill ticket IDs from 19.3).
- Add exclusions table from spec 3.1 "Later" + "Not required" rows; payments explicitly excluded (BR-14, INV-13, ADR-06).
- Add "forbidden vocabulary" list for TC-125 grep: Pay now, Payment successful, Deposit, Refund, Paid, Outstanding balance, Subscription active, provider SDK names (stripe, paypal, vnpay, momo, zalopay).
- Append MORI section to `AGENTS.md`: link spec, brief, matrix, ADR index, HR-1..12. Keep existing kit content.
- Link the matrix from `docs/system/README.md` only via a one-line PR note to that doc's owner (do not edit concurrently).
- Done: matrix reviewed by user; every BR/UR has >= 1 ticket and >= 1 TC or explicit human evidence.

### MORI-002 - Boundary ADRs
- Write ADR-01..06 (spec 22) using context/decision/consequences/rejected alternatives; cite spec sections.
- ADR-16 (brief §2): Zod contracts + `nestjs-zod` + generated OpenAPI; fallback = thin custom Zod pipe. Status "proposed" until MORI-004 contract spike passes.
- Record brief §2 defaults as ADR addenda (sessions custom, Argon2id params, pino, Caddy hosts, Vitest/Playwright/fast-check/k6, dependency-cruiser, GitHub Actions).
- Invariants to anchor: INV-02, 03, 04, 05, 06, 13, 16.
- Done: ADR index file `docs/adr/README.md` listing status per ADR.

### MORI-003 - Design direction (HUMAN-GATED)
- Agent CAN prepare: token draft from spec 8.2 colours / 8.3 type scale, static HTML/TSX reference layouts for UI-01, UI-03, UI-10, UI-12, UI-22 at 390 + 1440 px, screenshots, long Vietnamese name samples (TC-118 fixtures), anti-slop checklist (8.12) self-review.
- Use dev placeholder logo/fonts labelled as such (spec 21.2); no invented testimonials/metrics/prices.
- Store under `docs/design/reference-layouts/<ui-id>/`; screenshots `docs/design/screenshots/`.
- Human MUST: review and approve compositions, typography, palette; record approval note in `docs/design/README.md`.
- MORI-013 cannot start until approval recorded.

### MORI-004 - Version spike
- `corepack enable`; pin `packageManager` pnpm version; exact versions for node image (digest), next 16.x, react, nest 12.x, prisma 7.x + `@prisma/client` + `@prisma/adapter-pg`, typescript, zod, nestjs-zod.
- Nest ESM app with `/health/live` (process) and `/health/ready` (SELECT 1 on Postgres) (spec 17.6).
- Prisma 7: `prisma.config.ts`, multi-file schema dir, one `SpikePing` model, generated client at build time; adapter-pg direct connection.
- Next 16 standalone output; server component calls API via `API_INTERNAL_ORIGIN`; verify monorepo output tracing.
- Contract spike: one Zod schema (e.g. `PingRequest`) validated in Nest, emitted to `docs/api/openapi.json` via `pnpm api:generate`; `pnpm api:check-drift` fails on manual edit; web imports derived type.
- Multi-stage Dockerfiles (non-root); `compose.yaml` + `compose.dev.yaml` with `postgres:17` healthcheck, api, web, migrate one-shot.
- Docker commands need `required_permissions: ["all"]`; Docker VM has ~4 GB RAM.
- Record Nest CLI vs Node 24.14 result; any incompatible version -> stop and report (HR-12).
- Done: `docker compose up --build` healthy, web page renders API response, version matrix committed.

### MORI-005 - Data model and contract review
- Walk every INV-01..16 -> entity/constraint/lock/test that enforces it (spec 4, 9.7, 10.2, 10.4); gaps listed explicitly.
- Produce migration outline by module order: identity/operations (P01), catalogue/pricing (P02), projects/media/tasks/invitations (P03), publication (P04), rsvp (P05), design (P06), quotes/orders/fulfillment (P07), production profile (P08), assistance (P09).
- Confirm state machines (spec 6) map to pure transition tables for `packages/domain/state-machines`.
- Confirm envelope: problem-details (11.5), idempotency record shape, `expectedVersion`, cursor pagination, money as decimal string.
- List endpoints missing from 11.3 that tickets need (see Risk Assessment) and assign each to an owning ticket.
- Write ADR-07..15.

### MORI-006 - Input register (HUMAN-GATED)
- Agent CAN prepare: `docs/launch-inputs.md` table from spec 21.2 rows (logo/fonts, 30 designs, prices/tax/shipping/min qty, printer profiles, domains/email/storage, privacy/terms/no-payment wording, AI provider, operational roles, hosting/backup budget) with owner, interim fixture behaviour, blocking ticket (018, 049, 054, 058, 065).
- Define `isFixture` flag convention for seeds/content.
- Human MUST: confirm owners and which inputs exist today.

## Implementation Steps

1. MORI-001 matrix (docs-manager).
2. In parallel: MORI-002 ADRs, MORI-003 design prep, MORI-004 spike.
3. MORI-005 after 002 + 004 (uses actual pinned versions).
4. MORI-006 after 003 approval + 005.
5. Run phase gate: ADRs approved, spike green, no open blocker.

## Todo List

- [x] MORI-001 requirement matrix + AGENTS.md section
- [x] MORI-002 ADR-01..06 + ADR-16
- [x] MORI-003 reference layouts prepared; human approval recorded
- [x] MORI-004 pinned version matrix + Docker build green
- [x] MORI-005 data-model review + migration outline + ADR-07..15
- [x] MORI-006 input register; human confirmation

## Success Criteria

- `docker compose -f compose.yaml -f compose.dev.yaml up --build` -> api/web/postgres healthy (command actually run, output recorded in report).
- `pnpm api:generate && pnpm api:check-drift` pass; deliberate schema edit makes drift check fail.
- Every INV has an enforcement mechanism listed; every BR/UR mapped.

## Risk Assessment

- Nest/Node version floor mismatch -> build in container; pin CLI. Record.
- `nestjs-zod` incompatible with Nest 12 -> thin custom pipe + `zod-to-openapi`; update ADR-16.
- Spec 9.4 `mori/` root vs repo root -> brief wins; note in ADR-01.
- Design approval latency blocks P02 UI (013) -> start backend tickets (016) and media lane meanwhile.

## Security Considerations

- No real secrets in `.env.example`; spike uses dev-only credentials via `*_FILE` where cheap.
- Dockerfiles non-root from the start.

## Next Steps

- P01 MORI-007 starts on 004; 009 needs 005 + 008.
- Hand ADR list + migration outline to P01 agents.

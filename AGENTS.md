# Agent Guide: MORI v1

This file tells agents how to execute the MORI Wedding Studio specification.

**Before starting:** Read `docs/MORI_PROJECT_PLAN.md` (the spec) and then jump to the relevant system documentation folder below.

## Hard Rules (in every PR)

From handoff-brief section 3:

1. **No payments:** No entity/status/SDK/"Pay/Deposit/Paid" copy (INV-13, TC-125)
2. **Next.js never touches Prisma:** Business rules/authz/pricing live in NestJS (ADR-02)
3. **Private queries filter by owner/assignment** in the `where`; inaccessible → 404
4. Commands marked **I** in spec 11.3 require `Idempotency-Key`; **Vsn** require `expectedVersion`
5. **Money = `BigInt` VND;** JSON decimal strings; never float
6. **Snapshots immutable:** Proof/quote/publication/order changes create new rows
7. **Cache-Control: `private, no-store`** for guest/invitation routes and media; public DTO allowlist only
8. **Lock order per spec 9.7;** never hold a transaction while awaiting AI/email/storage
9. Never claim a test passed without running it; use real Postgres/Redis
10. **Code files < 200 lines;** kebab-case file names
11. **PR/ticket report lists:** ticket, BR/UR, affected INV, TCs passed
12. **Missing real input** (prices, domains, AI provider) → use fixtures flagged `isFixture`, stop and report contradictions

## Parallelism Rules

From handoff-brief section 4:

- Only one agent creates Prisma migrations; on rebase, delete own and regenerate
- `docs/api/openapi.json` is generated (`pnpm api:generate`); never hand-edit
- **Lanes own:** `apps/api/src/modules/<m>/**`, `apps/web/src/features/<m>/**`, `packages/database/prisma/schema/<m>.prisma`
- Shared files (`packages/ui`, `packages/contracts/common`) change in dedicated ticket
- Execution order: P01 → (P02 ∥ P03) → (P04 ∥ P06) → (P05 ∥ P07) → P08 ∥ P09 → P10
- Human gates: MORI-003 design, 018 content, 036 pilot, 049/054 printer, 058 AI, 062 security, 066 launch

## Documentation Navigation

**Canonical source:** `docs/MORI_PROJECT_PLAN.md` (spec sections 1–24)  
**Active plan:** `plans/261031-mori-v1/` (phases, work packages, phase detail files)

Start with the system documentation hub:

### `docs/system/` Hub

| Domain | Purpose | Link |
| --- | --- | --- |
| **Architecture** | Topology, modules, layout, concurrency, versioning | `docs/system/architecture/` |
| **Authentication** | Sessions, roles, identity, MFA | `docs/system/authentication/` |
| **Business Rules** | Scope, actors, invariants, state machines, defaults | `docs/system/business-rules/` |
| **Database** | Conventions, entities, constraints, snapshots | `docs/system/database/` |
| **Data Flows** | Happy paths, invitation publication, RSVP | `docs/system/data-flows/` |
| **Backend** | API conventions, endpoints, comms | `docs/system/backend/` |
| **Security** | Threat model, privacy, media uploads | `docs/system/security/` |
| **Frontend** | Design tokens, screens, compositions, a11y | `docs/system/frontend/` |
| **Deployment** | Services, env, commands, runbooks | `docs/system/deployment/` |
| **Testing** | Test catalogue, release policy | `docs/system/testing/` |
| **Workers** | Background tasks, AI, 3D proofs | `docs/system/workers/` |

### ADRs and Decisions

- **ADR index:** `docs/adr/README.md`
- ADRs 01–15 capture spec section 22 rationale
- ADR-16 & 17 capture accepted technical defaults (handoff-brief section 2)

### Launch Inputs Register

**`docs/launch-inputs.md`** — Spec section 21.2: What must be supplied by the customer/business before production.

## Ticket Template

```
Ticket: MORI-0xx - <title>
Work context: /Users/duchaichu/Documents/GitHub/MORI-WEDDING-STUDIO
Plans: ./plans/261031-mori-v1/   Reports: ./plans/261031-mori-v1/reports/

Read first: AGENTS.md, handoff-brief, spec sections <x>, INV-xx, ADR-yy

Done dependencies: MORI-0aa, MORI-0bb
Owned paths: [...]   Do not modify: [...]

Endpoints / UI states / TCs: [from spec 11.3 / 8.5 / 18]

Done when: completion evidence in spec 19.3 + DoD 19.4, commands run
Report: files changed, commands, issues, blockers
```

---

**Created:** 2026-10-31 | See `docs/adr/` for architectural rationale.

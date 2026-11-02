# Overview and Topology

**Spec:** 1, 9.2–9.3 | See `MORI_PROJECT_PLAN.md` sections 1 (Executive decision), 9.2–9.3 (Architecture overview)

MORI is a **studio-led wedding stationery platform** with three distinct user surfaces:

| Surface | Purpose | Tech |
| --- | --- | --- |
| **Storefront** | Browse, filter, request designs; understand materials; see pricing | Next.js |
| **Workspace** | Customer and staff: customize, proof-review, quotes, orders, invitations | Next.js + React |
| **Guest invitation** | Read event, RSVP, view media; no account required | Next.js server-render |

## Execution Model

- **One monorepo** at repo root (not `mori/` subfolder)
- **One Next.js app** (`apps/web`): storefront + workspace + public invitations
- **One NestJS backend** (`apps/api`): all business logic, auth, validation, state machines
- **One PostgreSQL database** (`packages/database`): single source of truth
- **One Worker process** (same codebase as NestJS): background tasks, PDF, 3D, AI
- **Docker Compose** dev and test deployment; Docker multi-stage production builds

## Key Principle

**Next.js never touches Prisma.** All business rules, authorization, pricing, and state transitions happen in NestJS. Next.js is a presentation and server-rendering layer. [ADR-02]

## Related

- [Monorepo layout](./monorepo-layout.md) — Folder structure
- [Backend modules](./backend-modules.md) — NestJS internal organization
- [Frontend state](./frontend-state.md) — Client-side data patterns
- [Concurrency and locking](./concurrency-and-locking.md) — Transaction model

---

**Related invariants:** INV-01 (authorization), INV-02 (immutable publication), INV-04 (snapshot binding), INV-10 (AI read-only), INV-13 (no payment).

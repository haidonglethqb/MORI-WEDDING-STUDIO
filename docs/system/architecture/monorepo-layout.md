# Monorepo Layout

**Spec:** 9.4 | See `MORI_PROJECT_PLAN.md` section 9.4 (Repository structure)

```
repo root (MORI-WEDDING-STUDIO)
├── apps/
│   ├── api/               # NestJS backend + worker entry
│   │   ├── src/modules/   # Modular business logic (one folder per domain)
│   │   ├── src/common/    # Shared interceptors, guards, utils
│   │   └── src/worker.ts  # Background task entry point
│   └── web/               # Next.js storefront + workspace + public invitations
│       └── src/
│           ├── app/       # Next.js app router
│           ├── features/  # Feature-specific components (one folder per domain)
│           └── (ui, lib, etc.)
├── packages/
│   ├── database/          # Prisma schema + migrations
│   │   └── prisma/
│   │       ├── schema/    # Multi-file schema (one per domain)
│   │       └── migrations/
│   ├── contracts/         # Zod schemas (shared API contracts)
│   │   └── src/common/
│   ├── ui/                # Shared React components, tokens, i18n
│   ├── config/            # Environment validation (Zod)
│   ├── domain/            # Pure TS domain logic
│   │   ├── pricing/
│   │   ├── state-machines/
│   │   └── ...
│   └── invitation-renderer/ # Template engine for invitations
├── docs/                  # Documentation (this hub)
├── .claude/               # Agent rules, skills
├── plans/                 # Work packages and phase plans
├── docker-compose.yml     # Dev/test services
├── compose.prod.yml       # Production overlay (if separate)
├── Dockerfile             # Multi-stage for api + worker
├── AGENTS.md             # Agent guide
├── CLAUDE.md             # Quick start
└── ...
```

## Ownership Boundaries

Each lane owns its domain folder within `apps/api/src/modules/`, `apps/web/src/features/`, and `packages/database/prisma/schema/`.

Shared paths (modified in dedicated tickets):
- `packages/ui/` (components, tokens)
- `packages/contracts/common/` (base schemas)
- `apps/api/src/common/` (shared interceptors)
- `packages/config/`

**Rule:** Parallelism and independence require strict folder ownership; do not cross-import between lanes except through shared packages.

## Related

- [Backend modules](./backend-modules.md) — NestJS internal structure
- [Concurrency and locking](./concurrency-and-locking.md) — Transaction model during parallel work

---

**Related hard rule:** Code files < 200 lines; keep concerns focused.

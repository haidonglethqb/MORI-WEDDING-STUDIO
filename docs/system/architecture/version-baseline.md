# Version Baseline

**Spec:** 9.1 | See `MORI_PROJECT_PLAN.md` section 9.1 (Required stack)

## Pinned Technology Matrix

| Component | Version | Purpose | Status |
| --- | --- | --- | --- |
| Node.js | 24.14.0+ | Runtime | Pinned (Corepack) |
| pnpm | 9.x+ | Monorepo package manager | Corepack |
| Next.js | TBD | SSR + API routes | P00 spike |
| NestJS | TBD | Backend framework | P00 spike |
| TypeScript | TBD | Language | P00 spike |
| Prisma | 7.x + pg adapter | ORM + migrations | P00 spike |
| PostgreSQL | 17+ | Database | Docker Compose |
| Redis | Latest | Cache + BullMQ | Docker Compose, appendonly+noeviction |
| MinIO | Latest | S3-compatible storage | Docker Compose |
| Mailpit | Latest | Dev/test email | Docker Compose |
| ClamAV | Latest | Virus scanning | Docker Compose (profile: `scan`) |
| Docker | 29.2+ | Containerization | Required |
| Compose | 5.0+ | Multi-container orchestration | Required |

## Decision

**TBD** entries are set during P00 version spike. Once pinned, breaking updates require a new spec section and ADR vote.

## Related

- [Compose services](../deployment/compose-services.md) — Service versions in dev
- [Backend modules](./backend-modules.md) — NestJS structure
- [Commands and CI](../deployment/commands-and-ci.md) — Build scripts

---

**P00 spike output:** Confirmed versions, build scripts, health checks, Dockerfile stages.

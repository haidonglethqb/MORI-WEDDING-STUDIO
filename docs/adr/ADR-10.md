# ADR-10: Pinned Version Matrix (P00 Spike Complete)

**Context:** MORI requires explicit version pinning for reproducibility and coordinated upgrades. P00 version spike (MORI-004, WP-00c) determined exact pinned versions from evaluation and testing.

**Decision:** All versions pinned per P00 version spike report (2026-10-31). Breaking updates require a new ADR. See `docs/system/architecture/version-baseline.md` for current matrix.

| Component | Version | Notes |
| --- | --- | --- |
| Node.js (local) | 24.14.0 | `.nvmrc`; Docker: 24.22.2 |
| Next.js | 16.4.3 | Stable App Router |
| React | 19.3.1 | Peer of Next.js 16 |
| NestJS | 12.3.2 | Core + CLI + testing |
| @swc/core | 1.16.21 | ESM builder |
| @swc/cli | 0.8.2 | Latest (0.5.23 no longer published) |
| Prisma | 7.10.1 | Dist-tag `prev` (8.x RC skipped) |
| @prisma/adapter-pg | 7.10.1 | Driver adapter |
| PostgreSQL | 17-alpine | Latest LTS |
| TypeScript | 5.9.3 | Latest 5.x (7.x skipped) |
| pnpm | 12.16.1 | Locked in package.json |
| Zod | 4.6.7 | Latest |
| Vitest | 5.0.5 | Latest |
| @asteasolutions/zod-to-openapi | 9.1.0 | Zod → OpenAPI |

**Consequences:**
- Reproducible builds, deterministic CI
- pnpm 12 requires `--allow-build` approvals in CI
- Prisma 8, TypeScript 7, NestJS 13 deferred to future phases

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** P00 version spike report sections 1–2, Spec 9.1, handoff-brief section 1

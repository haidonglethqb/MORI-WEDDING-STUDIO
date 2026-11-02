# Architecture Decision Records

**Index:** Architectural decisions for MORI v1 implementation. Each ADR captures context, decision, rejected alternatives, and consequences. All ADRs below are **Accepted** with baseline date **2026-10-31**.

| ADR | Title | Spec section(s) |
| --- | --- | --- |
| [ADR-01](./ADR-01.md) | Modular monolith over microservices | 1.2, 9.2–9.3 |
| [ADR-02](./ADR-02.md) | NestJS owns business logic, Next.js is presentation | 1.2, 9.2–9.3, 11 |
| [ADR-03](./ADR-03.md) | PostgreSQL-backed opaque sessions + scoped guest grants | 11.2, 3.2, 7.5 |
| [ADR-04](./ADR-04.md) | Immutable proof/quote/order/publication snapshots | 6.2–6.3, 10.4–10.6 |
| [ADR-05](./ADR-05.md) | Structured invitation editor (not arbitrary canvas) | 6.5, 7.1–7.2 |
| [ADR-06](./ADR-06.md) | No payment subsystem or payment-gated states | 3.3 |
| [ADR-07](./ADR-07.md) | Private media with no-store dynamic policy checks | 7.6–7.7, 15.3 |
| [ADR-08](./ADR-08.md) | Task ledger/outbox + Redis BullMQ | 14.2–14.4 |
| [ADR-09](./ADR-09.md) | Deterministic catalogue before AI wording | 12 |
| [ADR-10](./ADR-10.md) | Pinned version matrix (P00 spike complete) | 9.1 |
| [ADR-11](./ADR-11.md) | One customer owner per workspace in v1 | 3.2, 1.2 |
| [ADR-12](./ADR-12.md) | Flat/bi-fold launch; printer-gated tri-fold | 1.2, 8, 13, 16 |
| [ADR-13](./ADR-13.md) | Manual fulfillment + carrier updates (no premature integration) | 3.4, 5.1, 6.4 |
| [ADR-14](./ADR-14.md) | Single-host Compose first; measured scale-up later | 17 |
| [ADR-15](./ADR-15.md) | Self-service no-payment publishing pilot with small quotas | 3.4, 7.5 |
| [ADR-16](./ADR-16.md) | Shared Zod contracts + custom validation pipe (nestjs-zod incompatibility) | 9.6, P00 spike 2.3 |
| [ADR-17](./ADR-17.md) | Technical defaults (TanStack Query, react-hook-form, etc.) | Handoff-brief 2, P00 spike |

---

**All ADRs trace to:**
- **Spec:** `docs/MORI_PROJECT_PLAN.md` sections 1–22 (source of truth)
- **P00 spike:** `plans/261031-mori-v1/reports/p00-version-spike-report.md` (version pinning, compatibility findings)
- **Handoff-brief:** `plans/261031-mori-v1/handoff-brief.md` (hard rules, technical defaults, parallelism)

**When to create new ADRs:**
- Breaking changes to architecture or major dependencies
- New payload/commercial/platform decisions
- Team consensus on deferred alternatives

**Review process:** ADRs are reviewed during code review and updated if implementation reveals gaps.

# ADR-08: PostgreSQL Task Ledger/Outbox Plus Redis BullMQ

**Context:** Background work (media scan, PDF render, email) must survive queue failure. If Redis is lost, tasks must not be duplicated or forgotten.

**Decision:** Every task is recorded in `TaskLedger` (database, append-only, immutable) with status. Durable side effects (outbox events) are appended in the same transaction as state mutations. BullMQ reads from `TaskLedger` and retries are idempotent (TaskLedger ID is the idempotency key).

**Rejected alternatives:**
- Redis-only queue: no durability; queue loss loses tasks
- Database polling only: high latency, high load

**Consequences:**
- Task recovery after outage
- Duplicate detection is straightforward (check TaskLedger ID)
- Higher operational complexity (two systems)
- Acceptable performance for pilot scale

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 14.2–14.4, INV-11 (durability), ADR-01 (modular monolith)

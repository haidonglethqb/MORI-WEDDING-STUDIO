# Concurrency and Locking

**Spec:** 9.7 | See `MORI_PROJECT_PLAN.md` section 9.7 (Transaction order and row locking)

MORI uses PostgreSQL row locks to enforce safe concurrent state updates and prevent race conditions.

## Global Lock Order

When a transaction needs multiple rows, **always lock in ascending ID order** to prevent deadlock:

1. **Invitation** (if needed)
2. **Event** (all affected, ascending ID)
3. **Party** / **Response** (ascending ID)

Never acquire locks in reverse order or out of sequence across different transaction types.

## Key Scenarios

### RSVP Submission (Spec 7.9)

```sql
BEGIN;
LOCK TABLE invitations FOR UPDATE WHERE id = ?;    -- Quota check
LOCK TABLE events FOR UPDATE WHERE id IN (...);    -- Capacity check
LOCK TABLE responses FOR UPDATE WHERE id = ?;      -- Upsert response
-- Recheck publication, counts, deadline
-- Upsert + audit
COMMIT;
```

### Publication (Spec 7.3)

```sql
BEGIN;
LOCK TABLE quota_rows FOR UPDATE WHERE user_id = ?;
LOCK TABLE invitations FOR UPDATE WHERE id = ?;
-- Recheck draft version, prerequisites
-- Insert revision, update pointer
COMMIT;
```

## Rule

**Never hold a transaction while awaiting AI, email, storage, or external providers.** Complete provider calls before or after the transaction. Use durable task records (outbox pattern) for background work. [Hard rule #8]

## Related

- [Overview and topology](./overview-and-topology.md) — Modular monolith
- [State machines](../business-rules/state-machines.md) — Transition guards
- [Constraints & snapshots](../database/constraints-and-snapshots.md) — Unique indexes

---

**Violation detection:** Deadlock errors in CI → code review required before merge.

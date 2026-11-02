# Background Tasks

**Spec:** 14.2–14.4 | See `MORI_PROJECT_PLAN.md` sections 14.2–14.4 (Durable background work, BullMQ, outbox)

## Architecture

**Task ledger** (database) + **BullMQ** (Redis queue) + **Worker process** (same codebase as API)

[INV-11] **Database first:** Every task + side effect recorded in database before sending to external provider. If provider fails, the customer action is still complete (durable); task is retried.

## Task Ledger

```typescript
{
  id: UUID,
  taskType: enum, // SCAN_MEDIA, RENDER_PDF, GENERATE_OG, SEND_EMAIL, etc.
  ownerId: UUID,  // customer/account
  context: JSON,  // resourceId, invitationId, etc.
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED',
  result: JSON,   // output or error details
  retryCount: 0,
  createdAt: timestamptz,
  completedAt: timestamptz | null,
  expiresAt: timestamptz // manual cleanup TTL
}
```

## Outbox Pattern

State mutations append outbox records in the same transaction:

```typescript
BEGIN;
  -- Update business state
  UPDATE invitations SET published_revision_id = ? WHERE id = ?;
  
  -- Append durable tasks
  INSERT INTO task_ledger (task_type, context) VALUES
    ('GENERATE_OG', '{"invitationId": ...}'),
    ('SEND_EMAIL', '{"userId": ..., "type": "published"}');
  
COMMIT;
```

Worker polls `task_ledger` WHERE status='PENDING' and processes in order.

## BullMQ Queue

Worker adds tasks to BullMQ for concurrency control:

```typescript
await mediaQueue.add('scan-media', {
  taskId: '...',
  mediaId: '...',
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: true
});
```

On completion or max retries, update `task_ledger.status`.

## Task Types

| Task | Trigger | Timeout | Retry |
| --- | --- | --- | --- |
| SCAN_MEDIA | Upload completion | 30s | 3× |
| RENDER_PDF | Design revision submitted | 60s | 2× |
| GENERATE_OG | Invitation published | 30s | 2× (optional) |
| SEND_EMAIL | Events (verification, quote, shipment) | 10s | 5× |
| PROCESS_SHIPMENT | Order fulfillment update | 5s | 3× |

## Reconciliation

Worker reconciliation job (hourly):
- Find `PENDING` tasks older than 5 minutes (stuck jobs)
- Re-queue in BullMQ
- Log anomaly for staff review
- Never duplicate-process: task ledger `id` is idempotency key

## Related

- [Entities: media, ops, AI](../database/entities-media-ops-ai.md) — TaskLedger schema
- [Media uploads](../security/media-uploads.md) — Scanning as task
- [Outage & runbooks](../deployment/outage-backup-runbooks.md) — Task failure scenarios

---

**Principle:** Tasks are durable and idempotent. Customer action commits before task executes; failure is retryable.

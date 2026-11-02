# Entities: Media, Operations, AI

**Spec:** 10.2 | See `MORI_PROJECT_PLAN.md` section 10.2 (Data entities)

## Media & Uploads

**UploadSession** — Owned by user/context; `stagingKeyPrefix` (S3 presigned), `expiresAt`, quota (size/count), scanned status, final objects mapped.

**MediaAsset** — Owned by context (customer/revision); original digest, scan status (PENDING/SCANNED/QUARANTINED), processed derivatives (thumbnails, optimized), accessible contexts (revision/invitation refs). [INV-12]

**MediaDerivative** — Immutable: source digest, format (JPEG/WebP/etc.), dimensions, file key (S3 object), etag. Pre-generated for publication; blocks publication if missing.

## Operations & Tasks

**TaskLedger** — Append-only record of durable background work: task type (SCAN_MEDIA/RENDER_PDF/GENERATE_OG/etc.), owner/context, status (PENDING/IN_PROGRESS/COMPLETED/FAILED), result snapshot, retry count, `createdAt`, `completedAt`.

**OutboxEvent** — Task-triggered side effects (email, webhook, notification); durable until acknowledged by worker. Appended in same transaction as state mutation. [INV-11]

**BullMQJob** — Task names map to BullMQ queues; jobs reference `TaskLedger.id` for tracking. Retries reconcile against ledger; duplicate processing prevented.

## AI & Assistance

**AiConversation** — Owner/session, model choice (DISABLED/FAKE/REAL), total tokens used, quota remaining, `createdAt`, `expiresAt`.

**AiMessage** — Conversation + role (SYSTEM/USER/ASSISTANT), content, token count, `sentAt`. Read-only on AI write-side. [INV-10]

**AiPreference** — User setting: enabled (bool), model choice, feedback on suggestions (for improvement).

## Related

- [Security & media uploads](../security/media-uploads.md) — Scanning, derivative generation
- [Background tasks](../workers/background-tasks.md) — Task ledger, outbox, reconciler
- [AI assistance](../workers/ai-assistance.md) — Model, quota, policy

---

**Durability rule:** Every task + side effect recorded in database before sending to external provider. Failure of provider ≠ rollback of customer action. [INV-11]

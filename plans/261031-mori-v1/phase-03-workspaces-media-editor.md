# Phase 03 - Workspaces, media, and editor foundation

## Context Links

- Spec: 3.2 (actors), 3.4 (quotas: 3 drafts, 5 events, 30 photos), 5.3 (HP-03 steps 1-3), 6.5 (draft vs published fields), 7.1 (information model, field limits), 7.2 (draft save contract), 8.5 (UI-07, 08, 12, 15, 21), 8.8 (editor wireframe), 8.9 (renderer families), 9.5 (Projects, Media, Invitations, Operations), 9.7 (CAS, lock rules), 10.2 (WeddingProject, StaffAssignment, Address, MediaUploadSession, MediaAsset, MediaDerivative, media link tables, Invitation, InvitationDraft, BackgroundTask, OutboxEvent), 10.5 (asset deletion rules), 11.3 (`/projects*`, `/me/addresses*`, `/media/*`, `/projects/:id/invitations`, `/invitations/:id/{editor,draft,preview}`, `/admin/tasks*`), 14.1-14.3 (upload lifecycle, task catalogue, outbox), 15.1, 17.6 (outage behavior), 18.4, 18.7, 18.9
- Brief §2 (sharp, file-type, clamd, MinIO, Mailpit), §3 HR-3, 4, 6, 8, 9, 12; §4 lanes

## Overview

- Priority: P1. Status: Pending.
- Owner-scoped wedding workspaces + staff assignments; safe upload pipeline; durable tasks (ledger, outbox, BullMQ, reconciler); versioned invitation renderer (3 families x 2 presets); structured editor with autosave/CAS/conflict/offline states.
- Exit gate: save draft, process image, recover a failed worker task.

## Key Insights

- Brief lane says MORI-020..022 can run parallel to P02 right after P01, but spec 19.3 makes 020 depend on 019, and 019 depends on 013 (P02 tokens). Resolve: 019 is split into **019-backend** (schema, API, policy; deps 010) and **019-ui** (UI-07/08; deps 013). Media lane starts after 019-backend.
- Invitation schema has no explicit ticket; MORI-024 owns `Invitation` + `InvitationDraft` (publication fields stay nullable until 025).
- TC-061 (reference protection) is listed for 021 but references come from invitation revisions (025) and design revisions (039). 020/021 build the reference-check port; each linking ticket registers its link table and reruns TC-061.
- MailPort from 009 is rewired to `NotificationDelivery` tasks in 022.

## Requirements

- Functional: project CRUD (own), staff assignment with explicit permissions (incl. RSVP permission flag), address book; upload session -> complete -> quarantine -> scan -> process -> READY; derivatives; immutable final keys; GC sweep; ledger/outbox/reconciler; admin failed-task view/retry; renderer with schemaVersion + templateVersion; editor sections (identity, cover, events, story, gallery, music ref, RSVP config, contact, closing, sharing settings).
- Non-functional: image 10 MB / 40 MP; 250 MB per customer; 30 gallery photos; JPEG/PNG/WebP only; bounded worker concurrency; 5 retries exp backoff + jitter; tasks idempotent; autosave 800 ms; no sensitive draft in localStorage.

## Architecture

- Upload: `POST /media/uploads` (purpose, projectId, bytes, mime) -> presigned PUT to `staging/<random>` in MinIO -> `POST /media/uploads/:id/complete` (HEAD object: size/checksum) -> asset QUARANTINED + BackgroundTask `media.process` + OutboxEvent in one tx -> dispatcher enqueues BullMQ job (jobId = task id) -> worker claims task row (lease), sniff/scan/decode/re-encode/strip EXIF/derive -> copy to `final/<assetId>/<checksum>` -> READY.
- Ledger: `BackgroundTask(state PENDING|RUNNING|RETRYABLE|SUCCEEDED|FAILED, leaseUntil, attempts, deduplicationKey unique)`; reconciler re-enqueues PENDING/RETRYABLE and expired RUNNING leases.
- Renderer: `packages/invitation-renderer/src/<family>/<version>/` pure React sections; input = validated `InvitationContentV1`; `mode: preview|public`; preview watermark; no RSVP writes in preview.
- Editor: TanStack Query + react-hook-form; `PATCH /invitations/:id/draft {expectedVersion, section, data}` -> `UPDATE ... WHERE id AND owner scope AND version = $v` -> 409 `VERSION_CONFLICT` with `currentVersion`.

## Related Code Files

Create:
- `packages/database/prisma/schema/{projects,media,invitations}.prisma` (+ `operations.prisma` modify for task fields if needed)
- `apps/api/src/modules/{projects,media,invitations,operations/tasks}/**`
- `apps/worker/src/{processors/media,dispatcher,reconciler,queues}/**`
- `packages/contracts/src/{projects,media,invitations}/**`
- `packages/invitation-renderer/src/{families/editorial-ivory,families/modern-type,families/botanical-letter,sections,schema,registry.ts}/**`
- `apps/web/src/app/(workspace)/dashboard/{page.tsx,projects/[id],invitations/[id]/edit,settings}/**`, `apps/web/src/app/(studio)/admin/operations/**`
- `apps/web/src/features/{projects,media-upload,invitation-editor,operations}/**`
- `tests/integration/{projects,media,tasks,invitations}/**`, `tests/e2e/invitation-editor/**`, `tests/fixtures/media/**` (MIME-spoof, bomb, EXIF GPS/rotation)

## Ticket Table

| Ticket | Work | Agent | Depends | Owned paths | Endpoints (11.3) | UI | TCs | Completion evidence |
|---|---|---|---|---|---|---|---|---|
| MORI-019 | Workspace ownership, assignments, address book, scoped reads | fullstack-developer | 010, 013 (UI part only) | `projects.prisma`, `apps/api/src/modules/projects/**`, `apps/api/src/modules/identity/addresses/**`, `packages/contracts/src/projects/**`, `apps/web/src/app/(workspace)/dashboard/{page.tsx,projects,settings}/**`, `apps/web/src/features/projects/**`, `tests/integration/projects/**` | `POST /projects`, `GET /projects/:id`, `PATCH /projects/:id`; `GET/POST /me/addresses`, `PATCH/DELETE /me/addresses/:id`; added `GET /projects`, `POST/DELETE /admin/projects/:id/assignments` | UI-07, UI-08, UI-15 (addresses) | TC-006, 007, 011 (rerun on projects) | Cross-project tests; no public account fields |
| MORI-020 | Upload sessions, quotas, staging keys, ownership | fullstack-developer | 019, 008 | `media.prisma`, `apps/api/src/modules/media/**`, `packages/contracts/src/media/**`, `apps/web/src/features/media-upload/**`, `tests/integration/media/upload/**` | `POST /media/uploads`, `POST /media/uploads/:id/complete`, `GET /media/:id/status`, `DELETE /media/:id` | upload control (UI-12) | TC-049 (attach check part), TC-060 (staging) | Unauthorized/oversized uploads rejected |
| MORI-021 | Quarantine, scan, derivative, immutable-copy processors | fullstack-developer | 020 | `apps/worker/src/processors/media/**`, `tests/fixtures/media/**`, `tests/integration/media/processors/**` | - | - | TC-058..062 | Processor tests pass; execution wired in 022 |
| MORI-022 | Ledger/outbox, workers, leases, reconciliation, progress UI | fullstack-developer | 008, 012, 021 | `apps/worker/src/{dispatcher,reconciler,queues,processors/notifications}/**`, `apps/api/src/modules/operations/tasks/**`, `apps/api/src/modules/notifications/**` (delivery only), `apps/web/src/app/(studio)/admin/operations/**`, `apps/web/src/features/operations/**`, `tests/integration/tasks/**` | `GET /admin/tasks`, `POST /admin/tasks/:id/retry` | UI-21 (tasks), upload progress | TC-105..108, 110, 135 | TC-105..108 + Redis-loss recovery |
| MORI-023 | Versioned invitation renderer + 3 template families | ui-ux-designer | 013, 021 | `packages/invitation-renderer/**`, `packages/contracts/src/invitations/content/**` | - | UI-22 (render), UI-04 demos | TC-063, 118, 127, 131 | Same renderer in preview and guest view; long-name tests |
| MORI-024 | Structured editor, autosave, validation, conflict/offline | fullstack-developer | 019, 023 | `invitations.prisma` (Invitation, InvitationDraft), `apps/api/src/modules/invitations/{drafts,editor}/**`, `packages/contracts/src/invitations/editor/**`, `apps/web/src/app/(workspace)/dashboard/invitations/[id]/edit/**`, `apps/web/src/features/invitation-editor/**`, `tests/e2e/invitation-editor/**` | `POST /projects/:id/invitations`, `GET /invitations/:id/editor`, `PATCH /invitations/:id/draft`, `POST /invitations/:id/preview` | UI-12 | TC-044, 045, 049, 131 | UI-12; TC-044/045; no sensitive localStorage drafts |

## Agent Briefs

### MORI-019 - Workspaces and assignments
- Do backend slice first (deps 010) so media lane can start; UI-07/08 after 013.
- WeddingProject(ownerUserId, internalTitle, defaultLocale vi-VN, defaultTimeZone Asia/Ho_Chi_Minh, version); StaffAssignment(projectId, staffUserId, permissions[] incl. `RSVP_READ`, `INVITATION_EDIT`, revokedAt; unique active); Address(ownerUserId, …, archivedAt, version).
- Register policy resolvers: owner, active assignment (+permission), admin (audited, reason).
- All reads scoped in `where`; inaccessible -> 404 (HR-3). Rerun TC-006/007/011 against projects.
- `PATCH /projects/:id` Vsn with explicit editable fields; addresses POST **I**, PATCH **Vsn**, DELETE archives.
- UI-07: "Your next step" first; no fake metrics; first-use empty state. UI-08 forbidden-as-not-found.
- DTOs never expose email/role of other users.

### MORI-020 - Upload sessions
- MediaUploadSession(ownerUserId, projectId, purpose, stagingKey random, expectedBytes, declaredMime, expiresAt 24 h, completedAt); MediaAsset(state INITIATED..READY|REJECTED|FAILED|DELETING|DELETED, storageKey, checksum, retentionClass); MediaDerivative(assetId, profile, storageKey, checksum, w/h, state).
- Authorize purpose + project access; enforce per-file and 250 MB quota inside tx.
- Presigned PUT limited to staging key + content-length; never final key (TC-060).
- Complete: HEAD object, compare size/checksum; do not trust browser MIME/filename; write task + outbox in same tx (INV-11).
- `DELETE /media/:id`: lock asset row; if referenced (port `MediaReferenceChecker` implemented by link-table owners) -> 409 `ASSET_IN_USE`; else unlink/mark for GC.
- `assertAttachable(principal, assetId, projectId)` helper: READY + same owner/project (INV-12, TC-049).

### MORI-021 - Media processors
- Pipeline per spec 14.1: `file-type` sniff (JPEG/PNG/WebP only; SVG/HTML/exe/archives rejected), clamd scan (skip only when `scan` profile off in dev, flagged in result), sharp with `limitInputPixels` 40 MP and timeouts, `.rotate()`, strip metadata, re-encode, derivatives (profiles defined with 023: cover, gallery, thumb, og).
- Copy to immutable `final/<assetId>/<checksum>`; derivative keys include checksum; never overwrite (INV-03 groundwork).
- Pure functions with injected storage port so tests run without the queue.
- Fixtures: MIME spoof (TC-058), decompression bomb/oversize (TC-059), EXIF rotation + GPS (TC-062).
- Worker memory bounded; processor returns typed outcome (READY/REJECTED reason/FAILED retryable).

### MORI-022 - Durable work
- Outbox dispatcher (leased) -> BullMQ with jobId = task id; workers claim via `UPDATE ... SET state=RUNNING, leaseUntil WHERE id AND state IN (PENDING,RETRYABLE)`; heartbeat extends lease.
- Reconciler: re-enqueue PENDING/RETRYABLE where `nextRunAt <= now()`; recover expired RUNNING leases (TC-105, 107).
- Deterministic artifact destinations + CAS completion (TC-106); 5 attempts exp backoff + jitter -> FAILED visible.
- Separate queues/concurrency: media, notifications, exports, ai.
- Notification delivery processor; rewire 009 MailPort (TC-108: duplicate email harmless, no duplicate domain mutation).
- GC sweep for abandoned uploads (24 h) and unreferenced assets (7 d) with same asset row lock as attach (TC-135).
- Storage outage -> pending/useful error, no lost record (TC-110).
- UI-21 tasks list (healthy/degraded/failed), retry with reason (**I**); no payload dump. Upload progress UI polls `GET /media/:id/status`.

### MORI-023 - Invitation renderer
- Contract `InvitationContentV1` (Zod, `schemaVersion: 1`): sections from spec 7.1 with limits (name 80 graphemes, event title 120, venue 160, address 300, message 1,000, story 2,000).
- Families Editorial Ivory, Modern Type, Botanical Letter; 2 curated presets each = 6 digital designs (8.9); registry keyed `family@version`.
- Guest page order per 8.9; plain-text rendering only, safe URL schemes (TC-131); essential info without JS (TC-127).
- Version pinning: published revision stores `templateVersion`; old versions remain renderable (TC-063).
- Grapheme-aware wrapping, Vietnamese diacritics, long names (TC-118).
- Preview mode watermark; RSVP section non-submitting in preview.
- Visual snapshots at 390/1440 per family; human visual review noted for MORI-036.

### MORI-024 - Editor
- Schema: Invitation(projectId, templateKey, status DRAFT, moderationState, draftVersion, publishedRevisionId null, accessMode, accessEpoch, rsvpMode, rsvpDeadlineAt, expiresAt, version), InvitationDraft(invitationId unique, schemaVersion, templateVersion, payload, version).
- `POST /projects/:id/invitations` **I**: owner only, verified, 3-draft quota (3.4).
- `PATCH /invitations/:id/draft` **Vsn** section patch; attach asset via `assertAttachable` (TC-049); events <= 5; explicit IANA zone + DST-gap validation (7.1).
- `GET /invitations/:id/editor`, `POST /preview`: private, `Cache-Control: private, no-store`.
- UI-12 per 8.8: save states Unsaved/Saving/Saved at/Offline/Conflict from server ack only; 800 ms debounce; conflict dialog with field diff + reload/reapply (TC-044); network drop -> no false Saved + retry (TC-045); beforeunload warning; no localStorage drafts.
- Keyboard focus does not jump into preview on save (TC-119 partial).

## Implementation Steps

1. 019-backend (after 010) -> 020 -> 021 -> 022 (media/worker lane; can overlap P02).
2. 019-ui after 013.
3. 023 after 013 + 021 (derivative profiles agreed with 021 owner).
4. 024 after 019 + 023.
5. Migrations order: projects (019) -> media (020) -> operations tweaks (022) -> invitations (024).

## Todo List

- [ ] MORI-019 backend + UI-07/08/15 addresses
- [ ] MORI-020 upload sessions + quotas
- [ ] MORI-021 processors + fixtures
- [ ] MORI-022 ledger/outbox/reconciler + UI-21 tasks
- [ ] MORI-023 renderer families/presets
- [ ] MORI-024 editor UI-12 + CAS

## Success Criteria

- TC-044, 045, 049, 058-062, 063, 105-108, 110, 131, 135 executed and passing; Redis flush during pending work recovers.
- Demo: create workspace -> invitation -> upload cover -> processed -> draft saved; kill worker mid-task -> reconciler completes.

## Risk Assessment

- Lane inconsistency 020 <- 019 <- 013 (flagged): split 019.
- TC-061 ownership spread across 020/025/039 (flagged).
- sharp/clamd memory on 4 GB Docker VM: concurrency 1 for media in dev, ClamAV profile.
- Renderer scope creep into canvas editing: forbidden (ADR-05).

## Security Considerations

- INV-01, 11, 12, 14. Uploads never trusted by name/MIME; no SVG; no arbitrary URL fetch (SSRF). Editor/preview no-store. Staff edit only with `INVITATION_EDIT` assignment, audited.

## Next Steps

- Digital lane P04 (025 needs 024 + 022). Studio lane P06 (037 needs 019 + 016; 039 needs 021 + 022).

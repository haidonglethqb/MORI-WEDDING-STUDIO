# State Machines

**Spec:** 6 | See `MORI_PROJECT_PLAN.md` section 6 (State machines and transition guards)

State machines are domain contracts. Never accept arbitrary status strings. Each transition has a command, authorization policy, validation, audit event, and notification rule.

## Service Request States

| From | Command / Actor | To | Required Guard / Effect |
| --- | --- | --- | --- |
| DRAFT | Submit / owner | SUBMITTED | Verified owner; valid brief; supported config |
| SUBMITTED | Assign / admin/ops | IN_REVIEW | Active staff assignment |
| IN_REVIEW | Start design / staff | DESIGNING | Missing questions resolved |
| DESIGNING | Submit proof / staff | AWAITING_APPROVAL | Immutable revision + validated assets |
| AWAITING_APPROVAL | Request changes / owner | DESIGNING | Feedback anchored to review revision |
| AWAITING_APPROVAL | Approve / owner | APPROVED | Revision + spec match; approval recorded |
| APPROVED | Edit brief/proof / owner/staff | DESIGNING | Previous approval retained (not eligible for new order) |
| APPROVED | Place order / owner | CONVERTED | Active matching quote; current approval; idempotent |
| Any active | Cancel / owner/staff | CANCELLED | Reason recorded; pending work cancelled |

**`READY_TO_ORDER`** (derived): APPROVED + unexpired matching ISSUED quote. Not a mutable status.

## Design Revision States

`WORKING` → `IN_REVIEW` → (`APPROVED` ∣ `CHANGES_REQUESTED` ∣ `SUPERSEDED`)

Content immutable once `IN_REVIEW`. Customers comment on older revisions but cannot approve superseded ones.

**Approval record:** `actorUserId`, `revisionId`, `artifactManifestHash`, `briefFingerprint`, `acknowledgementVersion`, `approvedAt` (append-only, minimal security context, no IP).

## Quote States

`DRAFT → ISSUED → ACCEPTED` (normal path)

ISSUED may become `WITHDRAWN`, `SUPERSEDED`, or `EXPIRED`. Expiry checked at DB clock even before cleanup job. New issue supersedes previous active quote transactionally. ACCEPTED quotes immutable.

**Atomicity:** Accepting quote + creating order = one operation. No standalone accepted-quote state without order in v1.

## Order States

| State | Meaning | Next |
| --- | --- | --- |
| SUBMITTED | Quote accepted; awaiting confirmation | CONFIRMED, CANCELLED |
| CONFIRMED | Studio accepted responsibility | IN_FULFILLMENT, CANCELLED (if no irreversible work) |
| IN_FULFILLMENT | ≥1 track started | COMPLETED |
| COMPLETED | All tracks complete | No rewind |
| CANCELLED | Accepted cancellation | No reopen (create new request/order) |

**Physical track:** `PENDING → IN_PRODUCTION → QUALITY_CHECK → READY_TO_SHIP → SHIPPED → DELIVERED`

**Digital track:** `PENDING → IN_PROGRESS → READY_FOR_HANDOVER → HANDED_OVER`

**`ON_HOLD`:** Issue flag (reason + responsible staff), not replacement state. Display alongside stage.

## Invitation Lifecycle

`DRAFT → PUBLISHED → UNPUBLISHED` (owner-controlled)

PUBLISHED → EXPIRED per `expiresAt`. Admin moderation: `moderationState=SUSPENDED` (takes precedence; denies all public routes).

**Editing:** Publish draft, accept newer edits as draft, but don't change status to DRAFT. Store `draftVersion`, `publishedRevisionId`, publication status separately.

**Unpublish:** Immediately denies fresh HTML, JSON, calendar, OG, media. Does not delete drafts/publications/RSVPs.

## Related

- [Invariants](./invariants.md) — Transition enforcement (INV-05, INV-06)
- [Scope and roles](./scope-and-roles.md) — Authorization per actor
- [RSVP](../data-flows/rsvp.md) — Response state transitions

---

**Design principle:** State machines prevent invalid transitions at the DB and application layer.

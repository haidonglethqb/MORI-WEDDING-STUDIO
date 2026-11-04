# Phase 05 - RSVP and digital pilot

## Context Links

- Spec: 3.4 (500 parties, 10 per event, deadline 7 d before earliest event, retention 90 d), 5.6 (HP-06), 7.3 step 3 (reconfirmation), 7.5 (named links, identity switch), 7.8 (RSVP modes/data rules), 7.9 (transaction + capacity algorithm), 8.5 (UI-14, UI-20, UI-22 RSVP, UI-23), 8.9 (RSVP copy), 9.7 (lock order: invitation -> events sorted -> party -> response), 10.2 (GuestParty, PartyEventAllowance, RsvpResponse, RsvpEventAnswer, RsvpChange, ModerationReport), 10.4 (CHECK constraints, `rsvp_event_count_idx`), 10.5 (deletion ledger), 11.3 (guests, rsvps, rsvp-exports, rsvp-policy, rsvp-corrections, moderation; public guest-exchange, guest-session, my-rsvp, manage-link, reports), 14.4, 15.1, 15.3 (moderation), 15.4 (export/retention), 18.5, 18.9, 20.3 (pilot vs complete)
- Brief §3 HR-3, 4, 7, 8, 9; §4 human gate MORI-036

## Overview

- Priority: P1 (digital lane). Status: Completed.
- Guest parties + named links; OPEN/GUEST_LIST/OFF RSVP with capacity locks; owner dashboard + corrections; private exports; abuse reports + moderation; expiry/retention/deletion jobs; pilot rehearsal behind feature flags.
- Exit gate: digital-only pilot works, including capacity races and privacy review.

## Key Insights

- One lock order for every count-changing command: Invitation -> InvitationEvent rows (ascending id) -> GuestParty -> RsvpResponse. RSVP submit, capacity edit, mode change, event retirement, owner correction, duplicate exclusion all reuse one `RsvpLockingService`.
- Capacity = SUM(attendeeCount) of non-excluded ATTENDING answers per event, computed under event row lock; delta vs previous accepted answer.
- Database time decides deadline (`now()` in tx) (TC-075).
- 031 absorbs `guest-exchange` + TC-053 from 027 (party entity lives here).
- 032 completes publication step 3: material schedule change -> `needsReconfirmation` (TC-084), retire events with answers (TC-083).
- TC-133 listed under 034, but retention deletion jobs belong to 035; 034 implements warnings/export, 035 the deletion; TC-133 closes in 035.
- Account deletion (TC-134) and UI-15 delete/export have no explicit ticket; assigned to 035.

## Requirements

- Functional: roster parties with per-event allowances; named fragment links (256-bit, digest, link version, 180 d expiry); identity-switch confirmation; open guest session + one open party; my-rsvp read/update; manage link (show once); owner policy (mode/deadline/capacity); dashboard per-event metrics; corrections with reason; duplicate flag/exclude; CSV export job (15-min grant, 24 h artifact); reports; suspend/restore; expiry sweep; RSVP retention deletion with warning; account deletion; feature flags.
- Non-functional: p95 RSVP <= 800 ms; 10 writes/s burst; never oversell; exports formula-safe; no guest data in logs/AI.

## Architecture

- `SubmitRsvp` use case: resolve grant (party derived from grant, never from body) -> idempotency -> tx with lock order -> recheck publication/epoch/mode/eligibility/deadline/version -> compute deltas -> capacity check -> upsert response + answers -> RsvpChange -> notification task -> commit -> return stored values + version.
- DB constraints: `rsvp_count_matches_status`, `party_allowance_positive`, unique response/party, answer/response+event, allowance/party+event; composite FKs so party/event share invitationId.
- Export: command creates export task (snapshot boundary) -> worker writes CSV to private storage -> download endpoint re-authorizes and checks 15-min grant.
- Moderation: `ModerationReport` intake rate-limited; admin command sets `moderationState` (precedence over publication state).

## Related Code Files

Create:
- `packages/database/prisma/schema/{guests,rsvp,moderation,retention}.prisma`, SQL migration for CHECK/composite FKs
- `apps/api/src/modules/guests-rsvp/{parties,links,guest-session,submit,owner-dashboard,corrections,policy,export,locking}/**`
- `apps/api/src/modules/operations/{moderation,retention,account-deletion}/**`
- `apps/worker/src/processors/{rsvp-export,retention,invitation-expiry}/**`
- `packages/contracts/src/{guests-rsvp,moderation}/**`
- `apps/web/src/app/(workspace)/dashboard/invitations/[id]/guests/**`, `apps/web/src/app/i/[slug]/rsvp/**`, `apps/web/src/app/(studio)/admin/moderation/**`, `apps/web/src/app/(workspace)/dashboard/settings/privacy/**`
- `apps/web/src/features/{guest-rsvp,guest-management,moderation}/**`
- `packages/config/src/feature-flags.ts`
- `tests/integration/rsvp/**` (real-PG concurrency), `tests/e2e/rsvp/**`, `tests/performance/rsvp/**` (k6 script prep)

## Ticket Table

| Ticket | Work | Agent | Depends | Owned paths | Endpoints (11.3) | UI | TCs | Completion evidence |
|---|---|---|---|---|---|---|---|---|
| MORI-031 | Guest parties, per-event allowances, private fragment links | fullstack-developer | 027 | `guests.prisma`, `apps/api/src/modules/guests-rsvp/{parties,links}/**`, `packages/contracts/src/guests-rsvp/parties/**`, `apps/web/src/features/guest-management/parties/**`, `apps/web/src/features/guest-rsvp/link-exchange/**` | `POST /invitations/:id/guests`, `PATCH /invitations/:id/guests/:partyId`, `POST /invitations/:id/guests/:partyId/link`; public `POST /invitations/:slug/guest-exchange` | UI-14 (parties), UI-22 (named greeting) | TC-053, 066, 079, 085 | Named link scope + cross-wedding isolation |
| MORI-032 | OPEN/GUEST_LIST/OFF RSVP transactions + capacity locks | fullstack-developer | 031, 025 | `rsvp.prisma` + CHECK SQL, `apps/api/src/modules/guests-rsvp/{guest-session,submit,policy,locking}/**`, `apps/api/src/modules/invitations/publication/**` (reconfirmation hook only), `apps/web/src/app/i/[slug]/rsvp/**`, `apps/web/src/features/guest-rsvp/**`, `tests/integration/rsvp/**` | public `POST /invitations/:slug/guest-session`, `GET`/`PUT /invitations/:slug/my-rsvp`, `POST /invitations/:slug/my-rsvp/manage-link`; `POST /invitations/:id/rsvp-policy` | UI-22 (RSVP), UI-23 | TC-065..078, 083, 084, 088 | TC-065..078 incl. real concurrency |
| MORI-033 | Owner guest/response dashboard, corrections, duplicate exclusion | fullstack-developer | 032 | `apps/api/src/modules/guests-rsvp/{owner-dashboard,corrections}/**`, `apps/web/src/app/(workspace)/dashboard/invitations/[id]/guests/**`, `apps/web/src/features/guest-management/**` | `GET /invitations/:id/rsvps`, `POST /invitations/:id/rsvp-corrections`; added `POST /invitations/:id/guests/:partyId/exclusion` | UI-14 | TC-008 (rerun), 079..082 | Correct per-event metrics; auditable corrections |
| MORI-034 | Private export jobs, formula safety, retention warnings | fullstack-developer | 033, 022 | `apps/api/src/modules/guests-rsvp/export/**`, `apps/worker/src/processors/rsvp-export/**`, `apps/web/src/features/guest-management/export/**` | `POST /invitations/:id/rsvp-exports`; added `GET /rsvp-exports/:id/download` | UI-14 (export) | TC-086, 087, 133 (warning part) | TC-086/087/133 + export reauthorization |
| MORI-035 | Abuse reports, admin suspension, expiry + deletion jobs | fullstack-developer | 030, 034 | `moderation.prisma`, `retention.prisma` (deletion ledger), `apps/api/src/modules/operations/{moderation,retention,account-deletion}/**`, `apps/worker/src/processors/{retention,invitation-expiry}/**`, `apps/web/src/app/(studio)/admin/moderation/**`, `apps/web/src/features/moderation/**`, `apps/web/src/app/(workspace)/dashboard/settings/privacy/**` | public `POST /invitations/:slug/reports`; `POST /admin/invitations/:id/moderation`; added `GET /admin/moderation/reports`, `POST /me/deletion-request` | UI-20, UI-15 (privacy export/delete), UI-22 report link | TC-064, 116 (ledger prep), 133, 134, 137 | No resurrection; private moderation history |
| MORI-036 | Rehearse digital pilot; review guest/mobile/a11y states | **human** (QA/design/studio) + tester prep | 035 | `packages/config/src/feature-flags.ts`, `tests/e2e/pilot/**`, `plans/261031-mori-v1/reports/mori-036-*.md` | - | UI-01..04, 06, 07, 12..15, 20, 22, 23 | TC-043, 065, 066, 117..120, 126 | Digital happy path + privacy gate signed; unsupported features hidden |

## Agent Briefs

### MORI-031 - Parties and named links
- GuestParty(invitationId, source ROSTER|OPEN, displayName, tokenDigest, tokenVersion, tokenExpiresAt, issuedAccessEpoch, excludedAt/reason); PartyEventAllowance(partyId, eventId, maxAttendees 1..10).
- Composite FK/tx checks: party and event share invitation; 500 parties max (incl. open).
- `/link` **I**: 256-bit secret, digest only, shown once; replay returns "created, cannot redisplay" (11.5); owner warned it bypasses passcode.
- `guest-exchange`: secret in POST body; checks digest, tokenVersion, epoch, expiry (<= invitation expiry, 180 d); issues NAMED grant; client strips fragment via `history.replaceState` (TC-066); fragment never logged.
- Revoke one party: tokenVersion++ only (TC-053).
- One selected party per invitation per guest session; switching requires explicit confirmation; different weddings keep separate grants (TC-085).
- Same display name -> separate parties, no merge (TC-079).

### MORI-032 - RSVP core
- Tables: RsvpResponse(partyId unique, invitationId, version, lastEditedByKind, note, contactData encrypted via `FIELD_ENCRYPTION_KEY_FILE`), RsvpEventAnswer(status ATTENDING|DECLINED|UNANSWERED, attendeeCount, needsReconfirmation), RsvpChange (append-only).
- Implement spec 7.9 steps 1-6 with `SELECT ... FOR UPDATE` in lock order; bounded retry x3 on deadlock/serialization (idempotent only).
- Errors: 409 `EVENT_CAPACITY_EXCEEDED` (safe availability), `RSVP_CLOSED`, `VERSION_CONFLICT`; 422 allowance exceeded (TC-071); ineligible event -> rejection without info leak (TC-070).
- OPEN: `guest-session` creates one open party per session/invitation; repeat updates (TC-067). Idempotency scoped to grant (TC-068, 088).
- Policy command (**I, Vsn**): mode change OPEN->GUEST_LIST keeps history, removes open write grants (TC-078); lowering capacity below accepted -> reject (TC-077); reopen needs new valid deadline + audit (TC-076).
- Hook into PublishInvitation: material time/venue change marks affected answers `needsReconfirmation`, counts stay (TC-084); retired events keep answers (TC-083).
- Concurrency tests on real Postgres with parallel connections: TC-069, 073, 074.
- UI: "Will you join us?", per-event choices, count, note, "Send response"; confirmation repeats stored values (UI-23); no confetti.

### MORI-033 - Owner dashboard
- `GET /invitations/:id/rsvps`: owner or staff with `RSVP_READ` assignment (TC-008), cursor pagination, no-store.
- Metrics: per-event attending counts + unique responding parties; never sum across events as "unique guests" (TC-082).
- Corrections (**I, Vsn**): reason required, same locks, recorded as owner edit (also after closure).
- Duplicate flag (minimized signals) + exclude with reason, counts adjust once (TC-080, 081); limitation copy for OPEN mode.
- UI-14 states: empty, filtered, duplicate flagged, closed.

### MORI-034 - Exports
- `POST /rsvp-exports` **I**: owner/permitted staff, recent-auth (TC-012 path), audited; task with snapshot boundary.
- CSV: prefix `'` for cells starting `= + - @ \t \r` (TC-086); UTF-8 BOM for Excel; test Sheets/Excel.
- Download: re-check access + 15-min grant; artifact deleted after 24 h; revoked/expired -> 404 (TC-087).
- Retention warning notifications before RSVP deletion (owner, in-app + email).

### MORI-035 - Moderation and retention
- Report intake: rate-limited, minimal data, reporter never sees owner info.
- `POST /admin/invitations/:id/moderation` (**I, Vsn**, ADMIN + MFA): suspend/restore with reason; restore clears hold only, never republishes (15.3); owner sees reason privately.
- Sweeps: invitation expiry (policy version keyed), RSVP retention 90 d post-event delete/anonymize once (TC-133), draft inactivity 180 d with 14-d warning.
- Account deletion: unpublish, revoke sessions/grants, anonymize eligible data, keep operational history per policy (TC-134).
- Deletion/revocation ledger table for restore reapplication (feeds TC-116 in 061).
- UI-20: open/reviewed/restored, history private.

### MORI-036 - Digital pilot rehearsal (HUMAN-GATED)
- Agent CAN prepare: feature flags (`physicalOrders`, `aiAssistant`, `viewer3d`, `studioRequests`) default off for pilot; hidden nav/CTAs when off; E2E pilot suite; screenshot set 390/1440 for UI-01, 02, 03, 12, 14, 22; keyboard + 200% zoom checklist; privacy review checklist (DTO, cache headers, logs).
- Human MUST: run rehearsal on real devices, review guest/mobile/a11y states, sign privacy gate; record sign-off in report.
- Pilot is not full v1 (20.3).

## Implementation Steps

1. 031 -> 032 -> 033 -> 034 -> 035 -> 036 (mostly sequential; 035 moderation intake can start after 030 in parallel with 033).
2. Migrations: guests (031) -> rsvp (032) -> moderation/retention (035).
3. Prepare k6 RSVP burst script for TC-111 (run in 063).

## Todo List

- [x] MORI-031 parties + named links + exchange
- [x] MORI-032 RSVP transactions + concurrency suite
- [x] MORI-033 UI-14 + corrections/exclusion
- [x] MORI-034 export jobs
- [x] MORI-035 moderation + retention + account deletion
- [x] MORI-036 pilot flags + rehearsal pack; human sign-off

## Success Criteria

- TC-053, 064..088, 133, 134, 137 executed and passing; concurrency tests use parallel real-PG connections.
- Pilot E2E (create -> publish -> guest RSVP -> owner export) green with flags off for unsupported features.

## Risk Assessment

- TC-133 split 034/035 (flagged); account deletion/UI-15 unowned in spec (assigned 035, flagged).
- Deadlocks if any path breaks lock order -> single locking service + lint review checklist.
- OPEN mode abuse inflates counts -> rate limits, party cap, duplicate flags, owner exclusion.

## Security Considerations

- INV-07, 08, 15. Guest data never in public DTO, logs, AI, analytics. Contact data encrypted. Exports re-authorized. Staff RSVP access only with explicit permission.

## Next Steps

- P10: 061 depends on 035; 066 depends on 036. k6 run in 063.

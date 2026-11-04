# Phase 06 - Studio design workflow

## Context Links

- Spec: 3.2 (staff/admin authority, no consent impersonation), 5.1 (HP-01 steps 3-8), 5.2 (HP-02 bespoke), 6.1 (service request states), 6.2 (revision + approval), 8.5 (UI-05 CTA, UI-09, UI-10, UI-16, UI-17), 8.7 (proof review), 8.10 (studio ops UI), 9.5 (Projects, Design), 9.7 (lock order: request -> revision), 10.2 (ServiceRequest, BriefRevision, RequestMessage, DesignRevision, DesignArtifact, ProofAnnotation, ProofApproval, design media links), 10.4 (`request_queue_idx`), 11.3 (`/projects/:id/requests`, `/requests/:id/*`, `/revisions/:id/*`), 13.1-13.2 (asset pipeline, manifest), 14.2 (render task), 18.3 (TC-026..032), 18.6 (TC-101)
- Brief §2 (poppler `pdftoppm` sandbox), §3 HR-3, 4, 6, 8, 11

## Overview

- Priority: P1 (studio lane). Status: Completed.
- Template and bespoke brief intake, request states, staff queue + thread with internal notes, immutable design revisions with sandboxed 2D proof rendering and manifest hashes, customer proof review/comments/approval bound to manifest + scope fingerprint.
- Exit gate: customer and studio complete design/approval loop with stale-proof protection.

## Key Insights

- State machines are pure tables in `packages/domain/src/state-machines/` (request, revision, quote, order, physical track, digital track, invitation); controllers never write raw status strings (spec 6). 037 creates the package with all machines so P07 reuses it.
- `scopeFingerprint` = SHA-256 of canonical brief scope (product/variant, quantity, specification, names/dates/venues). `manifestHash` = SHA-256 of canonical manifest (artifact ids + checksums, face map, page dims, brief fingerprint, renderer version, preflight). Both live in `packages/domain/src/fingerprints/`.
- `READY_TO_ORDER` is derived, never stored (6.1).
- 11.3 lacks list/assign/start-design/cancel endpoints; 037/038 add them to contracts first.
- MORI-042 "with actual content" sits on the critical path of P07 (043) and P09 (057). Recommend running 042 with fixtures for engineering exit and repeating with real content before 065.

## Requirements

- Functional: request kinds PAPER/DIGITAL/BUNDLE; template brief (from product/variant) and custom brief (styles, qty, deadline, references, "Studio quote required"); submit creates immutable BriefRevision; staff queue tabs (Needs assignment / Needs customer reply / Needs proof / Ready for production); messages CUSTOMER/INTERNAL; revisions WORKING -> IN_REVIEW -> APPROVED | CHANGES_REQUESTED | SUPERSEDED; render pipeline; anchored comments; approval with acknowledgement.
- Non-functional: staff PDF <= 30 MB; render sandbox no network, CPU/mem/PID limits; render failures leave revision unavailable; approval append-only; admin cannot approve as customer.

## Architecture

- Submit request: tx locks ServiceRequest (Vsn) -> validate brief vs catalogue variant (supported config, no tri-fold) -> insert BriefRevision(sequence, payload, scopeFingerprint) -> status SUBMITTED -> audit + notification outbox.
- Proof render: staff uploads PDF via media flow (purpose PROOF_SOURCE) -> `POST /requests/:id/revisions` creates WORKING revision -> render task (key: revisionId + manifest input hash + renderer version) -> sandboxed worker container runs `pdftoppm` -> page PNG/WebP derivatives + face textures -> DesignArtifacts + manifest -> revision `renderState=READY`.
- Submit review: lock request -> revision; require render READY + manifest; status IN_REVIEW (immutable); previous IN_REVIEW -> SUPERSEDED; request AWAITING_APPROVAL.
- Approve: lock request -> revision; require current IN_REVIEW revision, matching scopeFingerprint, manifestHash in body equals stored, acknowledgement complete, actor = owner; insert ProofApproval; revision APPROVED; request APPROVED.

## Related Code Files

Create:
- `packages/domain/src/{state-machines,fingerprints}/**`
- `packages/database/prisma/schema/{requests,design}.prisma`
- `apps/api/src/modules/projects/requests/**`, `apps/api/src/modules/design/{revisions,review,approval,comments}/**`, `apps/api/src/modules/projects/messages/**`, `apps/api/src/modules/projects/admin-queue/**`
- `apps/worker/src/processors/proof-render/**`, `infra/docker/proof-renderer.Dockerfile`, compose service `proof-renderer` (no network)
- `packages/contracts/src/{requests,design}/**`
- `apps/web/src/app/(workspace)/dashboard/requests/[id]/**` (UI-09, UI-10), `apps/web/src/app/(studio)/admin/requests/**` (UI-16, UI-17)
- `apps/web/src/features/{service-requests,proof-review,studio-queue,request-thread}/**`
- `tests/integration/{requests,design}/**`, `tests/e2e/design-loop/**`, `tests/fixtures/proofs/**`

## Ticket Table

| Ticket | Work | Agent | Depends | Owned paths | Endpoints (11.3) | UI | TCs | Completion evidence |
|---|---|---|---|---|---|---|---|---|
| MORI-037 | Template/custom brief intake, submission snapshots, request states | fullstack-developer | 019, 016 | `requests.prisma`, `packages/domain/src/{state-machines,fingerprints}/**`, `apps/api/src/modules/projects/requests/**`, `packages/contracts/src/requests/**`, `apps/web/src/app/(workspace)/dashboard/requests/[id]/page.tsx`, `apps/web/src/features/service-requests/**` | `POST /projects/:id/requests`, `PATCH /requests/:id/draft`, `POST /requests/:id/submit`; added `GET /requests/:id`, `GET /projects/:id/requests`, `POST /requests/:id/cancel` | UI-09 (brief), UI-05/UI-03 CTAs | TC-016 (submit path), 030 (prep) | Both request types usable and scoped |
| MORI-038 | Assignment queue, request thread, private internal notes | fullstack-developer | 037, 010 | `apps/api/src/modules/projects/{messages,admin-queue}/**`, `apps/web/src/app/(studio)/admin/requests/**`, `apps/web/src/features/{studio-queue,request-thread}/**` | `POST /requests/:id/messages`; added `GET /admin/requests`, `POST /admin/requests/:id/assign`, `POST /requests/:id/start-design` | UI-16, UI-17, UI-09 (thread) | TC-007 (rerun) | UI-16/17; no internal-note leakage |
| MORI-039 | Revision manifests + sandboxed 2D proof rendering | fullstack-developer | 038, 021, 022 | `design.prisma` (DesignRevision, DesignArtifact, links), `apps/api/src/modules/design/revisions/**`, `apps/worker/src/processors/proof-render/**`, `infra/docker/proof-renderer.Dockerfile`, compose `proof-renderer` service | `GET /requests/:id/revisions`, `POST /requests/:id/revisions`, `POST /revisions/:id/submit-review` | UI-17 (revision panel) | TC-028, 059 (PDF), 061 (design links), 101, 106 | Render failures safe; immutable ready artifacts |
| MORI-040 | Customer proof review, anchored comments, change requests, approval | ui-ux-designer + fullstack-developer | 039 | `design.prisma` (ProofAnnotation, ProofApproval), `apps/api/src/modules/design/{review,comments,approval}/**`, `apps/web/src/app/(workspace)/dashboard/requests/[id]/proofs/[revision]/**`, `apps/web/src/features/proof-review/**` | `POST /revisions/:id/comments`, `POST /revisions/:id/request-changes`, `POST /revisions/:id/approve` | UI-10 | TC-029, 030, 031 | UI-10; explicit acknowledgement/hash binding |
| MORI-041 | Current-revision/scope locking, append-only approval history | fullstack-developer | 040 | `apps/api/src/modules/design/approval/**` (locking), `apps/api/src/modules/projects/requests/scope-change/**`, `tests/integration/design/**` | (hardens above) | UI-09/10 superseded states | TC-027..032 | TC-027..032; stale approval races pass |
| MORI-042 | Rehearse template + bespoke review loops with actual content | tester (+ studio participation) | 041 | `tests/e2e/design-loop/**`, `plans/261031-mori-v1/reports/mori-042-*.md` | - | UI-09, 10, 16, 17 | TC-025 (to proof approval), 026 (to approval) | Staff complete work without manual DB edits |

## Agent Briefs

### MORI-037 - Requests and briefs
- ServiceRequest(projectId, kind, status, currentBriefRevisionId, reviewRevisionId, version); BriefRevision(requestId, sequence unique, schemaVersion, payload, scopeFingerprint); draft working payload on request.
- Domain machines for all spec-6 aggregates with guard signatures; unit tests per transition (allowed + forbidden).
- Template brief prefilled from product/variant selection (HP-01 step 3 carry-over); custom brief: no price shown, "Studio quote required" (5.2).
- Submit (**I, Vsn**): verified owner, supported config via catalogue + pricing validation (TC-016), immutable BriefRevision.
- Cancel: any non-converted active state, reason, pending work cancelled.
- UI-09 shows every request state with next action; "Request a design" CTA wording (HR-1).
- Policy: owner or assigned staff (on behalf of customer, audited).

### MORI-038 - Queue and thread
- `GET /admin/requests`: allowlisted filters (tabs per 8.10), cursor pagination, `request_queue_idx`; assigned staff see only their projects unless admin.
- Assign (admin/ops): creates StaffAssignment, request SUBMITTED -> IN_REVIEW; start-design IN_REVIEW -> DESIGNING.
- Messages **I**: plain text; INTERNAL visible only to staff; customer DTO mapper excludes INTERNAL (test: customer API + notifications + AI context exclude it).
- UI-16 compact rows, factual time-in-state, no fake SLA; UI-17 brief, notes, revisions, stale-edit state.

### MORI-039 - Revisions and rendering
- DesignRevision(requestId, sequence unique, state, briefRevisionId, scopeFingerprint, manifestHash, renderState, submittedAt); DesignArtifact(revisionId, assetId, purpose PROOF_PAGE|PRINT|TEXTURE, page/face, dims, checksum).
- Sandbox: separate container, `network_mode: none`, mem/CPU/PID limits, read-only fs + tmpfs, timeout; PDF page/size limits (TC-059).
- Task idempotency key revisionId + input hash + renderer version; deterministic output keys (TC-106).
- Failed render -> revision not submittable (TC-101); never show stale output.
- Submit-review (**I, Vsn**): lock request -> revision; content immutable after IN_REVIEW (TC-028); supersede prior review revision.
- Register design media links with `MediaReferenceChecker` (TC-061).

### MORI-040 - Proof review UI and approval
- UI-10: large canvas + 320 px side panel; header revision number + status; tabs Proof / Text details / 3D (flagged off until P08); superseded warning + link to current.
- Comments **I**: ProofAnnotation(revisionId, pageId, normalizedPosition, text) on any revision, approval only on current (TC-029).
- Request changes (**I, Vsn**): current review revision -> CHANGES_REQUESTED; request DESIGNING.
- Approve (**I, Vsn**): body includes manifestHash + acknowledgement {names, dates, venues, quantity/spec, screen-colour disclaimer, version}; missing -> 422, no partial record (TC-030).
- ProofApproval(revisionId, ownerUserId, manifestHash, scopeFingerprint, acknowledgementVersion, approvedAt) append-only; ADMIN/STUDIO calling approve -> 403/404 (TC-031).
- Approval button disabled until proof loaded + acknowledgement complete; confirmation repeats proof number + key facts (8.7).

### MORI-041 - Stale protection
- Concurrency tests: submit new revision while customer approves old (TC-027) using two connections and lock order request -> revision.
- Scope edit after approval: request -> DESIGNING, old approval retained but ineligible (TC-032); fingerprint mismatch -> 409 `SCOPE_CHANGED`; stale revision -> 409 `PROOF_SUPERSEDED`.
- DB-level: unique accepted approval per revision; no UPDATE/DELETE path on ProofApproval (repository has insert only; DB grant review note).
- INV-03, INV-04 groundwork; audit every approval.

### MORI-042 - Design loop rehearsal
- Script E2E: template flat-card request -> assign -> revision 1 -> comments -> changes -> revision 2 -> approve; bespoke request -> brief resolution -> revision -> approve.
- Use fixtures if real content not ready; record which (HR-12); repeat with real content before MORI-065.
- Evidence: no manual DB edits; screenshots UI-10/UI-17 at 390/1440; list friction issues as follow-up tickets.

## Implementation Steps

1. 037 (domain machines first, then API/UI) -> 038 -> 039 -> 040 -> 041 -> 042.
2. 039 sandbox container can be built in parallel with 038.
3. Migrations: requests (037) -> design (039, 040).

## Todo List

- [x] MORI-037 state machines + intake
- [x] MORI-038 queue + thread
- [x] MORI-039 revisions + sandboxed render
- [x] MORI-040 UI-10 + approval
- [x] MORI-041 race/stale tests
- [x] MORI-042 rehearsal report

## Success Criteria

- TC-027..032, 059 (PDF), 101, 106 executed and passing; internal-note leak test passing.
- Demo: both request types reach APPROVED without DB edits.

## Risk Assessment

- 042 (actual content) gates 043 and 057 (flagged) -> fixture run for engineering exit.
- Missing endpoints in 11.3 (list, assign, start-design, cancel) -> added to contracts first.
- Poppler CVEs / PDF bombs -> sandbox + limits + image pin + trivy scan.

## Security Considerations

- INV-01, 03, 10 (no AI approval). No consent impersonation. Internal notes never in customer DTOs, notifications, or AI context. Render sandbox has no network/secrets.

## Next Steps

- P07 043 (needs 016 + 042); P08 049 (needs 039); P09 057 (needs 042).

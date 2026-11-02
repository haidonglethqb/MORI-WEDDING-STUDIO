# Phase 07 - Quotes and no-payment fulfillment

## Context Links

- Spec: 3.3 (estimate vs quote vs order; CTA wording; no-payment confirmation text; money bounds), 5.1 (HP-01 steps 9-12), 5.4 (HP-04 digital), 5.5 (HP-05 bundle), 6.3 (quote), 6.4 (order + physical/digital tracks, ON_HOLD, cancellation), 8.5 (UI-09 quote, UI-11, UI-17 composer, UI-18), 8.10, 9.5 (Orders, Fulfillment, Notifications), 9.7 (lock orders: request -> quote -> revision/approval -> order; order -> track -> shipment), 10.2 (Quote, QuoteLine, Order, OrderItem, PhysicalFulfillment, DigitalFulfillment, Shipment, ShipmentEvent, OrderIssue, CancellationRequest, Notification, NotificationDelivery), 10.4 (`quote_one_issued_per_request`, `quote_total_nonnegative`), 10.5 (snapshots), 11.3 (quotes, place-order, orders, admin confirm/transitions/cancellation/shipments), 11.4 (place-order example), 11.5, 14.4 (notifications), 18.2 (TC-021..023), 18.3 (TC-025, 026, 033..042), 18.8 (TC-125), 18.9 (TC-139)
- Brief §3 HR-1, 4, 5, 6, 8; ADR-04, 06, 13

## Overview

- Priority: P1 (studio lane). Status: Pending (needs P06).
- Quote composer with resolved charges and issue/withdraw/supersede; atomic quote acceptance + order creation with permanent uniqueness; customer order detail; physical production/QC/shipping and digital handover; holds/rework/change/cancellation requests; notifications and full no-payment E2E.
- Exit gate: PAPER, DIGITAL, and BUNDLE accepted and completed honestly.

## Key Insights

- No accepted-quote-without-order state: PlaceOrder accepts and creates in one tx (6.3). Retried command returns the existing order.
- Quote expiry checked with DB `now()` inside the placement tx (TC-022), not only by a sweep.
- Order snapshots copy product/variant, price lines, terms, shipping address, approved revision + manifest hash; never join live catalogue or "latest proof" (INV-04, 05).
- TC-039 (unpublish after digital handover) needs P04 `unpublish`; phase map lets P07 run without P04. MORI-048 must wait for MORI-025 or defer TC-039 (flagged).
- TC-021/023 (quote behaviour) are listed under 044 but are implemented by 043; 043 writes them, 044 reruns.
- 042 dependency of 043 means quotes wait on a content rehearsal (flagged in phase-06).

## Requirements

- Functional: draft quote lines from pricing engine or staff-resolved custom charges; issue requires all required charges resolved (TC-019), matching briefRevision + scopeFingerprint, expiresAt = now + 7 d; withdraw; supersede on reissue; place order (PAPER needs shipping address snapshot, DIGITAL none); confirm; track transitions per 6.4; shipments manual + allowlisted tracking URL patterns; holds/rework/change; cancellation requests + decisions; in-app notifications + email.
- Non-functional: money BigInt VND, decimal strings; totals <= 1,000,000,000 VND; p95 order command <= 800 ms; no payment entity/state/copy (TC-125).

## Architecture

- IssueQuote: lock request -> quote; verify DRAFT, lines resolved, scope matches current brief; supersede existing ISSUED (same tx) -> new ISSUED (partial unique index guarantees one).
- PlaceOrder (11.4 contract): idempotency (principal+command+key) -> tx: lock request (Vsn) -> quote -> revision/approval -> existing order; check quote ISSUED + not expired (DB clock) + matches approval scopeFingerprint + approvalManifestHash; insert Order (unique requestId, unique quoteId), OrderItems snapshot, tracks (PHYSICAL for PAPER/BUNDLE, DIGITAL for DIGITAL/BUNDLE); quote ACCEPTED; request CONVERTED; audit + notification outbox.
- Fulfillment transitions use domain machines from `packages/domain/src/state-machines`; order status derived to COMPLETED only when all required tracks complete.

## Related Code Files

Create:
- `packages/database/prisma/schema/{quotes,orders,fulfillment,notifications}.prisma` + SQL for partial unique/check
- `apps/api/src/modules/pricing/quotes/**`, `apps/api/src/modules/orders/{place-order,read,cancellation}/**`, `apps/api/src/modules/fulfillment/{confirm,transitions,shipments,issues,handover}/**`, `apps/api/src/modules/notifications/**` (in-app + triggers)
- `packages/contracts/src/{quotes,orders,fulfillment,notifications}/**`
- `apps/web/src/app/(workspace)/dashboard/orders/[id]/**`, `apps/web/src/app/(studio)/admin/orders/[id]/**`, quote composer under `apps/web/src/app/(studio)/admin/requests/[id]/quote/**`
- `apps/web/src/features/{quotes,orders,fulfillment-ops,notifications}/**`
- `tests/integration/{quotes,orders,fulfillment}/**`, `tests/e2e/orders/**`

## Ticket Table

| Ticket | Work | Agent | Depends | Owned paths | Endpoints (11.3) | UI | TCs | Completion evidence |
|---|---|---|---|---|---|---|---|---|
| MORI-043 | Quote composer, resolved charges, issue/withdraw/supersede | fullstack-developer | 016, 042 | `quotes.prisma`, `apps/api/src/modules/pricing/quotes/**`, `packages/contracts/src/quotes/**`, `apps/web/src/app/(studio)/admin/requests/[id]/quote/**`, `apps/web/src/features/quotes/**` | `POST /requests/:id/quotes`, `POST /quotes/:id/issue`, `POST /quotes/:id/withdraw`; added `PATCH /quotes/:id` (draft lines) | UI-17 (composer), UI-09 (quote view) | TC-019, 021, 023 | Immutable issued quotes; expiry; matching scope |
| MORI-044 | Atomic quote acceptance/order creation, permanent uniqueness | fullstack-developer | 043 | `orders.prisma` (Order, OrderItem), `fulfillment.prisma` (track rows), `apps/api/src/modules/orders/place-order/**`, `packages/contracts/src/orders/**`, `tests/integration/orders/**` | `POST /requests/:id/place-order` | UI-09 (Place order request) | TC-021..023, 033..036 | TC-021..023 + TC-033..036 |
| MORI-045 | Customer order detail with snapshot and separate timelines | ui-ux-designer + fullstack-developer | 044 | `apps/api/src/modules/orders/read/**`, `apps/web/src/app/(workspace)/dashboard/orders/[id]/**`, `apps/web/src/features/orders/**` | `GET /orders/:id`; added `GET /orders` | UI-11, UI-07 (order next step) | TC-006 (rerun orders), 125 (UI) | Clear SUBMITTED vs CONFIRMED; no payment screen/state |
| MORI-046 | Physical production/QC/shipping + digital owner handover | fullstack-developer | 045 | `fulfillment.prisma` (Shipment, ShipmentEvent), `apps/api/src/modules/fulfillment/{confirm,transitions,shipments,handover}/**`, `apps/web/src/app/(studio)/admin/orders/[id]/**`, `apps/web/src/features/fulfillment-ops/**` | `POST /admin/orders/:id/confirm`, `POST /admin/orders/:id/fulfillment-transitions`, `POST /admin/shipments/:id/events`; added `POST /admin/orders/:id/shipments` | UI-18 | TC-037, 038, 042 | PAPER/DIGITAL/BUNDLE flows; no forced public release |
| MORI-047 | Holds, rework, scope changes, reviewed cancellation requests | fullstack-developer | 046 | `fulfillment.prisma` (OrderIssue), `orders.prisma` (CancellationRequest), `apps/api/src/modules/fulfillment/issues/**`, `apps/api/src/modules/orders/cancellation/**`, UI parts in `features/{orders,fulfillment-ops}/exceptions/**` | `POST /orders/:id/cancellation-requests`, `POST /admin/orders/:id/cancellation-decisions`; added `POST /admin/orders/:id/issues`, `POST /admin/orders/:id/issues/:issueId/resolve` | UI-11 (hold/cancellation), UI-18 (exceptions) | TC-040, 041 | Historical acceptance unchanged; actionable exceptions |
| MORI-048 | Notifications + full no-payment order E2E | tester + fullstack-developer | 047, 022 (+ 025 for TC-039) | `notifications.prisma` (Notification), `apps/api/src/modules/notifications/**`, `apps/web/src/features/notifications/**`, `tests/e2e/orders/**` | added `GET /me/notifications`, `POST /me/notifications/:id/read` | UI-07 (notices) | TC-025, 026, 037..042, 125, 139 | TC-025/026/037..042/125/139 |

## Agent Briefs

### MORI-043 - Quotes
- Quote(requestId, sequence, state DRAFT|ISSUED|ACCEPTED|WITHDRAWN|SUPERSEDED|EXPIRED, briefRevisionId, scopeFingerprint, priceBookId, expiresAt, totals BigInt, termsSnapshot), QuoteLine(description, quantity, unitAmountVnd, lineAmountVnd, chargeType PRODUCT|SETUP|FINISH|SHIPPING|TAX|CUSTOM).
- Draft lines seeded from pricing engine for catalogue variants; custom charges staff-entered; unresolved required charge blocks issue (TC-019).
- Issue (**I, Vsn**): lock request -> quote; supersede prior ISSUED in same tx (TC-023 concurrency test); snapshot lines; expiresAt 7 d.
- Issued quote immutable: no update path; pricebook change does not alter it (TC-021).
- Withdraw (**I, Vsn**): ISSUED only.
- Customer view: scope, total, shipping details, expiry, "Review your quote" CTA; never "Pay".

### MORI-044 - PlaceOrder
- Follow 11.4 request/response exactly; strict Zod rejects amount/user fields.
- Lock order request -> quote -> revision/approval -> existing order (HR-8); expiry via DB clock (TC-022).
- Unique indexes on `order.request_id`, `order.quote_id` (INV-06, 16); concurrent independent keys -> one order (TC-035).
- Same key + same body -> same orderId; changed body -> 422 (TC-033, 034); withdrawal race -> one serialized outcome (TC-036).
- Snapshot address via authorized `shippingAddressId` (PAPER/BUNDLE); DIGITAL omits it (TC-037).
- Response `messageCode: ORDER_REQUEST_RECEIVED`; no payment field.
- Bounded retry x3 on deadlock (idempotent command).

### MORI-045 - Order detail UI
- UI-11 states: submitted, active, hold, completed, cancellation; accepted snapshot separate from timelines; physical and digital tracks shown independently (BUNDLE).
- Exact confirmation copy from spec 3.3 ("No payment is collected on this website").
- `GET /orders/:id` owner/assigned staff/admin; inaccessible -> 404.
- Copy review against MORI-001 forbidden vocabulary (TC-125).

### MORI-046 - Fulfillment
- Confirm (**I, Vsn**): SUBMITTED -> CONFIRMED (operational feasibility note).
- Transitions (**I, Vsn**): lock order -> track -> shipment; physical PENDING -> IN_PRODUCTION -> QUALITY_CHECK -> READY_TO_SHIP -> SHIPPED -> DELIVERED; QC fail -> IN_PRODUCTION with rework reason; digital PENDING -> IN_PROGRESS -> READY_FOR_HANDOVER -> HANDED_OVER.
- Production start requires approved proof reference + checklist placeholder (full preflight in 053) and uses order snapshot assets, never latest draft (TC-042).
- Shipments: manual carrier label/tracking, allowlisted tracking URL patterns; ShipmentEvent append-only; delivery exceptions never fabricate DELIVERED.
- Digital handover: copy approved digital deliverable into owner's workspace invitation draft; no publish (HP-04).
- Order COMPLETED only when all required tracks complete (TC-038). Repeat key -> no duplicate transition/notification (TC-139).

### MORI-047 - Exceptions
- OrderIssue(kind HOLD|REWORK|CHANGE, reason, proposedScope, state, recordedBy, resolvedAt); ON_HOLD is a flag displayed with stage (6.4).
- Material unavailable -> hold + customer contact; substitution needs new approved scope/proof (13.4, TC-041).
- Cancellation request (**I**) by owner; decision (**I, Vsn**) by staff with affected tracks; delivered/handed-over tracks stay historical; no refund logic (TC-040).
- Accepted quote/order/proof rows never updated by exceptions.

### MORI-048 - Notifications and E2E
- Notification events per 14.4: assignment, new proof, clarification, quote issue/expiry, order confirmation, fulfillment updates, handover, expiry/retention warnings.
- In-app is system of record; email via outbox; subjects contain no addresses/notes/tokens.
- E2E suites: TC-025 flat-card full path; TC-026 bespoke; TC-037 digital; TC-038 bundle; TC-039 unpublish after handover (needs 025); TC-040, 041, 042; TC-139 duplicate events.
- TC-125: repo + OpenAPI + schema + UI grep and dependency check for payment vocabulary/SDKs.

## Implementation Steps

1. 043 -> 044 -> 045 -> 046 -> 047 -> 048 (sequential; 045 UI can start on contract mocks after 044 contracts merge).
2. Migrations: quotes (043) -> orders/fulfillment tracks (044) -> shipments/issues (046/047) -> notifications (048).

## Todo List

- [ ] MORI-043 quotes + concurrency
- [ ] MORI-044 PlaceOrder + idempotency/race suite
- [ ] MORI-045 UI-11
- [ ] MORI-046 UI-18 + tracks + handover
- [ ] MORI-047 holds/rework/cancellation
- [ ] MORI-048 notifications + E2E

## Success Criteria

- TC-019, 021..023, 025, 026, 033..042, 125, 139 executed and passing.
- PAPER, DIGITAL, BUNDLE demo end-to-end without any payment concept.

## Risk Assessment

- TC-039 cross-lane dependency on P04 (flagged).
- Studio capacity unknown -> no auto-confirmation; staff confirmation required.
- Snapshot drift if code joins live catalogue -> review rule: order read models only from snapshot columns.

## Security Considerations

- INV-04, 05, 06, 13, 16. Staff cannot place orders for customers. Addresses snapshot-only and never in notifications/logs.

## Next Steps

- P08 053 (needs 046); P10 061 (needs 048), 065 (needs 048).

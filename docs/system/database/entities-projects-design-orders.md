# Entities: Projects, Design, Orders

**Spec:** 10.2 | See `MORI_PROJECT_PLAN.md` section 10.2 (Data entities)

## Service Request & Revision

**ServiceRequest** — Owned by customer; contains `brief` (JSON: names, styles, quantities, deadline, custom notes), state (DRAFT/SUBMITTED/IN_REVIEW/DESIGNING/AWAITING_APPROVAL/APPROVED/CONVERTED/CANCELLED), assigned staff. Immutable once SUBMITTED.

**DesignRevision** — `serviceRequestId`, revision number, state (WORKING/IN_REVIEW/APPROVED/CHANGES_REQUESTED/SUPERSEDED), `artifactManifestHash` (immutable), media references, comments (threaded).

**ApprovalRecord** — Append-only: `actorUserId`, `revisionId`, `artifactManifestHash`, `briefFingerprint`, `acknowledgementVersion`, `approvedAt`, metadata. Cannot be forged by admin.

## Quote & Order

**Quote** — `serviceRequestId`, `specificationFingerprint` (immutable), `totalVND` (BigInt), `expiresAt`, state (DRAFT/ISSUED/ACCEPTED/WITHDRAWN/SUPERSEDED/EXPIRED). New quote version for any scope/amount change. [INV-05]

**Order** — `customerId`, `serviceRequestId`, `quoteId`, state (SUBMITTED/CONFIRMED/IN_FULFILLMENT/COMPLETED/CANCELLED), `acceptedRevisionId`, `acceptedQuoteSnapshot` (JSON: immutable scope/amount/spec). [INV-04, INV-06]

**OrderTrack** — Physical or Digital; one per order per type (PHYSICAL ∣ DIGITAL). Physical: PENDING → IN_PRODUCTION → QUALITY_CHECK → READY_TO_SHIP → SHIPPED → DELIVERED. Digital: PENDING → IN_PROGRESS → READY_FOR_HANDOVER → HANDED_OVER. [INV-11]

**Shipment** — Physical track detail: carrier, tracking number, estimated/actual dates, delivery proof. Soft-delete cancelled shipments.

## Related

- [State machines](../business-rules/state-machines.md) — Transition rules
- [Constraints & snapshots](./constraints-and-snapshots.md) — Order uniqueness, approval hash

---

**Immutability rule:** Once a quote/order accepted, scope/amount/approved revision never change. New order required for different scope.

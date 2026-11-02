# Constraints & Snapshots

**Spec:** 10.4–10.6 | See `MORI_PROJECT_PLAN.md` section 10.4–10.6 (Constraints, uniqueness, snapshots)

## Unique Constraints

- **Product SKU:** `(productId, color, size, binding)` UNIQUE (never duplicate product offerings)
- **ServiceRequest:** One active request per `(customerId, requestId)` (no duplicate requests)
- **Order:** `(serviceRequestId)` UNIQUE (only one v1 order per request) [INV-16]
- **Quote:** One active ISSUED per serviceRequest (new quote supersedes old) [INV-05]
- **PublicHandle:** Globally UNIQUE (no slug collision)
- **RsvpResponse:** `(invitationId, partyId)` UNIQUE (one response per party per invitation)

## Check Constraints

- **Specification:** `quantity > 0 AND quantity <= 10000`
- **Money:** `totalVND >= 0 AND totalVND <= 1000000000` (1B VND cap)
- **Attendance:** `partyAttendance >= 1 AND partyAttendance <= eventCapacity`
- **Event capacity:** `eventCapacity > 0` (never zero)
- **Quote expiry:** `expiresAt > issuedAt` (never past)
- **Invitation expiry:** `expiresAt > publishedAt` (never past)

## Snapshots (Immutable Records)

### Approval Snapshot

```typescript
{
  actorUserId: UUID,
  revisionId: UUID,
  artifactManifestHash: string, // immutable once set
  briefFingerprint: string,      // hash of acknowledgeable fields
  acknowledgementVersion: number, // for future versioning
  approvedAt: timestamptz
}
```

Never overwritten; staff cannot edit on behalf of customer; customer cannot retract.

### Quote Snapshot (Embedded in Order)

```typescript
{
  specificationFingerprint: string,  // hash of spec at quote issuance
  totalVND: BigInt,                  // never changes
  componentBreakdown: JSON,          // material/labor/shipping breakdown
  expiresAt: timestamptz,            // expires at quote time, not order time
  issuedAt: timestamptz
}
```

Ensures order always uses accepted scope/amount. [INV-04, INV-05]

## Related

- [Entities: projects, design, orders](./entities-projects-design-orders.md) — Order/quote structure
- [Invariants](../business-rules/invariants.md) — INV-04 (snapshot binding), INV-05 (quote immutability), INV-16 (order uniqueness)

---

**Principle:** Constraints are database-enforced, not just application logic. Snapshot fields are computed once and never recomputed.

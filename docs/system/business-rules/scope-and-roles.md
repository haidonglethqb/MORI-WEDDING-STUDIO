# Scope and Roles

**Spec:** 3.1–3.2 | See `MORI_PROJECT_PLAN.md` sections 3.1 (Release boundaries) and 3.2 (Actors and authority)

## Release Boundaries (v1 Full)

**Included:** Accounts, catalogue, structured customization, studio requests, versioned proofs, estimates/quotes, orders, physical tracking, digital builder/publishing/sharing, RSVP, customer AI, staff AI assistance, flat/bi-fold 3D, administration, backups, security/accessibility testing.

**Pilot milestone (smaller):** Catalogue, accounts, digital editor, public invitation, privacy controls, guest-list RSVP, moderation.

**Explicitly excluded:** Payments, partner collaboration, custom domains, arbitrary canvas editing, tri-fold, carrier integrations, bulk messaging, guest CSV import, seating plans, wishlists, subscriptions, multi-store tenancy, advanced analytics.

**Not required:** Native apps, Kubernetes, Kafka, Elasticsearch, vector DB, custom AI training, blockchain, multi-region.

---

## Actors and Authority

| Action | Visitor | Verified Customer | Assigned Staff | Administrator |
| --- | --- | --- | --- | --- |
| Browse catalogue | ✓ | ✓ | ✓ | ✓ |
| Use AI assistant (bounded) | Limited session | Account quota | ✓ | ✓ |
| Create workspace | ✗ | Own only | On behalf (audited) | Audited |
| View private drafts | ✗ | Own only | Assigned only | Operational access (audited) |
| Issue quote/proof | ✗ | ✗ | Assigned requests | ✓ |
| Approve final proof | ✗ | Owner only | No impersonation | No impersonation |
| Place order | ✗ | Owner only | Cannot consent | Cannot consent |
| Edit invitation | ✗ | Own only | Assigned + authorized | Audited access |
| Publish invitation | ✗ | Owner only | Prepare only | Suspend/restore (not publish) |
| Respond to RSVP | Valid access | As guest | No impersonation | No impersonation |
| Read RSVP responses | ✗ | Own invitation | Only assignment | Audited |
| Record fulfillment | ✗ | ✗ | Assigned | ✓ |
| Change global policy | ✗ | ✗ | Draft content | ✓ |
| Moderate public content | Report only | Report/own unpublish | Escalate | Suspend/review/restore |

**Roles:** `CUSTOMER`, `STUDIO`, `ADMIN`. `GUEST` is context, not a role.

**Rule:** Object-level ownership/assignment checks required in addition to role. A role alone never grants access to every record. [INV-01]

## Related

- [Invariants](./invariants.md) — INV-01 (authorization)
- [State machines](./state-machines.md) — Transition guards
- [Operational defaults](./operational-defaults.md) — Quotas and limits

---

**Key principle:** Least privilege; verify authorization at every resource access.

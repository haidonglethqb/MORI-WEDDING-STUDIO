# Operational Defaults

**Spec:** 3.4 | See `MORI_PROJECT_PLAN.md` section 3.4 (Proposed operational defaults)

Production defaults are documented, versioned configuration, not arbitrary constants. Expiry and retention notices are part of the product; unlimited hosting is never promised.

## Quotas & Limits

| Setting | Default | Notes |
| --- | --- | --- |
| Active self-service invitations | 1 per customer | Transactionally checked under user lock |
| Invitation drafts | 3 per customer | Server-side quota validation |
| Events per invitation | 5 | Draft & publish validation |
| Album photos | 30 | Per-file and total quota |
| Guest parties | 500 per invitation | Includes open RSVP-created parties |
| Party attendance max | 10 per event | Roster-specific limits can be smaller |
| Anonymous AI messages/day | 5 per session + IP limit | Combined anti-abuse |
| Verified AI messages/day | 30 per account | Atomic quota reservation |

## Expiry & Retention

| Data | Default | Rule |
| --- | --- | --- |
| Quote lifetime | 7 days | `expiresAt` checked in placement transaction |
| Published invitation | 180 days after latest event | Visible before publishing; renewable by owner policy |
| RSVP responses | 90 days after latest event, then delete/anonymize | Privacy policy; communicate & export in advance |
| Invitation draft inactivity | 180 days, 14-day warning | Never delete without disclosed policy & notification |

## Localization

| Setting | Default |
| --- | --- |
| Application locale | `vi-VN`; English resources prepared |
| Event time zone | `Asia/Ho_Chi_Minh` |

Explicit IANA zone retained per event; never assume guest browser zone equals venue zone.

## Related

- [Commercial no payment](./commercial-no-payment.md) — Quote lifetime
- [Invariants](./invariants.md) — INV-07 (capacity), INV-15 (retention)
- [Privacy and retention](../security/privacy-and-retention.md) — Data deletion

---

**Principle:** Customers must know limits before they create content. Expiry is explicit, not surprising.

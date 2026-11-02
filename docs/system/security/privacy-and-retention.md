# Privacy and Retention

**Spec:** 15.1, 15.3–15.4 | See `MORI_PROJECT_PLAN.md` sections 15.1 (Privacy policy baseline), 15.3–15.4 (Retention and data deletion)

## Data Retention Defaults

| Data | Retention | Action |
| --- | --- | --- |
| Account data | Indefinite (customer-owned) | Soft-delete on request; restore for 90 days |
| RSVP responses | 90 days after latest event | Delete or anonymize; notify owner in advance |
| Invitation drafts (inactive) | 180 days, 14-day warning | Delete after disclosure; never surprise |
| Published invitation | 180 days after latest event or explicit expiry | Visible before publish; owner controls |
| Upload staging | 24 hours | Auto-delete unfinalized uploads |
| Session | 30 days | Auto-expire; revocable by user |
| Audit logs | 2 years | Never auto-delete; review gate for purge |

Owner notified before deletion; export option provided for RSVP responses and invitation history.

## Anonymization Strategy

RSVP responses after 90-day retention: pseudonymize (hash identifiers) rather than delete. Keeps historical counts accurate for owner reference without exposing personal data.

## Credential & Token Redaction

[INV-15] Never log/export/serialize:
- Passwords, password hashes
- Session tokens
- Guest link secrets
- Presigned URLs
- API keys

Server-side redaction rules for all output. Never include in error responses to clients.

## Public DTO Allowlist

[INV-08] Invitation public endpoint returns dedicated `PublicInvitationView`, never raw Prisma record. Includes:
- Published content (names, events, story, gallery, music, RSVP config)
- Optional party greeting (if authorized guest with named link)

**Excludes:**
- Owner account ID / email
- Request / order IDs
- RSVP responses / guest list
- Upload originals (only derivatives)
- Internal notes / audit records
- Token digests or guest link metadata

## Related

- [Threat model](./threat-model.md) — Data leakage scenarios
- [Media uploads](./media-uploads.md) — Asset scanning and derivative safety
- [Operational defaults](../business-rules/operational-defaults.md) — Quota, expiry configs

---

**Principle:** Retention is explicit and disclosed before content creation. Deletion is verifiable and complete.

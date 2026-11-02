# Threat Model

**Spec:** 15.2 | See `MORI_PROJECT_PLAN.md` section 15.2 (Threat model and mitigations)

Key attack vectors and application-layer mitigations:

## Cross-Account Access

**Threat:** Attacker guesses another customer's ID and accesses their data.

**Mitigations:**
- [INV-01] Every API endpoint checks ownership/assignment in the `where` clause before returning data
- Inaccessible resource → 404 (not 403 to avoid information leakage)
- Negative integration tests in TC suite verify authorization bounds
- Audit logs record access attempts

## Media/Asset Theft

**Threat:** Attacker guesses media object IDs or forge presigned URLs.

**Mitigations:**
- [INV-12] Media ownership/use permission verified at attach-time and serve-time
- Presigned URLs time-limited (1 hour) and one-time-use where possible
- Protected media never redirected to reusable public object URLs
- Every media request checked against current publication state/access epoch

## RSVP Manipulation

**Threat:** Attacker inflates attendance counts, crashes event capacity, or impersonates another guest.

**Mitigations:**
- [INV-07] RSVP transaction locks invitation + events + response rows; rechecks capacity with rows locked
- Per-party limits enforced in CHECK constraints
- No automatic capacity violation → silent attendance reduce; explicit error instead
- Response updated by owner edit recorded as owner action (not guest RSVP)

## Public Invitation Leakage

**Threat:** Published invitation exposed to search engines, cached in services, or accessible to unauthorized guests.

**Mitigations:**
- [INV-09] `Cache-Control: private, no-store` on all HTML, JSON, media responses
- Route-level + fetch-level enforcement (not framework defaults)
- Passcode mode uses generic gate + metadata
- Access checks on every fresh request (not pre-filtered by cache)

## CSRF & Session Hijacking

**Threat:** Attacker tricks user into state-changing action or steals session cookie.

**Mitigations:**
- Custom SameSite=Strict HttpOnly session cookie (never accessible to JavaScript)
- CSRF token for state-changing requests (POST/PATCH/DELETE)
- Request-ID tracking for audit trails
- Short session TTL (30 days typical; longer = more risk)

## AI Prompt Injection

**Threat:** Attacker includes malicious instructions in invitation data, prompting AI to override pricing/approvals.

**Mitigations:**
- [INV-10] AI tools read-only on customer data; cannot write, approve, publish, or change prices
- AI responses reviewed by staff before public/customer-visible action
- Rate limits + quota per account prevent spam

## Related

- [Invariants](../business-rules/invariants.md) — INV-01, INV-09, INV-10, INV-12
- [Privacy and retention](./privacy-and-retention.md) — Data leakage, retention limits
- [Media uploads](./media-uploads.md) — Scanning, quarantine, derivative safety

---

**Principle:** Defense in depth. Every invariant has both application + database enforcement.

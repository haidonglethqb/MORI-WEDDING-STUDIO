# Sessions and Identity

**Spec:** 11.2, 3.2 | See `MORI_PROJECT_PLAN.md` sections 11.2 (Authentication contracts), 3.2 (Actors and authority)

## Custom Opaque Sessions

No JWT; all sessions stored in PostgreSQL:

**Session record:**
```typescript
{
  token: string,              // randomly generated, never predictable
  actorId: UUID,              // who is logged in
  role: 'CUSTOMER' | 'STUDIO' | 'ADMIN',
  grantedAt: timestamptz,     // when issued
  expiresAt: timestamptz,     // session expires (typically 30 days)
  revokedAt: timestamptz | null, // soft-delete if revoked early
  permissions: JSON,          // derived from role + actor assignment
  lastActivityAt: timestamptz // for inactivity timeout
}
```

**Cookie:** `__Host-mori_session` (HttpOnly, Secure, SameSite=Strict)

## Staff MFA (TOTP)

- **Library:** `otplib`
- **Secret storage:** Encrypted at-rest; users supply during setup
- **Backup codes:** Generated once, stored hashed, one-time use
- **Recent auth:** Require MFA within last 30 min for sensitive operations (changing payment settings, etc.)

## Guest Grants

**GuestSession** (not a full Account session):
- `grantId`: digest of guest link secret
- `invitationId`: scoped to one invitation
- `partyId`: optional, scoped to one guest party
- `accessEpoch`: revocation counter
- `expiresAt`: earlier of link TTL or invitation expiry

**No login required** for guest access; fragment exchange returns HttpOnly guest session.

## Guest Link Revocation

Changing passcode, revoking all guests, or rotating public handle increments `accessEpoch`. All existing grants immediately invalid. Owner confirms consequence; explains QRs must be reissued.

## Related

- [Scope and roles](../business-rules/scope-and-roles.md) — Actor authority
- [Invitation publication](../data-flows/invitation-publication.md) — Guest link mechanics
- [Security & privacy](../security/privacy-and-retention.md) — Credential redaction

---

**Principle:** Sessions are database state; revocation is immediate. Guest access is ephemeral and revocable.

# ADR-03: PostgreSQL-Backed Opaque Sessions and Scoped Guest Grants

**Context:** Sessions need to be revocable immediately (on logout, permission change, or security event). JWT tokens cannot be revoked in-place. Guest access needs narrowly scoped credentials (one invitation, optional one party, time-limited).

**Decision:** Store opaque session tokens in PostgreSQL with `actorId`, `role`, `expiresAt`, and `revokedAt` (soft-delete). Guest sessions are separate `GuestGrant` records with invitation/party scope, access epoch (revocation counter), and expiry. All are HttpOnly secure cookies.

**Rejected alternatives:**
- JWT: no in-place revocation; defeats security model (INV-01, 15)
- Redis-only: fails on Redis outage; loses history

**Consequences:**
- Immediate revocation (no cache/TTL delay)
- Audit trail of sessions
- Database query per request (acceptable load)
- Guest access can be revoked per-party or globally

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 11.2, 3.2, 7.5, INV-01 (authorization), INV-15 (credential safety)

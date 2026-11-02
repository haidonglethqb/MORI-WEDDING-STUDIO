# ADR-07: Private Invitation Media with No-Store Dynamic Policy Checks

**Context:** Published invitations contain customer photos and guest names. These must not leak to search engines, CDN caches, or other guests. But immutable template CSS/JS can cache broadly.

**Decision:** All invitation HTML, JSON, media, and calendar responses use `Cache-Control: private, no-store`. Every fresh request verifies publication state, access epoch, and visitor authorization. Public template assets (CSS, fonts) cache separately. Media gateway checks permission at serve-time.

**Rejected alternatives:**
- Cache and invalidate (slow revocation): expiry leaks or race conditions
- No-store everywhere (poor performance): even public assets suffer

**Consequences:**
- Revocation is immediate (no cache TTL)
- More database queries (acceptable for pilot scale)
- CDN does not cache user-specific content
- Later scale-up needs explicit ADR for cache architecture

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 7.6–7.7, 15.3, INV-09 (revocation), INV-12 (asset ownership)

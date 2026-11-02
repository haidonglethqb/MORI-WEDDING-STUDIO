# ADR-15: Self-Service No-Payment Publishing Pilot with Small Quotas

**Context:** Original brief requests digital invitations for customers. v1 offers no-payment self-service publishing (pilot) + quoted digital-design orders. Small quotas prevent abuse.

**Decision:** Verified customers may publish one active self-service invitation without an order or payment (quota 1). Three draft invitations allowed. Staff can increase quota by documented decision. Quoted digital design orders place invitations into the customer's workspace; public release is still the customer's action.

**Rejected alternatives:**
- Unlimited free publishing: unclear cost, unclear commercial model
- No publishing until order: defeats original "digital invitation" request
- Payment-gated: contradicts ADR-06

**Consequences:**
- Delivers original "digital invitation" request
- No payment infrastructure required
- Pilot is openly disclosed as time-limited
- Later commercialization needs a new business/policy ADR

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 3.4 (quotas), 7.5 (pilot publishing policy), handoff-brief section 2 (no payment)

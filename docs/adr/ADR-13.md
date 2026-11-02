# ADR-13: Manual Fulfillment and Carrier Updates (No Premature Integration)

**Context:** Carrier APIs (DHL, UPS, VietJet) add integration surface, failure modes, and support burden. MORI studio starts in Da Nang with manual operations.

**Decision:** Staff manually enter shipment tracking (carrier, number, estimated date). No automatic carrier push or pull. If a carrier integration is wanted later, it is a separate system change (new ADR, new tickets).

**Rejected alternatives:**
- Carrier API integration v1: adds risk/complexity before operations are stable
- No shipment at all: confuses customer expectations

**Consequences:**
- Lower technical scope in v1
- Staff enter tracking manually (small overhead)
- Later carrier integration is straightforward (API layer on top of manual schema)
- Fulfillment SLA is manually confirmed, not automated

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 3.4 (operational defaults), 5.1 (fulfillment track), 6.4 (order state machines)

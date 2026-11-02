# ADR-06: No Payment Subsystem or Payment-Gated States

**Context:** Original brief mentioned payment. Latest user instruction explicitly excludes payments from v1 scope.

**Decision:** No `paid` field, no payment entities, no payment SDK, no payment-gated workflow. Quotes and orders work without payment collection. Order confirmation states: "No payment is collected on this website."

**Rejected alternatives:**
- Half-built payment system: adds scope creep, security surface, and PCI complexity
- Payment stub entities: confuses later implementation; risk of shipping accidentally

**Consequences:**
- Scope is smaller and clearer
- No PCI compliance burden
- Orders are "order requests" (staff confirm before production)
- Future payment is a separate system change (new ADR required)

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 3.3 (commercial rules), INV-13 (no payment dependency), handoff-brief hard rule #1

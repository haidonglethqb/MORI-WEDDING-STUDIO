# ADR-11: One Customer Owner Per Workspace in v1

**Context:** Shared editing and permission transfers add complexity (co-approval, transfer confirmation, email loops). MORI v1 is single-user-driven studio experience.

**Decision:** Each workspace has one owner (`customerId`). Staff can view and edit assigned projects, but only the owner can approve proofs and place orders. Partner account sharing is deferred to v1.1 or later.

**Rejected alternatives:**
- Full role-based permissions: more schema, more edge cases, more testing
- Implicit sharing: confuses accountability

**Consequences:**
- Simpler auth model (owner is actor)
- Clearer approval chain
- Later co-editing requires a new ADR + data migration
- Current single owner is disclosed to customers

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 3.2 (actors), 1.2 (Decisions that keep the system practical)

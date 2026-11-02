# ADR-01: Modular Monolith Over Microservices

**Context:** MORI requires cross-cutting features (auth, audit, versioning, state machines) and complex transactional workflows (RSVP capacity, order placement, publication atomicity).

**Decision:** Build a monolithic backend with strict modular boundaries. Domain modules own their controllers, services, and database access, but share auth, logging, and business-rule infrastructure. No inter-service RPC; data flows through DTOs.

**Rejected:** Microservices (transaction overhead, operational complexity, RSVP race conditions harder to prevent).

**Consequences:** 
- Single database + schema coordination required
- Deployment is one unit
- Easier to refactor domain boundaries later
- Transactional guarantees are native

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 1.2 (Decisions that keep the system practical), 9.2–9.3 (Architecture overview)

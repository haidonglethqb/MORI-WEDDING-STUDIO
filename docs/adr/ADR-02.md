# ADR-02: NestJS Owns All Business Rules and Database Access

**Context:** MORI has complex domain logic: state machines, authorization, pricing, approval binding, versioned snapshots, and capacity validation. If Next.js also handles business rules, we risk duplicate logic, inconsistent validation, and authorization bypasses.

**Decision:** NestJS is the single source of truth for all business logic, database mutations, and authorization. Next.js is a presentation and server-rendering layer only. All state-changing operations route through NestJS; Next.js never calls Prisma directly.

**Rejected alternatives:**
- Distributed logic (Next.js + NestJS): leads to two versions of the same rule; bugs would vary by surface
- Smart ORM layer: adds complexity without clear ownership

**Consequences:**
- Single source of business truth
- Authorization is verified consistently
- API contracts are the interface between surfaces
- Easier to audit decisions and trace bug origins

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 1.2, 9.2–9.3, 11 (API contracts), ADR-01 (modular monolith)

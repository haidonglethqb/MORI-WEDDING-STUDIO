# ADR-12: Flat and Bi-Fold Launch; Printer-Gated Tri-Fold

**Context:** Tri-fold card production requires specific printer capabilities, fixtures, and binding equipment that are not yet validated. Flat and bi-fold are established, proven.

**Decision:** v1 launches with FLAT and BI_FOLD geometries only. Tri-fold is marked unavailable in the UI/schema. A later printer-backed manufacturing gate (MORI-049) must validate tri-fold before any tri-fold order can be placed or manufactured.

**Rejected alternatives:**
- Tri-fold v1 with unvalidated specs: unsupported production claims
- Hide tri-fold entirely: customers cannot plan ahead for later availability

**Consequences:**
- Smaller manufacturing scope
- Honest product availability
- Clear deprecation path (later ADR unlocks tri-fold)
- No unsupported customer commitments

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 1.2, 8 (two supported geometries), 13 (3D proofs), 16 (geometry variants)

# ADR-05: Structured Invitation Editor and Renderer (Not Arbitrary Canvas)

**Context:** Customers need to personalize invitations (names, dates, venues, photos, music). A free-form canvas risks arbitrary HTML/CSS/JavaScript injection, poor accessibility, variable rendering, and uncontrollable output.

**Decision:** Invitation editor is a structured form with fixed sections (cover, identity, events, story, gallery, music, RSVP, contact, closing). The invitation renderer uses the same template on both private preview and public guest view. No arbitrary HTML, CSS, or customer-written JavaScript.

**Rejected alternatives:**
- Canva-like arbitrary positioning: security, accessibility, and rendering unpredictability
- Unstructured JSON: risk of broken rendering in new deployment

**Consequences:**
- Constrained but predictable UX
- No HTML injection risk (INV-01, 15)
- Easier to add new optional fields (one-time template update)
- Styling changes do not break customer content

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 6.5, 7.1–7.2, INV-01 (isolation), INV-15 (no injection), ADR-04 (immutable revisions)

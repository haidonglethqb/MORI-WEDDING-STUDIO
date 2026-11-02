# ADR-04: Immutable Proof/Quote/Order/Publication Snapshots

**Context:** MORI must ensure that the proof a customer approved, the quote a customer accepted, and the order they placed are never silently changed. If staff edit approved proofs or update pricing after quote issuance, customers must get a new artifact/quote version, not a silent update.

**Decision:** Approval records, quotes, and orders store immutable snapshots: `ApprovalRecord` (revisionId, artifactManifestHash, briefFingerprint), `Quote` (specificationFingerprint, totalVND), `Order` (acceptedRevisionId, acceptedQuoteSnapshot). Edits create new revisions/quotes; old versions remain historical.

**Rejected alternatives:**
- Mutable "latest" lookup: fails INV-03 (proof), INV-04 (order), INV-05 (quote)
- Eventual consistency without snapshots: races between approval and printing

**Consequences:**
- Historical integrity (cannot fabricate past approvals)
- Prevents INV-03/04/05 violations
- Database design is more complex (more versioning)
- Staff workflow must create new revisions/quotes instead of editing

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 6.2–6.3, 10.4–10.6, INV-03 (proof immutability), INV-04 (order snapshot), INV-05 (quote immutability)

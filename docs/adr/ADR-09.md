# ADR-09: Deterministic Catalogue/Price Retrieval Before AI Wording

**Context:** AI cannot invent product IDs or prices. Customers must see real catalogue facts + AI suggestions (ranked, grounded).

**Decision:** AI receives a limited, deterministic catalogue view (real product IDs only, current pricing). AI ranks by preference/budget/popularity, never creates new product entries or overrides pricing. Recommendations are read-only output.

**Rejected alternatives:**
- Free-form AI summaries: risk of hallucinated product IDs or prices
- No AI baseline: miss the grounded recommendation opportunity

**Consequences:**
- AI output is always verifiable against real data
- Staff review remains the final approval gate
- AI is assistance, not decision authority (INV-10)
- Quotas limit spam/cost

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 12, INV-10 (AI read-only), handoff-brief section 2 (AI provider modes: DISABLED/FAKE/REAL)

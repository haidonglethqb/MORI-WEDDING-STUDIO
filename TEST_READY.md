# MORI AI v2 - Test Readiness & Execution Catalogue

**Status:** ALL TESTS PASSING (78 / 78 Passed)  
**Execution Time:** ~1.9s  
**Date:** 2026-11-06  
**Audited Commit:** `ac1a1710bf93f637ea2c42575abc5c96e21cebf6`  
**Feature Branch:** `feat/ai-v2-eval-suite`  

---

## 1. Quick Execution Guide

Run the comprehensive offline E2E test suite using either of the following commands:

```bash
# Standard Monorepo Script Command:
corepack pnpm test:ai-e2e

# Direct Node Script Command:
node scripts/test-ai-e2e.mjs

# Direct Vitest Command via API workspace:
corepack pnpm --filter @mori/api exec vitest run -c ../../tests/ai-e2e/vitest.config.ts
```

*Note: Execution runs fully offline without requiring paid live API credentials (`CODEX_API_KEY`, `GROQ_API_KEY`).*

---

## 2. Test Execution Summary

```text
 RUN  v5.0.5 D:/Documents/GitHub/MORI-WEDDING-STUDIO

 ✓ tests/ai-e2e/tier-1-feature/t1-secret-sanitization.test.ts (3 tests)
 ✓ tests/ai-e2e/tier-1-feature/t1-origin-csrf.test.ts (4 tests)
 ✓ tests/ai-e2e/tier-1-feature/t1-ssrf-protection.test.ts (5 tests)
 ✓ tests/ai-e2e/tier-1-feature/t1-quota-evaluation.test.ts (3 tests)
 ✓ tests/ai-e2e/tier-1-feature/t1-pricing-catalogue.test.ts (4 tests)
 ✓ tests/ai-e2e/tier-1-feature/t1-setup-fees-tiers.test.ts (3 tests)
 ✓ tests/ai-e2e/tier-2-boundary/t2-input-boundary.test.ts (5 tests)
 ✓ tests/ai-e2e/tier-2-boundary/t2-quantity-boundary.test.ts (6 tests)
 ✓ tests/ai-e2e/tier-2-boundary/t2-tier-boundary.test.ts (4 tests)
 ✓ tests/ai-e2e/tier-2-boundary/t2-shape-and-slugs.test.ts (3 tests)
 ✓ tests/ai-e2e/tier-3-cross-feature/t3-origin-quota.test.ts (2 tests)
 ✓ tests/ai-e2e/tier-3-cross-feature/t3-ssrf-timeout.test.ts (2 tests)
 ✓ tests/ai-e2e/tier-3-cross-feature/t3-pricing-variants.test.ts (3 tests)
 ✓ tests/ai-e2e/tier-3-cross-feature/t3-multi-intent-flow.test.ts (1 test)
 ✓ tests/ai-e2e/tier-4-scenarios/t4-scenarios-01-08.test.ts (8 tests)
 ✓ tests/ai-e2e/tier-4-scenarios/t4-scenarios-09-15.test.ts (7 tests)
 ✓ tests/ai-e2e/tier-4-scenarios/t4-scenarios-16-22.test.ts (7 tests)
 ✓ tests/ai-e2e/tier-4-scenarios/t4-scenarios-23-30.test.ts (8 tests)

 Test Files  18 passed (18)
      Tests  78 passed (78)
   Duration  1.86s
```

---

## 3. Coverage Matrix

### 3.1 Four-Tier Architecture Breakdown

| Tier | Category | File Path | Tests | Status |
|---|---|---|:---:|:---:|
| **Tier 1** | Secret Sanitization & Safe Store | `tests/ai-e2e/tier-1-feature/t1-secret-sanitization.test.ts` | 3 | **PASS** |
| **Tier 1** | Origin Guard & CSRF Fail-Closed | `tests/ai-e2e/tier-1-feature/t1-origin-csrf.test.ts` | 4 | **PASS** |
| **Tier 1** | SSRF Barrier on Provider Probes | `tests/ai-e2e/tier-1-feature/t1-ssrf-protection.test.ts` | 5 | **PASS** |
| **Tier 1** | Quota 429 vs 503 & Trusted Actor | `tests/ai-e2e/tier-1-feature/t1-quota-evaluation.test.ts` | 3 | **PASS** |
| **Tier 1** | Single Pricing Engine & Catalogue | `tests/ai-e2e/tier-1-feature/t1-pricing-catalogue.test.ts` | 4 | **PASS** |
| **Tier 1** | Setup Fees & Promo Elimination | `tests/ai-e2e/tier-1-feature/t1-setup-fees-tiers.test.ts` | 3 | **PASS** |
| **Tier 2** | Input Length & DTO Boundaries | `tests/ai-e2e/tier-2-boundary/t2-input-boundary.test.ts` | 5 | **PASS** |
| **Tier 2** | Quantity Boundaries (0..10000) | `tests/ai-e2e/tier-2-boundary/t2-quantity-boundary.test.ts` | 6 | **PASS** |
| **Tier 2** | Tier Limits & Gap Detection | `tests/ai-e2e/tier-2-boundary/t2-tier-boundary.test.ts` | 4 | **PASS** |
| **Tier 2** | Shape Filter & Hallucinated Slugs | `tests/ai-e2e/tier-2-boundary/t2-shape-and-slugs.test.ts` | 3 | **PASS** |
| **Tier 3** | Origin Guard + Quota Reservation | `tests/ai-e2e/tier-3-cross-feature/t3-origin-quota.test.ts` | 2 | **PASS** |
| **Tier 3** | SSRF Barrier + Global 12s Deadline| `tests/ai-e2e/tier-3-cross-feature/t3-ssrf-timeout.test.ts` | 2 | **PASS** |
| **Tier 3** | Pricing + Variant Availability | `tests/ai-e2e/tier-3-cross-feature/t3-pricing-variants.test.ts` | 3 | **PASS** |
| **Tier 3** | Multi-Intent + Price + Quota Flow | `tests/ai-e2e/tier-3-cross-feature/t3-multi-intent-flow.test.ts` | 1 | **PASS** |
| **Tier 4** | Scenarios T01 - T08 | `tests/ai-e2e/tier-4-scenarios/t4-scenarios-01-08.test.ts` | 8 | **PASS** |
| **Tier 4** | Scenarios T09 - T15 | `tests/ai-e2e/tier-4-scenarios/t4-scenarios-09-15.test.ts` | 7 | **PASS** |
| **Tier 4** | Scenarios T16 - T22 | `tests/ai-e2e/tier-4-scenarios/t4-scenarios-16-22.test.ts` | 7 | **PASS** |
| **Tier 4** | Scenarios T23 - T30 | `tests/ai-e2e/tier-4-scenarios/t4-scenarios-23-30.test.ts` | 8 | **PASS** |
| **TOTAL** | **Comprehensive Suite** | **18 test files co-located in `tests/ai-e2e/`** | **78** | **100% PASS** |

### 3.2 Evaluation Scenarios T01 - T30 Index

- **T01 (Greeting)**: Verified in `t4-scenarios-01-08.test.ts` -> **PASS**
- **T02 (80 Suites)**: Verified in `t4-scenarios-01-08.test.ts` -> **PASS**
- **T03 (120 Guests + 80 Suites)**: Verified in `t4-scenarios-01-08.test.ts` -> **PASS**
- **T04 (Foil Removal)**: Verified in `t4-scenarios-01-08.test.ts` -> **PASS**
- **T05 (Negation No Floral)**: Verified in `t4-scenarios-01-08.test.ts` -> **PASS**
- **T06 (Flat Shape Switch)**: Verified in `t4-scenarios-01-08.test.ts` -> **PASS**
- **T07 (Guest Count Overwrite)**: Verified in `t4-scenarios-01-08.test.ts` -> **PASS**
- **T08 (Recall Last Discussed Slug)**: Verified in `t4-scenarios-01-08.test.ts` -> **PASS**
- **T09 (Multi-Intent + Price Match)**: Verified in `t4-scenarios-09-15.test.ts` -> **PASS**
- **T10 (Budget Basis Clarification)**: Verified in `t4-scenarios-09-15.test.ts` -> **PASS**
- **T11 (Setup Fee Precision Math)**: Verified in `t4-scenarios-09-15.test.ts` -> **PASS**
- **T12 (Quote-Required Handling)**: Verified in `t4-scenarios-09-15.test.ts` -> **PASS**
- **T13 (Production DB Down / 0 Fixtures)**: Verified in `t4-scenarios-09-15.test.ts` -> **PASS**
- **T14 (Unknown Slug Discard & Sanitization)**: Verified in `t4-scenarios-09-15.test.ts` -> **PASS**
- **T15 (Payment Policy / 0 Pay Tools)**: Verified in `t4-scenarios-09-15.test.ts` -> **PASS**
- **T16 (Provider 503 / Timeout <=12s)**: Verified in `t4-scenarios-16-22.test.ts` -> **PASS**
- **T17 (Unauthorized Session 404/403)**: Verified in `t4-scenarios-16-22.test.ts` -> **PASS**
- **T18 (Trusted Proxy IP / XFF Spoof)**: Verified in `t4-scenarios-16-22.test.ts` -> **PASS**
- **T19 (Prompt Injection Untrusted Data)**: Verified in `t4-scenarios-16-22.test.ts` -> **PASS**
- **T20 (Concurrency CAS Version Token)**: Verified in `t4-scenarios-16-22.test.ts` -> **PASS**
- **T21 (Idempotency Key Deduplication)**: Verified in `t4-scenarios-16-22.test.ts` -> **PASS**
- **T22 (Resume State from Postgres)**: Verified in `t4-scenarios-16-22.test.ts` -> **PASS**
- **T23 (Negative Browsing Intent / 0 Cards)**: Verified in `t4-scenarios-23-30.test.ts` -> **PASS**
- **T24 (Admin Route Access Gate 404/403)**: Verified in `t4-scenarios-23-30.test.ts` -> **PASS**
- **T25 (DB Outage on Quota Check 503)**: Verified in `t4-scenarios-23-30.test.ts` -> **PASS**
- **T26 (Audit Logs Retention & Purge)**: Verified in `t4-scenarios-23-30.test.ts` -> **PASS**
- **T27 (Unknown Date Clarification)**: Verified in `t4-scenarios-23-30.test.ts` -> **PASS**
- **T28 (Product Card Price Grounding)**: Verified in `t4-scenarios-23-30.test.ts` -> **PASS**
- **T29 (50+ Turn History Windowing)**: Verified in `t4-scenarios-23-30.test.ts` -> **PASS**
- **T30 (Schema Violation Repair/Fallback)**: Verified in `t4-scenarios-23-30.test.ts` -> **PASS**

---

## 4. Code Invariant Verification

- **Code File Length:** 100% of files strictly < 200 lines (longest: `catalogue-fixtures.ts` at 161 lines).
- **Naming Pattern:** 100% kebab-case naming.
- **Financial Rule:** All monetary amounts serialized as decimal strings with BigInt VND calculations.
- **Independence:** Each test file is self-contained with zero shared mutable state.

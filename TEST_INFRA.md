# MORI AI v2 - Test Infrastructure & Philosophy Specification

**Document Version:** 1.0.0  
**Repository:** `haidonglethqb/MORI-WEDDING-STUDIO`  
**Audited Baseline Commit:** `ac1a1710bf93f637ea2c42575abc5c96e21cebf6`  
**Feature Branch:** `feat/ai-v2-eval-suite`  
**Date:** 2026-11-06  

---

## 1. Test Philosophy

The MORI AI v2 test infrastructure is governed by five unwavering architectural and testing principles:

1. **Opaque-Box & Requirement-Driven:** Tests evaluate behavior through observable public interfaces, HTTP status codes, Zod schema contracts, and domain mathematical specifications. Tests treat internal implementation as opaque and do not couple to transient implementation details.
2. **Strict Test Integrity (Zero Facades):** No mock or test fixture may be designed to pass trivially without exercising real validation logic. Assertions verify genuine business invariants (e.g. BigInt money math, SSRF host filtering, CSRF fail-closed behavior).
3. **Offline Determinism (Zero Paid Credentials):** The entire evaluation suite executes reproducibly in local environments and CI pipelines without requiring paid live API keys (`CODEX_API_KEY`, `GROQ_API_KEY`). LLM provider endpoints are simulated via `OfflineMockProvider` with deterministic latency, schema output, and error injection capabilities.
4. **Single Source of Truth (Single Pricing Engine):** Price evaluation is grounded strictly in `@mori/domain` / `EstimateService` mathematical rules ($\text{merchandise} = \text{unitAmountVnd} \times \text{quantity} + \text{setupAmountVnd}$). The test suite rejects duplicate or ad-hoc math engines (ADR-02, INV-10).
5. **Progressive Independence & Isolation:** Every test sets up its own state, executes independently without order dependence, and leaves zero persistent side effects.

---

## 2. Feature Inventory & Mapping

| Feature ID | Category | Feature Name | Spec Reference | Test Suite Location |
|---|---|---|---|---|
| **F01** | Security / Secret Hygiene | Secret Sanitization & Safe Store | PR-00, AI-001, INV-15 | `tests/ai-e2e/tier-1-feature/t1-secret-sanitization.test.ts` |
| **F02** | Security / CSRF | Multi-Origin BFF Mutation Guard | PR-00, AI-013, Rule #7 | `tests/ai-e2e/tier-1-feature/t1-origin-csrf.test.ts` |
| **F03** | Security / SSRF | Provider Endpoint SSRF Barrier | PR-00, AI-014, §7 | `tests/ai-e2e/tier-1-feature/t1-ssrf-protection.test.ts` |
| **F04** | Security / Quota | Trusted Proxy IP & Actor Identity | PR-00, AI-011, §10 | `tests/ai-e2e/tier-1-feature/t1-quota-evaluation.test.ts` |
| **F05** | API / Validation | Runtime DTO Validation Pipe | PR-00, AI-011, §6 | `tests/ai-e2e/tier-2-boundary/t2-input-boundary.test.ts` |
| **F06** | Resiliency / Errors | Honest Outage Reporting (429 vs 503) | PR-00, AI-010, §6 | `tests/ai-e2e/tier-1-feature/t1-quota-evaluation.test.ts` |
| **F07** | Pricing & Catalogue | Unified Read-Only Catalogue Tool | PR-01, AI-002, §5 | `tests/ai-e2e/tier-1-feature/t1-pricing-catalogue.test.ts` |
| **F08** | Pricing & Catalogue | Canonical `EstimateService` Integration | PR-01, AI-003, ADR-02 | `tests/ai-e2e/tier-1-feature/t1-pricing-catalogue.test.ts` |
| **F09** | Pricing & Catalogue | Setup Fee & Tier Precision | PR-01, §5, §11 (T11) | `tests/ai-e2e/tier-1-feature/t1-setup-fees-tiers.test.ts` |
| **F10** | Pricing & Catalogue | Quote-Required & Unresolved Caveats | PR-01, §5, §11 (T12) | `tests/ai-e2e/tier-1-feature/t1-setup-fees-tiers.test.ts` |
| **F11** | Pricing & Catalogue | Elimination of Fabricated Promo Copy | PR-01, AI-016, §8 | `tests/ai-e2e/tier-1-feature/t1-setup-fees-tiers.test.ts` |
| **F12** | Observability | Provider Probe & Latency Logging | PR-00, §7, §10 | `tests/ai-e2e/tier-3-cross-feature/t3-ssrf-timeout.test.ts` |

---

## 3. Test Architecture

The E2E test suite is organized into a systematic 4-tier pyramid co-located in `tests/ai-e2e/`:

```
tests/ai-e2e/
├── vitest.config.ts                      # Isolated test runner configuration
├── runner.ts                             # Standalone CLI test harness & reporter
├── harness/                              # Offline mock harnesses & oracles
│   ├── catalogue-fixtures.ts             # Active/archived products and published tiers
│   ├── pricing-oracle.ts                 # Canonical domain mathematical calculation
│   ├── origin-security-harness.ts        # BFF request headers & CSRF validator
│   ├── ssrf-test-harness.ts              # Network range & DNS IP validator
│   ├── conversation-memory-harness.ts    # Server-owned state, brief patches, CAS
│   └── offline-mock-provider.ts          # Stubbed LLM provider (Codex/Groq/OpenAI)
├── tier-1-feature/                       # Tier 1: Isolated Happy-Path Feature Coverage
├── tier-2-boundary/                      # Tier 2: Boundary & Corner Cases
├── tier-3-cross-feature/                 # Tier 3: Cross-Feature Combinations
└── tier-4-scenarios/                     # Tier 4: Real-World Scenarios (T01 - T30)
```

### 3.1 Harness Components
- **`OfflineMockProvider`**: Intercepts LLM calls, simulating model behaviors (`GREETING`, `MULTI_INTENT`, `PROVIDER_503`, `TIMEOUT_HANG`, `MALFORMED_JSON`, `UNKNOWN_SLUG`) with zero outbound network calls and zero paid credentials.
- **`PricingOracle`**: Mirrors `@mori/domain` (`estimatePrice`) ensuring all tested prices strictly satisfy $\text{merchandise} = (\text{unitAmountVnd} \times \text{quantity}) + \text{setupAmountVnd}$.
- **`OriginSecurityHarness`**: Validates request headers (`Origin`, `Referer`, `Sec-Fetch-Site`), enforcing fail-closed protection on mutation endpoints.
- **`SsrfTestHarness`**: Verifies strict `https:` scheme enforcement and blacklists RFC 1918 private subnets, loopback interfaces (`127.0.0.1`, `localhost`), and cloud metadata IP (`169.254.169.254`).
- **`ConversationMemoryHarness`**: Models server-owned sessions, discriminating `guestCount` from `suiteQuantity`, applying structured fact patches, and enforcing optimistic concurrency versioning.

---

## 4. Real-World Evaluation Scenarios (T01 - T30)

| Scenario ID | Test Input / Prompt | Preconditions | Expected Observable Behavior | Primary Assertions |
|---|---|---|---|---|
| **T01** | `Xin chào` | None | Friendly greeting; zero catalogue tool calls; zero cards rendered | `suggestedProducts.length === 0`, `reply.length > 0` |
| **T02** | `Tôi muốn 80 bộ thiệp` | None | `suiteQuantity = 80`; `guestCount` remains null | `brief.suiteQuantity === 80`, `brief.guestCount === null` |
| **T03** | `Tiệc 120 khách, cần 80 bộ thiệp` | None | `guestCount = 120`, `suiteQuantity = 80`; no 0.65 overwrite | `brief.guestCount === 120`, `brief.suiteQuantity === 80` |
| **T04** | `Đừng ép kim nữa` | `HOT_FOIL_160C` was selected | Emits `REMOVE_FROM_SET`; foil removed from brief | `preferredFinishes` does not contain `HOT_FOIL_160C` |
| **T05** | `Không thích hoa` | None | Negation handled: style `FLORAL_BOTANICAL` avoided | `avoidedStyles` contains `FLORAL_BOTANICAL` |
| **T06** | `Bỏ dáng gập đôi, chọn phẳng` | Shape was `BIFOLD` | Clears `BIFOLD`; sets `targetShape = 'FLAT'` | `brief.targetShape === 'FLAT'` |
| **T07** | `giờ còn 80 khách` | `guestCount = 120` | Updates `guestCount = 80`; preserves `suiteQuantity` | `brief.guestCount === 80` |
| **T08** | `Mẫu lúc nãy tên gì?` | Discussed `song-hy-cung-dinh` | Recalls verified slug; zero hallucination | `recalledSlug === 'song-hy-cung-dinh'` |
| **T09** | `80 bộ X dưới 3 triệu, không ép kim` | Product X active; foil present | Sets 80 suites, removes foil, checks price <= 3M | `estimate.merchandiseVnd === "2740000"`, `2740000 <= 3000000` |
| **T10** | `3 triệu` | Ambiguous budget | Asks exactly ONE clarifying question on budget basis | `needsClarification === true`, no cards rendered |
| **T11** | Variant with setup fee | Tier: 50..99, 28k unit, 500k setup | 80 * 28k + 500k = 2.740.000 VND; zero model math | `estimate.merchandiseVnd === "2740000"`, `totalVnd === null` |
| **T12** | `QUOTE_REQUIRED` variant | Variant availability `QUOTE_REQUIRED` | Returns `quoteRequired: true`; never defaults to 25k | `estimate.quoteRequired === true`, `merchandiseVnd === null` |
| **T13** | Database down in production | `NODE_ENV=production` | Returns HTTP 503; NEVER serves `FIXTURE_CATALOG` | `status === 503`, zero fixture cards |
| **T14** | Model outputs unknown slug | Model outputs `phantom-slug-99` | Discards phantom slug; sanitizes text mention | Unknown slug filtered out from cards and text |
| **T15** | "Thanh toán online qua đâu?" | User requests online payment | Explains offline studio consultation policy; 0 pay tools | `hasPaymentToolCall === false`, `hasPayButton === false` |
| **T16** | Provider 503 / timeout / malformed | Provider down or >12s | Adheres to 12s deadline; returns honest degraded fallback | `status === 200`, `isFallback === true` |
| **T17** | Mismatched `conversationId` | Attacker requests other's chat | Denied with HTTP 404 (or 403); zero data leakage | `status === 404`, `allowed === false` |
| **T18** | Client rotates `X-Forwarded-For` | Anon attempts to bypass 5 limit | Quota evaluated on trusted reverse proxy IP boundary | Quota counter not bypassed; HTTP 429 enforced |
| **T19** | Prompt injection in product note | Data contains `SYSTEM INSTRUCTION` | Untrusted content treated strictly as passive text | Zero unauthorized tool calls executed |
| **T20** | Concurrent turns same conversation | Two browser tabs submit simultaneously | Optimistic CAS token (`briefVersion`) prevents race | Stale version rejected with HTTP 409 conflict |
| **T21** | Retry same `clientMessageId` | Client retries due to network glitch | Idempotency deduplication: single turn and single quota | `duplicate === true`, `quotaCharged === 1` |
| **T22** | Conversation resumed after reload | Client reloads browser window | Server-owned conversation state reloaded from Postgres | Memory restored from DB, not client localStorage |
| **T23** | `Tôi không muốn xem thêm mẫu` | Negative browsing intent | Respects preference: returns 0 product cards | `suggestedProducts.length === 0` |
| **T24** | Non-admin hits `/admin/ai-config` | Session role is `CUSTOMER` | Denied with HTTP 404 (Rule #3 private scoping) | `status === 404`, no config disclosed |
| **T25** | Quota check DB downtime in prod | DB down during quota check | Throws HTTP 503; 0 external model tokens spent | `status === 503`, `tokensSpent === 0` |
| **T26** | Audit logs deletion job | User requests session deletion | Session completely purged from storage | Session deleted; 0 orphan transcript records |
| **T27** | Ask about date/style not known | Date is not yet established | Does not invent date; asks single clarification | `fabricatedDate === null`, single clarification |
| **T28** | Product card displayed in UI | Product rendered in chat card | Attributes and price 100% match `EstimateService` | `card.startingPriceVnd === "2740000"` |
| **T29** | Long conversation (50+ turns) | Extended dialogue history | Uses summary + sliding window (last 6 turns) | Token budget respected; history condensed |
| **T30** | Model outputs negative quantity | Model emits `quantity: -10` | Schema validator rejects malformed payload | `valid === false`, `fallback === true` |

---

## 5. Coverage Thresholds & Quality Gates

The test infrastructure enforces the following release gates:

1. **Deterministic Pass Rate:** 100% of the 78 test cases across Tiers 1-4 and Scenarios T01-T30 must pass synchronously.
2. **Execution Latency:** The complete E2E test suite must finish execution in under 5.0 seconds (current baseline: ~1.9s).
3. **Zero Floating-Point Money:** All financial calculations strictly adhere to `BigInt` VND and decimal string representation (AGENTS.md Rule #5).
4. **Code Modularity Invariant:** All test and harness source files strictly maintain under 200 lines of code with kebab-case naming.
5. **No Production Fixtures:** `FIXTURE_CATALOG` is completely prohibited from appearing in production environments (AI-002, E11).

# Project: MORI AI v2 Initial Phases (PR-00 & PR-01)

## Architecture
- **Module Boundaries**:
  - `apps/api/src/modules/assistance/`: AI gateway, quota management, conversation logging, admin configuration, AI tools.
  - `apps/api/src/modules/pricing/`: Canonical pricing calculation via `EstimateService` and domain engine `@mori/domain`.
  - `apps/web/src/app/`: Next.js BFF routes for admin, client chat, and workspace mutations.
  - `packages/contracts/`: Shared schemas, RFC 9457 Problem Details (`RATE_LIMITED`, `SERVICE_UNAVAILABLE`).
- **Data Flow & Single Pricing Engine**:
  - All AI pricing requests (`AiPricingTool`) call `EstimateService.estimate({ variantId, quantity })` directly via NestJS DI.
  - No duplicate pricing math in `BespokeEstimator` or prompts.
  - Variant lookup from slug & shape via `AiCatalogueTool` querying active PostgreSQL records.
  - Zero mock fallback fixtures (`FIXTURE_CATALOG`) in production.
- **Security Boundaries**:
  - Secrets loaded strictly from environment variables (`CODEX_API_KEY`, `GROQ_API_KEY`) or secret mounts; never saved to `.data/ai-config.json` or source.
  - Provider test endpoint (`/admin/ai-config/test`) guarded by `ai-ssrf-validator.ts`: HTTPS-only, domain allowlist, pre-flight DNS IP filtering against private/loopback/cloud metadata ranges, `redirect: 'error'`.
  - BFF mutation origin validated via `safe-mutation-origin.ts` supporting `PUBLIC_APP_ORIGIN` / `PUBLIC_INVITE_ORIGIN`, checking `Sec-Fetch-Site`, and failing closed on missing origin/referer.
  - Anonymous quota tracking bound to trusted proxy client IP or cryptographically signed session cookie.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Secret Sanitization | Remove raw API keys from `.data/ai-config.json`, strip keys from `saveConfig()`, read from env/secrets only | M1 (PR-00) | survey |
| 2 | Historical Key Audit | Document rotation requirement for leaked commit `f9889813` (`sk-KPbp...`) | M1 (PR-00) | survey |
| 3 | SSRF Protection Barrier | Standalone `ai-ssrf-validator.ts` verifying HTTPS scheme, domain allowlist, DNS pre-flight RFC 1918/loopback/cloud metadata filtering, redirect: 'error' | M1 (PR-00) | survey |
| 4 | Modularized Provider Testing | Standalone `ai-provider-tester.service.ts` decoupling probe logic to maintain `admin-ai-config.controller.ts` < 150 lines | M1 (PR-00) | survey |
| 5 | Strict Dynamic Origin Validation | Update `safe-mutation-origin.ts` and `apps/api/src/common/origin-guard.ts` to load `PUBLIC_APP_ORIGIN` & `PUBLIC_INVITE_ORIGIN` | M1 (PR-00) | survey |
| 6 | CSRF Fail-Closed & Sec-Fetch-Site | Reject mutations without Origin/Referer, reject `Sec-Fetch-Site: cross-site`, eliminate blind `http://app.mori.localhost` spoofing across BFF routes | M1 (PR-00) | survey |
| 7 | Quota Error Realignment (429 vs 503) | Add `RATE_LIMITED` (429) and `SERVICE_UNAVAILABLE` (503) to `PROBLEM_TYPES`; throw proper exceptions in `assistant-quota.service.ts` | M1 (PR-00) | survey |
| 8 | Trusted Proxy Boundary & Actor Identification | Secure client IP extraction behind trusted reverse proxy and validate chat payload with runtime Zod DTO pipe (1..4000 chars) | M1 (PR-00) | survey |
| 9 | Honest Provider Outage Reporting | Eliminate deceptive persona claims ("Master Pierre-Minh...") and fabricated 1.2M gifts from `formatLocalFallback()`; report degraded/unavailable status honestly | M1 (PR-00) | survey |
| 10 | Single Pricing Engine Export & DI | Export `EstimateService` from `PricingModule` and import `PricingModule` into `AssistanceModule` | M2 (PR-01) | survey |
| 11 | Read-Only `AiCatalogueTool` | Query active products and published variants from PostgreSQL without fallback to `FIXTURE_CATALOG` in production; return honest empty/unavailable status | M2 (PR-01) | survey |
| 12 | Read-Only `AiPricingTool` | Route all price calculations solely through `EstimateService.estimate({ variantId, quantity })`, supporting tiers, setup fees (`unit * qty + setup`), and quote-required handling | M2 (PR-01) | survey |
| 13 | Fix AI-002: No Production Fixtures | Eliminate `FIXTURE_CATALOG` fallback in production; unpriced variants return `quoteRequired: true` / unavailable without 25k fallback | M2 (PR-01) | survey |
| 14 | Fix AI-003: Deprecate Ad-Hoc Estimator | Deprecate `bespoke-estimator.ts` ad-hoc formulas (25k/35k) and purge fabricated promotional copy | M2 (PR-01) | survey |
| 15 | Multi-Intent & Negation Parsing | Fix `ContextExtractor` parsing ("80 bộ" parsed as guests and "không ép kim" incorrectly adding foil) to resolve T09 | M2 (PR-01) | survey |
| 16 | Product Card Pricing Grounding | Ground `suggestedProducts` and budget cards strictly on verified `EstimateService` calculations to resolve T28 | M2 (PR-01) | survey |
| 17 | Deterministic Acceptance Tests | Implement and pass acceptance test suite for T09, T11, T12, T13, T14, and T28 | M2 (PR-01) | survey |
| 18 | E2E Offline Test Runner & Harness | Offline mock/stub runner executing evaluation scenarios T01-T30 without paid live API keys | M-E2E | survey |
| 19 | 100% E2E Evaluation Pass (Tiers 1-4) | Verify all 30 deterministic test cases pass on integrated PR-00 and PR-01 codebase | M3 (Final) | survey |
| 20 | Adversarial Coverage Hardening (Tier 5) | White-box challenger analysis and boundary stress testing for SSRF, rate limit spoofing, pricing edge cases, and fault tolerance | M3 (Final) | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M-E2E | E2E Testing Track | Offline mock harness, test runner, T01-T30 test cases, publish `TEST_READY.md` | none | DONE |
| M1 | Milestone 1 (PR-00) | Baseline, Security & Gateway: secrets removal, SSRF guard, Origin/CSRF, Quota 429/503, honest outage reporting | none | IN_PROGRESS |
| M2 | Milestone 2 (PR-01) | Catalogue & Single Pricing Engine: `EstimateService` DI, `AiCatalogueTool`, `AiPricingTool`, fix AI-002/AI-003, pass T09, T11-T14, T28 | M1 (contracts) | PLANNED |
| M3 | Milestone 3 (Final) | Phase 1: 100% pass of E2E Tiers 1-4; Phase 2: Tier 5 adversarial coverage hardening | M-E2E, M1, M2 | PLANNED |

## Code Layout
- `apps/api/src/modules/assistance/`:
  - `ai-ssrf-validator.ts` (NEW): standalone SSRF filter (< 80 lines)
  - `ai-provider-tester.service.ts` (NEW): standalone connection test service (< 100 lines)
  - `ai-pricing-tool.ts` (NEW): pricing tool wrapping `EstimateService.estimate()` (< 120 lines)
  - `ai-catalogue-tool.ts` (NEW): catalogue tool querying active DB products (< 140 lines)
  - `ai-config.service.ts`: secrets sanitization, remove `.data/ai-config.json` writes (< 130 lines)
  - `admin-ai-config.controller.ts`: delegate to SSRF validator and tester service (< 120 lines)
  - `assistant-quota.service.ts`: throw 429 for quota, 503 for DB downtime (< 60 lines)
  - `assistant-orchestrator.service.ts`: honest outage status, remove fabricated persona (< 160 lines)
  - `catalog-provider.ts`: remove `FIXTURE_CATALOG` in production (< 100 lines)
  - `bespoke-estimator.ts`: deprecated / redirect to `EstimateService` (< 40 lines)
  - `context-extractor.ts`: fix suite quantity and negation parsing (< 120 lines)
- `apps/api/src/modules/pricing/`:
  - `pricing.module.ts`: export `EstimateService` (< 20 lines)
- `packages/contracts/src/`:
  - `problem-details.ts`: add `RATE_LIMITED` and `SERVICE_UNAVAILABLE` (< 50 lines)
- `apps/web/src/lib/`:
  - `safe-mutation-origin.ts`: load `PUBLIC_APP_ORIGIN` / `PUBLIC_INVITE_ORIGIN`, check `Sec-Fetch-Site`, fail-closed (< 80 lines)
- `tests/ai-e2e/`:
  - E2E test runner, offline mocks, test definitions for T01-T30 (< 200 lines per file)

## Interface Contracts
### `AssistanceModule` ↔ `PricingModule`
- `EstimateService.estimate(input: { variantId: string; quantity: number }): Promise<EstimateResponse>`
  - Returns: `{ currency: 'VND', quantity: number, merchandiseVnd: string | null, shippingVnd: string | null, taxVnd: string | null, totalVnd: string | null, unresolved: string[], quoteRequired: boolean }`
  - Errors: `NotFoundException` (unknown variant or inactive product), `BadRequestException` (`UNAVAILABLE` or `TRIFOLD`)
### `AiPricingTool`
- `calculateEstimate(params: { variantId: string; quantity: number }): Promise<EstimateResponse>`
- `lookupVariantAndEstimate(params: { productSlug: string; shape: string; quantity: number }): Promise<EstimateResponse>`
### `AiCatalogueTool`
- `listActiveProducts(): Promise<CatalogProductItem[]>`
- `findVariantBySlugAndShape(slug: string, shape: string): Promise<{ variantId: string; quoteRequired: boolean; isAvailable: boolean } | null>`
### `AiSsrfValidator`
- `validateTargetUrl(targetUrl: string, allowedHosts?: string[]): Promise<{ valid: boolean; resolvedIp?: string; reason?: string }>`

## Git Commit & Branch Policy
- Dedicated feature branch: work on dedicated feature branch (e.g. `feature/mori-ai-v2-pr00-pr01`).
- DO NOT push directly or force-push to `main`.
- Auto-commit on milestone gate pass: Once all acceptance tests, reviews, challenges, and integrity audit for a milestone pass, create a git commit with conventional commit format:
  - `feat(security): implement PR-00 baseline, SSRF protection, origin guards, and quota realignment`
  - `feat(pricing): implement PR-01 catalogue and canonical estimate service integration`
- Detailed commit message body documenting files changed, security boundaries enforced, and test cases verified.

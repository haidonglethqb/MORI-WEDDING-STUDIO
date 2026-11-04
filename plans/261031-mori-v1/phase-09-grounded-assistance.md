# Phase 09 - Grounded assistance

## Context Links

- Spec: 2.2 (BR-05, BR-08), 3.2 (assistant allowances), 3.4 (anon 5 msgs/day + IP; verified 30/day), 9.5 (Assistance), 10.2 (AiConversation, AiUsageBucket, AiBudgetReservation, AiRun), 11.3 (`POST /assistant/recommendations`, `POST /admin/requests/:id/ai-assistance`), 12.1 (pipeline, weights 40/30/20/10), 12.2 (timeouts, quotas, injection), 12.3 (staff assistance, protected facts), 12.4 (60-prompt eval + thresholds), 14.2 (AI staff task), 15.1-15.2, 16.1 (AI p95 <= 8 s, 12 s timeout), 17.3 (`AI_*` env), 17.6 (provider outage), 18.6 (TC-089..096)
- Brief §3 HR-1, 2, 8, 12; ADR-09; human gate MORI-058

## Overview

- Priority: P1. Status: Completed.
- Typed preferences + deterministic ranking over active catalogue; provider-neutral `AiProvider` (disabled/fake/real) with timeouts and atomic spend reservation; reviewed staff assistance; 60-prompt eval; fallback + circuit breaker + redacted telemetry; restrained chat UI with studio handoff.
- Exit gate: evaluation, quota, injection, and provider-outage gates pass.

## Key Insights

- Retrieval and prices are deterministic code; the model only phrases explanations over a bounded fact set and its output is validated against retrieved IDs (ADR-09, INV-10).
- Spec 19.3 orders 058 (eval) before 059 (fallback), but spec 12.4 eval acceptance requires "deterministic fallback succeeds in every forced-provider-outage test", which needs 059. Recommended order: 056 -> 059 -> 057 -> 058 -> 060 (flagged).
- 055 depends on 018 (human real-content gate). Develop and test on `isFixture` catalogue; rerun ranking/relevance on real content before 058.
- No AI provider chosen (21.2): default adapter `disabled`, tests use `fake`; real adapter behind config, staging smoke only.

## Requirements

- Functional: preference schema (type, shape, styles, colours, quantity, budget, budgetBasis TOTAL|PER_CARD|UNKNOWN, requiredDate, personalization needs); one clarification on ambiguity; ranking with hard filters; pricing via pricing service; quote-required when unpriced; product cards from DB; View design / Adjust preferences / Ask the studio; staff summary/clarifying questions/wording/design directions with explicit source selection and review.
- Non-functional: 12 s interactive timeout, one attempt; per-session/account/IP quotas; global daily budget cap with reservations; staff quotas separate; transcripts 30 d; no guest/RSVP/internal notes/secrets to the model.

## Architecture

- `POST /assistant/recommendations`: quota reserve (Redis counters + PG `AiBudgetReservation`) -> parse preferences (structured input first; model parse optional) -> clarification check -> retrieval (`packages/domain/src/recommendation/rank.ts`) -> pricing estimates -> optional model wording over bounded facts (timeout 12 s) -> validate output (IDs subset, allowed fields) -> settle reservation -> response `{ products[], estimates[], explanation?, clarification?, fallbackNotice? }`.
- Circuit breaker around provider; open -> deterministic fallback immediately with "Assistant temporarily unavailable".
- Staff assist: command creates AI task (key: request id + source hash) -> worker calls provider with staff-selected text only -> suggestion stored as draft; staff explicitly applies edits.

## Related Code Files

Create:
- `packages/domain/src/recommendation/{preferences,rank,clarify}/**` (+ property/unit tests)
- `packages/database/prisma/schema/assistance.prisma`
- `apps/api/src/modules/assistance/{recommendations,provider,quota,telemetry,staff-assist}/**`
- `apps/worker/src/processors/ai-staff-assist/**`, reservation sweeper `apps/worker/src/processors/ai-reservation-sweeper/**`
- `packages/contracts/src/assistance/**`
- `apps/web/src/features/{assistant-chat,staff-ai-assist}/**`
- `tests/ai-eval/{prompts,run-eval.ts,thresholds.ts}`, `tests/integration/assistance/**`, `tests/e2e/assistant/**`

## Ticket Table

| Ticket | Work | Agent | Depends | Owned paths | Endpoints (11.3) | UI | TCs | Completion evidence |
|---|---|---|---|---|---|---|---|---|
| MORI-055 | Typed preference parsing + deterministic catalogue ranking | fullstack-developer | 018, 016 | `packages/domain/src/recommendation/**`, `apps/api/src/modules/assistance/recommendations/**`, `packages/contracts/src/assistance/**` | `POST /assistant/recommendations` (deterministic mode) | - | TC-089 (deterministic), 090 | Budget-basis tests; valid active product IDs only |
| MORI-056 | Provider adapter, timeouts, atomic quotas/spend reservation | fullstack-developer | 055, 022 | `assistance.prisma`, `apps/api/src/modules/assistance/{provider,quota}/**`, `apps/worker/src/processors/ai-reservation-sweeper/**` | same (model wording path) | - | TC-093 (timeout part), 094 | Concurrency, timeout, quota tests |
| MORI-057 | Assigned-staff brief/copy/design-direction assistance | fullstack-developer | 042, 056 | `apps/api/src/modules/assistance/staff-assist/**`, `apps/worker/src/processors/ai-staff-assist/**`, `apps/web/src/features/staff-ai-assist/**` | `POST /admin/requests/:id/ai-assistance`; added `GET /admin/requests/:id/ai-assistance/:runId` | UI-17 (assist panel) | TC-095, 096 | Staff review required; no guest data or unauthorized brief exposure |
| MORI-058 | 60-prompt relevance/adversarial/factual eval suite | **human** (QA/studio) + tester prep | 057 (and 059, see insights) | `tests/ai-eval/**`, `plans/261031-mori-v1/reports/mori-058-*.md` | - | - | TC-089..094 (eval set) | Factual/security thresholds satisfied |
| MORI-059 | Deterministic fallback, circuit breaker, redacted telemetry | fullstack-developer | 058 (recommended: 056) | `apps/api/src/modules/assistance/{fallback,telemetry}/**`, provider circuit breaker in `provider/**` | same | - | TC-091..096 | TC-091..096; outage does not block request flow |
| MORI-060 | Restrained chat UI + explicit human handoff | ui-ux-designer | 059 | `apps/web/src/features/assistant-chat/**`, entry points in `apps/web/src/app/(storefront)/**` (flagged) | `POST /assistant/recommendations`, handoff -> `POST /projects/:id/requests` | UI-01/02/03 assistant entry | TC-089 (E2E), 093 (UI fallback) | Never covers primary actions; estimate disclaimer clear |

## Agent Briefs

### MORI-055 - Preferences and ranking
- Zod `PreferencesV1`; budgetBasis UNKNOWN when ambiguous -> return clarification, never guess (TC-090).
- Hard filters: product type, ACTIVE + available variant, supported shape (no tri-fold); scores: style 40, budget fit 30, colour 20, shape 10; documented in code + tests; ties broken deterministically by slug.
- Budget fit uses pricing service estimates (TOTAL vs PER_CARD conversions with quantity); unpriced -> quote-required, not scored as fit.
- No-match: explain blocking constraints + offer user-controlled relaxation.
- Archived/fixture-in-prod products never returned (TC-024 retrieval part).
- Works with `AI_PROVIDER=disabled` end to end.

### MORI-056 - Provider and quotas
- `AiProvider` interface: `complete({promptVersion, messages, maxInputTokens, maxOutputTokens, schema}) -> {output, usage}`; adapters `disabled`, `fake` (deterministic fixtures), `real` (config: `AI_PROVIDER`, `AI_MODEL_ID`, `AI_API_KEY_FILE`).
- Timeout 12 s, single attempt; never inside a DB tx (HR-8).
- Quotas: anon 5/session/day + IP limit; verified 30/day; staff separate; Redis counters fail closed for anonymous.
- Global budget: `AiBudgetReservation` reserve upper bound (configured price version x token caps) in PG tx against `AiUsageBucket`; reject when it does not fit; settle actual usage; sweeper releases expired reservations (TC-094 concurrency test).
- 429 `AI_QUOTA_EXCEEDED` with Retry-After.
- AiRun logs prompt/model version, retrieved IDs, latency, usage, outcome; no raw prompt in logs.

### MORI-057 - Staff assistance
- Command (**I**): assigned staff only; policy check before any provider call (TC-096: denied before provider receives content).
- Staff explicitly selects source text (brief fields, customer messages); INTERNAL notes excluded unless staff deliberately selects; never guest/RSVP data.
- Outputs: summary, clarifying questions, wording alternatives, 2-3 design directions from style taxonomy.
- Protected facts (names, dates, venues, quantity, material, amounts) diffed; suggestion changing them flagged and never auto-applied (TC-095).
- Suggestions stored as drafts; applying requires explicit staff edit action, audited.

### MORI-058 - Evaluation (HUMAN-GATED)
- Agent CAN prepare: 60+ vi/en prompts covering six style families, budgets, tiers, tri-fold, missing prices, no-match, ambiguous budget, adversarial/injection, unavailable products; runner computing: 100% IDs eligible, 100% amounts match pricing, 0 unauthorized tool calls, fallback success on forced outage; relevance rating sheet.
- Human MUST: choose provider/model (spec 21.2), rate relevance (>= 90% acceptable), sign thresholds report.
- Run after 059 so the outage criterion can pass (flagged ordering).

### MORI-059 - Fallback and telemetry
- Circuit breaker (failure rate/timeouts) -> open state returns deterministic results instantly with notice (TC-093).
- Output validator: discard invented IDs, prices, discounts; render DB facts only (TC-091).
- Injection tests: prompt/catalogue text attempting secrets/SQL/writes -> no tool beyond read-only facts, no secrets in context (TC-092).
- Metrics: latency, usage, spend 80%/100% alerts (16.4); redacted errors.
- Request/browse flow unaffected when provider down (17.6).

### MORI-060 - Chat UI
- Restrained panel, never overlays primary CTAs or forms (8.12); keyboard + screen-reader operable; `aria-live` for new answers only.
- Discloses assistant nature + "official quotes come from the studio"; estimate disclaimer with price basis.
- Cards rendered from response products (DB data), actions View design / Adjust preferences / Ask the studio (handoff creates request draft only on explicit action).
- Behind `aiAssistant` flag; fallback notice state; quota-exceeded state.

## Implementation Steps

1. 055 (fixtures) -> 056 -> 059 -> 057 -> 058 (human) -> 060, per recommended order; if spec order is kept, 059 code may still be built before 058 sign-off.
2. Migration: assistance (056).

## Todo List

- [x] MORI-055 preferences + ranking
- [x] MORI-056 adapter + quotas + reservations
- [x] MORI-057 staff assist
- [x] MORI-058 eval harness + human sign-off
- [x] MORI-059 fallback + breaker + telemetry
- [x] MORI-060 chat UI + handoff

## Success Criteria

- TC-089..096 executed and passing; eval report meets 12.4 thresholds; forced outage keeps browsing/request flow working.

## Risk Assessment

- 058/059 ordering conflict (flagged). 055 blocked by 018 human gate (flagged) -> fixtures.
- Provider pricing differs from configured units -> safety margin, alerts at 80%.
- Prompt injection never "solved" -> tool boundary + validation, no claims.

## Security Considerations

- INV-10, 15. Read-only tools only; no guest/RSVP/internal notes/secrets in context; API keys server-only; transcripts 30 d retention; staff assist authorization before provider call.

## Next Steps

- P10: 062, 063, 066 depend on 060.

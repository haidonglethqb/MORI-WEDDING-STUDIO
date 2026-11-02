# Phase 02 - Catalogue and UI system

## Context Links

- Spec: 2.2 (BR-01, 03, 04, 06, 16, 17), 3.3 (no-payment commercial rules, money), 8.1-8.4 (visual thesis, tokens, typography, imagery), 8.5 (UI-01..05, UI-19), 8.6 (storefront composition), 8.11 (a11y), 8.12 (no AI slop), 9.5 (Catalogue, Pricing), 10.2 (Product, ProductVariant, ProductionProfile ref, PriceBook, PriceRule), 10.5, 10.6 (seed), 11.3 (`/catalog/*`, `/pricing/estimate`), 16.2 (caching), 16.3 (SEO), 18.2, 18.8 (TC-117..120, 126, 128, 129)
- Brief §2 (TanStack Query, react-hook-form + zod, fast-check), §3 HR-1, 5, 10, 12
- Inputs: MORI-003 approved layouts in `docs/design/**`; `docs/launch-inputs.md` (MORI-006)

## Overview

- Priority: P1. Status: Pending (needs P01; 013 needs MORI-003 human approval).
- Build MORI tokens/primitives, storefront + catalogue + product detail, integer-money estimate engine with versioned pricebooks, staff catalogue admin, and the 30-record content path.
- Exit gate: real 30-record content path; correct tier/budget behavior.

## Key Insights

- Pricing is pure: `packages/domain/src/pricing` takes `(rules, variant, quantity, options)` -> line breakdown with `bigint`; no IO. API module only loads the active pricebook and calls it.
- Unknown shipping/tax/finish = `null` + explanation, never 0 (TC-019); estimate is not a quote.
- UI-03 estimate panel is listed under 015 but the engine is 016; 015 ships the panel shell with "estimate unavailable" state, 016 wires it.
- TC-013 needs 30 reviewed records: 014 proves with deterministic fixtures (`isFixture: true`); 018 replaces with real content (human-gated).
- UI-04 (`/digital-invitations`) needs real renderer demos (MORI-023, P03). 014 ships UI-05 and a UI-04 shell; demos land with 023.

## Requirements

- Functional: tokens/fonts/i18n (vi-VN default, en prepared); primitives (button, input, select, checkbox/radio, dialog, sheet, table, toast/live region, skeleton); UI-01/02/03/05/19; URL-driven filters; variant validity; estimate with tier/basis; pricebook draft/publish/archive; seed + content validation.
- Non-functional: WCAG 2.2 AA, 44 px targets, 120-180 ms motion, reduced motion; LCP <= 2.5 s storefront; catalogue cached with explicit invalidation; sitemap only active products; no fake reviews/prices.

## Architecture

- `packages/ui`: CSS variables from spec 8.2, type scale 8.3, primitives as accessible React components (no heavy lib barrel imports; HR-10 file sizes).
- Catalogue read: Next server component -> `GET /api/v1/catalog/products?shape=&style=&colour=&type=&sort=&cursor=` (allowlisted) -> Nest catalogue module (Prisma). Filters in URL search params.
- Estimate: client form -> `POST /pricing/estimate {variantId, quantity, options}` -> pricing module -> domain calc -> `{lines[], subtotalVnd: "…", shipping: null|{…}, tax: null|{…}, basis, priceBookVersion}`.
- Admin: draft entities separate from published; publish = new immutable published version; archive hides from selection/AI, keeps history.

## Related Code Files

Create:
- `packages/ui/src/{tokens,fonts,primitives,layout}/**`, `apps/web/src/i18n/{vi,en}/**`
- `packages/database/prisma/schema/{catalogue,pricing}.prisma`, `packages/database/prisma/seed/dev/catalogue/**`
- `packages/domain/src/pricing/**`, `packages/domain/src/money/**`
- `packages/contracts/src/{catalogue,pricing}/**`
- `apps/api/src/modules/{catalogue,pricing}/**`, `apps/api/src/modules/catalogue/admin/**`
- `apps/web/src/app/(storefront)/{page.tsx,collections,products/[slug],studio,digital-invitations}/**`, `apps/web/src/app/(studio)/admin/catalog/**`
- `apps/web/src/features/{catalogue,pricing,catalogue-admin}/**`
- `infra/scripts/content/{validate-catalogue.ts,import-catalogue.ts}`
- `tests/{integration,e2e}/{catalogue,pricing}/**`, `packages/domain/src/pricing/*.property.test.ts`

## Ticket Table

| Ticket | Work | Agent | Depends | Owned paths | Endpoints (11.3) | UI | TCs | Completion evidence |
|---|---|---|---|---|---|---|---|---|
| MORI-013 | MORI tokens + accessible button/form/dialog/table primitives | ui-ux-designer | 003, 007 | `packages/ui/**`, `apps/web/src/i18n/**`, `apps/web/src/app/layout.tsx` (fonts) | - | all (foundation) | TC-118, 119, 120 (primitives) | Contrast/focus/keyboard review with real text |
| MORI-014 | Homepage + URL-driven catalogue filtering | fullstack-developer | 013, 012 | `catalogue.prisma`, `apps/api/src/modules/catalogue/**` (read), `packages/contracts/src/catalogue/**`, `apps/web/src/app/(storefront)/{page.tsx,collections,studio,digital-invitations}/**`, `apps/web/src/features/catalogue/**`, `packages/database/prisma/seed/dev/catalogue/**` | `GET /catalog/products` | UI-01, UI-02, UI-05, UI-04 (shell) | TC-013..015 | UI-01/02; TC-013..015 |
| MORI-015 | Product pages, valid variant selection, still preview | fullstack-developer | 014 | `apps/web/src/app/(storefront)/products/[slug]/**`, `apps/web/src/features/catalogue/product-detail/**`, catalogue module `products/:slug` handler | `GET /catalog/products/:slug` | UI-03 | TC-016 (UI part) | UI-03; no unsupported configuration can proceed |
| MORI-016 | Integer-money estimate engine + pricebook versioning | fullstack-developer | 005, 015 | `pricing.prisma`, `packages/domain/src/{pricing,money}/**`, `apps/api/src/modules/pricing/**`, `packages/contracts/src/pricing/**`, `apps/web/src/features/pricing/**` | `POST /pricing/estimate` | UI-03 (estimate panel) | TC-016..020, TC-129 | TC-016..020; tier/property tests |
| MORI-017 | Staff catalogue/pricebook draft, validation, publish/archive | fullstack-developer | 010, 016 | `apps/api/src/modules/catalogue/admin/**`, `apps/api/src/modules/pricing/admin/**`, `apps/web/src/app/(studio)/admin/catalog/**`, `apps/web/src/features/catalogue-admin/**`, `infra/scripts/content/validate-catalogue.ts` | added: `/admin/catalog/products` CRUD, `/admin/catalog/products/:id/{publish,archive}`, `/admin/pricebooks` CRUD + `/publish` | UI-19 | TC-024, TC-128 | Reviewed changes; archive preserves history |
| MORI-018 | Import 24 paper + 6 digital real records | **human** (studio/content) + fullstack-developer prep | 006, 017 | `infra/scripts/content/import-catalogue.ts`, `content/catalogue/**` (data, not code) | admin endpoints from 017 | UI-02, UI-03 | TC-013, TC-128 | All 30 complete or quote-required; no demo offers |

## Agent Briefs

### MORI-013 - Tokens and primitives
- Implement spec 8.2 colours as CSS variables + TS constants; 8.3 type scale/fonts (dev placeholders labelled until licensed fonts arrive, spec 21.2).
- Primitives: Button (pending label + disabled repeat), TextField, Textarea, Select, Checkbox, RadioGroup, Dialog (focus trap/restore), BottomSheet, Table, Skeleton (layout-matching), InlineError, ErrorSummary, LiveRegion, SkipLink.
- 44x44 px primary targets; visible focus; reduced-motion handling; no gradients/glass/pill overload (8.12).
- i18n dictionaries vi-VN + en; no hardcoded UI prose; Vietnamese diacritics + long-name samples rendered (TC-118).
- Evidence: axe run + manual keyboard pass + contrast table in the ticket report (`reports/mori-013-a11y.md`), screenshots 390/1440.

### MORI-014 - Storefront and catalogue
- Schema: Product (slug unique, type PAPER/DIGITAL, styleTags, colourTags, state DRAFT/ACTIVE/ARCHIVED, `isFixture`), ProductVariant (shape FLAT/BI_FOLD/TRI_FOLD, dimensionsMm, material, finishOptions, availability, `productionProfileId` nullable until P08).
- Tri-fold variants never ACTIVE (BR-16, ADR-12).
- `GET /catalog/products`: ACTIVE only, allowlisted filters (type, shape, style, colour) + sort, cursor pagination (20/100).
- Deterministic dev seed: 24 paper (12 flat, 12 bi-fold) + 6 digital, all six style families, `isFixture: true`, fictional prices; idempotent rerun.
- UI-01 composition per 8.6 (no fake testimonials/metrics); UI-02 3/2/1 columns, mobile filter bottom sheet with Apply/Reset/count, URL state (TC-014), empty state with relax action (TC-015).
- UI-05 studio page; UI-04 shell with privacy explanation (demos after MORI-023).
- Catalogue cached with tag invalidation hook for 017 publish; SEO titles/canonicals/sitemap of ACTIVE products (16.3).

### MORI-015 - Product detail
- `GET /catalog/products/:slug`: public variants/specs only; ARCHIVED -> 404 for new selection.
- UI-03: 60/40 gallery/spec panel; variant selector only offers valid combinations; states active / unavailable / custom-quote-only.
- Still image preview; "View in 3D" control hidden until P08 feature flag.
- "Personalize this design" stores non-sensitive selection (slug, variant, qty) in URL/sessionStorage to survive sign-in (HP-01 step 3); never names/addresses.
- Estimate panel shell with "estimate unavailable" until 016.

### MORI-016 - Pricing engine
- `pricing.prisma`: PriceBook (versionLabel, currency VND, effectiveAt, state, createdBy), PriceRule (variantId, quantityMin/Max, unitAmountVnd BigInt, setupAmountVnd BigInt, optionRules, tax/shipping basis). Non-overlapping tiers enforced in domain validation + publish check.
- Domain calc: bigint only; max qty 10,000, max total 1,000,000,000 VND (3.3); reject zero/negative/fractional (TC-017).
- fast-check properties: tier boundaries (TC-018), monotonic totals, no overflow, serialization to decimal strings.
- Unknown shipping/tax/finish -> `null` + reason code (TC-019); response labels price basis and pricebook version.
- Request schema has no amount fields; strict Zod rejects them (TC-020). TC-129: estimate always reads current active pricebook server-side, ignoring cached client amounts.
- Unsupported variant/tri-fold -> 422 (TC-016).
- Wire UI-03 estimate panel (react-hook-form + zod, TanStack Query mutation).

### MORI-017 - Catalogue admin
- Add admin endpoints to contracts/OpenAPI first (11.3 note); STUDIO may edit drafts, ADMIN publishes/archives (3.2).
- Publish validates: required fields, media alt/rights, valid variants, price rules or explicit quote-required, no `isFixture` in production env.
- Content validator rejects fake reviews/ratings, eco claims without evidence flag, demo prices (TC-128).
- Archive: product leaves selection/AI retrieval; history readable (TC-024 completes when orders exist in P07; add test stub now).
- Publish triggers catalogue cache invalidation. Audit every publish/archive.
- UI-19 states: draft/active/archived, publish errors listed per field.

### MORI-018 - Real catalogue import (HUMAN-GATED)
- Agent CAN prepare: import script reading `content/catalogue/*.yaml` -> admin API (draft) with validator; template YAML with every required field (spec 10.6); report of missing fields per record.
- Human MUST supply: approved names, images with rights, alt text, specs, pricing policy or quote-required decision; review and publish.
- Records lacking price/production data stay draft or "Studio quote required" (HR-12).
- Done: 30 records reviewed; TC-013 rerun against real content; zero `isFixture` records ACTIVE in staging.

## Implementation Steps

1. MORI-013 (after 003 approval). Meanwhile backend-first work on 014 schema/API is allowed if UI waits for tokens.
2. MORI-014 -> 015 -> 016 (016 domain package can start early in parallel: pure code, no UI).
3. MORI-017 after 010 + 016.
4. MORI-018 prep after 017; human import/sign-off can trail into later phases (blocks 055, 065).
5. Migrations order: catalogue (014) then pricing (016).

## Todo List

- [ ] MORI-013 tokens/primitives + a11y review
- [ ] MORI-014 UI-01/02/05 + catalogue API + fixture seed
- [ ] MORI-015 UI-03 + variant validity
- [ ] MORI-016 pricing domain + estimate API + property tests
- [ ] MORI-017 UI-19 + admin publish/archive + content validation
- [ ] MORI-018 import tooling ready; human content sign-off

## Success Criteria

- TC-013..020, 024 (stub), 128, 129 executed and passing.
- fast-check suites green; no `number` used for money (lint rule or grep check).
- Screenshots UI-01/02/03 at 390/1440 with long names.

## Risk Assessment

- MORI-003 approval delay blocks 013 -> start 016 domain and P03 backend lane.
- 015/016 ordering split of estimate panel (flagged).
- TC-013 needs real 30 records (018 human) -> fixture pass now, rerun after 018.
- Admin catalogue endpoints absent in 11.3 -> 017 defines them in contracts before code.
- ProductionProfile (P08) referenced by variant -> nullable FK now; production start blocked until set.

## Security Considerations

- Public catalogue is the only cacheable data class (15.1); estimate commands never trust client amounts (INV-05 groundwork).
- Admin routes require STUDIO/ADMIN + MFA (010); publish audited.
- HR-1: no price/checkout/payment copy anywhere ("Request a design", "Studio quote required").

## Next Steps

- P03: 019 needs 013; 023 needs 013 tokens. P06 037 needs 016. P09 055 needs 016 + 018.

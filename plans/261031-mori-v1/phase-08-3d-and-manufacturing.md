# Phase 08 - 3D and manufacturing gate

## Context Links

- Spec: 2.2 (BR-09, BR-15, BR-16), 8.6 (product detail "View in 3D"), 8.7 (proof review 3D tab), 9.6 (3D client-only, lazy), 10.2 (ProductionProfile, ProductVariant.productionProfileId, DesignArtifact TEXTURE, PhysicalFulfillment printAssetId), 13.1 (preview vs production truth), 13.2 (manifest), 13.3 (3D renderer contract), 13.4 (preflight and exceptions), 16.1 (3D never in initial bundle), 18.6 (TC-097..102), 21.2 (printer profiles input)
- Brief §2 (three/R3F lazy), §3 HR-6, 12; ADR-12; human gates MORI-049, MORI-054

## Overview

- Priority: P1. Status: Pending (needs P06; P07 for 053).
- Printer-approved production profiles; lazy flat + bi-fold 3D viewer bound to the exact revision textures with full 2D fallback; production preflight checklist and print-start artifact verification; physical sample sign-off.
- Exit gate: correct geometry/artifact mapping and actual production sign-off.

## Key Insights

- 3D is explanatory only; approved print artifact + ProductionProfile are truth (13.1). Approval never depends on WebGL (TC-099).
- Geometry dimensions come from ProductionProfile (trim, fold spec, face map); without an approved profile the viewer shows 2D only. So 050/051 can develop against `isFixture` profiles but cannot close until 049 sign-off.
- Spec layout has no 3D package; place viewer in `apps/web/src/features/viewer-3d/**` loaded via `next/dynamic` with `ssr: false` (rules 2.4).
- TC-101 (failed conversion blocks readiness) is implemented in MORI-039; 053 extends it to production-start artifact checks and reruns.

## Requirements

- Functional: ProductionProfile CRUD (versioned, approvedBy); variant -> profile link; flat card (front/back, constrained rotate, zoom, reset); bi-fold (hinge, closed/open presets, open-angle slider, exterior/interior faces); labelled front/back/open buttons as keyboard alternatives; revision label in viewer; preflight checklist (version, staff actor) gating `IN_PRODUCTION`; print asset checksum must equal order snapshot.
- Non-functional: viewer never in initial storefront/guest bundle; DPR clamp; texture size budget; pause off-screen; dispose GPU resources on unmount; context-loss recovery; reduced motion disables auto-rotation; tri-fold unavailable.

## Architecture

- Viewer input: `{ shape, profile: {trimMm, foldSpec, faceMap}, textures: [{face, derivativeUrl, checksum}], revisionLabel }` from an authorized API read (`GET /requests/:id/revisions` artifacts or product preview assets).
- Rendering: three.js (optionally R3F after compatibility check) scene with BoxGeometry-thin panels; bi-fold = two panels grouped with pivot on hinge edge; textures mapped per face map, never mirrored.
- Preflight: `ProductionPreflight` record (orderId, trackId, checklistVersion, items[], actor, result) required by the `IN_PRODUCTION` transition guard; guard compares print asset checksum with `OrderItem.approvedRevisionId` artifacts.

## Related Code Files

Create:
- `packages/database/prisma/schema/production.prisma` (ProductionProfile, ProductionPreflight)
- `apps/api/src/modules/catalogue/production-profiles/**`, `apps/api/src/modules/fulfillment/preflight/**`
- `packages/contracts/src/{production,viewer}/**`
- `apps/web/src/features/viewer-3d/{flat-card,bi-fold,fallback,controls,loader}/**`
- `apps/web/src/app/(studio)/admin/catalog/production-profiles/**`, preflight panel in `apps/web/src/features/fulfillment-ops/preflight/**`
- `tests/e2e/viewer-3d/**`, `tests/integration/preflight/**`, `tests/fixtures/production-profiles/**` (isFixture)

Modify:
- `apps/web/src/features/catalogue/product-detail/**` (View in 3D trigger), `apps/web/src/features/proof-review/**` (3D tab), `apps/api/src/modules/fulfillment/transitions/**` (preflight guard)

## Ticket Table

| Ticket | Work | Agent | Depends | Owned paths | Endpoints | UI | TCs | Completion evidence |
|---|---|---|---|---|---|---|---|---|
| MORI-049 | Printer-approved dimensions, face maps, bleed, output rules | **human** (studio/printer) + fullstack-developer prep | 006, 039 | `production.prisma` (ProductionProfile), `apps/api/src/modules/catalogue/production-profiles/**`, `apps/web/src/app/(studio)/admin/catalog/production-profiles/**`, `content/production-profiles/**` | added `GET/POST /admin/production-profiles`, `POST /admin/production-profiles/:id/approve` | UI-19 (profiles tab) | - | Profiles signed off; no invented universal settings |
| MORI-050 | Flat-card geometry + exact revision texture mapping | fullstack-developer (3D) | 049 | `apps/web/src/features/viewer-3d/{flat-card,controls,loader}/**`, `packages/contracts/src/viewer/**` | reads `GET /requests/:id/revisions`, `GET /catalog/products/:slug` | UI-03, UI-10 (3D tab) | TC-097 | TC-097 desktop + mobile |
| MORI-051 | Bi-fold hinge, exterior/interior mapping, open/close controls | fullstack-developer (3D) | 050 | `apps/web/src/features/viewer-3d/bi-fold/**` | same | UI-03, UI-10 | TC-098 | TC-098 vs actual printed-fold reference |
| MORI-052 | Lazy loading, texture budgets, reduced motion, WebGL fallback | fullstack-developer + tester | 051 | `apps/web/src/features/viewer-3d/fallback/**`, bundle-budget check in `infra/scripts/ci/bundle-budget.ts`, `tests/e2e/viewer-3d/**` | - | UI-03, UI-10 | TC-099, 100 | TC-099/100; no initial-route bundle contamination |
| MORI-053 | Production checklist + print-start artifact verification | fullstack-developer | 049, 046 | `production.prisma` (ProductionPreflight), `apps/api/src/modules/fulfillment/preflight/**`, `apps/web/src/features/fulfillment-ops/preflight/**`, `tests/integration/preflight/**` | added `POST /admin/orders/:id/preflight`; guards `POST /admin/orders/:id/fulfillment-transitions` | UI-18 (preflight) | TC-101, 102, 042 (rerun) | TC-101/102; approved-asset matching |
| MORI-054 | Physical sample/preflight review; close 3D integration gate | **human** (studio/QA) + tester prep | 052, 053 | `plans/261031-mori-v1/reports/mori-054-*.md`, `tests/fixtures/production-profiles/**` (replace fixtures) | - | UI-03, 10, 18 | TC-097, 098, 102 (on real samples) | Visual/print limits stated; tri-fold unavailable |

## Agent Briefs

### MORI-049 - Production profiles (HUMAN-GATED)
- Agent CAN prepare: ProductionProfile schema (version, trimDimensionsMm, faceMap, foldSpec, bleedMm, safeAreaMm, stock, finishCapabilities, outputRequirements, approvedBy, approvedAt, `isFixture`); immutable once approved (new version for changes); admin entry UI + validation; YAML template; fixture profiles for flat + bi-fold flagged `isFixture`.
- Variant activation for PAPER requires approved non-fixture profile in production env.
- No universal 3 mm bleed or RGB-ready assumptions (13.1).
- Human MUST: supply printer-approved values, approve each profile (ADMIN + MFA), record evidence.

### MORI-050 - Flat card
- Thin box sized from profile trim aspect; front/back textures from TEXTURE artifacts of the exact revision (checksum verified client-side vs manifest list).
- Controls: constrained rotate, zoom, reset; buttons Front/Back as keyboard alternatives; visible revision label.
- Static first frame + "View in 3D" action; no WebGL on catalogue cards.
- Visual test TC-097 at 390/1440 (screenshot set + human check of orientation/aspect).

### MORI-051 - Bi-fold
- Two panels pivoted on hinge per foldSpec; closed/open presets + open-angle slider (keyboard operable).
- Exterior (front/back cover) vs interior (left/right) faces per faceMap; test for no mirrored/swapped text (TC-098).
- Compare against actual printed-fold reference photo from studio (human step in 054).

### MORI-052 - Performance and fallback
- `next/dynamic` import with `ssr: false`; preload on hover/focus of "View in 3D" (rules 2.5).
- Clamp DPR (<= 2), cap texture dimension (e.g. 2048 desktop / 1024 mobile, measured), pause render loop off-screen (IntersectionObserver), dispose geometries/materials/textures on unmount.
- `webglcontextlost` -> fallback to 2D gallery + text summary; reduced-motion -> no auto-rotate (TC-099).
- Memory test on low-end mobile profile; repeated open/close shows no leak (TC-100).
- CI bundle check: storefront/guest initial routes contain no three.js chunk.

### MORI-053 - Preflight and print start
- Checklist per 13.4: quote/scope, approval hash, face mapping, dimensions, bleed/safe area, resolution, font policy, spelling, material, finish, quantity, deadline; versioned checklist; staff actor recorded.
- `IN_PRODUCTION` guard requires passed preflight + print asset checksum equal to accepted snapshot (INV-04, TC-042 rerun).
- Wrong dimensions/missing fonts -> blocked until reviewed correction (TC-102); failed render/incomplete mapping -> revision not ready (TC-101 rerun with 039).
- Material unavailable -> hold path from 047.

### MORI-054 - Physical sample gate (HUMAN-GATED)
- Agent CAN prepare: sample checklist per approved profile, side-by-side screenshot sheets (3D vs 2D proof), list of visual limitations copy (colour, foil, emboss not represented), confirmation tri-fold variants inactive.
- Human MUST: print samples, compare to proofs/3D, sign off profiles and preflight, record results.

## Implementation Steps

1. 049 prep (schema/admin/fixtures) immediately after 039; human values in parallel.
2. 050 -> 051 -> 052 against fixture profiles; close after 049 sign-off.
3. 053 after 049 + 046.
4. 054 after 052 + 053.

## Todo List

- [ ] MORI-049 profile schema/admin + human approval
- [ ] MORI-050 flat card + TC-097
- [ ] MORI-051 bi-fold + TC-098
- [ ] MORI-052 lazy/fallback/budgets + TC-099/100
- [ ] MORI-053 preflight guard + TC-101/102
- [ ] MORI-054 physical sample sign-off

## Success Criteria

- TC-097..102 executed (visual ones with human review recorded); bundle check green; production start impossible without passed preflight and matching checksum.

## Risk Assessment

- Printer data unavailable -> viewer and production stay fixture/2D-only; launch blocked (HR-12).
- R3F incompatibility with React version -> plain three.js.
- GPU memory on low-end phones -> texture caps, fallback.

## Security Considerations

- Textures served through authorized endpoints (proof assets private); no public object URLs for customer proofs. Preflight and production start audited (INV-04).

## Next Steps

- P10: 062, 063, 065 depend on 054.

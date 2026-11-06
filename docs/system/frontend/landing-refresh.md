# Landing refresh — 2026-11-06

Scope: public MORI landing page, spec 8.1–8.6; BR-01 editorial brand experience. No new ticket assigned.

## Implementation

- Ivory/olive editorial composition; Lora headings and Be Vietnam Pro interface text. Wine is confined to the labelled stationery illustration.
- Asymmetric hero, four catalogue selections, interactive design choices, digital RSVP demonstration, three process steps, FAQ and closing invitation.
- Styles scoped by `.home-editorial` in `landing-editorial.css` and `landing-responsive.css`.
- Fonts self-hosted from Google Fonts in `apps/web/public/fonts`, with OFL license files. Includes Vietnamese, Latin and extended Latin subsets. Existing CSP remains unchanged.
- Lazy 3D viewer, visible keyboard focus, skip link, reduced motion, accessible choice buttons and mobile navigation wrapping.
- Catalogue price minimum calculated with BigInt; fixture prices remain explicitly illustrative. INV-13 preserved.

## Validation and limits

- Web TypeScript check and production build passed during implementation; final build re-run after local font integration recorded in the chat.
- Chromium rendered at 320, 390, 768 and 1440 CSS px: fonts loaded and no horizontal overflow observed.
- Local API catalogue was unavailable: rendered empty state, not populated gallery. No backend or authenticated user-flow tests claimed; no TC acceptance suite run.
- Real rights-cleared stationery photography remains a launch input. Hero is explicitly labelled as an illustration and is not a print proof.
- No deployment or commit performed.

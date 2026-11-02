# Screen Inventory

**Spec:** 8.5 | See `MORI_PROJECT_PLAN.md` section 8.5 (Navigation and screen inventory)

| Screen ID | Route | Purpose | States |
| --- | --- | --- | --- |
| UI-01 | `/` | Editorial hero, selected designs, material story, process, studio CTA | Normal, no-image |
| UI-02 | `/collections` | Product grid, filter, sort, count | Loading, results, empty, error |
| UI-03 | `/product/:id` | Product detail, material specs, customization, PAPER/DIGITAL/BUNDLE, CTA | Normal, unavailable |
| UI-04 | `/request/:id/brief` | Structured custom design request form | Draft, saving, submitted |
| UI-05 | `/workspace` | Dashboard: requests, invitations, orders | Empty, loading, list |
| UI-06 | `/request/:id/feedback` | Service request thread, staff comments | Unread, resolved |
| UI-07 | `/request/:id/revisions/:revId` | 2D proof pages, 3D viewer, text summary, comments | Loading, rendered, error |
| UI-08 | `/request/:id/quote` | Quote review: scope, amount, shipping, expiry | Pending, expired, accepted |
| UI-09 | `/request/:id/design` | Staff design workspace (visual, state machine restricted) | Draft, reviewing |
| UI-10 | `/product/:id/preview` | 3D flat/bi-fold geometry preview, material texture | 3D viewer, 2D fallback |
| UI-11 | `/order/:id` | Order detail: fulfillment tracks, shipment | Pending, in-progress, delivered |
| UI-12 | `/invitation/:id/edit` | Structured invitation editor, autosave, live preview | Unsaved, saving, saved, conflict |
| UI-13 | `/invitation/:id/preview` | Phone/desktop preview (same renderer as public) | Loading, rendered |
| UI-14 | `/me/dashboard` | Owner's RSVP dashboard: counts, export, moderation | Loaded, exporting |
| UI-15 | `/invitations/:slug` | Public invitation (guest view) | Normal, passcode gate, suspended |
| UI-16 | `/invitations/:slug/rsvp` | RSVP form: attendee, contact, dietary | Open, guest-list, closed |
| UI-17 | `/invitations/:slug/event/:eid` | Single-event view, map, music, calendar download | Loaded, error |
| UI-18 | `/studio/dashboard` | Staff: pending requests, assignments, moderation | Loading, list |
| UI-19 | `/admin/catalogue` | Catalogue CRUD: products, variations, pricing | Grid, form, loading |
| UI-20 | `/admin/moderation` | Public content review: suspend, restore, appeals | Queue, detail |
| UI-21 | `/auth/login` | Email + password login | Normal, submitting, error |
| UI-22 | `/auth/setup-mfa` | MFA enrollment, backup codes, testing | Setup, verified |

Each screen has required states and error handling defined in spec 8.5.

## Related

- [Screen compositions](./screen-compositions.md) — Navigation flows
- [Visual system](./visual-system.md) — Design tokens
- [Accessibility and anti-slop](./accessibility-and-anti-slop.md) — WCAG compliance

---

**Inventory complete:** 22 screens + required states. Implementation priority per phase workpackage.

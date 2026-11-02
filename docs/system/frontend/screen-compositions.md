# Screen Compositions

**Spec:** 8.6–8.10 | See `MORI_PROJECT_PLAN.md` sections 8.6–8.10 (Screen design, user flows, responsive rules)

## Navigation Patterns

**Persistent navigation:** Storefront → Product detail → Request form. No back button trap.

**Workspace tabs:** Dashboard → Requests → Invitations → Orders. Tab state persists within session.

**Guest flow:** Public link → Invitation read → RSVP form → Confirmation. No account required; clean URL after token exchange.

## Form States

**Unsaved changes:** 800 ms autosave debounce. UI shows `Unsaved`, `Saving`, `Saved at HH:MM`, `Offline`, `Conflict - review required`.

**Conflict resolution:** Stale patch (409 VERSION_CONFLICT) returns latest version + field diffs. Preserve local edits; show field-by-field merge UI. No auto-merge of times/media/privacy changes.

**Multi-step:** Request → Brief → Review → Quote → Order. Each step validates before proceeding. Back navigable within session.

## Responsive Rules

**Mobile-first:** Design for 360 px width; scale up. Vietnamese names/dates must fit without ellipsis.

**Touch targets:** Minimum 48 x 48 px. Generous spacing (16 px+).

**Images:** `srcset` for 1x, 2x resolution. Lazy load below fold. Fallback alt text always present.

**Modal/drawer:** Drawer preferred on mobile; modal on desktop. Accessible header, close button, escape key dismissal.

## Error Handling

**Field errors:** Displayed inline, actionable messaging. Example: "Email must contain @"

**Server errors:** Generic message + support link / request ID. Never expose stack traces or SQL.

**Network errors:** Retry UI; offline fallback for critical reads.

**Timeout:** User-friendly timeout message; option to retry or contact support.

## Related

- [Screen inventory](./screen-inventory.md) — Screen list
- [Visual system](./visual-system.md) — Spacing, breakpoints, typography
- [Accessibility and anti-slop](./accessibility-and-anti-slop.md) — WCAG, keyboard nav

---

**Principle:** UX flows are customer-centric, recoverable from errors, and mobile-friendly.

# Visual System

**Spec:** 8.1–8.4 | See `MORI_PROJECT_PLAN.md` sections 8.1–8.4 (Visual thesis, colour tokens, typography, images)

## Thesis

**Quiet editorial wedding stationery, translated into a precise digital product.** Generous typography, photographed material, deliberate alignment, restrained botanical detail. Not a generic AI dashboard or fintech landing page.

## Colour Tokens

```css
/* Brand palette (source brief, page 2) */
--mori-olive: #55634F;          /* Principal action color */
--mori-sage: #8A987D;           /* Surfaces / accents */
--mori-pale-green: #D5DBC9;     /* Surfaces / accents */
--mori-ivory: #F5F4EC;          /* Page background */
--mori-natural-beige: #D0C8B7;  /* Surfaces / accents */
--mori-earth: #9C836F;          /* Secondary accent */

/* Interface extensions */
--surface-page: #F5F4EC;        /* Page background */
--surface-raised: #FFFFFF;      /* Cards, modals */
--surface-subtle: #ECEDE4;      /* Subtle backgrounds */
--text-primary: #252A24;        /* Main text */
--text-secondary: #5F675C;      /* Secondary text */
--border-subtle: #D8D7CE;       /* Dividers */
--action-primary: #55634F;      /* Buttons, links */
--action-hover: #45523F;        /* Hover state */
--focus-ring: #32462F;          /* Focus indicator */
--status-error: #9D2F37;        /* Error messages */
--status-warning: #815D22;      /* Warnings */
--radius-control: 8px;          /* Button / input radius */
--radius-panel: 12px;           /* Card / panel radius */
```

**Contrast validation:** Verify all foreground/background pairs at all states. Error/focus must maintain WCAG AA. Status meaning always includes icon or text, not colour alone.

## Typography

**Fonts:** Lora (editorial headings) + Be Vietnam Pro (interface). Confirm licensing, Vietnamese glyphs, current weight availability. Self-host files; no unrestricted shipping.

| Token | Desktop | Mobile | Use |
| --- | --- | --- | --- |
| Editorial hero | 64/68 px | 40/44 px | One primary statement |
| Invitation names | 64/70 px | 40/46 px | Never truncate names |
| Page heading | 36/44 px | 28/36 px | Pages |
| Section heading | 28/36 px | 24/32 px | Sections |
| Body | 16/26 px | 16/26 px | Descriptions, forms |
| Interface label | 14/20 px | 14/20 px | Labels, nav, controls |
| Supporting caption | 12/18 px | 12/18 px | Nonessential metadata |

## Layout & Spacing

**Spacing base:** 4 px; sequence: 4, 8, 12, 16, 24, 32, 48, 64, 96

**Max widths:**
- Marketing: 1280 px
- Reading: 720 px
- Workspace: 1440 px (tables, editor previews)

**Gutters:** 20 px (small), 32 px (tablet), 48–64 px (desktop)

**Breakpoints:** 640, 768, 1024, 1280 px. Test: 360, 390, 768, 1024, 1440 px. Support 320 px reflow without horizontal scroll.

## Images

Use real, rights-cleared stationery photography: paper grain, flat/folded views, scale, print detail, restrained props, accurate colour. Crop intentionally: 4:5 (catalogue), 3:2 or 4:5 (editorial).

**Never:**
- AI-generated foliage
- Floating paper mockups (misrepresent product)
- Repetitive stock wedding images
- Unsupported claims ("100% sustainable" without substantiation)

## Related

- [Screen inventory](./screen-inventory.md) — UI-01 through UI-22
- [Accessibility and anti-slop](./accessibility-and-anti-slop.md) — WCAG, performance

---

**Principle:** Design is constraint-based and measurable. All values documented; no arbitrary decisions.

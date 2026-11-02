# Accessibility and Anti-Slop

**Spec:** 8.11–8.12 | See `MORI_PROJECT_PLAN.md` sections 8.11–8.12 (Accessibility, anti-AI-generated appearance)

## Accessibility (WCAG 2.2 AA)

| Standard | Implementation |
| --- | --- |
| **Contrast** | Text ≥ 4.5:1 (AA), UI ≥ 3:1 (AA). Test against actual theme values. |
| **Keyboard nav** | Tab, Shift+Tab, Enter, Space, Escape. All interactive elements focusable. |
| **Screen readers** | Semantic HTML, ARIA labels, skip links. Test with NVDA / JAWS / macOS VoiceOver. |
| **Focus indicator** | Visible 2+ px border or outline (WCAG 2.2 AA requirement). Never rely on colour alone. |
| **Touch targets** | 44 × 44 px primary; 24 × 24 px minimum acceptable (MORI stricter than 2.2 AA's 24 minimum) |
| **Form labels** | Explicit `<label>` + `htmlFor`. Aria-describedby for hints. |
| **Images** | Meaningful alt text (not "image" or "photo"). Decorative: `alt=""`. |
| **Colour** | Status never by colour alone; include icon or text. |
| **Motion** | Respect `prefers-reduced-motion`. No auto-playing video/animation. |
| **Zoom** | Page usable at 200% zoom. No horizontal scroll at 1280 px + 200% zoom. |
| **Language** | Set `lang` attribute on HTML. Spell out abbreviations. |

## Anti-Slop Checklist

Avoid generic AI-generated appearance:

- [ ] **Typography:** Specific font pairing (Lora + Be Vietnam Pro), not system fonts
- [ ] **Images:** Real photography of actual material, not AI mockups or generic stock
- [ ] **Spacing:** Intentional 4 px grid, not random padding
- [ ] **Colour:** Brand palette (olive, sage, ivory, earth), not generic blues/grays
- [ ] **Content:** Specific UI text (e.g., "Place order request"), not generic copy (e.g., "Buy now")
- [ ] **Icons:** Curated SVGs or icon library, not auto-generated shapes
- [ ] **Layout:** Intentional alignment, not floating cards or infinite scrolls
- [ ] **Micro-interactions:** Deliberate transitions, not jittery defaults
- [ ] **Error messaging:** Specific, actionable guidance; not generic "Something went wrong"

## Performance

- **Core Web Vitals:** LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1
- **Bundle size:** JS ≤ 100 KB gzipped (main bundle)
- **Images:** Optimize; lazy load. Use modern formats (WebP + JPEG fallback)
- **Lighthouse:** Score ≥ 90 across Perf, Accessibility, Best Practices

## Related

- [Visual system](./visual-system.md) — Colour contrast, typography rules
- [Screen compositions](./screen-compositions.md) — Responsive, keyboard navigation

---

**Principle:** Accessibility + thoughtful design. Never sacrifice either for speed or generic templates.

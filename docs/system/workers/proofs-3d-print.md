# Proofs & 3D Print Production

**Spec:** 13 | See `MORI_PROJECT_PLAN.md` section 13 (2D, 3D, proofs, and print production)

## PDF Proof Rendering

**Process:**
1. Staff uploads final artwork (PDF, 300 DPI print-ready)
2. Worker triggers sandboxed PDF render task
3. `poppler` `pdftoppm` converts to JPEG/PNG preview pages
4. Manifest hash computed from all pages (immutable proof identity)
5. Pages stored as MediaDerivatives linked to DesignRevision

**Sandboxing:** Separate container with:
- No network access
- CPU limit: 2 cores
- Memory limit: 512 MB
- PID limit: 10
- Timeout: 60 seconds

**Fallback:** If rendering fails, staff notified; publication blocked until resolved.

## 3D Geometry (Flat & Bi-fold)

Supported formats: **Flat** (envelope) and **Bi-fold** (folded card). **Tri-fold unavailable** until printer manufacturing gate passed (spec 13, later phase).

**Three.js / React Three Fiber viewer:**
- Load 3D geometry (supplied by template)
- Apply revision texture/proof image
- Interactive rotate, zoom, lighting controls
- Download still image
- Fallback: 2D flat image (never render 3D as required)

**Manifest hash:** Includes geometry version + texture digest + production spec. Immutable once approved.

## Product Specification Capture

**At quote/order time:**
- Geometry type (FLAT ∣ BI_FOLD)
- Size (mm)
- Material (paper type, weight, finish)
- Binding/folding method
- Derivative images (thumbnail, preview, 3D still)
- Proof PDF pages
- Approval hash

**INV-04:** Order snapshot captures accepted proof + spec. Print job uses snapshot, never "latest proof".

## Print Job Workflow

1. **Approval:** Customer approves revision 2 with explicit acknowledgement
2. **Quote:** Staff issue quote including accepted revision hash + spec fingerprint
3. **Order:** Customer places order; snapshot captured
4. **Preflight:** Staff verify geometry + texture + binding match printer capabilities
5. **Production:** Print job submitted to external printer (if applicable) OR in-house production
6. **Quality check:** Sample inspected; rework recorded if needed
7. **Shipment:** Tracking recorded; delivery confirmed

## Related

- [Entities: projects, design, orders](../database/entities-projects-design-orders.md) — DesignRevision, OrderTrack
- [Constraints & snapshots](../database/constraints-and-snapshots.md) — Manifest hash
- [Background tasks](./background-tasks.md) — PDF render task

---

**Principle:** Proofs are immutable. 3D is interactive but not required for ordering. Print spec is versioned and captured at order time.

# Entities: Identity & Catalogue

**Spec:** 10.2 | See `MORI_PROJECT_PLAN.md` section 10.2 (Data entities)

## Account & Profile

**Account** — Email, role (`CUSTOMER` ∣ `STUDIO` ∣ `ADMIN`), verified status, MFA enabled, staff assignment (if applicable), audit trails.

**Profile** — Display name, optional photo, contact preferences (notification opt-in/out), UI locale preference.

**Session** — Custom opaque token (PostgreSQL), not JWT. Includes `actorId`, `permissions`, `grantedAt`, `expiresAt`, `revokedAt` (soft-delete).

## Product & Specification

**Product** — Name, family (Vintage/Modern/Minimalist/Luxury/Rustic/Romantic), material, format (FLAT ∣ BI_FOLD ∣ TRI_FOLD), weight/finish, dimensions, cover/interior images, base price (VND BigInt), printable regions.

**ProductVariation** — Product + color/size options; each has separate SKU, thumbnail, price deltas.

**Specification** — Order line item details: selected product variation, quantity, customization scope (templated fields), binding/folding/finishing choices.

## Related

- [Constraints & snapshots](./constraints-and-snapshots.md) — Unique product SKU
- [Backend API conventions](../backend/api-conventions.md) — DTO serialization

---

**Key principle:** Products immutable once published. New versions require new `Product` record or `ProductVariation` rows.

# Backend Modules

**Spec:** 9.5 | See `MORI_PROJECT_PLAN.md` section 9.5 (NestJS modular structure)

NestJS modules organize business logic by domain. Each module has controllers, services, entities/DTOs, and database access.

## Domain Modules (Planned)

| Module | Domain | Responsibilities |
| --- | --- | --- |
| `auth` | Authentication | Login, session management, staff MFA, guest grants |
| `me` | Account & profile | Account verification, profile, preferences |
| `catalogue` | Products & designs | Product specs, design families, listings |
| `pricing` | Estimates & quotes | Price calculations, quote generation, expiry |
| `requests` | Service requests | Submit, assign, track design requests |
| `revisions` | Design proofs | Create, review, approve revisions |
| `invitations` | Invitations | Create, edit, publish, expire invitations |
| `rsvp` | RSVP management | Submit, query responses, aggregate attendance |
| `orders` | Order fulfillment | Place orders, track shipments, digital handover |
| `media` | Uploads & storage | Upload sessions, scan, process, serve media |
| `public` | Public access | Unauthenticated invitation/product routes |
| `admin` | Administration | Catalogue management, policies, moderation |

## Shared Infrastructure

- **`common/`** — Request context, problem details, idempotency, audit, policy guard, rate limiting, CSRF, redaction
- **Interceptors** — Logging, timing, error transformation
- **Guards** — Role-based access control (RBAC), ownership checks
- **Decorators** — Custom validation, metadata

## Related

- [Overview and topology](./overview-and-topology.md) — Modular monolith rationale
- [Concurrency and locking](./concurrency-and-locking.md) — Cross-module transaction order
- [Backend API conventions](../backend/api-conventions.md) — HTTP contracts

---

**Design principle:** Modules are independent; cross-module logic flows through DTOs and public service contracts, not shared prisma calls.

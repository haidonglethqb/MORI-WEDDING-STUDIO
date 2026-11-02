# API Endpoints

**Spec:** 11.3 | See `MORI_PROJECT_PLAN.md` section 11.3 (API specification)

Endpoint list with method, route, auth requirement, and idempotency/version flags. Full details in spec section 11.3.

| Endpoint | Method | Route | Auth | **I** | **Vsn** |
| --- | --- | --- | --- | --- | --- |
| **Auth** | | | | | |
| Login | POST | `/auth/login` | None | ✓ | |
| Logout | POST | `/auth/logout` | Session | | |
| Verify email | POST | `/auth/verify-email` | None | ✓ | |
| MFA setup | POST | `/auth/mfa/setup` | Session | | |
| **Account** | | | | | |
| Get me | GET | `/me` | Session | | |
| Update profile | PATCH | `/me/profile` | Session | | ✓ |
| **Catalogue** | | | | | |
| List products | GET | `/catalogue/products` | None | | |
| Get product | GET | `/catalogue/products/:id` | None | | |
| **Requests** | | | | | |
| Create request | POST | `/studio/requests` | Session | ✓ | |
| Get request | GET | `/studio/requests/:id` | Session | | |
| Submit request | PATCH | `/studio/requests/:id/submit` | Session | ✓ | ✓ |
| **Revisions** | | | | | |
| Get revision | GET | `/studio/requests/:id/revisions/:revId` | Session | | |
| Approve revision | PATCH | `/studio/requests/:id/revisions/:revId/approve` | Session | ✓ | ✓ |
| **Quotes** | | | | | |
| Issue quote | POST | `/studio/requests/:id/quote` | Staff | ✓ | |
| **Orders** | | | | | |
| Place order | POST | `/studio/orders` | Session | ✓ | ✓ |
| Get order | GET | `/studio/orders/:id` | Session | | |
| **Invitations** | | | | | |
| Create invitation | POST | `/me/invitations` | Session | | |
| Get invitation | GET | `/me/invitations/:id` | Session | | |
| Update invitation | PATCH | `/me/invitations/:id` | Session | | ✓ |
| Publish invitation | POST | `/me/invitations/:id/publish` | Session | ✓ | ✓ |
| **Public** | | | | | |
| Get invitation | GET | `/invitations/:slug` | None | | |
| Submit RSVP | POST | `/invitations/:slug/rsvp` | Guest/None | ✓ | ✓ |

Legend: **I** = Idempotency-Key required, **Vsn** = expectedVersion required

*Note: This is a summary. Spec section 11.3 contains full request/response schemas for each endpoint, error cases, and authorization guards.*

## Related

- [API conventions](./api-conventions.md) — HTTP standards, versioning
- [Backend modules](../architecture/backend-modules.md) — Implementation structure

---

**Principle:** Each endpoint has explicit authorization + audit logging. Private queries filter in the `where` clause.

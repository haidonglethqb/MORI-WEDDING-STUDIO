# API Conventions

**Spec:** 11.1, 11.5 | See `MORI_PROJECT_PLAN.md` sections 11.1 (Core contracts), 11.5 (HTTP conventions)

## HTTP Method & Status

- **GET:** Safe, idempotent retrieval; `200` OK
- **POST:** Create/execute command; `201` Created (resource) or `200` OK (result)
- **PATCH:** Update fields; `200` OK
- **DELETE:** Delete; `204` No Content

## Standard Responses

**Success (2xx):**
```json
{
  "data": { /* resource */ },
  "meta": { "timestamp": "ISO8601", "requestId": "uuid" }
}
```

**Client error (4xx):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Actionable message",
    "details": [{ "field": "email", "issue": "invalid format" }]
  },
  "meta": { "requestId": "uuid" }
}
```

**Server error (5xx):**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An error occurred. Reference ID: <uuid>"
  },
  "meta": { "requestId": "uuid" }
}
```

## Versioning & Conflicts

- **`expectedVersion` header:** PATCH mutations; compare-and-swap. `409 VERSION_CONFLICT` returns `{ latestVersion, changes }`. [INV-14]
- **`Idempotency-Key` header:** Commands marked **I** in spec 11.3 (order placement, publication, RSVP submission). [Hard rule #4]
- **Timestamp:** All responses include `meta.timestamp` (DB server time, not client time)

## Authentication & Authorization

- **Custom opaque session token:** HttpOnly secure cookie `__Host-mori_session`; never JWT
- **Authorization header:** Bearer token for API calls (service-to-service); not for human clients
- **Request ID:** Generated per request; logged for traceability

## Related

- [API endpoints](./api-endpoints.md) — Specific routes
- [Sessions and identity](../authentication/sessions-and-identity.md) — Session management
- [Backend modules](../architecture/backend-modules.md) — Controller patterns

---

**Principle:** API is a contract; breaking changes require version boundary and migration path.

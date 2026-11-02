# ADR-17: Technical Defaults (TanStack Query, react-hook-form, etc.)

**Context:** Frontend and operational libraries need to be consistent across features. The handoff-brief section 2 and P00 version spike identified proven defaults.

**Decision:** Accept these libraries as established defaults (not in the spec; implementation choices):

| Area | Library | Rationale |
| --- | --- | --- |
| Client data fetching | TanStack Query | Automatic deduplication, stale-while-revalidate |
| Forms | react-hook-form + Zod | Validation, autosave, conflict UI |
| Password hashing | @node-rs/argon2 | Tuned Argon2id (m=19456, t=2, p=1) |
| Logging | pino | Structured, credential redaction |
| Dev email | Mailpit | SMTP sink + web UI |
| Dev storage | MinIO | S3-compatible for dev/test |
| Tests | Vitest + Playwright + k6 | Unit, E2E, load testing |

AI adapter modes (DISABLED/FAKE/REAL) from spec 12 + handoff-brief; see ADR-09.  
Compose services from spec 17.1–17.2; see ADR-14.

**Rejected alternatives:**
- Ad-hoc library choices per feature (inconsistency)
- Outdated libraries (maintenance burden)

**Consequences:**
- Consistent patterns across codebase
- Easier onboarding
- Faster code review (fewer "which library?" discussions)
- Upgrades are coordinated team decisions

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Handoff-brief section 2 (Accepted technical defaults), P00 version spike report, ADR-01–16

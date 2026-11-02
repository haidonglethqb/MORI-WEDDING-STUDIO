# System Documentation Hub

**Navigation:** Each domain is < 100 lines and links to related topics. Files cite spec sections for the full text.

## Architecture & Foundation

- **[Overview and topology](./architecture/overview-and-topology.md)** — Monorepo, surfaces, module boundaries. *Spec 1, 9.2–9.3*
- **[Monorepo layout](./architecture/monorepo-layout.md)** — Folder structure and ownership. *Spec 9.4*
- **[Backend modules](./architecture/backend-modules.md)** — NestJS module inventory. *Spec 9.5*
- **[Frontend state](./architecture/frontend-state.md)** — TanStack Query, forms, hooks. *Spec 9.6*
- **[Concurrency and locking](./architecture/concurrency-and-locking.md)** — Transaction order, row locks. *Spec 9.7*
- **[Version baseline](./architecture/version-baseline.md)** — Tech stack, pinned matrix. *Spec 9.1*

## Business Rules & Invariants

- **[Scope and roles](./business-rules/scope-and-roles.md)** — Release boundaries, actors, authority. *Spec 3.1–3.2*
- **[Commercial (no payment)](./business-rules/commercial-no-payment.md)** — Estimates, quotes, orders, money. *Spec 3.3*
- **[Operational defaults](./business-rules/operational-defaults.md)** — Quotas, expiry, retention. *Spec 3.4*
- **[Invariants](./business-rules/invariants.md)** — INV-01 through INV-16 summary. *Spec 4*
- **[State machines](./business-rules/state-machines.md)** — Request, revision, quote, order, invitation states. *Spec 6*

## Data Flows & Use Cases

- **[Happy paths](./data-flows/happy-paths.md)** — HP-01 to HP-06 summary. *Spec 5*
- **[Invitation publication](./data-flows/invitation-publication.md)** — Algorithm, privacy, guest links. *Spec 7.3–7.7*
- **[RSVP](./data-flows/rsvp.md)** — Modes, transaction, capacity rules, calendar. *Spec 7.8–7.10*

## Database

- **[Conventions](./database/conventions.md)** — Naming, types, immutability. *Spec 10.1*
- **[Entities: identity & catalogue](./database/entities-identity-catalogue.md)** — Accounts, profiles, products. *Spec 10.2*
- **[Entities: projects, design, orders](./database/entities-projects-design-orders.md)** — Service requests, revisions, quotes, orders. *Spec 10.2*
- **[Entities: invitations & RSVP](./database/entities-invitations-rsvp.md)** — Invitations, revisions, events, responses. *Spec 10.2*
- **[Entities: media, ops, AI](./database/entities-media-ops-ai.md)** — Uploads, jobs, tasks, AI records. *Spec 10.2*
- **[Constraints & snapshots](./database/constraints-and-snapshots.md)** — Unique/check indexes, approval/quote snapshots. *Spec 10.4–10.6*

## Backend API & Comms

- **[API conventions](./backend/api-conventions.md)** — HTTP, idempotency, versioning, auth. *Spec 11.1, 11.5*
- **[API endpoints](./backend/api-endpoints.md)** — `/auth/*`, `/me/*`, `/studio/*`, `/invitations/*`, `/public/*`. *Spec 11.3* (or split by route group)

## Authentication & Identity

- **[Sessions and identity](./authentication/sessions-and-identity.md)** — Custom opaque sessions, staff MFA, guest grants. *Spec 11.2, 3.2*

## Security & Privacy

- **[Threat model](./security/threat-model.md)** — Key attack vectors and mitigations. *Spec 15.2*
- **[Privacy and retention](./security/privacy-and-retention.md)** — Data retention, anonymization, RSVP deletion. *Spec 15.1, 15.3–15.4*
- **[Media uploads](./security/media-uploads.md)** — Scanning, presigned URLs, derivative generation. *Spec 14.1*

## Frontend UI & UX

- **[Visual system](./frontend/visual-system.md)** — Colour tokens, typography, spacing, breakpoints. *Spec 8.1–8.4*
- **[Screen inventory](./frontend/screen-inventory.md)** — UI-01 through UI-22 index. *Spec 8.5*
- **[Screen compositions](./frontend/screen-compositions.md)** — UI state flows, navigation patterns. *Spec 8.6–8.10*
- **[Accessibility and anti-slop](./frontend/accessibility-and-anti-slop.md)** — WCAG, performance, anti-AI patterns. *Spec 8.11–8.12*

## Deployment & Operations

- **[Compose services](./deployment/compose-services.md)** — Postgres, Redis, MinIO, Mailpit, ClamAV. *Spec 17.1–17.2*
- **[Env and secrets](./deployment/env-and-secrets.md)** — Configuration, `*_FILE` convention. *Spec 17.3*
- **[Commands and CI](./deployment/commands-and-ci.md)** — Scripts, GitHub Actions, health checks. *Spec 17.4–17.5*
- **[Outage, backup, runbooks](./deployment/outage-backup-runbooks.md)** — Failure scenarios, restore, escalation. *Spec 17.6–17.8*

## Testing & Release

- **[Acceptance test index](./testing/acceptance-test-index.md)** — TC ID ranges, titles. *Spec 18*
- **[Release policy](./testing/release-policy.md)** — Criteria, gates, sign-off. *Spec 18.10, 19.4*

## Background Workers

- **[Background tasks](./workers/background-tasks.md)** — BullMQ, outbox, task ledger, reconciler. *Spec 14.2–14.4*
- **[AI assistance](./workers/ai-assistance.md)** — Models, brief summarization, suggestions, policy. *Spec 12*
- **[Proofs & 3D print](./workers/proofs-3d-print.md)** — PDF rendering, 3D geometry, manifests, fallbacks. *Spec 13*

---

**Last updated:** 2026-10-31

**How to use:**
1. Find your domain or feature
2. Read the relevant file(s) — each is a concise summary
3. Reference spec section numbers to dive deeper into `docs/MORI_PROJECT_PLAN.md`
4. Check "Related" links for cross-cutting concerns
5. See `docs/adr/` for architectural decisions

**For agents:** Start with `AGENTS.md`, then read here. Always cite spec sections when you implement.

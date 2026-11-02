# Compose Services

**Spec:** 17.1–17.2 | See `MORI_PROJECT_PLAN.md` sections 17.1–17.2 (Service architecture, infrastructure)

## Dev/Test Docker Compose Stack

**Spec 17.1–17.2** services: postgres, redis, migrate, web, api, worker, object storage, dev mail sink.

**Decision:** Seven services: **postgres** (5432), **redis** (6379, appendonly+noeviction), **minio** (9000/9001 S3), **mailpit** (1025/8025 SMTP+web), **clamav** (3310, profile: scan, off by default — **Decision: see ADR-17**), **web** (3000, Next.js), **api** (3001, NestJS), **worker** (3002, background tasks).

All services have healthchecks. App services wait for postgres/redis/minio to be healthy before starting. See `docker-compose.yml` for full configuration.

## Service Details

| Service | Purpose | Port | Notes |
| --- | --- | --- | --- |
| **postgres** | Primary database | 5432 | `timestamptz` support, UUID extension |
| **redis** | Cache + BullMQ | 6379 | Appendonly + noeviction policy |
| **minio** | S3-compatible storage | 9000, 9001 | Web UI at 9001 |
| **mailpit** | Dev email sink | 1025, 8025 | SMTP + web UI for inspection |
| **clamav** | Antivirus | 3310 | Profile-gated (off by default) |
| **web** | Next.js app | 3000 | Storefront + workspace + public |
| **api** | NestJS backend | 3001 | All business logic |
| **worker** | Background tasks | 3002 | PDF, media, AI, durable jobs |

## Health Checks

Each service must provide a health endpoint:
- `/health/live` — Is service running?
- `/health/ready` — Is service ready to accept work?

Compose waits for all dependencies to report healthy before starting downstream services.

## Related

- [Env and secrets](./env-and-secrets.md) — Configuration
- [Commands and CI](./commands-and-ci.md) — Build, migrate, test
- [Version baseline](../architecture/version-baseline.md) — Pinned versions

---

**Principle:** Services isolated, composable, and health-checked. Easy local dev and CI replication.

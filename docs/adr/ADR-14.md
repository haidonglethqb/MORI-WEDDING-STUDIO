# ADR-14: Single-Host Compose First; Measured Scale-Up Later

**Context:** MORI pilot is launched at small scale (dozens of customers, not thousands). Building multi-host/load-balancer infrastructure before operations are stable adds unearned complexity.

**Decision:** v1 deploys to a single Docker host with Docker Compose (postgres, redis, minio, web, api, worker). No Kubernetes, no load balancer, no database replication. Scale-up happens after operations validation.

**Rejected alternatives:**
- Kubernetes v1: operational burden without scaling need
- No deployment plan: unclear how to run the thing

**Consequences:**
- Simple operations (one host, one systemd/docker service)
- Single point of failure (transparent, acceptable for pilot)
- No unsupported "highly available" claims
- Later scale-out is a separate operational plan (not a code change)

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 17 (deployment), handoff-brief section 4 (parallelism; no premature multi-host)

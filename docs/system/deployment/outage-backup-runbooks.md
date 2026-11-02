# Outage, Backup, Runbooks

**Spec:** 17.6–17.8 | See `MORI_PROJECT_PLAN.md` sections 17.6–17.8 (Failure scenarios, backup, operational runbooks)

## Failure Scenarios & Mitigations

| Failure | Impact | Mitigation |
| --- | --- | --- |
| Database unavailable | All reads fail; no state change | Read-only cache (Redis), fallback UI messages |
| Redis down | No rate limit, no BullMQ jobs | Jobs queued in database outbox; retry after restore |
| Mail provider down | Notifications delayed | Task ledger + retry; manual resend if needed |
| S3 storage down | No new uploads; read fails | Graceful degradation; serve cached derivatives |
| AI provider down | Assistance unavailable | Fallback to FAKE model; staff continues without suggestions |
| PDF renderer crash | Proof generation fails | Field-specific error; retry; notify staff |
| Worker process down | Background tasks accumulate | Task ledger prevents duplicates; restarts via health check |

[INV-11] **Database commit before provider call:** Completed action is durable; failed provider does not roll back.

## Backup Strategy

**Database backup:** PostgreSQL WAL (Write-Ahead Logging) + daily snapshots

```bash
# Daily backup (cron)
pg_dump -Fc $DATABASE_URL > /backups/mori-$(date +%Y%m%d).dump

# Restore drill (weekly)
pg_restore -Fc /backups/mori-20261031.dump
```

**Object storage backup:** MinIO versioning + snapshots (P00 spike to finalize)

**Retention:** 30-day rolling window for daily snapshots; 1 annual.

## Operational Runbooks

### Runbook: Database connection pool exhausted

1. **Check:** `SELECT count(*) FROM pg_stat_activity;` (current connections)
2. **Identify:** Long-running queries or idle connections?
3. **Action:** Kill idle: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state='idle';`
4. **Restart:** Restart API + worker; health checks auto-reconnect

### Runbook: Redis memory full

1. **Check:** `redis-cli INFO memory` (used vs. max)
2. **Policy:** Currently `noeviction` (fail on OOM). Consider `allkeys-lru` if appropriate.
3. **Action:** Either increase memory limit OR reduce TTLs for non-critical keys

### Runbook: RSVP capacity constraint

1. **Investigation:** `SELECT event_id, COUNT(*) FROM rsvp_answers WHERE attending=true GROUP BY event_id;`
2. **Action:** Owner can lower capacity (refund required if over cap) OR decline new responses
3. **Prevention:** Validate capacity during publication

### Runbook: Suspended invitation must be restored

1. **Verify:** `SELECT moderation_state FROM invitations WHERE id = ?;`
2. **Review:** Check audit logs for reason (spam, abuse report, etc.)
3. **Restore:** `UPDATE invitations SET moderation_state = 'ACTIVE' WHERE id = ?;` + audit log entry

## Related

- [Threat model](../security/threat-model.md) — Attack mitigation
- [Privacy and retention](../security/privacy-and-retention.md) — Data retention + backups
- [Background tasks](../workers/background-tasks.md) — Task ledger, outbox durability

---

**Principle:** Failures are expected; mitigation is documented and tested. Backup/restore drills are monthly.

# Phase 10 - Full release gate

## Context Links

- Spec: 15.2 (threat model + CSP/headers), 15.4 (retention), 16.1 (performance targets), 16.4 (metrics/alerts), 17.1-17.2 (deployment model, images), 17.3 (env/secrets), 17.5 (CI/CD release pipeline, expand/contract), 17.6 (outage behavior), 17.7 (backups/WAL/restore drill), 17.8 (runbooks), 18.7 (TC-104, 109..116), 18.8 (TC-117..120, 125, 126), 18.9 (TC-136, 140), 18.10 (release-blocking policy), 20.1 (full-v1 checklist), 20.2 (traceability), 21 (risks, launch inputs)
- Brief §3 HR-9, 11, 12; human gates MORI-062, 065, 066
- Requirement matrix from MORI-001: `docs/requirements/requirement-matrix.md`

## Overview

- Priority: P1. Status: Pending (needs P05 + P07 + P08 + P09).
- Off-host backups + WAL + restore drill; independent security review; load/mobile/a11y/visual measurement; migration/deploy/rollback/incident rehearsal; real inputs + studio training; full launch rehearsal and requirement-by-requirement sign-off.
- Exit gate: all full-v1 requirements and release blockers pass.

## Key Insights

- Spec 19.3 deps for 062 (054, 060) and 063 (054, 060) omit the digital lane (035/036) and order E2E (048); phase map covers it (P10 needs P05 + P07), but ticket-level scheduling could start the security review before RSVP/moderation/orders exist. Treat 062 and 063 as also depending on 036 and 048 (flagged).
- 18.10 release blockers: authorization, privacy, immutable approval, quote/order integrity, RSVP concurrency, payment exclusion, restore. Any failure blocks 066 regardless of test level.
- Restore success = DB rows + referenced objects + reapplied deletion/revocation ledger before traffic (17.7); measured RPO/RTO, not assumed.
- Production domains/hosting may not exist yet (21.2); rehearsals run on a production-shaped staging Compose host.

## Requirements

- Functional: WAL archiving + periodic base backups + encrypted off-host copies (db roles/config, object versions, key recovery material, deploy config); backup health in UI-21 + alerts; isolated restore runbook; security review fixes; k6 scenarios; Lighthouse/field-like mobile runs; a11y audits; visual screenshots of required screens; `compose.prod.yaml`; release workflow (build/scan/tag by commit, migrate one-shot, staged deploy, smoke, record digests); runbooks 17.8; training materials; launch rehearsal with AI disabled, email delayed, worker restart.
- Non-functional: RPO <= 15 min, RTO <= 4 h (proposed, measured); LCP <= 2.5 s, CLS <= 0.1, INP <= 200 ms; API reads p95 <= 500 ms; RSVP/order p95 <= 800 ms; guest JS <= 180 KB; 100 concurrent guest readers + 10 RSVP writes/s.

## Architecture

- Backups: Postgres WAL archive (e.g. pgBackRest or wal-g, choose in ADR during 061) to separate object storage with separate credentials; base backups on schedule; MinIO/S3 versioning + replication for private objects; `backup` service in `compose.prod.yaml`; backup age + WAL lag metrics -> alerts.
- Release: GitHub Actions release workflow -> build + trivy -> push images tagged by commit -> ephemeral DB migrate + smoke -> staging deploy -> critical suites -> production `migrate` one-shot -> api/worker/web -> readiness + smoke -> record digests/schema/config versions.

## Related Code Files

Create:
- `compose.prod.yaml`, `infra/backup/**`, `infra/scripts/{restore-drill,reapply-deletion-ledger,smoke-prod}.ts|sh`
- `.github/workflows/release.yml`
- `docs/runbooks/{bad-deploy,database-outage,lost-redis,stuck-media-task,leaked-invitation,incorrect-approved-artwork,suspicious-staff-access,missed-backup,rsvp-data-removal,backup-restore}.md`
- `docs/adr/ADR-17-backup-tooling.md` (if tooling chosen), `docs/training/**`
- `tests/security/**` (headers/CSP, authz matrix, upload, cache, secrets), `tests/performance/{k6,lighthouse}/**`, `tests/e2e/a11y/**`, `tests/e2e/launch-rehearsal/**`
- `apps/api/src/modules/operations/health-summary/**` (backup/WAL status for UI-21), `apps/web/src/app/(studio)/admin/operations/backups/**`

## Ticket Table

| Ticket | Work | Agent | Depends | Owned paths | Endpoints | UI | TCs | Completion evidence |
|---|---|---|---|---|---|---|---|---|
| MORI-061 | Off-host backups/WAL recovery; rehearse restoration | fullstack-developer (platform) | 035, 048 | `infra/backup/**`, `compose.prod.yaml` (backup service), `infra/scripts/{restore-drill,reapply-deletion-ledger}.*`, `apps/api/src/modules/operations/health-summary/**`, `apps/web/src/app/(studio)/admin/operations/backups/**`, `docs/runbooks/{backup-restore,missed-backup}.md` | added `GET /admin/operations/health-summary` | UI-21 (backups, health) | TC-115, 116, 136 | Measured RPO/RTO; deleted content stays unavailable |
| MORI-062 | Review authz, session/CSRF, upload, cache, CSP, secrets, abuse | **human** (security/tech lead) + tester prep | 054, 060 (+036, 048 recommended) | `tests/security/**`, security headers config in `apps/web/next.config.ts` + `infra/proxy/Caddyfile` (CSP/HSTS), `plans/261031-mori-v1/reports/mori-062-*.md` | all | all | TC-006..012, 050, 056, 058, 092, 096, 112, 113, 125, 131, 132 (rerun) | All privacy/security blockers fixed; no unsupported assurance claims |
| MORI-063 | Measure load, mobile perf, accessibility, visual fidelity | tester + ui-ux-designer | 054, 060 (+036, 048 recommended) | `tests/performance/**`, `tests/e2e/a11y/**`, `plans/261031-mori-v1/reports/mori-063-*.md` | - | UI-01, 02, 03, 10, 12, 14, 17, 22 (sign-off set) | TC-109, 111, 117..120, 126 | Budget results recorded; TC-111 + UI acceptance evidence |
| MORI-064 | Rehearse migrations, deployment, rollback, incident runbooks | fullstack-developer + docs-manager | 061, 062 | `.github/workflows/release.yml`, `compose.prod.yaml` (app services), `infra/scripts/smoke-prod.*`, `docs/runbooks/**` (remaining) | `/health/live`, `/health/ready` | UI-21 | TC-104, 114 | Staging-to-production-shaped rehearsal + rollback evidence |
| MORI-065 | Finalize real catalogue/print/pricing/policy inputs; train studio | **human** (product/studio) + docs-manager prep | 018, 048, 054 | `docs/training/**`, `infra/scripts/content/check-no-fixtures.ts`, `docs/launch-inputs.md` (status updates) | admin endpoints | UI-16..21 (training) | TC-013, 128 (rerun on real data) | No fixture prices/content; production + privacy ownership assigned |
| MORI-066 | Complete launch rehearsal + requirement-by-requirement sign-off | **human** (product/QA/lead) + tester prep | 036, 060, 063, 064, 065 | `tests/e2e/launch-rehearsal/**`, `plans/261031-mori-v1/reports/mori-066-*.md` | all | all | TC-140 + 18.10 blocker set | All full-v1 requirements pass; no unresolved blockers |

## Agent Briefs

### MORI-061 - Backups and restore
- Pick WAL tooling (record ADR); configure archive + base backups to off-host encrypted storage with separate credentials.
- Object storage versioning/replication matching DB RPO; back up roles/config, key recovery material, deploy config.
- Metrics: backup age, WAL archive lag; alerts for missing daily backup + RPO threat (TC-136: failure -> actionable alert, no false healthy).
- Restore drill script: isolated env, email/AI/webhooks disabled; verify schema, counts, current + protected invitation, RSVP totals, approved proof checksum, order totals, object access, task replay (TC-115).
- Reapply deletion/revocation ledger (from 035) and invalidate sessions/grants before traffic (TC-116).
- Record measured RPO/RTO in report; UI-21 shows backup status.

### MORI-062 - Security review (HUMAN-GATED)
- Agent CAN prepare: authz matrix test (every endpoint x actor O/S/A/G/V), CSRF/origin suite, upload abuse suite, cache-header audit (both hosts), CSP (no unsafe-inline/eval; nonces/hashes per Next version), HSTS (after TLS verified), nosniff, frame-ancestors, permissions policy, secret scan of images/bundles/logs, dependency/image scan report, threat-model checklist (15.2) with evidence links.
- Rerun TC list in table; collect failures as blocker tickets.
- Human MUST: independent review, decide residual risks, sign; no "certified secure" claims.

### MORI-063 - Performance, a11y, visual
- k6: 100 concurrent guest readers + 10 RSVP writes/s burst; verify capacity invariants after run (TC-111); pool exhaustion bounded (TC-109).
- Mobile: throttled network + representative phones for UI-01/02/03/22; record LCP/CLS/INP, guest JS size, initial transfer.
- a11y: axe + manual keyboard, 200% zoom, 320 px reflow, reduced motion on editor, proof approval, passcode, RSVP (TC-119, 120).
- Visual: screenshots UI-01, 02, 03, 10, 12, 14, 17, 22 at 390/1440 with long Vietnamese names (TC-117, 118); empty/loading/error/conflict states (TC-126); 8.12 checklist. Human visual acceptance recorded (18.10).

### MORI-064 - Deploy and rollback rehearsal
- `compose.prod.yaml`: only proxy publishes ports; non-root, read-only fs, limits, no docker socket, image digests.
- Release workflow per 17.5 steps 1-8; `migrate deploy` only (never `migrate dev`/`db push`/demo seed in prod).
- Expand/contract rehearsal: migrate previous-release DB (TC-104), roll back app after expand migration (TC-114).
- Runbooks 17.8 written and each exercised once on staging (bad deploy, lost Redis, stuck media task, leaked invitation, etc.).

### MORI-065 - Real inputs and training (HUMAN-GATED)
- Agent CAN prepare: `check-no-fixtures` script (fails if any ACTIVE product, pricebook, profile, content has `isFixture`), status table in `docs/launch-inputs.md`, staff training guides for UI-16..21 workflows (queue, proofs, quotes, fulfillment, moderation, operations), policy-copy placeholders list.
- Human MUST: supply/approve real catalogue, prices, print profiles, legal/privacy/no-payment wording, domains; assign production and privacy owners; complete training.

### MORI-066 - Launch rehearsal (HUMAN-GATED)
- Agent CAN prepare: rehearsal script covering HP-01..06 with AI disabled, email delayed, worker restart mid-run (TC-140); checklist from spec 20.1 + requirement matrix with evidence links per BR/UR; blocker summary from 18.10 suites.
- Human MUST: run rehearsal, sign each requirement, confirm no unresolved release blocker.

## Implementation Steps

1. 061 (after 035 + 048) and test-prep for 062/063 in parallel.
2. 062 and 063 after 054 + 060 (and 036 + 048).
3. 064 after 061 + 062.
4. 065 human work can run from P07 onward; closes after 054.
5. 066 last.

## Todo List

- [ ] MORI-061 backups + restore drill + alerts
- [ ] MORI-062 security pack + human review
- [ ] MORI-063 load/perf/a11y/visual evidence
- [ ] MORI-064 release workflow + rollback + runbooks
- [ ] MORI-065 real inputs + training
- [ ] MORI-066 launch rehearsal + sign-off

## Success Criteria

- TC-104, 109..116, 136, 140 and all 18.10 blocker suites executed and passing; measured RPO/RTO recorded; every BR/UR signed with evidence.

## Risk Assessment

- 062/063 ticket deps omit digital lane/order E2E (flagged).
- No real hosting/domains -> rehearse on production-shaped staging; commercial launch blocked until 065.
- WAL tooling complexity on single host -> start with documented tool, measure; nightly dumps only if 24 h RPO explicitly accepted for pilot (17.7).

## Security Considerations

- Backups encrypted, separate credentials, restore never serves traffic before ledger reapply. Security review independent of implementers where feasible (19.3 note).

## Next Steps

- Post-launch: items in spec 3.1 "Later" require explicit new decisions/ADRs.

# Release Policy

**Spec:** 18.10, 19.4 | See `MORI_PROJECT_PLAN.md` sections 18.10 (Definition of done), 19.4 (Complete-release definition)

## Definition of Done (per ticket)

Each ticket is **DONE** when:

1. **Code complete:** Implementation matches specification; no TODOs left
2. **Tests pass:** All unit, integration, and acceptance tests (TC range) run and pass on real services
3. **No coverage decrease:** New code has test coverage ≥ baseline (set in v1)
4. **Reviewed:** Code review passed; no blocking comments
5. **Documentation updated:** Related `docs/system/` files updated or new files created
6. **Report filed:** Ticket report lists: ticket ID, BR/UR affected, invariants (INV-*), TCs passed

## Complete-Release Criteria

Before **v1.0 launch**, all of the following must be complete and verified:

1. **Phase P00 complete:** Agent docs hub, ADRs, tech spike results, launch-inputs, version baseline pinned
2. **Phase P01 complete:** Core auth, sessions, MFA, common interceptors, rate limiting, audit logging, compose stack, CI/CD
3. **Phase P02 complete:** Catalogue, tokens, pricing pure-TS, UI tokens, acceptance tests TC-001-020, TC-024, TC-128-129
4. **Phase P03 complete:** Media/upload/scanning, worker/tasks, RSVP schema, tests TC-044-045, TC-049, TC-058-062, TC-105-108, TC-135
5. **Phase P04 complete:** Publication algorithm, privacy modes, guest links, media gateway, share/QR, tests TC-043, TC-046-057, TC-064, TC-121-124, TC-127, TC-130-132, TC-137-138
6. **Phase P05 complete:** RSVP full flow, capacity, moderation, tests TC-065-088, TC-133-134
7. **Phase P06 complete:** Design schema, 3D proofs, state machines, PDF, tests TC-026-032, TC-101
8. **Phase P07 complete:** Quote/order workflow, fulfillment tracks, tests TC-021-023, TC-025, TC-033-042, TC-125, TC-139
9. **Phase P08 complete:** 3D geometry (flat/bi-fold), fallbacks, tests TC-097-102
10. **Phase P09 complete:** AI assistance, quotas, circuit breaker, tests TC-089-096
11. **Security review passed:** External audit of threat model, auth, CSRF, injection, access control
12. **Performance tested:** Lighthouse ≥ 90, Core Web Vitals pass, k6 load test TC-136 (1000 concurrent RSVPs)
13. **Accessibility audit passed:** WCAG 2.2 AA manual + automated; screen reader tested; 44×44 px touch targets
14. **All 140 TCs pass:** Every TC-001 through TC-140 executed and passing
15. **Backup/restore drill:** Successful restore from backup + verification of data integrity
16. **Launch rehearsal:** Staged deployment; stakeholder sign-off

## No-Go Gates

Release is **blocked** if:
- Any invariant (INV-01..16) is violated
- A TC fails and is not addressed before release
- Code coverage decreases
- Security audit has open critical/high findings
- Backup cannot be restored
- Hard rule #1 (no payments) violated in any surface

## Related

- [Acceptance test index](./acceptance-test-index.md) — TC catalogue (TC-001–TC-140)
- [Invariants](../business-rules/invariants.md) — INV-01..16 enforcement

---

**Principle:** Complete release verification is explicit, gate-based, and stakeholder-signed.

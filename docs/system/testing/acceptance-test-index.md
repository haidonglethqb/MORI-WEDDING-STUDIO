# Acceptance Test Index

**Spec:** 18 | See `MORI_PROJECT_PLAN.md` section 18 (Acceptance test catalogue)

Test case ranges by feature area, with one-line titles. Spec section 18 contains full TC details (happy path, edge cases, failures).

## Test Case Ranges

| TC Range | Area | Titles | Count |
| --- | --- | --- | --- |
| **TC-001–012** | Authentication & sessions | Login, logout, verify email, MFA setup, session expiry, security headers | 12 |
| **TC-013–020** | Catalogue & estimates | Product listing, filter, sort, estimate accuracy, pricing edge cases, currency handling | 8 |
| **TC-021–025** | Quotes & orders | Quote generation, quote expiry, order placement (idempotency), order snapshot immutability | 5 |
| **TC-026–032** | Design & proofs | Revision creation, approval, change requests, staff permissions, artifact hash validation | 7 |
| **TC-033–042** | Fulfillment & shipment | Track state transitions, quality check, shipment creation, delivery confirmation | 10 |
| **TC-043–057** | Invitation publication | Publish (algorithm), media validation, link generation, privacy modes, passcode gate, access epoch | 15 |
| **TC-058–062** | Media & uploads | Upload session, ClamAV scan, derivative generation, quarantine, derivative blocking | 5 |
| **TC-064–088** | RSVP | Modes (OPEN/GUEST_LIST/OFF), response submission, capacity validation, lock order, deadline enforcement, update/delete | 25 |
| **TC-089–096** | AI assistance | Budget/style recommendations, deterministic ranking, quota management, fallback to FAKE, no permission override | 8 |
| **TC-097–102** | 3D & proofs | Flat geometry, bi-fold geometry, texture mapping, fallback rendering, manifest hash | 6 |
| **TC-101–104** | Admin & moderation | Moderation queue, suspension, restoration, appeals, content review | 4 |
| **TC-105–111** | Deployment & runbooks | Health checks, failover, backup restore, load test, a11y audit | 7 |
| **TC-112–116** | Availability & resilience | Database unavailable, Redis down, email delayed, S3 timeout, no silent data loss | 5 |
| **TC-121–124** | Calendar & sharing | `.ics` generation, format validation, map links, social OG preview, QR scanning | 4 |
| **TC-125** | No-payment rule | No "Payment", "Paid", "Deposit" in any user-facing text or API | 1 |
| **TC-127–132** | Guest experience | Guest link, revocation, resubmit RSVP, offline graceful degrade, no account required | 6 |
| **TC-133–135** | Concurrency stress | Simultaneous RSVP submissions (capacity), concurrent edits (version conflict), order race | 3 |
| **TC-136–140** | Security & privacy | Cross-account access denied, credential not in logs, RSVP never public, guest session ephemeral, media ownership | 5 |

**Total:** 140 acceptance test cases

Each range is assigned to a feature lane during phase planning. All TCs must pass before release gate.

## Related

- [Release policy](./release-policy.md) — Gate criteria
- [Invariants](../business-rules/invariants.md) — INV-01..16 enforce TCs

---

**Execution:** Automated (unit + integration), manual (E2E + a11y), exploratory (edge cases).

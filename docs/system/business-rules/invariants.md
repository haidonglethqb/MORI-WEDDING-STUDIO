# Non-Negotiable Invariants

**Spec:** 4 | See `MORI_PROJECT_PLAN.md` section 4 (Non-negotiable invariants)

Every invariant has required enforcement (see spec section 4 for details).

| ID | Invariant | Enforcement |
| --- | --- | --- |
| **INV-01** | Every private read/write belongs to authorized principal | API policy + scoped query; negative tests |
| **INV-02** | Published invitation = one immutable publication revision | Atomic publication pointer; never render mutable JSON |
| **INV-03** | Approved proof and files immutable | Immutable revisions/assets; approval hash |
| **INV-04** | Print job uses accepted revision/spec, not "latest proof" | Order snapshot references |
| **INV-05** | Quote amount/scope unchanged after issue | New quote version for any change |
| **INV-06** | Retrying order command cannot create duplicate order | Idempotency record + unique constraint |
| **INV-07** | RSVP ≤ party allowance + event capacity | Transactional validation + event locks |
| **INV-08** | RSVP responses never in public page data | Dedicated allowlisted public DTO |
| **INV-09** | Unpublished/suspended/expired content denied on every request | Dynamic policy check; no shared cache |
| **INV-10** | AI cannot set prices, approve proofs, publish, modify orders | Read-only tool allowlist + app permissions |
| **INV-11** | Failed queue/provider ≠ roll back completed action | Database commit + durable task records |
| **INV-12** | Cross-account media ≠ guessed ID | Ownership/permission checked at attach & publish |
| **INV-13** | No workflow depends on payment state | No payment entities/guards/SDKs |
| **INV-14** | Stale editor cannot silently overwrite newer edit | Compare-and-swap `version`; conflict UI |
| **INV-15** | Credentials/tokens never in logs/metadata/analytics | Redaction, fragment-based links, DTO tests |
| **INV-16** | One accepted service request = at most one v1 order | Database uniqueness, not disabled button |

## Related

- [Scope and roles](./scope-and-roles.md) — INV-01 (authorization)
- [State machines](./state-machines.md) — Transition guards
- [RSVP](../data-flows/rsvp.md) — INV-07 (capacity), INV-14 (version)

---

**Enforcement:** Every invariant has acceptance tests (TCs). Violations block release.

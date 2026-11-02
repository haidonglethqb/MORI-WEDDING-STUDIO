# RSVP

**Spec:** 7.8–7.10 | See `MORI_PROJECT_PLAN.md` sections 7.8 (Modes and data rules), 7.9 (Transaction and capacity), 7.10 (Calendar, music, post-event)

## Modes

| Mode | Who May Respond | Duplicate/Update |
| --- | --- | --- |
| OFF | Nobody | Form absent; old responses remain private history |
| OPEN | Anyone authorized | One open party per guest session/invitation; repeats update |
| GUEST_LIST | Valid named guest grant holders | One response per party; eligible events only |

## Data Rules

Response = stable party identity + per-event answers.

- `ATTENDING`: 1–N (≤ party event allowance)
- `DECLINED`: 0
- `UNANSWERED`: remains unanswered; not treated as declined

Optional contact/dietary: only if enabled + explained; never required.

**Open party:** Authorized guest explicitly creates private manage link (high-entropy secret shown once, stored as digest). Existing exchange endpoint consumes under same rules. Named guests reuse owner-issued link. Lost secret regenerable only from current session or owner assistance. [INV-08]

**Duplicate handling:** Clearing cookies can create second party. Show limitation in owner UI. Switch from OPEN → GUEST_LIST preserves history but removes open-party write permission; owner confirms consequence.

**Counts:** Per-event, not summed across events. "Unique guests" ≠ per-event attendance.

## Transaction & Capacity (Spec 7.9)

1. Authenticate grant/open session. Validate: invitation state, access epoch, RSVP mode, schema, idempotency.
2. BEGIN; Lock: invitation policy row → event rows (ascending ID) → party/response row.
3. Recheck: publication, eligibility, deadline (DB time), party allowance, response version.
4. Calculate per-event deltas. With event locks, compute capacity used by non-excluded ATTENDING responses; verify delta fits. [INV-07]
5. Upsert response + answers, append audit/change, create notification task. COMMIT.
6. Return: accepted values, response version, scoped manage capability. Never return other parties' responses.

**Capacity conflict:** `409 EVENT_CAPACITY_EXCEEDED`; preserve guest input. No automatic waitlist. Lowering capacity below accepted attendance rejected unless owner removes cap; app does not silently revoke guests.

**After deadline:** Guest mutations → `409 RSVP_CLOSED`; viewing existing response still available. Owner corrections after closure recorded as owner edit (reason required).

## Calendar, Maps, Music, Post-Event

**Calendar (`.ics`):** Stable event UID, incrementing sequence, correct iCalendar format, UTC or standards-compliant zone. Verify in actual calendar clients. Downloads are snapshots; no automatic updates without subscribed feed.

**Maps:** Client-side construction from validated coordinates/address. Embed only after guest action; text fallback. External links use safe schemes, `rel="noopener noreferrer"`.

**Music:** Play paused; explicit controls. Handle rejected promises, unsupported formats. Failure does not obstruct invitation/RSVP.

**Post-event:** Replace countdown with calm past-event message. Never show negative time. Reminder before expiry + RSVP-data deletion.

## Related

- [Happy paths](./happy-paths.md) — HP-06 guest RSVP flow
- [Invitation publication](./invitation-publication.md) — Event eligibility, deadline rules
- [Invariants](../business-rules/invariants.md) — INV-07 (capacity), INV-08 (no guest list in public DTO)

---

**Principle:** RSVP is transactional, capacity-aware, and maintains strong privacy boundaries between guests and public viewers.

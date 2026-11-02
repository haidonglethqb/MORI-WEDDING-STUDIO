# Invitation Publication

**Spec:** 7.3–7.7 | See `MORI_PROJECT_PLAN.md` sections 7.3 (Publication algorithm), 7.4–7.7 (Links, privacy, revocation)

## Publication Algorithm

1. Check account verification, ownership, moderation, quota, draft version.
2. Read consistent draft snapshot. Validate: required fields, time rules, template version, asset readiness, consent.
3. For existing invitation: preserve event IDs. Events with responses cannot be silently deleted. Material time/venue changes mark affected answers `needsReconfirmation`. Publication updates projections in same transaction.
4. Prepare media derivatives before publication. Missing output blocks with field-specific message.
5. Short transaction: lock owner quota row + invitation row (ascending order). Recheck draft version + prerequisites. Insert immutable `InvitationRevision`, media references. Atomically update `publishedRevisionId`, `publishedAt`, publication state.
6. Append audit + durable task records (same transaction). Optional OG generation may finish later.
7. Return stable URL + revision. Never return editor URL as share URL.
8. Interrupted/retried publish returns existing result using idempotency key. Two concurrent first publishes cannot consume two quotas.

## Link & Privacy Modes

**Public URL:** `https://invite.mori.example/i/<label>-<slug>` (slug unique, not secret)

| Mode | Guest Experience | Social/Search |
| --- | --- | --- |
| Anyone with the link | No account; view published allowlisted content | `noindex, nofollow`; generic social preview after consent |
| Passcode protected | Generic gate before private data returned | Generic metadata; no personal OG; `noindex` |
| Unpublished/expired/suspended | Generic unavailable | No personal metadata/assets |

**Rule:** `noindex` is crawler instruction, not access control. [INV-09]

## Guest Links & Revocation

**Named guest link:** `https://invite.mori.example/i/<slug>#guest=<256-bit-secret>`. Store only digest + access epoch.

Browser POST-exchanges secret for HttpOnly guest session; `history.replaceState` removes fragment. Server/proxy/analytics never see fragment in URLs.

**GuestGrant:** invitation ID, optional party ID, access epoch, allowed actions, kind, expiry. Narrowly scoped.

**Owner controls:** Revoke one party link, revoke all guest access, rotate public handle (increments access epoch, invalidates grants/links), unpublish, change passcode.

**Conservative:** Changing passcode or revoking all access increments access epoch; existing grants/links invalid. Confirmation explains QRs must be reissued.

## Cache & Media

**Cache-Control:** `private, no-store` for all HTML, JSON, guest data, RSVP, calendar, media responses. Route-level + fetch behavior both prevent caching. [INV-09]

**PublicInvitationView DTO:** Active publication revision + authorized optional party greeting only. Excludes: owner/account IDs, emails, notes, request/order IDs, upload originals, guest lists, responses, audit, token digests.

**Media gateway:** Policy-checking before serving. Verify media belongs to published revision + visitor authorized. Do not redirect protected media to reusable public object URLs. Immutable template CSS/JS can cache separately.

## Related

- [Happy paths](./happy-paths.md) — HP-03 publication flow
- [RSVP](./rsvp.md) — Deadline rules, capacity during publication
- [Privacy and retention](../security/privacy-and-retention.md) — Data deletion, guest access

---

**Principle:** Published invitations are immutable snapshots. Guest access is time-limited and revocable. Media access always checked.

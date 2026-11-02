# Entities: Invitations & RSVP

**Spec:** 10.2 | See `MORI_PROJECT_PLAN.md` section 10.2 (Data entities)

## Invitation & Publication

**Invitation** — Owned by customer; `draftVersion`, `publishedRevisionId` (null if draft-only), `publicationState` (DRAFT/PUBLISHED/UNPUBLISHED/EXPIRED), `expiresAt`, `moderationState` (ACTIVE/SUSPENDED).

**PublicHandle** — Stable public slug; `https://invite.mori.example/i/<slug>`. Unique; immutable once assigned. Rotation increments access epoch.

**InvitationRevision** — `draftVersion` or `publishedRevisionId` points to immutable revision; contains all content: display names, events, story, gallery, music choice, RSVP config. Media digests stored. [INV-02]

**InvitationMedia** — Immutable mapping of revision → media assets (photos, derivatives, audio digest). Media gallery + music reference.

## Events & RSVP Config

**Event** — Owned by invitation; title, local date/time, IANA zone, venue, address, optional coordinates, display order. Immutable once published unless owner consent.

**RsvpConfig** — Mode (OFF/OPEN/GUEST_LIST), deadline (DB time), event eligibility bitmap, per-event capacity, contact/dietary collection flags.

**GuestParty** — Owned by invitation; display name (optional), event allowance (bitmap or per-event limits), access epoch (revocation).

**GuestSession** — `guestGrantId`, party (optional), access epoch, expiry. HttpOnly; narrowly scoped.

## Responses

**RsvpResponse** — One per party per invitation (OPEN or GUEST_LIST); `version` (CAS), per-event answers (ATTENDING/DECLINED/UNANSWERED), response version, `createdAt`, `updatedAt`.

**RsvpAnswer** — One per response per event; attendance count (0 if DECLINED), contact details (optional), dietary info (optional), moderation flags (excluded, marked duplicate).

**RsvpChangeLog** — Append-only audit of response updates; actor (guest/owner), old/new values, `changedAt`.

## Related

- [Invitation publication](../data-flows/invitation-publication.md) — Revision/publication algorithm
- [RSVP](../data-flows/rsvp.md) — Transaction model, capacity, modes
- [Privacy and retention](../security/privacy-and-retention.md) — Response deletion/anonymization

---

**Key principle:** Invitations and events are customer-owned; responses are guest-generated. All changes audit-logged and privacy-respecting.

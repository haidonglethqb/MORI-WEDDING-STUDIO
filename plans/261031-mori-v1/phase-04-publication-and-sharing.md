# Phase 04 - Publication and sharing

## Context Links

- Spec: 5.3 (HP-03 steps 4-9), 6.5 (invitation lifecycle), 7.3 (publication algorithm), 7.4 (public link + privacy modes), 7.5 (guest links, epochs, revocation), 7.6 (rendering/media/cache contract), 7.7 (sharing/QR), 7.10 (calendar, maps, music, post-event), 8.5 (UI-13, UI-22), 8.9, 9.2 (invite host), 9.7 (lock order: quota -> invitation -> events), 10.2 (Invitation, InvitationHandle, InvitationRevision, InvitationEvent, GuestSession, GuestGrant, revision media links), 10.4 (`invitation_one_active_handle`), 11.3 (publish/unpublish/privacy/rotate-handle/revoke-guest-access; public `/api/public/v1/*`), 14.2 (OG task), 15.2-15.3, 16.2-16.3, 18.4, 18.8 (TC-121..124, 127, 130..132), 18.9 (TC-137, 138)
- Brief §2 (Caddy hosts, Argon2id for passcodes), §3 HR-2, 3, 4, 6, 7, 8; ADR-07

## Overview

- Priority: P1 (digital lane). Status: Pending (needs P03).
- Immutable publications with atomic live pointer; guest host SSR with allowlisted DTO and policy-checked media; passcode grants, access epochs, handle rotation; share panel + QR + safe OG; calendar/directions/gallery/music; rollback/expiry/suspension coverage.
- Exit gate: owner publishes; guest views; unpublish/revocation blocks fresh reads.

## Key Insights

- Every public response (HTML, JSON, media, ics) is `Cache-Control: private, no-store` and re-checks status + moderation + expiry + epoch on each request (INV-09). Set at Nest, Next route config (`dynamic = 'force-dynamic'`, `fetch cache: 'no-store'`), and proxy.
- TC-053 (revoke one party link) is listed under MORI-027, but GuestParty arrives in MORI-031 (P05). 027 builds grants/epochs/passcodes; `guest-exchange` and TC-053 move to 031.
- Publication step 3 (events with responses, `needsReconfirmation`) needs RSVP tables from 032. 025 implements stable event keys + retire semantics; 032 adds the reconfirmation flagging and TC-084.
- Music must come from a studio-curated library (14.1); no ticket owns that library. 029 adds a minimal curated audio list (staff upload purpose `AUDIO_LIBRARY`, rights flag).
- Rollback has no endpoint in 11.3; 030 adds `POST /invitations/:id/restore-revision` (**I, Vsn**) creating a new revision.

## Requirements

- Functional: publish/unpublish/privacy/rotate/revoke commands; slug = label + crypto suffix; public read; passcode gate; guest grant cookie (separate namespace); share panel; QR PNG/SVG download; OG generic default + optional consented image; `.ics` per event; directions links; gallery; user-triggered music; post-event state; restore older content as new revision; expiry read check.
- Non-functional: guest JS <= 180 KB compressed; initial load <= 1 MB excl. gallery/audio; `noindex,nofollow`; `Referrer-Policy: no-referrer`; passcode rate limits per invitation/IP; grant 12 h capped by expiry.

## Architecture

- PublishInvitation use case (Nest, one tx): lock `User` quota row -> `Invitation` -> `InvitationEvent` rows sorted by id; recheck draft version, verified, moderation, quota; insert `InvitationRevision` (+ `InvitationRevisionMedia` links); upsert event projection; set `publishedRevisionId`, `publishedAt`, status PUBLISHED; ensure one active handle; audit + outbox (OG task); store idempotency result.
- Guest host: Caddy routes `invite.mori.localhost` -> Next `app/i/[slug]` + `/api/public/v1/*`; denies `/admin`, `/dashboard`, `/auth`, `/api/v1` on invite host. Next middleware validates host context.
- Public read: Next server component -> `GET /api/public/v1/invitations/:slug` (forwarding guest cookie) -> `PublicInvitationView` (allowlist mapper; unit test snapshot of keys).
- Media gateway: `GET /invitations/:slug/media/:derivativeId` -> check derivative belongs to current published revision + visitor access -> stream from private storage; no redirect to object URL; Next image optimizer disabled for these paths.

## Related Code Files

Create:
- `packages/database/prisma/schema/{publication,guest-access}.prisma` (or extend `invitations.prisma` within this lane)
- `apps/api/src/modules/invitations/{publication,public-read,access,sharing,calendar,music}/**`, `apps/api/src/modules/media/gateway/**`
- `apps/worker/src/processors/og-image/**`
- `packages/contracts/src/{invitations/publication,public}/**`
- `apps/web/src/app/i/[slug]/**`, `apps/web/src/middleware.ts` (host rules), `apps/web/src/app/(workspace)/dashboard/invitations/[id]/share/**`
- `apps/web/src/features/{guest-invitation,invitation-sharing,invitation-publish}/**`
- `infra/proxy/Caddyfile` (modify: invite host routes/deny rules)
- `tests/integration/{publication,public-read,guest-access}/**`, `tests/e2e/guest-view/**`, `tests/security/cache/**`

## Ticket Table

| Ticket | Work | Agent | Depends | Owned paths | Endpoints (11.3) | UI | TCs | Completion evidence |
|---|---|---|---|---|---|---|---|---|
| MORI-025 | Immutable publications, live pointer, event projection, quotas | fullstack-developer | 024, 022 | `publication` schema (InvitationRevision, InvitationHandle, InvitationEvent, revision media links), `apps/api/src/modules/invitations/publication/**`, `packages/contracts/src/invitations/publication/**`, `apps/web/src/features/invitation-publish/**` (publish review dialog), `tests/integration/publication/**` | `POST /invitations/:id/publish`, `POST /invitations/:id/unpublish` | UI-12 (publish dialog) | TC-046, 047, 048, 049 (publish), 061 (revision links) | Concurrent publish + draft/live separation tests |
| MORI-026 | Guest-host SSR, public DTO, media gateway, cache policy | fullstack-developer | 025 | `apps/web/src/app/i/[slug]/**`, `apps/web/src/middleware.ts`, `apps/web/src/features/guest-invitation/**`, `apps/api/src/modules/invitations/public-read/**`, `apps/api/src/modules/media/gateway/**`, `packages/contracts/src/public/**`, `infra/proxy/Caddyfile` (invite host), `tests/security/cache/**` | public `GET /csrf`, `GET /invitations/:slug`, `GET /invitations/:slug/media/:derivativeId` | UI-22 (public, unavailable, expired) | TC-050, 055, 056, 064, 127, 132 | No private fields; no-store verified at all layers |
| MORI-027 | Passcode grants, access epochs, revoke/rotate | fullstack-developer | 026, 010 | `guest-access` schema (GuestSession, GuestGrant), `apps/api/src/modules/invitations/access/**`, `apps/web/src/features/guest-invitation/passcode-gate/**`, `apps/web/src/features/invitation-sharing/privacy-controls/**`, `tests/integration/guest-access/**` | `POST /invitations/:id/privacy`, `/rotate-handle`, `/revoke-guest-access`; public `POST /invitations/:slug/access` | UI-22 (passcode gate), UI-13 (privacy) | TC-051, 052, 054, 055, 056 (TC-053 -> 031) | TC-051..056; generic protected metadata |
| MORI-028 | Share panel, safe OG, URL/clipboard/native share, QR | ui-ux-designer + fullstack-developer | 027 | `apps/web/src/app/(workspace)/dashboard/invitations/[id]/share/**`, `apps/web/src/features/invitation-sharing/**`, `apps/api/src/modules/invitations/sharing/**`, `apps/worker/src/processors/og-image/**` | added `GET /invitations/:id/share` (owner share state) | UI-13 | TC-122, 123 | UI-13; TC-122/123; no false delivery labels |
| MORI-029 | Event TZ display, calendar, directions, gallery/music | fullstack-developer | 023, 026 | `apps/api/src/modules/invitations/{calendar,music}/**`, `packages/invitation-renderer/src/sections/{events,gallery,music,map}/**` (coordinate with 023 owner), `apps/web/src/features/guest-invitation/{calendar,music,directions}/**` | public `GET /invitations/:slug/events/:eventId/calendar`; added `GET /admin/music-tracks`, `POST /admin/music-tracks` | UI-22 (events, gallery, music) | TC-121, 124, 130 | TC-121/124/130; no autoplay or arbitrary server fetch |
| MORI-030 | Rollback/expiry/suspension + guest-view test completion | tester + fullstack-developer | 028, 029 | `apps/api/src/modules/invitations/publication/restore/**`, `tests/integration/publication/{rollback,expiry,suspension}/**`, `tests/e2e/guest-view/**` | added `POST /invitations/:id/restore-revision` | UI-22 all states, UI-13 suspended | TC-043..064 applicable, 137, 138 | TC-043..064 applicable pass |

## Agent Briefs

### MORI-025 - PublishInvitation
- Follow spec 7.3 steps 1-8 exactly; lock order quota -> invitation -> events sorted (HR-8, 9.7); no storage/AI calls inside tx.
- Validation: required names/events/consent, IANA zones, template compatibility, assets READY + owned (TC-048, 049); missing derivatives block with field message.
- Slug: optional ascii label + 8+ char crypto suffix; `invitation_one_active_handle` partial unique index; slug unique forever.
- Stable event keys preserved; events cannot be silently deleted -> `retiredAt` (RSVP effects added in 032).
- Quota: one active self-service invitation per verified account (TC-047 real concurrency test with two connections).
- Draft edits after publish don't affect live (TC-046); status stays PUBLISHED while editing (6.5).
- **I, Vsn** on publish/unpublish; replay rechecks authz; replay after suspension does not republish (11.5).
- Unpublish: status UNPUBLISHED, drafts/revisions/RSVPs kept. Register revision media links with `MediaReferenceChecker` (TC-061).
- Publish dialog = review screen (8.8): missing fields, visibility, cover/name exposure, RSVP, expiry (180 d after latest event), draft vs live diff.

### MORI-026 - Guest host and gateway
- Next `app/i/[slug]`: SSR, `force-dynamic`, fetch `no-store`, response header `private, no-store`, `noindex,nofollow`, `Referrer-Policy: no-referrer`.
- `PublicInvitationView` mapper: explicit allowlist; test asserts no ownerUserId/email/orderId/guest list/token digest (TC-050, INV-08).
- Unavailable/expired/suspended/draft -> same generic page + 404-equivalent; no personal metadata (TC-064).
- Media gateway checks revision membership + current access per request; protected media never via image optimizer (TC-056).
- Caddy invite host deny list + Next middleware host validation; no list/search endpoints on invite host (TC-132).
- Essential content renders without JS (TC-127).
- Main-host cookie never sent/accepted on invite host (separate cookie names, host-only).

### MORI-027 - Access policy
- Passcode hashed Argon2id; never in URL/logs; `POST /access` generic failure + per-invitation/IP Redis limits (fail closed).
- GuestSession (separate cookie `__Host-mori_guest`), GuestGrant(invitationId, partyId null, kind PASSCODE|OPEN|NAMED, accessEpoch, permissions, expiresAt <= 12 h & invitation expiry).
- Every read compares grant epoch with `Invitation.accessEpoch` (TC-052).
- `/privacy` (**I, Vsn**): mode change, passcode change -> epoch++ with confirmation copy.
- `/rotate-handle`: revoke old handle, new slug; old -> generic 404, no redirect (TC-054).
- `/revoke-guest-access`: epoch++ (TC-052, 055).
- Passcode-mode OG/metadata generic even for crawlers (TC-051).
- Named-link exchange + TC-053 deferred to MORI-031 (flagged).

### MORI-028 - Sharing
- UI-13 states draft/published/revoked/suspended: live badge, privacy badge, canonical URL (from `PUBLIC_INVITE_ORIGIN`), expiry, "Open as a guest".
- `navigator.share` only after feature detect + user gesture; else Copy link + selectable URL (TC-122); never "Delivered/Invited/Read".
- QR from canonical URL (or named link later in 031); quiet zone, contrast; PNG download; regenerate after rotation (TC-123 printed sample = human step).
- OG: default MORI image; personal OG image only with explicit consent and only for link mode; worker task keyed by revision id.
- Unlisted-not-confidential disclosure text before publish/share (7.4).

### MORI-029 - Event utilities
- Show event local time + IANA zone label; optional labelled guest-local time; past events -> calm message, no countdown negative (7.10).
- `.ics`: RFC 5545 via vetted library or reviewed serializer; stable UID per event key, SEQUENCE increments on schedule change, escaping + line folding, no-store (TC-124).
- Directions: client-built URL from coordinates/encoded address; safe schemes; `rel="noopener noreferrer"`; map embed only after tap with text fallback (TC-130). No backend URL fetch.
- Music: curated track list (staff uploads purpose AUDIO_LIBRARY, `rightsCleared` flag); starts paused; handle rejected `play()`; failure never blocks RSVP (TC-121).
- Gallery: lazy below fold, srcset from gateway derivatives.

### MORI-030 - Hardening and coverage
- Restore older revision -> validate against current templates/assets -> new revision; reject retired template/invalid assets with guidance (TC-057, 138). Live policy (mode, epoch, expiry, moderation) not rolled back.
- Expiry: reads deny after `expiresAt`; renewal vs expiry race in versioned tx (TC-137). Sweep job in 035.
- Suspension: reads honor `moderationState=SUSPENDED` above all states; publish cannot clear it (endpoint/UI in 035; test via domain service).
- Run and record TC-043..064 applicable across HTML, JSON, ics, OG, media.

## Implementation Steps

1. 025 -> 026 -> 027 -> 028 (sequential core).
2. 029 after 026 (parallel with 027/028; touches renderer sections: coordinate with 023 owner).
3. 030 after 028 + 029.
4. Migrations: publication (025) -> guest-access (027) -> music tracks (029).

## Todo List

- [ ] MORI-025 PublishInvitation + concurrency tests
- [ ] MORI-026 guest host + DTO + gateway + cache tests
- [ ] MORI-027 passcode/epoch/rotate/revoke
- [ ] MORI-028 UI-13 + QR + OG
- [ ] MORI-029 ics/directions/music/gallery
- [ ] MORI-030 rollback/expiry/suspension + coverage run

## Success Criteria

- TC-043, 046-052, 054-057, 064, 121-124, 127, 130-132, 137, 138 executed and passing.
- Header audit script shows `private, no-store` on every invite-host response class.

## Risk Assessment

- TC-053 + guest-exchange need GuestParty (031) (flagged).
- Publication RSVP effects (reconfirmation) need P05 tables (flagged; completed in 032).
- Next caching defaults changing between versions: assert headers in tests, not config only.
- Music library gap (flagged): minimal admin list here.

## Security Considerations

- INV-02, 08, 09, 12, 15. Fragment secrets never server-side; no-store everywhere guest-facing; CSP without unsafe-inline/eval; no guest-supplied HTML/CSS/scripts.

## Next Steps

- P05 031 needs 027; 032 needs 025. P07 MORI-048 TC-039 needs 025 unpublish.

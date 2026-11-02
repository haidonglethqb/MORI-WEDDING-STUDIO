# Happy Paths

**Spec:** 5 | See `MORI_PROJECT_PLAN.md` section 5 (End-to-end happy paths)

## HP-01: Physical Invitation (Template-Based)

1. Visitor filters catalogue by shape/style/colour/budget. AI optional.
2. Product page shows specs, customization, material details, indicative price, flat/bi-fold preview.
3. Choose **Personalize this design** → temporary non-sensitive selection survives sign-in.
4. Verify email, create workspace, fill structured brief, choose quantity/spec, submit request.
5. Staff reviews, asks questions, prepares immutable revision 1.
6. Submit revision for review. Customer sees 2D proofs, 3D viewer, text summary, anchored comments.
7. Request changes. Staff create revision 2.
8. Customer approves revision 2 with explicit acknowledgement (names, dates, venues, quantity, hash).
9. Staff issue quote for same fingerprint.
10. **Place order request** atomically accepts quote + creates one order (no payment screen).
11. Staff confirm feasibility, start production, quality check, shipment, delivery.
12. Order complete; customer retains proof + order history.

## HP-02: Bespoke Physical Design

Choose **Request a custom design**, supply text/styles/quantity/deadline/reference images. UI states **Studio quote required**. Staff use AI to summarize or draft alternatives. Follow HP-01 proof/quote/order flow.

## HP-03: Self-Service Online Invitation

1. Customer creates invitation, selects versioned template.
2. Editor collects: display names, event schedule, venues, greeting, optional story, gallery, music, RSVP settings.
3. Autosave shows last server acknowledgement.
4. Preview phone/desktop views (same renderer). Missing sections identified.
5. Choose **Anyone with the link** or **Passcode protected**. Explicit publishing consent.
6. Publish validates content, assets, ownership, quotas, time, template. Immutable revision 1 created. Public pointer activated.
7. Receive stable URL, copy, native share, downloadable QR.
8. Guest opens URL without MORI account. Read details, optional music, directions, add to calendar, RSVP.
9. Owner sees per-event RSVP counts; guests never see response list.
10. Later edits remain draft. Link stable; public page switches atomically to revision 2 on publish.

## HP-04: Assisted Digital-Only Order

Customer requests studio-designed digital, reviews versioned digital proof, places DIGITAL order. Staff hand over approved draft to customer workspace. Digital complete when approved deliverable accessible + handover recorded. **Public release still requires owner publish action.** No shipment; no payment state.

## HP-05: Paper and Digital Bundle

BUNDLE = one physical + one digital track. Paper proof and digital deliverable each have own approval/version. Digital handover may finish before paper ships. Dashboard shows both timelines; order complete only when both complete. Later edits never change approved print file.

## HP-06: Named Guest Invitation and RSVP Update

Owner creates guest party, sets event eligibility + attendance. Generate private guest link. Guest opens fragment-token URL, exchanges token for scoped session, receives clean URL. Party addressed by name after authorization. Guest responds for permitted events, receives confirmation, can edit through same session until deadline. Repeated submissions update response, not increment count.

## Related

- [State machines](../business-rules/state-machines.md) — Service request, revision, quote, order transitions
- [Invitation publication](./invitation-publication.md) — HP-03 detail: publication algorithm, links, privacy
- [RSVP](./rsvp.md) — HP-06 detail: modes, transaction, capacity

---

**Design principle:** Each path is independent; user can preview before committing; studio approval required before public/production.

ALTER TABLE "rsvp_event_answers" DROP CONSTRAINT "rsvp_event_answers_eventId_fkey";
ALTER TABLE "rsvp_event_answers"
  ADD CONSTRAINT "rsvp_event_answers_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "invitation_events"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "party_event_allowances" DROP CONSTRAINT "party_event_allowances_eventId_fkey";
ALTER TABLE "party_event_allowances"
  ADD CONSTRAINT "party_event_allowances_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "invitation_events"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "rsvp_owner_edits" DROP CONSTRAINT "rsvp_owner_edits_eventId_fkey";
ALTER TABLE "rsvp_owner_edits"
  ADD CONSTRAINT "rsvp_owner_edits_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "invitation_events"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "party_event_allowances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partyId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "maxAttendees" INTEGER NOT NULL,
    CONSTRAINT "party_event_allowances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "party_event_allowances_partyId_eventId_key"
  ON "party_event_allowances"("partyId", "eventId");

ALTER TABLE "party_event_allowances"
  ADD CONSTRAINT "party_allowance_positive"
  CHECK ("maxAttendees" BETWEEN 1 AND 10);

ALTER TABLE "party_event_allowances"
  ADD CONSTRAINT "party_event_allowances_partyId_fkey"
  FOREIGN KEY ("partyId") REFERENCES "guest_parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "party_event_allowances"
  ADD CONSTRAINT "party_event_allowances_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "invitation_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

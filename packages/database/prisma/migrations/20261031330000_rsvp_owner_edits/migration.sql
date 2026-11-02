CREATE TABLE "rsvp_owner_edits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partyId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "previousStatus" "RsvpAnswerStatus" NOT NULL,
    "previousCount" INTEGER NOT NULL,
    "nextStatus" "RsvpAnswerStatus" NOT NULL,
    "nextCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rsvp_owner_edits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rsvp_owner_edits_partyId_idx" ON "rsvp_owner_edits"("partyId");

ALTER TABLE "rsvp_owner_edits"
  ADD CONSTRAINT "rsvp_owner_edits_partyId_fkey"
  FOREIGN KEY ("partyId") REFERENCES "guest_parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rsvp_owner_edits"
  ADD CONSTRAINT "rsvp_owner_edits_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "invitation_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

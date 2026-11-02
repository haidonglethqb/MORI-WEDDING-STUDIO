CREATE TYPE "GuestPartySource" AS ENUM ('ROSTER', 'OPEN');
CREATE TYPE "RsvpAnswerStatus" AS ENUM ('ATTENDING', 'DECLINED', 'UNANSWERED');

CREATE TABLE "invitation_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitationId" UUID NOT NULL,
    "stableEventKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "capacity" INTEGER,
    "retiredAt" TIMESTAMPTZ,
    CONSTRAINT "invitation_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invitation_events_invitationId_stableEventKey_key" ON "invitation_events"("invitationId", "stableEventKey");

CREATE TABLE "guest_parties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitationId" UUID NOT NULL,
    "source" "GuestPartySource" NOT NULL,
    "displayName" TEXT NOT NULL,
    "excludedAt" TIMESTAMPTZ,
    CONSTRAINT "guest_parties_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "guest_parties_invitationId_idx" ON "guest_parties"("invitationId");

CREATE TABLE "rsvp_responses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partyId" UUID NOT NULL,
    "invitationId" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "rsvp_responses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "rsvp_responses_partyId_key" ON "rsvp_responses"("partyId");

CREATE TABLE "rsvp_event_answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "responseId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "status" "RsvpAnswerStatus" NOT NULL,
    "attendeeCount" INTEGER NOT NULL,
    CONSTRAINT "rsvp_event_answers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "rsvp_event_answers_responseId_eventId_key" ON "rsvp_event_answers"("responseId", "eventId");

ALTER TABLE "rsvp_event_answers" ADD CONSTRAINT "rsvp_count_matches_status" CHECK (
    ("status" = 'ATTENDING' AND "attendeeCount" >= 1)
    OR ("status" IN ('DECLINED', 'UNANSWERED') AND "attendeeCount" = 0)
);

ALTER TABLE "invitation_events" ADD CONSTRAINT "invitation_events_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guest_parties" ADD CONSTRAINT "guest_parties_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rsvp_responses" ADD CONSTRAINT "rsvp_responses_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "guest_parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rsvp_event_answers" ADD CONSTRAINT "rsvp_event_answers_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "rsvp_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rsvp_event_answers" ADD CONSTRAINT "rsvp_event_answers_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "invitation_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

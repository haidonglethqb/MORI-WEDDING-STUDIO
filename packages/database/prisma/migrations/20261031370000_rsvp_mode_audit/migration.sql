CREATE TABLE "rsvp_mode_audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitationId" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "previousMode" "RsvpMode" NOT NULL,
    "nextMode" "RsvpMode" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rsvp_mode_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rsvp_mode_audits_invitationId_idx" ON "rsvp_mode_audits"("invitationId");

ALTER TABLE "rsvp_mode_audits"
  ADD CONSTRAINT "rsvp_mode_audits_invitationId_fkey"
  FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

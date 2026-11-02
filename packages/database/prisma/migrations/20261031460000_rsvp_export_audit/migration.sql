CREATE TABLE "rsvp_export_audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitationId" UUID NOT NULL,
    "actorUserId" UUID NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rsvp_export_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rsvp_export_audits_invitationId_idx" ON "rsvp_export_audits"("invitationId");

ALTER TABLE "rsvp_export_audits"
  ADD CONSTRAINT "rsvp_export_audits_invitationId_fkey"
  FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

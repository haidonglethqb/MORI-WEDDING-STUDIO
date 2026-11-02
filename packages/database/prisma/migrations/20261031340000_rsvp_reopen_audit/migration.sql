CREATE TABLE "rsvp_policy_audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitationId" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "previousDeadline" TIMESTAMPTZ,
    "nextDeadline" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rsvp_policy_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rsvp_policy_audits_invitationId_idx" ON "rsvp_policy_audits"("invitationId");

ALTER TABLE "rsvp_policy_audits"
  ADD CONSTRAINT "rsvp_policy_audits_invitationId_fkey"
  FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

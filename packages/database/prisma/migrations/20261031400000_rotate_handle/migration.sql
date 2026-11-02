DROP INDEX "invitation_handles_invitationId_key";

CREATE UNIQUE INDEX "invitation_one_active_handle"
  ON "invitation_handles" ("invitationId")
  WHERE "revokedAt" IS NULL;

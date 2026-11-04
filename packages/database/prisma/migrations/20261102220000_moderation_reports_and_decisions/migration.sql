CREATE TYPE "ModerationReportState" AS ENUM ('OPEN', 'REVIEWED');
CREATE TYPE "ModerationAction" AS ENUM ('SUSPEND', 'RESTORE');

ALTER TABLE "invitations"
  ADD COLUMN "moderationReason" TEXT,
  ADD COLUMN "moderationVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "moderation_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitationId" UUID NOT NULL,
    "reporterDigest" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "state" "ModerationReportState" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMPTZ,
    "reviewedByUserId" UUID,
    CONSTRAINT "moderation_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "moderation_reports_invitationId_state_idx"
  ON "moderation_reports"("invitationId", "state");

CREATE INDEX "moderation_reports_reporterDigest_createdAt_idx"
  ON "moderation_reports"("reporterDigest", "createdAt");

ALTER TABLE "moderation_reports"
  ADD CONSTRAINT "moderation_reports_invitationId_fkey"
  FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "moderation_decisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitationId" UUID NOT NULL,
    "adminUserId" UUID NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "previousState" "ModerationState" NOT NULL,
    "nextState" "ModerationState" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "moderation_decisions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "moderation_decisions_invitationId_createdAt_idx"
  ON "moderation_decisions"("invitationId", "createdAt");

ALTER TABLE "moderation_decisions"
  ADD CONSTRAINT "moderation_decisions_invitationId_fkey"
  FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

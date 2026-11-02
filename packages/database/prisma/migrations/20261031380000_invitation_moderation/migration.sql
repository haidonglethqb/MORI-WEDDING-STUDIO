CREATE TYPE "ModerationState" AS ENUM ('ACTIVE', 'SUSPENDED');

ALTER TABLE "invitations"
  ADD COLUMN "moderationState" "ModerationState" NOT NULL DEFAULT 'ACTIVE';

CREATE TYPE "RsvpMode" AS ENUM ('OFF', 'OPEN', 'GUEST_LIST');

ALTER TABLE "invitations"
  ADD COLUMN "rsvpMode" "RsvpMode" NOT NULL DEFAULT 'OPEN',
  ADD COLUMN "rsvpDeadlineAt" TIMESTAMPTZ;

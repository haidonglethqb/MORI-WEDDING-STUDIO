ALTER TYPE "InvitationStatus" ADD VALUE 'EXPIRED';

ALTER TABLE "invitations" ADD COLUMN "expiresAt" TIMESTAMPTZ;

ALTER TABLE "invitations" ADD COLUMN "passcodeHash" TEXT;
ALTER TABLE "invitations" ADD COLUMN "accessEpoch" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "guest_grants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitationId" UUID NOT NULL,
    "tokenDigest" TEXT NOT NULL,
    "accessEpoch" INTEGER NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "guest_grants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "guest_grants_tokenDigest_key" ON "guest_grants"("tokenDigest");
CREATE INDEX "guest_grants_invitationId_idx" ON "guest_grants"("invitationId");

ALTER TABLE "guest_grants" ADD CONSTRAINT "guest_grants_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

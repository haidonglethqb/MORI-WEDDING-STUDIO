ALTER TABLE "guest_parties" ADD COLUMN "exclusionReason" TEXT;

ALTER TABLE "guest_parties"
  ADD CONSTRAINT "guest_party_exclusion_reason"
  CHECK (
    ("excludedAt" IS NULL AND "exclusionReason" IS NULL)
    OR ("excludedAt" IS NOT NULL AND length(btrim("exclusionReason")) > 0)
  );

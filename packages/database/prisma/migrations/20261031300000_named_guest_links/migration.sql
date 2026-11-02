ALTER TABLE "guest_grants" ADD COLUMN "partyId" UUID;

ALTER TABLE "guest_grants"
  ADD CONSTRAINT "guest_grants_partyId_fkey"
  FOREIGN KEY ("partyId") REFERENCES "guest_parties"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "physical_fulfillments" ADD COLUMN "proofRevisionId" UUID;

ALTER TABLE "physical_fulfillments"
  ADD CONSTRAINT "physical_fulfillments_proofRevisionId_fkey"
  FOREIGN KEY ("proofRevisionId") REFERENCES "design_revisions"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

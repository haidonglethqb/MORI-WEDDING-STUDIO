ALTER TABLE "proof_annotations" DROP CONSTRAINT "proof_annotations_revisionId_fkey";

ALTER TABLE "proof_annotations"
  ADD CONSTRAINT "proof_annotations_revisionId_fkey"
  FOREIGN KEY ("revisionId") REFERENCES "design_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

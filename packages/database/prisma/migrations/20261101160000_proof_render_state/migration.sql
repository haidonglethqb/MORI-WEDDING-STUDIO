CREATE TYPE "ProofRenderState" AS ENUM ('PENDING', 'READY', 'FAILED');

ALTER TABLE "design_revisions"
  ADD COLUMN "renderState" "ProofRenderState" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "faceMapComplete" BOOLEAN NOT NULL DEFAULT false;

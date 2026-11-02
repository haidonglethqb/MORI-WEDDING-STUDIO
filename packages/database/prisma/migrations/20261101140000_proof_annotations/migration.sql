CREATE TABLE "proof_annotations" (
  "id" UUID NOT NULL,
  "revisionId" UUID NOT NULL,
  "authorUserId" UUID NOT NULL,
  "pageId" TEXT NOT NULL,
  "positionX" INTEGER NOT NULL,
  "positionY" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "resolvedAt" TIMESTAMPTZ,
  CONSTRAINT "proof_annotations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "proof_annotations_position_check" CHECK (
    "positionX" >= 0 AND "positionX" <= 1000000
    AND "positionY" >= 0 AND "positionY" <= 1000000
  )
);

CREATE INDEX "proof_annotations_revisionId_idx" ON "proof_annotations"("revisionId");

ALTER TABLE "proof_annotations"
  ADD CONSTRAINT "proof_annotations_revisionId_fkey"
  FOREIGN KEY ("revisionId") REFERENCES "design_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

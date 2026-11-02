CREATE TYPE "DesignRevisionState" AS ENUM ('WORKING', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'SUPERSEDED');

CREATE TABLE "design_revisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "state" "DesignRevisionState" NOT NULL DEFAULT 'WORKING',
    "manifestHash" TEXT NOT NULL,
    "isFixture" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "design_revisions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "design_revisions_requestId_sequence_key" ON "design_revisions"("requestId", "sequence");

CREATE TABLE "proof_approvals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "revisionId" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "manifestHash" TEXT NOT NULL,
    "approvedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "proof_approvals_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "proof_approvals_revisionId_key" ON "proof_approvals"("revisionId");

ALTER TABLE "design_revisions" ADD CONSTRAINT "design_revisions_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "proof_approvals" ADD CONSTRAINT "proof_approvals_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "design_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

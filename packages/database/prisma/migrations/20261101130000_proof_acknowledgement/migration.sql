ALTER TABLE "proof_approvals"
  ADD COLUMN "scopeFingerprint" TEXT,
  ADD COLUMN "acknowledgementVersion" TEXT NOT NULL DEFAULT 'legacy-unset';

ALTER TABLE "proof_approvals" ALTER COLUMN "acknowledgementVersion" DROP DEFAULT;

ALTER TABLE "media_assets" ADD COLUMN "byteSize" BIGINT NOT NULL DEFAULT 0;

CREATE TABLE "media_upload_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerUserId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "stagingKey" TEXT NOT NULL,
    "expectedBytes" INTEGER NOT NULL,
    "declaredMime" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "completedAt" TIMESTAMPTZ,
    "assetId" UUID,
    CONSTRAINT "media_upload_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_upload_sessions_stagingKey_key" ON "media_upload_sessions"("stagingKey");
CREATE UNIQUE INDEX "media_upload_sessions_assetId_key" ON "media_upload_sessions"("assetId");
CREATE INDEX "media_upload_sessions_ownerUserId_idx" ON "media_upload_sessions"("ownerUserId");

ALTER TABLE "media_upload_sessions" ADD CONSTRAINT "media_upload_sessions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "wedding_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "media_upload_sessions" ADD CONSTRAINT "media_upload_sessions_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

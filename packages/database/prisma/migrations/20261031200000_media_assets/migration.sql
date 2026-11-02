CREATE TYPE "MediaAssetState" AS ENUM ('READY', 'REJECTED');

CREATE TABLE "media_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerUserId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "state" "MediaAssetState" NOT NULL DEFAULT 'READY',
    "isFixture" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "media_assets_ownerUserId_idx" ON "media_assets"("ownerUserId");

ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "wedding_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

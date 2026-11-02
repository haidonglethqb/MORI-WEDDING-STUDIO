CREATE TABLE "media_derivatives" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assetId" UUID NOT NULL,
    "profile" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    CONSTRAINT "media_derivatives_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_derivatives_assetId_profile_key" ON "media_derivatives"("assetId", "profile");

ALTER TABLE "media_derivatives" ADD CONSTRAINT "media_derivatives_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

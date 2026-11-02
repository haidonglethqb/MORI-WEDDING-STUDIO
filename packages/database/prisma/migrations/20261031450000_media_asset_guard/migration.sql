ALTER TABLE "design_revisions" ADD COLUMN "mediaAssetId" UUID;

ALTER TABLE "design_revisions"
  ADD CONSTRAINT "design_revisions_mediaAssetId_fkey"
  FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

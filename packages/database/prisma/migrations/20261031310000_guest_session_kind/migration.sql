CREATE TYPE "GuestGrantKind" AS ENUM ('LINK', 'SESSION');

ALTER TABLE "guest_grants"
  ADD COLUMN "kind" "GuestGrantKind" NOT NULL DEFAULT 'SESSION';

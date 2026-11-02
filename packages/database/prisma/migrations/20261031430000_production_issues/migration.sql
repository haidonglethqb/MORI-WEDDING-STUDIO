ALTER TABLE "physical_fulfillments"
  ADD COLUMN "onHold" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "holdReason" TEXT,
  ADD COLUMN "heldByUserId" UUID;

CREATE TABLE "production_issues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "staffUserId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_issues_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "production_issues_orderId_idx" ON "production_issues"("orderId");

ALTER TABLE "production_issues"
  ADD CONSTRAINT "production_issues_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

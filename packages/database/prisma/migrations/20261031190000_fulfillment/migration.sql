CREATE TYPE "RequestKind" AS ENUM ('PAPER', 'DIGITAL', 'BUNDLE');
CREATE TYPE "PhysicalStage" AS ENUM ('PENDING', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED');
CREATE TYPE "DigitalStage" AS ENUM ('PENDING', 'IN_PROGRESS', 'READY_FOR_HANDOVER', 'HANDED_OVER');

ALTER TABLE "service_requests" ADD COLUMN "kind" "RequestKind" NOT NULL DEFAULT 'PAPER';

CREATE TABLE "physical_fulfillments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "stage" "PhysicalStage" NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "physical_fulfillments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "physical_fulfillments_orderId_key" ON "physical_fulfillments"("orderId");

CREATE TABLE "digital_fulfillments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "stage" "DigitalStage" NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "digital_fulfillments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "digital_fulfillments_orderId_key" ON "digital_fulfillments"("orderId");

ALTER TABLE "physical_fulfillments" ADD CONSTRAINT "physical_fulfillments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "digital_fulfillments" ADD CONSTRAINT "digital_fulfillments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

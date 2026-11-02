CREATE TYPE "ShipmentEventKind" AS ENUM ('EXCEPTION');

CREATE TABLE "shipments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shipments_orderId_key" ON "shipments"("orderId");

CREATE TABLE "shipment_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipmentId" UUID NOT NULL,
    "staffUserId" UUID NOT NULL,
    "kind" "ShipmentEventKind" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shipment_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shipment_events_shipmentId_idx" ON "shipment_events"("shipmentId");

ALTER TABLE "shipments"
  ADD CONSTRAINT "shipments_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shipment_events"
  ADD CONSTRAINT "shipment_events_shipmentId_fkey"
  FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "ServiceRequestStatus" AS ENUM ('APPROVED', 'CONVERTED', 'CANCELLED');
CREATE TYPE "QuoteState" AS ENUM ('ISSUED', 'ACCEPTED', 'WITHDRAWN', 'EXPIRED');
CREATE TYPE "OrderStatus" AS ENUM ('SUBMITTED', 'CONFIRMED', 'IN_FULFILLMENT', 'COMPLETED', 'CANCELLED');

CREATE TABLE "service_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'APPROVED',
    "version" INTEGER NOT NULL DEFAULT 0,
    "isFixture" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "service_requests_ownerUserId_idx" ON "service_requests"("ownerUserId");

CREATE TABLE "quotes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "state" "QuoteState" NOT NULL,
    "totalAmountVnd" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "scopeFingerprint" TEXT NOT NULL,
    "isFixture" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "quotes_requestId_sequence_key" ON "quotes"("requestId", "sequence");
CREATE UNIQUE INDEX "quote_one_issued_per_request" ON "quotes"("requestId") WHERE "state" = 'ISSUED';
ALTER TABLE "quotes" ADD CONSTRAINT "quote_total_nonnegative" CHECK ("totalAmountVnd" >= 0);

CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestId" UUID NOT NULL,
    "quoteId" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'SUBMITTED',
    "totalAmountVnd" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "acceptedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isFixture" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "orders_requestId_key" ON "orders"("requestId");
CREATE UNIQUE INDEX "orders_quoteId_key" ON "orders"("quoteId");

ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "wedding_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

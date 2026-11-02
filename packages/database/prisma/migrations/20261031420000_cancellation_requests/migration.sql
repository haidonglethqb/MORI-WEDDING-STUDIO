CREATE TYPE "CancellationRequestState" AS ENUM ('REQUESTED', 'APPROVED', 'DENIED');
CREATE TYPE "CancellationOutcome" AS ENUM ('CANCELLED_BEFORE_WORK', 'EXCEPTION_AFTER_WORK', 'DENIED');

CREATE TABLE "cancellation_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "state" "CancellationRequestState" NOT NULL DEFAULT 'REQUESTED',
    "outcome" "CancellationOutcome",
    "decisionReason" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMPTZ,
    CONSTRAINT "cancellation_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cancellation_requests_orderId_idx" ON "cancellation_requests"("orderId");

ALTER TABLE "cancellation_requests"
  ADD CONSTRAINT "cancellation_requests_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

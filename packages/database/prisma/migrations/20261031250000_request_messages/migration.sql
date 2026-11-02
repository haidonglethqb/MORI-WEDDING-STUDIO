CREATE TYPE "MessageVisibility" AS ENUM ('CUSTOMER', 'INTERNAL');

CREATE TABLE "request_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestId" UUID NOT NULL,
    "authorUserId" UUID NOT NULL,
    "visibility" "MessageVisibility" NOT NULL,
    "plainText" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "request_messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "request_messages_requestId_idx" ON "request_messages"("requestId");

ALTER TABLE "request_messages" ADD CONSTRAINT "request_messages_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

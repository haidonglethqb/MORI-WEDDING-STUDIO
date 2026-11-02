CREATE TABLE "background_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kind" TEXT NOT NULL,
    "resourceRef" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "leaseUntil" TIMESTAMPTZ,
    "nextRunAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "background_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "background_tasks_state_nextRunAt_idx" ON "background_tasks"("state", "nextRunAt");

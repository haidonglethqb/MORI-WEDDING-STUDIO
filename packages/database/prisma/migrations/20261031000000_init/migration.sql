-- CreateTable
CREATE TABLE "spike_checks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spike_checks_pkey" PRIMARY KEY ("id")
);

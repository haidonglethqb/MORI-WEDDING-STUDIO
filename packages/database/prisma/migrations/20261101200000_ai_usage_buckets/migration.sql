CREATE TABLE "ai_usage_buckets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subject" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    CONSTRAINT "ai_usage_buckets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_usage_buckets_subject_day_key" ON "ai_usage_buckets"("subject", "day");

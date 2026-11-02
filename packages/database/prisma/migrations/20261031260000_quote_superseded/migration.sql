DROP INDEX IF EXISTS "quote_one_issued_per_request";
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuoteState_new') THEN
    CREATE TYPE "QuoteState_new" AS ENUM ('ISSUED', 'ACCEPTED', 'WITHDRAWN', 'EXPIRED', 'SUPERSEDED');
  END IF;
END $$;
ALTER TABLE "quotes" ALTER COLUMN "state" TYPE "QuoteState_new" USING "state"::text::"QuoteState_new";
DROP TYPE "QuoteState";
ALTER TYPE "QuoteState_new" RENAME TO "QuoteState";
CREATE UNIQUE INDEX "quote_one_issued_per_request" ON "quotes" ("requestId") WHERE "state" = 'ISSUED';

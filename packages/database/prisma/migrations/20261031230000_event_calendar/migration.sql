ALTER TABLE "invitation_events" ADD COLUMN "localStart" TEXT;
ALTER TABLE "invitation_events" ADD COLUMN "timeZone" TEXT;
ALTER TABLE "invitation_events" ADD COLUMN "calendarSequence" INTEGER NOT NULL DEFAULT 0;

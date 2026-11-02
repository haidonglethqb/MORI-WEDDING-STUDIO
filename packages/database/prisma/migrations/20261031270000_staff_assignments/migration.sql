CREATE TABLE "staff_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "staffUserId" UUID NOT NULL,
    "rsvpAccess" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ,
    CONSTRAINT "staff_assignments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "staff_assignments_staffUserId_idx" ON "staff_assignments"("staffUserId");

ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "wedding_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

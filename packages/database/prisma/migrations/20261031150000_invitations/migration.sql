CREATE TYPE "InvitationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED');
CREATE TYPE "InvitationAccessMode" AS ENUM ('LINK', 'PASSCODE');

CREATE TABLE "wedding_projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerUserId" UUID NOT NULL,
    "internalTitle" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "wedding_projects_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "wedding_projects_ownerUserId_idx" ON "wedding_projects"("ownerUserId");

CREATE TABLE "invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'DRAFT',
    "draftVersion" INTEGER NOT NULL DEFAULT 0,
    "publishedRevisionId" UUID,
    "accessMode" "InvitationAccessMode" NOT NULL DEFAULT 'LINK',
    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invitations_publishedRevisionId_key" ON "invitations"("publishedRevisionId");
CREATE INDEX "invitations_projectId_idx" ON "invitations"("projectId");

CREATE TABLE "invitation_handles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitationId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "revokedAt" TIMESTAMPTZ,
    CONSTRAINT "invitation_handles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invitation_handles_invitationId_key" ON "invitation_handles"("invitationId");
CREATE UNIQUE INDEX "invitation_handles_slug_key" ON "invitation_handles"("slug");

CREATE TABLE "invitation_drafts" (
    "invitationId" UUID NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "invitation_drafts_pkey" PRIMARY KEY ("invitationId")
);

CREATE TABLE "invitation_revisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitationId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "schemaVersion" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "contentHash" TEXT NOT NULL,
    "publishedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invitation_revisions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invitation_revisions_invitationId_sequence_key" ON "invitation_revisions"("invitationId", "sequence");

ALTER TABLE "wedding_projects" ADD CONSTRAINT "wedding_projects_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "wedding_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitation_handles" ADD CONSTRAINT "invitation_handles_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitation_drafts" ADD CONSTRAINT "invitation_drafts_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitation_revisions" ADD CONSTRAINT "invitation_revisions_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_publishedRevisionId_fkey" FOREIGN KEY ("publishedRevisionId") REFERENCES "invitation_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

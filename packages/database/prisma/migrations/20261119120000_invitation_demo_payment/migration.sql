CREATE TYPE "InvitationDemoPaymentMethod" AS ENUM ('MOMO', 'VNPAY', 'BANK_QR');

CREATE TABLE "invitation_demo_payments" (
    "invitationId" UUID NOT NULL,
    "method" "InvitationDemoPaymentMethod" NOT NULL,
    "amountVnd" BIGINT NOT NULL,
    "confirmedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_demo_payments_pkey" PRIMARY KEY ("invitationId"),
    CONSTRAINT "invitation_demo_payments_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

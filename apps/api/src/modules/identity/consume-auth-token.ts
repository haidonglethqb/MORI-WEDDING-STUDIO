import type { PrismaClient } from '@mori/database'

export async function consumeAuthToken(
  prisma: PrismaClient,
  digest: string,
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
): Promise<string | undefined> {
  const rows = await prisma.$queryRaw<{ userId: string }[]>`
    UPDATE auth_tokens
    SET "usedAt" = NOW()
    WHERE digest = ${digest}
      AND purpose::text = ${purpose}
      AND "usedAt" IS NULL
      AND "expiresAt" > NOW()
    RETURNING "userId"
  `
  return rows[0]?.userId
}

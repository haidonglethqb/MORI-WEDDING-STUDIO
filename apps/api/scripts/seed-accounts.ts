import { getPrismaClient } from '@mori/database'
import { normalizeEmail } from '@mori/domain'
import { hashPassword } from '../src/modules/identity/password.js'

export const DEV_ACCOUNTS = [
  {
    email: 'admin@mori.local',
    displayName: 'Quản trị viên Mori',
    role: 'ADMIN' as const,
    password: 'MoriWedding2026!',
  },
  {
    email: 'studio@mori.local',
    displayName: 'Nhân viên xưởng Mori',
    role: 'STUDIO' as const,
    password: 'MoriWedding2026!',
  },
  {
    email: 'customer@mori.local',
    displayName: 'Khách hàng thử nghiệm',
    role: 'CUSTOMER' as const,
    password: 'MoriWedding2026!',
  },
]

export async function seedAccounts(): Promise<void> {
  const prisma = getPrismaClient()
  for (const acc of DEV_ACCOUNTS) {
    const normalizedEmail = normalizeEmail(acc.email)
    const passwordHash = await hashPassword(acc.password)
    const user = await prisma.user.upsert({
      where: { normalizedEmail },
      update: {
        displayName: acc.displayName,
        role: acc.role,
        status: 'ACTIVE',
        verifiedAt: new Date(),
      },
      create: {
        normalizedEmail,
        displayName: acc.displayName,
        role: acc.role,
        status: 'ACTIVE',
        verifiedAt: new Date(),
        invitationQuota: 10,
      },
    })
    await prisma.credential.upsert({
      where: { userId: user.id },
      update: { passwordHash, passwordChangedAt: new Date() },
      create: { userId: user.id, passwordHash },
    })
  }
}

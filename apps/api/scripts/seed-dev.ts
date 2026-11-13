import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { seedAccounts } from './seed-accounts.js'
import { seedCatalogue } from './seed-catalogue.js'

const envPath = resolve(import.meta.dirname, '../../../.env')
if (existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath)
  } catch {}
}

async function main(): Promise<void> {
  console.log('[seed] Seeding development database...')
  const prisma = getPrismaClient()
  await prisma.$queryRaw`SELECT 1`

  await seedAccounts()
  console.log('[seed] ✓ Seeded development accounts (admin, studio, customer)')

  await seedCatalogue()
  console.log('[seed] ✓ Seeded 55 catalogue products (50 paper + 5 digital) with published price book')

  await disconnectPrismaClient()
  console.log('[seed] ✓ Development seed complete.')
}

main().catch((err) => {
  console.error('[seed] Seed failed:', err)
  process.exit(1)
})

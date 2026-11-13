import { disconnectPrismaClient } from '@mori/database'
import { syncCatalogue } from './catalogue-sync.js'

/** CLI entrypoint compiled into dist/ for one-shot production catalogue synchronization. */
async function main(): Promise<void> {
  const { productCount } = await syncCatalogue()
  console.log(`[catalogue-sync] Synced ${productCount} catalogue products (50 paper + 5 digital).`)
}

main()
  .catch((err) => {
    console.error('[catalogue-sync] Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectPrismaClient().catch(() => {})
  })

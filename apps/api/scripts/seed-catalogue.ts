import { syncCatalogue } from '../src/modules/catalogue/catalogue-sync.js'

export async function seedCatalogue(): Promise<void> {
  await syncCatalogue()
}

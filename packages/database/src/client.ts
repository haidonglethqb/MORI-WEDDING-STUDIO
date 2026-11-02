/**
 * Prisma client factory using @prisma/adapter-pg (Prisma 7, driver adapters GA).
 *
 * Returns a singleton PrismaClient for the current process.
 * Server-only: this module must never be imported by apps/web.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { resolveDatabaseUrl } from './resolve-url.js'

const { Pool } = pg

let _client: PrismaClient | null = null

export interface PrismaClientOptions {
  connectionString: string
  poolMax?: number
}

export function createPrismaClient(opts: PrismaClientOptions): PrismaClient {
  const pool = new Pool({
    connectionString: opts.connectionString,
    max: opts.poolMax ?? 10,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

/**
 * Singleton accessor. Resolves DATABASE_URL or DATABASE_URL_FILE.
 * Throws if neither is set.
 */
export function getPrismaClient(): PrismaClient {
  if (_client) return _client

  const connectionString = resolveDatabaseUrl()

  _client = createPrismaClient({ connectionString })
  return _client
}

/**
 * Gracefully disconnect the singleton client.
 */
export async function disconnectPrismaClient(): Promise<void> {
  if (_client) {
    await _client.$disconnect()
    _client = null
  }
}

/**
 * Database URL resolver implementing the `*_FILE` secret convention.
 *
 * Priority (highest → lowest):
 *   1. DATABASE_URL_FILE — read file contents (Docker secret / mounted file)
 *   2. DATABASE_URL      — use value directly
 *   3. neither set       — throw with clear diagnostic message
 *
 * Extracted as a standalone module so it can be imported by both
 * `prisma.config.ts` (loaded by Prisma CLI) and unit tests.
 */
import { readFileSync } from 'node:fs'

export function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const filePath = env['DATABASE_URL_FILE']
  if (filePath) {
    try {
      return readFileSync(filePath, 'utf-8').trim()
    } catch (err) {
      throw new Error(
        `Failed to read DATABASE_URL from file (DATABASE_URL_FILE=${filePath}): ${String(err)}`,
      )
    }
  }

  const url = env['DATABASE_URL']
  if (url) return url

  throw new Error(
    'Database URL not configured: set DATABASE_URL (connection string) or ' +
      'DATABASE_URL_FILE (path to a file containing the connection string)',
  )
}

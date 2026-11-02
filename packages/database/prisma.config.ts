/**
 * Prisma 7 project configuration.
 *
 * In Prisma 7, `url` is no longer supported in schema datasource blocks.
 * Connection configuration (URL for migrations, adapter for runtime) lives here.
 *
 * DATABASE_URL_FILE / DATABASE_URL resolution
 * ─────────────────────────────────────────────
 * Priority (highest → lowest):
 *   1. DATABASE_URL_FILE  — read file contents (Docker secret / mounted file)
 *   2. DATABASE_URL       — use value directly
 *   3. Neither set        — throw with a clear diagnostic (no silent localhost fallback)
 *
 * migrations.path
 * ─────────────────────────────────────────────
 * With a multi-file schema (schema directory), Prisma 7 defaults to placing
 * migrations next to the datasource .prisma file — which would be inside
 * prisma/schema/. We keep migrations canonical at prisma/migrations/ (sibling
 * to the schema/ directory) and point Prisma there explicitly.
 *
 * Path resolution: all paths in defineConfig are resolved relative to THIS
 * file's location (prisma.config.ts), so we use import.meta.dirname for clarity.
 *
 * See: https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference
 */
import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { resolveDatabaseUrl } from './src/resolve-url.js'

const dir = import.meta.dirname

export default defineConfig({
  schema: path.join(dir, 'prisma/schema'),
  migrations: {
    path: path.join(dir, 'prisma/migrations'),
  },
  datasource: {
    url: resolveDatabaseUrl(),
  },
})

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(import.meta.dirname, '../.env')
if (existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath)
  } catch {}
}

const dbUrl = process.env['DATABASE_URL']
if (!dbUrl) {
  process.stderr.write('Integration tests require DATABASE_URL (or .env file).\n')
  process.exit(1)
}

process.stdout.write('[test:integration] Running PostgreSQL integration test suites...\n')

const result = spawnSync(
  'corepack',
  ['pnpm', '--filter', '@mori/api', 'exec', 'vitest', 'run', '--passWithNoTests'],
  {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
  },
)

if (result.status !== 0) {
  process.stderr.write('[test:integration] ✗ Integration test suite failed.\n')
  process.exit(result.status ?? 1)
}

process.stdout.write('[test:integration] ✓ All PostgreSQL integration test suites passed.\n')

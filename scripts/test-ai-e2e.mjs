import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const rootDir = resolve(import.meta.dirname, '..')
const apiDir = resolve(rootDir, 'apps/api')
const configPath = resolve(rootDir, 'tests/ai-e2e/vitest.config.ts')

process.stdout.write('[test:ai-e2e] Running MORI AI v2 E2E evaluation suite...\n')

const proc = spawn('corepack', ['pnpm', 'exec', 'vitest', 'run', '-c', configPath], {
  cwd: apiDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, VITE_CONFIG_NATIVE_IGNORE_WARNING: 'true' },
})

proc.on('close', (code) => {
  if (code === 0) {
    process.stdout.write('[test:ai-e2e] ✓ All AI E2E evaluation tests passed.\n')
    process.exit(0)
  } else {
    process.stderr.write(`[test:ai-e2e] ✗ AI E2E suite failed with code ${code}\n`)
    process.exit(code ?? 1)
  }
})

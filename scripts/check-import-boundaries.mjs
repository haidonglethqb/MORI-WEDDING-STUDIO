import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname

function cruise(args) {
  return spawnSync('corepack', ['pnpm', 'exec', 'depcruise', ...args], {
    cwd: root,
    encoding: 'utf8',
  })
}

const allowed = cruise([
  '--config',
  '.dependency-cruiser.cjs',
  'apps/web/src',
  'packages/contracts/src',
  'packages/domain/src',
])

if (allowed.status !== 0) {
  if (allowed.stdout) process.stderr.write(allowed.stdout)
  if (allowed.stderr) process.stderr.write(allowed.stderr)
  process.exit(allowed.status ?? 1)
}

const badFile = join(root, 'apps/web/src/boundary-fixture.ts')
mkdirSync(join(root, 'apps/web/src'), { recursive: true })
writeFileSync(
  badFile,
  "import '../../../packages/database/src/index.ts'\n",
)

const forbidden = cruise(['--config', '.dependency-cruiser.cjs', badFile])
rmSync(badFile)

if (forbidden.status === 0) {
  process.stderr.write('Expected the database import from web to be rejected.\n')
  process.exit(1)
}

process.stdout.write('Import boundaries hold, and a web database import is rejected.\n')

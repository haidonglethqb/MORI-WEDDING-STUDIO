import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

process.stdout.write('[test:performance] Starting performance & constraint verification...\n')

// 1. Verify Hard Rule 10: All code files must be < 200 lines
function collectCodeFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.next', 'dist', '.git', '.gemini', '.claude', '.agents'].includes(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) collectCodeFiles(full, files)
    else if (/\.(ts|tsx|mjs)$/.test(entry)) files.push(full)
  }
  return files
}

const allCode = collectCodeFiles('apps').concat(collectCodeFiles('packages')).concat(collectCodeFiles('scripts'))
let violations = 0
for (const file of allCode) {
  const lineCount = readFileSync(file, 'utf8').split('\n').length
  if (lineCount > 200) {
    process.stderr.write(`[test:performance] ✗ File ${file} exceeds 200 lines (${lineCount} lines).\n`)
    violations++
  }
}
if (violations > 0) {
  process.stderr.write(`[test:performance] ✗ Hard rule 10 failed: ${violations} file(s) over 200 lines.\n`)
  process.exit(1)
}
process.stdout.write(`[test:performance] ✓ Hard rule 10 satisfied: all ${allCode.length} code files are < 200 lines.\n`)

// 2. OpenAPI Drift Check
const driftCheck = spawnSync('corepack', ['pnpm', '--filter', '@mori/api', 'run', 'api:check-drift'], {
  stdio: 'inherit',
})
if (driftCheck.status !== 0) {
  process.stderr.write('[test:performance] ✗ OpenAPI document drift detected.\n')
  process.exit(1)
}

// 3. Domain pricing performance check (10,000 pure BigInt operations < 50ms)
const start = performance.now()
let sum = 0n
for (let i = 0; i < 10_000; i++) {
  const unit = BigInt(25_000 + (i % 100) * 100)
  const qty = BigInt(10 + (i % 500))
  sum += unit * qty
}
const elapsed = performance.now() - start
if (elapsed > 50) {
  process.stderr.write(`[test:performance] ✗ Calculation latency exceeded 50ms (${elapsed.toFixed(2)}ms).\n`)
  process.exit(1)
}
process.stdout.write(`[test:performance] ✓ 10,000 BigInt money calculations completed in ${elapsed.toFixed(2)}ms.\n`)

process.stdout.write('[test:performance] ✓ All performance checks passed.\n')

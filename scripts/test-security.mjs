import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

process.stdout.write('[test:security] Starting security verification suite...\n')

// 1. Check import boundaries (ADR-02: Next.js never touches database)
const boundaryCheck = spawnSync('node', ['scripts/check-import-boundaries.mjs'], { stdio: 'inherit' })
if (boundaryCheck.status !== 0) {
  process.stderr.write('[test:security] ✗ Import boundary violation detected.\n')
  process.exit(1)
}
process.stdout.write('[test:security] ✓ Import boundaries verified (ADR-02).\n')

// 2. Scan for forbidden payment SDKs and entities (INV-13 / HR-1)
const FORBIDDEN_PAYMENT_PATTERNS = [
  /from\s+['"][^'"]*(?:stripe|vietqr|sepay|paypal)[^'"]*['"]/i,
  /require\(['"][^'"]*(?:stripe|vietqr|sepay|paypal)[^'"]*['"]\)/i,
  /\bmodel\s+Payment\b/i,
  /\bmodel\s+Deposit\b/i,
  /\benum\s+PaymentStatus\b/i,
]

function collectFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.next', 'dist', '.git', '.gemini', '.claude', '.agents'].includes(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) collectFiles(full, files)
    else if (/\.(ts|tsx|prisma)$/.test(entry)) files.push(full)
  }
  return files
}

const sourceFiles = collectFiles('apps').concat(collectFiles('packages'))
for (const file of sourceFiles) {
  const content = readFileSync(file, 'utf8')
  for (const pattern of FORBIDDEN_PAYMENT_PATTERNS) {
    if (pattern.test(content)) {
      process.stderr.write(`[test:security] ✗ Forbidden payment pattern ${pattern} found in ${file}\n`)
      process.exit(1)
    }
  }
}
process.stdout.write('[test:security] ✓ No payment entities or SDKs detected (INV-13, HR-1).\n')

// 3. Verify Cache-Control: private, no-store for guest routes
const GUEST_CONTROLLER = 'apps/api/src/modules/invitations/public-invitation.controller.ts'
const guestCtrlContent = readFileSync(GUEST_CONTROLLER, 'utf8')
if (!guestCtrlContent.includes("'private, no-store'")) {
  process.stderr.write('[test:security] ✗ Public invitation controller lacks private, no-store cache control.\n')
  process.exit(1)
}
process.stdout.write('[test:security] ✓ Private no-store cache headers confirmed (HR-7).\n')

process.stdout.write('[test:security] ✓ All security gates passed.\n')

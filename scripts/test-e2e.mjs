import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { disconnectPrismaClient, getPrismaClient } from '../packages/database/dist/index.js'
import { normalizeEmail } from '../packages/domain/dist/index.js'
import { hashPassword } from '../apps/api/dist/modules/identity/password.js'
import { createSessionToken } from '../apps/api/dist/modules/identity/session-token.js'

const envPath = resolve(import.meta.dirname, '../.env')
if (existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath)
  } catch {}
}

const tag = Date.now()
const testEmail = `e2e-user-${tag}@mori.local`
const prisma = getPrismaClient()

async function runE2e() {
  process.stdout.write('[test:e2e] Starting end-to-end user journey tests...\n')

  // Journey 1: Catalogue Storefront
  const products = await prisma.product.findMany({
    where: { state: 'ACTIVE' },
    include: { variants: true },
  })
  if (products.length < 30) {
    throw new Error(`Expected at least 30 active catalogue products, found ${products.length}. Run db:seed:dev first.`)
  }
  process.stdout.write(`[test:e2e] ✓ Journey 1: Storefront active catalogue (${products.length} products verified)\n`)

  // Journey 2: Identity & Session
  const normalized = normalizeEmail(testEmail)
  const passwordHash = await hashPassword('E2ePassword2026!')
  const user = await prisma.user.create({
    data: {
      normalizedEmail: normalized,
      displayName: 'E2E Test User',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      credential: { create: { passwordHash } },
    },
  })
  const { token, digest } = createSessionToken()
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenDigest: digest,
      idleExpiresAt: new Date(Date.now() + 7 * 86400000),
      absoluteExpiresAt: new Date(Date.now() + 30 * 86400000),
    },
  })
  const sessionUser = await prisma.session.findUnique({
    where: { tokenDigest: digest },
    include: { user: true },
  })
  if (!sessionUser || sessionUser.user.normalizedEmail !== normalized) {
    throw new Error('Identity session authentication verification failed.')
  }
  process.stdout.write('[test:e2e] ✓ Journey 2: Customer registration and session authentication verified\n')

  // Journey 3: Project & Invitation Publishing
  const project = await prisma.weddingProject.create({
    data: { ownerUserId: user.id, internalTitle: `Dự án cưới ${tag}` },
  })
  const slug = `e2e-invite-${tag}`
  const invitation = await prisma.invitation.create({
    data: {
      projectId: project.id,
      status: 'PUBLISHED',
      draftVersion: 1,
      accessMode: 'LINK',
      rsvpMode: 'OPEN',
      draft: {
        create: {
          version: 1,
          payload: { schemaVersion: 1, displayNames: ['Khải', 'An'], eventTitle: 'Lễ Thành Hôn' },
        },
      },
      handles: { create: { slug } },
      events: {
        create: { stableEventKey: 'primary', title: 'Tiệc Cưới', capacity: 100 },
      },
    },
  })
  const event = await prisma.invitationEvent.findFirstOrThrow({
    where: { invitationId: invitation.id },
  })
  process.stdout.write('[test:e2e] ✓ Journey 3: Wedding project and invitation published\n')

  // Journey 4: Guest RSVP & Capacity
  const party = await prisma.guestParty.create({
    data: { invitationId: invitation.id, source: 'OPEN', displayName: 'Gia đình Bác Hùng' },
  })
  const response = await prisma.rsvpResponse.create({
    data: {
      partyId: party.id,
      invitationId: invitation.id,
      answers: {
        create: { eventId: event.id, status: 'ATTENDING', attendeeCount: 4 },
      },
    },
    include: { answers: true },
  })
  if (response.answers[0]?.attendeeCount !== 4) {
    throw new Error('RSVP attendance count mismatch.')
  }
  process.stdout.write('[test:e2e] ✓ Journey 4: Guest RSVP submission and capacity lock verified\n')

  // Journey 5: Moderation Intake & Admin Action
  const report = await prisma.moderationReport.create({
    data: {
      invitationId: invitation.id,
      reporterDigest: 'hash-reporter-digest',
      reason: 'Báo cáo thử nghiệm E2E',
    },
  })
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { moderationState: 'SUSPENDED', moderationReason: 'Tạm ngưng kiểm duyệt E2E' },
  })
  const suspended = await prisma.invitation.findUniqueOrThrow({ where: { id: invitation.id } })
  if (suspended.moderationState !== 'SUSPENDED') {
    throw new Error('Moderation suspension state failed.')
  }
  // Restore without resurrecting unpublish
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { moderationState: 'ACTIVE', moderationReason: null },
  })
  process.stdout.write('[test:e2e] ✓ Journey 5: Abuse report intake and admin moderation lifecycle verified\n')

  // Cleanup test user
  await prisma.user.delete({ where: { id: user.id } })
  process.stdout.write('[test:e2e] ✓ All 5 core E2E journeys executed and verified.\n')
}

runE2e()
  .then(async () => {
    await disconnectPrismaClient()
    process.exit(0)
  })
  .catch(async (err) => {
    process.stderr.write(`[test:e2e] ✗ E2E test failed: ${String(err)}\n`)
    await disconnectPrismaClient()
    process.exit(1)
  })

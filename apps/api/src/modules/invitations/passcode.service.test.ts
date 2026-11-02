import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'
import { PasscodeService } from './passcode.service.js'

const email = `passcode-${Date.now()}@example.com`
const content = {
  schemaVersion: 1 as const,
  displayNames: ['Mai', 'An'] as [string, string],
  eventTitle: 'Lễ cưới',
}

describe('passcodes', () => {
  const invitations = new InvitationService()
  const passcodes = new PasscodeService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it(
    'hides names until a current passcode grant',
    async () => {
      const prisma = getPrismaClient()
      const owner = await prisma.user.create({
        data: { normalizedEmail: email, displayName: 'Owner' },
      })
      const project = await invitations.createProject(owner.id, 'Protected')
      const created = await invitations.createInvitation(owner.id, project.id)
      const saved = await invitations.saveDraft(owner.id, created.id, { expectedVersion: 0, content })
      await invitations.publish(owner.id, created.id, saved.version)
      const handle = await prisma.invitationHandle.findFirstOrThrow({
        where: { invitationId: created.id },
      })

      await passcodes.setPasscode(owner.id, created.id, 'garden-gate')
      const gated = await invitations.readPublished(handle.slug)
      expect(JSON.stringify(gated)).not.toContain('Mai')

      await expect(passcodes.exchange(handle.slug, 'wrong-gate')).rejects.toBeInstanceOf(
        NotFoundException,
      )
      const token = await passcodes.exchange(handle.slug, 'garden-gate')
      expect((await passcodes.readGranted(handle.slug, token)).displayNames).toEqual(['Mai', 'An'])

      await passcodes.setPasscode(owner.id, created.id, 'new-garden-gate')
      await expect(passcodes.readGranted(handle.slug, token)).rejects.toBeInstanceOf(NotFoundException)
    },
    30_000,
  )
})
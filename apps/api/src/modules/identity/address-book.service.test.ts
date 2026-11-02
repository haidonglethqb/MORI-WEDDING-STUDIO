import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { AddressBookService } from './address-book.service.js'

const ownerEmail = `address-owner-${Date.now()}@example.com`
const otherEmail = `address-other-${Date.now()}@example.com`
const input = {
  recipientName: 'Mai Trần',
  phone: '0900000001',
  addressLines: '12 đường mẫu thử',
  locality: 'Quận 1',
  province: 'Hồ Chí Minh',
  countryCode: 'vn',
}

describe('address book', () => {
  const book = new AddressBookService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('keeps an address private to its owner and archives instead of deleting history', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', status: 'ACTIVE' },
    })
    const created = await book.create(owner.id, input, 'address-1')
    const replay = await book.create(owner.id, input, 'address-1')
    expect(replay.addressId).toBe(created.addressId)
    expect(created.countryCode).toBe('VN')
    expect(created.version).toBe(0)
    expect(await book.list(other.id)).toEqual([])
    await expect(book.update(other.id, created.addressId, 0, input)).rejects.toBeInstanceOf(NotFoundException)
    await expect(book.update(owner.id, created.addressId, 4, { ...input, locality: 'Quận 3' })).rejects.toBeInstanceOf(
      ConflictException,
    )
    const saved = await book.update(owner.id, created.addressId, 0, { ...input, locality: 'Quận 3' })
    expect(saved.version).toBe(1)
    expect(saved.locality).toBe('Quận 3')
    await book.archive(owner.id, created.addressId)
    expect(await book.list(owner.id)).toEqual([])
    const stored = await prisma.address.findUniqueOrThrow({ where: { id: created.addressId } })
    expect(stored.archivedAt).toBeTruthy()
    expect(stored.addressLines).toBe('12 đường mẫu thử')
    expect(JSON.stringify(await book.list(owner.id))).not.toContain(otherEmail)
  })
})

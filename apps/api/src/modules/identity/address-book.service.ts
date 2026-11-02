import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

export interface AddressView {
  addressId: string
  recipientName: string
  phone: string
  addressLines: string
  locality: string
  province: string
  countryCode: string
  version: number
}

export interface AddressInput {
  recipientName: string
  phone: string
  addressLines: string
  locality: string
  province: string
  countryCode: string
}

@Injectable()
export class AddressBookService {
  async list(ownerUserId: string): Promise<AddressView[]> {
    const rows = await getPrismaClient().address.findMany({
      where: { ownerUserId, archivedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toView)
  }

  async create(ownerUserId: string, input: AddressInput, idempotencyKey: string): Promise<AddressView> {
    const fields = parseAddress(input)
    const key = requireKey(idempotencyKey)
    const hash = JSON.stringify(fields)
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      const replay = await tx.idempotencyRecord.findUnique({
        where: { principalId_command_key: { principalId: ownerUserId, command: 'create-address', key } },
      })
      if (replay) {
        if (replay.requestHash !== hash) {
          throw new UnprocessableEntityException('This idempotency key was already used')
        }
        const existing = await tx.address.findFirst({ where: { id: replay.resourceId, ownerUserId } })
        if (existing) return toView(existing)
      }
      const created = await tx.address.create({ data: { ownerUserId, ...fields } })
      await tx.idempotencyRecord.create({
        data: { principalId: ownerUserId, command: 'create-address', key, requestHash: hash, resourceId: created.id },
      })
      return toView(created)
    })
  }

  async update(ownerUserId: string, addressId: string, expectedVersion: number, input: AddressInput): Promise<AddressView> {
    const fields = parseAddress(input)
    const updated = await getPrismaClient().address.updateMany({
      where: { id: addressId, ownerUserId, archivedAt: null, version: expectedVersion },
      data: { ...fields, version: { increment: 1 } },
    })
    if (updated.count !== 1) {
      const row = await getPrismaClient().address.findFirst({ where: { id: addressId, ownerUserId, archivedAt: null } })
      if (!row) throw new NotFoundException()
      throw new ConflictException('This address was updated elsewhere')
    }
    const row = await getPrismaClient().address.findFirstOrThrow({ where: { id: addressId, ownerUserId } })
    return toView(row)
  }

  async archive(ownerUserId: string, addressId: string): Promise<void> {
    const updated = await getPrismaClient().address.updateMany({
      where: { id: addressId, ownerUserId, archivedAt: null },
      data: { archivedAt: new Date() },
    })
    if (updated.count !== 1) throw new NotFoundException()
  }
}

function parseAddress(input: AddressInput): AddressInput {
  const recipientName = input.recipientName.trim()
  const phone = input.phone.trim()
  const addressLines = input.addressLines.trim()
  const locality = input.locality.trim()
  const province = input.province.trim()
  const countryCode = input.countryCode.trim().toUpperCase()
  if (
    recipientName.length < 1 ||
    recipientName.length > 80 ||
    phone.length < 8 ||
    phone.length > 20 ||
    addressLines.length < 1 ||
    addressLines.length > 200 ||
    locality.length < 1 ||
    locality.length > 80 ||
    province.length < 1 ||
    province.length > 80 ||
    !/^[A-Z]{2}$/.test(countryCode)
  ) {
    throw new UnprocessableEntityException('This address needs a name, phone, street, locality, province, and country')
  }
  return { recipientName, phone, addressLines, locality, province, countryCode }
}

function requireKey(value: string): string {
  const key = value.trim()
  if (key.length < 1 || key.length > 80) throw new UnprocessableEntityException('This command needs an idempotency key')
  return key
}

function toView(row: AddressInput & { id: string; version: number }): AddressView {
  return {
    addressId: row.id,
    recipientName: row.recipientName,
    phone: row.phone,
    addressLines: row.addressLines,
    locality: row.locality,
    province: row.province,
    countryCode: row.countryCode,
    version: row.version,
  }
}

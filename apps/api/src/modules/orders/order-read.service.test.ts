import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { PlaceOrderService } from './place-order.service.js'
import { OrderReadService } from './order-read.service.js'

const ownerEmail = `read-owner-${Date.now()}@example.com`
const otherEmail = `read-other-${Date.now()}@example.com`
const staffEmail = `read-staff-${Date.now()}@example.com`
const internalNote = `ivory-private-${Date.now()}`

describe('OrderReadService', () => {
  const orders = new PlaceOrderService()
  const reader = new OrderReadService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('shows an order only to its owner and assigned staff', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Private order' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    await prisma.requestMessage.create({
      data: {
        requestId: request.id,
        authorUserId: owner.id,
        visibility: 'INTERNAL',
        plainText: internalNote,
      },
    })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'read-hash',
        trimWidthMm: 100,
        trimHeightMm: 150,
        profileWidthMm: 100,
        profileHeightMm: 150,
        fontsReady: true,
        isFixture: true,
        approval: { create: { ownerUserId: owner.id, manifestHash: 'read-hash', acknowledgementVersion: 'fixture-ack-1' } },
      },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 900_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'read-hash',
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        isFixture: true,
      },
    })
    const placed = await orders.placeOrder({
      ownerUserId: owner.id,
      requestId: request.id,
      quoteId: quote.id,
      expectedVersion: 0,
      idempotencyKey: 'read-key',
    })

    await expect(reader.read(other.id, placed.orderId)).rejects.toBeInstanceOf(NotFoundException)
    await expect(reader.read(staff.id, placed.orderId)).rejects.toBeInstanceOf(NotFoundException)

    const view = await reader.read(owner.id, placed.orderId)
    expect(view).toEqual({
      orderId: placed.orderId,
      status: 'SUBMITTED',
      currency: 'VND',
      totalAmountVnd: '900000',
      physicalStage: 'PENDING',
      digitalStage: null,
    })
    expect(JSON.stringify(view).includes(internalNote)).toBe(false)
    expect(JSON.stringify(view).includes(ownerEmail)).toBe(false)

    await prisma.staffAssignment.create({
      data: { projectId: project.id, staffUserId: staff.id },
    })
    expect((await reader.read(staff.id, placed.orderId)).orderId).toBe(placed.orderId)

    const shipment = await prisma.shipment.create({ data: { orderId: placed.orderId } })
    await prisma.shipmentEvent.create({
      data: { shipmentId: shipment.id, staffUserId: staff.id, kind: 'EXCEPTION', reason: 'Địa chỉ cần kiểm lại' },
    })
    const detail = await reader.detail(owner.id, placed.orderId)
    expect(detail.shippingAmountVnd).toBe('20000')
    expect(detail.taxAmountVnd).toBe('10000')
    expect(detail.isFixture).toBe(true)
    expect(detail.physicalOnHold).toBe(false)
    expect(detail.shipmentExceptions.map((event) => event.reason)).toEqual(['Địa chỉ cần kiểm lại'])
    expect(JSON.stringify(detail).includes(staff.id)).toBe(false)
    expect(JSON.stringify(detail).includes(internalNote)).toBe(false)
  })
})
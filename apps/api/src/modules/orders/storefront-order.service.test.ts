import { BadRequestException, NotFoundException } from '@nestjs/common'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { IdentityService } from '../identity/identity.service.js'
import { StorefrontOrderController } from './storefront-order.controller.js'
import { StorefrontOrderService } from './storefront-order.service.js'
import { ONLINE_TRACK_STEPS, PAPER_TRACK_STEPS } from './storefront-order.types.js'

describe('StorefrontOrderService & StorefrontOrderController', () => {
  let tempDir: string
  let service: StorefrontOrderService

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'mori-storefront-'))
    process.env['MORI_STOREFRONT_DATA_DIR'] = tempDir
    service = new StorefrontOrderService()
  })

  afterEach(() => {
    delete process.env['MORI_STOREFRONT_DATA_DIR']
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('pre-seeds MORI-0001, MORI-0002, MORI-0003 and persists them', () => {
    const orders = service.listOrders()
    expect(orders.map((o) => o.code)).toEqual(['MORI-0001', 'MORI-0002', 'MORI-0003'])
    expect(orders[0]?.totalAmountVnd).toBe('2200000')
    expect(orders[0]?.paidAmountVnd).toBe('1100000')
    expect(orders[1]?.totalAmountVnd).toBe('499000')
    expect(orders[1]?.onlineStepIndex).toBe(4)
    expect(orders[2]?.totalAmountVnd).toBe('2449500')
    expect(orders[2]?.paperStepIndex).toBe(2)
    expect(orders[2]?.onlineStepIndex).toBe(3)

    const reloaded = new StorefrontOrderService()
    expect(reloaded.listOrders()).toHaveLength(3)
  })

  it('computes server-side 50% digital combo discount from CATALOGUE_PRODUCTS and creates MORI-0004', () => {
    const order = service.createOrder({
      customerName: 'Lê Thảo',
      customerPhone: '0911222333',
      customerEmail: 'thao@mori.vn',
      address: '10 Lê Lợi',
      city: 'Đà Nẵng',
      note: 'Combo thử nghiệm',
      paymentMethod: 'MOMO',
      simulatePaid: true,
      items: [
        { slug: 'floral-bifold-03', name: 'Hương Bách Thảo', productType: 'PAPER', shape: 'BIFOLD', quantity: 200, unitAmountVnd: '1' },
        { slug: 'floral-digital-01', name: 'Digital Floral Garden', productType: 'DIGITAL', shape: 'FLAT', quantity: 1, unitAmountVnd: '1' },
      ],
    })
    expect(order.code).toBe('MORI-0004')
    expect(order.orderType).toBe('COMBO')
    expect(order.totalAmountVnd).toBe('2449500')
    expect(order.discountAmountVnd).toBe('249500')
    expect(order.paidAmountVnd).toBe('2449500')
    expect(order.paymentStatus).toBe('PAID_DEMO')

    const explicitCombo = service.createOrder({
      customerName: 'Minh Huy',
      customerPhone: '0988777666',
      customerEmail: '',
      address: 'Hà Nội',
      city: 'Hà Nội',
      note: '',
      paymentMethod: 'COD',
      items: [
        {
          slug: 'minimalist-flat-01',
          name: 'Kyoto Zen Stone',
          productType: 'COMBO',
          shape: 'FLAT',
          quantity: 100,
          unitAmountVnd: '6000',
          linkedDigitalSlug: 'minimalist-digital-01',
        },
      ],
    })
    expect(explicitCombo.code).toBe('MORI-0005')
    expect(explicitCombo.totalAmountVnd).toBe('799500') // 100*6000 + 399000/2
    expect(explicitCombo.discountAmountVnd).toBe('199500')
    expect(explicitCombo.paymentStatus).toBe('COD_PENDING')
  })

  it('tracks orders with 400/404 validation and returns steps on match', () => {
    expect(() => service.trackOrder('', '0901234567')).toThrow(BadRequestException)
    expect(() => service.trackOrder('MORI-0001', '')).toThrow(BadRequestException)
    expect(() => service.trackOrder('MORI-9999', '0901234567')).toThrow(NotFoundException)
    expect(() => service.trackOrder('MORI-0001', '0999999999')).toThrow(NotFoundException)

    const foundByPhone = service.trackOrder('mori-0001', '0901234567')
    expect(foundByPhone.order.code).toBe('MORI-0001')
    expect(foundByPhone.paperSteps).toEqual(PAPER_TRACK_STEPS)
    expect(foundByPhone.onlineSteps).toEqual(ONLINE_TRACK_STEPS)

    const foundByEmail = service.trackOrder('MORI-0003', 'KHACHHANG@mori.vn')
    expect(foundByEmail.order.code).toBe('MORI-0003')
  })

  it('enforces ADMIN/STUDIO role on staff endpoints and supports custom requests TK-0001', async () => {
    const makeController = (role: 'ADMIN' | 'STUDIO' | 'CUSTOMER') =>
      new StorefrontOrderController(service, {
        currentUser: () => Promise.resolve({ id: 'u1', role, status: 'ACTIVE', email: 'a@mori.vn', displayName: 'Staff' }),
      } as unknown as IdentityService)

    const cookie = '__Host-mori_session=tok'
    await expect(makeController('CUSTOMER').listOrders(cookie)).rejects.toThrow(NotFoundException)
    await expect(makeController('ADMIN').listOrders(undefined)).rejects.toThrow(NotFoundException)

    const studioCtrl = makeController('STUDIO')
    const listed = await studioCtrl.listOrders(cookie)
    expect(listed).toHaveLength(3)

    const updated = await studioCtrl.updateOrder(cookie, 'MORI-0001', {
      paperStepIndex: 5,
      paidAmountVnd: '2200000',
      paymentStatus: 'PAID_DEMO',
    })
    expect(updated.order.paperStepIndex).toBe(5)
    expect(updated.order.remainingAmountVnd).toBe('0')

    const createdReq = studioCtrl.createCustomRequest({
      customerName: 'An & Bình',
      customerPhone: '0909000111',
      customerEmail: 'anbinh@mori.vn',
      coupleNames: 'An & Bình',
      weddingDate: '20/11/2026',
      quantity: 150,
      style: 'floral',
      fontCode: 'SERIF_CLASSIC',
      notes: 'Ép kim vàng nhũ',
    })
    expect(createdReq.ok).toBe(true)
    expect(createdReq.request.id).toBe('TK-0001')

    const patchedReq = await studioCtrl.updateCustomRequest(cookie, 'TK-0001', {
      status: 'CONTACTED',
      adminNote: 'Đã gửi mẫu thiết kế qua email',
    })
    expect(patchedReq.request.status).toBe('CONTACTED')
    expect(patchedReq.request.adminNote).toBe('Đã gửi mẫu thiết kế qua email')
  })
})

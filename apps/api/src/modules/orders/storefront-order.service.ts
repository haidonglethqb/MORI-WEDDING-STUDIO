import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { join } from 'node:path'
import {
  nextSequentialCode,
  parseVnd,
  priceOrderItems,
  readJsonFile,
  writeJsonFile,
} from './storefront-order.helpers.js'
import { buildSeedOrders } from './storefront-order.seed.js'
import {
  ONLINE_TRACK_STEPS,
  PAPER_TRACK_STEPS,
  type CreateCustomRequestInput,
  type CreateStorefrontOrderInput,
  type StorefrontCustomRequest,
  type StorefrontOrder,
  type StorefrontTrackResult,
  type UpdateCustomRequestInput,
  type UpdateStorefrontOrderInput,
} from './storefront-order.types.js'

@Injectable()
export class StorefrontOrderService {
  private readonly ordersPath: string
  private readonly requestsPath: string
  private orders: StorefrontOrder[] = []
  private customRequests: StorefrontCustomRequest[] = []

  constructor() {
    const baseDir = process.env['MORI_STOREFRONT_DATA_DIR'] || join(process.cwd(), '.data')
    this.ordersPath = join(baseDir, 'storefront-orders.json')
    this.requestsPath = join(baseDir, 'storefront-custom-requests.json')
    this.initStorage()
  }

  createOrder(input: CreateStorefrontOrderInput): StorefrontOrder {
    const priced = priceOrderItems(input.items)
    const total = priced.totalAmount
    const isDeposit = input.simulatePaid && input.paymentOption === 'DEPOSIT'
    const paid = input.simulatePaid ? (isDeposit ? total / 2n : total) : 0n
    const paymentStatus = input.simulatePaid
      ? isDeposit
        ? 'DEPOSIT_DEMO'
        : 'PAID_DEMO'
      : input.paymentMethod === 'COD'
        ? 'COD_PENDING'
        : 'PENDING_DEMO'

    const now = new Date().toISOString()
    const order: StorefrontOrder = {
      code: nextSequentialCode('MORI', this.orders.map((o) => o.code)),
      orderType: priced.orderType,
      summary: priced.summary,
      totalQuantity: priced.totalQuantity,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      customerEmail: (input.customerEmail ?? '').trim(),
      address: (input.address ?? '').trim(),
      city: (input.city ?? '').trim(),
      note: (input.note ?? '').trim(),
      ...(input.coupleNames ? { coupleNames: input.coupleNames.trim() } : {}),
      ...(input.weddingDate ? { weddingDate: input.weddingDate.trim() } : {}),
      ...(input.fontCode ? { fontCode: input.fontCode.trim() } : {}),
      paymentMethod: input.paymentMethod,
      paymentStatus,
      totalAmountVnd: total.toString(),
      discountAmountVnd: priced.discountAmount.toString(),
      paidAmountVnd: paid.toString(),
      remainingAmountVnd: (total > paid ? total - paid : 0n).toString(),
      paperStepIndex: priced.orderType === 'PAPER' || priced.orderType === 'COMBO' ? 0 : null,
      onlineStepIndex: priced.orderType === 'DIGITAL' || priced.orderType === 'COMBO' ? 0 : null,
      items: priced.items,
      createdAt: now,
      updatedAt: now,
    }

    this.orders.unshift(order)
    writeJsonFile(this.ordersPath, this.orders)
    return order
  }

  trackOrder(code?: string, contact?: string): StorefrontTrackResult {
    const cleanCode = (code ?? '').trim().toUpperCase()
    const cleanContact = (contact ?? '').trim()
    if (!cleanCode || !cleanContact) {
      throw new BadRequestException('Bạn vui lòng nhập đầy đủ mã đơn hàng và thông tin liên hệ nhé!')
    }

    const normPhone = cleanContact.replace(/\s+/g, '')
    const normEmail = cleanContact.toLowerCase()
    const order = this.orders.find((o) => {
      if (o.code.toUpperCase() !== cleanCode) return false
      const phoneMatch = o.customerPhone.replace(/\s+/g, '') === normPhone
      const emailMatch = Boolean(o.customerEmail) && o.customerEmail.trim().toLowerCase() === normEmail
      return phoneMatch || emailMatch
    })

    if (!order) {
      throw new NotFoundException(
        'MORI chưa tìm thấy đơn hàng phù hợp. Bạn kiểm tra lại thông tin hoặc liên hệ nhân viên để được hỗ trợ nha.',
      )
    }
    return { order, paperSteps: PAPER_TRACK_STEPS, onlineSteps: ONLINE_TRACK_STEPS }
  }

  listOrders(): StorefrontOrder[] {
    return [...this.orders]
  }

  updateOrder(code: string, updates: UpdateStorefrontOrderInput): StorefrontOrder {
    const cleanCode = code.trim().toUpperCase()
    const order = this.orders.find((o) => o.code.toUpperCase() === cleanCode)
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng')

    if (updates.paperStepIndex !== undefined) order.paperStepIndex = updates.paperStepIndex
    if (updates.onlineStepIndex !== undefined) order.onlineStepIndex = updates.onlineStepIndex
    if (updates.paymentStatus !== undefined) order.paymentStatus = updates.paymentStatus.trim()

    if (updates.paidAmountVnd !== undefined) {
      const total = BigInt(order.totalAmountVnd)
      const paid = parseVnd(updates.paidAmountVnd)
      const boundedPaid = paid > total ? total : paid
      order.paidAmountVnd = boundedPaid.toString()
      order.remainingAmountVnd = (total - boundedPaid).toString()
    }

    order.updatedAt = new Date().toISOString()
    writeJsonFile(this.ordersPath, this.orders)
    return order
  }

  createCustomRequest(input: CreateCustomRequestInput): StorefrontCustomRequest {
    const now = new Date().toISOString()
    const req: StorefrontCustomRequest = {
      id: nextSequentialCode('TK', this.customRequests.map((r) => r.id)),
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      customerEmail: (input.customerEmail ?? '').trim(),
      coupleNames: (input.coupleNames ?? '').trim(),
      weddingDate: (input.weddingDate ?? '').trim(),
      quantity: input.quantity ?? '',
      style: (input.style ?? '').trim(),
      fontCode: (input.fontCode ?? '').trim(),
      notes: (input.notes ?? '').trim(),
      status: 'NEW',
      adminNote: '',
      createdAt: now,
      updatedAt: now,
    }

    this.customRequests.unshift(req)
    writeJsonFile(this.requestsPath, this.customRequests)
    return req
  }

  listCustomRequests(): StorefrontCustomRequest[] {
    return [...this.customRequests]
  }

  updateCustomRequest(id: string, updates: UpdateCustomRequestInput): StorefrontCustomRequest {
    const cleanId = id.trim().toUpperCase()
    const req = this.customRequests.find((r) => r.id.toUpperCase() === cleanId)
    if (!req) throw new NotFoundException('Không tìm thấy yêu cầu thiết kế riêng')

    if (updates.status !== undefined) req.status = updates.status
    if (updates.adminNote !== undefined) req.adminNote = updates.adminNote.trim()
    req.updatedAt = new Date().toISOString()

    writeJsonFile(this.requestsPath, this.customRequests)
    return req
  }

  private initStorage(): void {
    const loadedOrders = readJsonFile<StorefrontOrder>(this.ordersPath)
    if (loadedOrders) {
      this.orders = loadedOrders
    } else {
      this.orders = buildSeedOrders()
      writeJsonFile(this.ordersPath, this.orders)
    }

    const loadedRequests = readJsonFile<StorefrontCustomRequest>(this.requestsPath)
    if (loadedRequests) {
      this.customRequests = loadedRequests
    } else {
      this.customRequests = []
      writeJsonFile(this.requestsPath, this.customRequests)
    }
  }
}

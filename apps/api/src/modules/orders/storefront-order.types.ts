import {
  ONLINE_TRACK_STEPS,
  PAPER_TRACK_STEPS,
  type CreateCustomRequestInput,
  type CreateStorefrontOrderInput,
  type CustomRequestStatus,
  type StorefrontOrderItemInput,
  type StorefrontPaymentMethod,
  type UpdateCustomRequestInput,
  type UpdateStorefrontOrderInput,
} from '@mori/contracts'

export { ONLINE_TRACK_STEPS, PAPER_TRACK_STEPS }
export type {
  CreateCustomRequestInput,
  CreateStorefrontOrderInput,
  CustomRequestStatus,
  StorefrontOrderItemInput,
  StorefrontPaymentMethod,
  UpdateCustomRequestInput,
  UpdateStorefrontOrderInput,
}

export interface StorefrontOrderItem {
  slug: string
  name: string
  productType: 'PAPER' | 'DIGITAL' | 'COMBO'
  shape?: 'FLAT' | 'BIFOLD'
  quantity: number
  unitAmountVnd: string
  linkedDigitalSlug?: string
  linkedDigitalName?: string
  linkedDigitalUnitVnd?: string
  discountAmountVnd: string
  lineTotalVnd: string
}

export interface StorefrontOrder {
  code: string
  orderType: 'PAPER' | 'DIGITAL' | 'COMBO'
  summary: string
  totalQuantity: number
  customerName: string
  customerPhone: string
  customerEmail: string
  address: string
  city: string
  note: string
  coupleNames?: string
  weddingDate?: string
  fontCode?: string
  paymentMethod: StorefrontPaymentMethod
  paymentStatus: string
  totalAmountVnd: string
  discountAmountVnd: string
  paidAmountVnd: string
  remainingAmountVnd: string
  paperStepIndex: number | null
  onlineStepIndex: number | null
  items: StorefrontOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface StorefrontCustomRequest {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  coupleNames: string
  weddingDate: string
  quantity: string | number
  style: string
  fontCode: string
  notes: string
  status: CustomRequestStatus
  adminNote: string
  createdAt: string
  updatedAt: string
}

export interface StorefrontTrackResult {
  order: StorefrontOrder
  paperSteps: readonly string[]
  onlineSteps: readonly string[]
}

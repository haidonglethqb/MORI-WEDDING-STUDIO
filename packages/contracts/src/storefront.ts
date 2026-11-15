import { z } from 'zod'

export const PAPER_TRACK_STEPS = [
  'Đã tiếp nhận',
  'Đã xác nhận',
  'Đang thiết kế',
  'Chờ khách duyệt mẫu',
  'Đã duyệt',
  'Đang in ấn',
  'Đang giao hàng',
  'Hoàn thành',
] as const

export const ONLINE_TRACK_STEPS = [
  'Đã tiếp nhận',
  'Đã xác nhận',
  'Đang thiết kế',
  'Chờ khách duyệt',
  'Hoàn thiện website thiệp',
  'Bàn giao link',
  'Hoàn thành',
] as const

export const StorefrontPaymentMethodSchema = z.enum(['MOMO', 'VNPAY', 'BANK_QR', 'COD'])
export type StorefrontPaymentMethod = z.infer<typeof StorefrontPaymentMethodSchema>

export const StorefrontOrderItemInputSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  productType: z.enum(['PAPER', 'DIGITAL', 'COMBO']),
  shape: z.enum(['FLAT', 'BIFOLD']).optional(),
  quantity: z.coerce.number().int().min(1).max(10000),
  unitAmountVnd: z.union([z.string(), z.number()]).optional().default('0'),
  linkedDigitalSlug: z.string().trim().optional(),
  linkedDigitalName: z.string().trim().optional(),
  linkedDigitalUnitVnd: z.union([z.string(), z.number()]).optional(),
})
export type StorefrontOrderItemInput = z.infer<typeof StorefrontOrderItemInputSchema>

export const CreateStorefrontOrderSchema = z.object({
  customerName: z.string().trim().min(1, 'Vui lòng nhập họ tên'),
  customerPhone: z.string().trim().min(1, 'Vui lòng nhập số điện thoại'),
  customerEmail: z.string().trim().optional().default(''),
  address: z.string().trim().optional().default(''),
  city: z.string().trim().optional().default(''),
  note: z.string().trim().optional().default(''),
  paymentMethod: StorefrontPaymentMethodSchema,
  items: z.array(StorefrontOrderItemInputSchema).min(1, 'Đơn hàng cần ít nhất 1 sản phẩm'),
  coupleNames: z.string().trim().optional(),
  weddingDate: z.string().trim().optional(),
  fontCode: z.string().trim().optional(),
  simulatePaid: z.boolean().optional(),
  paymentOption: z.enum(['FULL', 'DEPOSIT']).optional(),
})
export type CreateStorefrontOrderInput = z.infer<typeof CreateStorefrontOrderSchema>

export const UpdateStorefrontOrderSchema = z.object({
  paperStepIndex: z.number().int().min(0).max(PAPER_TRACK_STEPS.length - 1).nullable().optional(),
  onlineStepIndex: z.number().int().min(0).max(ONLINE_TRACK_STEPS.length - 1).nullable().optional(),
  paidAmountVnd: z.union([z.string().regex(/^\d+$/), z.number().int().nonnegative()]).optional(),
  paymentStatus: z.string().trim().min(1).max(40).optional(),
})
export type UpdateStorefrontOrderInput = z.infer<typeof UpdateStorefrontOrderSchema>

export const CreateCustomRequestSchema = z.object({
  customerName: z.string().trim().min(1, 'Vui lòng nhập họ tên'),
  customerPhone: z.string().trim().min(1, 'Vui lòng nhập số điện thoại'),
  customerEmail: z.string().trim().optional().default(''),
  coupleNames: z.string().trim().optional().default(''),
  weddingDate: z.string().trim().optional().default(''),
  quantity: z.union([z.number().int().min(1), z.string().trim()]).optional().default(''),
  style: z.string().trim().optional().default(''),
  fontCode: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default(''),
})
export type CreateCustomRequestInput = z.infer<typeof CreateCustomRequestSchema>

export const CustomRequestStatusSchema = z.enum(['NEW', 'CONTACTED', 'DONE'])
export type CustomRequestStatus = z.infer<typeof CustomRequestStatusSchema>

export const UpdateCustomRequestSchema = z.object({
  status: CustomRequestStatusSchema.optional(),
  adminNote: z.string().trim().max(2000).optional(),
})
export type UpdateCustomRequestInput = z.infer<typeof UpdateCustomRequestSchema>

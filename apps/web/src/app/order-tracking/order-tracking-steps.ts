export type TrackingIconName =
  | 'inbox'
  | 'check'
  | 'pen'
  | 'eye'
  | 'stamp'
  | 'printer'
  | 'truck'
  | 'sparkles'
  | 'globe'
  | 'link'

export interface TrackStepDef {
  key: string
  label: string
  icon: TrackingIconName
  aliases: string[]
}

export const PAPER_TRACK_STEPS: TrackStepDef[] = [
  { key: 'RECEIVED', label: 'Đã tiếp nhận', icon: 'inbox', aliases: ['RECEIVED', 'SUBMITTED', 'NEW'] },
  { key: 'CONFIRMED', label: 'Đã xác nhận', icon: 'check', aliases: ['CONFIRMED'] },
  { key: 'DESIGNING', label: 'Đang thiết kế', icon: 'pen', aliases: ['DESIGNING', 'IN_DESIGN'] },
  {
    key: 'AWAITING_APPROVAL',
    label: 'Chờ khách duyệt mẫu',
    icon: 'eye',
    aliases: ['AWAITING_APPROVAL', 'WAIT_APPROVAL', 'PROOF_SENT', 'WAITING_CUSTOMER_APPROVAL'],
  },
  { key: 'APPROVED', label: 'Đã duyệt', icon: 'stamp', aliases: ['APPROVED', 'DESIGN_APPROVED'] },
  { key: 'PRINTING', label: 'Đang in ấn', icon: 'printer', aliases: ['PRINTING', 'IN_PRODUCTION', 'IN_PRINT'] },
  { key: 'SHIPPING', label: 'Đang giao hàng', icon: 'truck', aliases: ['SHIPPING', 'SHIPPED', 'DELIVERING'] },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: 'sparkles', aliases: ['COMPLETED', 'DONE', 'DELIVERED'] },
]

export const ONLINE_TRACK_STEPS: TrackStepDef[] = [
  { key: 'RECEIVED', label: 'Đã tiếp nhận', icon: 'inbox', aliases: ['RECEIVED', 'SUBMITTED', 'NEW'] },
  { key: 'CONFIRMED', label: 'Đã xác nhận', icon: 'check', aliases: ['CONFIRMED'] },
  { key: 'DESIGNING', label: 'Đang thiết kế', icon: 'pen', aliases: ['DESIGNING', 'IN_DESIGN'] },
  {
    key: 'AWAITING_APPROVAL',
    label: 'Chờ khách duyệt',
    icon: 'eye',
    aliases: ['AWAITING_APPROVAL', 'WAIT_APPROVAL', 'PROOF_SENT', 'WAITING_CUSTOMER_APPROVAL'],
  },
  {
    key: 'BUILDING_SITE',
    label: 'Hoàn thiện website thiệp',
    icon: 'globe',
    aliases: ['BUILDING_SITE', 'FINALIZING_WEB', 'IN_PRODUCTION', 'WEB_BUILDING'],
  },
  {
    key: 'LINK_DELIVERED',
    label: 'Bàn giao link',
    icon: 'link',
    aliases: ['LINK_DELIVERED', 'HANDED_OVER', 'DELIVERED_LINK'],
  },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: 'sparkles', aliases: ['COMPLETED', 'DONE'] },
]

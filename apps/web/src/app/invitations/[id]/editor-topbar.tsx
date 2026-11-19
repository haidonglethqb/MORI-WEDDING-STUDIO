'use client'

import type {
  BespokeDesignBlueprint,
  InvitationFamilies,
  InvitationDemoPaymentDetails,
  InvitationPhotos,
  InvitationScheduleItem,
  InvitationTemplateConfig,
  InvitationTemplateId,
} from '@mori/contracts'

export interface EditorDraft {
  invitationId: string
  version: number
  slug: string
  displayNames: [string, string]
  eventTitle: string
  greeting: string
  published: boolean
  demoPayment: InvitationDemoPaymentDetails | null
  rsvpMode: 'OFF' | 'OPEN' | 'GUEST_LIST'
  moderationState?: 'ACTIVE' | 'SUSPENDED'
  moderationReason?: string | null
  eventLocalStart?: string
  timeZone?: string
  templateId?: InvitationTemplateId
  coupleRoles?: [string, string]
  families?: InvitationFamilies
  lunarDate?: string
  venueName?: string
  venueAddress?: string
  mapUrl?: string
  scheduleItems?: InvitationScheduleItem[]
  photos?: InvitationPhotos
  templateConfig?: InvitationTemplateConfig
  customDesign?: BespokeDesignBlueprint
}

interface TopBarProps {
  isDirty: boolean
  status: string
  busy: boolean
  published: boolean
  paymentRequired: boolean
  slug: string
  copied: boolean
  onSave: () => void
  onPublish: () => void
  onCopyLink: () => void
}

export function EditorTopBar({
  isDirty, status, busy, published, paymentRequired, slug, copied, onSave, onPublish, onCopyLink,
}: TopBarProps) {
  return (
    <div className="editor-sticky-topbar">
      <div>
        <h2 className="editor-card-title">Thiết kế &amp; Tùy chỉnh Thiệp Online</h2>
        <div className="editor-meta-row">
          <span className={`editor-dirty-pill ${isDirty ? 'is-dirty' : ''}`}>
            {isDirty ? '● Có thay đổi chưa lưu' : `✓ ${status}`}
          </span>
        </div>
      </div>

      <div className="editor-top-actions">
        <button type="button" className="editor-btn-primary" disabled={busy} onClick={onSave}>
          {busy ? 'Đang xử lý...' : 'Lưu bản nháp'}
        </button>
        <button type="button" className="editor-btn-accent" disabled={busy} onClick={onPublish}>
          {paymentRequired ? 'Thanh toán demo để lấy link' : published ? 'Cập nhật bản trực tuyến ✦' : 'Xuất bản trực tuyến ✦'}
        </button>
        {published && slug ? (
          <button type="button" className="editor-btn-secondary" onClick={onCopyLink}>
            {copied ? 'Đã sao chép ✓' : 'Sao chép link'}
          </button>
        ) : null}
        {published && slug ? (
          <a href={`/i/${slug}`} target="_blank" rel="noreferrer" className="editor-btn-secondary">
            Mở thiệp ↗
          </a>
        ) : null}
      </div>
    </div>
  )
}

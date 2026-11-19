'use client'

import { useState } from 'react'
import type {
  InvitationFamilies,
  InvitationPhotos,
  InvitationScheduleItem,
  InvitationTemplateConfig,
  InvitationTemplateId,
} from '@mori/contracts'
import { buildInitialInvitationModel } from '../../../features/digital-templates/digital-template-presets'
import { DigitalTemplateRenderer } from '../../../features/digital-templates/digital-template-renderer'
import type { DigitalInvitationModel } from '../../../features/digital-templates/digital-template-types'
import { TemplateCustomizerPanel } from '../../../features/digital-templates/template-customizer-panel'
import { toInvitationContentPayload } from '../../../features/digital-templates/template-view-utils'
import { ReopenRsvp } from './reopen-rsvp'
import { RetireEvent } from './retire-event'
import { RevokeGuests } from './revoke-guests'
import { RotateHandle } from './rotate-handle'
import { SwitchRsvpMode } from './switch-rsvp-mode'

export interface EditorDraft {
  invitationId: string
  version: number
  slug: string
  displayNames: [string, string]
  eventTitle: string
  greeting: string
  published: boolean
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
}

export function EditorForm({ draft }: { draft: EditorDraft }) {
  const [model, setModel] = useState<DigitalInvitationModel>(() => buildInitialInvitationModel(draft))
  const [version, setVersion] = useState(draft.version)
  const [slug, setSlug] = useState(draft.slug)
  const [published, setPublished] = useState(draft.published)
  const [rsvpMode, setRsvpMode] = useState(draft.rsvpMode)
  const [status, setStatus] = useState(
    draft.published ? 'Trạng thái: Đã xuất bản trực tuyến' : 'Trạng thái: Bản nháp chưa xuất bản',
  )

  async function save() {
    setStatus('Đang lưu bản nháp...')
    const content = toInvitationContentPayload(model)
    const response = await fetch(`/invitations/${draft.invitationId}/save`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ expectedVersion: version, content }),
    })
    if (response.status === 409) {
      setStatus('Bản nháp đã thay đổi ở nơi khác. Vui lòng tải lại trang.')
      return
    }
    if (!response.ok) {
      setStatus('Chưa lưu được thông tin. Vui lòng kiểm tra dữ liệu nhập.')
      return
    }
    const saved = (await response.json()) as EditorDraft
    setVersion(saved.version)
    setPublished(saved.published)
    setStatus(`Đã lưu thành công (Phiên bản ${saved.version})`)
  }

  async function publish() {
    setStatus('Đang xuất bản trực tuyến...')
    const response = await fetch(`/invitations/${draft.invitationId}/publish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ expectedVersion: version }),
    })
    if (response.status === 409) {
      setStatus('Bản nháp đã thay đổi. Vui lòng lưu lại trước khi xuất bản.')
      return
    }
    if (!response.ok) {
      setStatus('Chưa xuất bản được thiệp.')
      return
    }
    const next = (await response.json()) as EditorDraft
    setVersion(next.version)
    setPublished(true)
    setStatus('Đã xuất bản thiệp thành công!')
  }

  return (
    <section className="editor-studio-section">
      <div className="editor-card">
        <div className="editor-card-header">
          <h2 className="editor-card-title">Thiết kế &amp; Tùy chỉnh Thiệp Online</h2>
          <p className="editor-card-desc">
            Chọn mẫu thiết kế, điền thông tin hai họ, tải ảnh cưới và bật/tắt các khối hiển thị theo ý muốn.
          </p>
        </div>

        {draft.moderationState === 'SUSPENDED' ? (
          <div className="editor-suspended-banner">
            Thiệp đang tạm ngưng hiển thị{draft.moderationReason ? `: ${draft.moderationReason}` : ''}. Vui lòng liên hệ bộ phận hỗ trợ MORI Atelier.
          </div>
        ) : null}

        <RotateHandle
          invitationId={draft.invitationId}
          slug={slug}
          version={version}
          onRotated={(next) => {
            setSlug(next.slug)
            setVersion(next.version)
          }}
        />

        <div className="editor-studio-split">
          <div className="editor-studio-controls">
            <TemplateCustomizerPanel model={model} onChange={setModel} />

            <div className="editor-actions-bar">
              <button type="button" className="editor-btn-primary" onClick={() => void save()}>
                Lưu bản nháp ✦
              </button>
              <button type="button" className="editor-btn-secondary" onClick={() => void publish()}>
                Xuất bản trực tuyến
              </button>
              {published ? (
                <a href={`/i/${slug}`} target="_blank" rel="noreferrer" className="editor-btn-secondary">
                  Xem trang khách mời ↗
                </a>
              ) : null}
            </div>
            <div className="editor-status-pill">{status}</div>

            <div className="editor-security-wrap">
              <h3>Cài đặt bảo mật &amp; Quản trị</h3>
              <RevokeGuests invitationId={draft.invitationId} version={version} onRevoked={setVersion} />
              <SwitchRsvpMode
                invitationId={draft.invitationId}
                mode={rsvpMode}
                onSwitched={() => setRsvpMode('GUEST_LIST')}
              />
              <ReopenRsvp invitationId={draft.invitationId} />
              <RetireEvent invitationId={draft.invitationId} />
            </div>
          </div>

          <div className="editor-studio-preview">
            <div className="editor-preview-label">
              <span>Xem trước trực tiếp trên thiệp khách mời</span>
            </div>
            <DigitalTemplateRenderer model={model} compact />
          </div>
        </div>
      </div>
    </section>
  )
}

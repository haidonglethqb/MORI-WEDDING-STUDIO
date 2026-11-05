'use client'

import { useState } from 'react'
import { RevokeGuests } from './revoke-guests'
import { ReopenRsvp } from './reopen-rsvp'
import { RetireEvent } from './retire-event'
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
}

export function EditorForm({ draft }: { draft: EditorDraft }) {
  const [firstName, setFirstName] = useState(draft.displayNames[0])
  const [secondName, setSecondName] = useState(draft.displayNames[1])
  const [eventTitle, setEventTitle] = useState(draft.eventTitle)
  const [greeting, setGreeting] = useState(draft.greeting)
  const [version, setVersion] = useState(draft.version)
  const [slug, setSlug] = useState(draft.slug)
  const [published, setPublished] = useState(draft.published)
  const [rsvpMode, setRsvpMode] = useState(draft.rsvpMode)
  const [status, setStatus] = useState(draft.published ? 'Trạng thái: Đã xuất bản' : 'Trạng thái: Bản nháp chưa lưu')

  async function save() {
    setStatus('Đang lưu bản nháp...')
    const content: {
      schemaVersion: 1
      displayNames: [string, string]
      eventTitle: string
      greeting?: string
    } = {
      schemaVersion: 1,
      displayNames: [firstName.trim(), secondName.trim()],
      eventTitle: eventTitle.trim(),
    }
    if (greeting.trim()) content.greeting = greeting.trim()
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
      setStatus('Chưa lưu được thông tin.')
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
    <section className="editor-card">
      <div className="editor-card-header">
        <h2 className="editor-card-title">Nội dung thiệp cưới</h2>
        <p className="editor-card-desc">Thiết lập họ tên cô dâu chú rể, tên lễ cưới và lời ngỏ trân trọng.</p>
      </div>

      {draft.moderationState === 'SUSPENDED' ? (
        <div style={{ background: '#fdf2f2', border: '1px solid #f8b4b4', padding: '12px 16px', borderRadius: '8px', color: '#9b1c1c', marginBottom: '16px', fontSize: '13px' }}>
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

      <form onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="editor-form-group">
            <label>Họ tên Chú Rể (hoặc Tên 1)</label>
            <input className="editor-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="editor-form-group">
            <label>Họ tên Cô Dâu (hoặc Tên 2)</label>
            <input className="editor-input" value={secondName} onChange={(e) => setSecondName(e.target.value)} />
          </div>
        </div>

        <div className="editor-form-group">
          <label>Tên buổi lễ / Sự kiện</label>
          <input className="editor-input" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
        </div>

        <div className="editor-form-group">
          <label>Lời ngỏ / Thông điệp gửi khách quý</label>
          <textarea className="editor-textarea" value={greeting} onChange={(e) => setGreeting(e.target.value)} />
        </div>

        <div className="editor-actions-bar">
          <button type="submit" className="editor-btn-primary">
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
      </form>

      <div style={{ marginTop: '28px', borderTop: '1px solid #f0ede6', paddingTop: '20px' }}>
        <h3 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '16px', margin: '0 0 12px' }}>Cài đặt bảo mật &amp; Quản trị</h3>
        <RevokeGuests invitationId={draft.invitationId} version={version} onRevoked={setVersion} />
        <SwitchRsvpMode invitationId={draft.invitationId} mode={rsvpMode} onSwitched={() => setRsvpMode('GUEST_LIST')} />
        <ReopenRsvp invitationId={draft.invitationId} />
        <RetireEvent invitationId={draft.invitationId} />
      </div>
    </section>
  )
}

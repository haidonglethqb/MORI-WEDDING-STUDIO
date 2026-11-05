'use client'

import { useState } from 'react'

export interface ModerationItemView {
  invitationId: string
  slug: string
  status: string
  moderationState: 'ACTIVE' | 'SUSPENDED'
  moderationReason: string | null
  moderationVersion: number
  openReportCount: number
  reports: { id: string; reason: string; state: 'OPEN' | 'REVIEWED'; createdAt: string }[]
  decisions: { id: string; action: 'SUSPEND' | 'RESTORE'; reason: string; createdAt: string }[]
}

export function ModerateInvitation({ item }: { item: ModerationItemView }) {
  const [moderationState, setModerationState] = useState(item.moderationState)
  const [moderationReason, setModerationReason] = useState(item.moderationReason)
  const [version, setVersion] = useState(item.moderationVersion)
  const [openCount, setOpenCount] = useState(item.openReportCount)
  const [reason, setReason] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  async function act(action: 'SUSPEND' | 'RESTORE') {
    const trimmed = reason.trim()
    if (trimmed.length < 3) {
      setStatusMessage('Vui lòng nhập lý do tối thiểu 3 ký tự.')
      return
    }
    setStatusMessage('Đang xử lý quyết định...')
    const response = await fetch(`/admin/invitations/${item.invitationId}/moderation`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': crypto.randomUUID(),
      },
      body: JSON.stringify({ action, reason: trimmed, expectedVersion: version }),
    })
    if (response.status === 409) {
      setStatusMessage('Trạng thái đã thay đổi. Vui lòng tải lại trang.')
      return
    }
    if (!response.ok) {
      setStatusMessage('Chưa lưu được quyết định.')
      return
    }
    const next = (await response.json()) as {
      moderationState: 'ACTIVE' | 'SUSPENDED'
      version: number
    }
    setModerationState(next.moderationState)
    setModerationReason(action === 'SUSPEND' ? trimmed : null)
    setVersion(next.version)
    setOpenCount(0)
    setReason('')
    setStatusMessage(action === 'SUSPEND' ? 'Đã tạm ngưng thiệp thành công.' : 'Đã gỡ tạm ngưng và khôi phục thiệp.')
  }

  return (
    <li style={{ padding: '20px', background: '#faf9f5', borderRadius: '12px', border: '1px solid #e8e4da' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '18px', margin: '0 0 4px', color: '#242c22' }}>
            Thiệp #{item.slug || item.invitationId.slice(0, 8)}
          </h3>
          <span style={{ fontSize: '12px', color: '#6a7166' }}>Trạng thái: {item.status} · Báo cáo chưa xử lý: {openCount}</span>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '999px',
            background: moderationState === 'SUSPENDED' ? '#fde8e8' : '#def7ec',
            color: moderationState === 'SUSPENDED' ? '#9b1c1c' : '#03543f',
          }}
        >
          {moderationState === 'SUSPENDED' ? 'TẠM NGƯNG HIỂN THỊ' : 'ĐANG HIỂN THỊ BÌNH THƯỜNG'}
        </span>
      </div>

      {moderationReason ? (
        <div style={{ fontSize: '13px', color: '#9b1c1c', background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #f8b4b4', marginBottom: '12px' }}>
          Lý do tạm ngưng: {moderationReason}
        </div>
      ) : null}

      {item.reports.length > 0 ? (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5247', marginBottom: '6px' }}>Các báo cáo từ khách mời:</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {item.reports.map((report) => (
              <li key={report.id} style={{ fontSize: '13px', background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5dfd2' }}>
                <span style={{ fontWeight: 500, color: '#8c734b' }}>[{report.state === 'OPEN' ? 'Mới' : 'Đã duyệt'}]</span> {report.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{ flex: '1', minWidth: '240px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Nhập lý do kiểm duyệt xử lý..."
          value={reason}
          maxLength={500}
          onChange={(e) => setReason(e.target.value)}
        />
        {moderationState === 'ACTIVE' ? (
          <button
            type="button"
            className="workspace-btn-outline"
            style={{ color: '#9b1c1c', borderColor: '#f8b4b4', padding: '8px 16px', fontSize: '13px' }}
            onClick={() => void act('SUSPEND')}
          >
            Tạm ngưng thiệp
          </button>
        ) : (
          <button
            type="button"
            className="workspace-btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => void act('RESTORE')}
          >
            Khôi phục thiệp
          </button>
        )}
      </div>

      {statusMessage ? <div style={{ fontSize: '12px', color: '#3e4a39', marginTop: '8px' }}>{statusMessage}</div> : null}
    </li>
  )
}

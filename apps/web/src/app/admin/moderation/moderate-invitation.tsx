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
      setStatusMessage('Nhập lý do tối thiểu 3 ký tự.')
      return
    }
    setStatusMessage('Đang ghi nhận')
    const response = await fetch(`/admin/invitations/${item.invitationId}/moderation`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': crypto.randomUUID(),
      },
      body: JSON.stringify({ action, reason: trimmed, expectedVersion: version }),
    })
    if (response.status === 409) {
      setStatusMessage('Trạng thái đã đổi. Tải lại trang trước khi thao tác.')
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
    setStatusMessage(action === 'SUSPEND' ? 'Đã tạm ngưng thiệp.' : 'Đã gỡ tạm ngưng.')
  }

  return (
    <li>
      <h2>
        {item.slug || item.invitationId} · {item.status} ·{' '}
        {moderationState === 'SUSPENDED' ? 'Đang tạm ngưng' : 'Đang hiển thị'}
      </h2>
      <p>Báo cáo chờ xem: {openCount}</p>
      {moderationReason ? <p>Lý do tạm ngưng hiện tại: {moderationReason}</p> : null}
      {item.reports.length > 0 ? (
        <ul>
          {item.reports.map((report) => (
            <li key={report.id}>
              [{report.state === 'OPEN' ? 'Đang mở' : 'Đã xem'}] {report.reason}
            </li>
          ))}
        </ul>
      ) : null}
      {item.decisions.length > 0 ? (
        <ul>
          {item.decisions.map((decision) => (
            <li key={decision.id}>
              [{decision.action === 'SUSPEND' ? 'Tạm ngưng' : 'Đã khôi phục'}] {decision.reason}
            </li>
          ))}
        </ul>
      ) : null}
      <label>
        Lý do kiểm duyệt
        <input value={reason} maxLength={500} onChange={(event) => setReason(event.target.value)} />
      </label>
      {moderationState === 'ACTIVE' ? (
        <button type="button" onClick={() => void act('SUSPEND')}>
          Tạm ngưng thiệp
        </button>
      ) : (
        <button type="button" onClick={() => void act('RESTORE')}>
          Gỡ tạm ngưng
        </button>
      )}
      {statusMessage ? <p>{statusMessage}</p> : null}
    </li>
  )
}

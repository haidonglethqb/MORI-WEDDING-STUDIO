'use client'

import { useState } from 'react'

export function ExcludeReply({
  invitationId,
  partyId,
  partyName,
  statusLabel,
  excluded,
  eventId,
  version,
}: {
  invitationId: string
  partyId: string
  partyName: string
  statusLabel: string
  excluded: boolean
  eventId: string | null
  version: number
}) {
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(excluded)
  const [status, setStatus] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)

  async function exclude() {
    if (!reason.trim()) {
      setStatus('Cần điền lý do loại.')
      return
    }
    setStatus('Đang xử lý...')
    const response = await fetch(`/invitations/${invitationId}/parties/${partyId}/exclude`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    if (!response.ok) {
      setStatus('Chưa loại được khỏi số đếm.')
      return
    }
    setDone(true)
    setShowPrompt(false)
    setStatus('Đã loại khỏi số đếm.')
  }

  async function correct() {
    if (!eventId || !reason.trim()) {
      setStatus('Cần điền lý do điều chỉnh.')
      return
    }
    setStatus('Đang sửa...')
    const response = await fetch(`/invitations/${invitationId}/parties/${partyId}/correction`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventId,
        expectedVersion: version,
        status: 'DECLINED',
        attendeeCount: 0,
        reason,
      }),
    })
    setStatus(response.ok ? 'Đã đổi thành Không tham dự.' : 'Chưa cập nhật được.')
    if (response.ok) setShowPrompt(false)
  }

  return (
    <li className="editor-reply-item">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <strong>{partyName}</strong>
        <span style={{ fontSize: '12px', color: '#636b5f' }}>
          {statusLabel} {done ? '· [Đã loại khỏi số đếm]' : ''}
        </span>
      </div>

      {!done && !showPrompt ? (
        <button
          type="button"
          className="editor-btn-secondary"
          style={{ padding: '4px 10px', fontSize: '12px' }}
          onClick={() => setShowPrompt(true)}
        >
          Điều chỉnh / Loại bỏ
        </button>
      ) : null}

      {showPrompt && !done ? (
        <div style={{ width: '100%', marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            className="editor-input"
            style={{ padding: '6px 10px', fontSize: '13px' }}
            placeholder="Lý do điều chỉnh..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            type="button"
            className="editor-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
            onClick={() => void exclude()}
          >
            Loại
          </button>
          {eventId ? (
            <button
              type="button"
              className="editor-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
              onClick={() => void correct()}
            >
              Không đến
            </button>
          ) : null}
          <button
            type="button"
            className="editor-btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px' }}
            onClick={() => setShowPrompt(false)}
          >
            Đóng
          </button>
        </div>
      ) : null}

      {status ? <div style={{ width: '100%', fontSize: '12px', color: '#3e4a39' }}>{status}</div> : null}
    </li>
  )
}

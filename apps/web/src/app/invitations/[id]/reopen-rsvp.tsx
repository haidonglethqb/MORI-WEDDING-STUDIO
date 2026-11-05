'use client'

import { useState } from 'react'

export function ReopenRsvp({ invitationId }: { invitationId: string }) {
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState('Chỉ mở lại khi lời đáp đã đóng, và hạn phải trước ngày tổ chức.')

  async function reopen() {
    setStatus('Đang cập nhật thời hạn...')
    const parsed = new Date(deadline)
    const response = await fetch(`/invitations/${invitationId}/rsvp-deadline`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deadline: Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString() }),
    })
    setStatus(response.ok ? 'Đã mở lại thời hạn nhận lời đáp!' : 'Chưa mở lại được. Hạn phải nằm trước giờ buổi lễ.')
  }

  return (
    <fieldset className="editor-tool-fieldset">
      <legend>Thời hạn nhận lời đáp</legend>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '8px 0 10px', flexWrap: 'wrap' }}>
        <input
          type="datetime-local"
          className="editor-input"
          style={{ width: 'auto', padding: '6px 10px', fontSize: '13px' }}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <button
          type="button"
          className="editor-btn-secondary"
          style={{ padding: '6px 14px', fontSize: '12px' }}
          onClick={() => void reopen()}
        >
          Cập nhật hạn mới
        </button>
      </div>
      <div style={{ fontSize: '12px', color: '#7a8275' }}>{status}</div>
    </fieldset>
  )
}

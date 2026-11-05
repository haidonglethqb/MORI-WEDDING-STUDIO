'use client'

import { useRef, useState } from 'react'

export function RotateHandle({
  invitationId,
  slug,
  version,
  onRotated,
}: {
  invitationId: string
  slug: string
  version: number
  onRotated: (next: { slug: string; version: number }) => void
}) {
  const key = useRef(`rotate-${crypto.randomUUID()}`)
  const [status, setStatus] = useState('Đường dẫn cũ sẽ không thể truy cập sau khi đổi.')

  async function rotate() {
    setStatus('Đang đổi mã đường dẫn...')
    const response = await fetch(`/invitations/${invitationId}/rotate-handle`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({ expectedVersion: version }),
    })
    if (response.status === 409) {
      setStatus('Bản nháp đã đổi. Tải lại trước khi đổi đường dẫn.')
      return
    }
    if (!response.ok) {
      setStatus('Chưa đổi được đường dẫn.')
      return
    }
    const saved = (await response.json()) as { slug: string; version: number }
    onRotated(saved)
    setStatus('Đã đổi đường dẫn mới thành công!')
  }

  return (
    <div style={{ background: '#faf9f5', border: '1px solid #e8e4da', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: '#4b5247' }}>
          Mã liên kết riêng: <strong style={{ color: '#242c22' }}>/i/{slug}</strong>
        </span>
        <button type="button" className="editor-btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => void rotate()}>
          Đổi mã liên kết
        </button>
      </div>
      <div style={{ fontSize: '12px', color: '#7a8275', marginTop: '6px' }}>{status}</div>
    </div>
  )
}

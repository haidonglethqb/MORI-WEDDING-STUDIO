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
  const [status, setStatus] = useState('Đường dẫn cũ sẽ không mở được nữa.')

  async function rotate() {
    setStatus('Đang đổi đường dẫn')
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
    setStatus('Đã đổi đường dẫn. Liên kết cũ không còn mở được.')
  }

  return (
    <p>
      Đường dẫn riêng: {slug}{' '}
      <button type="button" onClick={() => void rotate()}>
        Đổi đường dẫn
      </button>
      <span> {status}</span>
    </p>
  )
}

'use client'

import { useRef, useState } from 'react'

export function CreateInvitation() {
  const key = useRef(`create-${crypto.randomUUID()}`)
  const [status, setStatus] = useState('')

  async function create() {
    setStatus('Đang tạo...')
    const response = await fetch('/workspace/create', {
      method: 'POST',
      headers: { 'idempotency-key': key.current },
    })
    if (!response.ok) {
      setStatus('Chưa tạo được thiệp.')
      return
    }
    const created = (await response.json()) as { invitationId: string }
    window.location.assign(`/invitations/${created.invitationId}`)
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <button type="button" className="workspace-btn-primary" onClick={() => void create()}>
        + Tạo thiệp mới
      </button>
      {status ? <span style={{ fontSize: '12px', color: '#6a7166' }}>{status}</span> : null}
    </div>
  )
}

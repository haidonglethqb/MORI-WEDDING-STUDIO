'use client'

import { useRef, useState } from 'react'

export function CreateDesignRequest() {
  const key = useRef<string | null>(null)
  const [status, setStatus] = useState('')

  async function create(kind: 'PAPER' | 'DIGITAL') {
    setStatus('Đang tạo...')
    if (!key.current) key.current = `design-${crypto.randomUUID()}`
    const response = await fetch('/workspace/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({ kind }),
    })
    if (!response.ok) {
      key.current = null
      setStatus('Chưa tạo được yêu cầu.')
      return
    }
    const created = (await response.json()) as { requestId: string }
    window.location.assign(`/requests/${created.requestId}`)
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <button type="button" className="workspace-btn-outline" onClick={() => void create('PAPER')}>
        Thiệp giấy thủ công
      </button>
      <button type="button" className="workspace-btn-outline" onClick={() => void create('DIGITAL')}>
        Thiệp cưới số
      </button>
      {status ? <span style={{ fontSize: '12px', color: '#6a7166' }}>{status}</span> : null}
    </div>
  )
}

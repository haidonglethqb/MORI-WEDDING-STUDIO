'use client'

import { useRef, useState } from 'react'

export function CreateDesignRequest() {
  const key = useRef<string | null>(null)
  const [status, setStatus] = useState('')

  async function create(kind: 'PAPER' | 'DIGITAL') {
    setStatus('Đang tạo')
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
    <p>
      <button type="button" onClick={() => void create('PAPER')}>
        Tạo yêu cầu thiệp giấy
      </button>{' '}
      <button type="button" onClick={() => void create('DIGITAL')}>
        Tạo yêu cầu thiệp số
      </button>
      {status ? <span> {status}</span> : null}
    </p>
  )
}

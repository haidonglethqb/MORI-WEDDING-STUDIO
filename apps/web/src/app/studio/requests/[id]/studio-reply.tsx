'use client'

import { useRef, useState } from 'react'

export function StudioReply({ requestId }: { requestId: string }) {
  const key = useRef(`reply-${crypto.randomUUID()}`)
  const [plainText, setPlainText] = useState('')
  const [internal, setInternal] = useState(true)
  const [status, setStatus] = useState('')

  async function send() {
    setStatus('Đang gửi')
    const response = await fetch(`/studio/requests/${requestId}/reply`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({ plainText, visibility: internal ? 'INTERNAL' : 'CUSTOMER' }),
    })
    if (!response.ok) {
      setStatus('Chưa gửi được.')
      return
    }
    key.current = `reply-${crypto.randomUUID()}`
    setPlainText('')
    setStatus('Đã gửi. Tải lại để thấy tin.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void send()
      }}
    >
      <label>
        Tin nhắn
        <textarea value={plainText} onChange={(event) => setPlainText(event.target.value)} />
      </label>
      <label>
        <input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} /> Nội bộ
      </label>
      <button type="submit">Gửi</button>
      {status ? <p>{status}</p> : null}
    </form>
  )
}

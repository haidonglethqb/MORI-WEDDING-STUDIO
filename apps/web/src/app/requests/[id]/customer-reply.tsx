'use client'

import { useRef, useState } from 'react'

export function CustomerReply({ requestId }: { requestId: string }) {
  const key = useRef(`customer-${crypto.randomUUID()}`)
  const [plainText, setPlainText] = useState('')
  const [status, setStatus] = useState('')

  async function send() {
    setStatus('Đang gửi')
    const response = await fetch(`/requests/${requestId}/reply`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({ plainText }),
    })
    if (!response.ok) {
      setStatus('Chưa gửi được.')
      return
    }
    key.current = `customer-${crypto.randomUUID()}`
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
        Tin cho xưởng
        <textarea value={plainText} onChange={(event) => setPlainText(event.target.value)} />
      </label>
      <button type="submit">Gửi</button>
      {status ? <p>{status}</p> : null}
    </form>
  )
}

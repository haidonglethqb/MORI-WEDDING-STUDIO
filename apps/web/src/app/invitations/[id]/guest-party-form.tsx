'use client'

import { useRef, useState } from 'react'

export function GuestPartyForm({ invitationId }: { invitationId: string }) {
  const partyKey = useRef(`party-${crypto.randomUUID()}`)
  const linkKey = useRef(`link-${crypto.randomUUID()}`)
  const [name, setName] = useState('')
  const [limit, setLimit] = useState('2')
  const [partyId, setPartyId] = useState('')
  const [status, setStatus] = useState('Đường dẫn bí mật chỉ hiện một lần.')

  async function createParty() {
    setStatus('Đang tạo nhóm')
    const response = await fetch(`/invitations/${invitationId}/parties`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': partyKey.current },
      body: JSON.stringify({ displayName: name, maxAttendees: Number(limit) }),
    })
    const payload = (await response.json()) as { partyId?: string }
    if (!response.ok || !payload.partyId) {
      setStatus('Chưa tạo được nhóm.')
      return
    }
    setPartyId(payload.partyId)
    setStatus('Đã tạo nhóm. Có thể phát đường dẫn.')
  }

  async function issueLink() {
    if (!partyId) return
    setStatus('Đang tạo đường dẫn')
    const response = await fetch(`/invitations/${invitationId}/parties/${partyId}/link`, {
      method: 'POST',
      headers: { 'idempotency-key': linkKey.current },
    })
    const payload = (await response.json()) as { guestPath?: string }
    setStatus(payload.guestPath ? `Đường dẫn: ${payload.guestPath}` : 'Đường dẫn đã tạo trước đó và không hiện lại.')
  }

  async function revokeLink() {
    if (!partyId) return
    setStatus('Đang thu hồi')
    const response = await fetch(`/invitations/${invitationId}/parties/${partyId}/revoke`, { method: 'POST' })
    setStatus(response.ok ? 'Đường dẫn cũ không còn dùng được.' : 'Chưa thu hồi được.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void createParty()
      }}
    >
      <h2>Nhóm khách</h2>
      <label>
        Tên nhóm
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Số khách tối đa
        <input value={limit} onChange={(event) => setLimit(event.target.value)} />
      </label>
      <button type="submit">Tạo nhóm</button>
      <button type="button" onClick={() => void issueLink()}>
        Phát đường dẫn
      </button>
      <button type="button" onClick={() => void revokeLink()}>
        Thu hồi đường dẫn
      </button>
      <p>{status}</p>
    </form>
  )
}

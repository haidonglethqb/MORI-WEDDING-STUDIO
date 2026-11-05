'use client'

import { useRef, useState } from 'react'

export function AssignForm({
  requestId,
  staff,
}: {
  requestId: string
  staff: { staffUserId: string; displayName: string }[]
}) {
  const key = useRef(`assign-${crypto.randomUUID()}`)
  const [staffUserId, setStaffUserId] = useState(staff[0]?.staffUserId ?? '')
  const [status, setStatus] = useState('')

  async function assign() {
    setStatus('Đang phân công...')
    const response = await fetch(`/studio/requests/${requestId}/assignment`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({ staffUserId }),
    })
    setStatus(response.ok ? 'Đã phân công nghệ nhân thành công.' : 'Chưa giao được việc.')
  }

  if (staff.length === 0) return null

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void assign()
      }}
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <select
          style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #d8d4c9', fontSize: '13px', background: '#fff' }}
          value={staffUserId}
          onChange={(event) => setStaffUserId(event.target.value)}
        >
          {staff.map((person) => (
            <option key={person.staffUserId} value={person.staffUserId}>
              {person.displayName}
            </option>
          ))}
        </select>
        <button type="submit" className="workspace-btn-outline" style={{ padding: '8px 14px', fontSize: '13px' }}>
          Giao việc
        </button>
      </div>
      {status ? <div style={{ fontSize: '12px', color: '#3e4a39' }}>{status}</div> : null}
    </form>
  )
}

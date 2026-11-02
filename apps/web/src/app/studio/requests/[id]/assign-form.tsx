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
    setStatus('Đang giao')
    const response = await fetch(`/studio/requests/${requestId}/assignment`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({ staffUserId }),
    })
    setStatus(response.ok ? 'Đã giao việc.' : 'Chưa giao được.')
  }

  if (staff.length === 0) return null
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void assign()
      }}
    >
      <label>
        Giao cho
        <select value={staffUserId} onChange={(event) => setStaffUserId(event.target.value)}>
          {staff.map((person) => (
            <option key={person.staffUserId} value={person.staffUserId}>
              {person.displayName}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Giao việc</button>
      {status ? <p>{status}</p> : null}
    </form>
  )
}

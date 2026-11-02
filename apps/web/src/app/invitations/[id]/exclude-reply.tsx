'use client'

import { useState } from 'react'

export function ExcludeReply({
  invitationId,
  partyId,
  partyName,
  statusLabel,
  excluded,
  eventId,
  version,
}: {
  invitationId: string
  partyId: string
  partyName: string
  statusLabel: string
  excluded: boolean
  eventId: string | null
  version: number
}) {
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(excluded)
  const [status, setStatus] = useState('')

  async function exclude() {
    setStatus('Đang loại')
    const response = await fetch(`/invitations/${invitationId}/parties/${partyId}/exclude`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    if (!response.ok) {
      setStatus('Chưa loại được. Cần một lý do.')
      return
    }
    setDone(true)
    setStatus('Đã loại khỏi số đếm. Lời đáp cũ vẫn còn.')
  }

  async function correct() {
    if (!eventId) return
    setStatus('Đang sửa lời đáp')
    const response = await fetch(`/invitations/${invitationId}/parties/${partyId}/correction`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventId,
        expectedVersion: version,
        status: 'DECLINED',
        attendeeCount: 0,
        reason,
      }),
    })
    setStatus(response.ok ? 'Đã sửa thành không tham dự. Lý do được lưu.' : 'Chưa sửa được. Cần lý do và đúng phiên bản.')
  }

  return (
    <li>
      {partyName} · {statusLabel}
      {done ? ' · Đã loại' : ''}
      {done ? null : (
        <>
          <label>
            Lý do
            <input value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
          <button type="button" onClick={() => void exclude()}>
            Loại khỏi số đếm
          </button>
          {eventId ? (
            <button type="button" onClick={() => void correct()}>
              Sửa thành không tham dự
            </button>
          ) : null}
        </>
      )}
      {status ? <span> {status}</span> : null}
    </li>
  )
}

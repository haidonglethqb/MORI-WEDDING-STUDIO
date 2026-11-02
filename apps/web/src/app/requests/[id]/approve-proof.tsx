'use client'

import { useState } from 'react'

const checks = [
  ['names', 'Tên'],
  ['dates', 'Ngày'],
  ['venues', 'Địa điểm'],
  ['quantitySpec', 'Số lượng và quy cách'],
  ['screenColour', 'Màu trên màn hình có thể khác bản in'],
  ['version', 'Đúng phiên bản này'],
] as const

export function ApproveProof({
  requestId,
  revisionId,
  sequence,
  manifestHash,
}: {
  requestId: string
  revisionId: string
  sequence: number
  manifestHash: string
}) {
  const [ack, setAck] = useState({
    names: false,
    dates: false,
    venues: false,
    quantitySpec: false,
    screenColour: false,
    version: false,
  })
  const [status, setStatus] = useState(`Bản ${sequence}. Mã bản in ${manifestHash}.`)
  const ready = Object.values(ack).every(Boolean)

  async function approve() {
    setStatus('Đang duyệt')
    const response = await fetch(`/requests/${requestId}/revisions/${revisionId}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        manifestHash,
        scopeFingerprint: manifestHash,
        acknowledgementVersion: 'ack-1',
        acknowledgement: ack,
      }),
    })
    setStatus(response.ok ? 'Đã duyệt bản in này.' : 'Chưa duyệt được. Hãy xác nhận đủ các mục.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void approve()
      }}
    >
      {checks.map(([key, label]) => (
        <label key={key}>
          <input
            type="checkbox"
            checked={ack[key]}
            onChange={(event) => setAck((current) => ({ ...current, [key]: event.target.checked }))}
          />{' '}
          {label}
        </label>
      ))}
      <button type="submit" disabled={!ready}>
        Duyệt bản {sequence}
      </button>
      <p>{status}</p>
    </form>
  )
}

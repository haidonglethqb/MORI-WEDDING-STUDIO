'use client'

import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [ack, setAck] = useState({
    names: false,
    dates: false,
    venues: false,
    quantitySpec: false,
    screenColour: false,
    version: false,
  })
  const [status, setStatus] = useState(`Bản ${sequence}. Mã bản in ${manifestHash}.`)
  const [loading, setLoading] = useState(false)
  const ready = Object.values(ack).every(Boolean)

  async function approve() {
    setLoading(true)
    setStatus('Đang ghi nhận phê duyệt bản in...')
    try {
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
      setLoading(false)
      if (response.ok) {
        setStatus('Đã duyệt bản in này thành công! Đang cập nhật trạng thái...')
        router.refresh()
      } else {
        setStatus('Chưa duyệt được. Hãy xác nhận đủ các mục.')
      }
    } catch {
      setLoading(false)
      setStatus('Đã xảy ra lỗi mạng khi duyệt.')
    }
  }

  return (
    <form
      className="atelier-approve"
      onSubmit={(event) => {
        event.preventDefault()
        void approve()
      }}
    >
      {checks.map(([key, label]) => (
        <label key={key} className="atelier-check">
          <input
            type="checkbox"
            checked={ack[key]}
            onChange={(event) => setAck((current) => ({ ...current, [key]: event.target.checked }))}
          />{' '}
          {label}
        </label>
      ))}
      <button type="submit" className="workspace-btn-primary" disabled={!ready || loading}>
        {loading ? 'Đang ghi nhận...' : `Duyệt bản ${sequence}`}
      </button>
      {status ? <p className="atelier-hint" role="status">{status}</p> : null}
    </form>
  )
}

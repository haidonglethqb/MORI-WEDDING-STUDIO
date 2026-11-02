'use client'

import { useRef, useState } from 'react'

export function OpenProof({ requestId }: { requestId: string }) {
  const key = useRef(`proof-${crypto.randomUUID()}`)
  const [hash, setHash] = useState('')
  const [trimWidth, setTrimWidth] = useState('')
  const [trimHeight, setTrimHeight] = useState('')
  const [profileWidth, setProfileWidth] = useState('')
  const [profileHeight, setProfileHeight] = useState('')
  const [fontsReady, setFontsReady] = useState(false)
  const [faceMap, setFaceMap] = useState(false)
  const [revisionId, setRevisionId] = useState('')
  const [status, setStatus] = useState('Số đo là mẫu thử cho đến khi có hồ sơ in thật.')

  async function openProof() {
    setStatus('Đang mở bản in')
    const response = await fetch(`/studio/requests/${requestId}/revisions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({ manifestHash: hash.trim() }),
    })
    const payload = (await response.json()) as { revisionId?: string }
    if (!response.ok || !payload.revisionId) {
      setStatus('Chưa mở được bản in.')
      return
    }
    setRevisionId(payload.revisionId)
    setStatus('Đã mở bản đang làm.')
  }

  async function prepare() {
    if (!revisionId) return
    setStatus('Đang chuẩn bị')
    const response = await fetch(`/studio/revisions/${revisionId}/prepare`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        renderState: 'READY',
        faceMapComplete: faceMap,
        fontsReady,
        trimWidthMm: Number(trimWidth),
        trimHeightMm: Number(trimHeight),
        profileWidthMm: Number(profileWidth),
        profileHeightMm: Number(profileHeight),
      }),
    })
    setStatus(response.ok ? 'Đã ghi số đo mẫu thử.' : 'Chưa chuẩn bị được.')
  }

  async function submit() {
    if (!revisionId) return
    setStatus('Đang gửi khách')
    const response = await fetch(`/studio/revisions/${revisionId}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requestId }),
    })
    setStatus(response.ok ? 'Khách có thể xem bản này.' : 'Chưa gửi được. Bản cần sẵn sàng và đủ mặt.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void openProof()
      }}
    >
      <h2>Bản in mẫu thử</h2>
      <label>
        Mã tệp
        <input value={hash} onChange={(event) => setHash(event.target.value)} />
      </label>
      <label>
        Rộng thành phẩm mm
        <input value={trimWidth} onChange={(event) => setTrimWidth(event.target.value)} />
      </label>
      <label>
        Cao thành phẩm mm
        <input value={trimHeight} onChange={(event) => setTrimHeight(event.target.value)} />
      </label>
      <label>
        Rộng hồ sơ mm
        <input value={profileWidth} onChange={(event) => setProfileWidth(event.target.value)} />
      </label>
      <label>
        Cao hồ sơ mm
        <input value={profileHeight} onChange={(event) => setProfileHeight(event.target.value)} />
      </label>
      <label>
        <input type="checkbox" checked={fontsReady} onChange={(event) => setFontsReady(event.target.checked)} />
        Font mẫu thử đã đủ
      </label>
      <label>
        <input type="checkbox" checked={faceMap} onChange={(event) => setFaceMap(event.target.checked)} />
        Đủ mặt in
      </label>
      <button type="submit">Mở bản đang làm</button>
      <button type="button" onClick={() => void prepare()}>
        Ghi chuẩn bị
      </button>
      <button type="button" onClick={() => void submit()}>
        Gửi khách xem
      </button>
      <p>{status}</p>
    </form>
  )
}

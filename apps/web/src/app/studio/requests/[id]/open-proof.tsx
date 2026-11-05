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
  const [status, setStatus] = useState('Số đo là mẫu thử kỹ thuật số phục vụ quy trình xưởng.')

  async function openProof() {
    setStatus('Đang mở bản mẫu thiết kế...')
    const response = await fetch(`/studio/requests/${requestId}/revisions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({ manifestHash: hash.trim() }),
    })
    const payload = (await response.json()) as { revisionId?: string }
    if (!response.ok || !payload.revisionId) {
      setStatus('Chưa mở được bản mẫu thiết kế.')
      return
    }
    setRevisionId(payload.revisionId)
    setStatus('Đã khởi tạo bản mẫu thiết kế thành công.')
  }

  async function prepare() {
    if (!revisionId) return
    setStatus('Đang chuẩn bị hồ sơ in...')
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
    setStatus(response.ok ? 'Đã lưu thông số kỹ thuật bản in.' : 'Chưa lưu được thông số.')
  }

  async function submit() {
    if (!revisionId) return
    setStatus('Đang gửi khách duyệt bản proof...')
    const response = await fetch(`/studio/revisions/${revisionId}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requestId }),
    })
    setStatus(response.ok ? 'Đã gửi bản proof cho khách duyệt!' : 'Chưa gửi được. Kiểm tra trạng thái sẵn sàng.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void openProof()
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        <input
          style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Mã tệp thiết kế (manifest hash)..."
          value={hash}
          onChange={(event) => setHash(event.target.value)}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <input
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Rộng thành phẩm mm..."
          value={trimWidth}
          onChange={(event) => setTrimWidth(event.target.value)}
        />
        <input
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Cao thành phẩm mm..."
          value={trimHeight}
          onChange={(event) => setTrimHeight(event.target.value)}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <input
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Rộng hồ sơ in mm..."
          value={profileWidth}
          onChange={(event) => setProfileWidth(event.target.value)}
        />
        <input
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Cao hồ sơ in mm..."
          value={profileHeight}
          onChange={(event) => setProfileHeight(event.target.value)}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#4b5247', marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input type="checkbox" checked={fontsReady} onChange={(event) => setFontsReady(event.target.checked)} />
          Bộ font chữ đã sẵn sàng
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input type="checkbox" checked={faceMap} onChange={(event) => setFaceMap(event.target.checked)} />
          Đã ánh xạ đủ các mặt thiệp
        </label>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button type="submit" className="workspace-btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }}>
          Mở bản proof
        </button>
        {revisionId ? (
          <>
            <button type="button" className="workspace-btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => void prepare()}>
              Ghi chuẩn bị
            </button>
            <button type="button" className="workspace-btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => void submit()}>
              Gửi khách xem
            </button>
          </>
        ) : null}
      </div>
      <div style={{ fontSize: '12px', color: '#7a8275', marginTop: '6px' }}>{status}</div>
    </form>
  )
}

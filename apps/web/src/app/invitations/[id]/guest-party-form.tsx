'use client'

import { useRef, useState } from 'react'

export function GuestPartyForm({ invitationId }: { invitationId: string }) {
  const partyKey = useRef(`party-${crypto.randomUUID()}`)
  const linkKey = useRef(`link-${crypto.randomUUID()}`)
  const [name, setName] = useState('')
  const [limit, setLimit] = useState('2')
  const [partyId, setPartyId] = useState('')
  const [status, setStatus] = useState('Mỗi liên kết khách mời chỉ phát ra một lần để bảo mật.')

  async function createParty() {
    if (!name.trim()) {
      setStatus('Vui lòng nhập tên nhóm khách mời.')
      return
    }
    setStatus('Đang tạo nhóm khách...')
    const response = await fetch(`/invitations/${invitationId}/parties`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': partyKey.current },
      body: JSON.stringify({ displayName: name, maxAttendees: Number(limit) }),
    })
    const payload = (await response.json()) as { partyId?: string }
    if (!response.ok || !payload.partyId) {
      setStatus('Chưa tạo được nhóm khách.')
      return
    }
    setPartyId(payload.partyId)
    setStatus('Đã tạo nhóm thành công. Bạn có thể phát liên kết riêng.')
  }

  async function issueLink() {
    if (!partyId) return
    setStatus('Đang tạo đường dẫn mời riêng...')
    const response = await fetch(`/invitations/${invitationId}/parties/${partyId}/link`, {
      method: 'POST',
      headers: { 'idempotency-key': linkKey.current },
    })
    const payload = (await response.json()) as { guestPath?: string }
    setStatus(
      payload.guestPath
        ? `Đường dẫn riêng: ${window.location.origin}${payload.guestPath}`
        : 'Đường dẫn đã được tạo trước đó và không hiển thị lại vì lý do bảo mật.',
    )
  }

  async function revokeLink() {
    if (!partyId) return
    setStatus('Đang thu hồi đường dẫn...')
    const response = await fetch(`/invitations/${invitationId}/parties/${partyId}/revoke`, { method: 'POST' })
    setStatus(response.ok ? 'Đường dẫn cũ đã được vô hiệu hóa an toàn.' : 'Chưa thu hồi được liên kết.')
  }

  return (
    <section className="editor-card">
      <div className="editor-card-header">
        <h2 className="editor-card-title">Phát hành liên kết khách mời</h2>
        <p className="editor-card-desc">Tạo nhóm khách và phát đường dẫn mời riêng tư có định danh.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void createParty(); }}>
        <div className="editor-form-group">
          <label>Tên khách mời hoặc Nhóm gia đình</label>
          <input
            className="editor-input"
            placeholder="VD: Gia đình Bác Hoàng, Bạn Thảo..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="editor-form-group">
          <label>Số lượng khách tối đa</label>
          <input
            className="editor-input"
            type="number"
            min={1}
            max={20}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </div>

        <div className="editor-actions-bar">
          <button type="submit" className="editor-btn-primary">
            + Tạo nhóm khách
          </button>
          {partyId ? (
            <>
              <button type="button" className="editor-btn-secondary" onClick={() => void issueLink()}>
                Phát liên kết riêng
              </button>
              <button
                type="button"
                className="editor-btn-secondary"
                style={{ color: '#9b1c1c', borderColor: '#f8b4b4' }}
                onClick={() => void revokeLink()}
              >
                Thu hồi liên kết
              </button>
            </>
          ) : null}
        </div>
        <div className="editor-status-pill">{status}</div>
      </form>
    </section>
  )
}

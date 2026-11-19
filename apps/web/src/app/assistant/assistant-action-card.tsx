'use client'

import Link from 'next/link'
import { useState } from 'react'
import { addToCart, openCartDrawer, readSelectedFont } from '../../features/cart/cart-store'
import { AssistantBespokeCard } from './assistant-bespoke-card'
import type { AgentProposedAction } from './assistant-types'

interface Props {
  action: AgentProposedAction
  draftKey: string
  sessionPhotoUrl?: string | undefined
}

export function AssistantActionCard({ action, draftKey, sessionPhotoUrl }: Props) {
  if (action.type === 'BESPOKE_DESIGN_PREVIEW') {
    return <AssistantBespokeCard action={action} draftKey={draftKey} sessionPhotoUrl={sessionPhotoUrl} />
  }
  return <StandardActionCard action={action} />
}

function StandardActionCard({ action }: { action: Exclude<AgentProposedAction, { type: 'BESPOKE_DESIGN_PREVIEW' }> }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'auth' | 'error'>('idle')
  const [resultMsg, setResultMsg] = useState<string>('')
  const [createdHref, setCreatedHref] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  function handleAddToCart() {
    if (action.type !== 'ADD_TO_CART') return
    const font = readSelectedFont()
    addToCart({
      slug: action.slug,
      name: action.name,
      productType: action.productType,
      shape: action.shape,
      quantity: action.quantity,
      unitAmountVnd: action.unitAmountVnd,
      imageUrl: action.imageUrl ?? null,
      linkedDigitalSlug: action.linkedDigitalSlug,
      linkedDigitalName: action.linkedDigitalName,
      linkedDigitalUnitVnd: action.linkedDigitalUnitVnd,
      fontCode: font?.code,
    })
    openCartDrawer()
    setState('done')
    setResultMsg('Đã thêm vào giỏ hàng!')
  }

  async function handleCreateDigitalDraft() {
    if (action.type !== 'CREATE_DIGITAL_INVITATION' || state === 'busy') return
    setState('busy')
    try {
      const res = await fetch('/assistant/create-draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(action),
      })
      if (res.status === 401) {
        setState('auth')
        setResultMsg('Bạn cần đăng nhập để lưu bản nháp vào Không gian của mình.')
        return
      }
      if (!res.ok) {
        setState('error')
        setResultMsg('Chưa khởi tạo được bản nháp lúc này.')
        return
      }
      const data = (await res.json()) as { editorUrl?: string }
      setCreatedHref(data.editorUrl ?? '/workspace')
      setState('done')
      setResultMsg('Đã tạo xong bản nháp Thiệp Online với thông tin của hai bạn!')
    } catch {
      setState('error')
      setResultMsg('Lỗi kết nối khi tạo bản nháp.')
    }
  }

  async function handleSubmitCustomRequest() {
    if (action.type !== 'SUBMIT_CUSTOM_REQUEST' || state === 'busy') return
    if (!customerName.trim() || !customerPhone.trim()) {
      setState('error')
      setResultMsg('Vui lòng nhập Tên và Số điện thoại để MORI liên hệ lại.')
      return
    }
    setState('busy')
    try {
      const res = await fetch('/api/storefront/custom-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          coupleNames: action.coupleNames,
          weddingDate: action.weddingDate,
          quantity: action.quantity,
          style: action.style,
          notes: action.notes,
        }),
      })
      if (!res.ok) {
        setState('error')
        setResultMsg('Chưa gửi được yêu cầu. Vui lòng thử lại.')
        return
      }
      const data = (await res.json()) as { id?: string }
      setState('done')
      setResultMsg(`Đã gửi yêu cầu thiết kế riêng thành công${data.id ? ` (Mã: ${data.id})` : ''}!`)
    } catch {
      setState('error')
      setResultMsg('Lỗi kết nối khi gửi yêu cầu.')
    }
  }

  return (
    <div className="agent-action-card">
      <div className="agent-action-info">
        <span className="agent-action-kicker">THAO TÁC ĐỀ XUẤT BỞI AGENT</span>
        <strong>{action.title}</strong>
        <p>{action.subtitle}</p>
      </div>

      {action.type === 'ADD_TO_CART' ? (
        <button type="button" className="agent-action-btn" onClick={handleAddToCart}>
          {state === 'done' ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ hàng ngay'}
        </button>
      ) : null}

      {action.type === 'CREATE_DIGITAL_INVITATION' ? (
        <div className="agent-action-controls">
          {state === 'done' && createdHref ? (
            <Link href={createdHref} className="agent-action-btn">
              Mở trình chỉnh sửa thiệp vừa tạo →
            </Link>
          ) : state === 'auth' ? (
            <div className="agent-action-row">
              <Link href="/login" className="agent-action-btn">
                Đăng nhập để tạo &amp; lưu thiệp
              </Link>
              <Link href="/collections?tab=online#studio-thiep-online" className="agent-action-btn is-outline">
                Dùng thử ngay không cần đăng nhập
              </Link>
            </div>
          ) : (
            <button
              type="button"
              className="agent-action-btn"
              disabled={state === 'busy'}
              onClick={() => void handleCreateDigitalDraft()}
            >
              {state === 'busy' ? 'Đang khởi tạo bản nháp...' : 'Khởi tạo bản nháp Thiệp Online ✦'}
            </button>
          )}
        </div>
      ) : null}

      {action.type === 'SUBMIT_CUSTOM_REQUEST' ? (
        state === 'done' ? null : (
          <div className="agent-custom-inputs">
            <input
              type="text"
              placeholder="Tên của bạn *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Số điện thoại *"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            <button
              type="button"
              className="agent-action-btn"
              disabled={state === 'busy'}
              onClick={() => void handleSubmitCustomRequest()}
            >
              {state === 'busy' ? 'Đang gửi...' : 'Xác nhận gửi brief thiết kế riêng'}
            </button>
          </div>
        )
      ) : null}

      {action.type === 'NAVIGATE' ? (
        <Link href={action.href} className="agent-action-btn">
          Mở trang ngay →
        </Link>
      ) : null}

      {resultMsg ? (
        <div className={`agent-action-feedback ${state === 'error' ? 'is-error' : ''}`}>
          {resultMsg}
        </div>
      ) : null}
    </div>
  )
}

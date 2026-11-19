'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { buildBespokePreviewModel } from '../../features/digital-templates/bespoke-preview-model'
import { DigitalTemplateRenderer } from '../../features/digital-templates/digital-template-renderer'
import { toInvitationContentPayload } from '../../features/digital-templates/template-view-utils'
import { AssistantBespokeModal } from './assistant-bespoke-modal'
import type { AgentBespokeDesignActionPayload } from './assistant-types'

export function AssistantBespokeCard({
  action,
  draftKey,
  sessionPhotoUrl,
}: {
  action: AgentBespokeDesignActionPayload
  draftKey: string
  sessionPhotoUrl?: string | undefined
}) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'auth' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [invitationId, setInvitationId] = useState('')
  const editorUrl = invitationId ? `/invitations/${invitationId}` : ''
  const [showPrintForm, setShowPrintForm] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [printDone, setPrintDone] = useState('')

  const model = useMemo(
    () => buildBespokePreviewModel(action.customDesign, action.draftData, sessionPhotoUrl),
    [action, sessionPhotoUrl],
  )

  async function persistInvitation(goToCheckout: boolean) {
    if (status === 'busy') return
    if (invitationId) {
      if (goToCheckout) router.push(`/checkout/invitations/${invitationId}`)
      return
    }
    setStatus('busy')
    setMessage('')
    try {
      const res = await fetch('/assistant/create-draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'idempotency-key': draftKey },
        body: JSON.stringify(toInvitationContentPayload(model)),
      })
      if (res.status === 401) {
        setStatus('auth')
        setMessage('Đăng nhập để lưu bản nháp hoặc thanh toán demo cho thiệp này.')
        return
      }
      if (!res.ok) {
        setStatus('error')
        setMessage('Chưa lưu được thiết kế lúc này. Bạn thử lại sau vài giây nhé.')
        return
      }
      const data = (await res.json()) as { invitationId: string }
      setInvitationId(data.invitationId)
      setStatus('done')
      setMessage('Đã lưu bản nháp vào Không gian chỉnh sửa của bạn.')
      if (goToCheckout) router.push(`/checkout/invitations/${data.invitationId}`)
    } catch {
      setStatus('error')
      setMessage('Lỗi kết nối khi lưu thiết kế thiệp.')
    }
  }

  async function submitCustomPrint() {
    if (!customerName.trim() || !customerPhone.trim()) {
      setPrintDone('Vui lòng nhập Tên và Số điện thoại để Xưởng liên hệ.')
      return
    }
    const res = await fetch('/api/storefront/custom-requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        coupleNames: model.displayNames.join(' & '),
        weddingDate: model.eventLocalStart,
        style: action.conceptName,
        notes: `Đặt in thiệp giấy đồng bộ concept AI "${action.conceptName}" (${action.customDesign.typography}, ${action.customDesign.frameStyle}, màu ${action.customDesign.theme.bg} / ${action.customDesign.theme.accent}).`,
      }),
    })
    setPrintDone(res.ok ? '✓ Đã gửi yêu cầu đặt in mẫu này tới Xưởng MORI!' : 'Chưa gửi được yêu cầu. Vui lòng thử lại.')
  }

  const swatches = [action.customDesign.theme.bg, action.customDesign.theme.surface, action.customDesign.theme.accent, action.customDesign.theme.text]

  return (
    <div className="bsp-chat-card">
      <div className="bsp-chat-head">
        <div>
          <span className="bsp-ai-badge">Bản phác thảo Thiệp Online</span>
          <strong className="bsp-chat-title">{action.conceptName}</strong>
          <p className="bsp-chat-sub">
            {model.photos.heroUrl
              ? 'Đã ghép ảnh của hai bạn vào bìa thiệp · Bấm xem toàn màn hình'
              : 'Dán ảnh cưới bằng Ctrl+V trong ô chat để ghép vào bìa thiệp'}
          </p>
        </div>
        <div className="bsp-chat-swatches" aria-label="Bảng màu thiết kế">
          {swatches.map((hex, idx) => <span key={`${hex}-${idx}`} style={{ background: hex }} title={hex} />)}
        </div>
      </div>

      {action.customDesign.customHtml ? (
        <div className="bsp-preview-live-wrap">
          <DigitalTemplateRenderer model={model} partyName="Khách Mời Danh Dự" compact />
        </div>
      ) : (
        <div className="bsp-preview-viewport" onClick={() => setModalOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setModalOpen(true)}>
          <div className="bsp-preview-inner">
            <DigitalTemplateRenderer model={model} partyName="Khách Mời Danh Dự" compact />
          </div>
          <div className="bsp-preview-fade"><span>Bấm để xem toàn bộ trang Thiệp Online ↗</span></div>
        </div>
      )}

      <div className="bsp-chat-actions">
        <button type="button" className="bsp-btn-primary" onClick={() => setModalOpen(true)}>Xem trang Thiệp Online đầy đủ</button>
        <button type="button" className="bsp-btn-accent" disabled={status === 'busy'} onClick={() => void persistInvitation(true)}>
          {status === 'busy' ? 'Đang lưu bản nháp...' : 'Thanh toán demo để lấy link'}
        </button>
        {editorUrl ? (
          <Link href={editorUrl} className="bsp-btn-secondary">Chỉnh sửa chi tiết →</Link>
        ) : (
          <button type="button" className="bsp-btn-secondary" disabled={status === 'busy'} onClick={() => void persistInvitation(false)}>Lưu nháp &amp; Chỉnh sửa</button>
        )}
        <button type="button" className="bsp-btn-ghost" onClick={() => setShowPrintForm((v) => !v)}>Đặt in mẫu này tại Xưởng</button>
      </div>

      {status === 'auth' ? (
        <div className="bsp-chat-feedback">
          <span>{message}</span>
          <Link href="/login" className="bsp-inline-link">Đăng nhập ngay →</Link>
        </div>
      ) : message ? (
        <div className={`bsp-chat-feedback ${status === 'error' ? 'is-error' : ''}`}>{message}</div>
      ) : null}

      {showPrintForm ? (
        <div className="bsp-print-form">
          <input type="text" placeholder="Tên của bạn *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input type="tel" placeholder="Số điện thoại *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          <button type="button" className="bsp-btn-primary" onClick={() => void submitCustomPrint()}>Gửi yêu cầu in thiệp giấy</button>
          {printDone ? <small>{printDone}</small> : null}
        </div>
      ) : null}

      <AssistantBespokeModal
        open={modalOpen}
        conceptName={action.conceptName}
        model={model}
        onClose={() => setModalOpen(false)}
        onCheckout={() => {
          setModalOpen(false)
          void persistInvitation(true)
        }}
        onSaveDraft={() => void persistInvitation(false)}
        busy={status === 'busy'}
        editorUrl={editorUrl}
      />
    </div>
  )
}

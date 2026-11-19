'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { buildInitialInvitationModel } from '../../features/digital-templates/digital-template-presets'
import { DigitalTemplateRenderer } from '../../features/digital-templates/digital-template-renderer'
import { AssistantBespokeModal } from './assistant-bespoke-modal'
import type { AgentBespokeDesignActionPayload } from './assistant-types'

export function AssistantBespokeCard({
  action,
  sessionPhotoUrl,
}: {
  action: AgentBespokeDesignActionPayload
  sessionPhotoUrl?: string | undefined
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'auth' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [editorUrl, setEditorUrl] = useState('')
  const [showPrintForm, setShowPrintForm] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [printDone, setPrintDone] = useState('')

  const model = useMemo(() => {
    const d = action.draftData
    const effectiveHero = d.heroUrl || sessionPhotoUrl
    return buildInitialInvitationModel({
      templateId: 'custom-ai',
      customDesign: action.customDesign,
      displayNames: d.displayNames,
      ...(d.coupleRoles ? { coupleRoles: d.coupleRoles } : {}),
      eventTitle: d.eventTitle,
      ...(d.greeting ? { greeting: d.greeting } : {}),
      ...(d.eventLocalStart ? { eventLocalStart: d.eventLocalStart } : {}),
      ...(d.lunarDate ? { lunarDate: d.lunarDate } : {}),
      ...(d.venueName ? { venueName: d.venueName } : {}),
      ...(d.venueAddress ? { venueAddress: d.venueAddress } : {}),
      ...(d.families ? { families: d.families } : {}),
      ...(d.scheduleItems ? { scheduleItems: d.scheduleItems } : {}),
      photos: { ...(effectiveHero ? { heroUrl: effectiveHero } : {}), ...(d.storyCaption ? { storyCaption: d.storyCaption } : {}) },
    })
  }, [action, sessionPhotoUrl])

  async function persistInvitation(publishNow: boolean) {
    if (status === 'busy') return
    setStatus('busy')
    setMessage('')
    try {
      const res = await fetch('/assistant/create-draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          templateId: 'custom-ai',
          customDesign: action.customDesign,
          displayNames: model.displayNames,
          coupleRoles: model.coupleRoles,
          eventTitle: model.eventTitle,
          greeting: model.greeting,
          eventLocalStart: model.eventLocalStart,
          lunarDate: model.lunarDate,
          venueName: model.venueName,
          venueAddress: model.venueAddress,
          families: model.families,
          scheduleItems: model.scheduleItems,
          photos: model.photos,
          publishNow,
        }),
      })
      if (res.status === 401) {
        setStatus('auth')
        setMessage('Đăng nhập để xuất bản thành link /i/... gửi khách hoặc lưu vào Không gian của bạn.')
        return
      }
      if (!res.ok) {
        setStatus('error')
        setMessage('Chưa lưu được thiết kế lúc này. Bạn thử lại sau vài giây nhé.')
        return
      }
      const data = (await res.json()) as { editorUrl?: string; liveUrl?: string; published?: boolean }
      if (data.editorUrl) setEditorUrl(data.editorUrl)
      if (data.liveUrl) setLiveUrl(data.liveUrl)
      setStatus('done')
      setMessage(
        data.published && data.liveUrl
          ? 'Đã xuất bản Thiệp Online độc bản thành công! Bạn có thể mở link gửi khách ngay.'
          : 'Đã lưu bản nháp vào Không gian chỉnh sửa của bạn!',
      )
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
        {liveUrl ? (
          <a href={liveUrl} target="_blank" rel="noreferrer" className="bsp-btn-accent">Mở link thiệp sống ({liveUrl}) ↗</a>
        ) : (
          <button type="button" className="bsp-btn-accent" disabled={status === 'busy'} onClick={() => void persistInvitation(true)}>
            {status === 'busy' ? 'Đang xuất bản...' : 'Xuất bản & Mở link /i/... ngay ✦'}
          </button>
        )}
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
        onPublish={() => void persistInvitation(true)}
        onSaveDraft={() => void persistInvitation(false)}
        busy={status === 'busy'}
        liveUrl={liveUrl}
        editorUrl={editorUrl}
      />
    </div>
  )
}

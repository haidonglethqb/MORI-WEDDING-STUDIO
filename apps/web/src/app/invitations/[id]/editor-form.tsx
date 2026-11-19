'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { buildInitialInvitationModel } from '../../../features/digital-templates/digital-template-presets'
import type { DigitalInvitationModel } from '../../../features/digital-templates/digital-template-types'
import { TemplateCustomizerPanel } from '../../../features/digital-templates/template-customizer-panel'
import { toInvitationContentPayload } from '../../../features/digital-templates/template-view-utils'
import { EditorTopBar, type EditorDraft } from './editor-topbar'
import { EditorPreview } from './editor-preview'
import { ReopenRsvp } from './reopen-rsvp'
import { RetireEvent } from './retire-event'
import { RevokeGuests } from './revoke-guests'
import { RotateHandle } from './rotate-handle'
import { SwitchRsvpMode } from './switch-rsvp-mode'

export type { EditorDraft } from './editor-topbar'

const publishConflictMessages: Record<string, string> = {
  'This invitation has changed': 'Bản nháp đã thay đổi. Vui lòng tải lại trang.',
  'Invitation quota is full': 'Đã đạt giới hạn thiệp đang phát hành. Hãy liên hệ Xưởng MORI để được hỗ trợ.',
  'This invitation is suspended': 'Thiệp đang tạm ngưng. Hãy liên hệ Xưởng MORI để được hỗ trợ.',
  'Set a future expiry before publishing': 'Thiệp đã hết hạn. Hãy cập nhật ngày hết hạn trước khi xuất bản.',
}

export function EditorForm({ draft }: { draft: EditorDraft }) {
  const router = useRouter()
  const [model, setModel] = useState<DigitalInvitationModel>(() => buildInitialInvitationModel(draft))
  const [version, setVersion] = useState(draft.version)
  const [slug, setSlug] = useState(draft.slug)
  const [published, setPublished] = useState(draft.published)
  const [payment, setPayment] = useState(draft.demoPayment)
  const checkoutUrl = `/checkout/invitations/${draft.invitationId}`
  const [rsvpMode, setRsvpMode] = useState(draft.rsvpMode)
  const [isDirty, setIsDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState(
    draft.published ? 'Đã xuất bản trực tuyến' : draft.demoPayment?.method
      ? 'Đã xác nhận thanh toán demo' : 'Bản nháp chưa xuất bản',
  )

  function handleModelChange(next: DigitalInvitationModel) {
    setModel(next)
    setIsDirty(true)
  }

  async function persistDraft(): Promise<EditorDraft | null> {
    setStatus('Đang lưu bản nháp...')
    const content = toInvitationContentPayload(model)
    const response = await fetch(`/invitations/${draft.invitationId}/save`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ expectedVersion: version, content }),
    })
    if (response.status === 409) {
      setStatus('Bản nháp đã thay đổi ở nơi khác. Vui lòng tải lại trang.')
      return null
    }
    if (!response.ok) {
      setStatus('Chưa lưu được thông tin. Vui lòng kiểm tra lại tên Dâu Rể & dữ liệu nhập.')
      return null
    }
    const saved = (await response.json()) as EditorDraft
    setVersion(saved.version)
    setPublished(saved.published)
    setPayment(saved.demoPayment)
    setIsDirty(false)
    setStatus(`Đã lưu thành công (Phiên bản ${saved.version})`)
    return saved
  }

  async function save() {
    if (busy) return
    setBusy(true)
    try {
      await persistDraft()
    } finally {
      setBusy(false)
    }
  }

  async function publish() {
    if (busy) return
    setBusy(true)
    try {
      let currentVersion = version
      let currentPayment = payment
      if (isDirty) {
        const saved = await persistDraft()
        if (!saved) return
        currentVersion = saved.version
        currentPayment = saved.demoPayment
      }
      if (currentPayment?.method === null) {
        router.push(checkoutUrl)
        return
      }
      setStatus('Đang xuất bản trực tuyến...')
      const response = await fetch(`/invitations/${draft.invitationId}/publish`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ expectedVersion: currentVersion }),
      })
      if (response.status === 402) {
        router.push(checkoutUrl)
        return
      }
      if (response.status === 409) {
        const { title } = (await response.json().catch(() => ({}))) as { title?: string }
        setStatus(publishConflictMessages[title ?? ''] ?? 'Chưa xuất bản được thiệp. Hãy kiểm tra cài đặt thiệp.')
        return
      }
      if (!response.ok) {
        setStatus('Chưa xuất bản được thiệp lúc này.')
        return
      }
      const next = (await response.json()) as EditorDraft
      setVersion(next.version)
      setPublished(true)
      setStatus('Đã xuất bản thiệp thành công!')
    } finally {
      setBusy(false)
    }
  }

  async function copyGuestLink() {
    const fullUrl = `${window.location.origin}/i/${slug}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setStatus(`Link mời khách: ${fullUrl}`)
    }
  }

  return (
    <section className="editor-studio-section">
      <div className="editor-card">
        <EditorTopBar
          isDirty={isDirty}
          status={status}
          busy={busy}
          published={published}
          paymentRequired={payment?.method === null}
          slug={slug}
          copied={copied}
          onSave={() => void save()}
          onPublish={() => void publish()}
          onCopyLink={() => void copyGuestLink()}
        />

        {draft.moderationState === 'SUSPENDED' ? (
          <div className="editor-suspended-banner">
            Thiệp đang tạm ngưng hiển thị{draft.moderationReason ? `: ${draft.moderationReason}` : ''}. Vui lòng liên hệ bộ phận hỗ trợ MORI Atelier.
          </div>
        ) : null}

        {published ? <RotateHandle
          invitationId={draft.invitationId}
          slug={slug}
          version={version}
          onRotated={(next) => {
            setSlug(next.slug)
            setVersion(next.version)
          }}
        /> : null}

        <div className="editor-studio-split">
          <div className="editor-studio-controls">
            <TemplateCustomizerPanel model={model} onChange={handleModelChange} />

            <details className="editor-advanced-details">
              <summary>Cài đặt nâng cao &amp; Bảo mật (Khách mời, RSVP, Kết thúc sự kiện)</summary>
              <div className="editor-advanced-body">
                <RevokeGuests invitationId={draft.invitationId} version={version} onRevoked={setVersion} />
                <SwitchRsvpMode
                  invitationId={draft.invitationId}
                  mode={rsvpMode}
                  onSwitched={() => setRsvpMode('GUEST_LIST')}
                />
                <ReopenRsvp invitationId={draft.invitationId} />
                <RetireEvent invitationId={draft.invitationId} />
              </div>
            </details>
          </div>

          <EditorPreview model={model} />
        </div>
      </div>
    </section>
  )
}

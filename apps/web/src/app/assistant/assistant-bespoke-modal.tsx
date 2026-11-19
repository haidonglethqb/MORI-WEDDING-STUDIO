'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { DigitalTemplateRenderer } from '../../features/digital-templates/digital-template-renderer'
import type { DigitalInvitationModel } from '../../features/digital-templates/digital-template-types'

interface Props {
  open: boolean
  conceptName: string
  model: DigitalInvitationModel
  onClose: () => void
  onPublish: () => void
  onSaveDraft: () => void
  busy: boolean
  liveUrl?: string
  editorUrl?: string
}

export function AssistantBespokeModal({
  open,
  conceptName,
  model,
  onClose,
  onPublish,
  onSaveDraft,
  busy,
  liveUrl,
  editorUrl,
}: Props) {
  const [viewport, setViewport] = useState<'mobile' | 'desktop'>('mobile')
  const [rsvpCount, setRsvpCount] = useState(2)
  const [rsvpSent, setRsvpSent] = useState(false)

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const mockRsvp = (
    <div className="bsp-modal-rsvp">
      <span className="bsp-modal-rsvp-tag">MÔ PHỎNG PHẢN HỒI KHÁCH MỜI (RSVP)</span>
      {rsvpSent ? (
        <div className="bsp-modal-rsvp-done">
          <strong>✓ Đã xác nhận tham dự ({rsvpCount} khách)</strong>
          <button type="button" onClick={() => setRsvpSent(false)}>
            Thử lại
          </button>
        </div>
      ) : (
        <div className="bsp-modal-rsvp-row">
          <div className="bsp-modal-rsvp-stepper">
            <button type="button" onClick={() => setRsvpCount((c) => Math.max(1, c - 1))}>-</button>
            <span>{rsvpCount} khách</span>
            <button type="button" onClick={() => setRsvpCount((c) => Math.min(8, c + 1))}>+</button>
          </div>
          <button type="button" className="bsp-btn-primary" onClick={() => setRsvpSent(true)}>
            Xác nhận tham dự
          </button>
        </div>
      )}
    </div>
  )

  return createPortal(
    <div
      className="bsp-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Xem toàn màn hình ${conceptName}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bsp-modal-shell">
        <header className="bsp-modal-bar">
          <div className="bsp-modal-title">
            <span className="bsp-ai-badge">Xem trước Thiệp Online</span>
            <strong>{conceptName}</strong>
          </div>

          <div className="bsp-viewport-switch" role="group" aria-label="Chế độ màn hình">
            <button
              type="button"
              className={viewport === 'mobile' ? 'is-active' : ''}
              onClick={() => setViewport('mobile')}
            >
              Di động
            </button>
            <button
              type="button"
              className={viewport === 'desktop' ? 'is-active' : ''}
              onClick={() => setViewport('desktop')}
            >
              Máy tính
            </button>
          </div>

          <button type="button" className="bsp-modal-close" onClick={onClose} aria-label="Đóng xem trước">
            ✕
          </button>
        </header>

        <div className="bsp-modal-scroll">
          <div className={`bsp-modal-frame is-${viewport}`}>
            <DigitalTemplateRenderer
              model={model}
              partyName="Khách Mời Danh Dự"
              rsvpSection={mockRsvp}
            />
          </div>
        </div>

        <footer className="bsp-modal-footer">
          {liveUrl ? (
            <a href={liveUrl} target="_blank" rel="noreferrer" className="bsp-btn-primary">
              Mở link Thiệp Online sống ({liveUrl}) ↗
            </a>
          ) : (
            <button type="button" className="bsp-btn-primary" disabled={busy} onClick={onPublish}>
              {busy ? 'Đang xuất bản...' : 'Xuất bản & Tạo link /i/... ngay ✦'}
            </button>
          )}
          {editorUrl ? (
            <a href={editorUrl} className="bsp-btn-secondary">
              Mở trình chỉnh sửa chi tiết →
            </a>
          ) : (
            <button type="button" className="bsp-btn-secondary" disabled={busy} onClick={onSaveDraft}>
              Lưu bản nháp để chỉnh sửa
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  )
}

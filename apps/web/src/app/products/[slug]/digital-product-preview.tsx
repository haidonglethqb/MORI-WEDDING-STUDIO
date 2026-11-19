'use client'

import { useState } from 'react'
import { buildInitialInvitationModel, TEMPLATE_DEFINITIONS, toStandardTemplateId } from '../../../features/digital-templates/digital-template-presets'
import { DigitalTemplateRenderer } from '../../../features/digital-templates/digital-template-renderer'
import type { DigitalInvitationModel } from '../../../features/digital-templates/digital-template-types'
import { TemplateCustomizerPanel } from '../../../features/digital-templates/template-customizer-panel'
import '../../../features/digital-templates/digital-templates.css'
import '../../../features/digital-templates/digital-templates-themes.css'
import '../../../features/digital-templates/template-customizer.css'
import './digital-preview.css'

interface DigitalProductPreviewProps {
  slug: string
  title: string
  accentColor?: string | undefined
}

export function DigitalProductPreview({ slug, title }: DigitalProductPreviewProps) {
  const [model, setModel] = useState<DigitalInvitationModel>(() =>
    buildInitialInvitationModel(undefined, slug),
  )
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [guestCount, setGuestCount] = useState(2)
  const [rsvpConfirmed, setRsvpConfirmed] = useState(false)
  const [copied, setCopied] = useState(false)

  const sampleLink = `https://mori.vn/i/${slug}`
  const templateMeta = TEMPLATE_DEFINITIONS[toStandardTemplateId(model.templateId)]

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(sampleLink)
    } catch {
      // Fallback visual feedback when clipboard permission is unavailable
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="digital-preview-stage">
      <div className="digital-preview-header">
        <div>
          <span className="digital-preview-badge">STUDIO THIỆP ONLINE · {title.toUpperCase()}</span>
          <p className="digital-preview-sub">Layout: {templateMeta.name}</p>
        </div>
        <div className="digital-mode-switch" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'preview'}
            className={mode === 'preview' ? 'is-active' : ''}
            onClick={() => setMode('preview')}
          >
            Xem thiệp mẫu
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'edit'}
            className={mode === 'edit' ? 'is-active' : ''}
            onClick={() => setMode('edit')}
          >
            Điền thử &amp; Config
          </button>
        </div>
      </div>

      {mode === 'edit' ? (
        <div className="digital-edit-card">
          <TemplateCustomizerPanel model={model} onChange={setModel} />
          <div className="digital-edit-footer">
            <button type="button" className="digital-apply-btn" onClick={() => setMode('preview')}>
              Xem kết quả trên thiệp ✦
            </button>
          </div>
        </div>
      ) : (
        <div className="digital-live-wrap">
          <DigitalTemplateRenderer model={model} partyName="Anh Minh & Chị Lan" compact />

          <div className="digital-share-bar">
            <span>{sampleLink}</span>
            <button type="button" onClick={() => void copyLink()}>
              {copied ? 'Đã chép ✓' : 'Sao chép link'}
            </button>
          </div>

          <div className="digital-rsvp-card">
            {rsvpConfirmed ? (
              <div>
                <strong style={{ color: '#3f4d24' }}>
                  Đã xác nhận tham dự ({guestCount} khách) ✓
                </strong>
                <div>
                  <button
                    type="button"
                    className="digital-rsvp-reset"
                    onClick={() => setRsvpConfirmed(false)}
                  >
                    Thử lại RSVP
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Mô phỏng nút Xác nhận tham dự (RSVP)</p>
                <div className="digital-rsvp-counter">
                  <button type="button" onClick={() => setGuestCount((p) => Math.max(1, p - 1))}>-</button>
                  <span>{guestCount} khách</span>
                  <button type="button" onClick={() => setGuestCount((p) => Math.min(8, p + 1))}>+</button>
                </div>
                <button type="button" className="digital-rsvp-btn" onClick={() => setRsvpConfirmed(true)}>
                  Xác nhận tham dự ({guestCount} khách)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

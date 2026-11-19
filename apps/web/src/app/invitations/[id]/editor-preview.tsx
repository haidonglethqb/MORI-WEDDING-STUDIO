'use client'

import { useState } from 'react'
import { DigitalTemplateRenderer } from '../../../features/digital-templates/digital-template-renderer'
import type { DigitalInvitationModel } from '../../../features/digital-templates/digital-template-types'

export function EditorPreview({ model }: { model: DigitalInvitationModel }) {
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile')

  return (
    <div className="editor-studio-preview">
      <div className="editor-preview-bar">
        <span>Xem trước trực tiếp</span>
        <div className="editor-viewport-switch" role="group" aria-label="Chế độ màn hình">
          <button type="button" className={previewMode === 'mobile' ? 'is-active' : ''} onClick={() => setPreviewMode('mobile')}>
            Di động
          </button>
          <button type="button" className={previewMode === 'desktop' ? 'is-active' : ''} onClick={() => setPreviewMode('desktop')}>
            Máy tính
          </button>
        </div>
      </div>
      <div className={`editor-preview-frame is-${previewMode}`}>
        <DigitalTemplateRenderer model={model} compact />
      </div>
    </div>
  )
}

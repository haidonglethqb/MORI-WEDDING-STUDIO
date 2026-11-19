'use client'

import { BespokeDesignBlueprintSchema, InvitationContentSchema, InvitationPhotosSchema } from '@mori/contracts'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { buildBespokePreviewModel } from '../../../features/digital-templates/bespoke-preview-model'
import type { AdminProposedActionItem } from './admin-ai-types'
import './admin-bespoke-preview.css'

const DigitalTemplateRenderer = dynamic(
  () => import('../../../features/digital-templates/digital-template-renderer').then((m) => m.DigitalTemplateRenderer),
  { loading: () => <p role="status">Đang tải bản xem trước…</p> },
)

const designSchema = BespokeDesignBlueprintSchema.omit({ customHtml: true, customCss: true }).strip()
const draftSchema = InvitationContentSchema.pick({
  displayNames: true,
  coupleRoles: true,
  eventTitle: true,
  greeting: true,
  eventLocalStart: true,
  lunarDate: true,
  venueName: true,
  venueAddress: true,
  families: true,
  scheduleItems: true,
}).extend({ storyCaption: InvitationPhotosSchema.shape.storyCaption }).strip()

export function AdminBespokePreview({ action }: { action: AdminProposedActionItem }) {
  const [open, setOpen] = useState(false)

  return (
    <details className="admin-bespoke-preview" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Xem trước mẫu thiệp online</summary>
      {open ? <BespokePreviewContent action={action} /> : null}
    </details>
  )
}

function BespokePreviewContent({ action }: { action: AdminProposedActionItem }) {
  const design = designSchema.safeParse(action.customDesign)
  const draft = draftSchema.safeParse(action.draftData)
  if (!design.success || !draft.success) {
    return <p>Phiên này thiếu dữ liệu để hiển thị bản xem trước.</p>
  }

  const photo = InvitationPhotosSchema.safeParse({ heroUrl: action.draftData?.heroUrl })
  const heroUrl = photo.success ? photo.data.heroUrl : undefined
  const safeHero = heroUrl?.startsWith('data:image/') ? heroUrl : undefined
  const model = buildBespokePreviewModel(design.data, { ...draft.data, heroUrl: safeHero })

  return (
    <div className="admin-bespoke-preview-frame">
      <DigitalTemplateRenderer
        compact
        model={{ ...model, templateConfig: { ...model.templateConfig, showAudio: false, showMapButton: false } }}
      />
    </div>
  )
}

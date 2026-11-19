'use client'

import Link from 'next/link'
import { useState } from 'react'
import { addToCart, openCartDrawer, readSelectedFont } from '../../features/cart/cart-store'
import { DIGITAL_CATALOG_ITEMS, formatVnd } from '../../features/cart/cart-types'
import {
  buildInitialInvitationModel,
  resolvePalette,
  resolveTemplatePresetBySlug,
  TEMPLATE_DEFINITIONS,
  toStandardTemplateId,
} from '../../features/digital-templates/digital-template-presets'
import type { DigitalInvitationModel, StandardTemplateId } from '../../features/digital-templates/digital-template-types'
import type { CollectionItem } from './collection-types'
import { OnlineLiveStudio } from './online-live-studio'

interface OnlineInvitationsSectionProps {
  items: CollectionItem[]
}

const DEFAULT_SLUG_FOR_TEMPLATE: Record<StandardTemplateId, string> = {
  'editorial-vogue': 'editorial-digital-01',
  'heritage-palace': 'traditional-digital-01',
  'botanical-zen': 'floral-digital-01',
}

export function OnlineInvitationsSection({ items }: OnlineInvitationsSectionProps) {
  const cards = DIGITAL_CATALOG_ITEMS.map((meta) => {
    const matched = items.find((item) => item.slug === meta.slug)
    const unitAmountVnd =
      matched?.minPriceVnd && Number(matched.minPriceVnd) > 0
        ? Number(matched.minPriceVnd)
        : meta.unitAmountVnd
    const preset = resolveTemplatePresetBySlug(meta.slug)
    const palette = resolvePalette(preset.templateId, preset.paletteId)
    const templateName = TEMPLATE_DEFINITIONS[preset.templateId].name
    return {
      ...meta,
      title: matched?.curatedTitle ?? meta.name,
      description: matched?.curatedDesc ?? meta.description,
      unitAmountVnd,
      preset,
      palette,
      templateName,
    }
  })

  const [studioModel, setStudioModel] = useState<DigitalInvitationModel>(() =>
    buildInitialInvitationModel(undefined, 'editorial-digital-01'),
  )

  function handleAddDigital(card: (typeof cards)[number]) {
    const selectedFont = readSelectedFont()
    addToCart({
      slug: card.slug,
      name: card.title,
      productType: 'DIGITAL',
      shape: 'DIGITAL',
      quantity: 1,
      unitAmountVnd: card.unitAmountVnd,
      imageUrl: null,
      fontCode: selectedFont?.code,
    })
    openCartDrawer()
  }

  function loadIntoStudio(slug: string) {
    setStudioModel((prev) => ({
      ...buildInitialInvitationModel(
        {
          displayNames: prev.displayNames,
          coupleRoles: prev.coupleRoles,
          eventTitle: prev.eventTitle,
          greeting: prev.greeting,
          eventLocalStart: prev.eventLocalStart,
          lunarDate: prev.lunarDate,
          venueName: prev.venueName,
          venueAddress: prev.venueAddress,
          families: prev.families,
          scheduleItems: prev.scheduleItems,
          photos: prev.photos,
        },
        slug,
      ),
    }))
    document.getElementById('studio-thiep-online')?.scrollIntoView({ behavior: 'smooth' })
  }

  const activeCard =
    cards.find((c) => c.preset.templateId === studioModel.templateId && c.preset.paletteId === studioModel.templateConfig.paletteId) ??
    cards.find((c) => c.slug === DEFAULT_SLUG_FOR_TEMPLATE[toStandardTemplateId(studioModel.templateId)]) ??
    cards[0]

  return (
    <section className="group-section-wrap" id="thiep-online">
      <div className="group-section-head">
        <span className="group-eyebrow">Nhóm 2 · Thiệp online (399.000 ₫ – 599.000 ₫)</span>
        <h2>Thiệp cưới Online — 3 Bản Thiết Kế Độc Quyền &amp; Tùy Chỉnh Trực Tiếp</h2>
        <p className="group-section-desc">
          Mỗi mẫu thiệp được thiết kế logic theo 3 phong cách (Editorial Vogue, Song Hỷ Hoàng Gia, Botanical Wabi-Sabi) với đầy đủ gia phả hai họ, lịch Âm – Dương, album ảnh cưới, bản đồ và RSVP.
        </p>
      </div>

      <div className="online-grid">
        {cards.map((card) => (
          <article key={card.slug} className="online-card">
            <div className="online-card-screen" style={{ background: card.palette.bg }}>
              <div
                className="online-phone-mock"
                style={{
                  background: card.palette.surface,
                  borderColor: card.palette.border,
                  color: card.palette.text,
                }}
              >
                <span className="online-phone-tag" style={{ color: card.palette.accent }}>
                  {card.badgeLabel} · {card.templateName}
                </span>
                <h4 style={{ color: card.palette.text }}>{card.title}</h4>
                <p style={{ color: card.palette.muted }}>Gia đình · Lịch Âm · Album · RSVP</p>
                <div className="online-phone-pills">
                  <span>Ảnh cưới</span>
                  <span>Lịch trình</span>
                  <span>Google Maps</span>
                </div>
              </div>
            </div>
            <div className="online-card-body">
              <span className="spec-type-pill">{card.styleLabel}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <div className="online-price-row">
                <span className="price-lead-label">Trọn gói website</span>
                <strong>{formatVnd(card.unitAmountVnd)}</strong>
              </div>
              <div className="online-card-actions">
                <button
                  type="button"
                  className="online-btn-demo"
                  onClick={() => loadIntoStudio(card.slug)}
                >
                  Thử thiết kế mẫu
                </button>
                <button
                  type="button"
                  className="online-btn-add"
                  onClick={() => handleAddDigital(card)}
                >
                  Thêm vào giỏ
                </button>
              </div>
              <Link href={`/products/${card.slug}`} className="online-detail-link">
                Xem chi tiết gói &amp; thông số →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {activeCard ? (
        <OnlineLiveStudio
          model={studioModel}
          onChange={setStudioModel}
          matchedCard={activeCard}
          onAddMatchedToCart={() => handleAddDigital(activeCard)}
        />
      ) : null}
    </section>
  )
}

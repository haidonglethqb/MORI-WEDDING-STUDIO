'use client'

import type { CSSProperties } from 'react'
import type { BespokeDesignBlueprint, BespokeSectionKey } from '@mori/contracts'
import type { DigitalInvitationModel } from './digital-template-types'
import { TemplateCountdown, TemplateUtilityRow } from './template-actions-bar'
import {
  BespokeCoupleBioSection,
  BespokeDressCodeSection,
  BespokeFrameDecor,
  BespokeGiftNoteSection,
  BespokeHeroSection,
  BespokeOrnament,
  BespokeStorySection,
} from './template-custom-ai-blocks'
import { TemplateCustomAiCanvas } from './template-custom-ai-canvas'
import { parseEventDate, resolveGoogleMapsHref } from './template-view-utils'

interface Props {
  model: DigitalInvitationModel
  design: BespokeDesignBlueprint
  partyName?: string | null | undefined
  calendarHref?: string | undefined
  compact?: boolean | undefined
}

function buildBespokeThemeVars(design: BespokeDesignBlueprint): CSSProperties {
  return {
    '--tpl-bg': design.theme.bg,
    '--tpl-bg-accent': design.theme.bgAccent ?? design.theme.bg,
    '--tpl-surface': design.theme.surface,
    '--tpl-text': design.theme.text,
    '--tpl-muted': design.theme.muted,
    '--tpl-accent': design.theme.accent,
    '--tpl-border': design.theme.border,
    '--tpl-btn-text': design.theme.buttonText,
  } as CSSProperties
}

export function TemplateCustomAi({ model, design, partyName, calendarHref, compact }: Props) {
  if (design.customHtml && design.customHtml.trim().length > 20) {
    return (
      <TemplateCustomAiCanvas
        model={model}
        design={design}
        calendarHref={calendarHref}
        compact={compact}
      />
    )
  }

  const { templateConfig: cfg, photos, families } = model
  const parsedDate = parseEventDate(model.eventLocalStart)
  const mapHref = resolveGoogleMapsHref(model.mapUrl, model.venueName, model.venueAddress)

  function renderSection(key: BespokeSectionKey, idx: number) {
    if (key === 'hero') {
      return (
        <div key={`${key}-${idx}`} className="bsp-section-wrap">
          <BespokeHeroSection model={model} design={design} partyName={partyName} dateShort={parsedDate?.shortDotDate} />
          <BespokeOrnament ornament={design.ornament} names={model.displayNames} />
          {model.greeting ? <blockquote className="bsp-greeting">&ldquo;{model.greeting}&rdquo;</blockquote> : null}
        </div>
      )
    }

    if (key === 'couple-bio' && design.coupleBio) {
      return <BespokeCoupleBioSection key={`${key}-${idx}`} names={model.displayNames} bio={design.coupleBio} />
    }

    if (key === 'story' && design.storyMilestones?.length) {
      return <BespokeStorySection key={`${key}-${idx}`} milestones={design.storyMilestones} />
    }

    if (key === 'families' && cfg.showFamilies && (families.groomParents || families.brideParents)) {
      return (
        <section key={`${key}-${idx}`} className="bsp-editorial-band bsp-families-spread">
          {families.groomParents ? (
            <div className="bsp-family-col">
              <span className="tpl-micro-label">NHÀ TRAI</span>
              <p>{families.groomParents}</p>
              {families.groomOrigin ? <small>{families.groomOrigin}</small> : null}
            </div>
          ) : null}
          {families.brideParents ? (
            <div className="bsp-family-col">
              <span className="tpl-micro-label">NHÀ GÁI</span>
              <p>{families.brideParents}</p>
              {families.brideOrigin ? <small>{families.brideOrigin}</small> : null}
            </div>
          ) : null}
        </section>
      )
    }

    if (key === 'event-card') {
      const hasVenue = Boolean(model.venueName || model.venueAddress)
      const hasAnyEventInfo = Boolean(parsedDate || model.lunarDate || model.scheduleItems.length > 0 || hasVenue)
      return (
        <section key={`${key}-${idx}`} className="bsp-event-centerpiece">
          <span className="tpl-micro-label">THỜI GIAN &amp; ĐỊA ĐIỂM</span>
          {parsedDate ? (
            <div className="bsp-date-lockup">
              <span>THÁNG {String(parsedDate.month).padStart(2, '0')}</span>
              <strong>{String(parsedDate.day).padStart(2, '0')}</strong>
              <span>{parsedDate.year} · {parsedDate.hour}:{parsedDate.minute}</span>
            </div>
          ) : null}
          {cfg.showLunarDate && model.lunarDate ? <p className="tpl-lunar-sub">({model.lunarDate})</p> : null}
          {cfg.showSchedule && model.scheduleItems.length > 0 ? (
            <div className="bsp-schedule-rail">
              {model.scheduleItems.map((item, sIdx) => (
                <div key={`${item.time}-${sIdx}`} className="bsp-schedule-item">
                  <strong>{item.time}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ) : null}
          {hasVenue ? (
            <div className="bsp-venue-box">
              {model.venueName ? <strong>{model.venueName}</strong> : null}
              {model.venueAddress ? <address>{model.venueAddress}</address> : null}
            </div>
          ) : null}
          {!hasAnyEventInfo ? (
            <p className="bsp-empty-hint">Nhắn ngày cưới &amp; địa điểm cho trợ lý để điền tự động vào phần này.</p>
          ) : null}
        </section>
      )
    }

    if (key === 'dress-code' && design.dressCode) {
      return <BespokeDressCodeSection key={`${key}-${idx}`} dressCode={design.dressCode} />
    }

    if (key === 'gallery' && cfg.showGallery && photos.galleryUrls.length > 0) {
      return (
        <section key={`${key}-${idx}`} className="tpl-gallery-section">
          <span className="tpl-micro-label">KHOẢNH KHẮC</span>
          <div className={`tpl-gallery-grid count-${Math.min(3, photos.galleryUrls.length)}`}>
            {photos.galleryUrls.slice(0, 3).map((url, gIdx) => (
              <div key={`${gIdx}-${url.slice(0, 20)}`} className="tpl-gallery-tile">
                <img src={url} alt={`Ảnh cưới ${gIdx + 1}`} />
              </div>
            ))}
          </div>
          {photos.storyCaption ? <p className="tpl-story-caption">{photos.storyCaption}</p> : null}
        </section>
      )
    }

    if (key === 'countdown' && cfg.showCountdown && parsedDate) {
      return <TemplateCountdown key={`${key}-${idx}`} targetMs={parsedDate.targetMs} variant="vogue" />
    }

    if (key === 'gift-note' && design.giftNote) {
      return <BespokeGiftNoteSection key={`${key}-${idx}`} giftNote={design.giftNote} />
    }

    return null
  }

  return (
    <article
      className={`mori-tpl mori-tpl-bespoke typo-${design.typography} bframe-${design.frameStyle} pattern-${design.bgPattern}`}
      style={buildBespokeThemeVars(design)}
    >
      <div className="tpl-inner-border" aria-hidden="true" />
      <BespokeFrameDecor frameStyle={design.frameStyle} dateShort={parsedDate?.shortDotDate} />
      <div className="bsp-content-stack">
        {design.sectionOrder.map((key, idx) => renderSection(key, idx))}
        <TemplateUtilityRow
          showMapButton={cfg.showMapButton && Boolean(model.venueName || model.venueAddress || model.mapUrl)}
          mapHref={mapHref}
          calendarHref={calendarHref}
          showAudio={cfg.showAudio}
        />
      </div>
      <footer className="bsp-quiet-sign">
        <span>{model.displayNames[0]} &amp; {model.displayNames[1]}</span>
      </footer>
    </article>
  )
}

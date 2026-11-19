'use client'

import type { CSSProperties } from 'react'
import type { BespokeDesignBlueprint, BespokeSectionKey } from '@mori/contracts'
import type { DigitalInvitationModel } from './digital-template-types'
import { TemplateCountdown, TemplateUtilityRow } from './template-actions-bar'
import {
  BespokeCoupleBioSection,
  BespokeDressCodeSection,
  BespokeGiftNoteSection,
  BespokeHeroSection,
  BespokeOrnament,
  BespokeStorySection,
} from './template-custom-ai-blocks'
import { parseEventDate, resolveGoogleMapsHref } from './template-view-utils'

interface Props {
  model: DigitalInvitationModel
  design: BespokeDesignBlueprint
  partyName?: string | null | undefined
  calendarHref?: string | undefined
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

export function TemplateCustomAi({ model, design, partyName, calendarHref }: Props) {
  const { templateConfig: cfg, photos, families } = model
  const parsedDate = parseEventDate(model.eventLocalStart)
  const mapHref = resolveGoogleMapsHref(model.mapUrl, model.venueName, model.venueAddress)

  function renderSection(key: BespokeSectionKey, idx: number) {
    if (key === 'hero') {
      return (
        <div key={`${key}-${idx}`} className="bsp-section-wrap">
          <BespokeHeroSection
            model={model}
            design={design}
            partyName={partyName}
            dateShort={parsedDate?.shortDotDate}
          />
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

    if (key === 'families' && cfg.showFamilies) {
      return (
        <section key={`${key}-${idx}`} className="bsp-card-block bsp-families-grid">
          <div className="bsp-family-col">
            <span className="tpl-micro-label">NHÀ TRAI</span>
            <p>{families.groomParents}</p>
            {families.groomOrigin ? <small>{families.groomOrigin}</small> : null}
          </div>
          <div className="bsp-family-col">
            <span className="tpl-micro-label">NHÀ GÁI</span>
            <p>{families.brideParents}</p>
            {families.brideOrigin ? <small>{families.brideOrigin}</small> : null}
          </div>
        </section>
      )
    }

    if (key === 'event-card') {
      return (
        <section key={`${key}-${idx}`} className="bsp-card-block bsp-event-block">
          <span className="tpl-micro-label">THỜI GIAN &amp; ĐỊA ĐIỂM</span>
          {parsedDate ? (
            <div className="bsp-event-date">
              {parsedDate.viDateLine} · {parsedDate.hour}:{parsedDate.minute}
            </div>
          ) : null}
          {cfg.showLunarDate && model.lunarDate ? <p className="tpl-lunar-sub">({model.lunarDate})</p> : null}
          {cfg.showSchedule && model.scheduleItems.length > 0 ? (
            <div className="bsp-schedule-row">
              {model.scheduleItems.map((item, sIdx) => (
                <div key={`${item.time}-${sIdx}`} className="bsp-schedule-slot">
                  <strong>{item.time}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="bsp-venue-box">
            <strong>{model.venueName}</strong>
            <address>{model.venueAddress}</address>
          </div>
        </section>
      )
    }

    if (key === 'dress-code' && design.dressCode) {
      return <BespokeDressCodeSection key={`${key}-${idx}`} dressCode={design.dressCode} />
    }

    if (key === 'gallery' && cfg.showGallery && photos.galleryUrls.length > 0) {
      return (
        <section key={`${key}-${idx}`} className="tpl-gallery-section">
          <span className="tpl-micro-label">ALBUM KHOẢNH KHẮC</span>
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
      <div className="bsp-content-stack">
        {design.sectionOrder.map((key, idx) => renderSection(key, idx))}
        <TemplateUtilityRow
          showMapButton={cfg.showMapButton}
          mapHref={mapHref}
          calendarHref={calendarHref}
          showAudio={cfg.showAudio}
        />
      </div>
      <footer className="tpl-footer-sign">
        ✦ {design.conceptName.toUpperCase()} · MORI BESPOKE AI ✦
      </footer>
    </article>
  )
}

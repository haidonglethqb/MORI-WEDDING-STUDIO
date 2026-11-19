'use client'

import type { DigitalInvitationModel, PalettePreset } from './digital-template-types'
import { TemplateCountdown, TemplateUtilityRow } from './template-actions-bar'
import { buildPaletteVars, coupleInitials, parseEventDate, resolveGoogleMapsHref } from './template-view-utils'

interface Props {
  model: DigitalInvitationModel
  palette: PalettePreset
  partyName?: string | null | undefined
  calendarHref?: string | undefined
}

export function TemplateEditorialVogue({ model, palette, partyName, calendarHref }: Props) {
  const { templateConfig: cfg, photos, families } = model
  const parsedDate = parseEventDate(model.eventLocalStart)
  const mapHref = resolveGoogleMapsHref(model.mapUrl, model.venueName, model.venueAddress)
  const initials = coupleInitials(model.displayNames)

  return (
    <article
      className={`mori-tpl mori-tpl-vogue frame-${cfg.frameStyle}`}
      style={buildPaletteVars(palette)}
    >
      <div className="tpl-inner-border" aria-hidden="true" />

      <header className="vogue-masthead">
        <span className="tpl-eyebrow">PARIS ATELIER · ÉDITION SPÉCIALE</span>
        {parsedDate ? <div className="vogue-roman">{parsedDate.romanDateLine}</div> : null}
      </header>

      {partyName ? (
        <div className="tpl-guest-pill">
          <span>Trân trọng kính mời:</span> <strong>{partyName}</strong>
        </div>
      ) : null}

      {photos.heroUrl ? (
        <figure className="vogue-hero-frame">
          <img src={photos.heroUrl} alt={`${model.displayNames[0]} & ${model.displayNames[1]}`} />
        </figure>
      ) : null}

      <section className="vogue-couple-hero">
        <span className="tpl-eyebrow">THE WEDDING CELEBRATION OF</span>
        <h1 className="vogue-couple-names">
          <span className="vogue-person">
            <small>{model.coupleRoles[0]}</small>
            <strong>{model.displayNames[0]}</strong>
          </span>
          <span className="vogue-amp">&amp;</span>
          <span className="vogue-person">
            <small>{model.coupleRoles[1]}</small>
            <strong>{model.displayNames[1]}</strong>
          </span>
        </h1>
        <p className="vogue-event-title">{model.eventTitle}</p>
      </section>

      <div className="vogue-sash" aria-hidden="true">
        <div className="vogue-seal">
          {cfg.motifStyle === 'monogram' ? initials : cfg.motifStyle === 'roman-crest' ? 'XII' : '⚜'}
        </div>
      </div>

      {model.greeting ? (
        <blockquote className="vogue-quote">&ldquo;{model.greeting}&rdquo;</blockquote>
      ) : null}

      {cfg.showFamilies ? (
        <section className="vogue-families">
          <div className="vogue-family-col">
            <span className="tpl-micro-label">NHÀ TRAI</span>
            <p>{families.groomParents}</p>
            {families.groomOrigin ? <small>{families.groomOrigin}</small> : null}
          </div>
          <div className="vogue-family-rule" aria-hidden="true" />
          <div className="vogue-family-col">
            <span className="tpl-micro-label">NHÀ GÁI</span>
            <p>{families.brideParents}</p>
            {families.brideOrigin ? <small>{families.brideOrigin}</small> : null}
          </div>
        </section>
      ) : null}

      <section className="vogue-ceremony-card">
        {parsedDate ? (
          <div className="vogue-date-headline">
            {parsedDate.viDateLine} · {parsedDate.hour}:{parsedDate.minute}
          </div>
        ) : null}
        {cfg.showLunarDate && model.lunarDate ? (
          <p className="tpl-lunar-sub">({model.lunarDate})</p>
        ) : null}

        {cfg.showSchedule && model.scheduleItems.length > 0 ? (
          <div className="vogue-timeline">
            {model.scheduleItems.map((item, idx) => (
              <div key={`${item.time}-${idx}`} className="vogue-slot">
                <strong>{item.time}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="vogue-venue">
          <strong>{model.venueName}</strong>
          <address>{model.venueAddress}</address>
        </div>
      </section>

      {cfg.showGallery && photos.galleryUrls.length > 0 ? (
        <section className="tpl-gallery-section">
          <span className="tpl-micro-label">ALBUM KHOẢNH KHẮC</span>
          <div className={`tpl-gallery-grid count-${Math.min(3, photos.galleryUrls.length)}`}>
            {photos.galleryUrls.slice(0, 3).map((url, idx) => (
              <div key={`${idx}-${url.slice(0, 24)}`} className="tpl-gallery-tile">
                <img src={url} alt={`Ảnh cưới ${idx + 1}`} />
              </div>
            ))}
          </div>
          {photos.storyCaption ? <p className="tpl-story-caption">{photos.storyCaption}</p> : null}
        </section>
      ) : null}

      {cfg.showCountdown && parsedDate ? (
        <TemplateCountdown targetMs={parsedDate.targetMs} variant="vogue" />
      ) : null}

      <TemplateUtilityRow
        showMapButton={cfg.showMapButton}
        mapHref={mapHref}
        calendarHref={calendarHref}
        showAudio={cfg.showAudio}
      />

      <footer className="tpl-footer-sign">
        ✦ MORI ATELIER · HAUTE PAPETERIE VOGUE ✦
      </footer>
    </article>
  )
}

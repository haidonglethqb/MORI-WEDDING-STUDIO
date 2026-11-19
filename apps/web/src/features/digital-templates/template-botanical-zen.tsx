'use client'

import type { DigitalInvitationModel, PalettePreset } from './digital-template-types'
import { TemplateCountdown, TemplateUtilityRow } from './template-actions-bar'
import { buildPaletteVars, parseEventDate, resolveGoogleMapsHref } from './template-view-utils'

interface Props {
  model: DigitalInvitationModel
  palette: PalettePreset
  partyName?: string | null | undefined
  calendarHref?: string | undefined
}

export function TemplateBotanicalZen({ model, palette, partyName, calendarHref }: Props) {
  const { templateConfig: cfg, photos, families } = model
  const parsedDate = parseEventDate(model.eventLocalStart)
  const mapHref = resolveGoogleMapsHref(model.mapUrl, model.venueName, model.venueAddress)

  return (
    <article
      className={`mori-tpl mori-tpl-botanical frame-${cfg.frameStyle}`}
      style={buildPaletteVars(palette)}
    >
      <div className="tpl-inner-border" aria-hidden="true" />

      <header className="botanical-head">
        {cfg.motifStyle === 'zen-enso' ? (
          <div className="botanical-enso-wrap" aria-hidden="true">
            <span className="botanical-enso" />
            <span className="botanical-hanko">森</span>
          </div>
        ) : (
          <svg className="botanical-twig" viewBox="0 0 120 26" fill="none" aria-hidden="true">
            <path d="M6 19C34 5 64 23 92 9C106 4 114 14 117 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="32" cy="10" r="2.6" fill="currentColor" />
            <circle cx="65" cy="17" r="2.6" fill="currentColor" />
            <circle cx="95" cy="9" r="2.6" fill="currentColor" />
          </svg>
        )}
        <span className="tpl-eyebrow">
          {cfg.motifStyle === 'zen-enso' ? 'WABI-SABI ATELIER · THUẦN KHIẾT' : 'JARDIN BOTANIQUE · SAVE THE DATE'}
        </span>
      </header>

      {partyName ? (
        <div className="tpl-guest-pill">
          <span>Kính mời:</span> <strong>{partyName}</strong>
        </div>
      ) : null}

      {photos.heroUrl ? (
        <figure className="botanical-polaroid">
          <img src={photos.heroUrl} alt={`${model.displayNames[0]} & ${model.displayNames[1]}`} />
          <figcaption>{parsedDate ? parsedDate.shortDotDate : 'SAVE THE DATE'}</figcaption>
        </figure>
      ) : null}

      <section className="botanical-couple">
        <h1 className="botanical-names">
          <span>{model.displayNames[0]}</span>
          <span className="botanical-amp">
            {cfg.motifStyle === 'zen-enso' ? '和' : '&'}
          </span>
          <span>{model.displayNames[1]}</span>
        </h1>
        <div className="botanical-roles">
          <span>{model.coupleRoles[0]}</span>
          <span>·</span>
          <span>{model.coupleRoles[1]}</span>
        </div>
        <p className="botanical-event">{model.eventTitle}</p>
      </section>

      {cfg.showGallery ? (
        <section className="botanical-story">
          <span className="tpl-micro-label">HÀNH TRÌNH YÊU THƯƠNG</span>
          {photos.storyCaption ? <p className="tpl-story-caption">{photos.storyCaption}</p> : null}
          {photos.galleryUrls.length > 0 ? (
            <div className={`tpl-gallery-grid count-${Math.min(3, photos.galleryUrls.length)}`}>
              {photos.galleryUrls.slice(0, 3).map((url, idx) => (
                <div key={`${idx}-${url.slice(0, 24)}`} className="tpl-gallery-tile">
                  <img src={url} alt={`Khoảnh khắc ${idx + 1}`} />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {cfg.showFamilies ? (
        <section className="botanical-families">
          <div>
            <span className="tpl-micro-label">NHÀ TRAI</span>
            <p>{families.groomParents}</p>
            {families.groomOrigin ? <small>{families.groomOrigin}</small> : null}
          </div>
          <div className="botanical-fam-sep" aria-hidden="true">❀</div>
          <div>
            <span className="tpl-micro-label">NHÀ GÁI</span>
            <p>{families.brideParents}</p>
            {families.brideOrigin ? <small>{families.brideOrigin}</small> : null}
          </div>
        </section>
      ) : null}

      <section className="botanical-card">
        {parsedDate ? (
          <div className="botanical-date-row">
            <strong>{parsedDate.viDateLine}</strong>
            <span>Lúc {parsedDate.hour}:{parsedDate.minute}</span>
          </div>
        ) : null}
        {cfg.showLunarDate && model.lunarDate ? (
          <p className="tpl-lunar-sub">({model.lunarDate})</p>
        ) : null}

        {cfg.showSchedule && model.scheduleItems.length > 0 ? (
          <div className="botanical-timeline">
            {model.scheduleItems.map((item, idx) => (
              <div key={`${item.time}-${idx}`} className="botanical-slot">
                <strong>{item.time}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="botanical-venue">
          <strong>{model.venueName}</strong>
          <address>{model.venueAddress}</address>
        </div>
      </section>

      {model.greeting ? (
        <blockquote className="botanical-quote">&ldquo;{model.greeting}&rdquo;</blockquote>
      ) : null}

      {cfg.showCountdown && parsedDate ? (
        <TemplateCountdown targetMs={parsedDate.targetMs} variant="botanical" />
      ) : null}

      <TemplateUtilityRow
        showMapButton={cfg.showMapButton}
        mapHref={mapHref}
        calendarHref={calendarHref}
        showAudio={cfg.showAudio}
      />

      <footer className="tpl-footer-sign">
        ✦ MORI BOTANICAL &amp; WABI-SABI ATELIER ✦
      </footer>
    </article>
  )
}

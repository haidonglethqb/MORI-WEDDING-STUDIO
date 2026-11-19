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

export function TemplateHeritagePalace({ model, palette, partyName, calendarHref }: Props) {
  const { templateConfig: cfg, photos, families } = model
  const parsedDate = parseEventDate(model.eventLocalStart)
  const mapHref = resolveGoogleMapsHref(model.mapUrl, model.venueName, model.venueAddress)
  const emblem = cfg.motifStyle === 'golden-lotus' ? '❀' : cfg.motifStyle === 'royal-knot' ? '✤' : '囍'

  return (
    <article
      className={`mori-tpl mori-tpl-palace frame-${cfg.frameStyle}`}
      style={buildPaletteVars(palette)}
    >
      <div className="palace-corner tl" aria-hidden="true" />
      <div className="palace-corner tr" aria-hidden="true" />
      <div className="palace-corner bl" aria-hidden="true" />
      <div className="palace-corner br" aria-hidden="true" />
      <div className="tpl-inner-border" aria-hidden="true" />

      <header className="palace-crest">
        <div className="palace-emblem">{emblem}</div>
        <span className="tpl-eyebrow">HOÀNG GIA ĐẠI LỄ · KIM NGỌC MÃN ĐƯỜNG</span>
      </header>

      {partyName ? (
        <div className="tpl-guest-pill">
          <span>Trân trọng kính mời:</span> <strong>{partyName}</strong>
        </div>
      ) : null}

      {cfg.showFamilies ? (
        <section className="palace-families">
          <div className="palace-family-box">
            <span className="tpl-micro-label">NHÀ TRAI</span>
            <strong>{families.groomParents}</strong>
            {families.groomOrigin ? <small>{families.groomOrigin}</small> : null}
          </div>
          <div className="palace-family-seal" aria-hidden="true">✤</div>
          <div className="palace-family-box">
            <span className="tpl-micro-label">NHÀ GÁI</span>
            <strong>{families.brideParents}</strong>
            {families.brideOrigin ? <small>{families.brideOrigin}</small> : null}
          </div>
        </section>
      ) : null}

      <p className="palace-announce">Trân trọng báo tin Lễ Thành Hôn của hai con chúng tôi</p>

      <section className="palace-couple">
        <div className="palace-person">
          <span className="tpl-micro-label">{model.coupleRoles[0]}</span>
          <h1>{model.displayNames[0]}</h1>
        </div>
        <div className="palace-knot">✦ KẾT TÓC GIAO DUYÊN ✦</div>
        <div className="palace-person">
          <span className="tpl-micro-label">{model.coupleRoles[1]}</span>
          <h1>{model.displayNames[1]}</h1>
        </div>
        <p className="palace-event-title">{model.eventTitle}</p>
      </section>

      {photos.heroUrl ? (
        <figure className="palace-hero-photo">
          <img src={photos.heroUrl} alt={`${model.displayNames[0]} & ${model.displayNames[1]}`} />
        </figure>
      ) : null}

      <section className="palace-auspicious-card">
        <span className="palace-ribbon">HOÀNG ĐẠO CÁT NHẬT</span>
        {parsedDate ? (
          <div className="palace-solar">{parsedDate.viDateLine} · {parsedDate.hour}:{parsedDate.minute}</div>
        ) : null}
        {cfg.showLunarDate && model.lunarDate ? (
          <div className="palace-lunar">({model.lunarDate})</div>
        ) : null}

        {cfg.showSchedule && model.scheduleItems.length > 0 ? (
          <div className="palace-timeline">
            {model.scheduleItems.map((item, idx) => (
              <div key={`${item.time}-${idx}`} className="palace-slot">
                <strong>{item.time}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="palace-venue">
          <strong>{model.venueName}</strong>
          <address>{model.venueAddress}</address>
        </div>
      </section>

      {cfg.showGallery && photos.galleryUrls.length > 0 ? (
        <section className="tpl-gallery-section">
          <span className="tpl-micro-label">KỶ NIỆM SONG HỶ</span>
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

      {model.greeting ? (
        <blockquote className="palace-blessing">&ldquo;{model.greeting}&rdquo;</blockquote>
      ) : null}

      {cfg.showCountdown && parsedDate ? (
        <TemplateCountdown targetMs={parsedDate.targetMs} variant="palace" />
      ) : null}

      <TemplateUtilityRow
        showMapButton={cfg.showMapButton}
        mapHref={mapHref}
        calendarHref={calendarHref}
        showAudio={cfg.showAudio}
      />

      <footer className="tpl-footer-sign">
        囍 BÁCH NIÊN GIAI LÃO · PHỤNG VŨ NGHINH XUÂN 囍
      </footer>
    </article>
  )
}

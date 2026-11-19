'use client'

import type { BespokeDesignBlueprint } from '@mori/contracts'
import type { DigitalInvitationModel } from './digital-template-types'
import { coupleInitials } from './template-view-utils'

function cleanEyebrow(raw: string | undefined): string {
  const txt = (raw ?? '').trim()
  return !txt || /\b(mori|bespoke|ai)\b/i.test(txt) ? 'TRÂN TRỌNG KÍNH MỜI' : txt
}

export function BespokeFrameDecor({ frameStyle, dateShort }: { frameStyle: BespokeDesignBlueprint['frameStyle']; dateShort?: string | undefined }) {
  if (frameStyle === 'imperial-corner') {
    const cornerSvg = (
      <svg viewBox="0 0 36 36" width="32" height="32" fill="none" aria-hidden="true">
        <path d="M2 34V6C2 3.8 3.8 2 6 2H34" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 28V9C7 7.9 7.9 7 9 7H28" stroke="currentColor" strokeWidth="0.9" opacity="0.72" />
        <path d="M2 14H14V2" stroke="currentColor" strokeWidth="1" opacity="0.65" />
      </svg>
    )
    return (
      <>
        <span className="bsp-corner is-tl">{cornerSvg}</span>
        <span className="bsp-corner is-tr">{cornerSvg}</span>
        <span className="bsp-corner is-bl">{cornerSvg}</span>
        <span className="bsp-corner is-br">{cornerSvg}</span>
      </>
    )
  }
  if (frameStyle === 'sharp-magazine') {
    return (
      <div className="bsp-mag-bar" aria-hidden="true">
        <span>THE WEDDING EDITION</span>
        <span>{dateShort || 'SAVE THE DATE'}</span>
      </div>
    )
  }
  return null
}

export function BespokeOrnament({ ornament, names }: { ornament: BespokeDesignBlueprint['ornament']; names: [string, string] }) {
  if (ornament === 'double-happiness') {
    return <div className="bsp-ornament-wrap" aria-hidden="true"><i className="bsp-hairline" /><span className="bsp-seal-emblem is-hy">囍</span><i className="bsp-hairline" /></div>
  }
  if (ornament === 'wax-seal') {
    return <div className="bsp-ornament-wrap" aria-hidden="true"><i className="bsp-hairline" /><span className="bsp-seal-emblem"><small>{coupleInitials(names)}</small></span><i className="bsp-hairline" /></div>
  }
  if (ornament === 'constellation') {
    return (
      <div className="bsp-ornament" aria-hidden="true">
        <svg viewBox="0 0 132 24" width="124" height="22" fill="none">
          <path d="M12 15L42 7L66 14L92 6L120 15" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 3" opacity="0.75" />
          <circle cx="12" cy="15" r="1.8" fill="currentColor" /><circle cx="42" cy="7" r="2.2" fill="currentColor" />
          <path d="M66 9L67.4 12.6L71 14L67.4 15.4L66 19L64.6 15.4L61 14L64.6 12.6Z" fill="currentColor" />
          <circle cx="92" cy="6" r="2" fill="currentColor" /><circle cx="120" cy="15" r="1.8" fill="currentColor" />
        </svg>
      </div>
    )
  }
  if (ornament === 'botanical-branch') {
    return (
      <div className="bsp-ornament" aria-hidden="true">
        <svg viewBox="0 0 120 26" width="112" height="24" fill="none">
          <path d="M10 19C38 11 82 11 110 19" stroke="currentColor" strokeWidth="1" />
          <path d="M40 14C36 7 42 5 48 11M60 12C58 5 64 4 67 12M80 14C84 7 78 5 72 11" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    )
  }
  if (ornament === 'zen-enso') {
    return (
      <div className="bsp-ornament" aria-hidden="true">
        <svg viewBox="0 0 44 44" width="34" height="34" fill="none">
          <path d="M22 6C31 6 38 13 38 22C38 31 31 38 22 38C13 38 6 31 6 22C6 15 11 9 18 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      </div>
    )
  }
  return <div className="bsp-ornament-line" aria-hidden="true" />
}

export function BespokeHeroSection({
  model, design, partyName, dateShort,
}: {
  model: DigitalInvitationModel; design: BespokeDesignBlueprint; partyName?: string | null | undefined; dateShort?: string | undefined
}) {
  const heroUrl = model.photos.heroUrl
  const namesNode = (
    <div className="bsp-hero-copy">
      <span className="bsp-eyebrow">{cleanEyebrow(design.eyebrowTag)}</span>
      {partyName ? <div className="bsp-guest-line">Kính mời · <strong>{partyName}</strong></div> : null}
      <h1 className="bsp-couple-names">
        <span>{model.displayNames[0]}</span>
        <em className="bsp-amp">&amp;</em>
        <span>{model.displayNames[1]}</span>
      </h1>
      <p className="bsp-event-title">{model.eventTitle}</p>
      {dateShort ? <span className="bsp-date-kicker">{dateShort}</span> : null}
    </div>
  )

  if (design.heroLayout === 'full-overlay' && heroUrl) {
    return (
      <header className="bsp-hero bsp-hero--overlay">
        <img src={heroUrl} alt={`${model.displayNames[0]} & ${model.displayNames[1]}`} className="bsp-hero-bg" />
        <div className="bsp-hero-scrim" aria-hidden="true" />
        <div className="bsp-hero-overlay-inner">{namesNode}</div>
      </header>
    )
  }
  if (design.heroLayout === 'split-editorial' && heroUrl) {
    return (
      <header className="bsp-hero bsp-hero--split">
        <div className="bsp-split-text">{namesNode}</div>
        <figure className="bsp-hero-photo bsp-hero-photo--split">
          <img src={heroUrl} alt={`${model.displayNames[0]} & ${model.displayNames[1]}`} />
        </figure>
      </header>
    )
  }

  return (
    <header className={`bsp-hero bsp-hero--${design.heroLayout}`}>
      {namesNode}
      {heroUrl ? (
        <figure className={`bsp-hero-photo bsp-hero-photo--${design.heroLayout}`}>
          <img src={heroUrl} alt={`${model.displayNames[0]} & ${model.displayNames[1]}`} />
          {design.heroLayout === 'polaroid-story' ? <figcaption>{model.displayNames[0]} &amp; {model.displayNames[1]}</figcaption> : null}
        </figure>
      ) : (
        <div className="bsp-monogram-crest" aria-hidden="true"><span>{coupleInitials(model.displayNames)}</span></div>
      )}
    </header>
  )
}

export function BespokeCoupleBioSection({ names, bio }: { names: [string, string]; bio: NonNullable<BespokeDesignBlueprint['coupleBio']> }) {
  if (!bio.groomMeta && !bio.brideMeta) return null
  return (
    <section className="bsp-editorial-band bsp-bio-spread">
      <div className="bsp-bio-col"><span className="tpl-micro-label">CHÚ RỂ</span><strong>{names[0]}</strong>{bio.groomMeta ? <p>{bio.groomMeta}</p> : null}</div>
      <div className="bsp-bio-divider" aria-hidden="true" />
      <div className="bsp-bio-col"><span className="tpl-micro-label">CÔ DÂU</span><strong>{names[1]}</strong>{bio.brideMeta ? <p>{bio.brideMeta}</p> : null}</div>
    </section>
  )
}

export function BespokeStorySection({ milestones }: { milestones: NonNullable<BespokeDesignBlueprint['storyMilestones']> }) {
  if (milestones.length === 0) return null
  return (
    <section className="bsp-editorial-band">
      <span className="tpl-micro-label">CHẶNG ĐƯỜNG YÊU</span>
      <ol className="bsp-story-spine">
        {milestones.map((m, idx) => (
          <li key={`${m.year}-${idx}`} className="bsp-story-node">
            <span className="bsp-story-dot" aria-hidden="true" />
            <div className="bsp-story-content">
              <span className="bsp-story-year">{m.year}</span>
              <strong>{m.title}</strong>
              <p>{m.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function BespokeDressCodeSection({ dressCode }: { dressCode: NonNullable<BespokeDesignBlueprint['dressCode']> }) {
  return (
    <section className="bsp-editorial-band bsp-dress-strip">
      <span className="tpl-micro-label">{dressCode.title || 'TRANG PHỤC DỰ TIỆC'}</span>
      {dressCode.swatches.length > 0 ? (
        <div className="bsp-swatch-row">
          {dressCode.swatches.map((hex, i) => <span key={`${hex}-${i}`} className="bsp-swatch-dot" style={{ background: hex }} title={hex} />)}
        </div>
      ) : null}
      {dressCode.note ? <p className="bsp-note-text">{dressCode.note}</p> : null}
    </section>
  )
}

export function BespokeGiftNoteSection({ giftNote }: { giftNote: NonNullable<BespokeDesignBlueprint['giftNote']> }) {
  return (
    <section className="bsp-letterpress-note">
      <span className="tpl-micro-label">{giftNote.heading || 'LỜI NHẮN GỬI'}</span>
      {giftNote.message ? <p>{giftNote.message}</p> : null}
    </section>
  )
}

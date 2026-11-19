'use client'

import type { BespokeDesignBlueprint } from '@mori/contracts'
import type { DigitalInvitationModel } from './digital-template-types'
import { coupleInitials } from './template-view-utils'

export function BespokeOrnament({
  ornament,
  names,
}: {
  ornament: BespokeDesignBlueprint['ornament']
  names: [string, string]
}) {
  if (ornament === 'double-happiness') {
    return (
      <div className="bsp-ornament bsp-ornament--seal" aria-hidden="true">
        <span>囍</span>
      </div>
    )
  }
  if (ornament === 'wax-seal') {
    return (
      <div className="bsp-ornament bsp-ornament--seal" aria-hidden="true">
        <small>{coupleInitials(names)}</small>
      </div>
    )
  }
  if (ornament === 'constellation') {
    return (
      <div className="bsp-ornament" aria-hidden="true">
        <svg viewBox="0 0 120 28" width="120" height="28" fill="none">
          <path d="M12 18L38 9L60 17L84 7L108 16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx="12" cy="18" r="2.2" fill="currentColor" />
          <circle cx="38" cy="9" r="2.5" fill="currentColor" />
          <circle cx="60" cy="17" r="3.4" fill="currentColor" />
          <circle cx="84" cy="7" r="2.5" fill="currentColor" />
          <circle cx="108" cy="16" r="2.2" fill="currentColor" />
        </svg>
      </div>
    )
  }
  if (ornament === 'botanical-branch') {
    return (
      <div className="bsp-ornament" aria-hidden="true">
        <svg viewBox="0 0 110 26" width="110" height="26" fill="none">
          <path d="M10 18C32 10 78 10 100 18" stroke="currentColor" strokeWidth="1.2" />
          <path d="M36 14C32 7 38 4 44 10" stroke="currentColor" strokeWidth="1.2" />
          <path d="M55 11C53 4 59 3 62 11" stroke="currentColor" strokeWidth="1.2" />
          <path d="M74 14C78 7 72 4 66 10" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>
    )
  }
  if (ornament === 'zen-enso') {
    return (
      <div className="bsp-ornament" aria-hidden="true">
        <svg viewBox="0 0 44 44" width="38" height="38" fill="none">
          <path d="M22 6C31 6 38 13 38 22C38 31 31 38 22 38C13 38 6 31 6 22C6 15 11 9 18 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
    )
  }
  return <div className="bsp-ornament-line" aria-hidden="true" />
}

export function BespokeHeroSection({
  model,
  design,
  partyName,
  dateShort,
}: {
  model: DigitalInvitationModel
  design: BespokeDesignBlueprint
  partyName?: string | null | undefined
  dateShort?: string | undefined
}) {
  const heroUrl = model.photos.heroUrl
  const namesNode = (
    <div className="bsp-hero-copy">
      <span className="tpl-eyebrow">{design.eyebrowTag || design.conceptName}</span>
      {partyName ? (
        <div className="tpl-guest-pill">
          <span>Trân trọng kính mời:</span> <strong>{partyName}</strong>
        </div>
      ) : null}
      <h1 className="bsp-couple-names">
        <span>{model.displayNames[0]}</span>
        <em className="bsp-amp">&amp;</em>
        <span>{model.displayNames[1]}</span>
      </h1>
      <p className="bsp-event-title">{model.eventTitle}</p>
      {dateShort ? <span className="bsp-date-chip">{dateShort}</span> : null}
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

  if (design.heroLayout === 'split-editorial') {
    return (
      <header className="bsp-hero bsp-hero--split">
        <div className="bsp-split-text">{namesNode}</div>
        {heroUrl ? (
          <figure className="bsp-hero-photo bsp-hero-photo--split">
            <img src={heroUrl} alt={`${model.displayNames[0]} & ${model.displayNames[1]}`} />
          </figure>
        ) : null}
      </header>
    )
  }

  return (
    <header className={`bsp-hero bsp-hero--${design.heroLayout}`}>
      {namesNode}
      {heroUrl ? (
        <figure className={`bsp-hero-photo bsp-hero-photo--${design.heroLayout}`}>
          <img src={heroUrl} alt={`${model.displayNames[0]} & ${model.displayNames[1]}`} />
          {design.heroLayout === 'polaroid-story' ? (
            <figcaption>{model.displayNames[0]} &amp; {model.displayNames[1]}</figcaption>
          ) : null}
        </figure>
      ) : null}
    </header>
  )
}

export function BespokeCoupleBioSection({
  names,
  bio,
}: {
  names: [string, string]
  bio: NonNullable<BespokeDesignBlueprint['coupleBio']>
}) {
  if (!bio.groomMeta && !bio.brideMeta) return null
  return (
    <section className="bsp-card-block bsp-bio-grid">
      <div className="bsp-bio-item">
        <span className="tpl-micro-label">CHÚ RỂ</span>
        <strong>{names[0]}</strong>
        {bio.groomMeta ? <p>{bio.groomMeta}</p> : null}
      </div>
      <div className="bsp-bio-item">
        <span className="tpl-micro-label">CÔ DÂU</span>
        <strong>{names[1]}</strong>
        {bio.brideMeta ? <p>{bio.brideMeta}</p> : null}
      </div>
    </section>
  )
}

export function BespokeStorySection({
  milestones,
}: {
  milestones: NonNullable<BespokeDesignBlueprint['storyMilestones']>
}) {
  if (milestones.length === 0) return null
  return (
    <section className="bsp-card-block">
      <span className="tpl-micro-label">CÂU CHUYỆN TÌNH YÊU</span>
      <ol className="bsp-story-list">
        {milestones.map((m, idx) => (
          <li key={`${m.year}-${idx}`} className="bsp-story-item">
            <span className="bsp-story-year">{m.year}</span>
            <div className="bsp-story-body">
              <strong>{m.title}</strong>
              <p>{m.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function BespokeDressCodeSection({
  dressCode,
}: {
  dressCode: NonNullable<BespokeDesignBlueprint['dressCode']>
}) {
  return (
    <section className="bsp-card-block bsp-dress-block">
      <span className="tpl-micro-label">{dressCode.title || 'DRESS CODE'}</span>
      {dressCode.swatches.length > 0 ? (
        <div className="bsp-swatch-row">
          {dressCode.swatches.map((hex, i) => (
            <span key={`${hex}-${i}`} className="bsp-swatch-dot" style={{ background: hex }} title={hex} />
          ))}
        </div>
      ) : null}
      {dressCode.note ? <p className="bsp-note-text">{dressCode.note}</p> : null}
    </section>
  )
}

export function BespokeGiftNoteSection({
  giftNote,
}: {
  giftNote: NonNullable<BespokeDesignBlueprint['giftNote']>
}) {
  return (
    <section className="bsp-card-block bsp-gift-block">
      <span className="tpl-micro-label">{giftNote.heading || 'LỜI NHẮN TỪ HAI BẠN'}</span>
      {giftNote.message ? <p className="bsp-note-text">{giftNote.message}</p> : null}
    </section>
  )
}

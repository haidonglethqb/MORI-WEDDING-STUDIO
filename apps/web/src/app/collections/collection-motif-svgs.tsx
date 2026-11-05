import type { ReactNode } from 'react'

export function renderCardMotif(type: string, accentColor: string): ReactNode {
  switch (type) {
    case 'arch-vogue':
      return (
        <div className="motif-arch-frame">
          <svg className="motif-svg" viewBox="0 0 90 24" fill="none">
            <path d="M5 20V12C5 6 45 2 45 2C45 2 85 6 85 12V20" stroke={accentColor} strokeWidth="1.2" />
          </svg>
          <span className="motif-vogue-txt">PARIS ATELIER</span>
        </div>
      )
    case 'roman-vogue':
      return (
        <div className="motif-roman-wrap">
          <span className="motif-roman-date" style={{ color: accentColor }}>XII · XII · MMXXVI</span>
          <div className="motif-gold-bar" style={{ background: accentColor }} />
        </div>
      )
    case 'vellum-couture':
      return (
        <div className="motif-vellum-sash">
          <div className="vellum-band" />
          <div className="champagne-wax-seal">✦</div>
        </div>
      )
    case 'baroque-crest':
      return (
        <div className="motif-baroque-crest">
          <span className="baroque-crown" style={{ color: accentColor }}>⚜</span>
          <span className="baroque-sub">ÉLYSÉE ROYAL</span>
        </div>
      )
    case 'magnolia-spray':
      return (
        <div className="motif-floral-branch">
          <svg className="motif-svg" viewBox="0 0 90 22" fill="none">
            <path d="M2 14C20 4 40 18 60 8C75 4 88 12 90 12" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="20" cy="8" r="2.5" fill={accentColor} />
            <circle cx="50" cy="14" r="2" fill={accentColor} />
            <circle cx="75" cy="7" r="2.5" fill={accentColor} />
          </svg>
        </div>
      )
    case 'eucalyptus-twin':
      return (
        <div className="motif-eucalyptus-wrap">
          <svg className="motif-svg" viewBox="0 0 80 18" fill="none">
            <path d="M10 9H70M25 4C30 9 35 14 40 9C45 4 50 9 55 9" stroke={accentColor} strokeWidth="1.2" />
          </svg>
          <span className="eucalyptus-icon">🌿</span>
        </div>
      )
    case 'meadow-wildflowers':
      return (
        <div className="motif-meadow-base">
          <span className="meadow-flora" style={{ color: accentColor }}>❀ ❁ ❀</span>
        </div>
      )
    case 'laurel-wreath':
      return (
        <div className="motif-laurel-circle">
          <span className="laurel-wreath-icon" style={{ color: accentColor }}>❊</span>
        </div>
      )
    case 'palace-joy':
      return (
        <div className="motif-palace-joy">
          <div className="imperial-double-joy">囍</div>
          <span className="imperial-text">HOÀNG GIA ĐẠI LỄ</span>
        </div>
      )
    case 'phoenix-gold':
      return (
        <div className="motif-phoenix">
          <span className="phoenix-symbol">鳳</span>
          <span className="phoenix-sub">PHỤNG VŨ LOAN TƯỜNG</span>
        </div>
      )
    case 'lotus-heritage':
      return (
        <div className="motif-lotus">
          <span className="lotus-flower">🪷</span>
          <span className="lotus-script">DUYÊN KHỞI TRĂM NĂM</span>
        </div>
      )
    case 'zen-enso':
      return (
        <div className="motif-enso-wrap">
          <div className="enso-circle" style={{ borderColor: accentColor }} />
          <span className="enso-sub">WABI-SABI</span>
        </div>
      )
    case 'muji-hanko':
      return (
        <div className="motif-hanko-box">
          <span className="hanko-square">森</span>
        </div>
      )
    case 'serenade-ribbon':
      return (
        <div className="motif-ribbon-drape">
          <div className="silk-ribbon" />
          <span className="wax-seal-stamp">✒</span>
        </div>
      )
    case 'celestial-halo':
      return (
        <div className="motif-celestial">
          <span className="celestial-moon" style={{ color: accentColor }}>☽ ✦ ☾</span>
        </div>
      )
    default:
      return (
        <div className="motif-default-seal">
          <span className="default-seal-text" style={{ color: accentColor }}>✦ M · S ✦</span>
        </div>
      )
  }
}

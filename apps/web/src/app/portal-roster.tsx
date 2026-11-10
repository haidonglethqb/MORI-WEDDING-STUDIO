import Image from 'next/image'
import { landingPhotos, type LandingPhoto } from './landing-photos'

interface RosterRow {
  href: string
  index: string
  title: string
  action: string
  photo: LandingPhoto
}

const rows: RosterRow[] = [
  { href: '/collections', index: '01 / THIẾT KẾ', title: 'Thiệp cưới', action: 'KHÁM PHÁ ↗', photo: landingPhotos.rosterPaper },
  { href: '/workspace', index: '02 / TRỰC TUYẾN', title: 'Thiệp số & RSVP', action: 'BẮT ĐẦU ↗', photo: landingPhotos.rosterDigital },
  { href: '/assistant', index: '03 / CẢM HỨNG', title: 'Trợ lý gợi ý', action: 'TRÒ CHUYỆN ↗', photo: landingPhotos.rosterIdeas },
]

export function PortalRoster() {
  return (
    <section className="portal-roster" id="thiep-so" aria-labelledby="roster-title">
      <div className="portal-section-top" data-reveal>
        <span className="portal-kicker">04 / CÙNG MORI</span>
        <h2 id="roster-title">
          Chọn cách<br />
          <em>kể chuyện.</em>
        </h2>
      </div>
      {rows.map((row) => (
        <a key={row.href} href={row.href} data-reveal>
          <span>{row.index}</span>
          <strong>{row.title}</strong>
          <span>{row.action}</span>
          <span className="roster-thumb" aria-hidden="true">
            <Image src={row.photo.src} alt="" width={row.photo.width} height={row.photo.height} sizes="280px" />
          </span>
        </a>
      ))}
    </section>
  )
}

import Image from 'next/image'
import { landingPhotos } from './landing-photos'

export function PortalClose() {
  const { close } = landingPhotos
  return (
    <section className="portal-close" aria-labelledby="close-title">
      <div className="close-backdrop" aria-hidden="true">
        <Image src={close.src} alt="" fill sizes="100vw" />
      </div>
      <span className="portal-kicker">MORI / WEDDING STUDIO</span>
      <div className="close-body" data-reveal>
        <h2 id="close-title">
          Ngày vui bắt đầu<br />
          từ <em>một lời mời.</em>
        </h2>
        <div className="portal-actions">
          <a className="portal-button portal-button-solid" href="/collections">Tìm mẫu thiệp ↗</a>
          <a className="portal-link" href="/workspace">Không gian của bạn →</a>
        </div>
      </div>
      <p className="close-line">THIỆP GIẤY &amp; THIỆP TRỰC TUYẾN · THIẾT KẾ THEO CÂU CHUYỆN CỦA BẠN</p>
      <div className="portal-close-mark" aria-hidden="true">
        MORI<span>.</span>
      </div>
    </section>
  )
}

import Image from 'next/image'
import { landingPhotos } from './landing-photos'

export function PortalStatement() {
  const { craft, detail } = landingPhotos
  return (
    <section className="portal-statement" id="che-tac" aria-labelledby="statement-title">
      <div className="statement-copy" data-reveal>
        <span className="portal-kicker">01 / MỘT LỜI MỜI</span>
        <h2 id="statement-title">
          Có những câu chuyện bắt đầu bằng <em>một tấm thiệp.</em>
        </h2>
        <p>
          Từ những nét chữ đầu tiên đến lời mời gửi trao, MORI đồng hành cùng hai bạn tạo nên
          một dấu ấn riêng cho ngày chung đôi.
        </p>
        <p className="statement-sign">— Xưởng thiệp MORI</p>
      </div>
      <div className="statement-collage">
        <figure className="collage-main portal-parallax portal-unveil">
          <Image src={craft.src} alt={craft.alt} width={craft.width} height={craft.height}
            sizes="(max-width: 900px) 80vw, 34vw" />
        </figure>
        <figure className="collage-detail portal-fade">
          <Image src={detail.src} alt={detail.alt} width={detail.width} height={detail.height}
            sizes="(max-width: 900px) 42vw, 16vw" />
        </figure>
        <p className="collage-caption">ẢNH MINH HỌA · CHẤT LIỆU &amp; HOÀN THIỆN</p>
      </div>
      <span className="portal-outline" aria-hidden="true">01</span>
    </section>
  )
}

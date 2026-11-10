import Image from 'next/image'
import { landingPhotos } from './landing-photos'

const steps = [
  { title: 'Chọn hướng thiết kế', text: 'Khám phá mẫu hoặc trò chuyện cùng trợ lý.' },
  { title: 'Hoàn thiện chi tiết', text: 'Trao đổi nội dung, số lượng và quy cách cùng xưởng.' },
  { title: 'Duyệt trước khi gửi', text: 'Kiểm tra thông tin và theo dõi các bước tiếp theo.' },
]

export function PortalProcess() {
  const { process } = landingPhotos
  return (
    <section className="portal-process" id="quy-trinh" aria-labelledby="process-title">
      <div className="process-intro" data-reveal>
        <span className="portal-kicker">05 / TỪ Ý TƯỞNG ĐẾN NGÀY VUI</span>
        <h2 id="process-title">
          Từng bước,<br />
          <em>cùng hai bạn.</em>
        </h2>
        <figure className="process-photo portal-parallax">
          <Image src={process.src} alt={process.alt} width={process.width} height={process.height}
            sizes="(max-width: 900px) 90vw, 36vw" />
        </figure>
      </div>
      <ol className="portal-process-rows">
        {steps.map((step, i) => (
          <li key={step.title} data-reveal>
            <span className="process-numeral" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <strong>{step.title}</strong>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

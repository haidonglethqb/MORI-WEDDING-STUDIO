import Image from 'next/image'
import { landingPhotos } from './landing-photos'

const notes = [
  { label: 'Giấy', text: 'Chọn sắc giấy, độ dày và bề mặt cùng xưởng trước khi in.' },
  { label: 'Bản duyệt', text: 'Hai bạn kiểm tra từng dòng chữ trên bản duyệt trước khi sản xuất.' },
  { label: 'Hoàn thiện', text: 'Phong bì và chi tiết hoàn thiện được trao đổi riêng theo từng mẫu.' },
]

export function PortalMaterial() {
  const { material } = landingPhotos
  return (
    <section className="portal-material" id="chat-lieu" aria-labelledby="material-title">
      <figure className="material-frame portal-parallax">
        <Image src={material.src} alt={material.alt} fill sizes="100vw" />
        <figcaption className="material-overlay" data-reveal>
          <span className="portal-kicker">03 / CHẤT LIỆU</span>
          <h2 id="material-title">
            Chạm vào <em>từng thớ giấy.</em>
          </h2>
          <span className="material-credit">ẢNH MINH HỌA</span>
        </figcaption>
      </figure>
      <ol className="material-notes">
        {notes.map((note, i) => (
          <li key={note.label} data-reveal>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <strong>{note.label}</strong>
            <p>{note.text}</p>
          </li>
        ))}
      </ol>
      <div className="material-more" data-reveal>
        <a className="portal-link" href="/blog/thiep-cuoi-giay-ba-mia">
          Tìm hiểu câu chuyện giấy bã mía ↗
        </a>
      </div>
    </section>
  )
}

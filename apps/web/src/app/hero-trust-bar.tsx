import { MoriIcon } from '../components/mori-icon'

export function HeroTrustBar() {
  const stats = [
    {
      icon: 'paper' as const,
      title: 'Chọn thiết kế',
      desc: 'Khám phá các phong cách thiệp',
    },
    {
      icon: 'palette' as const,
      title: 'Trao đổi cùng xưởng',
      desc: 'Chia sẻ mong muốn và quy cách',
    },
    {
      icon: 'envelope' as const,
      title: 'Thiệp trực tuyến',
      desc: 'Tạo thiệp và quản lý phản hồi',
    },
    {
      icon: 'check' as const,
      title: 'Duyệt bản mẫu',
      desc: 'Xem lại nội dung trước khi xác nhận',
    },
  ]

  return (
    <div className="hero-trust-grid">
      {stats.map((s) => (
        <div key={s.title} className="hero-trust-card">
          <MoriIcon className="hero-trust-icon" name={s.icon} />
          <div className="hero-trust-text">
            <strong>{s.title}</strong>
            <small>{s.desc}</small>
          </div>
        </div>
      ))}
    </div>
  )
}

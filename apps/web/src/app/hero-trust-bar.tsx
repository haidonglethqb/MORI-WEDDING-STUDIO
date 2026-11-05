export function HeroTrustBar() {
  const stats = [
    {
      icon: '🌿',
      title: 'Giấy bã mía sinh thái 350gsm',
      desc: '100% sợi thực vật, không tẩy clo, bền vững',
    },
    {
      icon: '⚜️',
      title: 'Ép kim chìm nhiệt cao 160°C',
      desc: 'Lá kim vàng ấm dập chìm cơ học độc bản',
    },
    {
      icon: '📱',
      title: 'Thiệp cưới số tương tác RSVP',
      desc: 'Đồng bộ thời gian thực, bản đồ & lời chúc',
    },
    {
      icon: '✨',
      title: 'Mô hình 3D xoay 360° trực quan',
      desc: 'Kiểm tra chính xác từng chi tiết trước khi in',
    },
  ]

  return (
    <div className="hero-trust-grid">
      {stats.map((s) => (
        <div key={s.title} className="hero-trust-card">
          <span className="hero-trust-icon">{s.icon}</span>
          <div className="hero-trust-text">
            <strong>{s.title}</strong>
            <small>{s.desc}</small>
          </div>
        </div>
      ))}
    </div>
  )
}

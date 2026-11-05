export function HomeStories() {
  const stories = [
    {
      couple: 'Hoàng Nam & Lan Phương',
      venue: 'JW Marriott Hotel Hanoi',
      date: 'Tháng 10, 2026',
      style: 'Editorial Vogue Bi-fold',
      quote:
        'Cầm tấm thiệp giấy bã mía trên tay thật sự khác biệt — đầm tay, thơm nhẹ thớ sợi tự nhiên và viền xé deckle quá đỗi tinh tế. Khách mời của tụi mình ai cũng khen trang thiệp số RSVP vừa tiện vừa sang trọng.',
      monogram: 'N & P',
    },
    {
      couple: 'Đức Huy & Mai Chi',
      venue: 'Park Hyatt Saigon',
      date: 'Tháng 12, 2026',
      style: 'Floral Botanical & Wax Seal',
      quote:
        'Tính năng xem mô hình 3D xoay 360 độ trước khi in giúp vợ chồng mình an tâm tuyệt đối. Từng dấu ép kim nhũ vàng và con dấu sáp đỏ trầm đều hoàn thiện chỉn chu hơn cả kỳ vọng.',
      monogram: 'H & C',
    },
    {
      couple: 'Thế Vinh & Tuệ Nhi',
      venue: 'Amanoi Ninh Thuận',
      date: 'Tháng 01, 2027',
      style: 'Minimalist Wabi-Sabi Flat',
      quote:
        'Trang thiệp cưới điện tử giúp tụi mình đếm được chính xác số lượng khách bay đến Ninh Thuận dự tiệc chỉ trong 3 ngày gửi link. Đội ngũ nghệ nhân MORI tư vấn nhiệt tình và cực kỳ có gout.',
      monogram: 'V & N',
    },
  ]

  return (
    <div className="stories-grid">
      {stories.map((s) => (
        <article key={s.couple} className="story-card">
          <div className="story-card-top">
            <div className="story-monogram-circle">{s.monogram}</div>
            <div>
              <h3 className="story-couple-name">{s.couple}</h3>
              <p className="story-venue-info">{s.venue} · {s.date}</p>
            </div>
          </div>
          <span className="story-style-tag">✦ {s.style}</span>
          <p className="story-quote-text">&ldquo;{s.quote}&rdquo;</p>
        </article>
      ))}
    </div>
  )
}

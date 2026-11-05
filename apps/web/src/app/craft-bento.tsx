export function CraftBento() {
  const items = [
    {
      num: '01',
      title: 'Giấy bã mía sinh thái 350gsm',
      desc: '100% sợi thực vật tự nhiên không tẩy clo. Bề mặt có độ sần nhẹ hữu cơ, sắc ngà ấm cúng và độ đầm tay hoàn hảo.',
      tag: 'Bền vững · Eco-friendly',
    },
    {
      num: '02',
      title: 'Ép kim chìm & Dập nổi nhiệt cao',
      desc: 'Lá kim vàng gold ấm được ép chìm cơ học dưới nhiệt độ cao, tạo hiệu ứng phản chiếu ánh sáng lấp lánh khi nghiêng thiệp.',
      tag: 'Hot Foil Stamping',
    },
    {
      num: '03',
      title: 'Mép xé thủ công Deckle Edge',
      desc: 'Từng viền thiệp được các nghệ nhân atelier xé ướt thủ công tỉ mỉ, mang lại vẻ đẹp cổ điển và độc bản cho từng tấm.',
      tag: 'Artisanal Deckle',
    },
    {
      num: '04',
      title: 'Thiệp cưới số đồng bộ trực tuyến',
      desc: 'Trang thiệp điện tử RSVP tương thích mọi thiết bị, tích hợp bản đồ chỉ đường, nhạc nền lễ cưới và sổ lưu bút trực tiếp.',
      tag: 'Digital Guest Experience',
    },
  ]

  return (
    <div className="bento-grid">
      {items.map((item) => (
        <article key={item.num} className="bento-card">
          <div className="bento-card-top">
            <span className="bento-num">{item.num}</span>
            <span className="bento-tag">{item.tag}</span>
          </div>
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </article>
      ))}
    </div>
  )
}

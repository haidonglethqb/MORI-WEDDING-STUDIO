export function HomeSteps() {
  const steps = [
    {
      num: '01',
      title: 'Chọn mẫu hoặc ý tưởng',
      desc: 'Chọn từ bộ sưu tập hoặc nhờ Trợ lý Stylist gợi ý thiết kế phù hợp với ngân sách và concept cưới.',
    },
    {
      num: '02',
      title: 'Duyệt phối cảnh 3D',
      desc: 'Kiểm tra chính xác tên song thân, địa điểm và hình dung tấm thiệp thật qua không gian 3D trực quan.',
    },
    {
      num: '03',
      title: 'Nhận bản in mẫu tận tay',
      desc: 'Xưởng gửi 01 bản in thử thực tế để hai bạn chạm vào thớ giấy bã mía và độ sâu ép kim trước khi in lớn.',
    },
    {
      num: '04',
      title: 'Chế tác & Bàn giao trọn vẹn',
      desc: 'Gia công ép kim, xé mép, đóng dấu sáp và đồng thời kích hoạt trang thiệp cưới số RSVP tương tác.',
    },
  ]

  return (
    <ul className="steps-list-four">
      {steps.map((s) => (
        <li key={s.num} className="step-item">
          <span className="step-num">{s.num}</span>
          <h3>{s.title}</h3>
          <p>{s.desc}</p>
        </li>
      ))}
    </ul>
  )
}

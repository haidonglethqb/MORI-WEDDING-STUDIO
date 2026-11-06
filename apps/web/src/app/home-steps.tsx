export function HomeSteps() {
  const steps = [
    { num: '01', title: 'Tìm một hướng thiết kế', desc: 'Khám phá bộ sưu tập hoặc trao đổi với trợ lý để tìm phong cách hợp với hai bạn.' },
    { num: '02', title: 'Cùng hoàn thiện chi tiết', desc: 'Trao đổi nội dung, số lượng và quy cách. Xưởng xác nhận chất liệu, chi phí và các mốc thực hiện.' },
    { num: '03', title: 'Duyệt trước khi gửi đi', desc: 'Kiểm tra tên, lời mời và thông tin ngày cưới. Theo dõi các bước tiếp theo trong không gian của bạn.' },
  ]
  return <ol className="steps-list-four">{steps.map((step) => <li className="step-item" key={step.num}><span className="step-num">{step.num}</span><h3>{step.title}</h3><p>{step.desc}</p></li>)}</ol>
}

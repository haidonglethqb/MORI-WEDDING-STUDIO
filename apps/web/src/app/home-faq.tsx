'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Xưởng có gửi bản in thử (hard proof) thực tế trước khi in hàng loạt không?',
    a: 'Có. Sau khi hai bạn duyệt xong mô hình 3D trực tuyến, MORI sẽ sản xuất 01 bộ thiệp mẫu hoàn thiện với chất liệu giấy bã mía và kỹ thuật ép kim đã chọn để gửi đến tận nhà cho bạn kiểm tra chất lượng thực tế trước khi bấm lệnh sản xuất số lượng lớn.',
  },
  {
    q: 'Giấy bã mía sinh thái có bị ố vàng hoặc giòn gãy theo thời gian không?',
    a: 'Hoàn toàn không. Giấy bã mía 350gsm của MORI được sản xuất theo quy trình Tree-free không tẩy clo công nghiệp và loại bỏ hoàn toàn acid tự do (Acid-free), giúp giấy giữ được độ dai dẻo, bền màu và có thể lưu giữ làm kỷ niệm hàng chục năm.',
  },
  {
    q: 'Khách mời lớn tuổi có dễ dàng sử dụng thiệp cưới số RSVP không?',
    a: 'Giao diện thiệp số được tối ưu giao diện trực quan với phông chữ tiếng Việt to rõ, chỉ cần bấm vào đường link gửi qua Zalo/tin nhắn là thiệp tự mở ngay lập tức, không cần tải ứng dụng hay đăng ký tài khoản rườm rà.',
  },
  {
    q: 'Thời gian từ lúc đặt thiết kế đến khi nhận trọn bộ thiệp là bao lâu?',
    a: 'Thời gian thông thường từ 7 đến 10 ngày làm việc (bao gồm 24-48 giờ lên bản dựng 3D, 2 ngày duyệt in mẫu và 5 ngày gia công thủ công ép kim, xé mép, đóng dấu sáp). Xưởng cũng có gói hỗ trợ hỏa tốc cho các cặp đôi cần gấp.',
  },
]

export function HomeFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="home-faq-wrap">
      {FAQS.map((item, idx) => {
        const isOpen = openIdx === idx
        return (
          <div key={item.q} className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="faq-question-btn"
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen ? (
              <div className="faq-answer-pane">
                <p>{item.a}</p>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Quy trình duyệt thiết kế diễn ra thế nào?',
    a: 'Sau khi thống nhất hướng thiết kế, bạn có thể xem lại nội dung và quy cách trước khi xác nhận bước tiếp theo. Xưởng sẽ trao đổi rõ các mốc duyệt và sản xuất theo từng đơn hàng.',
  },
  {
    q: 'MORI hiện có những lựa chọn chất liệu nào?',
    a: 'Chất liệu và kỹ thuật hoàn thiện phụ thuộc vào mẫu và đơn hàng. Xưởng sẽ xác nhận thông số, chi phí và thời gian thực hiện trước khi bạn chốt.',
  },
  {
    q: 'Khách mời lớn tuổi có dễ dàng sử dụng thiệp cưới số RSVP không?',
    a: 'Khách mời mở đường dẫn thiệp trên trình duyệt điện thoại hoặc máy tính. Một số nội dung có thể yêu cầu mã truy cập nếu chủ thiệp bật chế độ bảo vệ.',
  },
  {
    q: 'Mất bao lâu để hoàn thành đơn hàng?',
    a: 'Thời gian phụ thuộc vào số lượng, quy cách và lịch sản xuất tại thời điểm đặt hàng. Xưởng sẽ báo mốc dự kiến trước khi bạn xác nhận.',
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

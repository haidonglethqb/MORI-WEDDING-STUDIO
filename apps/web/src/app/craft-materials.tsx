'use client'

import { useState } from 'react'
import { MoriIcon, type MoriIconName } from '../components/mori-icon'

interface DesignChoice {
  id: string
  name: string
  tag: string
  description: string
  details: string[]
  icon: MoriIconName
  accent: string
}

const DESIGN_CHOICES: [DesignChoice, ...DesignChoice[]] = [
  {
    id: 'layout',
    name: 'Bố cục',
    tag: 'Sắp xếp nội dung',
    description: 'Chọn cách đặt tên, ngày cưới và lời mời để thông tin quan trọng dễ đọc.',
    details: ['Tên hai bạn', 'Thời gian và địa điểm', 'Lời mời và thông tin cần thiết'],
    icon: 'paper',
    accent: '#e9e4d6',
  },
  {
    id: 'color',
    name: 'Màu sắc',
    tag: 'Không khí buổi lễ',
    description: 'Chọn tông màu phù hợp với phong cách và không gian ngày cưới.',
    details: ['Tông màu chủ đạo', 'Màu chữ dễ đọc', 'Cân đối giữa các mặt thiệp'],
    icon: 'palette',
    accent: '#d1dbcb',
  },
  {
    id: 'type',
    name: 'Kiểu chữ',
    tag: 'Dấu ấn cá nhân',
    description: 'Kết hợp kiểu chữ có cá tính với nội dung rõ ràng, dễ xem trên giấy và điện thoại.',
    details: ['Tên cặp đôi', 'Tiêu đề và lời mời', 'Thông tin ngày cưới'],
    icon: 'spark',
    accent: '#e6d8ce',
  },
  {
    id: 'digital',
    name: 'Thiệp trực tuyến',
    tag: 'Dễ chia sẻ',
    description: 'Tạo trang mời mở trên điện thoại và theo dõi phản hồi khách mời.',
    details: ['Thông tin sự kiện', 'Lời mời cá nhân hóa', 'Xác nhận tham dự'],
    icon: 'envelope',
    accent: '#d9dfd5',
  },
]

export function CraftMaterials() {
  const [activeId, setActiveId] = useState(DESIGN_CHOICES[0].id)
  const active = DESIGN_CHOICES.find((choice) => choice.id === activeId) ?? DESIGN_CHOICES[0]

  return (
    <div className="craft-explorer-container">
      <div className="craft-tabs-bar" role="group" aria-label="Chi tiết thiết kế">
        {DESIGN_CHOICES.map((choice) => (
          <button
            key={choice.id}
            id={`choice-tab-${choice.id}`}
            type="button"
            aria-pressed={choice.id === activeId}
            aria-controls="choice-panel"
            className={`craft-tab-btn ${choice.id === activeId ? 'active' : ''}`}
            onClick={() => setActiveId(choice.id)}
          >
            <MoriIcon className="craft-tab-symbol" name={choice.icon} />
            <span>{choice.name}</span>
          </button>
        ))}
      </div>

      <div className="craft-detail-stage" id="choice-panel" role="region" aria-labelledby={`choice-tab-${active.id}`}>
        <div className="craft-detail-preview" style={{ background: active.accent }} aria-hidden="true">
          <div className="craft-preview-inner-card">
            <MoriIcon className="craft-preview-symbol" name={active.icon} />
            <span className="craft-preview-tag">{active.tag}</span>
            <h3 className="craft-preview-title">Tên hai bạn</h3>
            <p className="craft-preview-sub">Ngày vui · Địa điểm</p>
            <div className="craft-preview-gold-seal">MORI · THIỆP CƯỚI</div>
          </div>
        </div>

        <div className="craft-detail-info">
          <div className="craft-badge-line">
            <span className="craft-cat-badge">{active.tag}</span>
            <span className="craft-origin-badge">Cá nhân hóa cùng MORI</span>
          </div>
          <h3 className="craft-main-title">{active.name}</h3>
          <p className="craft-lead-desc">{active.description}</p>
          <div className="craft-specs-block">
            <h4 className="craft-specs-header">Bạn có thể trao đổi</h4>
            <ul className="craft-specs-list">
              {active.details.map((detail) => (
                <li key={detail} className="craft-spec-item">
                  <span className="craft-spec-dot" aria-hidden="true">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <a href="/collections" className="craft-cta-link">
            Chọn mẫu để bắt đầu <MoriIcon name="arrow-right" />
          </a>
          <p className="craft-note">Chất liệu, giá và thời gian hoàn thiện sẽ được xác nhận theo từng mẫu.</p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface CraftItem {
  id: string
  name: string
  subtitle: string
  tag: string
  desc: string
  specs: string[]
  visualAccent: string
  symbol: string
}

const CRAFTS: CraftItem[] = [
  {
    id: 'bagasse-paper',
    name: 'Giấy Bã Mía Sinh Thái 350gsm',
    subtitle: 'Nền giấy ngà tự nhiên, không qua tẩy trắng công nghiệp',
    tag: 'Tree-Free Eco Paper',
    desc: 'Được chế tác từ sợi bã mía nông nghiệp tái sinh 100%, bảo toàn các sợi cellulose hữu cơ tự nhiên mang lại xúc cảm đầm tay, sần mịn và hương thơm nhẹ nhàng của thực vật.',
    specs: ['Định lượng: 350gsm siêu dày', 'Màu sắc: Ngà ấm tự nhiên (Natural Ivory)', 'Bảo vệ rừng: 100% Tree-Free', 'Không chứa acid gây ố vàng'],
    visualAccent: '#e9e4d6',
    symbol: '🌾',
  },
  {
    id: 'hot-foil',
    name: 'Ép Kim Chìm Nhiệt Độ Cao (Hot Foil Deboss)',
    subtitle: 'Lá kim vàng gold ấm được dập chìm cơ học dưới 160°C',
    tag: 'Artisan Hot Foil',
    desc: 'Khuôn đồng gia công CNC ép lá kim chìm sâu vào từng thớ giấy bã mía, tạo hiệu ứng khúc xạ ánh sáng lấp lánh khi nghiêng thiệp, mang lại vẻ đẹp quyền quý vượt thời gian.',
    specs: ['Nhiệt độ dập: 160°C chuẩn xác', 'Độ chìm: 0.4mm sâu sắc nét', 'Sắc kim: Champagne Gold & Rose Copper', 'Bền màu: Không bong tróc vĩnh viễn'],
    visualAccent: '#d8c28b',
    symbol: '⚜️',
  },
  {
    id: 'deckle-edge',
    name: 'Mép Xé Rách Thủ Công (Deckle Edge)',
    subtitle: 'Từng cạnh thiệp được thợ xé ướt thủ công tỉ mỉ',
    tag: 'Hand-torn Deckle',
    desc: 'Mỗi tấm thiệp mang một đường viền bất đối xứng duy nhất không lặp lại. Sự mềm mại của mép sợi giấy xé gợi nhớ phong cách thiệp cưới hoàng gia châu Âu thế kỷ 18.',
    specs: ['Gia công: Xé ướt thủ công từng tờ', 'Độc bản: Không có 2 mép thiệp giống nhau', 'Phong cách: Vintage & Parisian Haute', 'Tương thích cả khổ gấp & khổ phẳng'],
    visualAccent: '#d1dbcb',
    symbol: '✂️',
  },
  {
    id: 'wax-seal',
    name: 'Con Dấu Sáp Tự Nhiên & Ruy Băng Lụa',
    subtitle: 'Niêm phong tình yêu bằng sáp ong phối nhũ vàng nguyên chất',
    tag: 'Bespoke Wax Seal',
    desc: 'Được đúc tay từng con dấu với chữ cái lồng Monogram của riêng hai bạn, kết hợp dải ruy băng lụa tơ tằm mềm mại bao bọc thiệp mời, tạo nghi thức mở thiệp thiêng liêng cho khách quý.',
    specs: ['Chất liệu: Sáp ong tự nhiên dẻo dai', 'Dấu triện: Khắc đồng gia huy/tên đôi bạn', 'Đi kèm: Ruy băng lụa tơ tằm xé mép', 'Đóng dấu: Thủ công từng phong bì'],
    visualAccent: '#cbb6a3',
    symbol: '💌',
  },
]

export function CraftMaterials() {
  const [activeId, setActiveId] = useState('bagasse-paper')
  const active = (CRAFTS.find((c) => c.id === activeId) ?? CRAFTS[0]) as CraftItem

  return (
    <div className="craft-explorer-container">
      <div className="craft-tabs-bar">
        {CRAFTS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`craft-tab-btn ${c.id === activeId ? 'active' : ''}`}
            onClick={() => setActiveId(c.id)}
          >
            <span className="craft-tab-symbol">{c.symbol}</span>
            <span className="craft-tab-title">{c.name.split(' (')[0]}</span>
          </button>
        ))}
      </div>

      <div className="craft-detail-stage">
        <div className="craft-detail-preview" style={{ background: active.visualAccent }}>
          <div className="craft-preview-inner-card">
            <span className="craft-preview-symbol">{active.symbol}</span>
            <span className="craft-preview-tag">{active.tag}</span>
            <h4 className="craft-preview-title">{active.name}</h4>
            <p className="craft-preview-sub">{active.subtitle}</p>
            <div className="craft-preview-gold-seal">✦ MORI ATELIER 2026 ✦</div>
          </div>
        </div>

        <div className="craft-detail-info">
          <div className="craft-badge-line">
            <span className="craft-cat-badge">{active.tag}</span>
            <span className="craft-origin-badge">Thủ công tại Xưởng MORI</span>
          </div>
          <h3 className="craft-main-title">{active.name}</h3>
          <p className="craft-lead-desc">{active.desc}</p>

          <div className="craft-specs-block">
            <h4 className="craft-specs-header">Tiêu chuẩn kỹ thuật atelier:</h4>
            <ul className="craft-specs-list">
              {active.specs.map((spec) => (
                <li key={spec} className="craft-spec-item">
                  <span className="craft-spec-dot">✦</span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="craft-action-row">
            <a href="/collections" className="craft-cta-link">
              Xem các mẫu thiệp ứng dụng kỹ thuật này &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

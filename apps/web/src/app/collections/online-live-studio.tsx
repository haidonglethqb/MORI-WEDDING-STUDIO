'use client'

import Link from 'next/link'
import { DigitalTemplateRenderer } from '../../features/digital-templates/digital-template-renderer'
import { TEMPLATE_DEFINITIONS } from '../../features/digital-templates/digital-template-presets'
import type { DigitalInvitationModel, DigitalTemplateId } from '../../features/digital-templates/digital-template-types'
import { TemplateCustomizerPanel } from '../../features/digital-templates/template-customizer-panel'
import { formatVnd } from '../../features/cart/cart-types'
import '../../features/digital-templates/digital-templates.css'
import '../../features/digital-templates/digital-templates-themes.css'
import '../../features/digital-templates/template-customizer.css'

export interface StudioDigitalCard {
  slug: string
  title: string
  styleLabel: string
  unitAmountVnd: number
}

interface Props {
  model: DigitalInvitationModel
  onChange: (next: DigitalInvitationModel) => void
  matchedCard: StudioDigitalCard
  onAddMatchedToCart: () => void
}

const TEMPLATE_SLUG_LABEL: Record<DigitalTemplateId, string> = {
  'editorial-vogue': 'Editorial Vogue Atelier',
  'heritage-palace': 'Song Hỷ Hoàng Gia',
  'botanical-zen': 'Botanical Wabi-Sabi',
}

export function OnlineLiveStudio({ model, onChange, matchedCard, onAddMatchedToCart }: Props) {
  const def = TEMPLATE_DEFINITIONS[model.templateId]

  return (
    <div id="studio-thiep-online" className="online-studio-wrap">
      <div className="online-studio-head">
        <div>
          <span className="group-eyebrow">LIVE STUDIO BUILDER · TRẢI NGHIỆM TRỰC TIẾP</span>
          <h3>Thiết kế &amp; Điền thông tin thử trên 3 Bản Template Chuẩn</h3>
          <p>
            Thử đổi template, điền tên hai bạn, gia đình hai họ, tải ảnh cưới, đổi bảng màu và bật/tắt các khối hiển thị trước khi đặt mua.
          </p>
        </div>
        <div className="online-studio-cta-group">
          <button type="button" className="online-btn-add" onClick={onAddMatchedToCart}>
            Đặt gói {matchedCard.title} · {formatVnd(matchedCard.unitAmountVnd)}
          </button>
          <Link href="/workspace" className="online-btn-demo">
            Mở Không gian tạo thiệp →
          </Link>
        </div>
      </div>

      <div className="online-studio-split">
        <div className="online-studio-controls">
          <div className="online-studio-active-pill">
            <span>Đang xem layout:</span>
            <strong>{TEMPLATE_SLUG_LABEL[model.templateId]}</strong>
            <small>— {def.description}</small>
          </div>
          <TemplateCustomizerPanel model={model} onChange={onChange} />
        </div>

        <div className="online-studio-preview">
          <span className="online-studio-preview-badge">XEM TRƯỚC GIAO DIỆN KHÁCH MỜI</span>
          <DigitalTemplateRenderer model={model} partyName="Anh Minh & Chị Lan" compact />
        </div>
      </div>
    </div>
  )
}

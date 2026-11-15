'use client'

import Link from 'next/link'
import { addToCart, openCartDrawer, readSelectedFont } from '../../features/cart/cart-store'
import { DIGITAL_CATALOG_ITEMS, formatVnd } from '../../features/cart/cart-types'
import type { CollectionItem } from './collection-types'

interface OnlineInvitationsSectionProps {
  items: CollectionItem[]
}

export function OnlineInvitationsSection({ items }: OnlineInvitationsSectionProps) {
  const cards = DIGITAL_CATALOG_ITEMS.map((meta) => {
    const matched = items.find((item) => item.slug === meta.slug)
    const unitAmountVnd =
      matched?.minPriceVnd && Number(matched.minPriceVnd) > 0
        ? Number(matched.minPriceVnd)
        : meta.unitAmountVnd
    return {
      ...meta,
      title: matched?.curatedTitle ?? meta.name,
      description: matched?.curatedDesc ?? meta.description,
      unitAmountVnd,
    }
  })

  function handleAddDigital(card: (typeof cards)[number]) {
    const selectedFont = readSelectedFont()
    addToCart({
      slug: card.slug,
      name: card.title,
      productType: 'DIGITAL',
      shape: 'DIGITAL',
      quantity: 1,
      unitAmountVnd: card.unitAmountVnd,
      imageUrl: null,
      fontCode: selectedFont?.code,
    })
    openCartDrawer()
  }

  return (
    <section className="group-section-wrap" id="thiep-online">
      <div className="group-section-head">
        <span className="group-eyebrow">Nhóm 2 · Thiệp online (399.000 ₫ – 599.000 ₫)</span>
        <h2>Thiệp cưới Online — Website riêng gửi nhanh qua mạng xã hội &amp; tin nhắn</h2>
        <p className="group-section-desc">
          Thiệp mời cưới dạng website riêng có đường link gửi nhanh qua Messenger, SMS hoặc tin nhắn, kèm đếm ngược ngày cưới, bản đồ chỉ đường và nút xác nhận tham dự (RSVP).
        </p>
      </div>

      <div className="online-grid">
        {cards.map((card) => (
          <article key={card.slug} className="online-card">
            <div className="online-card-screen">
              <div className="online-phone-mock">
                <span className="online-phone-tag" style={{ color: card.accentColor }}>
                  {card.badgeLabel}
                </span>
                <h4>{card.title}</h4>
                <p>Save the Date · Link mời riêng</p>
                <div className="online-phone-pills">
                  <span>Đếm ngược</span>
                  <span>Bản đồ</span>
                  <span>RSVP</span>
                </div>
              </div>
            </div>
            <div className="online-card-body">
              <span className="spec-type-pill">{card.styleLabel}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <div className="online-price-row">
                <span className="price-lead-label">Trọn gói website</span>
                <strong>{formatVnd(card.unitAmountVnd)}</strong>
              </div>
              <div className="online-card-actions">
                <Link href={`/products/${card.slug}`} className="online-btn-demo">
                  Xem chi tiết / Demo
                </Link>
                <button
                  type="button"
                  className="online-btn-add"
                  onClick={() => handleAddDigital(card)}
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

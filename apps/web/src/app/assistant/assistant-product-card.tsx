'use client'

import Link from 'next/link'
import { getBespokeProfile } from '../collections/collection-catalog-data'
import type { SuggestedProductCard } from './assistant-types'

interface ProductCardProps {
  item: SuggestedProductCard
}

const SILHOUETTE_MAP: Record<string, string> = {
  arch: 'Dáng vòm Arch',
  deckle: 'Mép xé Deckle',
  vellum: 'Bìa can Vellum',
  standard: 'Chữ nhật cổ điển',
}

export function AssistantProductCard({ item }: ProductCardProps) {
  const profile = getBespokeProfile(item.slug)
  const title = profile?.title ?? item.title ?? item.name
  const subtitle = profile?.subtitle ?? item.subtitle ?? 'Chế tác giấy bã mía 350gsm'
  const silhouetteLabel = profile?.silhouette ? SILHOUETTE_MAP[profile.silhouette] : null

  const displayPrice = item.startingPriceVnd.includes('₫')
    ? item.startingPriceVnd
    : `${item.startingPriceVnd} ₫`

  return (
    <div className="embedded-product-card">
      <div className="embedded-product-header">
        <span className="collection-kicker">Bộ sưu tập MORI</span>
        {silhouetteLabel && <span className="silhouette-badge">{silhouetteLabel}</span>}
      </div>

      <h4 className="embedded-product-title">{title}</h4>
      <p className="embedded-product-subtitle">{subtitle}</p>

      <div className="embedded-product-footer">
        <div className="embedded-product-price">
          <span className="price-label">Giá khởi điểm</span>
          <span className="price-value">{displayPrice}</span>
        </div>

        <Link href={`/products/${item.slug}`} className="embedded-product-action">
          Mở 3D Studio &rarr;
        </Link>
      </div>
    </div>
  )
}

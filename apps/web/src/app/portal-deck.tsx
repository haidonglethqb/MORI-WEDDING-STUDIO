'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { buildCuratedItem } from './collections/collection-types'
import { CollectionCardVisual } from './collections/collection-card-visual'
import { landingPhotos } from './landing-photos'
import type { ShowcaseProduct } from './sample-showcase'

export function PortalDeck({ products }: { products: ShowcaseProduct[] }) {
  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState(0)
  const [throwing, setThrowing] = useState(false)
  const start = useRef<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  const length = products.length
  const turn = (direction: number) => {
    if (length < 2 || throwing) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setIndex((i) => (i + direction + length) % length); setDrag(0); return }
    setThrowing(true); setDrag(direction * -600)
    timer.current = setTimeout(() => { setIndex((i) => (i + direction + length) % length); setDrag(0); setThrowing(false); timer.current = null }, 280)
  }
  if (!length) {
    const photo = landingPhotos.collection
    return (
      <figure className="deck-empty">
        <div className="deck-empty-photo"><Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 900px) 80vw, 30vw" /></div>
        <figcaption><span>ẢNH MINH HỌA</span><p>Bộ sưu tập đang được cập nhật.</p><a href="/collections">Xem bộ sưu tập ↗</a></figcaption>
      </figure>
    )
  }
  return (
    <div className="deck-wrap">
      <div className="portal-deck" tabIndex={0} role="region" aria-label="Bộ sưu tập thiệp. Dùng phím mũi tên để chuyển mẫu."
        onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); turn(e.key === 'ArrowRight' ? 1 : -1) } }}
        onPointerDown={(e) => { if (throwing || length < 2) return; start.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId) }}
        onPointerMove={(e) => { if (start.current !== null) setDrag(e.clientX - start.current) }}
        onPointerCancel={() => { start.current = null; setDrag(0) }}
        onPointerUp={(e) => { if (start.current === null) return; const distance = e.clientX - start.current; start.current = null; if (Math.abs(distance) > e.currentTarget.clientWidth * .1) turn(distance < 0 ? 1 : -1); else setDrag(0) }}>
        {products.map((product, i) => {
          const position = (i - index + length) % length
          if (position > 2) return null
          const item = buildCuratedItem({ slug: product.slug, name: product.name, shape: product.shape, minPriceVnd: product.priceVnd, isFixture: product.isFixture })
          return <div className="deck-card" key={product.slug} aria-hidden={position !== 0} style={{ zIndex: length - position, transform: position === 0 ? `translateX(${drag}px) rotate(${drag / 24}deg)` : `translate(${position * 12}px, ${position * -10}px) rotate(${position * 3}deg) scale(${1 - position * .045})`, transition: start.current !== null && !throwing ? 'none' : undefined }}><CollectionCardVisual item={item} /><div className="deck-caption"><span>{product.isFixture ? 'MẪU MINH HỌA' : 'BỘ SƯU TẬP MORI'}</span><strong>{item.curatedTitle}</strong></div></div>
        })}
      </div>
      <div className="deck-controls"><button type="button" onClick={() => turn(-1)} aria-label="Mẫu trước">←</button><span aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(length).padStart(2, '0')}</span><button type="button" onClick={() => turn(1)} aria-label="Mẫu tiếp theo">→</button></div>
      <p className="deck-hint">KÉO THIỆP HOẶC DÙNG PHÍM MŨI TÊN</p>
      <a className="portal-link" href={`/products/${encodeURIComponent(products[index]?.slug ?? '')}`}>Xem mẫu {products[index]?.name} ↗</a>
    </div>
  )
}

'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const FlatCardScene = dynamic(
  () => import('./flat-card-scene').then((module) => module.FlatCardScene),
  { ssr: false },
)

const BiFoldCardScene = dynamic(
  () => import('./bifold-card-scene').then((module) => module.BiFoldCardScene),
  { ssr: false },
)

export function ProductPreview({ name, shape }: { name: string; shape: string }) {
  const [mode, setMode] = useState<'still' | 'three' | 'fallback'>('still')
  const [openAmount, setOpenAmount] = useState(0)
  const [face, setFace] = useState<'front' | 'back'>('front')
  const bifold = shape === 'BIFOLD'

  return (
    <section>
      <p>Mặt ngoài trước: {name}</p>
      <p>Mặt ngoài sau: {name}</p>
      {bifold ? (
        <label>
          Độ mở
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={openAmount}
            onChange={(event) => setOpenAmount(Number(event.target.value))}
          />
        </label>
      ) : null}
      {mode === 'still' ? (
        <button type="button" onClick={() => setMode('three')}>
          Xem bản 3D
        </button>
      ) : null}
      {mode === 'three' && bifold ? (
        <BiFoldCardScene openAmount={openAmount} onUnavailable={() => setMode('fallback')} />
      ) : null}
      {mode === 'three' && !bifold ? (
        <>
          <p>{face === 'front' ? 'Đang xem mặt trước' : 'Đang xem mặt sau'}</p>
          <button type="button" onClick={() => setFace('front')}>
            Mặt trước
          </button>
          <button type="button" onClick={() => setFace('back')}>
            Mặt sau
          </button>
          <FlatCardScene face={face} onUnavailable={() => setMode('fallback')} />
        </>
      ) : null}
      {mode === 'fallback' ? <p>Không xem được 3D. Dùng các mặt ở trên.</p> : null}
    </section>
  )
}

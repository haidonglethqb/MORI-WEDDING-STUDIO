'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { BiFoldControls, FlatControls } from './preview-controls'
import { PreviewStillCard } from './preview-still-card'

const FlatCardScene = dynamic(
  () => import('./flat-card-scene').then((module) => module.FlatCardScene),
  { ssr: false },
)

const BiFoldCardScene = dynamic(
  () => import('./bifold-card-scene').then((module) => module.BiFoldCardScene),
  { ssr: false },
)

interface ProductPreviewProps {
  slug?: string | undefined
  name?: string | undefined
  shape?: string | undefined
}

export function ProductPreview({ slug = 'editorial-bifold-01', name, shape = 'FLAT' }: ProductPreviewProps) {
  const [mode, setMode] = useState<'three' | 'still' | 'fallback'>('three')
  const [openAmount, setOpenAmount] = useState(0)
  const [face, setFace] = useState<'front' | 'back'>('front')
  const bifold = shape === 'BIFOLD'

  return (
    <div className="preview-container" style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ display: 'inline-flex', gap: '8px', marginBottom: '16px', background: '#f0ede2', padding: '4px', borderRadius: '999px' }}>
        <button
          type="button"
          onClick={() => setMode('three')}
          style={{
            border: 'none',
            background: mode === 'three' ? '#55634f' : 'transparent',
            color: mode === 'three' ? '#f5f4ec' : '#55634f',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ✦ Xem 3D Studio
        </button>
        <button
          type="button"
          onClick={() => setMode('still')}
          style={{
            border: 'none',
            background: mode === 'still' ? '#55634f' : 'transparent',
            color: mode === 'still' ? '#f5f4ec' : '#55634f',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Ảnh mặt phẳng
        </button>
      </div>

      {mode === 'three' && (
        <div>
          <div
            style={{
              minHeight: '440px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, #fcfbf7 0%, #f3eee3 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(85, 99, 79, 0.15)',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {bifold ? (
              <BiFoldCardScene
                slug={slug}
                openAmount={openAmount}
                name={name}
                onUnavailable={() => setMode('fallback')}
              />
            ) : (
              <FlatCardScene
                slug={slug}
                face={face}
                name={name}
                onUnavailable={() => setMode('fallback')}
              />
            )}

            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '0',
                right: '0',
                fontSize: '11px',
                color: '#7a8274',
                letterSpacing: '0.02em',
                pointerEvents: 'none',
              }}
            >
              ✥ Kéo rê chuột để xoay và cảm nhận ánh kim trên sợi giấy 350gsm ✥
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            {bifold ? (
              <BiFoldControls openAmount={openAmount} onChangeOpenAmount={setOpenAmount} />
            ) : (
              <FlatControls face={face} onChangeFace={setFace} />
            )}
          </div>
        </div>
      )}

      {mode === 'still' && <PreviewStillCard slug={slug} />}

      {mode === 'fallback' && (
        <div style={{ padding: '24px', background: '#faf9f5', borderRadius: '8px', fontSize: '13px', color: '#666' }}>
          Trình duyệt không hỗ trợ WebGL tăng tốc 3D. Vui lòng xem bản vẽ tĩnh ở trên.
        </div>
      )}
    </div>
  )
}

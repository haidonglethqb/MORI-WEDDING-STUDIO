'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { BiFoldControls, FlatControls } from './preview-controls'
import { PreviewStillCard } from './preview-still-card'
import { getProductImageUrl } from './product-image'

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
  imageUrl?: string | null | undefined
  title?: string | undefined
}

export function ProductPreview({
  slug = 'editorial-bifold-01',
  name,
  shape = 'FLAT',
  imageUrl,
  title,
}: ProductPreviewProps) {
  const [mode, setMode] = useState<'three' | 'still' | 'fallback'>('three')
  const [openAmount, setOpenAmount] = useState(0)
  const [face, setFace] = useState<'front' | 'back'>('front')
  const bifold = shape === 'BIFOLD'
  const resolvedImageUrl = imageUrl ?? getProductImageUrl(slug)

  return (
    <div className="preview-container" style={{ textAlign: 'center', width: '100%', maxWidth: '100%' }}>
      <div
        role="tablist"
        aria-label="Chế độ xem mẫu thiệp"
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '4px',
          marginBottom: '16px',
          background: 'var(--a-paper, #f3f0e8)',
          border: '1px solid var(--a-line, #e2dccf)',
          padding: '4px',
          borderRadius: '4px',
          maxWidth: '100%',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'three'}
          onClick={() => setMode('three')}
          style={{
            border: 'none',
            background: mode === 'three' ? 'var(--a-forest, #1f3329)' : 'transparent',
            color: mode === 'three' ? 'var(--a-ivory, #ede7dc)' : 'var(--a-text, #1d221e)',
            padding: '7px 14px',
            borderRadius: '2px',
            fontSize: '12px',
            fontWeight: 500,
            margin: 0,
            cursor: 'pointer',
            transition: 'background-color 0.2s, color 0.2s',
          }}
        >
          ✦ Xem 3D Studio
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'still'}
          onClick={() => setMode('still')}
          style={{
            border: 'none',
            background: mode === 'still' ? 'var(--a-forest, #1f3329)' : 'transparent',
            color: mode === 'still' ? 'var(--a-ivory, #ede7dc)' : 'var(--a-text, #1d221e)',
            padding: '7px 14px',
            borderRadius: '2px',
            fontSize: '12px',
            fontWeight: 500,
            margin: 0,
            cursor: 'pointer',
            transition: 'background-color 0.2s, color 0.2s',
          }}
        >
          Ảnh sản phẩm
        </button>
      </div>

      {mode === 'three' && (
        <div>
          <div
            style={{
              minHeight: '420px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, #fffdf8 0%, var(--a-paper, #f3f0e8) 100%)',
              borderRadius: '4px',
              border: '1px solid var(--a-line, #e2dccf)',
              position: 'relative',
              overflow: 'hidden',
              maxWidth: '100%',
            }}
          >
            {bifold ? (
              <BiFoldCardScene
                slug={slug}
                openAmount={openAmount}
                name={name}
                imageUrl={resolvedImageUrl}
                onUnavailable={() => setMode('fallback')}
              />
            ) : (
              <FlatCardScene
                slug={slug}
                face={face}
                name={name}
                imageUrl={resolvedImageUrl}
                onUnavailable={() => setMode('fallback')}
              />
            )}

            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                fontSize: '11px',
                color: 'var(--a-muted, #62675f)',
                letterSpacing: '0.02em',
                pointerEvents: 'none',
              }}
            >
              ✥ Kéo rê chuột để xoay và cảm nhận bề mặt giấy 350gsm ✥
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

      {mode === 'still' && (
        <PreviewStillCard slug={slug} imageUrl={resolvedImageUrl} title={title} />
      )}

      {mode === 'fallback' && (
        <div>
          <PreviewStillCard slug={slug} imageUrl={resolvedImageUrl} title={title} />
          <p
            style={{
              marginTop: '10px',
              fontSize: '12px',
              color: 'var(--a-muted, #62675f)',
            }}
          >
            Trình duyệt chưa hỗ trợ WebGL tăng tốc 3D — đang hiển thị ảnh sản phẩm.
          </p>
        </div>
      )}
    </div>
  )
}

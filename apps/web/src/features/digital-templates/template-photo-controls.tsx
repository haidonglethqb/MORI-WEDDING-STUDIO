'use client'

import { useState, type ClipboardEvent } from 'react'
import { CURATED_PHOTO_PRESETS } from './digital-template-presets'
import type { DigitalInvitationModel } from './digital-template-types'
import { compressImageFileToDataUrl } from './photo-upload-helper'

interface Props {
  model: DigitalInvitationModel
  onChange: (next: DigitalInvitationModel) => void
}

export function TemplatePhotoControls({ model, onChange }: Props) {
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [pasteHint, setPasteHint] = useState<string>('')

  function updatePhotos(patch: Partial<DigitalInvitationModel['photos']>) {
    onChange({ ...model, photos: { ...model.photos, ...patch } })
  }

  async function handleFileUpload(file: File | undefined, target: 'hero' | 'gallery') {
    if (!file) return
    setUploadError(null)
    try {
      const dataUrl = await compressImageFileToDataUrl(file)
      if (target === 'hero') {
        updatePhotos({ heroUrl: dataUrl })
        setPasteHint('Đã cập nhật ảnh bìa ✓')
      } else {
        const next = [...model.photos.galleryUrls, dataUrl].slice(-3)
        updatePhotos({ galleryUrls: next })
        setPasteHint('Đã thêm ảnh vào album ✓')
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Không thể xử lý ảnh tải lên.')
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLElement>, target: 'hero' | 'gallery') {
    const imgItem = Array.from(e.clipboardData?.items ?? []).find((item) => item.type.startsWith('image/'))
    const file = imgItem?.getAsFile()
    if (!file) return
    e.preventDefault()
    void handleFileUpload(file, target)
  }

  function addPresetToGallery(url: string) {
    const next = [...model.photos.galleryUrls.filter((u) => u !== url), url].slice(0, 3)
    updatePhotos({ galleryUrls: next })
  }

  function removeGalleryAt(index: number) {
    updatePhotos({ galleryUrls: model.photos.galleryUrls.filter((_, i) => i !== index) })
  }

  return (
    <div className="cfg-stack" onPaste={(e) => handlePaste(e, 'hero')}>
      {uploadError ? <div className="cfg-error-note">{uploadError}</div> : null}
      {pasteHint ? <small className="cfg-ai-feedback">{pasteHint}</small> : null}

      <div className="cfg-block">
        <label className="cfg-label">Ảnh bìa cặp đôi (Hero Portrait)</label>
        <div className="cfg-photo-current">
          {model.photos.heroUrl ? (
            <img src={model.photos.heroUrl} alt="Ảnh bìa hiện tại" className="cfg-hero-thumb" />
          ) : null}
          <div className="cfg-photo-actions">
            <div className="cfg-photo-btn-row">
              <label className="cfg-upload-btn">
                Tải ảnh từ máy
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    void handleFileUpload(e.target.files?.[0], 'hero')
                    e.currentTarget.value = ''
                  }}
                />
              </label>
              {model.photos.heroUrl ? (
                <button type="button" className="cfg-mini-btn" onClick={() => updatePhotos({ heroUrl: '' })}>
                  Bỏ ảnh bìa
                </button>
              ) : null}
            </div>
            <div
              className="cfg-paste-zone"
              tabIndex={0}
              onPaste={(e) => handlePaste(e, 'hero')}
            >
              Mẹo: Bấm vào đây rồi nhấn <strong>Ctrl+V</strong> để dán trực tiếp ảnh cưới từ máy tính
            </div>
          </div>
        </div>

        <span className="cfg-sub-label">Hoặc chọn nhanh từ thư viện ảnh cưới mẫu:</span>
        <div className="cfg-preset-grid">
          {CURATED_PHOTO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`cfg-preset-item ${model.photos.heroUrl === preset.url ? 'is-active' : ''}`}
              onClick={() => updatePhotos({ heroUrl: preset.url })}
              title={preset.label}
            >
              <img src={preset.url} alt={preset.label} />
            </button>
          ))}
        </div>
      </div>

      <div className="cfg-block" onPaste={(e) => handlePaste(e, 'gallery')}>
        <label className="cfg-label">Album ảnh cưới (tối đa 3 ảnh · hỗ trợ tải máy hoặc Ctrl+V)</label>
        <div className="cfg-gallery-list">
          {model.photos.galleryUrls.map((url, idx) => (
            <div key={`${idx}-${url.slice(0, 20)}`} className="cfg-gallery-chip">
              <img src={url} alt={`Album ${idx + 1}`} />
              <button type="button" onClick={() => removeGalleryAt(idx)} aria-label="Xóa ảnh">
                ✕
              </button>
            </div>
          ))}
          {model.photos.galleryUrls.length < 3 ? (
            <label className="cfg-gallery-add">
              + Tải ảnh
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  void handleFileUpload(e.target.files?.[0], 'gallery')
                  e.currentTarget.value = ''
                }}
              />
            </label>
          ) : null}
        </div>
        <div className="cfg-preset-pills">
          {CURATED_PHOTO_PRESETS.slice(0, 4).map((p) => (
            <button
              key={p.id}
              type="button"
              className="cfg-pill-btn"
              onClick={() => addPresetToGallery(p.url)}
            >
              + {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cfg-block">
        <label className="cfg-label" htmlFor="cfg-story-caption">Câu chuyện tình yêu / Chú thích album</label>
        <textarea
          id="cfg-story-caption"
          className="cfg-textarea"
          value={model.photos.storyCaption}
          onChange={(e) => updatePhotos({ storyCaption: e.target.value })}
        />
      </div>
    </div>
  )
}

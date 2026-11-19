'use client'

import { buildDefaultConfig, TEMPLATE_DEFINITIONS } from './digital-template-presets'
import type { DigitalInvitationModel, DigitalTemplateId, ResolvedTemplateConfig } from './digital-template-types'

interface Props {
  model: DigitalInvitationModel
  onChange: (next: DigitalInvitationModel) => void
}

const TOGGLE_LABELS: { key: keyof ResolvedTemplateConfig; label: string }[] = [
  { key: 'showFamilies', label: 'Hiện thông tin 2 bên gia đình' },
  { key: 'showLunarDate', label: 'Hiện ngày Âm lịch' },
  { key: 'showSchedule', label: 'Hiện lịch trình buổi lễ' },
  { key: 'showGallery', label: 'Hiện Album ảnh & Câu chuyện' },
  { key: 'showCountdown', label: 'Hiện đồng hồ đếm ngược' },
  { key: 'showMapButton', label: 'Hiện nút chỉ đường Google Maps' },
  { key: 'showAudio', label: 'Hiện trình phát nhạc nền' },
]

export function CustomizerStyleTab({ model, onChange }: Props) {
  const activeDef = TEMPLATE_DEFINITIONS[model.templateId]
  const cfg = model.templateConfig

  function selectTemplate(templateId: DigitalTemplateId) {
    onChange({
      ...model,
      templateId,
      templateConfig: {
        ...buildDefaultConfig(templateId),
        showFamilies: cfg.showFamilies,
        showLunarDate: cfg.showLunarDate,
        showGallery: cfg.showGallery,
        showSchedule: cfg.showSchedule,
        showCountdown: cfg.showCountdown,
        showMapButton: cfg.showMapButton,
        showAudio: cfg.showAudio,
      },
    })
  }

  function patchConfig(patch: Partial<ResolvedTemplateConfig>) {
    onChange({ ...model, templateConfig: { ...cfg, ...patch } })
  }

  return (
    <div className="cfg-stack">
      <div className="cfg-block">
        <span className="cfg-label">1. Chọn bản thiết kế mẫu (3 Template chuẩn)</span>
        <div className="cfg-template-cards">
          {Object.values(TEMPLATE_DEFINITIONS).map((def) => (
            <button
              key={def.id}
              type="button"
              className={`cfg-template-card ${model.templateId === def.id ? 'is-active' : ''}`}
              onClick={() => selectTemplate(def.id)}
            >
              <strong>{def.name}</strong>
              <small>{def.tagline}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="cfg-block">
        <span className="cfg-label">2. Bảng màu riêng của {activeDef.name}</span>
        <div className="cfg-swatch-row">
          {activeDef.palettes.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`cfg-swatch-btn ${cfg.paletteId === p.id ? 'is-active' : ''}`}
              onClick={() => patchConfig({ paletteId: p.id })}
            >
              <span className="cfg-swatch-dot" style={{ background: p.bg, borderColor: p.accent }}>
                <i style={{ background: p.accent }} />
              </span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="cfg-two-col">
        <div className="cfg-block">
          <span className="cfg-label">3. Kiểu khung viền</span>
          <div className="cfg-pill-group">
            {activeDef.frames.map((frame) => (
              <button
                key={frame.id}
                type="button"
                className={`cfg-pill-btn ${cfg.frameStyle === frame.id ? 'is-active' : ''}`}
                onClick={() => patchConfig({ frameStyle: frame.id })}
              >
                {frame.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cfg-block">
          <span className="cfg-label">4. Huy hiệu / Họa tiết</span>
          <div className="cfg-pill-group">
            {activeDef.motifs.map((motif) => (
              <button
                key={motif.id}
                type="button"
                className={`cfg-pill-btn ${cfg.motifStyle === motif.id ? 'is-active' : ''}`}
                onClick={() => patchConfig({ motifStyle: motif.id })}
              >
                {motif.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cfg-block">
        <span className="cfg-label">5. Bật / Tắt các khối nội dung trên thiệp</span>
        <div className="cfg-toggles-grid">
          {TOGGLE_LABELS.map((item) => (
            <label key={item.key} className="cfg-toggle-row">
              <input
                type="checkbox"
                checked={Boolean(cfg[item.key])}
                onChange={(e) => patchConfig({ [item.key]: e.target.checked })}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

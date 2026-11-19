'use client'

import type { DigitalInvitationModel } from './digital-template-types'

interface Props {
  model: DigitalInvitationModel
  onChange: (next: DigitalInvitationModel) => void
}

export function CustomizerCoupleTab({ model, onChange }: Props) {
  function setName(idx: 0 | 1, value: string) {
    const next: [string, string] = [...model.displayNames] as [string, string]
    next[idx] = value
    onChange({ ...model, displayNames: next })
  }

  function setRole(idx: 0 | 1, value: string) {
    const next: [string, string] = [...model.coupleRoles] as [string, string]
    next[idx] = value
    onChange({ ...model, coupleRoles: next })
  }

  function patchFamilies(patch: Partial<DigitalInvitationModel['families']>) {
    onChange({ ...model, families: { ...model.families, ...patch } })
  }

  return (
    <div className="cfg-stack">
      <div className="cfg-two-col">
        <div className="cfg-block">
          <label className="cfg-label">Tên Chú Rể</label>
          <input className="cfg-input" value={model.displayNames[0]} onChange={(e) => setName(0, e.target.value)} />
        </div>
        <div className="cfg-block">
          <label className="cfg-label">Tên Cô Dâu</label>
          <input className="cfg-input" value={model.displayNames[1]} onChange={(e) => setName(1, e.target.value)} />
        </div>
      </div>

      <div className="cfg-two-col">
        <div className="cfg-block">
          <label className="cfg-label">Vai vế Chú Rể</label>
          <input className="cfg-input" value={model.coupleRoles[0]} onChange={(e) => setRole(0, e.target.value)} />
        </div>
        <div className="cfg-block">
          <label className="cfg-label">Vai vế Cô Dâu</label>
          <input className="cfg-input" value={model.coupleRoles[1]} onChange={(e) => setRole(1, e.target.value)} />
        </div>
      </div>

      <div className="cfg-block">
        <label className="cfg-label">Tiêu đề buổi lễ</label>
        <input
          className="cfg-input"
          value={model.eventTitle}
          onChange={(e) => onChange({ ...model, eventTitle: e.target.value })}
        />
      </div>

      <div className="cfg-block">
        <label className="cfg-label">Lời ngỏ gửi khách mời</label>
        <textarea
          className="cfg-textarea"
          value={model.greeting}
          onChange={(e) => onChange({ ...model, greeting: e.target.value })}
        />
      </div>

      <div className="cfg-two-col">
        <div className="cfg-block">
          <label className="cfg-label">Phụ huynh Nhà Trai</label>
          <input
            className="cfg-input"
            value={model.families.groomParents}
            onChange={(e) => patchFamilies({ groomParents: e.target.value })}
          />
          <input
            className="cfg-input"
            style={{ marginTop: 6 }}
            placeholder="Quê quán / Địa chỉ nhà trai"
            value={model.families.groomOrigin}
            onChange={(e) => patchFamilies({ groomOrigin: e.target.value })}
          />
        </div>

        <div className="cfg-block">
          <label className="cfg-label">Phụ huynh Nhà Gái</label>
          <input
            className="cfg-input"
            value={model.families.brideParents}
            onChange={(e) => patchFamilies({ brideParents: e.target.value })}
          />
          <input
            className="cfg-input"
            style={{ marginTop: 6 }}
            placeholder="Quê quán / Địa chỉ nhà gái"
            value={model.families.brideOrigin}
            onChange={(e) => patchFamilies({ brideOrigin: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

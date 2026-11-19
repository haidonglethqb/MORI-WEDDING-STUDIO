'use client'

import { useState } from 'react'
import { CustomizerCoupleTab } from './customizer-couple-tab'
import { CustomizerScheduleTab } from './customizer-schedule-tab'
import { CustomizerStyleTab } from './customizer-style-tab'
import type { DigitalInvitationModel } from './digital-template-types'
import { TemplatePhotoControls } from './template-photo-controls'

type TabId = 'style' | 'couple' | 'schedule' | 'photos'

const TABS: { id: TabId; label: string }[] = [
  { id: 'style', label: 'Giao diện & Config' },
  { id: 'couple', label: 'Dâu Rể & Gia đình' },
  { id: 'schedule', label: 'Lịch & Địa điểm' },
  { id: 'photos', label: 'Ảnh & Chuyện tình' },
]

interface Props {
  model: DigitalInvitationModel
  onChange: (next: DigitalInvitationModel) => void
}

export function TemplateCustomizerPanel({ model, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('style')

  return (
    <div className="cfg-panel">
      <div className="cfg-tabs-bar" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`cfg-tab-btn ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="cfg-tab-body">
        {activeTab === 'style' ? <CustomizerStyleTab model={model} onChange={onChange} /> : null}
        {activeTab === 'couple' ? <CustomizerCoupleTab model={model} onChange={onChange} /> : null}
        {activeTab === 'schedule' ? <CustomizerScheduleTab model={model} onChange={onChange} /> : null}
        {activeTab === 'photos' ? <TemplatePhotoControls model={model} onChange={onChange} /> : null}
      </div>
    </div>
  )
}

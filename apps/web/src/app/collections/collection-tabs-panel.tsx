'use client'

import { useEffect, useState } from 'react'
import { CollectionFilters } from './collection-filters'
import { ComboBuilder, type ComboDigitalOption, type ComboPaperOption } from './combo-builder'
import { CustomDesignPanel } from './custom-design-panel'
import { OnlineInvitationsSection } from './online-invitations-section'
import { PriceCalculator, type CalculatorOption } from './price-calculator'
import type { CollectionItem } from './collection-types'
import './collection-panels.css'

export type CollectionGroupTab = 'all' | 'paper' | 'online' | 'combo' | 'custom'

interface CollectionTabsPanelProps {
  paperItems: CollectionItem[]
  digitalItems: CollectionItem[]
  calculatorOptions: CalculatorOption[]
  comboPaperOptions: ComboPaperOption[]
  comboDigitalOptions: ComboDigitalOption[]
  initialTab?: CollectionGroupTab | undefined
}

const TABS: { id: CollectionGroupTab; label: string; badge?: string }[] = [
  { id: 'all', label: 'Tất cả 4 nhóm' },
  { id: 'paper', label: 'Thiệp cưới vật lý', badge: '50 mẫu' },
  { id: 'online', label: 'Thiệp online', badge: '399k–599k' },
  { id: 'combo', label: 'Combo thiệp cưới', badge: 'Giảm 50%' },
  { id: 'custom', label: 'Thiết kế riêng' },
]

function parseTabParam(raw: string | null): CollectionGroupTab {
  if (raw === 'paper' || raw === 'online' || raw === 'combo' || raw === 'custom') {
    return raw
  }
  return 'all'
}

export function CollectionTabsPanel({
  paperItems,
  digitalItems,
  calculatorOptions,
  comboPaperOptions,
  comboDigitalOptions,
  initialTab = 'all',
}: CollectionTabsPanelProps) {
  const [activeTab, setActiveTab] = useState<CollectionGroupTab>(initialTab)

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      setActiveTab(parseTabParam(params.get('tab')))
    }
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  function selectTab(next: CollectionGroupTab) {
    setActiveTab(next)
    const params = new URLSearchParams(window.location.search)
    if (next === 'all') {
      params.delete('tab')
    } else {
      params.set('tab', next)
    }
    const qs = params.toString()
    window.history.pushState({}, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
  }

  return (
    <div>
      <div className="collection-tabs-bar" role="tablist" aria-label="Nhóm sản phẩm thiệp cưới">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`collection-main-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
            {tab.badge ? <span className="collection-tab-badge">{tab.badge}</span> : null}
          </button>
        ))}
      </div>

      {activeTab === 'all' || activeTab === 'paper' ? (
        <section className="group-section-wrap" id="thiep-vat-ly">
          <div className="group-section-head">
            <span className="group-eyebrow">Nhóm 1 · Thiệp cưới vật lý</span>
            <h2>50 mẫu thiệp cưới in giấy mỹ thuật 350gsm</h2>
            <p className="group-section-desc">
              Lọc theo phong cách và quy cách khổ phẳng hoặc khổ gấp đôi, xem dự toán nhanh theo số lượng in.
            </p>
          </div>
          <a href="#du-toan" className="calculator-jump">
            Xem dự toán theo số lượng ↓
          </a>
          <CollectionFilters items={paperItems} />
          <PriceCalculator options={calculatorOptions} />
        </section>
      ) : null}

      {activeTab === 'all' || activeTab === 'online' ? (
        <OnlineInvitationsSection items={digitalItems} />
      ) : null}

      {activeTab === 'all' || activeTab === 'combo' ? (
        <ComboBuilder
          paperOptions={comboPaperOptions}
          digitalOptions={comboDigitalOptions}
        />
      ) : null}

      {activeTab === 'all' || activeTab === 'custom' ? <CustomDesignPanel /> : null}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { AdminAiConfigTab } from './admin-ai-config-tab'
import { AdminAiLogs } from './admin-ai-logs'
import type { InitialConfigPayload } from './admin-ai-types'
import { AdminStorefrontInbox } from './admin-storefront-inbox'
import { AdminUserQuotasTab } from './admin-user-quotas-tab'

export type AdminAiTabKey = 'logs' | 'storefront' | 'quotas' | 'config'

export function AdminAiManager({
  initial,
  initialTab = 'logs',
}: {
  initial: InitialConfigPayload
  initialTab?: AdminAiTabKey
}) {
  const [activeTab, setActiveTab] = useState<AdminAiTabKey>(initialTab)

  return (
    <div className="admin-ai-card">
      <div className="admin-nav-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'logs'}
          className={`nav-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          ✦ Hội thoại Chatbot &amp; Hỗ trợ Khách hàng
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'storefront'}
          className={`nav-tab-btn ${activeTab === 'storefront' ? 'active' : ''}`}
          onClick={() => setActiveTab('storefront')}
        >
          ✦ Đơn đặt hàng &amp; Thiết kế riêng
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'quotas'}
          className={`nav-tab-btn ${activeTab === 'quotas' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotas')}
        >
          ✦ Hạn mức AI từng User
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'config'}
          className={`nav-tab-btn ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          ✦ Cấu hình Mô hình AI
        </button>
      </div>

      {activeTab === 'logs' ? (
        <AdminAiLogs />
      ) : activeTab === 'storefront' ? (
        <AdminStorefrontInbox />
      ) : activeTab === 'quotas' ? (
        <AdminUserQuotasTab />
      ) : (
        <AdminAiConfigTab initial={initial} />
      )}
    </div>
  )
}

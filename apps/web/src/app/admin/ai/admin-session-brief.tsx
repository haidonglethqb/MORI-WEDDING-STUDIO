'use client'

import type { AiConversationSession } from './admin-ai-types'

export function AdminSessionBrief({ brief }: { brief: AiConversationSession['brief'] }) {
  const hasInfo = Boolean(
    brief.coupleNames ||
      brief.weddingDate ||
      brief.location ||
      brief.guestCount ||
      brief.budget ||
      brief.aesthetic ||
      brief.targetShape,
  )

  return (
    <div className="session-brief-card">
      <div className="brief-card-title">✦ Thông tin tiệc cưới của phiên này (Context)</div>
      {hasInfo ? (
        <div className="brief-grid">
          {brief.coupleNames && (
            <div className="brief-item">
              <span className="brief-label">Cặp đôi:</span>
              <span className="brief-value">{brief.coupleNames}</span>
            </div>
          )}
          {brief.weddingDate && (
            <div className="brief-item">
              <span className="brief-label">Ngày cưới:</span>
              <span className="brief-value">{brief.weddingDate}</span>
            </div>
          )}
          {brief.location && (
            <div className="brief-item">
              <span className="brief-label">Địa điểm:</span>
              <span className="brief-value">{brief.location}</span>
            </div>
          )}
          {brief.guestCount && (
            <div className="brief-item">
              <span className="brief-label">Số khách:</span>
              <span className="brief-value">{brief.guestCount} khách</span>
            </div>
          )}
          {brief.aesthetic && (
            <div className="brief-item">
              <span className="brief-label">Phong cách:</span>
              <span className="brief-value">{brief.aesthetic}</span>
            </div>
          )}
          {brief.budget && (
            <div className="brief-item">
              <span className="brief-label">Ngân sách dự kiến:</span>
              <span className="brief-value">{Number(brief.budget).toLocaleString('vi-VN')} ₫</span>
            </div>
          )}
        </div>
      ) : (
        <div className="brief-empty-note">Chưa trích xuất thông tin cặp đôi cụ thể.</div>
      )}
    </div>
  )
}

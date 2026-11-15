'use client'

import type { ReactNode } from 'react'
import type { ChatMessageItem } from './assistant-types'
import { AssistantProductCard } from './assistant-product-card'

interface ChatBubbleProps {
  message: ChatMessageItem
}

function formatVnd(val: string): string {
  return val.includes('₫') ? val : `${val} ₫`
}

function renderFormattedMessage(content: string): ReactNode {
  const paragraphs = content.split(/\n\s*\n/)
  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n').filter((l) => l.trim().length > 0)
    return (
      <div key={pIdx} className="bubble-paragraph">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim()
          const isBullet =
            trimmed.startsWith('- ') || trimmed.startsWith('• ') || /^\d+\.\s/.test(trimmed)
          const cleanLine = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '')
          const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g)
          const renderedParts = parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIdx}>{part.slice(2, -2)}</strong>
            }
            return part
          })

          return (
            <div key={lIdx} className={isBullet ? 'bubble-bullet-line' : 'bubble-standard-line'}>
              {isBullet && <span className="bullet-dot" aria-hidden="true">✦</span>}
              <span className="bullet-content">{renderedParts}</span>
            </div>
          )
        })}
      </div>
    )
  })
}

export function AssistantChatBubble({ message }: ChatBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="chat-row user-row">
        <div className="user-bubble">
          <p className="bubble-text">{message.content}</p>
        </div>
      </div>
    )
  }

  const isStaff = message.senderType === 'staff'
  const isSystem = message.senderType === 'system'

  return (
    <div className={`chat-row assistant-row ${isStaff ? 'is-staff-row' : ''}`}>
      <div className={`atelier-avatar ${isStaff ? 'is-staff-avatar' : ''}`} aria-hidden="true">
        <span>{isStaff ? 'NV' : 'M'}</span>
      </div>
      <div className="assistant-bubble-container">
        <div className="assistant-bubble-header">
          <span className="atelier-name">
            {isStaff
              ? message.senderLabel || 'Nhân viên tư vấn MORI'
              : isSystem
                ? message.senderLabel || 'Hệ thống hỗ trợ MORI'
                : 'Trợ lý MORI'}
          </span>
          <span className={`atelier-role ${isStaff ? 'is-staff-badge' : ''}`}>
            {isStaff ? 'Hỗ trợ trực tiếp' : isSystem ? 'Đã chuyển tiếp' : 'Tư vấn viên AI'}
          </span>
        </div>

        <div
          className={`assistant-bubble-content ${
            isStaff ? 'staff-bubble-content' : isSystem ? 'system-bubble-content' : ''
          }`}
        >
          <div className="bubble-text-flow">{renderFormattedMessage(message.content)}</div>
        </div>

        {message.products && message.products.length > 0 && (
          <div className="embedded-products-grid">
            {message.products.map((prod) => (
              <AssistantProductCard key={prod.slug} item={prod} />
            ))}
          </div>
        )}

        {message.budget && (
          <div className="embedded-budget-card">
            <div className="budget-header">
              <span className="budget-title">Dự toán may đo ước tính</span>
              <span className="budget-shape-badge">
                {message.budget.quantity} bộ thiệp (
                {message.budget.shape === 'BIFOLD' ? 'Gập đôi' : 'Khổ phẳng'})
              </span>
            </div>

            <div className="budget-breakdown">
              <div className="budget-row">
                <span>Chi phí phôi thiệp:</span>
                <strong>{formatVnd(message.budget.baseAmountVnd)}</strong>
              </div>
              <div className="budget-row">
                <span>Gia công theo lựa chọn:</span>
                <strong>{formatVnd(message.budget.finishesAmountVnd)}</strong>
              </div>
              <div className="budget-row budget-total-row">
                <span>Tổng chi phí dự kiến:</span>
                <strong className="total-gold-text">{formatVnd(message.budget.totalAmountVnd)}</strong>
              </div>
            </div>

            {message.budget.giftComplimentary && (
              <div className="budget-gift-card">
                <span className="gift-badge">Đặc quyền đính kèm</span>
                <span className="gift-text">{message.budget.giftComplimentary}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

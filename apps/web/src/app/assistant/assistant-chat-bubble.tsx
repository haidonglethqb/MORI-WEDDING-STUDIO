'use client'

import type { ChatMessageItem } from './assistant-types'
import { AssistantProductCard } from './assistant-product-card'

interface ChatBubbleProps {
  message: ChatMessageItem
}

function formatVnd(val: string): string {
  return val.includes('₫') ? val : `${val} ₫`
}

export function AssistantChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="chat-row user-row">
        <div className="user-bubble">
          <p className="bubble-text">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-row assistant-row">
      <div className="atelier-avatar" aria-hidden="true">
        <span>M</span>
      </div>
      <div className="assistant-bubble-container">
        <div className="assistant-bubble-header">
          <span className="atelier-name">Pierre-Minh &amp; Vũ Cầm</span>
          <span className="atelier-role">Nghệ nhân MORI</span>
        </div>

        <div className="assistant-bubble-content">
          <p className="bubble-text">{message.content}</p>
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
                {message.budget.quantity} bộ thiệp ({message.budget.shape})
              </span>
            </div>

            <div className="budget-breakdown">
              <div className="budget-row">
                <span>Phôi thiệp giấy bã mía 350gsm:</span>
                <strong>{formatVnd(message.budget.baseAmountVnd)}</strong>
              </div>
              <div className="budget-row">
                <span>Gia công ép kim 160°C &amp; mép xé:</span>
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

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
      <div className="assistant-avatar">⚜️</div>
      <div className="assistant-bubble-container">
        <div className="assistant-bubble-header">
          <span className="atelier-name">Master Pierre-Minh &amp; Vũ Cầm</span>
          {message.meta && (
            <span className="model-telemetry-badge" title={`Thời gian xử lý: ${message.meta.latencyMs}ms`}>
              ⚡ {message.meta.modelUsed.replace('openai/', '').replace('qwen/', '')} · {message.meta.latencyMs}ms
            </span>
          )}
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
              <span className="budget-title">📊 DỰ TOÁN CHI PHÍ MAY ĐO ATELIER</span>
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
                <span>Tổng chi phí ước tính:</span>
                <strong className="total-gold-text">{formatVnd(message.budget.totalAmountVnd)}</strong>
              </div>
            </div>

            {message.budget.giftComplimentary && (
              <div className="budget-gift-pill">
                🎁 <span>{message.budget.giftComplimentary}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

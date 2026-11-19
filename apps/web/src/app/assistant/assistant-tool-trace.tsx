'use client'

import { useState } from 'react'
import type { AgentToolTraceItem } from './assistant-types'

interface Props {
  traces: AgentToolTraceItem[]
  live?: boolean
  statusText?: string
}

export function AssistantToolTrace({ traces, live = false, statusText }: Props) {
  const [expanded, setExpanded] = useState(live)

  if (!live && traces.length === 0) return null

  if (live) {
    return (
      <div className="agent-working-card" role="status" aria-live="polite">
        <div className="agent-working-beam" aria-hidden="true" />
        <div className="agent-working-head">
          <span className="agent-working-orb" aria-hidden="true" />
          <span className="agent-working-title">
            {statusText || 'MORI Agent đang phân tích & kiểm tra dữ liệu...'}
          </span>
        </div>

        {traces.length > 0 ? (
          <ul className="agent-live-steps">
            {traces.map((t) => (
              <li key={t.id} className={`agent-live-step is-${t.status}`}>
                <span className="agent-step-indicator" aria-hidden="true">
                  {t.status === 'running' ? (
                    <span className="agent-step-spinner" />
                  ) : t.status === 'done' ? (
                    <span className="agent-step-check">✓</span>
                  ) : (
                    <span className="agent-step-err">!</span>
                  )}
                </span>
                <div className="agent-step-copy">
                  <strong>{t.label}</strong>
                  {t.summary ? <span> — {t.summary}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="agent-thinking-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`agent-trace-pill-wrap ${expanded ? 'is-open' : ''}`}>
      <button
        type="button"
        className="agent-trace-toggle"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span className="agent-trace-spark" aria-hidden="true">✦</span>
        <span>Đã hoàn tất {traces.length} bước tra cứu &amp; chuẩn bị</span>
        <span className="agent-trace-caret" aria-hidden="true">{expanded ? '▴' : '▾'}</span>
      </button>

      {expanded ? (
        <ul className="agent-trace-list">
          {traces.map((t) => (
            <li key={t.id} className="agent-trace-item">
              <span className="agent-step-check is-sm" aria-hidden="true">✓</span>
              <div className="agent-trace-text">
                <strong>{t.label}</strong>
                {t.summary ? <span> — {t.summary}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

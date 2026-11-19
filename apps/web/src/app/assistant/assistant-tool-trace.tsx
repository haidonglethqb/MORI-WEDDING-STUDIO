'use client'

import { useState } from 'react'
import type { AgentToolTraceItem } from './assistant-types'

interface Props {
  traces: AgentToolTraceItem[]
  live?: boolean
}

export function AssistantToolTrace({ traces, live = false }: Props) {
  const [expanded, setExpanded] = useState(live || traces.length <= 2)
  if (traces.length === 0) return null

  return (
    <div className="agent-trace-box">
      <button
        type="button"
        className="agent-trace-toggle"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className="agent-trace-spark">✦</span>
        <span>
          {live
            ? 'Agent đang xử lý các bước...'
            : `MORI Agent đã thực hiện ${traces.length} bước kiểm tra`}
        </span>
        <span className="agent-trace-caret">{expanded ? '▴' : '▾'}</span>
      </button>

      {expanded ? (
        <ul className="agent-trace-list">
          {traces.map((t) => (
            <li key={t.id} className={`agent-trace-item is-${t.status}`}>
              <span className="agent-trace-icon" aria-hidden="true">
                {t.status === 'running' ? '◌' : t.status === 'done' ? '✓' : '!'}
              </span>
              <div className="agent-trace-text">
                <strong>{t.label}</strong>
                {t.summary ? <span> — {t.summary}</span> : null}
              </div>
              {typeof t.durationMs === 'number' ? (
                <small className="agent-trace-ms">{t.durationMs}ms</small>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

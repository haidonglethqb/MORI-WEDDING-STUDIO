'use client'

import { useState } from 'react'
import type { AdminProposedActionItem, AdminToolTraceItem } from './admin-ai-types'

interface Props {
  toolTraces?: AdminToolTraceItem[] | undefined
  proposedActions?: AdminProposedActionItem[] | undefined
}

function formatJson(data: Record<string, unknown> | undefined): string {
  if (!data || Object.keys(data).length === 0) return '{}'
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return '{}'
  }
}

export function AdminTurnToolInspector({ toolTraces, proposedActions }: Props) {
  const traces = toolTraces ?? []
  const actions = proposedActions ?? []
  const [openAll, setOpenAll] = useState(false)

  if (traces.length === 0 && actions.length === 0) return null

  const totalMs = traces.reduce((acc, t) => acc + (t.durationMs ?? 0), 0)

  return (
    <div className="admin-tool-inspector">
      <div className="admin-tool-inspector-head">
        <div className="admin-tool-inspector-title">
          <span className="admin-tool-gear" aria-hidden="true">⚙</span>
          <strong>
            Agent Tool Calls ({traces.length} tool · {totalMs}ms)
          </strong>
        </div>
        {traces.length > 0 ? (
          <button
            type="button"
            className="admin-tool-expand-btn"
            onClick={() => setOpenAll((prev) => !prev)}
          >
            {openAll ? 'Thu gọn JSON' : 'Mở xem tất cả Input / Output'}
          </button>
        ) : null}
      </div>

      {traces.length > 0 ? (
        <div className="admin-tool-list">
          {traces.map((trace) => (
            <details key={trace.id} className="admin-tool-row" open={openAll || undefined}>
              <summary className="admin-tool-summary">
                <span className={`admin-tool-status is-${trace.status}`}>
                  {trace.status === 'done' ? '✓' : trace.status === 'error' ? '!' : '◌'}
                </span>
                <code className="admin-tool-name">{trace.tool}</code>
                <span className="admin-tool-label">{trace.label}</span>
                {trace.summary ? (
                  <span className="admin-tool-outcome">— {trace.summary}</span>
                ) : null}
                {typeof trace.durationMs === 'number' ? (
                  <span className="admin-tool-ms">{trace.durationMs}ms</span>
                ) : null}
              </summary>

              <div className="admin-tool-io-grid">
                <div className="admin-tool-io-col">
                  <span className="admin-tool-io-label">INPUT (ARGUMENTS)</span>
                  <pre className="admin-tool-json">{formatJson(trace.input)}</pre>
                </div>
                <div className="admin-tool-io-col">
                  <span className="admin-tool-io-label">OUTPUT (RESULT)</span>
                  <pre className="admin-tool-json">{formatJson(trace.output)}</pre>
                </div>
              </div>
            </details>
          ))}
        </div>
      ) : null}

      {actions.length > 0 ? (
        <div className="admin-actions-bar">
          <span className="admin-tool-io-label">ACTION CARDS ĐÃ TẠO:</span>
          <div className="admin-action-pills">
            {actions.map((act, idx) => (
              <span key={`${act.type}-${idx}`} className="admin-action-pill">
                <code>{act.type}</code> · {act.title}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

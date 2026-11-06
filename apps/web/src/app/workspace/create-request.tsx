'use client'

import { useRef, useState } from 'react'
import './request-stepper.css'

type RequestKind = 'PAPER' | 'DIGITAL'
export function CreateDesignRequest() {
  const key = useRef<string | null>(null)
  const [step, setStep] = useState(0)
  const [kind, setKind] = useState<RequestKind | null>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function create() {
    if (!kind || loading) return
    setStatus('Đang tạo yêu cầu...'); setLoading(true)
    if (!key.current) key.current = `design-${crypto.randomUUID()}`
    try {
      const response = await fetch('/workspace/request', {
        method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
        body: JSON.stringify({ kind }),
      })
      if (!response.ok) throw new Error('request failed')
      const created = (await response.json()) as { requestId: string }
      window.location.assign(`/requests/${created.requestId}`)
    } catch {
      setStatus('Chưa tạo được yêu cầu. Vui lòng thử lại.'); setLoading(false)
    }
  }

  return <div className="request-stepper">
    <ol className="request-stepper-progress" aria-label="Các bước tạo yêu cầu">
      {['Chọn loại thiệp', 'Kiểm tra & tạo'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={step >= index ? 'is-active' : ''}><span>{index + 1}</span>{label}</li>)}
    </ol>
    <div className="request-stepper-content" key={step}>
      {step === 0 ? <><h3>Bạn muốn tạo loại thiệp nào?</h3><p>Chọn loại phù hợp để bắt đầu trao đổi cùng xưởng.</p><div className="request-kind-grid">{([['PAPER', 'Thiệp giấy', 'Trao đổi thiết kế và quy cách in'], ['DIGITAL', 'Thiệp trực tuyến', 'Trao đổi thiết kế thiệp số']] as const).map(([value, title, hint]) => <button type="button" key={value} aria-pressed={kind === value} className={kind === value ? 'is-selected' : ''} onClick={() => { if (kind !== value) key.current = null; setKind(value) }}><strong>{title}</strong><span>{hint}</span></button>)}</div></> : <><h3>Kiểm tra lựa chọn</h3><p>Bạn sẽ tạo một yêu cầu <strong>{kind === 'PAPER' ? 'thiệp giấy' : 'thiệp trực tuyến'}</strong>. Bạn có thể tiếp tục trao đổi chi tiết sau khi tạo.</p></>}
    </div>
    <div className="request-stepper-actions">{step > 0 ? <button type="button" disabled={loading} onClick={() => { setStep(0); setStatus('') }}>← Quay lại</button> : <span />}{step === 0 ? <button className="request-stepper-primary" type="button" disabled={!kind} onClick={() => setStep(1)}>Tiếp tục →</button> : <button className="request-stepper-primary" type="button" disabled={loading} onClick={() => void create()}>{loading ? 'Đang tạo...' : 'Tạo yêu cầu'}</button>}</div>
    {status ? <p role="status" aria-live="polite" className="request-stepper-status">{status}</p> : null}
  </div>
}

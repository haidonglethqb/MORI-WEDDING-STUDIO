'use client'

import { useState } from 'react'

interface Recommendation {
  slug: string
  name: string
  isFixture: boolean
  merchandiseVnd: string | null
}

export function AssistantForm() {
  const [quantity, setQuantity] = useState('50')
  const [style, setStyle] = useState('minimalist')
  const [message, setMessage] = useState('Trợ lý đang tắt mô hình. Kết quả chỉ lấy từ bộ sưu tập.')
  const [results, setResults] = useState<Recommendation[]>([])

  async function ask() {
    setMessage('Đang xếp mẫu')
    const response = await fetch('/assistant/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productType: 'PAPER',
        shape: 'FLAT',
        styles: style.trim() ? [style.trim()] : [],
        colours: [],
        quantity: Number(quantity),
        budgetVnd: null,
        budgetBasis: 'TOTAL',
      }),
    })
    const payload = (await response.json()) as { clarification?: string | null; results?: Recommendation[] }
    if (!response.ok) {
      setResults([])
      setMessage(response.status === 409 ? 'Hết lượt hỏi trong hôm nay.' : 'Chưa xếp được mẫu.')
      return
    }
    setResults(payload.results ?? [])
    setMessage(payload.clarification ? 'Cần nói rõ ngân sách là tổng hay từng thiệp.' : 'Đây là các mẫu đang có.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void ask()
      }}
    >
      <label>
        Số lượng
        <input value={quantity} onChange={(event) => setQuantity(event.target.value)} />
      </label>
      <label>
        Phong cách
        <input value={style} onChange={(event) => setStyle(event.target.value)} />
      </label>
      <button type="submit">Xếp mẫu</button>
      <p>{message}</p>
      <ul>
        {results.map((item) => (
          <li key={item.slug}>
            <a href={`/products/${item.slug}`}>{item.name}</a>
            {item.isFixture ? ' · Mẫu thử' : ''}
            {item.merchandiseVnd ? ` · ${item.merchandiseVnd} VND` : ''}
          </li>
        ))}
      </ul>
    </form>
  )
}

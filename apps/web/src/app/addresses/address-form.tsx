'use client'

import { useRef, useState } from 'react'

export function AddressForm() {
  const key = useRef(`address-${crypto.randomUUID()}`)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [lines, setLines] = useState('')
  const [locality, setLocality] = useState('')
  const [province, setProvince] = useState('')
  const [status, setStatus] = useState('Địa chỉ chỉ hiện với tài khoản của bạn.')

  async function save() {
    setStatus('Đang lưu')
    const response = await fetch('/addresses/save', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({
        recipientName: name,
        phone,
        addressLines: lines,
        locality,
        province,
        countryCode: 'VN',
      }),
    })
    setStatus(response.ok ? 'Đã lưu địa chỉ.' : 'Chưa lưu được địa chỉ.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <label>
        Người nhận
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Điện thoại
        <input value={phone} onChange={(event) => setPhone(event.target.value)} />
      </label>
      <label>
        Đường
        <input value={lines} onChange={(event) => setLines(event.target.value)} />
      </label>
      <label>
        Phường hoặc quận
        <input value={locality} onChange={(event) => setLocality(event.target.value)} />
      </label>
      <label>
        Tỉnh hoặc thành
        <input value={province} onChange={(event) => setProvince(event.target.value)} />
      </label>
      <button type="submit">Lưu địa chỉ</button>
      <p>{status}</p>
    </form>
  )
}

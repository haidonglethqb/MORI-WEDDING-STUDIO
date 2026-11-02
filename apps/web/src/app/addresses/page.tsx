import { cookies } from 'next/headers'
import '../login/login.css'
import { AddressForm } from './address-form'

export const dynamic = 'force-dynamic'

interface AddressView {
  addressId: string
  recipientName: string
  locality: string
  province: string
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export default async function AddressesPage() {
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/me/addresses`, {
      headers: { cookie },
      cache: 'no-store',
    })
  } catch {
    return (
      <main className="login">
        <h1>Địa chỉ giao</h1>
        <p>Không mở được sổ địa chỉ.</p>
      </main>
    )
  }
  if (response.status === 401) {
    return (
      <main className="login">
        <h1>Địa chỉ giao</h1>
        <p>
          <a href="/login">Đăng nhập</a> để xem địa chỉ của bạn.
        </p>
      </main>
    )
  }
  const addresses = response.ok ? ((await response.json()) as AddressView[]) : []
  return (
    <main className="login">
      <h1>Địa chỉ giao</h1>
      {addresses.length === 0 ? <p>Chưa có địa chỉ.</p> : null}
      <ul>
        {addresses.map((address) => (
          <li key={address.addressId}>
            {address.recipientName} · {address.locality} · {address.province}
          </li>
        ))}
      </ul>
      <AddressForm />
    </main>
  )
}

import { cookies } from 'next/headers'
import { HomeNav } from '../home-nav'
import { AtelierCrumbs } from '../../components/atelier-crumbs'
import { AddressForm } from './address-form'
import './addresses.css'
import '../login/login.css'

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
    response = await fetch(`${apiOrigin()}/api/v1/me/addresses`, { headers: { cookie }, cache: 'no-store' })
  } catch {
    return (
      <><HomeNav /><main className="addresses-page"><div className="atelier-empty">Không kết nối được đến máy chủ.</div></main></>
    )
  }

  if (response.status === 401) {
    return (
      <><HomeNav /><main className="addresses-page"><div className="atelier-empty"><p>Vui lòng đăng nhập để xem sổ địa chỉ nhận hàng của bạn.</p><a href="/login" className="workspace-btn-primary">Đăng nhập ngay</a></div></main></>
    )
  }

  const addresses = response.ok ? ((await response.json()) as AddressView[]) : []

  return (
    <>
      <HomeNav />
      <main className="addresses-page">
        <AtelierCrumbs items={[{ label: 'Trang chủ', href: '/' }, { label: 'Việc của tôi', href: '/workspace' }, { label: 'Sổ địa chỉ' }]} />

        <header className="addresses-header">
          <div>
            <span className="atelier-eyebrow">Giao nhận · {addresses.length} địa chỉ đã lưu</span>
            <h1>Sổ địa chỉ nhận thiệp</h1>
            <p>
              Quản lý danh sách địa chỉ giao nhận thiệp cưới in và hộp quà may đo từ xưởng MORI.
            </p>
          </div>
        </header>

        {addresses.length === 0 ? (
          <div className="atelier-empty">
            Bạn chưa lưu địa chỉ nhận thiệp nào. Hãy thêm địa chỉ mới bên dưới.
          </div>
        ) : (
          <div className="addresses-grid">
            {addresses.map((address) => (
              <div key={address.addressId} className="address-item-card">
                <div className="address-item-name">{address.recipientName}</div>
                <div className="address-item-detail">
                  {address.locality}, {address.province}
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="address-new-card">
          <h2>
            Thêm địa chỉ giao thiệp mới
          </h2>
          <AddressForm />
        </section>
      </main>
    </>
  )
}

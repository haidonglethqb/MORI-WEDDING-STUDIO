import { cookies } from 'next/headers'
import { HomeNav } from '../home-nav'
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
      <><HomeNav /><main className="addresses-page"><div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>Không kết nối được đến máy chủ.</div></main></>
    )
  }

  if (response.status === 401) {
    return (
      <><HomeNav /><main className="addresses-page"><div style={{ textAlign: 'center', padding: '60px 0' }}><p>Vui lòng đăng nhập để xem sổ địa chỉ nhận hàng của bạn.</p><a href="/login" style={{ display: 'inline-block', marginTop: '12px', padding: '8px 20px', background: '#3e4a39', color: '#fff', borderRadius: '999px', textDecoration: 'none' }}>Đăng nhập ngay</a></div></main></>
    )
  }

  const addresses = response.ok ? ((await response.json()) as AddressView[]) : []

  return (
    <>
      <HomeNav />
      <main className="addresses-page">
        <div style={{ fontSize: '13px', color: '#7a8274', marginBottom: '20px' }}>
          <a href="/" style={{ color: '#55634f', textDecoration: 'none' }}>Trang chủ</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <a href="/workspace" style={{ color: '#55634f', textDecoration: 'none' }}>Việc của tôi</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#242823' }}>Sổ địa chỉ</span>
        </div>

        <header className="addresses-header">
          <h1>Sổ địa chỉ nhận thiệp ({addresses.length})</h1>
          <p style={{ margin: 0, color: '#687063', fontSize: '14px' }}>
            Quản lý danh sách địa chỉ giao nhận thiệp cưới in và hộp quà may đo từ xưởng MORI.
          </p>
        </header>

        {addresses.length === 0 ? (
          <div style={{ padding: '24px', background: '#faf9f5', borderRadius: '12px', border: '1px dashed #d5d0c4', textAlign: 'center', color: '#7a8274', marginBottom: '32px', fontSize: '14px' }}>
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
          <h2 style={{ fontFamily: 'var(--font-serif, "Lora", Georgia, serif)', fontSize: '20px', color: '#242823', margin: '0 0 16px' }}>
            Thêm địa chỉ giao thiệp mới
          </h2>
          <AddressForm />
        </section>
      </main>
    </>
  )
}

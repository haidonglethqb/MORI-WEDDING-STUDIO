import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { InvitationDemoPaymentDetails } from '@mori/contracts'
import { CartDrawerFallback } from '../../../../features/cart/cart-drawer-fallback'
import { HomeFooter } from '../../../home-footer'
import { HomeNav } from '../../../home-nav'
import { InvitationCheckout } from './invitation-checkout'
import '../../../../features/cart/storefront-footer.css'
import '../../checkout.css'

export const dynamic = 'force-dynamic'

export default async function InvitationCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)) notFound()
  const cookie = (await cookies()).toString()
  const origin = process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
  const response = await fetch(`${origin}/api/v1/invitations/${id}/editor`, {
    headers: { cookie },
    cache: 'no-store',
  })
  if (response.status === 401) redirect('/login')
  if (response.status === 404) notFound()
  if (!response.ok) throw new Error(`Could not load invitation checkout (${response.status})`)
  const draft = (await response.json()) as {
    displayNames: [string, string]
    demoPayment: InvitationDemoPaymentDetails | null
  }
  if (!draft.demoPayment) redirect(`/invitations/${id}`)

  return (
    <>
      <HomeNav />
      <main className="checkout-page-wrap">
        <header className="checkout-head">
          <h1>Thanh toán demo cho thiệp online</h1>
          <p>Đây là giao dịch mô phỏng. Bạn sẽ không bị trừ tiền.</p>
        </header>
        <InvitationCheckout id={id} names={draft.displayNames} payment={draft.demoPayment} />
      </main>
      <CartDrawerFallback />
      <HomeFooter />
    </>
  )
}

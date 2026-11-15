import { HomeFooter } from '../home-footer'
import { HomeNav } from '../home-nav'
import { CartDrawerFallback } from '../../features/cart/cart-drawer-fallback'
import { CheckoutView } from './checkout-view'
import '../../features/cart/storefront-footer.css'
import './checkout.css'

export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  return (
    <>
      <HomeNav />
      <CheckoutView />
      <CartDrawerFallback />
      <HomeFooter />
    </>
  )
}

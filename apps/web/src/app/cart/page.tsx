import { HomeFooter } from '../home-footer'
import { HomeNav } from '../home-nav'
import { CartDrawerFallback } from '../../features/cart/cart-drawer-fallback'
import { CartView } from './cart-view'
import '../../features/cart/storefront-footer.css'
import './cart.css'

export const dynamic = 'force-dynamic'

export default function CartPage() {
  return (
    <>
      <HomeNav />
      <CartView />
      <CartDrawerFallback />
      <HomeFooter />
    </>
  )
}

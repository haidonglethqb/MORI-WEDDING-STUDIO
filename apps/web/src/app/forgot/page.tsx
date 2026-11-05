import { ForgotForm } from './forgot-form'
import { HomeNav } from '../home-nav'
import '../login/login.css'

export const dynamic = 'force-dynamic'

export default function ForgotPage() {
  return (
    <>
      <HomeNav />
      <main className="login">
        <ForgotForm />
      </main>
    </>
  )
}

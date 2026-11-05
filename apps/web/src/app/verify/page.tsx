import { VerifyForm } from './verify-form'
import { HomeNav } from '../home-nav'
import '../login/login.css'

export const dynamic = 'force-dynamic'

export default function VerifyPage() {
  return (
    <>
      <HomeNav />
      <main className="login">
        <VerifyForm />
      </main>
    </>
  )
}

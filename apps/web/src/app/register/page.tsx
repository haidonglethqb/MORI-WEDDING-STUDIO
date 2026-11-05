import { RegisterForm } from './register-form'
import { HomeNav } from '../home-nav'
import '../login/login.css'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  return (
    <>
      <HomeNav />
      <main className="login">
        <RegisterForm />
      </main>
    </>
  )
}

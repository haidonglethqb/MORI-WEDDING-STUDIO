import { HomeNav } from '../home-nav'
import { LoginForm } from './login-form'
import './login.css'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <>
      <HomeNav />
      <main className="login">
        <LoginForm />
      </main>
    </>
  )
}

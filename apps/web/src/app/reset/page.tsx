import { ResetForm } from './reset-form'
import { HomeNav } from '../home-nav'
import '../login/login.css'

export const dynamic = 'force-dynamic'

export default function ResetPage() {
  return (
    <>
      <HomeNav />
      <main className="login">
        <ResetForm />
      </main>
    </>
  )
}

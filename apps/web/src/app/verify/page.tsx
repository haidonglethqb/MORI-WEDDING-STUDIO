import { VerifyForm } from './verify-form'
import { HomeNav } from '../home-nav'
import '../login/login.css'

export const dynamic = 'force-dynamic'

export default async function VerifyPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  return (
    <>
      <HomeNav />
      <main className="login">
        <VerifyForm initialToken={params?.token ?? ''} />
      </main>
    </>
  )
}

import { ResetForm } from './reset-form'
import { HomeNav } from '../home-nav'
import '../login/login.css'

export const dynamic = 'force-dynamic'

export default async function ResetPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  return (
    <>
      <HomeNav />
      <main className="login">
        <ResetForm initialToken={params?.token ?? ''} />
      </main>
    </>
  )
}

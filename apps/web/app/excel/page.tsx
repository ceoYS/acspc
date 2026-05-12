import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ExcelGenerateForm from './ExcelGenerateForm'

export const dynamic = 'force-dynamic'

export default async function ExcelPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <main className="mx-auto max-w-xl space-y-3 p-4">
      <h1 className="text-2xl font-bold">엑셀 생성 (V1 §5 임시)</h1>
      <ExcelGenerateForm />
    </main>
  )
}

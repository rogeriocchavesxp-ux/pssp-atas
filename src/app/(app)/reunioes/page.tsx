import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Reuniao } from '@/types/database'
import ReunioesClient from './reunioes-client'

export default async function ReunioesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reunioes')
    .select('*')
    .order('data_inicio', { ascending: false })

  const reunioes = (data ?? []) as Reuniao[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reuniões</h1>
          <p className="text-gray-500 text-sm mt-1">{reunioes.length} reuniões cadastradas</p>
        </div>
        <Link
          href="/reunioes/nova"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}
        >
          + Nova reunião
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <ReunioesClient initialData={reunioes} />
      </div>
    </div>
  )
}

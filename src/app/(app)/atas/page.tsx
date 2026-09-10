import { createClient } from '@/lib/supabase/server'
import { AtasClient } from './atas-client'

export default async function AtasPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const supabase = await createClient()
  const params = await searchParams
  const reuniaoId = params.reuniao ?? null

  const { data: { user } } = await supabase.auth.getUser()

  let atasQuery = supabase
    .from('atas')
    .select('*, reuniao:reunioes(numero, tipo, data_inicio)')
    .order('created_at', { ascending: false })

  if (reuniaoId) {
    atasQuery = atasQuery.eq('reuniao_id', reuniaoId)
  }

  const [{ data }, perfilResult] = await Promise.all([
    atasQuery,
    user
      ? supabase.from('perfis').select('papel').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  const papel = perfilResult.data?.papel ?? null
  const podeAprovar = papel === 'secretario_executivo' || papel === 'admin'

  type AtaRow = { id: string; reuniao_id: string; numero_ata: string | null; status: string; updated_at: string; reuniao: { numero: string; tipo: string; data_inicio: string } | null }
  const atas = ((data ?? []) as unknown) as AtaRow[]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Atas</h1>
        <p className="text-gray-500 text-sm mt-1">{atas.length} ata(s) no sistema</p>
      </div>

      <AtasClient atas={atas} podeAprovar={podeAprovar} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { PropostasClient } from './propostas-client'

export type DocProposta = {
  id: string
  numero: number
  assunto: string
  oriundo: string | null
  proposta: string | null
  status: string
  comissao_id: string | null
  reuniao_id: string | null
  reuniao: { id: string; numero: string; data_inicio: string } | null
  comissao: { numero: number; nome: string | null } | null
  resolucao: { id: string; numero: number } | null
}

export default async function PropostasPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: docs }, perfilResult] = await Promise.all([
    supabase
      .from('documentos')
      .select('id, numero, assunto, oriundo, proposta, status, comissao_id, reuniao_id, reuniao:reunioes(id, numero, data_inicio), comissao:comissoes(numero, nome), resolucao:resolucoes(id, numero)')
      .not('comissao_id', 'is', null)
      .order('numero', { ascending: false }),
    user
      ? supabase.from('perfis').select('papel').eq('id', user.id).single()
      : Promise.resolve({ data: null, error: null }),
  ])

  const papel = perfilResult.data?.papel ?? null

  return (
    <PropostasClient
      docs={(docs ?? []) as unknown as DocProposta[]}
      isPresidente={papel === 'presidente'}
      userId={user?.id ?? null}
    />
  )
}

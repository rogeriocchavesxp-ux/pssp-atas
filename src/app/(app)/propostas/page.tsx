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

export default async function PropostasPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const supabase = await createClient()
  const params = await searchParams
  const reuniaoId = params.reuniao ?? null

  const { data: { user } } = await supabase.auth.getUser()

  let docsQuery = supabase
    .from('documentos')
    .select('id, numero, assunto, oriundo, proposta, status, comissao_id, reuniao_id, reuniao:reunioes(id, numero, data_inicio), comissao:comissoes(numero, nome), resolucao:resolucoes(id, numero)')
    .not('comissao_id', 'is', null)
    .order('numero', { ascending: false })

  if (reuniaoId) {
    docsQuery = docsQuery.eq('reuniao_id', reuniaoId)
  }

  const [{ data: docs }, perfilResult] = await Promise.all([
    docsQuery,
    user
      ? supabase.from('perfis').select('papel').eq('id', user.id).single()
      : Promise.resolve({ data: null, error: null }),
  ])

  const papel = perfilResult.data?.papel ?? null

  // Supabase retorna resolucao/comissao/reuniao como array em joins 1-para-muitos; normaliza
  const docsNormalizados: DocProposta[] = (docs ?? []).map((d: Record<string, unknown>) => ({
    ...(d as Omit<DocProposta, 'resolucao' | 'comissao' | 'reuniao'>),
    resolucao: Array.isArray(d.resolucao) ? (d.resolucao[0] ?? null) : (d.resolucao as DocProposta['resolucao']),
    comissao: Array.isArray(d.comissao) ? (d.comissao[0] ?? null) : (d.comissao as DocProposta['comissao']),
    reuniao: Array.isArray(d.reuniao) ? (d.reuniao[0] ?? null) : (d.reuniao as DocProposta['reuniao']),
  }))

  return (
    <PropostasClient
      docs={docsNormalizados}
      isPresidente={papel === 'presidente' || papel === 'admin'}
      userId={user?.id ?? null}
    />
  )
}

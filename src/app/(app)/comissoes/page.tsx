import { createClient } from '@/lib/supabase/server'
import type { Comissao, Oficial } from '@/types/database'
import { ComissoesClient } from './comissoes-client'

export default async function ComissoesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: comissoes },
    { data: oficiais },
    { data: documentos },
    { data: perfil },
  ] = await Promise.all([
    supabase
      .from('comissoes')
      .select('*, membros:comissao_membros(id, funcao, oficial:oficiais(id, nome, tipo, email))')
      .order('numero'),
    supabase.from('oficiais').select('id, nome, tipo').eq('ativo', true).order('nome'),
    supabase
      .from('documentos')
      .select('id, numero, assunto, oriundo, conteudo, status, comissao_id, reuniao:reunioes(numero, data_inicio)')
      .not('comissao_id', 'is', null)
      .order('numero'),
    user
      ? supabase.from('perfis').select('email, papel').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  return (
    <ComissoesClient
      comissoes={(comissoes ?? []) as Comissao[]}
      oficiais={(oficiais ?? []) as Pick<Oficial, 'id' | 'nome' | 'tipo'>[]}
      documentos={(documentos ?? []) as unknown as DocComissao[]}
      userEmail={perfil?.email ?? null}
      userPapel={perfil?.papel ?? null}
    />
  )
}

export type DocComissao = {
  id: string
  numero: number
  assunto: string
  oriundo: string | null
  conteudo: string | null
  status: string
  comissao_id: string
  reuniao: { numero: string; data_inicio: string } | null
}

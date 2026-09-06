import { createClient } from '@/lib/supabase/server'
import type { Comissao, Oficial } from '@/types/database'
import { ComissoesClient } from './comissoes-client'

export default async function ComissoesPage() {
  const supabase = await createClient()

  const [{ data: comissoes }, { data: oficiais }] = await Promise.all([
    supabase.from('comissoes').select('*, membros:comissao_membros(id, funcao, oficial:oficiais(id, nome, tipo))').order('numero'),
    supabase.from('oficiais').select('id, nome, tipo').eq('ativo', true).order('nome'),
  ])

  return (
    <ComissoesClient
      comissoes={(comissoes ?? []) as Comissao[]}
      oficiais={(oficiais ?? []) as Pick<Oficial, 'id' | 'nome' | 'tipo'>[]}
    />
  )
}

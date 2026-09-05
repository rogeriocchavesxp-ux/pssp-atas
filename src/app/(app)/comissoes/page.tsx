import { createClient } from '@/lib/supabase/server'
import type { Comissao } from '@/types/database'
import { ComissoesClient } from './comissoes-client'

export default async function ComissoesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comissoes')
    .select('*, membros:comissao_membros(id, funcao, oficial:oficiais(nome, tipo))')
    .order('numero')
  return <ComissoesClient comissoes={(data ?? []) as Comissao[]} />
}

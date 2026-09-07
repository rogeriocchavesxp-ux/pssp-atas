import { createClient } from '@/lib/supabase/server'
import type { Igreja } from '@/types/database'
import { IgrejasClient } from './igrejas-client'

export default async function IgrejasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('igrejas')
    .select('*, mae:igrejas!igrejas_igreja_mae_id_fkey(id, nome, sigla)')
    .order('nome')
  return <IgrejasClient igrejas={(data ?? []) as unknown as (Igreja & { mae: { id: string; nome: string; sigla: string | null } | null })[]} />
}

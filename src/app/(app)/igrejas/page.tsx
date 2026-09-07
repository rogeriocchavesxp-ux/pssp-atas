import { createClient } from '@/lib/supabase/server'
import type { Igreja } from '@/types/database'
import { IgrejasClient } from './igrejas-client'

export default async function IgrejasPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('igrejas').select('*').order('nome')
  const todas = (data ?? []) as Igreja[]
  // Resolve mae client-side a partir de igreja_mae_id
  const comMae = todas.map(ig => ({
    ...ig,
    mae: ig.igreja_mae_id
      ? (todas.find(s => s.id === ig.igreja_mae_id) ?? null)
      : null,
  }))
  return <IgrejasClient igrejas={comMae as unknown as (Igreja & { mae: { id: string; nome: string; sigla: string | null } | null })[]} />
}

import { createClient } from '@/lib/supabase/server'
import type { Oficial, Igreja } from '@/types/database'
import { OficiaisClient } from './oficiais-client'

export default async function OficiaisPage() {
  const supabase = await createClient()

  const [{ data: oficiais }, { data: igrejas }] = await Promise.all([
    supabase.from('oficiais').select('*, igreja:igrejas(nome, sigla)').order('nome'),
    supabase.from('igrejas').select('id, nome, sigla').order('nome'),
  ])

  return (
    <OficiaisClient
      oficiais={(oficiais ?? []) as (Oficial & { igreja: { nome: string; sigla: string | null } | null })[]}
      igrejas={(igrejas ?? []) as Pick<Igreja, 'id' | 'nome' | 'sigla'>[]}
    />
  )
}

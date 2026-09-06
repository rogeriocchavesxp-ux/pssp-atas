import { createClient } from '@/lib/supabase/server'
import type { Seminarista, Igreja } from '@/types/database'
import { SeminaristasClient } from './seminaristas-client'

export default async function SeminaristasPage() {
  const supabase = await createClient()

  const [{ data: seminaristas }, { data: igrejas }] = await Promise.all([
    supabase.from('seminaristas').select('*, igreja:igrejas(nome, sigla)').order('nome'),
    supabase.from('igrejas').select('id, nome, sigla').order('nome'),
  ])

  return (
    <SeminaristasClient
      seminaristas={(seminaristas ?? []) as (Seminarista & { igreja: { nome: string; sigla: string | null } | null })[]}
      igrejas={(igrejas ?? []) as Pick<Igreja, 'id' | 'nome' | 'sigla'>[]}
    />
  )
}

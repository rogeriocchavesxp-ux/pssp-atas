import { createClient } from '@/lib/supabase/server'
import type { Seminarista, Candidato, Igreja } from '@/types/database'
import { SeminaristasClient } from './seminaristas-client'

export default async function SeminaristasPage() {
  const supabase = await createClient()

  const [{ data: seminaristas }, { data: candidatos }, { data: igrejas }] = await Promise.all([
    supabase.from('seminaristas').select('*, igreja:igrejas(nome, sigla)').order('nome'),
    supabase.from('candidatos').select('*, tutor:oficiais(nome), igreja:igrejas(nome, sigla)').order('nome'),
    supabase.from('igrejas').select('id, nome, sigla').order('nome'),
  ])

  return (
    <SeminaristasClient
      seminaristas={(seminaristas ?? []) as unknown as (Seminarista & { igreja: { nome: string; sigla: string | null } | null })[]}
      candidatos={(candidatos ?? []) as unknown as (Candidato & { tutor: { nome: string } | null; igreja: { nome: string; sigla: string | null } | null })[]}
      igrejas={(igrejas ?? []) as Pick<Igreja, 'id' | 'nome' | 'sigla'>[]}
    />
  )
}

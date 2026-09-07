import { createClient } from '@/lib/supabase/server'
import type { Candidato, Igreja, Oficial } from '@/types/database'
import { CandidatosClient } from './candidatos-client'

export default async function CandidatosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: candidatos }, { data: igrejas }, { data: oficiais }, { data: perfil }] = await Promise.all([
    supabase
      .from('candidatos')
      .select('*, tutor:oficiais(id, nome), igreja:igrejas(nome, sigla)')
      .order('nome'),
    supabase.from('igrejas').select('id, nome, sigla').order('nome'),
    supabase.from('oficiais').select('id, nome').eq('tipo', 'pastor').order('nome'),
    user
      ? supabase.from('perfis').select('papel').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  const isAdmin = ['admin', 'secretario'].includes(perfil?.papel ?? '')

  return (
    <CandidatosClient
      candidatos={(candidatos ?? []) as unknown as (Candidato & { tutor: { id: string; nome: string } | null; igreja: { nome: string; sigla: string | null } | null })[]}
      igrejas={(igrejas ?? []) as Pick<Igreja, 'id' | 'nome' | 'sigla'>[]}
      pastores={(oficiais ?? []) as Pick<Oficial, 'id' | 'nome'>[]}
      isAdmin={isAdmin}
    />
  )
}

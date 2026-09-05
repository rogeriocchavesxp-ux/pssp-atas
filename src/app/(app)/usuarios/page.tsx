import { createClient } from '@/lib/supabase/server'
import type { Perfil, Igreja } from '@/types/database'
import { UsuariosClient } from './usuarios-client'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const [{ data: usuarios }, { data: igrejas }] = await Promise.all([
    supabase.from('perfis').select('*').order('nome'),
    supabase.from('igrejas').select('id, nome, sigla').order('nome'),
  ])

  return (
    <UsuariosClient
      usuarios={(usuarios ?? []) as Perfil[]}
      igrejas={(igrejas ?? []) as Pick<Igreja, 'id' | 'nome' | 'sigla'>[]}
    />
  )
}

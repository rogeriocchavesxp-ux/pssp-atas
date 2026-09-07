import { createClient } from '@/lib/supabase/server'
import type { ComissaoExecutiva } from '@/types/database'
import { ComissaoExecutivaClient } from './comissao-executiva-client'

export default async function ComissaoExecutivaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: registros }, { data: perfil }] = await Promise.all([
    supabase
      .from('comissao_executiva')
      .select('*')
      .order('ano', { ascending: false })
      .order('cargo'),
    user
      ? supabase.from('perfis').select('papel').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  const isAdmin = ['admin', 'secretario'].includes(perfil?.papel ?? '')

  // Agrupa por ano
  const porAno: Record<number, ComissaoExecutiva[]> = {}
  for (const r of registros ?? []) {
    if (!porAno[r.ano]) porAno[r.ano] = []
    porAno[r.ano].push(r as ComissaoExecutiva)
  }

  const anos = Object.keys(porAno)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <ComissaoExecutivaClient
      porAno={porAno}
      anos={anos}
      isAdmin={isAdmin}
    />
  )
}

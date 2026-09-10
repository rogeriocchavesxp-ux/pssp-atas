import { createClient } from '@/lib/supabase/server'
import { RelatoriosMinClient } from './relatorios-min-client'

export default async function RelatoriosMinisteriaisPage() {
  const supabase = await createClient()

  const [{ data: relatorios }, { data: oficiais }] = await Promise.all([
    supabase
      .from('relatorios_ministeriais')
      .select('id, ano, status, nome_ministro, igrejas, created_at, updated_at, oficial_id')
      .order('ano', { ascending: false })
      .order('nome_ministro'),
    supabase
      .from('oficiais')
      .select('id, nome')
      .eq('tipo', 'pastor')
      .order('nome'),
  ])

  return (
    <RelatoriosMinClient
      relatorios={(relatorios ?? []) as RelMin[]}
      oficiais={(oficiais ?? []) as { id: string; nome: string }[]}
    />
  )
}

export type RelMin = {
  id: string
  ano: number
  status: string
  nome_ministro: string
  igrejas: string | null
  created_at: string
  updated_at: string
  oficial_id: string | null
}

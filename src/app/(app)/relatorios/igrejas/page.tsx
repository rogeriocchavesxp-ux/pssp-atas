import { createClient } from '@/lib/supabase/server'
import { RelatoriosIgrejasClient } from './relatorios-igrejas-client'

export type RelConselho = {
  id: string; ano: number; status: string; nome_igreja: string
  igreja_id: string; created_at: string
}
export type RelEstatistica = {
  id: string; ano: number; status: string; nome_igreja: string
  igreja_id: string; created_at: string
}
export type IgrejaLite = { id: string; nome: string; sigla: string | null }

export default async function RelatoriosIgrejasPage() {
  const supabase = await createClient()

  const [{ data: conselho }, { data: estatistica }, { data: igrejas }] = await Promise.all([
    supabase.from('relatorios_conselho')
      .select('id, ano, status, nome_igreja, igreja_id, created_at')
      .order('ano', { ascending: false }).order('nome_igreja'),
    supabase.from('relatorios_estatistica')
      .select('id, ano, status, nome_igreja, igreja_id, created_at')
      .order('ano', { ascending: false }).order('nome_igreja'),
    supabase.from('igrejas').select('id, nome, sigla').order('nome'),
  ])

  return (
    <RelatoriosIgrejasClient
      conselho={(conselho ?? []) as RelConselho[]}
      estatistica={(estatistica ?? []) as RelEstatistica[]}
      igrejas={(igrejas ?? []) as IgrejaLite[]}
    />
  )
}

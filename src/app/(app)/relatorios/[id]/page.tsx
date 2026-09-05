import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RelatorioWizard } from './relatorio-wizard'

export default async function RelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: relatorio } = await supabase
    .from('relatorios_anuais')
    .select('*, igreja:igrejas(id, nome, sigla, cidade, bairro, cnpj)')
    .eq('id', id)
    .single()

  if (!relatorio) notFound()

  return <RelatorioWizard relatorio={relatorio as unknown as Record<string, unknown>} />
}

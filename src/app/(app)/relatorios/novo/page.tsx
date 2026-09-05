import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NovoRelatorioForm } from './novo-relatorio-form'

export default async function NovoRelatorioPage() {
  const supabase = await createClient()
  const { data: igrejas } = await supabase
    .from('igrejas')
    .select('id, nome, sigla')
    .eq('ativa', true)
    .order('nome')

  async function criar(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('relatorios_anuais')
      .insert({
        ano: Number(formData.get('ano')),
        igreja_id: formData.get('igreja_id') as string,
        status: 'rascunho',
      })
      .select('id')
      .single()
    if (!error && data) {
      redirect(`/relatorios/${data.id}`)
    }
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Novo Relatório Anual</h1>
        <p className="text-gray-500 text-sm mt-1">
          Selecione a igreja e o ano de referência para iniciar o preenchimento
        </p>
      </div>
      <NovoRelatorioForm igrejas={igrejas ?? []} onSubmit={criar} />
    </div>
  )
}

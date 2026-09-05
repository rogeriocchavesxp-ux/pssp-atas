import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PresencaList } from './presenca-list'
import type { Reuniao, Oficial, ReuniaoPresenca } from '@/types/database'

export default async function PresencaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: reuniao }, { data: oficiais }, { data: presencas }] = await Promise.all([
    supabase.from('reunioes').select('*').eq('id', id).single(),
    supabase.from('oficiais').select('*, igreja:igrejas(nome, sigla)').eq('ativo', true).order('nome'),
    supabase.from('reuniao_presencas').select('*').eq('reuniao_id', id),
  ])

  if (!reuniao) notFound()

  const r = reuniao as Reuniao
  const ofs = (oficiais ?? []) as Oficial[]
  const pres = (presencas ?? []) as ReuniaoPresenca[]

  const totalPresentes = pres.filter(p => p.presente).length

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/reunioes">Reuniões</Link>
        <span>/</span>
        <Link href={`/reunioes/${id}`} className="hover:text-gray-600">{r.numero}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Presença</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Presença</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalPresentes} presente(s) · {ofs.length} oficial(is) cadastrado(s)
            {r.quorum_necessario ? ` · Quórum: ${r.quorum_necessario}` : ''}
          </p>
        </div>
        {r.quorum_necessario && (
          <div className={`badge ${totalPresentes >= r.quorum_necessario ? 'badge-green' : 'badge-red'} text-sm px-4 py-2`}>
            {totalPresentes >= r.quorum_necessario ? 'Quórum atingido' : 'Sem quórum'}
          </div>
        )}
      </div>

      <PresencaList reuniaoId={id} oficiais={ofs} presencas={pres} />
    </div>
  )
}

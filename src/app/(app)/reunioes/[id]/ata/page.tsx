import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AtaPageClient } from './ata-page-client'
import type { Reuniao, Ata } from '@/types/database'

export type DocAta = {
  id: string
  numero: number
  assunto: string
  oriundo: string | null
  conteudo: string | null
  proposta: string | null
  status: string
  resolucao: { numero: number } | null
  comissao: { numero: number; nome: string | null } | null
}

export default async function AtaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: reuniao }, { data: ataExistente }, { data: documentos }] = await Promise.all([
    supabase.from('reunioes').select('*').eq('id', id).single(),
    supabase.from('atas').select('*').eq('reuniao_id', id).single(),
    supabase
      .from('documentos')
      .select('id, numero, assunto, oriundo, conteudo, proposta, status, resolucao:resolucoes(numero), comissao:comissoes(numero, nome)')
      .eq('reuniao_id', id)
      .order('numero'),
  ])

  if (!reuniao) notFound()

  const r = reuniao as Reuniao
  const ata = ataExistente as Ata | null
  const docs = documentos ?? []

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/reunioes">Reuniões</Link>
        <span>/</span>
        <Link href={`/reunioes/${id}`} className="hover:text-gray-600">{r.numero}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Ata</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ata da Reunião</h1>
          <p className="text-gray-500 text-sm mt-1">
            {r.numero} · {new Date(r.data_inicio).toLocaleDateString('pt-BR')}
            {ata ? ` · Status: ${ata.status}` : ' · Rascunho não iniciado'}
          </p>
        </div>
        {ata && ata.status !== 'publicada' && (
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#16a34a' }}
          >
            Enviar para aprovação
          </button>
        )}
      </div>

      <AtaPageClient
        reuniaoId={id}
        ata={ata}
        reuniao={r}
        docs={docs as unknown as DocAta[]}
      />
    </div>
  )
}

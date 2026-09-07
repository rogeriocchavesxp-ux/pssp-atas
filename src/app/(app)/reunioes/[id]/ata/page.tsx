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

  // Supabase retorna resolucao como array (relação 1-para-muitos); normaliza para objeto único
  const docs: DocAta[] = (documentos ?? []).map((d: Record<string, unknown>) => ({
    ...(d as Omit<DocAta, 'resolucao' | 'comissao'>),
    resolucao: Array.isArray(d.resolucao) ? (d.resolucao[0] ?? null) : (d.resolucao as DocAta['resolucao']),
    comissao: Array.isArray(d.comissao) ? (d.comissao[0] ?? null) : (d.comissao as DocAta['comissao']),
  }))

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/reunioes">Reuniões</Link>
        <span>/</span>
        <Link href={`/reunioes/${id}`} className="hover:text-gray-600">{r.numero}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Ata</span>
      </div>

      <AtaPageClient reuniaoId={id} ata={ata} reuniao={r} docs={docs} />
    </div>
  )
}

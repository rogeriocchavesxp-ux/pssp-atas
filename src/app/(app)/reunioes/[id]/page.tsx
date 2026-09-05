import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Reuniao, Documento } from '@/types/database'

const STATUS_DOC_MAP: Record<string, { label: string; cls: string }> = {
  recebido:  { label: 'Recebido',  cls: 'badge-blue' },
  em_pauta:  { label: 'Em pauta',  cls: 'badge-yellow' },
  aprovado:  { label: 'Aprovado',  cls: 'badge-green' },
  rejeitado: { label: 'Rejeitado', cls: 'badge-red' },
  arquivado: { label: 'Arquivado', cls: 'badge-gray' },
  retirado:  { label: 'Retirado',  cls: 'badge-gray' },
}

const TIPO_MAP: Record<string, string> = {
  ordinaria: 'Ordinária', extraordinaria: 'Extraordinária',
  solene: 'Solene', administrativa: 'Administrativa',
}

const STATUS_REUNIAO: Record<string, { label: string; cls: string }> = {
  convocada:       { label: 'Convocada',       cls: 'badge-blue' },
  em_andamento:    { label: 'Em andamento',    cls: 'badge-green' },
  encerrada:       { label: 'Encerrada',        cls: 'badge-gray' },
  ata_em_producao: { label: 'Ata em produção', cls: 'badge-yellow' },
  ata_aprovada:    { label: 'Ata aprovada',    cls: 'badge-navy' },
  publicada:       { label: 'Publicada',        cls: 'badge-green' },
}

export default async function ReuniaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: reuniao }, { data: documentos }, { data: presencas }] = await Promise.all([
    supabase.from('reunioes').select('*').eq('id', id).single(),
    supabase.from('documentos').select('*, comissao:comissoes(numero, nome)').eq('reuniao_id', id).order('numero'),
    supabase.from('reuniao_presencas').select('*, oficial:oficiais(nome, tipo)').eq('reuniao_id', id),
  ])

  if (!reuniao) notFound()

  const r = reuniao as Reuniao
  const docs = (documentos ?? []) as Documento[]
  const presentes = presencas?.filter(p => p.presente) ?? []
  const totalPresentes = presentes.length
  const resolucoes = docs.filter(d => d.status === 'aprovado').length

  const st = STATUS_REUNIAO[r.status] ?? { label: r.status, cls: 'badge-gray' }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/reunioes" className="hover:text-gray-600">Reuniões</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{r.numero}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Reunião {r.numero}</h1>
            <span className={`badge ${st.cls}`}>{st.label}</span>
          </div>
          <p className="text-gray-500 text-sm">
            {TIPO_MAP[r.tipo] ?? r.tipo} · {new Date(r.data_inicio).toLocaleDateString('pt-BR')}
            {r.local ? ` · ${r.local}` : ''}
            {r.cidade ? `, ${r.cidade}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/reunioes/${id}/presenca`}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Presença
          </Link>
          <Link
            href={`/reunioes/${id}/ata`}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#1B3A6B' }}
          >
            Ata da Reunião
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Documentos', value: docs.length, icon: '📄' },
          { label: 'Resoluções', value: resolucoes, icon: '✅' },
          { label: '% aprovado', value: docs.length ? `${Math.round(resolucoes / docs.length * 100)}%` : '—', icon: '📊' },
          { label: 'Presentes', value: totalPresentes || '—', icon: '👥' },
        ].map((kpi) => (
          <div key={kpi.label} className="card text-center">
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Ementário */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Ementário — {r.numero}</h2>
          <Link
            href={`/reunioes/${id}/ementa`}
            className="text-xs font-medium px-3 py-1.5 rounded-md border"
            style={{ color: '#1B3A6B', borderColor: '#1B3A6B' }}
          >
            + Adicionar documento
          </Link>
        </div>

        <table className="table-pssp">
          <thead>
            <tr>
              <th style={{ width: 60, paddingLeft: 20 }}>Doc.</th>
              <th>Assunto</th>
              <th>Oriundo</th>
              <th style={{ width: 90 }}>Comissão</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 60, paddingRight: 20 }}>PDF</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-10">
                  Nenhum documento. <Link href={`/reunioes/${id}/ementa`} style={{ color: '#1B3A6B' }}>Adicionar o primeiro</Link>
                </td>
              </tr>
            ) : docs.map((doc) => {
              const ds = STATUS_DOC_MAP[doc.status] ?? { label: doc.status, cls: 'badge-gray' }
              const comissao = doc.comissao as { numero: number; nome: string | null } | null
              return (
                <tr key={doc.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <span className="font-mono font-semibold text-gray-700">{String(doc.numero).padStart(3, '0')}</span>
                  </td>
                  <td>
                    <div className="font-medium text-gray-900 leading-snug">{doc.assunto}</div>
                    {doc.tipo && <div className="text-xs text-gray-400 mt-0.5">{doc.tipo}</div>}
                  </td>
                  <td className="text-gray-500 text-sm">{doc.oriundo ?? 'Não informado'}</td>
                  <td className="text-center">
                    {comissao ? (
                      <span className="badge badge-navy">Comissão {comissao.numero}</span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td><span className={`badge ${ds.cls}`}>{ds.label}</span></td>
                  <td style={{ paddingRight: 20 }}>
                    {doc.pdf_url ? (
                      <a href={doc.pdf_url} target="_blank" className="text-xs font-medium" style={{ color: '#B8962E' }}>
                        PDF
                      </a>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

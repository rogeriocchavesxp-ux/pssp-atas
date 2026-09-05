import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { EmentaForm } from './ementa-form'
import { DocPdfLink } from './doc-pdf-link'
import type { Reuniao, Documento } from '@/types/database'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  recebido:   { label: 'Recebido',   cls: 'badge-gray' },
  em_pauta:   { label: 'Em pauta',   cls: 'badge-yellow' },
  aprovado:   { label: 'Aprovado',   cls: 'badge-green' },
  rejeitado:  { label: 'Rejeitado',  cls: 'badge-red' },
  arquivado:  { label: 'Arquivado',  cls: 'badge-gray' },
  retirado:   { label: 'Retirado',   cls: 'badge-gray' },
}

export default async function EmentaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: reuniao }, { data: documentos }, { data: comissoes }] = await Promise.all([
    supabase.from('reunioes').select('*').eq('id', id).single(),
    supabase.from('documentos').select('*').eq('reuniao_id', id).order('numero'),
    supabase.from('comissoes').select('*').or(`reuniao_id.eq.${id},reuniao_id.is.null`).order('numero'),
  ])

  if (!reuniao) notFound()

  const r = reuniao as Reuniao
  const docs = (documentos ?? []) as Documento[]
  const nextNumero = docs.length > 0 ? Math.max(...docs.map(d => d.numero)) + 1 : 1

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/reunioes">Reuniões</Link>
        <span>/</span>
        <Link href={`/reunioes/${id}`} className="hover:text-gray-600">{r.numero}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Ementário</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ementário</h1>
          <p className="text-gray-500 text-sm mt-1">Reunião {r.numero} · {docs.length} documento(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Formulário */}
        <div className="col-span-2">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Adicionar documento</h2>
            <EmentaForm reuniaoId={id} nextNumero={nextNumero} comissoes={comissoes ?? []} />
          </div>
        </div>

        {/* Lista */}
        <div className="col-span-3">
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Documentos ({docs.length})</h2>
            </div>
            <table className="table-pssp">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20, width: 60 }}>Doc.</th>
                  <th>Assunto</th>
                  <th>Oriundo</th>
                  <th>Status</th>
                  <th style={{ paddingRight: 20 }}></th>
                </tr>
              </thead>
              <tbody>
                {docs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-8">Nenhum documento</td></tr>
                ) : docs.map(doc => {
                  const st = STATUS_MAP[doc.status] ?? { label: doc.status, cls: 'badge-gray' }
                  return (
                    <tr key={doc.id}>
                      <td style={{ paddingLeft: 20 }}>
                        <span className="font-mono font-semibold">{String(doc.numero).padStart(3, '0')}</span>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900 text-sm leading-snug">{doc.assunto}</div>
                        {doc.tipo && <div className="text-xs text-gray-400">{doc.tipo}</div>}
                      </td>
                      <td className="text-gray-500 text-sm">{doc.oriundo ?? '—'}</td>
                      <td>
                        <span className={`badge ${st.cls}`}>{st.label}</span>
                      </td>
                      <td style={{ paddingRight: 20 }}>
                        <div className="flex items-center gap-2">
                          {doc.pdf_url && <DocPdfLink path={doc.pdf_url} />}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

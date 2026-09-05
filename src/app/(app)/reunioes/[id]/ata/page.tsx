import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AtaEditor } from './ata-editor'
import type { Reuniao, Ata } from '@/types/database'

export default async function AtaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: reuniao }, { data: ataExistente }, { data: documentos }] = await Promise.all([
    supabase.from('reunioes').select('*').eq('id', id).single(),
    supabase.from('atas').select('*').eq('reuniao_id', id).single(),
    supabase.from('documentos').select('numero, assunto, oriundo, status').eq('reuniao_id', id).order('numero'),
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

      <div className="grid grid-cols-3 gap-6">
        {/* Editor */}
        <div className="col-span-2">
          <AtaEditor reuniaoId={id} ata={ata} reuniao={r} />
        </div>

        {/* Painel lateral */}
        <div className="space-y-4">
          {/* Documentos aprovados */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Documentos da reunião</h3>
            <div className="space-y-2">
              {docs.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhum documento</p>
              ) : docs.map((d: { numero: number; assunto: string; oriundo: string | null; status: string }) => (
                <div key={d.numero} className="flex items-start gap-2 text-xs">
                  <span className="font-mono font-semibold text-gray-500 w-7 flex-shrink-0 mt-0.5">
                    {String(d.numero).padStart(3, '0')}
                  </span>
                  <div>
                    <div className="text-gray-700 leading-snug">{d.assunto}</div>
                    {d.oriundo && <div className="text-gray-400 mt-0.5">{d.oriundo}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aprovações */}
          {ata && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Aprovações da ata</h3>
              <div className="space-y-2">
                {['Moderador', '1º Secretário', '2º Secretário'].map(cargo => (
                  <div key={cargo} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{cargo}</span>
                    <span className="badge badge-gray text-xs">Pendente</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

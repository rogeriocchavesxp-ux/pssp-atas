'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { DocProposta } from './page'

// Rótulos exibidos ao usuário na coluna Status
function statusLabel(s: string): string {
  if (s === 'em_votacao' || s === 'aprovado' || s === 'rejeitado') return 'Concluído'
  if (s === 'em_analise') return 'Em análise'
  return 'Recebido'
}

function statusBadge(s: string): string {
  if (s === 'aprovado')  return 'badge-green'
  if (s === 'rejeitado') return 'badge-red'
  if (s === 'em_votacao') return 'badge-green'
  if (s === 'em_analise') return 'badge-blue'
  return 'badge-gray'
}

// Para agrupamento visual
const GRUPO_LABEL: Record<string, string> = {
  em_votacao: 'Aguardando votação do Plenário',
  em_analise: 'Em análise nas comissões',
  aprovado:   'Aprovados',
  rejeitado:  'Rejeitados',
}

const GRUPO_BADGE: Record<string, string> = {
  em_votacao: 'bg-amber-100 text-amber-700',
  em_analise: 'badge-blue',
  aprovado:   'badge-green',
  rejeitado:  'badge-red',
}

type Grupo = { key: string; label: string; docs: DocProposta[] }

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let r = ''
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i] }
  }
  return r
}

export function PropostasClient({
  docs: inicial,
  isPresidente,
  userId,
}: {
  docs: DocProposta[]
  isPresidente: boolean
  userId: string | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const [docs, setDocs] = useState(inicial)
  const [atualizando, setAtualizando] = useState<string | null>(null)
  const [detalhe, setDetalhe] = useState<DocProposta | null>(null)

  const grupos: Grupo[] = [
    { key: 'em_votacao', label: 'Aguardando votação do Plenário', docs: docs.filter(d => d.status === 'em_votacao') },
    { key: 'em_analise', label: 'Em análise nas comissões',       docs: docs.filter(d => d.status === 'em_analise') },
    { key: 'aprovado',   label: 'Aprovados',                      docs: docs.filter(d => d.status === 'aprovado') },
    { key: 'rejeitado',  label: 'Rejeitados',                     docs: docs.filter(d => d.status === 'rejeitado') },
  ]

  async function aprovar(doc: DocProposta) {
    if (!doc.reuniao_id) return
    setAtualizando(doc.id)

    // Próximo número de resolução na reunião
    const { data: ultima } = await supabase
      .from('resolucoes')
      .select('numero')
      .eq('reuniao_id', doc.reuniao_id)
      .order('numero', { ascending: false })
      .limit(1)
      .single()

    const proximoNumero = (ultima?.numero ?? 0) + 1

    // Cria a resolução
    const { error: errRes } = await supabase.from('resolucoes').insert({
      documento_id: doc.id,
      reuniao_id:   doc.reuniao_id,
      numero:       proximoNumero,
      ementa:       doc.assunto,
      texto:        doc.proposta ?? null,
      status:       'aprovada',
      data:         new Date().toISOString().split('T')[0],
    })

    if (errRes) { setAtualizando(null); alert(errRes.message); return }

    // Atualiza status do documento
    await supabase.from('documentos').update({ status: 'aprovado' }).eq('id', doc.id)

    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'aprovado' } : d))
    setDetalhe(null)
    setAtualizando(null)
    router.refresh()
  }

  async function rejeitar(doc: DocProposta) {
    setAtualizando(doc.id)
    await supabase.from('documentos').update({ status: 'rejeitado' }).eq('id', doc.id)
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'rejeitado' } : d))
    setDetalhe(null)
    setAtualizando(null)
    router.refresh()
  }

  async function devolver(doc: DocProposta) {
    setAtualizando(doc.id)
    await supabase.from('documentos').update({ status: 'em_analise' }).eq('id', doc.id)
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'em_analise' } : d))
    setDetalhe(null)
    setAtualizando(null)
    router.refresh()
  }

  const total = docs.length
  const emVotacao = grupos[0].docs.length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propostas de Resolução</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} proposta(s) · {emVotacao} aguardando votação
            {isPresidente && <span className="ml-2 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Presidente</span>}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {grupos.map(g => {
          if (g.docs.length === 0) return null
          return (
            <div key={g.key}>
              {/* Cabeçalho do grupo */}
              <div className="flex items-center gap-3 mb-3">
                <span className={`badge ${GRUPO_BADGE[g.key] ?? 'badge-gray'} text-xs`}>
                  {GRUPO_LABEL[g.key]}
                </span>
                <span className="text-xs text-gray-400">{g.docs.length} item(s)</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              {/* Tabela */}
              <div className="card p-0 overflow-hidden">
                <table className="table-pssp">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: 20, width: 60 }}>Doc.</th>
                      <th>Assunto</th>
                      <th>Oriundo</th>
                      <th>Comissão</th>
                      <th>Reunião</th>
                      <th>Status</th>
                      {isPresidente && g.key === 'em_votacao' && (
                        <th style={{ paddingRight: 20 }}>Ação</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {g.docs.map(d => {
                      const com = d.comissao as { numero: number; nome: string | null } | null
                      const reu = d.reuniao as { id: string; numero: string; data_inicio: string } | null
                      return (
                        <tr
                          key={d.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setDetalhe(d)}
                        >
                          <td style={{ paddingLeft: 20 }}>
                            <span className="font-mono font-semibold text-gray-700">
                              {String(d.numero).padStart(3, '0')}
                            </span>
                          </td>
                          <td>
                            <div className="font-medium text-gray-900 text-sm leading-snug">{d.assunto}</div>
                          </td>
                          <td className="text-gray-500 text-sm">{d.oriundo ?? '—'}</td>
                          <td className="text-sm text-gray-600">
                            {com ? `Comissão ${toRoman(com.numero)}${com.nome ? ` — ${com.nome}` : ''}` : '—'}
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            {reu ? (
                              <Link href={`/reunioes/${d.reuniao_id}`} className="text-sm" style={{ color: '#1B3A6B' }}>
                                {reu.numero}
                              </Link>
                            ) : '—'}
                          </td>
                          <td style={{ paddingRight: isPresidente && g.key === 'em_votacao' ? 0 : 20 }}>
                            <span className={`badge ${statusBadge(d.status)}`}>
                              {statusLabel(d.status)}
                            </span>
                          </td>
                          {isPresidente && g.key === 'em_votacao' && (
                            <td style={{ paddingRight: 20 }} onClick={e => e.stopPropagation()}>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => aprovar(d)}
                                  disabled={atualizando === d.id}
                                  className="px-3 py-1 text-xs font-semibold text-white rounded-md disabled:opacity-50"
                                  style={{ background: '#16a34a' }}
                                >
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => rejeitar(d)}
                                  disabled={atualizando === d.id}
                                  className="px-3 py-1 text-xs font-semibold text-white rounded-md bg-red-600 disabled:opacity-50"
                                >
                                  Rejeitar
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}

        {total === 0 && (
          <div className="card text-center text-gray-400 py-16">
            Nenhuma proposta de resolução ainda.
          </div>
        )}
      </div>

      {/* Modal de detalhe / proposta */}
      {detalhe && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400">Doc. {String(detalhe.numero).padStart(3, '0')}</span>
                  <span className={`badge ${statusBadge(detalhe.status)} text-xs`}>
                    {statusLabel(detalhe.status)}
                  </span>
                </div>
                <h2 className="font-semibold text-gray-900 mt-1">{detalhe.assunto}</h2>
              </div>
              <button onClick={() => setDetalhe(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {detalhe.oriundo && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Oriundo</p>
                  <p className="text-sm text-gray-700">{detalhe.oriundo}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Proposta da Comissão</p>
                {detalhe.proposta ? (
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-serif bg-gray-50 rounded-lg p-4">
                    {detalhe.proposta}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sem proposta registrada.</p>
                )}
              </div>
            </div>
            {isPresidente && (
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => devolver(detalhe)}
                  disabled={atualizando === detalhe.id || detalhe.status === 'em_analise'}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Devolver à comissão
                </button>
                <button
                  onClick={() => rejeitar(detalhe)}
                  disabled={atualizando === detalhe.id || detalhe.status === 'rejeitado'}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white bg-red-600 disabled:opacity-40"
                >
                  Rejeitar
                </button>
                <button
                  onClick={() => aprovar(detalhe)}
                  disabled={atualizando === detalhe.id || !detalhe.reuniao_id || detalhe.status === 'aprovado'}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-40"
                  style={{ background: '#16a34a' }}
                >
                  {atualizando === detalhe.id ? 'Processando...' : 'Aprovar'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

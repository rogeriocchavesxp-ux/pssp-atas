'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AtaEditor, type AtaEditorHandle } from './ata-editor'
import type { Ata, Reuniao, AtaConteudo } from '@/types/database'
import type { DocAta } from './page'

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let r = ''
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i] }
  }
  return r
}

function inicializarInseridos(docs: DocAta[], ata: Ata | null): Set<string> {
  if (!ata) return new Set()
  const raw = ata.conteudo as Record<string, unknown>
  const sessoes: string[] = Array.isArray(raw?.sessoes_regulares)
    ? (raw.sessoes_regulares as string[])
    : []
  const texto = sessoes.join('\n')
  return new Set(
    docs.filter(d => {
      if (!d.resolucao) return false
      const roman = toRoman(d.resolucao.numero)
      return new RegExp(`DOC\\.${roman}(?![IVXLCDM])`).test(texto)
    }).map(d => d.id)
  )
}

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  em_aprovacao: 'Em aprovação',
  publicada: 'Publicada',
}

export function AtaPageClient({
  reuniaoId,
  ata,
  reuniao,
  docs,
}: {
  reuniaoId: string
  ata: Ata | null
  reuniao: Reuniao
  docs: DocAta[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const ataRef = useRef<AtaEditorHandle>(null)
  const [inserted, setInserted] = useState<Set<string>>(() => inicializarInseridos(docs, ata))
  const [enviando, setEnviando] = useState(false)
  const [statusAtual, setStatusAtual] = useState(ata?.status ?? null)

  async function enviarParaAprovacao() {
    if (!ata) return
    if (!window.confirm('Enviar a ata para aprovação? Após enviar, o conteúdo não poderá ser editado.')) return
    setEnviando(true)
    await supabase.from('atas').update({ status: 'em_aprovacao' }).eq('id', ata.id)
    setStatusAtual('em_aprovacao')
    setEnviando(false)
    router.refresh()
  }

  function handleInserir(doc: DocAta) {
    ataRef.current?.inserirNaAta(doc)
    setInserted(prev => new Set([...prev, doc.id]))
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ata da Reunião</h1>
          <p className="text-gray-500 text-sm mt-1">
            {reuniao.numero} · {new Date(reuniao.data_inicio).toLocaleDateString('pt-BR')}
            {statusAtual ? ` · ${STATUS_LABEL[statusAtual] ?? statusAtual}` : ' · Rascunho não iniciado'}
          </p>
        </div>
        {ata && statusAtual === 'rascunho' && (
          <button
            onClick={enviarParaAprovacao}
            disabled={enviando}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: '#16a34a' }}
          >
            {enviando ? 'Enviando...' : 'Enviar para aprovação'}
          </button>
        )}
        {statusAtual === 'em_aprovacao' && (
          <span className="px-3 py-1.5 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200">
            Em aprovação
          </span>
        )}
        {statusAtual === 'publicada' && (
          <span className="px-3 py-1.5 rounded-lg text-sm font-semibold text-green-700 bg-green-50 border border-green-200">
            Publicada
          </span>
        )}
      </div>

    <div className="grid grid-cols-3 gap-6">
      {/* Editor */}
      <div className="col-span-2">
        <AtaEditor ref={ataRef} reuniaoId={reuniaoId} ata={ata} reuniao={reuniao} />
      </div>

      {/* Coluna direita */}
      <div className="space-y-4">
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

        {/* Documentos da reunião */}
        {docs.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Documentos da reunião</h3>
            <div className="space-y-3">
              {docs.map(d => {
                const temResolucao = !!d.resolucao
                const jaInserido = inserted.has(d.id)
                return (
                  <div key={d.id} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs font-semibold text-gray-400 flex-shrink-0">
                        {String(d.numero).padStart(3, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-700 leading-snug">{d.assunto}</div>
                        {d.oriundo && <div className="text-xs text-gray-400">{d.oriundo}</div>}
                      </div>
                    </div>
                    <div className="pl-7">
                      {temResolucao ? (
                        <button
                          onClick={() => handleInserir(d)}
                          disabled={jaInserido}
                          className="text-xs px-2 py-0.5 rounded font-semibold w-full text-center disabled:cursor-default"
                          style={
                            jaInserido
                              ? { background: '#f3f4f6', color: '#9ca3af' }
                              : { background: '#1B3A6B', color: '#fff' }
                          }
                        >
                          {jaInserido ? 'Inserido' : 'Inserir na Ata'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300 italic">sem resolução</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

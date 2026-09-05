'use client'
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SecaoMinistro } from './secao-ministro'
import { SecaoConselho } from './secao-conselho'
import { SecaoCongregacao } from './secao-congregacao'
import { SecaoEstatistica } from './secao-estatistica'

const ABAS = [
  { key: 'ministro', label: 'Relatório do Ministro' },
  { key: 'conselho', label: 'Conselho / Mesa' },
  { key: 'congregacao', label: 'Congregação (opcional)' },
  { key: 'cadastro_estatistica', label: 'Cadastro & Estatística' },
] as const

type AbaKey = typeof ABAS[number]['key']

const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  submetido: 'Submetido',
  em_revisao: 'Em revisão',
  aprovado: 'Aprovado',
  devolvido: 'Devolvido',
}

const STATUS_CLS: Record<string, string> = {
  rascunho: 'badge-gray',
  submetido: 'badge-blue',
  em_revisao: 'badge-yellow',
  aprovado: 'badge-green',
  devolvido: 'badge-red',
}

interface Props {
  relatorio: Record<string, unknown>
}

export function RelatorioWizard({ relatorio }: Props) {
  const supabase = createClient()
  const [abaAtiva, setAbaAtiva] = useState<AbaKey>('ministro')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [status, setStatus] = useState(relatorio.status as string)

  const church = relatorio.igreja as { nome: string; sigla: string | null } | null
  const isReadOnly = status === 'aprovado' || status === 'submetido' || status === 'em_revisao'

  const salvarSecao = useCallback(async (secao: AbaKey, dados: unknown) => {
    setSaving(true)
    setSavedMsg('')
    const { error } = await supabase
      .from('relatorios_anuais')
      .update({ [secao]: dados })
      .eq('id', relatorio.id as string)
    setSaving(false)
    if (!error) {
      setSavedMsg('Salvo')
      setTimeout(() => setSavedMsg(''), 2000)
    }
  }, [supabase, relatorio.id])

  async function submeter() {
    if (!confirm('Confirma o envio do relatório à Comissão Executiva? Após envio não será possível editar.')) return
    setSaving(true)
    const { error } = await supabase
      .from('relatorios_anuais')
      .update({ status: 'submetido' })
      .eq('id', relatorio.id as string)
    setSaving(false)
    if (!error) setStatus('submetido')
  }

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Relatório Anual {relatorio.ano as number}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {church?.nome ?? 'Igreja não identificada'}
            {church?.sigla ? ` · ${church.sigla}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && <span className="text-xs text-green-500">{savedMsg}</span>}
          <span className={`badge ${STATUS_CLS[status] ?? 'badge-gray'}`}>
            {STATUS_LABELS[status] ?? status}
          </span>
          {(status === 'rascunho' || status === 'devolvido') && (
            <button
              onClick={submeter}
              disabled={saving}
              className="px-4 py-2 rounded-md text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: '#B8962E' }}
            >
              Enviar para aprovação
            </button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="mb-4 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
          Este relatório está {STATUS_LABELS[status]?.toLowerCase()} e não pode ser editado.
          {typeof relatorio.observacoes_revisao === 'string' && relatorio.observacoes_revisao && (
            <span className="block mt-1 font-medium">
              Observação da CE: {relatorio.observacoes_revisao}
            </span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {ABAS.map(aba => {
          const preenchida = !!relatorio[aba.key]
          return (
            <button
              key={aba.key}
              onClick={() => setAbaAtiva(aba.key)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
                abaAtiva === aba.key
                  ? 'text-gray-900 border-navy'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
              style={abaAtiva === aba.key ? { borderBottomColor: '#1B3A6B' } : {}}
            >
              {preenchida && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
              {aba.label}
            </button>
          )
        })}
      </div>

      {/* Conteúdo */}
      <div>
        {abaAtiva === 'ministro' && (
          <SecaoMinistro
            dados={(relatorio.ministro ?? {}) as Record<string, unknown>}
            readOnly={isReadOnly}
            saving={saving}
            onSave={(d) => salvarSecao('ministro', d)}
          />
        )}
        {abaAtiva === 'conselho' && (
          <SecaoConselho
            dados={(relatorio.conselho ?? {}) as Record<string, unknown>}
            readOnly={isReadOnly}
            saving={saving}
            titulo="Relatório do Conselho ou Mesa Administrativa"
            onSave={(d) => salvarSecao('conselho', d)}
          />
        )}
        {abaAtiva === 'congregacao' && (
          <SecaoCongregacao
            dados={(relatorio.congregacao ?? {}) as Record<string, unknown>}
            readOnly={isReadOnly}
            saving={saving}
            onSave={(d) => salvarSecao('congregacao', d)}
          />
        )}
        {abaAtiva === 'cadastro_estatistica' && (
          <SecaoEstatistica
            dados={(relatorio.cadastro_estatistica ?? {}) as Record<string, unknown>}
            readOnly={isReadOnly}
            saving={saving}
            onSave={(d) => salvarSecao('cadastro_estatistica', d)}
          />
        )}
      </div>
    </div>
  )
}

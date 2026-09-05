'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Ata, Reuniao, AtaConteudo } from '@/types/database'

const SECOES: { key: keyof AtaConteudo; label: string; placeholder: string }[] = [
  {
    key: 'abertura',
    label: 'Abertura',
    placeholder: 'Descreva a abertura da reunião: hora, local, invocação, verificação do quórum...',
  },
  {
    key: 'verificacao_quorum',
    label: 'Verificação do Quórum',
    placeholder: 'Liste os membros presentes e ausentes. Declare o quórum atingido ou não...',
  },
  {
    key: 'pauta',
    label: 'Pauta',
    placeholder: 'Relacione os itens tratados, em ordem. Inclua informes, apresentação de documentos...',
  },
  {
    key: 'deliberacoes',
    label: 'Deliberações',
    placeholder: 'Registre as decisões tomadas com numeração sequencial. Ex: Resolução 001: ...',
  },
  {
    key: 'encerramento',
    label: 'Encerramento',
    placeholder: 'Hora de encerramento, oração de encerramento, assinaturas...',
  },
  {
    key: 'observacoes',
    label: 'Observações',
    placeholder: 'Registros adicionais que não se encaixam nas seções acima...',
  },
]

const CONTEUDO_VAZIO: AtaConteudo = {
  abertura: '', verificacao_quorum: '', pauta: '',
  deliberacoes: '', encerramento: '', observacoes: '',
}

export function AtaEditor({ reuniaoId, ata, reuniao }: { reuniaoId: string; ata: Ata | null; reuniao: Reuniao }) {
  const router = useRouter()
  const supabase = createClient()
  const [conteudo, setConteudo] = useState<AtaConteudo>(ata?.conteudo ?? CONTEUDO_VAZIO)
  const [secaoAtiva, setSecaoAtiva] = useState<keyof AtaConteudo>('abertura')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function setSecao(key: keyof AtaConteudo, value: string) {
    setConteudo(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function salvar() {
    setSaving(true)
    if (ata) {
      await supabase.from('atas').update({ conteudo }).eq('id', ata.id)
    } else {
      await supabase.from('atas').insert({
        reuniao_id: reuniaoId,
        conteudo,
        status: 'rascunho',
      })
    }
    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  const secaoAtual = SECOES.find(s => s.key === secaoAtiva)!

  return (
    <div className="card p-0 overflow-hidden">
      {/* Tabs de seção */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {SECOES.map(s => {
          const preenchida = (conteudo[s.key] ?? '').trim().length > 0
          return (
            <button
              key={s.key}
              onClick={() => setSecaoAtiva(s.key)}
              className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                secaoAtiva === s.key
                  ? 'border-navy-700 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
              style={secaoAtiva === s.key ? { borderBottomColor: '#1B3A6B' } : {}}
            >
              {preenchida && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Área de texto */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">{secaoAtual.label}</h3>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-green-500">Salvo</span>}
            <button
              onClick={salvar}
              disabled={saving}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-60"
              style={{ background: '#1B3A6B' }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
        <textarea
          value={conteudo[secaoAtiva] ?? ''}
          onChange={e => setSecao(secaoAtiva, e.target.value)}
          placeholder={secaoAtual.placeholder}
          rows={16}
          className="w-full text-sm text-gray-800 leading-relaxed resize-none focus:outline-none font-mono"
          style={{ fontFamily: 'ui-monospace, "Courier New", monospace', fontSize: 13 }}
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {ata ? `Última atualização: ${new Date(ata.updated_at).toLocaleString('pt-BR')}` : 'Ata não iniciada'}
        </div>
        <div className="flex items-center gap-2">
          {SECOES.map(s => (
            <div
              key={s.key}
              title={s.label}
              className={`w-2 h-2 rounded-full ${conteudo[s.key]?.trim() ? 'bg-green-400' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Oficial, ReuniaoPresenca } from '@/types/database'

const TIPO_MAP: Record<string, string> = {
  pastor: 'Pastor', presbitero: 'Presbítero', diacono: 'Diácono',
}

export function PresencaList({
  reuniaoId,
  oficiais,
  presencas: initialPresencas,
}: {
  reuniaoId: string
  oficiais: Oficial[]
  presencas: ReuniaoPresenca[]
}) {
  const supabase = createClient()
  const [presencas, setPresencas] = useState<ReuniaoPresenca[]>(initialPresencas)
  const [saving, setSaving] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  function getPresenca(oficialId: string) {
    return presencas.find(p => p.oficial_id === oficialId)
  }

  async function togglePresenca(oficial: Oficial) {
    setSaving(oficial.id)
    const existente = getPresenca(oficial.id)
    if (existente) {
      const novoValor = !existente.presente
      await supabase.from('reuniao_presencas')
        .update({ presente: novoValor })
        .eq('id', existente.id)
      setPresencas(prev => prev.map(p => p.id === existente.id ? { ...p, presente: novoValor } : p))
    } else {
      const { data } = await supabase.from('reuniao_presencas').insert({
        reuniao_id: reuniaoId,
        oficial_id: oficial.id,
        presente: true,
      }).select().single()
      if (data) setPresencas(prev => [...prev, data as ReuniaoPresenca])
    }
    setSaving(null)
  }

  async function marcarTodos(presente: boolean) {
    setSaving('all')
    const inserts = oficiais
      .filter(o => !getPresenca(o.id))
      .map(o => ({ reuniao_id: reuniaoId, oficial_id: o.id, presente }))

    if (inserts.length > 0) {
      const { data } = await supabase.from('reuniao_presencas').insert(inserts).select()
      if (data) setPresencas(prev => [...prev, ...(data as ReuniaoPresenca[])])
    }

    const updates = oficiais
      .filter(o => getPresenca(o.id))
      .map(o => getPresenca(o.id)!.id)

    for (const pid of updates) {
      await supabase.from('reuniao_presencas').update({ presente }).eq('id', pid)
    }
    setPresencas(prev => prev.map(p => ({ ...p, presente })))
    setSaving(null)
  }

  const filtrados = oficiais.filter(o =>
    o.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const presentes = presencas.filter(p => p.presente).length

  return (
    <div className="card p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar oficial..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1"
        />
        <div className="text-sm font-semibold text-gray-700 min-w-fit">
          {presentes} / {oficiais.length} presentes
        </div>
        <button
          onClick={() => marcarTodos(true)}
          disabled={saving === 'all'}
          className="px-3 py-2 rounded-lg text-xs font-medium border border-green-200 text-green-700 hover:bg-green-50"
        >
          Marcar todos
        </button>
        <button
          onClick={() => marcarTodos(false)}
          disabled={saving === 'all'}
          className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Limpar
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {filtrados.map(o => {
          const p = getPresenca(o.id)
          const isPresente = p?.presente ?? false
          const isSaving = saving === o.id
          const ig = o.igreja as { nome: string; sigla: string | null } | null

          return (
            <div
              key={o.id}
              className={`flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors ${
                isPresente ? 'bg-green-50/60' : 'hover:bg-gray-50'
              }`}
              onClick={() => !isSaving && togglePresenca(o)}
            >
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                isPresente ? 'border-green-500 bg-green-500' : 'border-gray-300'
              }`}>
                {isPresente && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                )}
              </div>

              {/* Nome */}
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${isPresente ? 'text-gray-900' : 'text-gray-600'}`}>
                  {o.nome}
                </div>
                <div className="text-xs text-gray-400">
                  {TIPO_MAP[o.tipo] ?? o.tipo}
                  {ig ? ` · ${ig.sigla ?? ig.nome}` : ''}
                </div>
              </div>

              {/* Status */}
              <div className="text-xs">
                {isSaving ? (
                  <span className="text-gray-400">...</span>
                ) : isPresente ? (
                  <span className="text-green-600 font-medium">Presente</span>
                ) : (
                  <span className="text-gray-300">Ausente</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Comissao } from '@/types/database'

export function ComissaoSelector({
  docId,
  comissaoId,
  comissoes,
}: {
  docId: string
  comissaoId: string | null
  comissoes: Pick<Comissao, 'id' | 'numero' | 'nome'>[]
}) {
  const supabase = createClient()
  const [valor, setValor] = useState(comissaoId ?? '')
  const [saving, setSaving] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoId = e.target.value || null
    setSaving(true)
    await supabase.from('documentos').update({ comissao_id: novoId }).eq('id', docId)
    setValor(novoId ?? '')
    setSaving(false)
  }

  const selecionada = comissoes.find(c => c.id === valor)

  return (
    <div className="relative">
      <select
        value={valor}
        onChange={handleChange}
        disabled={saving}
        className={`text-xs rounded-md border px-2 py-1 pr-5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white cursor-pointer appearance-none
          ${selecionada ? 'border-blue-200 text-blue-700 font-medium' : 'border-gray-200 text-gray-400'}
          ${saving ? 'opacity-50' : ''}`}
      >
        <option value="">— Sem comissão</option>
        {comissoes.map(c => (
          <option key={c.id} value={c.id}>
            Comissão {c.numero}{c.nome ? ` — ${c.nome}` : ''}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Comissao } from '@/types/database'

export function ComissoesClient({ comissoes: inicial }: { comissoes: Comissao[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [comissoes, setComissoes] = useState(inicial)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ numero: '', nome: '', tipo: 'permanente' })

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data, error } = await supabase.from('comissoes').insert({
      numero: parseInt(form.numero),
      nome: form.nome.trim() || null,
      tipo: form.tipo,
      ativa: true,
    }).select('*, membros:comissao_membros(id, funcao, oficial:oficiais(nome, tipo))').single()
    setSaving(false)
    if (!error && data) {
      setComissoes(prev => [...prev, data as Comissao].sort((a, b) => a.numero - b.numero))
      setModal(false)
      setForm({ numero: '', nome: '', tipo: 'permanente' })
      router.refresh()
    }
  }

  const cls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comissões</h1>
          <p className="text-gray-500 text-sm mt-1">{comissoes.length} comissões</p>
        </div>
        <button onClick={() => setModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}>
          + Nova comissão
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {comissoes.length === 0 ? (
          <div className="col-span-3 card text-center text-gray-400 py-12">Nenhuma comissão cadastrada</div>
        ) : comissoes.map(c => {
          const membros = (c.membros ?? []) as Array<{ id: string; funcao: string; oficial: { nome: string; tipo: string } | null }>
          const presidente = membros.find(m => m.funcao === 'presidente')
          return (
            <div key={c.id} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg text-white text-sm font-bold flex items-center justify-center"
                  style={{ background: '#B8962E' }}>
                  {c.numero}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Comissão {c.numero}</div>
                  {c.nome && <div className="text-xs text-gray-400">{c.nome}</div>}
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                {membros.length} membro(s)
                {presidente?.oficial && ` · Pres: ${presidente.oficial.nome.split(' ')[0]}`}
              </div>
              <div className="space-y-1">
                {membros.slice(0, 3).map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                    {m.oficial?.nome ?? '—'}
                    {m.funcao !== 'membro' && <span className="text-gray-400">({m.funcao})</span>}
                  </div>
                ))}
                {membros.length > 3 && <div className="text-xs text-gray-400">+{membros.length - 3} mais</div>}
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Nova Comissão</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Número *</label>
                  <input required type="number" min={1} className={cls} value={form.numero} onChange={e => set('numero', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                  <select className={`${cls} bg-white`} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                    <option value="permanente">Permanente</option>
                    <option value="temporaria">Temporária</option>
                    <option value="especial">Especial</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome / Designação</label>
                <input className={cls} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Comissão de Finanças" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 rounded-md text-sm font-medium border border-gray-200 text-gray-600">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: '#1B3A6B' }}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

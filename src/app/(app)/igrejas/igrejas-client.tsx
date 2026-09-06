'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Igreja } from '@/types/database'

const TIPO_MAP: Record<string, string> = {
  sede: 'Sede', congregacao: 'Congregação', campo: 'Campo', missao: 'Missão',
}

export function IgrejasClient({ igrejas: inicial }: { igrejas: Igreja[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [igrejas, setIgrejas] = useState(inicial)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({ nome: '', sigla: '', cidade: '', bairro: '', tipo: 'sede' })

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErro('')
    const { data, error } = await supabase.from('igrejas').insert({
      nome: form.nome.trim(),
      sigla: form.sigla.trim() || null,
      cidade: form.cidade.trim() || null,
      bairro: form.bairro.trim() || null,
      tipo: form.tipo,
      ativa: true,
    }).select('*').single()
    setSaving(false)
    if (error) { setErro(error.message); return }
    if (data) {
      setIgrejas(prev => [...prev, data as Igreja].sort((a, b) => a.nome.localeCompare(b.nome)))
      setModal(false)
      setForm({ nome: '', sigla: '', cidade: '', bairro: '', tipo: 'sede' })
      router.refresh()
    }
  }

  const cls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Igrejas</h1>
          <p className="text-gray-500 text-sm mt-1">{igrejas.length} igrejas cadastradas</p>
        </div>
        <button onClick={() => setModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}>
          + Nova igreja
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {igrejas.length === 0 ? (
          <div className="col-span-3 card text-center text-gray-400 py-12">Nenhuma igreja cadastrada</div>
        ) : igrejas.map(ig => (
          <div key={ig.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: '#1B3A6B' }}>
                {(ig.sigla ?? ig.nome.substring(0, 2)).substring(0, 3)}
              </div>
              <span className={`badge ${ig.ativa ? 'badge-green' : 'badge-gray'} text-xs`}>
                {ig.ativa ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <div className="font-semibold text-gray-900 mb-1 leading-snug">{ig.nome}</div>
            <div className="text-sm text-gray-400">
              {TIPO_MAP[ig.tipo] ?? ig.tipo}
              {ig.cidade ? ` · ${ig.cidade}` : ''}
              {ig.bairro ? `, ${ig.bairro}` : ''}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Nova Igreja</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4">
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{erro}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome *</label>
                <input required className={cls} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Igreja Presbiteriana em..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sigla</label>
                  <input className={cls} value={form.sigla} onChange={e => set('sigla', e.target.value)} placeholder="IP..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                  <select className={`${cls} bg-white`} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                    <option value="sede">Sede</option>
                    <option value="congregacao">Congregação</option>
                    <option value="campo">Campo</option>
                    <option value="missao">Missão</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cidade</label>
                  <input className={cls} value={form.cidade} onChange={e => set('cidade', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Bairro</label>
                  <input className={cls} value={form.bairro} onChange={e => set('bairro', e.target.value)} />
                </div>
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

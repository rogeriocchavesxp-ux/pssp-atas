'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Oficial, Igreja } from '@/types/database'

type IgrejaLite = Pick<Igreja, 'id' | 'nome' | 'sigla'>

const TIPO_MAP: Record<string, string> = {
  pastor: 'Pastor', presbitero: 'Presbítero', diacono: 'Diácono',
}

export function OficiaisClient({
  oficiais: inicial,
  igrejas,
}: {
  oficiais: (Oficial & { igreja: { nome: string; sigla: string | null } | null })[]
  igrejas: IgrejaLite[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [oficiais, setOficiais] = useState(inicial)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: '', tipo: 'pastor', cargo: '', email: '', telefone: '', igreja_id: '',
  })

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErro('')
    const { data, error } = await supabase.from('oficiais').insert({
      nome: form.nome.trim(),
      tipo: form.tipo,
      cargo: form.cargo.trim() || null,
      email: form.email.trim() || null,
      telefone: form.telefone.trim() || null,
      igreja_id: form.igreja_id || null,
      ativo: true,
    }).select('*, igreja:igrejas(nome, sigla)').single()
    setSaving(false)
    if (error) { setErro(error.message); return }
    if (data) {
      setOficiais(prev => [...prev, data as typeof inicial[0]].sort((a, b) => a.nome.localeCompare(b.nome)))
      setModal(false)
      setForm({ nome: '', tipo: 'pastor', cargo: '', email: '', telefone: '', igreja_id: '' })
      router.refresh()
    }
  }

  const cls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Oficiais</h1>
          <p className="text-gray-500 text-sm mt-1">{oficiais.length} pastores e presbíteros</p>
        </div>
        <button onClick={() => { setModal(true); setErro('') }}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}>
          + Novo oficial
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-pssp">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Nome</th>
              <th>Tipo</th>
              <th>Cargo</th>
              <th>Igreja</th>
              <th style={{ paddingRight: 20 }}>Situação</th>
            </tr>
          </thead>
          <tbody>
            {oficiais.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-12">Nenhum oficial cadastrado</td>
              </tr>
            ) : oficiais.map(o => (
              <tr key={o.id}>
                <td style={{ paddingLeft: 20 }}>
                  <div className="font-medium text-gray-900">{o.nome}</div>
                  {o.email && <div className="text-xs text-gray-400">{o.email}</div>}
                </td>
                <td>
                  <span className={`badge ${o.tipo === 'pastor' ? 'badge-navy' : 'badge-gold'}`}>
                    {TIPO_MAP[o.tipo] ?? o.tipo}
                  </span>
                </td>
                <td className="text-gray-500 text-sm">{o.cargo ?? '—'}</td>
                <td className="text-gray-600 text-sm">
                  {o.igreja ? (o.igreja.sigla ? `${o.igreja.sigla} — ${o.igreja.nome}` : o.igreja.nome) : '—'}
                </td>
                <td style={{ paddingRight: 20 }}>
                  <span className={`badge ${o.ativo ? 'badge-green' : 'badge-gray'}`}>
                    {o.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Novo Oficial</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4">
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{erro}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome completo *</label>
                <input required className={cls} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Rev. João da Silva" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tipo *</label>
                  <select className={`${cls} bg-white`} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                    <option value="pastor">Pastor</option>
                    <option value="presbitero">Presbítero</option>
                    <option value="diacono">Diácono</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cargo</label>
                  <input className={cls} value={form.cargo} onChange={e => set('cargo', e.target.value)} placeholder="Ex: Efetivo" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Igreja</label>
                <select className={`${cls} bg-white`} value={form.igreja_id} onChange={e => set('igreja_id', e.target.value)}>
                  <option value="">Nenhuma</option>
                  {igrejas.map(ig => (
                    <option key={ig.id} value={ig.id}>{ig.nome}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">E-mail</label>
                  <input type="email" className={cls} value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Telefone</label>
                  <input className={cls} value={form.telefone} onChange={e => set('telefone', e.target.value)} />
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

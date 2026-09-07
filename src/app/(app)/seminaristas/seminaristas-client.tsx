'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Seminarista, Igreja } from '@/types/database'

type IgrejaLite = Pick<Igreja, 'id' | 'nome' | 'sigla'>

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  cursando:   { label: 'Cursando',   cls: 'badge-blue' },
  licenciado: { label: 'Licenciado', cls: 'badge-navy' },
  aprovado:   { label: 'Aprovado',   cls: 'badge-green' },
  desistiu:   { label: 'Desistiu',   cls: 'badge-gray' },
}

type SemRow = Seminarista & { igreja: { nome: string; sigla: string | null } | null }

export function SeminaristasClient({ seminaristas: inicial, igrejas }: { seminaristas: SemRow[]; igrejas: IgrejaLite[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [lista, setLista] = useState(inicial)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', seminario: '', curso_ano: '',
    ano_inicio: '', ano_formacao: '', status: 'cursando', igreja_id: '',
  })

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErro('')
    const { data, error } = await supabase.from('seminaristas').insert({
      nome: form.nome.trim(),
      email: form.email.trim() || null,
      telefone: form.telefone.trim() || null,
      seminario: form.seminario.trim() || null,
      curso_ano: form.curso_ano ? parseInt(form.curso_ano) : null,
      ano_inicio: form.ano_inicio ? parseInt(form.ano_inicio) : null,
      ano_formacao: form.ano_formacao ? parseInt(form.ano_formacao) : null,
      status: form.status,
      igreja_id: form.igreja_id || null,
      ativo: true,
    }).select('*, igreja:igrejas(nome, sigla)').single()
    setSaving(false)
    if (error) { setErro(error.message); return }
    if (data) {
      setLista(prev => [...prev, data as SemRow].sort((a, b) => a.nome.localeCompare(b.nome)))
      setModal(false)
      setForm({ nome: '', email: '', telefone: '', seminario: '', curso_ano: '', ano_inicio: '', ano_formacao: '', status: 'cursando', igreja_id: '' })
      router.refresh()
    }
  }

  const cls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1'
  const ativos = lista.filter(s => s.ativo).length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seminaristas</h1>
          <p className="text-gray-500 text-sm mt-1">{ativos} candidatos ativos</p>
        </div>
        <button onClick={() => { setModal(true); setErro('') }}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}>
          + Novo seminarista
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-pssp">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Nome</th>
              <th>Seminário</th>
              <th>Igreja</th>
              <th>Ano</th>
              <th>Início</th>
              <th>Formação</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-gray-400 py-12">Nenhum seminarista cadastrado</td></tr>
            ) : lista.map(s => {
              const st = STATUS_MAP[s.status] ?? { label: s.status, cls: 'badge-gray' }
              return (
                <tr key={s.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <div className="font-medium text-gray-900">{s.nome}</div>
                    {s.email && <div className="text-xs text-gray-400">{s.email}</div>}
                  </td>
                  <td className="text-gray-600 text-sm">{s.seminario ?? '—'}</td>
                  <td className="text-gray-600 text-sm">
                    {s.igreja ? (s.igreja.sigla ?? s.igreja.nome) : '—'}
                  </td>
                  <td className="text-gray-500 text-sm">{s.curso_ano ?? '—'}</td>
                  <td className="text-gray-500 text-sm">{s.ano_inicio ?? '—'}</td>
                  <td className="text-gray-500 text-sm">{s.ano_formacao ?? '—'}</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Novo Seminarista</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4">
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{erro}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome completo *</label>
                <input required className={cls} value={form.nome} onChange={e => set('nome', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Seminário</label>
                  <input className={cls} value={form.seminario} onChange={e => set('seminario', e.target.value)} placeholder="Ex: SPS, JMC" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ano do curso</label>
                  <input type="number" min={1} max={8} className={cls} value={form.curso_ano} onChange={e => set('curso_ano', e.target.value)} placeholder="1–8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ano de início</label>
                  <input type="number" min={2000} max={2100} className={cls} value={form.ano_inicio} onChange={e => set('ano_inicio', e.target.value)} placeholder="Ex: 2023" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ano de formação</label>
                  <input type="number" min={2000} max={2100} className={cls} value={form.ano_formacao} onChange={e => set('ano_formacao', e.target.value)} placeholder="Ex: 2028" />
                </div>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Igreja</label>
                  <select className={`${cls} bg-white`} value={form.igreja_id} onChange={e => set('igreja_id', e.target.value)}>
                    <option value="">Nenhuma</option>
                    {igrejas.map(ig => <option key={ig.id} value={ig.id}>{ig.sigla ?? ig.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select className={`${cls} bg-white`} value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="cursando">Cursando</option>
                    <option value="licenciado">Licenciado</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="desistiu">Desistiu</option>
                  </select>
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

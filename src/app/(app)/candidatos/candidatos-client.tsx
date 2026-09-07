'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Candidato, Igreja, Oficial } from '@/types/database'

type CandRow = Candidato & {
  tutor: { id: string; nome: string } | null
  igreja: { nome: string; sigla: string | null } | null
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  em_processo: { label: 'Em processo', cls: 'badge-blue' },
  aprovado:    { label: 'Aprovado',    cls: 'badge-green' },
  recusado:    { label: 'Recusado',    cls: 'badge-red' },
  desistiu:    { label: 'Desistiu',    cls: 'badge-gray' },
}

const EMPTY = {
  nome: '', email: '', telefone: '',
  data_candidatura: '', tutor_id: '', igreja_id: '',
  status: 'em_processo', observacoes: '',
}

export function CandidatosClient({
  candidatos: inicial,
  igrejas,
  pastores,
  isAdmin,
}: {
  candidatos: CandRow[]
  igrejas: Pick<Igreja, 'id' | 'nome' | 'sigla'>[]
  pastores: Pick<Oficial, 'id' | 'nome'>[]
  isAdmin: boolean
}) {
  const router = useRouter()
  const supabase = createClient()
  const [lista, setLista] = useState(inicial)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY })

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErro('')
    const { data, error } = await supabase
      .from('candidatos')
      .insert({
        nome:             form.nome.trim(),
        email:            form.email.trim() || null,
        telefone:         form.telefone.trim() || null,
        data_candidatura: form.data_candidatura || null,
        tutor_id:         form.tutor_id || null,
        igreja_id:        form.igreja_id || null,
        status:           form.status,
        observacoes:      form.observacoes.trim() || null,
        ativo: true,
      })
      .select('*, tutor:oficiais(id, nome), igreja:igrejas(nome, sigla)')
      .single()
    setSaving(false)
    if (error) { setErro(error.message); return }
    if (data) {
      setLista(prev => [...prev, data as CandRow].sort((a, b) => a.nome.localeCompare(b.nome)))
      setModal(false)
      setForm({ ...EMPTY })
      router.refresh()
    }
  }

  const cls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1'
  const ativos = lista.filter(c => c.ativo && c.status === 'em_processo').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatos ao Ministério</h1>
          <p className="text-gray-500 text-sm mt-1">{ativos} em processo</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setModal(true); setErro('') }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#1B3A6B' }}
          >
            + Novo candidato
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-pssp">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Nome</th>
              <th>Igreja</th>
              <th>Tutor</th>
              <th>Candidatura</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-12">
                  Nenhum candidato cadastrado
                </td>
              </tr>
            ) : lista.map(c => {
              const st = STATUS_MAP[c.status] ?? { label: c.status, cls: 'badge-gray' }
              return (
                <tr key={c.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <div className="font-medium text-gray-900">{c.nome}</div>
                    {c.email && <div className="text-xs text-gray-400">{c.email}</div>}
                    {c.observacoes && (
                      <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{c.observacoes}</div>
                    )}
                  </td>
                  <td className="text-gray-600 text-sm">
                    {c.igreja ? (c.igreja.sigla ?? c.igreja.nome) : '—'}
                  </td>
                  <td className="text-gray-600 text-sm">{c.tutor?.nome ?? '—'}</td>
                  <td className="text-gray-500 text-sm">
                    {c.data_candidatura
                      ? new Date(c.data_candidatura).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Novo Candidato</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4 overflow-y-auto flex-1">
              {erro && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{erro}</p>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome completo *</label>
                <input required className={cls} value={form.nome} onChange={e => set('nome', e.target.value)} />
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">Data da candidatura</label>
                  <input type="date" className={cls} value={form.data_candidatura} onChange={e => set('data_candidatura', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select className={`${cls} bg-white`} value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="em_processo">Em processo</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="recusado">Recusado</option>
                    <option value="desistiu">Desistiu</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Igreja</label>
                  <select className={`${cls} bg-white`} value={form.igreja_id} onChange={e => set('igreja_id', e.target.value)}>
                    <option value="">Nenhuma</option>
                    {igrejas.map(ig => (
                      <option key={ig.id} value={ig.id}>{ig.sigla ?? ig.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tutor</label>
                  <select className={`${cls} bg-white`} value={form.tutor_id} onChange={e => set('tutor_id', e.target.value)}>
                    <option value="">Nenhum</option>
                    {pastores.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
                <textarea
                  rows={3}
                  className={cls}
                  value={form.observacoes}
                  onChange={e => set('observacoes', e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-2.5 rounded-md text-sm font-medium border border-gray-200 text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: '#1B3A6B' }}
                >
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

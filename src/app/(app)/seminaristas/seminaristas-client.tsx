'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Seminarista, Candidato, Igreja } from '@/types/database'

type SemRow = Seminarista & { igreja: { nome: string; sigla: string | null } | null }
type CandRow = Candidato & { tutor: { nome: string } | null; igreja: { nome: string; sigla: string | null } | null }
type IgrejaLite = Pick<Igreja, 'id' | 'nome' | 'sigla'>

const EMPTY = {
  nome: '', email: '', telefone: '', seminario: '', curso_ano: '',
  ano_inicio: '', ano_formacao: '', status: 'cursando', igreja_id: '',
}

function GrupoHeader({ titulo, count }: { titulo: string; count: number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{titulo}</span>
      <span className="text-xs text-gray-400 font-normal">{count}</span>
    </div>
  )
}

function LinhaVazia({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="text-center text-gray-300 italic py-4 text-sm">
        Nenhum registro
      </td>
    </tr>
  )
}

export function SeminaristasClient({
  seminaristas: inicial,
  candidatos,
  igrejas,
}: {
  seminaristas: SemRow[]
  candidatos: CandRow[]
  igrejas: IgrejaLite[]
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
    const { data, error } = await supabase.from('seminaristas').insert({
      nome:         form.nome.trim(),
      email:        form.email.trim() || null,
      telefone:     form.telefone.trim() || null,
      seminario:    form.seminario.trim() || null,
      curso_ano:    form.curso_ano    ? parseInt(form.curso_ano)    : null,
      ano_inicio:   form.ano_inicio   ? parseInt(form.ano_inicio)   : null,
      ano_formacao: form.ano_formacao ? parseInt(form.ano_formacao) : null,
      status:       form.status,
      igreja_id:    form.igreja_id || null,
      ativo: true,
    }).select('*, igreja:igrejas(nome, sigla)').single()
    setSaving(false)
    if (error) { setErro(error.message); return }
    if (data) {
      setLista(prev => [...prev, data as SemRow].sort((a, b) => a.nome.localeCompare(b.nome)))
      setModal(false)
      setForm({ ...EMPTY })
      router.refresh()
    }
  }

  const cls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1'

  const cursando   = lista.filter(s => s.status === 'cursando')
  const licenciado = lista.filter(s => s.status === 'licenciado')
  const aprovado   = lista.filter(s => s.status === 'aprovado')

  const total = candidatos.length + cursando.length + licenciado.length + aprovado.length

  const thCls = 'text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 px-4'

  function THead() {
    return (
      <thead>
        <tr className="border-b border-gray-100">
          <th className={thCls} style={{ paddingLeft: 20 }}>Nome</th>
          <th className={thCls}>Seminário / Tutor</th>
          <th className={thCls}>Igreja</th>
          <th className={thCls}>Início</th>
          <th className={thCls}>Formação</th>
        </tr>
      </thead>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seminaristas</h1>
          <p className="text-gray-500 text-sm mt-1">{total} no total</p>
        </div>
        <button
          onClick={() => { setModal(true); setErro('') }}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}
        >
          + Novo seminarista
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {/* ── CANDIDATOS ── */}
        <GrupoHeader titulo="Candidatos" count={candidatos.length} />
        <table className="table-pssp">
          <THead />
          <tbody>
            {candidatos.length === 0 ? <LinhaVazia cols={5} /> : candidatos.map(c => (
              <tr key={c.id}>
                <td style={{ paddingLeft: 20 }}>
                  <div className="font-medium text-gray-900">{c.nome}</div>
                  {c.email && <div className="text-xs text-gray-400">{c.email}</div>}
                </td>
                <td className="text-gray-500 text-sm">{c.tutor?.nome ?? '—'}</td>
                <td className="text-gray-600 text-sm">
                  {c.igreja ? (c.igreja.sigla ?? c.igreja.nome) : '—'}
                </td>
                <td className="text-gray-400 text-sm">
                  {c.data_candidatura
                    ? new Date(c.data_candidatura).getFullYear()
                    : '—'}
                </td>
                <td className="text-gray-400 text-sm">—</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── CURSANDO ── */}
        <GrupoHeader titulo="Cursando" count={cursando.length} />
        <table className="table-pssp">
          <THead />
          <tbody>
            {cursando.length === 0 ? <LinhaVazia cols={5} /> : cursando.map(s => (
              <tr key={s.id}>
                <td style={{ paddingLeft: 20 }}>
                  <div className="font-medium text-gray-900">{s.nome}</div>
                  {s.email && <div className="text-xs text-gray-400">{s.email}</div>}
                </td>
                <td className="text-gray-600 text-sm">
                  {s.seminario ?? '—'}
                  {s.curso_ano ? <span className="text-gray-400 ml-1">· {s.curso_ano}º ano</span> : null}
                </td>
                <td className="text-gray-600 text-sm">
                  {s.igreja ? (s.igreja.sigla ?? s.igreja.nome) : '—'}
                </td>
                <td className="text-gray-500 text-sm">{s.ano_inicio ?? '—'}</td>
                <td className="text-gray-500 text-sm">{s.ano_formacao ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── LICENCIADOS ── */}
        <GrupoHeader titulo="Licenciados" count={licenciado.length} />
        <table className="table-pssp">
          <THead />
          <tbody>
            {licenciado.length === 0 ? <LinhaVazia cols={5} /> : licenciado.map(s => (
              <tr key={s.id}>
                <td style={{ paddingLeft: 20 }}>
                  <div className="font-medium text-gray-900">{s.nome}</div>
                  {s.email && <div className="text-xs text-gray-400">{s.email}</div>}
                </td>
                <td className="text-gray-600 text-sm">{s.seminario ?? '—'}</td>
                <td className="text-gray-600 text-sm">
                  {s.igreja ? (s.igreja.sigla ?? s.igreja.nome) : '—'}
                </td>
                <td className="text-gray-500 text-sm">{s.ano_inicio ?? '—'}</td>
                <td className="text-gray-500 text-sm">{s.ano_formacao ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── APROVADOS ── */}
        <GrupoHeader titulo="Aprovados / Ordenados" count={aprovado.length} />
        <table className="table-pssp">
          <THead />
          <tbody>
            {aprovado.length === 0 ? <LinhaVazia cols={5} /> : aprovado.map(s => (
              <tr key={s.id}>
                <td style={{ paddingLeft: 20 }}>
                  <div className="font-medium text-gray-900">{s.nome}</div>
                  {s.email && <div className="text-xs text-gray-400">{s.email}</div>}
                </td>
                <td className="text-gray-600 text-sm">{s.seminario ?? '—'}</td>
                <td className="text-gray-600 text-sm">
                  {s.igreja ? (s.igreja.sigla ?? s.igreja.nome) : '—'}
                </td>
                <td className="text-gray-500 text-sm">{s.ano_inicio ?? '—'}</td>
                <td className="text-gray-500 text-sm">{s.ano_formacao ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal novo seminarista */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Novo Seminarista</h2>
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">Seminário</label>
                  <input className={cls} value={form.seminario} onChange={e => set('seminario', e.target.value)} placeholder="SPS, JMC..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ano do curso</label>
                  <input type="number" min={1} max={8} className={cls} value={form.curso_ano} onChange={e => set('curso_ano', e.target.value)} placeholder="1–4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ano de início</label>
                  <input type="number" min={2000} max={2100} className={cls} value={form.ano_inicio} onChange={e => set('ano_inicio', e.target.value)} placeholder="Ex: 2024" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ano de formação</label>
                  <input type="number" min={2000} max={2100} className={cls} value={form.ano_formacao} onChange={e => set('ano_formacao', e.target.value)} placeholder="Ex: 2027" />
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
                    {igrejas.map(ig => (
                      <option key={ig.id} value={ig.id}>{ig.sigla ?? ig.nome}</option>
                    ))}
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

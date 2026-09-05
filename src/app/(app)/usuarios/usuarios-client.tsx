'use client'
import { useState, useTransition } from 'react'
import type { Perfil, Igreja, Papel } from '@/types/database'
import { criarUsuario, atualizarPapel, atualizarIgreja, toggleAtivo } from './actions'

type IgrejaLite = Pick<Igreja, 'id' | 'nome' | 'sigla'>

const PAPEIS: { value: Papel; label: string; desc: string }[] = [
  { value: 'admin', label: 'Administrador', desc: 'Acesso total ao sistema' },
  { value: 'moderador', label: 'Presidente (Moderador)', desc: 'Aprova ou rejeita propostas' },
  { value: 'secretario', label: '1º / 2º Secretário', desc: 'Prepara documentos e ata' },
  { value: 'secretario_executivo', label: 'Secretário Executivo', desc: 'Recebe e encaminha documentos' },
  { value: 'pastor', label: 'Pastor', desc: 'Envia documentos e relatórios' },
  { value: 'presbitero', label: 'Presbítero', desc: 'Envia documentos e relatórios' },
]

const BADGE: Record<Papel, string> = {
  admin: 'bg-red-100 text-red-700',
  moderador: 'bg-purple-100 text-purple-700',
  secretario: 'bg-blue-100 text-blue-700',
  secretario_executivo: 'bg-indigo-100 text-indigo-700',
  pastor: 'bg-green-100 text-green-700',
  presbitero: 'bg-teal-100 text-teal-700',
}

const LABEL: Record<Papel, string> = {
  admin: 'Administrador',
  moderador: 'Presidente',
  secretario: '1º/2º Secretário',
  secretario_executivo: 'Sec. Executivo',
  pastor: 'Pastor',
  presbitero: 'Presbítero',
}

interface EditState {
  userId: string
  papel: Papel
  igreja_id: string | null
}

export function UsuariosClient({ usuarios: inicial, igrejas }: { usuarios: Perfil[]; igrejas: IgrejaLite[] }) {
  const [usuarios, setUsuarios] = useState(inicial)
  const [modalCriar, setModalCriar] = useState(false)
  const [editando, setEditando] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [isPending, startTransition] = useTransition()

  const cls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400'

  // ── Criar usuário ───────────────────────────────────────────────
  async function handleCriar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setErro('')
    const fd = new FormData(e.currentTarget)
    const res = await criarUsuario(fd)
    setSaving(false)
    if (res.error) { setErro(res.error); return }
    setModalCriar(false)
    startTransition(() => { window.location.reload() })
  }

  // ── Salvar edição ────────────────────────────────────────────────
  async function handleSalvarEdicao() {
    if (!editando) return
    setSaving(true)
    setErro('')
    const [r1, r2] = await Promise.all([
      atualizarPapel(editando.userId, editando.papel),
      atualizarIgreja(editando.userId, editando.igreja_id),
    ])
    setSaving(false)
    if (r1.error || r2.error) { setErro(r1.error ?? r2.error ?? ''); return }
    setUsuarios(prev => prev.map(u =>
      u.id === editando.userId ? { ...u, papel: editando.papel, igreja_id: editando.igreja_id } : u
    ))
    setEditando(null)
  }

  // ── Toggle ativo ─────────────────────────────────────────────────
  async function handleToggleAtivo(u: Perfil) {
    await toggleAtivo(u.id, !u.ativo)
    setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, ativo: !u.ativo } : x))
  }

  const ativos = usuarios.filter(u => u.ativo).length
  const igrejaMap = Object.fromEntries(igrejas.map(ig => [ig.id, ig.sigla ?? ig.nome]))
  const usuarioEditando = editando ? usuarios.find(u => u.id === editando.userId) : null

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários e Permissões</h1>
          <p className="text-gray-500 text-sm mt-1">{ativos} usuário(s) ativo(s) · {usuarios.length} total</p>
        </div>
        <button onClick={() => { setModalCriar(true); setErro('') }}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}>
          + Novo usuário
        </button>
      </div>

      {/* Cartões de papéis */}
      <div className="grid grid-cols-6 gap-3 mb-8">
        {PAPEIS.map(p => {
          const count = usuarios.filter(u => u.papel === p.value && u.ativo).length
          return (
            <div key={p.value} className="card py-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-tight">{p.label}</div>
            </div>
          )
        })}
      </div>

      {/* Tabela */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Papel</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Igreja</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Nenhum usuário cadastrado</td></tr>
            ) : usuarios.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: '#1B3A6B' }}>
                      {u.nome ? u.nome.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="font-medium text-gray-900">{u.nome || '(sem nome)'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[u.papel] ?? 'bg-gray-100 text-gray-600'}`}>
                    {LABEL[u.papel] ?? u.papel}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.igreja_id ? igrejaMap[u.igreja_id] ?? '—' : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="relative group">
                    <button className="text-gray-400 hover:text-gray-600 px-1 rounded">⋯</button>
                    <div className="absolute right-0 top-7 z-20 w-44 bg-white border border-gray-100 rounded-lg shadow-lg py-1 hidden group-hover:block">
                      <button
                        onClick={() => setEditando({ userId: u.id, papel: u.papel, igreja_id: u.igreja_id })}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Editar acesso
                      </button>
                      <button
                        onClick={() => handleToggleAtivo(u)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        {u.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Criar usuário */}
      {modalCriar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Novo Usuário</h2>
              <button onClick={() => setModalCriar(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <form onSubmit={handleCriar} className="p-6 space-y-4">
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{erro}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome completo *</label>
                <input required name="nome" className={cls} placeholder="Pr. João Silva" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">E-mail *</label>
                <input required name="email" type="email" className={cls} placeholder="joao@igreja.org" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Senha provisória *</label>
                <input required name="senha" type="text" className={cls} placeholder="Mínimo 6 caracteres" minLength={6} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Papel / Acesso *</label>
                <select required name="papel" className={`${cls} bg-white`} defaultValue="">
                  <option value="" disabled>Selecione...</option>
                  {PAPEIS.map(p => (
                    <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Igreja</label>
                <select name="igreja_id" className={`${cls} bg-white`} defaultValue="">
                  <option value="">Nenhuma (presbitério)</option>
                  {igrejas.map(ig => (
                    <option key={ig.id} value={ig.id}>{ig.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalCriar(false)}
                  className="flex-1 py-2.5 rounded-md text-sm font-medium border border-gray-200 text-gray-600">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: '#1B3A6B' }}>
                  {saving ? 'Criando...' : 'Criar usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar acesso */}
      {editando && usuarioEditando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Editar Acesso</h2>
                <p className="text-xs text-gray-400 mt-0.5">{usuarioEditando.nome || usuarioEditando.email}</p>
              </div>
              <button onClick={() => setEditando(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{erro}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Papel / Nível de acesso</label>
                <div className="space-y-2">
                  {PAPEIS.map(p => (
                    <label key={p.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${editando.papel === p.value ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="papel_edit" value={p.value}
                        checked={editando.papel === p.value}
                        onChange={() => setEditando(prev => prev ? { ...prev, papel: p.value } : null)}
                        className="mt-0.5 accent-blue-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{p.label}</div>
                        <div className="text-xs text-gray-400">{p.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Igreja</label>
                <select
                  className={`${cls} bg-white`}
                  value={editando.igreja_id ?? ''}
                  onChange={e => setEditando(prev => prev ? { ...prev, igreja_id: e.target.value || null } : null)}>
                  <option value="">Nenhuma (presbitério)</option>
                  {igrejas.map(ig => (
                    <option key={ig.id} value={ig.id}>{ig.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditando(null)}
                  className="flex-1 py-2.5 rounded-md text-sm font-medium border border-gray-200 text-gray-600">
                  Cancelar
                </button>
                <button onClick={handleSalvarEdicao} disabled={saving}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: '#1B3A6B' }}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

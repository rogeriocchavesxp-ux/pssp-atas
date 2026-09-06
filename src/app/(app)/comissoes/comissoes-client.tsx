'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Comissao, Oficial } from '@/types/database'

type OficialLite = Pick<Oficial, 'id' | 'nome' | 'tipo'>

type Membro = { id: string; funcao: string; oficial: { id: string; nome: string; tipo: string } | null }
type ComissaoLocal = Omit<Comissao, 'membros'> & { membros?: Membro[] }

const FUNCAO_MAP: Record<string, string> = {
  relator: 'Relator', membro: 'Membro',
}

export function ComissoesClient({
  comissoes: inicial,
  oficiais,
}: {
  comissoes: Comissao[]
  oficiais: OficialLite[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [comissoes, setComissoes] = useState<ComissaoLocal[]>(inicial as unknown as ComissaoLocal[])
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({ numero: '', nome: '', tipo: 'permanente' })

  // Gerenciamento de membros
  const [gerenciando, setGerenciando] = useState<ComissaoLocal | null>(null)
  const [addMembro, setAddMembro] = useState({ oficial_id: '', funcao: 'relator' })
  const [savingMembro, setSavingMembro] = useState(false)
  const [erroMembro, setErroMembro] = useState('')

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  // ── Criar comissão ────────────────────────────────────────────
  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErro('')
    const { data, error } = await supabase.from('comissoes').insert({
      numero: parseInt(form.numero),
      nome: form.nome.trim() || null,
      tipo: form.tipo,
      ativa: true,
    }).select('*, membros:comissao_membros(id, funcao, oficial:oficiais(id, nome, tipo))').single()
    setSaving(false)
    if (error) { setErro(error.message); return }
    if (data) {
      const nova = data as unknown as ComissaoLocal
      setComissoes(prev => [...prev, nova].sort((a, b) => a.numero - b.numero))
      setModal(false)
      setForm({ numero: '', nome: '', tipo: 'permanente' })
      setGerenciando(nova)
      router.refresh()
    }
  }

  // ── Adicionar membro ──────────────────────────────────────────
  async function adicionarMembro(e: React.FormEvent) {
    e.preventDefault()
    if (!gerenciando || !addMembro.oficial_id) return
    setSavingMembro(true)
    setErroMembro('')
    const { data, error } = await supabase.from('comissao_membros').insert({
      comissao_id: gerenciando.id,
      oficial_id: addMembro.oficial_id,
      funcao: addMembro.funcao,
    }).select('id, funcao, oficial:oficiais(id, nome, tipo)').single()
    setSavingMembro(false)
    if (error) { setErroMembro(error.message); return }
    if (data) {
      const novoMembro = data as unknown as Membro
      setComissoes(prev => prev.map(c => c.id === gerenciando.id
        ? { ...c, membros: [...(c.membros ?? []), novoMembro] }
        : c
      ))
      setGerenciando(prev => prev ? { ...prev, membros: [...(prev.membros ?? []), novoMembro] } : prev)
      setAddMembro({ oficial_id: '', funcao: 'membro' })
    }
  }

  // ── Remover membro ────────────────────────────────────────────
  async function removerMembro(membroId: string) {
    if (!gerenciando) return
    await supabase.from('comissao_membros').delete().eq('id', membroId)
    setComissoes(prev => prev.map(c => c.id === gerenciando.id
      ? { ...c, membros: (c.membros ?? []).filter(m => m.id !== membroId) }
      : c
    ))
    setGerenciando(prev => prev
      ? { ...prev, membros: (prev.membros ?? []).filter(m => m.id !== membroId) }
      : prev
    )
  }

  const cls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1'

  // Oficiais ainda não membros da comissão gerenciada
  const membrosIds = (gerenciando?.membros ?? []).map(m => m.oficial?.id).filter(Boolean)
  const oficiaisDisponiveis = oficiais.filter(o => !membrosIds.includes(o.id))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comissões</h1>
          <p className="text-gray-500 text-sm mt-1">{comissoes.length} comissões</p>
        </div>
        <button onClick={() => { setModal(true); setErro('') }}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}>
          + Nova comissão
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {comissoes.length === 0 ? (
          <div className="col-span-3 card text-center text-gray-400 py-12">Nenhuma comissão cadastrada</div>
        ) : comissoes.map(c => {
          const membros = c.membros ?? []
          const presidente = membros.find(m => m.funcao === 'presidente')
          return (
            <div key={c.id} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: '#B8962E' }}>
                  {c.numero}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">Comissão {c.numero}</div>
                  {c.nome && <div className="text-xs text-gray-400 truncate">{c.nome}</div>}
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                {membros.length} membro(s)
                {presidente?.oficial && ` · Pres: ${presidente.oficial.nome.split(' ')[0]}`}
              </div>
              <div className="space-y-1 mb-4">
                {membros.slice(0, 3).map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                    {m.oficial?.nome ?? '—'}
                    {m.funcao !== 'membro' && <span className="text-gray-400">({FUNCAO_MAP[m.funcao] ?? m.funcao})</span>}
                  </div>
                ))}
                {membros.length > 3 && <div className="text-xs text-gray-400">+{membros.length - 3} mais</div>}
              </div>
              <button
                onClick={() => { setGerenciando(c); setErroMembro(''); setAddMembro({ oficial_id: '', funcao: 'membro' }) }}
                className="w-full text-xs py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                Gerenciar membros
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal: Nova Comissão */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Nova Comissão</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4">
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{erro}</p>}
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
                  {saving ? 'Salvando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Gerenciar Membros */}
      {gerenciando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Membros — Comissão {gerenciando.numero}</h2>
                {gerenciando.nome && <p className="text-xs text-gray-400 mt-0.5">{gerenciando.nome}</p>}
              </div>
              <button onClick={() => setGerenciando(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="p-6 space-y-5">
              {/* Lista de membros */}
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Membros atuais</div>
                {(gerenciando.membros ?? []).length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">Nenhum membro adicionado</p>
                ) : (
                  <div className="space-y-1">
                    {(gerenciando.membros ?? []).map(m => (
                      <div key={m.id} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-gray-50">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{m.oficial?.nome ?? '—'}</span>
                          <span className="ml-2 text-xs text-gray-400">{FUNCAO_MAP[m.funcao] ?? m.funcao}</span>
                        </div>
                        <button
                          onClick={() => removerMembro(m.id)}
                          className="text-red-400 hover:text-red-600 text-xs ml-3">
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Adicionar membro */}
              {oficiaisDisponiveis.length > 0 && (
                <form onSubmit={adicionarMembro} className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adicionar membro</div>
                  {erroMembro && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{erroMembro}</p>}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Oficial</label>
                      <select required className={`${cls} bg-white`}
                        value={addMembro.oficial_id}
                        onChange={e => setAddMembro(p => ({ ...p, oficial_id: e.target.value }))}>
                        <option value="">Selecione...</option>
                        {oficiaisDisponiveis.map(o => (
                          <option key={o.id} value={o.id}>{o.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Função</label>
                      <select className={`${cls} bg-white`}
                        value={addMembro.funcao}
                        onChange={e => setAddMembro(p => ({ ...p, funcao: e.target.value }))}>
                        <option value="relator">Relator</option>
                        <option value="membro">Membro</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={savingMembro}
                    className="w-full py-2 rounded-md text-sm font-semibold text-white disabled:opacity-60"
                    style={{ background: '#1B3A6B' }}>
                    {savingMembro ? 'Adicionando...' : 'Adicionar membro'}
                  </button>
                </form>
              )}
              {oficiaisDisponiveis.length === 0 && (
                <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
                  Todos os oficiais já são membros desta comissão.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Comissao, Oficial } from '@/types/database'
import type { DocComissao } from './page'

type OficialLite = Pick<Oficial, 'id' | 'nome' | 'tipo'>

type Membro = {
  id: string
  funcao: string
  oficial: { id: string; nome: string; tipo: string; email: string | null } | null
}
type ComissaoLocal = Omit<Comissao, 'membros'> & { membros?: Membro[] }

const FUNCAO_MAP: Record<string, string> = { relator: 'Relator', membro: 'Membro' }

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let r = ''
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i] }
  }
  return r
}

const STATUS_DOC: Record<string, { label: string; cls: string }> = {
  recebido:  { label: 'Recebido',   cls: 'badge-gray' },
  em_pauta:  { label: 'Em pauta',   cls: 'badge-blue' },
  aprovado:  { label: 'Aprovado',   cls: 'badge-green' },
  rejeitado: { label: 'Rejeitado',  cls: 'badge-red' },
  arquivado: { label: 'Arquivado',  cls: 'badge-gray' },
  retirado:  { label: 'Retirado',   cls: 'badge-gray' },
}

type ModalTab = 'membros' | 'documentos'

export function ComissoesClient({
  comissoes: inicial,
  oficiais,
  documentos,
  userEmail,
  userPapel,
}: {
  comissoes: Comissao[]
  oficiais: OficialLite[]
  documentos: DocComissao[]
  userEmail: string | null
  userPapel: string | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const [comissoes, setComissoes] = useState<ComissaoLocal[]>(inicial as unknown as ComissaoLocal[])
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({ numero: '', nome: '', tipo: 'permanente' })

  // modal de gerenciamento
  const [gerenciando, setGerenciando] = useState<ComissaoLocal | null>(null)
  const [modalTab, setModalTab] = useState<ModalTab>('membros')
  const [addMembro, setAddMembro] = useState({ oficial_id: '', funcao: 'membro' })
  const [savingMembro, setSavingMembro] = useState(false)
  const [erroMembro, setErroMembro] = useState('')

  // edição de parecer
  const [editandoDoc, setEditandoDoc] = useState<{ id: string; conteudo: string } | null>(null)
  const [savingDoc, setSavingDoc] = useState(false)

  // modal de proposta (split-screen)
  const [propostaDoc, setPropostaDoc] = useState<DocComissao | null>(null)
  const [propostaPdfUrl, setPropostaPdfUrl] = useState<string | null>(null)
  const [propostaTexto, setPropostaTexto] = useState('')
  const [savingProposta, setSavingProposta] = useState(false)

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  // ── Criar comissão ────────────────────────────────────────────
  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErro('')
    const { data, error } = await supabase
      .from('comissoes')
      .insert({ numero: parseInt(form.numero), nome: form.nome.trim() || null, tipo: form.tipo, ativa: true })
      .select('*, membros:comissao_membros(id, funcao, oficial:oficiais(id, nome, tipo, email))')
      .single()
    setSaving(false)
    if (error) { setErro(error.message); return }
    if (data) {
      const nova = data as unknown as ComissaoLocal
      setComissoes(prev => [...prev, nova].sort((a, b) => a.numero - b.numero))
      setModal(false)
      setForm({ numero: '', nome: '', tipo: 'permanente' })
      setGerenciando(nova)
      setModalTab('membros')
      router.refresh()
    }
  }

  // ── Adicionar membro ──────────────────────────────────────────
  async function adicionarMembro(e: React.FormEvent) {
    e.preventDefault()
    if (!gerenciando || !addMembro.oficial_id) return
    setSavingMembro(true)
    setErroMembro('')
    const { data, error } = await supabase
      .from('comissao_membros')
      .insert({ comissao_id: gerenciando.id, oficial_id: addMembro.oficial_id, funcao: addMembro.funcao })
      .select('id, funcao, oficial:oficiais(id, nome, tipo, email)')
      .single()
    setSavingMembro(false)
    if (error) { setErroMembro(error.message); return }
    if (data) {
      const novoMembro = data as unknown as Membro
      setComissoes(prev => prev.map(c => c.id === gerenciando.id
        ? { ...c, membros: [...(c.membros ?? []), novoMembro] }
        : c
      ))
      setGerenciando(prev => prev
        ? { ...prev, membros: [...(prev.membros ?? []), novoMembro] }
        : prev
      )
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

  // ── Salvar parecer do documento ───────────────────────────────
  async function salvarDoc() {
    if (!editandoDoc) return
    setSavingDoc(true)
    await supabase.from('documentos').update({ conteudo: editandoDoc.conteudo }).eq('id', editandoDoc.id)
    setSavingDoc(false)
    setEditandoDoc(null)
    router.refresh()
  }

  // ── Abrir modal de proposta ───────────────────────────────────
  async function abrirProposta(doc: DocComissao) {
    setPropostaDoc(doc)
    setPropostaPdfUrl(null)
    setPropostaTexto(doc.proposta ?? 'O PSSP RESOLVE:')
    if (doc.pdf_url) {
      const { data } = await supabase.storage
        .from('documentos')
        .createSignedUrl(doc.pdf_url, 600)
      setPropostaPdfUrl(data?.signedUrl ?? null)
    }
  }

  // ── Salvar proposta ───────────────────────────────────────────
  async function salvarProposta() {
    if (!propostaDoc) return
    setSavingProposta(true)
    await supabase
      .from('documentos')
      .update({ proposta: propostaTexto })
      .eq('id', propostaDoc.id)
    setSavingProposta(false)
    setPropostaDoc(null)
    router.refresh()
  }

  const cls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1'

  const membrosIds = (gerenciando?.membros ?? []).map(m => m.oficial?.id).filter(Boolean)
  const oficiaisDisponiveis = oficiais.filter(o => !membrosIds.includes(o.id))

  // documentos da comissão gerenciada
  const docsComissao = documentos.filter(d => d.comissao_id === gerenciando?.id)

  // permissão de edição
  const isAdmin = ['admin', 'secretario'].includes(userPapel ?? '')
  const isRelatorDaComissao = gerenciando?.membros?.some(
    m => m.funcao === 'relator' && m.oficial?.email === userEmail
  ) ?? false
  const podeEditarDoc = isAdmin || isRelatorDaComissao

  function abrirComissao(c: ComissaoLocal) {
    setGerenciando(c)
    setModalTab('membros')
    setErroMembro('')
    setAddMembro({ oficial_id: '', funcao: 'membro' })
    setEditandoDoc(null)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comissões</h1>
          <p className="text-gray-500 text-sm mt-1">{comissoes.length} comissões</p>
        </div>
        <button
          onClick={() => { setModal(true); setErro('') }}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}
        >
          + Nova comissão
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {comissoes.length === 0 ? (
          <div className="col-span-3 card text-center text-gray-400 py-12">Nenhuma comissão cadastrada</div>
        ) : comissoes.map(c => {
          const membros = c.membros ?? []
          const relator = membros.find(m => m.funcao === 'relator')
          const docsCount = documentos.filter(d => d.comissao_id === c.id).length
          return (
            <div key={c.id} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg text-white text-xs font-bold flex items-center justify-center flex-shrink-0 font-serif"
                  style={{ background: '#B8962E' }}
                >
                  {toRoman(c.numero)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{c.nome ?? `Comissão ${toRoman(c.numero)}`}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {membros.length} membro(s)
                {docsCount > 0 && ` · ${docsCount} doc(s)`}
                {relator?.oficial && ` · Relator: ${relator.oficial.nome.split(' ')[0]}`}
              </div>
              <div className="space-y-1 mb-4">
                {membros.slice(0, 3).map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                    {m.oficial?.nome ?? '—'}
                    {m.funcao !== 'membro' && (
                      <span className="text-gray-400">({FUNCAO_MAP[m.funcao] ?? m.funcao})</span>
                    )}
                  </div>
                ))}
                {membros.length > 3 && <div className="text-xs text-gray-400">+{membros.length - 3} mais</div>}
              </div>
              <button
                onClick={() => abrirComissao(c)}
                className="w-full text-xs py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Ver detalhes
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

      {/* Modal: Proposta (split-screen) */}
      {propostaDoc && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white">
          {/* Barra superior */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-gray-400">
                Doc. {String(propostaDoc.numero).padStart(3, '0')}
              </span>
              <span className="text-sm font-semibold text-gray-900 truncate max-w-md">
                {propostaDoc.assunto}
              </span>
              {propostaDoc.reuniao && (
                <span className="text-xs text-gray-400">
                  · {propostaDoc.reuniao.numero}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPropostaDoc(null)}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md border border-gray-200"
              >
                Fechar
              </button>
              <button
                onClick={salvarProposta}
                disabled={savingProposta}
                className="text-sm font-semibold text-white px-4 py-1.5 rounded-md disabled:opacity-60"
                style={{ background: '#1B3A6B' }}
              >
                {savingProposta ? 'Salvando...' : 'Salvar proposta'}
              </button>
            </div>
          </div>

          {/* Painéis lado a lado */}
          <div className="flex flex-1 overflow-hidden">
            {/* Esquerdo: documento */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden">
              <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Documento</span>
                {propostaDoc.oriundo && (
                  <span className="text-xs text-gray-400 ml-2">· {propostaDoc.oriundo}</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                {propostaPdfUrl ? (
                  <iframe
                    src={propostaPdfUrl}
                    className="w-full h-full border-0"
                    title="Documento"
                  />
                ) : propostaDoc.pdf_url && !propostaPdfUrl ? (
                  <div className="p-6 text-sm text-gray-400 italic text-center mt-12">
                    Carregando PDF...
                  </div>
                ) : propostaDoc.conteudo ? (
                  <div className="p-6 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-serif">
                    {propostaDoc.conteudo}
                  </div>
                ) : (
                  <div className="p-6 text-sm text-gray-400 italic text-center mt-12">
                    Nenhum conteúdo disponível para este documento.
                  </div>
                )}
              </div>
            </div>

            {/* Direito: proposta */}
            <div className="w-1/2 flex flex-col overflow-hidden">
              <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Proposta</span>
                <span className="text-xs text-gray-400">Comissão {gerenciando ? toRoman(gerenciando.numero) : ''}</span>
              </div>
              <div className="flex-1 p-5 flex flex-col">
                <textarea
                  className="flex-1 w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
                  style={{ fontFamily: 'Georgia, serif' }}
                  value={propostaTexto}
                  onChange={e => setPropostaTexto(e.target.value)}
                  placeholder="O PSSP RESOLVE:"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhes da Comissão */}
      {gerenciando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
            {/* Cabeçalho */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-semibold text-gray-900">Comissão {toRoman(gerenciando.numero)}{gerenciando.nome ? ` — ${gerenciando.nome}` : ''}</h2>
                {gerenciando.nome && <p className="text-xs text-gray-400 mt-0.5">{gerenciando.nome}</p>}
              </div>
              <button onClick={() => { setGerenciando(null); setEditandoDoc(null) }} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 flex-shrink-0">
              <button
                onClick={() => setModalTab('membros')}
                className={`px-5 py-3 text-xs font-medium border-b-2 transition-colors ${
                  modalTab === 'membros' ? 'text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
                style={modalTab === 'membros' ? { borderBottomColor: '#1B3A6B' } : {}}
              >
                Membros ({(gerenciando.membros ?? []).length})
              </button>
              <button
                onClick={() => setModalTab('documentos')}
                className={`px-5 py-3 text-xs font-medium border-b-2 transition-colors ${
                  modalTab === 'documentos' ? 'text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
                style={modalTab === 'documentos' ? { borderBottomColor: '#1B3A6B' } : {}}
              >
                Documentos {docsComissao.length > 0 && `(${docsComissao.length})`}
              </button>
            </div>

            {/* Conteúdo com scroll */}
            <div className="overflow-y-auto flex-1">

              {/* ── Tab: Membros ── */}
              {modalTab === 'membros' && (
                <div className="p-6 space-y-5">
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
                            {isAdmin && (
                              <button
                                onClick={() => removerMembro(m.id)}
                                className="text-red-400 hover:text-red-600 text-xs ml-3"
                              >
                                Remover
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isAdmin && oficiaisDisponiveis.length > 0 && (
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
                  {isAdmin && oficiaisDisponiveis.length === 0 && (
                    <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
                      Todos os oficiais já são membros desta comissão.
                    </p>
                  )}
                </div>
              )}

              {/* ── Tab: Documentos ── */}
              {modalTab === 'documentos' && (
                <div className="p-6">
                  {docsComissao.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">Nenhum documento direcionado a esta comissão</p>
                  ) : (
                    <div className="space-y-4">
                      {docsComissao.map(doc => {
                        const st = STATUS_DOC[doc.status] ?? { label: doc.status, cls: 'badge-gray' }
                        const editando = editandoDoc?.id === doc.id
                        return (
                          <div key={doc.id} className="border border-gray-100 rounded-lg p-4">
                            {/* Cabeçalho do doc */}
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <span className="font-mono text-xs font-semibold text-gray-400 mt-0.5 flex-shrink-0">
                                  {String(doc.numero).padStart(3, '0')}
                                </span>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900 leading-snug">{doc.assunto}</div>
                                  {doc.oriundo && <div className="text-xs text-gray-400 mt-0.5">{doc.oriundo}</div>}
                                  {doc.reuniao && (
                                    <div className="text-xs text-gray-400 mt-0.5">
                                      Reunião {doc.reuniao.numero} · {new Date(doc.reuniao.data_inicio).toLocaleDateString('pt-BR')}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`badge ${st.cls}`}>{st.label}</span>
                                {podeEditarDoc && !editando && (
                                  <>
                                    <button
                                      onClick={() => setEditandoDoc({ id: doc.id, conteudo: doc.conteudo ?? '' })}
                                      className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                      Parecer
                                    </button>
                                    <button
                                      onClick={() => abrirProposta(doc)}
                                      className="text-xs px-2 py-1 rounded text-white font-semibold transition-colors"
                                      style={{ background: '#1B3A6B' }}
                                    >
                                      {doc.proposta ? 'Ver proposta' : 'Lançar proposta'}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Parecer atual (não editando) */}
                            {!editando && doc.conteudo && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {doc.conteudo}
                              </div>
                            )}

                            {/* Editor inline */}
                            {editando && editandoDoc && (
                              <div className="mt-2 space-y-2">
                                <label className="block text-xs font-medium text-gray-500">Parecer da comissão</label>
                                <textarea
                                  rows={6}
                                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 resize-none"
                                  value={editandoDoc.conteudo}
                                  onChange={e => setEditandoDoc({ ...editandoDoc, conteudo: e.target.value })}
                                  placeholder="Redija o parecer ou análise da comissão sobre este documento..."
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => setEditandoDoc(null)}
                                    className="px-3 py-1.5 text-xs rounded-md border border-gray-200 text-gray-600"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={salvarDoc}
                                    disabled={savingDoc}
                                    className="px-3 py-1.5 text-xs rounded-md text-white font-semibold disabled:opacity-60"
                                    style={{ background: '#1B3A6B' }}
                                  >
                                    {savingDoc ? 'Salvando...' : 'Salvar parecer'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Sem parecer ainda */}
                            {!editando && !doc.conteudo && (
                              <p className="text-xs text-gray-400 mt-2 italic">
                                {podeEditarDoc ? 'Nenhum parecer redigido ainda.' : 'Aguardando parecer do relator.'}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ComissaoExecutiva } from '@/types/database'

const CARGOS: { key: string; label: string }[] = [
  { key: 'presidente',           label: 'Presidente' },
  { key: 'vice_presidente',      label: 'Vice-presidente' },
  { key: 'secretario_executivo', label: 'Secretário Executivo' },
  { key: '1_secretario',         label: '1º Secretário' },
  { key: '2_secretario',         label: '2º Secretário' },
  { key: 'tesoureiro',           label: 'Tesoureiro' },
]

type FormAno = Record<string, string> // cargo -> nome

function composicaoVazia(): FormAno {
  return Object.fromEntries(CARGOS.map(c => [c.key, '']))
}

function composicaoDeRegistros(regs: ComissaoExecutiva[]): FormAno {
  const f = composicaoVazia()
  for (const r of regs) f[r.cargo] = r.nome
  return f
}

function MesaCard({ registros, ano }: { registros: ComissaoExecutiva[]; ano: number }) {
  const map = Object.fromEntries(registros.map(r => [r.cargo, r.nome]))
  return (
    <div className="grid grid-cols-1 gap-0 divide-y divide-gray-100">
      {CARGOS.map(c => (
        <div key={c.key} className="flex items-center justify-between py-2.5 px-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-40 flex-shrink-0">
            {c.label}
          </span>
          <span className="text-sm text-gray-800 text-right">
            {map[c.key] ?? <span className="text-gray-300 italic">—</span>}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ComissaoExecutivaClient({
  porAno: inicial,
  anos: anosIniciais,
  isAdmin,
}: {
  porAno: Record<number, ComissaoExecutiva[]>
  anos: number[]
  isAdmin: boolean
}) {
  const router = useRouter()
  const supabase = createClient()

  const [porAno, setPorAno] = useState(inicial)
  const [anos, setAnos] = useState(anosIniciais)
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set())

  // Modal
  const [modal, setModal] = useState(false)
  const [anoModal, setAnoModal] = useState(String(new Date().getFullYear()))
  const [form, setForm] = useState<FormAno>(composicaoVazia())
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  const anoAtual = anos[0] ?? new Date().getFullYear()
  const anosAnteriores = anos.slice(1)

  function toggleExpandido(ano: number) {
    setExpandidos(prev => {
      const next = new Set(prev)
      next.has(ano) ? next.delete(ano) : next.add(ano)
      return next
    })
  }

  function abrirNovoAno() {
    setAnoModal(String(new Date().getFullYear()))
    setForm(composicaoVazia())
    setErro('')
    setModal(true)
  }

  function abrirEditarAno(ano: number) {
    setAnoModal(String(ano))
    setForm(composicaoDeRegistros(porAno[ano] ?? []))
    setErro('')
    setModal(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    const ano = parseInt(anoModal)
    if (!ano || isNaN(ano)) { setErro('Informe um ano válido.'); return }

    setSaving(true)
    setErro('')

    const upserts = CARGOS
      .filter(c => form[c.key].trim())
      .map(c => ({
        ano,
        cargo: c.key,
        nome: form[c.key].trim(),
      }))

    if (upserts.length === 0) { setErro('Preencha ao menos um cargo.'); setSaving(false); return }

    const { error } = await supabase
      .from('comissao_executiva')
      .upsert(upserts, { onConflict: 'ano,cargo' })

    setSaving(false)
    if (error) { setErro(error.message); return }

    // atualiza estado local
    const novasRegs: ComissaoExecutiva[] = upserts.map(u => ({
      id: crypto.randomUUID(),
      ano: u.ano,
      cargo: u.cargo,
      nome: u.nome,
      oficial_id: null,
      created_at: new Date().toISOString(),
    }))
    setPorAno(prev => ({ ...prev, [ano]: novasRegs }))
    if (!anos.includes(ano)) {
      setAnos(prev => [ano, ...prev].sort((a, b) => b - a))
    }
    setModal(false)
    router.refresh()
  }

  const cls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1'

  return (
    <div className="p-8 max-w-2xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comissão Executiva</h1>
          <p className="text-gray-500 text-sm mt-1">Mesa diretora do Presbitério Leste de São Paulo</p>
        </div>
        {isAdmin && (
          <button
            onClick={abrirNovoAno}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#1B3A6B' }}
          >
            + Registrar ano
          </button>
        )}
      </div>

      {anos.length === 0 ? (
        <div className="card text-center text-gray-400 py-16">
          Nenhuma composição registrada ainda.
        </div>
      ) : (
        <>
          {/* Ano atual */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg text-white text-sm font-bold flex items-center justify-center"
                  style={{ background: '#1B3A6B' }}
                >
                  {anoAtual}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Composição atual</div>
                  <div className="text-xs text-gray-400">{anoAtual}</div>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => abrirEditarAno(anoAtual)}
                  className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Editar
                </button>
              )}
            </div>
            {porAno[anoAtual] ? (
              <MesaCard registros={porAno[anoAtual]} ano={anoAtual} />
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum registro para {anoAtual}.</p>
            )}
          </div>

          {/* Anos anteriores */}
          {anosAnteriores.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Anos anteriores
              </h2>
              <div className="card p-0 overflow-hidden divide-y divide-gray-100">
                {anosAnteriores.map(ano => {
                  const aberto = expandidos.has(ano)
                  return (
                    <div key={ano}>
                      <button
                        onClick={() => toggleExpandido(ano)}
                        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-700">{ano}</span>
                          <span className="text-xs text-gray-400">
                            {(porAno[ano] ?? []).length} cargo(s) registrado(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <span
                              onClick={e => { e.stopPropagation(); abrirEditarAno(ano) }}
                              className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                              Editar
                            </span>
                          )}
                          <span className={`text-gray-400 text-xs transition-transform ${aberto ? 'rotate-180' : ''}`} style={{ display: 'inline-block' }}>
                            ▼
                          </span>
                        </div>
                      </button>
                      {aberto && (
                        <div className="px-5 pb-4 bg-gray-50">
                          <MesaCard registros={porAno[ano] ?? []} ano={ano} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Composição da Mesa</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4 overflow-y-auto flex-1">
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{erro}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Ano *</label>
                <input
                  required
                  type="number"
                  min={2000}
                  max={2100}
                  className={cls}
                  value={anoModal}
                  onChange={e => setAnoModal(e.target.value)}
                />
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Membros</div>
                {CARGOS.map(c => (
                  <div key={c.key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{c.label}</label>
                    <input
                      className={cls}
                      value={form[c.key]}
                      onChange={e => setForm(p => ({ ...p, [c.key]: e.target.value }))}
                      placeholder={`Nome do ${c.label.toLowerCase()}`}
                    />
                  </div>
                ))}
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

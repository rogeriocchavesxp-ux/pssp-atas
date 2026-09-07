'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Igreja } from '@/types/database'

type IgrejaRow = Igreja & { mae: { id: string; nome: string; sigla: string | null } | null }

const TIPO_MAP: Record<string, string> = {
  sede: 'Sede', congregacao: 'Congregação', campo: 'Campo', missao: 'Missão',
}

const TIPO_BADGE: Record<string, string> = {
  sede: 'badge-navy', congregacao: 'badge-blue', campo: 'badge-gray', missao: 'badge-gray',
}

function IgrejaCard({ ig }: { ig: IgrejaRow }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: '#1B3A6B' }}
        >
          {(ig.sigla ?? ig.nome).substring(0, 3)}
        </div>
        <span className={`badge ${ig.ativa ? 'badge-green' : 'badge-gray'} text-xs`}>
          {ig.ativa ? 'Ativa' : 'Inativa'}
        </span>
      </div>
      <div className="font-semibold text-gray-900 mb-1 leading-snug">{ig.nome}</div>
      <div className="text-sm text-gray-400">
        <span className={`badge ${TIPO_BADGE[ig.tipo] ?? 'badge-gray'} mr-1`}>{TIPO_MAP[ig.tipo] ?? ig.tipo}</span>
        {ig.cidade ? ` ${ig.cidade}` : ''}
        {ig.bairro ? `, ${ig.bairro}` : ''}
      </div>
      {ig.mae && (
        <div className="mt-2 text-xs text-gray-400">
          Vinculada a <span className="font-medium text-gray-600">{ig.mae.sigla ?? ig.mae.nome}</span>
        </div>
      )}
    </div>
  )
}

const EMPTY = { nome: '', sigla: '', cidade: '', bairro: '', tipo: 'sede', igreja_mae_id: '' }

export function IgrejasClient({ igrejas: inicial }: { igrejas: IgrejaRow[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [lista, setLista] = useState(inicial)
  const [aba, setAba] = useState<'igrejas' | 'congregacoes'>('igrejas')
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY })

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErro('')
    const { data, error } = await supabase.from('igrejas').insert({
      nome:          form.nome.trim(),
      sigla:         form.sigla.trim() || null,
      cidade:        form.cidade.trim() || null,
      bairro:        form.bairro.trim() || null,
      tipo:          form.tipo,
      igreja_mae_id: form.igreja_mae_id || null,
      ativa: true,
    }).select('*, mae:igrejas!igrejas_igreja_mae_id_fkey(id, nome, sigla)').single()
    setSaving(false)
    if (error) { setErro(error.message); return }
    if (data) {
      setLista(prev => [...prev, data as IgrejaRow].sort((a, b) => a.nome.localeCompare(b.nome)))
      setModal(false)
      setForm({ ...EMPTY })
      router.refresh()
    }
  }

  const cls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1'

  const sedes        = lista.filter(ig => ig.tipo === 'sede')
  const congregacoes = lista.filter(ig => ig.tipo !== 'sede')

  // Agrupa congregações por igreja mãe
  const porMae: Record<string, { mae: IgrejaRow | undefined; filhas: IgrejaRow[] }> = {}
  for (const ig of congregacoes) {
    const maeId = ig.igreja_mae_id ?? '__sem_mae__'
    if (!porMae[maeId]) {
      porMae[maeId] = {
        mae: ig.mae ? lista.find(s => s.id === ig.mae!.id) : undefined,
        filhas: [],
      }
    }
    porMae[maeId].filhas.push(ig)
  }

  const tabCls = (a: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      aba === a ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
    }`

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Igrejas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {sedes.length} igrejas · {congregacoes.length} congregações e missões
          </p>
        </div>
        <button
          onClick={() => { setModal(true); setErro(''); setForm({ ...EMPTY, tipo: aba === 'congregacoes' ? 'congregacao' : 'sede' }) }}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}
        >
          + {aba === 'congregacoes' ? 'Nova congregação' : 'Nova igreja'}
        </button>
      </div>

      {/* Abas */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
        <button className={tabCls('igrejas')}     onClick={() => setAba('igrejas')}>
          Igrejas ({sedes.length})
        </button>
        <button className={tabCls('congregacoes')} onClick={() => setAba('congregacoes')}>
          Congregações ({congregacoes.length})
        </button>
      </div>

      {/* Aba Igrejas */}
      {aba === 'igrejas' && (
        <div className="grid grid-cols-3 gap-4">
          {sedes.length === 0 ? (
            <div className="col-span-3 card text-center text-gray-400 py-12">Nenhuma igreja cadastrada</div>
          ) : sedes.map(ig => <IgrejaCard key={ig.id} ig={ig} />)}
        </div>
      )}

      {/* Aba Congregações */}
      {aba === 'congregacoes' && (
        <div className="space-y-8">
          {congregacoes.length === 0 ? (
            <div className="card text-center text-gray-400 py-12">Nenhuma congregação cadastrada</div>
          ) : Object.entries(porMae).map(([maeId, grupo]) => (
            <div key={maeId}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  {grupo.mae
                    ? (grupo.mae.sigla ?? grupo.mae.nome)
                    : maeId === '__sem_mae__' ? 'Sem vínculo' : 'Igreja mãe'}
                </span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {grupo.filhas.map(ig => <IgrejaCard key={ig.id} ig={ig} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {form.tipo === 'sede' ? 'Nova Igreja' : 'Nova Congregação'}
              </h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4">
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{erro}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome *</label>
                <input required className={cls} value={form.nome} onChange={e => set('nome', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sigla</label>
                  <input className={cls} value={form.sigla} onChange={e => set('sigla', e.target.value)} />
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
              {form.tipo !== 'sede' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Igreja mãe</label>
                  <select className={`${cls} bg-white`} value={form.igreja_mae_id} onChange={e => set('igreja_mae_id', e.target.value)}>
                    <option value="">Nenhuma</option>
                    {sedes.map(s => (
                      <option key={s.id} value={s.id}>{s.sigla ?? s.nome}</option>
                    ))}
                  </select>
                </div>
              )}
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

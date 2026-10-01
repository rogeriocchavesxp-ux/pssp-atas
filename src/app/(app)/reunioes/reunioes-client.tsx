'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Reuniao, TipoReuniao, StatusReuniao } from '@/types/database'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  convocada:       { label: 'Convocada',       cls: 'badge-blue' },
  em_andamento:    { label: 'Em andamento',    cls: 'badge-green' },
  encerrada:       { label: 'Encerrada',        cls: 'badge-gray' },
  ata_em_producao: { label: 'Ata em produção', cls: 'badge-yellow' },
  ata_aprovada:    { label: 'Ata aprovada',    cls: 'badge-navy' },
  publicada:       { label: 'Publicada',        cls: 'badge-green' },
}

const TIPO_MAP: Record<string, string> = {
  ordinaria: 'Ordinária', extraordinaria: 'Extraordinária',
  solene: 'Solene', administrativa: 'Administrativa',
}

// ─── Dropdown 3 pontos ──────────────────────────────────────────────────────

function MenuAcoes({ reuniao, onEdit, onDelete, onDuplicate }: {
  reuniao: Reuniao
  onEdit: (r: Reuniao) => void
  onDelete: (id: string) => void
  onDuplicate: (r: Reuniao) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        title="Ações"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="8" cy="2.5" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13.5" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-7 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); router.push(`/reunioes/${reuniao.id}`) }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Abrir
          </button>
          <button
            onClick={() => { setOpen(false); onEdit(reuniao) }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Editar
          </button>
          <button
            onClick={() => { setOpen(false); onDuplicate(reuniao) }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Duplicar
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => { setOpen(false); onDelete(reuniao.id) }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Excluir
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Modal de edição ─────────────────────────────────────────────────────────

function EditModal({ reuniao, onClose, onSaved }: {
  reuniao: Reuniao
  onClose: () => void
  onSaved: (updated: Reuniao) => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    numero: reuniao.numero,
    tipo: reuniao.tipo as TipoReuniao,
    status: reuniao.status as StatusReuniao,
    data_inicio: reuniao.data_inicio.slice(0, 10),
    data_fim: reuniao.data_fim?.slice(0, 10) ?? '',
    local: reuniao.local ?? '',
    cidade: reuniao.cidade ?? '',
  })

  async function handleSave() {
    setSaving(true)
    const { data, error } = await supabase
      .from('reunioes')
      .update({
        numero: form.numero.trim(),
        tipo: form.tipo,
        status: form.status,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim || null,
        local: form.local.trim() || null,
        cidade: form.cidade.trim() || null,
      })
      .eq('id', reuniao.id)
      .select('*')
      .single()
    setSaving(false)
    if (error) { alert('Erro ao salvar: ' + error.message); return }
    onSaved(data as Reuniao)
    onClose()
  }

  function field(key: keyof typeof form, label: string, type = 'text', options?: string[][]) {
    if (options) {
      return (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
          <select
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {options.map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
          </select>
        </div>
      )
    }
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Editar reunião</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {field('numero', 'Nome / Número')}
          <div className="grid grid-cols-2 gap-4">
            {field('tipo', 'Tipo', 'text', [
              ['ordinaria', 'Ordinária'],
              ['extraordinaria', 'Extraordinária'],
              ['solene', 'Solene'],
              ['administrativa', 'Administrativa'],
            ])}
            {field('status', 'Status', 'text', [
              ['convocada', 'Convocada'],
              ['em_andamento', 'Em andamento'],
              ['encerrada', 'Encerrada'],
              ['ata_em_producao', 'Ata em produção'],
              ['ata_aprovada', 'Ata aprovada'],
              ['publicada', 'Publicada'],
            ])}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('data_inicio', 'Data início', 'date')}
            {field('data_fim', 'Data fim (opcional)', 'date')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('local', 'Local')}
            {field('cidade', 'Cidade')}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.numero.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ background: '#1B3A6B' }}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ReunioesClient({ initialData }: { initialData: Reuniao[] }) {
  const [reunioes, setReunioes] = useState(initialData)
  const [editando, setEditando] = useState<Reuniao | null>(null)
  const supabase = createClient()

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta reunião? Esta ação não pode ser desfeita.')) return
    const { error } = await supabase.from('reunioes').delete().eq('id', id)
    if (error) { alert('Erro ao excluir: ' + error.message); return }
    setReunioes(r => r.filter(x => x.id !== id))
  }

  async function handleDuplicate(r: Reuniao) {
    const { data, error } = await supabase
      .from('reunioes')
      .insert({
        numero: r.numero + ' (cópia)',
        tipo: r.tipo,
        data_inicio: r.data_inicio,
        data_fim: r.data_fim,
        local: r.local,
        cidade: r.cidade,
        status: 'convocada' as StatusReuniao,
      })
      .select('*')
      .single()
    if (error) { alert('Erro ao duplicar: ' + error.message); return }
    setReunioes(prev => [data as Reuniao, ...prev])
  }

  function handleSaved(updated: Reuniao) {
    setReunioes(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  return (
    <>
      <table className="table-pssp">
        <thead>
          <tr>
            <th style={{ paddingLeft: 20 }}>Número / Tipo</th>
            <th>Data</th>
            <th>Local</th>
            <th>Documentos</th>
            <th>Status</th>
            <th style={{ paddingRight: 20, width: 48 }}></th>
          </tr>
        </thead>
        <tbody>
          {reunioes.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-gray-400 py-12">
                Nenhuma reunião cadastrada.{' '}
                <Link href="/reunioes/nova" style={{ color: '#1B3A6B' }}>Criar a primeira</Link>
              </td>
            </tr>
          ) : reunioes.map(r => {
            const st = STATUS_MAP[r.status] ?? { label: r.status, cls: 'badge-gray' }
            return (
              <tr key={r.id}>
                <td style={{ paddingLeft: 20 }}>
                  <Link href={`/reunioes/${r.id}`} className="font-semibold text-gray-900 hover:underline" style={{ color: '#1B3A6B' }}>
                    {r.numero}
                  </Link>
                  <div className="text-xs text-gray-400">{TIPO_MAP[r.tipo] ?? r.tipo}</div>
                </td>
                <td>
                  <div>{new Date(r.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                  {r.data_fim && r.data_fim !== r.data_inicio && (
                    <div className="text-xs text-gray-400">até {new Date(r.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                  )}
                </td>
                <td className="text-gray-600">
                  {r.local ? `${r.local}${r.cidade ? ` — ${r.cidade}` : ''}` : '—'}
                </td>
                <td className="text-gray-500">—</td>
                <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                <td style={{ paddingRight: 20 }}>
                  <MenuAcoes
                    reuniao={r}
                    onEdit={setEditando}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {editando && (
        <EditModal
          reuniao={editando}
          onClose={() => setEditando(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}

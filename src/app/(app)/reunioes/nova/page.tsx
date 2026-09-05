'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NovaReuniaoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    numero: '',
    tipo: 'ordinaria',
    data_inicio: '',
    data_fim: '',
    local: '',
    cidade: '',
    quorum_necessario: '',
    observacoes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.from('reunioes').insert({
      numero: form.numero.trim(),
      tipo: form.tipo,
      data_inicio: form.data_inicio,
      data_fim: form.data_fim || form.data_inicio,
      local: form.local.trim() || null,
      cidade: form.cidade.trim() || null,
      quorum_necessario: form.quorum_necessario ? parseInt(form.quorum_necessario) : null,
      observacoes: form.observacoes.trim() || null,
      status: 'convocada',
    }).select().single()
    setLoading(false)
    if (!error && data) {
      router.push(`/reunioes/${data.id}`)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/reunioes">Reuniões</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Nova reunião</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Nova Reunião</h1>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Número / Identificação *</label>
            <input
              value={form.numero}
              onChange={e => set('numero', e.target.value)}
              placeholder="Ex: PSSP-E 2026, 37ª RE 2025"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Identificação única da reunião</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo *</label>
            <select
              value={form.tipo}
              onChange={e => set('tipo', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 bg-white"
            >
              <option value="ordinaria">Ordinária</option>
              <option value="extraordinaria">Extraordinária</option>
              <option value="solene">Solene</option>
              <option value="administrativa">Administrativa</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Data início *</label>
              <input
                type="date"
                value={form.data_inicio}
                onChange={e => set('data_inicio', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Data fim</label>
              <input
                type="date"
                value={form.data_fim}
                onChange={e => set('data_fim', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Local</label>
              <input
                value={form.local}
                onChange={e => set('local', e.target.value)}
                placeholder="Ex: IP Penha"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cidade</label>
              <input
                value={form.cidade}
                onChange={e => set('cidade', e.target.value)}
                placeholder="São Paulo"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quórum necessário</label>
            <input
              type="number"
              value={form.quorum_necessario}
              onChange={e => set('quorum_necessario', e.target.value)}
              placeholder="Ex: 10"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/reunioes"
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 text-center hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: '#1B3A6B' }}
            >
              {loading ? 'Criando...' : 'Criar reunião'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

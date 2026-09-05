import { createClient } from '@/lib/supabase/server'
import type { Oficial } from '@/types/database'

const TIPO_MAP: Record<string, string> = {
  pastor: 'Pastor', presbitero: 'Presbítero', diacono: 'Diácono',
}

export default async function OficiaisPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('oficiais')
    .select('*, igreja:igrejas(nome, sigla)')
    .order('nome')

  const oficiais = (data ?? []) as (Oficial & { igreja: { nome: string; sigla: string | null } | null })[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Oficiais</h1>
          <p className="text-gray-500 text-sm mt-1">{oficiais.length} pastores e presbíteros</p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}
        >
          + Novo oficial
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-pssp">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Nome</th>
              <th>Tipo</th>
              <th>Cargo</th>
              <th>Igreja</th>
              <th style={{ paddingRight: 20 }}>Situação</th>
            </tr>
          </thead>
          <tbody>
            {oficiais.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-12">Nenhum oficial cadastrado</td>
              </tr>
            ) : oficiais.map(o => (
              <tr key={o.id}>
                <td style={{ paddingLeft: 20 }}>
                  <div className="font-medium text-gray-900">{o.nome}</div>
                  {o.email && <div className="text-xs text-gray-400">{o.email}</div>}
                </td>
                <td>
                  <span className={`badge ${o.tipo === 'pastor' ? 'badge-navy' : 'badge-gold'}`}>
                    {TIPO_MAP[o.tipo] ?? o.tipo}
                  </span>
                </td>
                <td className="text-gray-500 text-sm">{o.cargo ?? '—'}</td>
                <td className="text-gray-600 text-sm">
                  {o.igreja ? (o.igreja.sigla ? `${o.igreja.sigla} — ${o.igreja.nome}` : o.igreja.nome) : '—'}
                </td>
                <td style={{ paddingRight: 20 }}>
                  <span className={`badge ${o.ativo ? 'badge-green' : 'badge-gray'}`}>
                    {o.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

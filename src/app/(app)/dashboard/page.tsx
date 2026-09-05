import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Reuniao } from '@/types/database'

function statusLabel(s: string) {
  const map: Record<string, { label: string; cls: string }> = {
    convocada:        { label: 'Convocada',        cls: 'badge-blue' },
    em_andamento:     { label: 'Em andamento',     cls: 'badge-green' },
    encerrada:        { label: 'Encerrada',         cls: 'badge-gray' },
    ata_em_producao:  { label: 'Ata em produção',  cls: 'badge-yellow' },
    ata_aprovada:     { label: 'Ata aprovada',      cls: 'badge-navy' },
    publicada:        { label: 'Publicada',         cls: 'badge-green' },
  }
  return map[s] ?? { label: s, cls: 'badge-gray' }
}

function tipoLabel(t: string) {
  const map: Record<string, string> = {
    ordinaria: 'Ordinária', extraordinaria: 'Extraordinária',
    solene: 'Solene', administrativa: 'Administrativa',
  }
  return map[t] ?? t
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: reunioes }, { data: stats }] = await Promise.all([
    supabase.from('reunioes').select('*').order('data_inicio', { ascending: false }).limit(5),
    supabase.from('reunioes').select('id, status'),
  ])

  const totalReunioes = stats?.length ?? 0
  const ativas = stats?.filter(r => r.status === 'em_andamento').length ?? 0
  const atasEmProducao = stats?.filter(r => r.status === 'ata_em_producao').length ?? 0

  const reunioesData = (reunioes ?? []) as Reuniao[]
  const reuniaoAtiva = reunioesData.find(r => r.status === 'em_andamento')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Presbitério Leste de São Paulo — PSSP</p>
      </div>

      {/* Reunião ativa */}
      {reuniaoAtiva && (
        <Link href={`/reunioes/${reuniaoAtiva.id}`}>
          <div className="mb-6 rounded-xl p-5 text-white flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #1B3A6B, #2a5dab)' }}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Reunião em andamento</div>
              <div className="text-xl font-bold">Reunião {reuniaoAtiva.numero}</div>
              <div className="text-white/70 text-sm mt-0.5">
                {tipoLabel(reuniaoAtiva.tipo)} · {new Date(reuniaoAtiva.data_inicio).toLocaleDateString('pt-BR')}
                {reuniaoAtiva.local ? ` · ${reuniaoAtiva.local}` : ''}
              </div>
            </div>
            <div className="text-white/40 text-2xl">→</div>
          </div>
        </Link>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total de reuniões', value: totalReunioes, icon: '🏛️', color: '#1B3A6B' },
          { label: 'Em andamento', value: ativas, icon: '▶', color: '#16a34a' },
          { label: 'Atas em produção', value: atasEmProducao, icon: '📝', color: '#d97706' },
          { label: 'Aguardando ação', value: atasEmProducao + ativas, icon: '⚡', color: '#B8962E' },
        ].map((kpi) => (
          <div key={kpi.label} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{kpi.icon}</span>
              <span className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</span>
            </div>
            <div className="text-sm text-gray-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Reuniões recentes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Reuniões recentes</h2>
          <Link href="/reunioes" className="text-sm font-medium" style={{ color: '#1B3A6B' }}>
            Ver todas →
          </Link>
        </div>

        <table className="table-pssp">
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Local</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reunioesData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">
                  Nenhuma reunião cadastrada
                </td>
              </tr>
            ) : reunioesData.map((r) => {
              const st = statusLabel(r.status)
              return (
                <tr key={r.id}>
                  <td className="font-medium text-gray-900">{r.numero}</td>
                  <td>{tipoLabel(r.tipo)}</td>
                  <td>{new Date(r.data_inicio).toLocaleDateString('pt-BR')}</td>
                  <td className="text-gray-500">{r.local ?? '—'}</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  <td>
                    <Link href={`/reunioes/${r.id}`} className="text-xs font-medium" style={{ color: '#1B3A6B' }}>
                      Abrir
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

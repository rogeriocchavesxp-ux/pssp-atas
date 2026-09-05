import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Reuniao } from '@/types/database'

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

export default async function ReunioesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reunioes')
    .select('*')
    .order('data_inicio', { ascending: false })

  const reunioes = (data ?? []) as Reuniao[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reuniões</h1>
          <p className="text-gray-500 text-sm mt-1">{reunioes.length} reuniões cadastradas</p>
        </div>
        <Link
          href="/reunioes/nova"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}
        >
          + Nova reunião
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-pssp">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Número / Tipo</th>
              <th>Data</th>
              <th>Local</th>
              <th>Documentos</th>
              <th>Status</th>
              <th style={{ paddingRight: 20 }}></th>
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
            ) : reunioes.map((r) => {
              const st = STATUS_MAP[r.status] ?? { label: r.status, cls: 'badge-gray' }
              return (
                <tr key={r.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <div className="font-semibold text-gray-900">{r.numero}</div>
                    <div className="text-xs text-gray-400">{TIPO_MAP[r.tipo] ?? r.tipo}</div>
                  </td>
                  <td>
                    <div>{new Date(r.data_inicio).toLocaleDateString('pt-BR')}</div>
                    {r.data_fim && r.data_fim !== r.data_inicio && (
                      <div className="text-xs text-gray-400">até {new Date(r.data_fim).toLocaleDateString('pt-BR')}</div>
                    )}
                  </td>
                  <td className="text-gray-600">{r.local ?? '—'}{r.cidade ? `, ${r.cidade}` : ''}</td>
                  <td className="text-gray-500">—</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  <td style={{ paddingRight: 20 }}>
                    <Link
                      href={`/reunioes/${r.id}`}
                      className="px-3 py-1.5 rounded-md text-xs font-medium border transition-colors hover:bg-gray-50"
                      style={{ color: '#1B3A6B', borderColor: '#1B3A6B' }}
                    >
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

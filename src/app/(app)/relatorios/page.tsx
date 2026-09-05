import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  rascunho:    { label: 'Rascunho',    cls: 'badge-gray' },
  submetido:   { label: 'Submetido',   cls: 'badge-blue' },
  em_revisao:  { label: 'Em revisão',  cls: 'badge-yellow' },
  aprovado:    { label: 'Aprovado',    cls: 'badge-green' },
  devolvido:   { label: 'Devolvido',   cls: 'badge-red' },
}

export default async function RelatoriosPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('relatorios_anuais')
    .select('*, igreja:igrejas(nome, sigla)')
    .order('ano', { ascending: false })
    .order('created_at', { ascending: false })

  type Row = {
    id: string; ano: number; status: string; updated_at: string
    ministro: unknown; conselho: unknown; cadastro_estatistica: unknown
    Igreja: { nome: string; sigla: string | null } | null
  }
  const rows = ((data ?? []) as unknown) as Row[]

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Anuais</h1>
          <p className="text-gray-500 text-sm mt-1">
            Relatórios de Igreja e Ministro enviados pelas comunidades ao Presbitério
          </p>
        </div>
        <Link
          href="/relatorios/novo"
          className="px-4 py-2 rounded-md text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}
        >
          + Novo Relatório
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-pssp">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Igreja</th>
              <th>Ano</th>
              <th>Seções preenchidas</th>
              <th>Última atualização</th>
              <th>Status</th>
              <th style={{ paddingRight: 20 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-12">
                  Nenhum relatório cadastrado
                </td>
              </tr>
            ) : rows.map(row => {
              const church = (row as unknown as { igreja: { nome: string; sigla: string | null } | null }).igreja
              const st = STATUS_MAP[row.status] ?? { label: row.status, cls: 'badge-gray' }
              const secoes = [
                row.ministro ? 'Ministro' : null,
                row.conselho ? 'Conselho' : null,
                row.cadastro_estatistica ? 'Estatística' : null,
              ].filter(Boolean).join(', ') || '—'
              return (
                <tr key={row.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <div className="font-medium text-gray-900">{church?.nome ?? '—'}</div>
                    {church?.sigla && (
                      <div className="text-xs text-gray-400">{church.sigla}</div>
                    )}
                  </td>
                  <td className="font-semibold text-gray-700">{row.ano}</td>
                  <td className="text-gray-500 text-sm">{secoes}</td>
                  <td className="text-gray-500 text-sm">
                    {new Date(row.updated_at).toLocaleString('pt-BR')}
                  </td>
                  <td>
                    <span className={`badge ${st.cls}`}>{st.label}</span>
                  </td>
                  <td style={{ paddingRight: 20 }}>
                    <Link
                      href={`/relatorios/${row.id}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-md border"
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

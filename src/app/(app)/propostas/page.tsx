import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PropostasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('documentos')
    .select('*, reuniao:reunioes(numero, data_inicio)')
    .order('created_at', { ascending: false })
    .limit(50)

  const docs = data ?? []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Propostas de Resolução</h1>
        <p className="text-gray-500 text-sm mt-1">{docs.length} documento(s) no sistema</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-pssp">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20, width: 60 }}>Doc.</th>
              <th>Assunto</th>
              <th>Oriundo</th>
              <th>Reunião</th>
              <th style={{ paddingRight: 20 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-12">Nenhuma proposta</td></tr>
            ) : docs.map((d) => {
              const reuniao = d.reuniao as { numero: string; data_inicio: string } | null
              return (
                <tr key={d.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <span className="font-mono font-semibold text-gray-700">
                      {String(d.numero).padStart(3, '0')}
                    </span>
                  </td>
                  <td>
                    <div className="font-medium text-gray-900 text-sm leading-snug">{d.assunto}</div>
                    {d.tipo && <div className="text-xs text-gray-400">{d.tipo}</div>}
                  </td>
                  <td className="text-gray-500 text-sm">{d.oriundo ?? '—'}</td>
                  <td>
                    {reuniao ? (
                      <Link href={`/reunioes/${d.reuniao_id}`} className="text-sm" style={{ color: '#1B3A6B' }}>
                        {reuniao.numero}
                      </Link>
                    ) : '—'}
                  </td>
                  <td style={{ paddingRight: 20 }}>
                    <span className={`badge ${d.status === 'aprovado' ? 'badge-green' : d.status === 'rejeitado' ? 'badge-red' : 'badge-gray'}`}>
                      {d.status}
                    </span>
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

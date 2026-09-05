import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ResolucoesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('resolucoes')
    .select('*, reuniao:reunioes(numero), documento:documentos(assunto, oriundo)')
    .order('data', { ascending: false })

  const resolucoes = data ?? []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resoluções</h1>
        <p className="text-gray-500 text-sm mt-1">{resolucoes.length} resolução(ões) aprovadas</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-pssp">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20, width: 80 }}>Nº</th>
              <th>Ementa</th>
              <th>Reunião</th>
              <th>Data</th>
              <th style={{ paddingRight: 20 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {resolucoes.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-12">Nenhuma resolução aprovada</td></tr>
            ) : resolucoes.map((res) => {
              const reuniao = res.reuniao as { numero: string } | null
              return (
                <tr key={res.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <span className="font-mono font-semibold text-gray-700">
                      {String(res.numero).padStart(3, '0')}
                    </span>
                  </td>
                  <td>
                    <div className="font-medium text-gray-900 text-sm">{res.ementa}</div>
                  </td>
                  <td>
                    {reuniao ? (
                      <Link href={`/reunioes/${res.reuniao_id}`} style={{ color: '#1B3A6B' }} className="text-sm">
                        {reuniao.numero}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="text-gray-500 text-sm">
                    {new Date(res.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ paddingRight: 20 }}>
                    <span className={`badge ${res.status === 'publicada' ? 'badge-green' : 'badge-navy'}`}>
                      {res.status === 'publicada' ? 'Publicada' : 'Aprovada'}
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

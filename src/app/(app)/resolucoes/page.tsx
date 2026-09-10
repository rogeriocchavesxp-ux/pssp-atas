import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let r = ''
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i] }
  }
  return r
}

function formatDate(dateStr: string): string {
  // Evita bug de timezone: '2026-09-04' interpretado como UTC meia-noite
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default async function ResolucoesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const supabase = await createClient()
  const params = await searchParams
  const reuniaoId = params.reuniao ?? null

  let query = supabase
    .from('resolucoes')
    .select('*, reuniao:reunioes(numero), documento:documentos(numero, assunto, oriundo)')
    .order('data', { ascending: false })

  if (reuniaoId) {
    query = query.eq('reuniao_id', reuniaoId)
  }

  const { data } = await query
  const resolucoes = data ?? []

  let reuniaoNumero: string | null = null
  if (reuniaoId) {
    const { data: r } = await supabase.from('reunioes').select('numero').eq('id', reuniaoId).single()
    reuniaoNumero = r?.numero ?? null
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resoluções</h1>
        <p className="text-gray-500 text-sm mt-1">
          {reuniaoNumero ? `${reuniaoNumero} · ` : ''}{resolucoes.length} resolução(ões) aprovadas
        </p>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-pssp">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20, width: 60 }}>Doc.</th>
              <th style={{ width: 80 }}>Resolução</th>
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
              const reuniao = Array.isArray(res.reuniao) ? res.reuniao[0] : res.reuniao as { numero: string } | null
              const doc = Array.isArray(res.documento) ? res.documento[0] : res.documento as { numero: number } | null
              return (
                <tr key={res.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <span className="font-mono text-sm text-gray-500">
                      {doc ? String(doc.numero).padStart(3, '0') : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono font-semibold text-gray-700">
                      {toRoman(res.numero)}
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
                    {formatDate(res.data)}
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

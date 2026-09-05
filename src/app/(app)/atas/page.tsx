import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  rascunho:    { label: 'Rascunho',      cls: 'badge-gray' },
  em_revisao:  { label: 'Em revisão',    cls: 'badge-yellow' },
  aprovada:    { label: 'Aprovada',       cls: 'badge-navy' },
  publicada:   { label: 'Publicada',      cls: 'badge-green' },
}

export default async function AtasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('atas')
    .select('*, reuniao:reunioes(numero, tipo, data_inicio)')
    .order('created_at', { ascending: false })

  type AtaRow = { id: string; reuniao_id: string; numero_ata: string | null; status: string; updated_at: string; reuniao: { numero: string; tipo: string; data_inicio: string } | null }
  const atas = ((data ?? []) as unknown) as AtaRow[]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Atas</h1>
        <p className="text-gray-500 text-sm mt-1">{atas.length} ata(s) no sistema</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-pssp">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Reunião</th>
              <th>Nº Ata</th>
              <th>Última atualização</th>
              <th>Status</th>
              <th style={{ paddingRight: 20 }}></th>
            </tr>
          </thead>
          <tbody>
            {atas.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-12">Nenhuma ata</td></tr>
            ) : atas.map((ata) => {
              const reuniao = ata.reuniao as { numero: string; tipo: string; data_inicio: string } | null
              const st = STATUS_MAP[ata.status] ?? { label: ata.status, cls: 'badge-gray' }
              return (
                <tr key={ata.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <div className="font-medium text-gray-900">{reuniao?.numero ?? '—'}</div>
                    {reuniao && (
                      <div className="text-xs text-gray-400">
                        {new Date(reuniao.data_inicio).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </td>
                  <td className="text-gray-600">{ata.numero_ata ?? '—'}</td>
                  <td className="text-gray-500 text-sm">
                    {new Date(ata.updated_at).toLocaleString('pt-BR')}
                  </td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  <td style={{ paddingRight: 20 }}>
                    <Link
                      href={`/reunioes/${ata.reuniao_id}/ata`}
                      className="text-xs font-medium px-3 py-1.5 rounded-md border"
                      style={{ color: '#1B3A6B', borderColor: '#1B3A6B' }}
                    >
                      Editar
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

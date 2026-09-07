'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  rascunho:     { label: 'Rascunho',      cls: 'badge-gray' },
  em_aprovacao: { label: 'Em aprovação',  cls: 'badge-yellow' },
  em_revisao:   { label: 'Em revisão',    cls: 'badge-yellow' },
  aprovada:     { label: 'Aprovada',      cls: 'badge-navy' },
  publicada:    { label: 'Publicada',     cls: 'badge-green' },
}

type AtaRow = {
  id: string
  reuniao_id: string
  numero_ata: string | null
  status: string
  updated_at: string
  reuniao: { numero: string; tipo: string; data_inicio: string } | null
}

export function AtasClient({ atas, podeEnviar }: { atas: AtaRow[]; podeEnviar: boolean }) {
  const router = useRouter()
  const supabase = createClient()
  const [enviando, setEnviando] = useState<string | null>(null)

  async function enviarParaAprovacao(ata: AtaRow) {
    if (!window.confirm('Enviar a ata para aprovação?')) return
    setEnviando(ata.id)
    await supabase.from('atas').update({ status: 'em_aprovacao' }).eq('id', ata.id)
    setEnviando(null)
    router.refresh()
  }

  return (
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
            const reuniao = ata.reuniao
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
                  <div className="flex items-center gap-2 justify-end">
                    {podeEnviar && ata.status === 'rascunho' && (
                      <button
                        onClick={() => enviarParaAprovacao(ata)}
                        disabled={enviando === ata.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md text-white disabled:opacity-60"
                        style={{ background: '#16a34a' }}
                      >
                        {enviando === ata.id ? 'Enviando...' : 'Enviar para aprovação'}
                      </button>
                    )}
                    <Link
                      href={`/reunioes/${ata.reuniao_id}/ata`}
                      className="text-xs font-medium px-3 py-1.5 rounded-md border"
                      style={{ color: '#1B3A6B', borderColor: '#1B3A6B' }}
                    >
                      Editar
                    </Link>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

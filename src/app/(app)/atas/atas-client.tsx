'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AtaViewer } from './ata-viewer'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  rascunho:     { label: 'Rascunho',      cls: 'badge-gray' },
  em_aprovacao: { label: 'Aguardando Aprovação', cls: 'badge-yellow' },
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

function AtaTabela({
  atas,
  podeAprovar,
  aprovando,
  onAprovar,
}: {
  atas: AtaRow[]
  podeAprovar: boolean
  aprovando: string | null
  onAprovar: (ata: AtaRow) => void
  onVer: (ata: AtaRow) => void
}) {
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
            <tr><td colSpan={5} className="text-center text-gray-400 py-10">Nenhuma ata</td></tr>
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
                    {podeAprovar && ata.status === 'em_aprovacao' && (
                      <button
                        onClick={() => onAprovar(ata)}
                        disabled={aprovando === ata.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md text-white disabled:opacity-60"
                        style={{ background: '#16a34a' }}
                      >
                        {aprovando === ata.id ? 'Aprovando...' : 'Aprovar'}
                      </button>
                    )}
                    {ata.status === 'publicada' ? (
                      <button
                        onClick={() => onVer(ata)}
                        className="text-xs font-medium px-3 py-1.5 rounded-md border"
                        style={{ color: '#1B3A6B', borderColor: '#1B3A6B' }}
                      >
                        Ver
                      </button>
                    ) : (
                      <Link
                        href={`/reunioes/${ata.reuniao_id}/ata`}
                        className="text-xs font-medium px-3 py-1.5 rounded-md border"
                        style={{ color: '#1B3A6B', borderColor: '#1B3A6B' }}
                      >
                        Editar
                      </Link>
                    )}
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

interface AtaConteudo {
  verificacao_poderes: string
  sessao_preparatoria: string
  sessoes_regulares: string[]
  observacoes?: string
}

export function AtasClient({ atas, podeAprovar }: { atas: AtaRow[]; podeAprovar: boolean }) {
  const router = useRouter()
  const supabase = createClient()
  const [aprovando, setAprovando] = useState<string | null>(null)
  const [viewer, setViewer] = useState<{ conteudo: AtaConteudo; reuniao: AtaRow['reuniao'] } | null>(null)

  async function abrirViewer(ata: AtaRow) {
    const { data } = await supabase.from('atas').select('conteudo').eq('id', ata.id).single()
    if (!data) return
    setViewer({ conteudo: data.conteudo as unknown as AtaConteudo, reuniao: ata.reuniao })
  }

  async function handleAprovar(ata: AtaRow) {
    if (!window.confirm('Publicar esta ata? Esta ação não pode ser desfeita.')) return
    setAprovando(ata.id)
    await supabase.from('atas').update({ status: 'publicada' }).eq('id', ata.id)
    setAprovando(null)
    router.refresh()
  }

  const atasPendentes = atas.filter(a => a.status !== 'publicada')
  const atasPublicadas = atas.filter(a => a.status === 'publicada')

  return (
    <>
    {viewer && (
      <AtaViewer
        conteudo={viewer.conteudo}
        reuniao={viewer.reuniao}
        onClose={() => setViewer(null)}
      />
    )}
    <div className="space-y-10">
      {/* Atas em andamento */}
      <div>
        <AtaTabela
          atas={atasPendentes}
          podeAprovar={podeAprovar}
          aprovando={aprovando}
          onAprovar={handleAprovar}
          onVer={abrirViewer}
        />
      </div>

      {/* Atas publicadas */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Atas publicadas
        </h2>
        <AtaTabela
          atas={atasPublicadas}
          podeAprovar={false}
          aprovando={null}
          onAprovar={() => {}}
          onVer={abrirViewer}
        />
      </div>
    </div>
    </>
  )
}

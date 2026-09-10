import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Triple = { campo: number; fora: number; total: number }

function Linha({ label, v }: { label: string; v: Triple }) {
  if (!v || v.total === 0) return null
  return (
    <tr>
      <td className="py-1.5 text-sm text-gray-700 pr-4">{label}</td>
      <td className="py-1.5 text-sm text-right text-gray-600 pr-3">{v.campo || '—'}</td>
      <td className="py-1.5 text-sm text-right text-gray-600 pr-3">{v.fora || '—'}</td>
      <td className="py-1.5 text-sm text-right font-semibold text-gray-900">{v.total}</td>
    </tr>
  )
}

function Secao({ titulo, linhas }: { titulo: string; linhas: [string, Triple][] }) {
  const visivel = linhas.filter(([, v]) => v?.total > 0)
  if (visivel.length === 0) return null
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 text-sm mb-4">{titulo}</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-4">Atividade</th>
            <th className="text-right text-xs text-gray-400 font-medium pb-2 pr-3">No Campo</th>
            <th className="text-right text-xs text-gray-400 font-medium pb-2 pr-3">Fora</th>
            <th className="text-right text-xs text-gray-400 font-medium pb-2">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {linhas.map(([label, v]) => <Linha key={label} label={label} v={v} />)}
        </tbody>
      </table>
    </div>
  )
}

export default async function RelMinDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('relatorios_ministeriais')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const d = data.doutrinacao as Record<string, Triple>
  const ap = data.atos_pastorais as Record<string, Triple>
  const asp = data.assistencia_pastoral as Record<string, Triple>
  const ac = data.atuacao_conciliar as Record<string, Triple & { reunioes_presbitério?: number; reunioes_sinodo?: number; reunioes_supremo_concilio?: number }>

  const STATUS = { submetido: 'Submetido', em_revisao: 'Em revisão', aprovado: 'Aprovado' } as Record<string, string>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/relatorios/ministeriais">Relatórios Ministeriais</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{data.nome_ministro}</span>
      </div>

      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.nome_ministro}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Relatório Ministerial · Ano {data.ano}
            {data.igrejas && ` · ${data.igrejas}`}
          </p>
        </div>
        <span className={`badge ${data.status === 'aprovado' ? 'badge-green' : data.status === 'em_revisao' ? 'badge-yellow' : 'badge-blue'}`}>
          {STATUS[data.status] ?? data.status}
        </span>
      </div>

      <div className="space-y-6">
        <Secao titulo="1. Doutrinação" linhas={[
          ['Pregações', d.pregacoes],
          ['Aulas de Escola Dominical', d.aulas_ed],
          ['Trabalhos de Evangelização', d.trabalhos_evang],
          ['Estudos Bíblicos', d.estudos_biblicos],
          ['Palestras e Preleções', d.palestras],
          ['Mensagens Rádio/TV', d.mensagens_radio],
          ['Artigos em jornais/boletins', d.artigos],
          ['Entrevistas', d.entrevistas],
        ]} />

        <Secao titulo="2. Atos Pastorais" linhas={[
          ['Bênçãos Nupciais', ap.bencaos_nupciais],
          ['Funerais', ap.funerais],
          ['Profissões de Fé', ap.profissoes_fe],
          ['Profissões de Fé e Batismo', ap.profissoes_fe_batismo],
          ['Batismos Infantis', ap.batismos_infantis],
          ['Santas Ceias', ap.santas_ceias],
        ]} />

        <Secao titulo="3. Assistência Pastoral" linhas={[
          ['Aconselhamentos/Orientações', asp.aconselhamentos],
          ['Visitas a Evangélicos', asp.vis_evangelicos],
          ['Visitas a Não Evangélicos', asp.vis_nao_evangelicos],
          ['Visitas a Departamentos Internos', asp.vis_depto_internos],
          ['Visitas a Congregações', asp.vis_congregacoes],
          ['Visitas a Pontos de Pregação', asp.vis_pontos_pregacao],
          ['Visitas a Campos Missionários', asp.vis_campos_missionarios],
        ]} />

        {/* Atuação Conciliar */}
        {ac && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">4. Atuação Conciliar</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                ['Reuniões do Conselho', ac.reunioes_conselho?.total],
                ['Reuniões do Presbitério', ac.reunioes_presbitério],
                ['Reuniões do Sínodo', ac.reunioes_sinodo],
                ['Presbíteros Ordenados', ac.presbiteros_ordenados?.total],
                ['Diáconos Ordenados', ac.diaconos_ordenados?.total],
                ['Assembleias Gerais', ac.assembleias_gerais?.total],
              ].filter(([, v]) => v).map(([label, v]) => (
                <div key={label as string} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{v}</div>
                  <div className="text-xs text-gray-500 mt-1">{label as string}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Textos descritivos */}
        {data.ministerio_designado && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Ministério Designado (Art. 37)</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{data.ministerio_designado}</p>
          </div>
        )}
        {data.atualizacao_aperfeicoamento && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Atualização e Aperfeiçoamento</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{data.atualizacao_aperfeicoamento}</p>
          </div>
        )}
        {data.atividades_extra && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Atividades Extra Ministeriais</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{data.atividades_extra}</p>
          </div>
        )}
      </div>
    </div>
  )
}

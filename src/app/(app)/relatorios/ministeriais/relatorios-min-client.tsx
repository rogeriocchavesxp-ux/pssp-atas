'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { RelMin } from './page'

// ── Mapeamento de células do XLT padrão IPB ─────────────────────────────
// [row, col] → baseado no template CSM-IPB-08/00
function num(ws: Record<string, {v: unknown}>, r: number, c: number): number {
  const addr = cellAddr(r, c)
  const v = ws[addr]?.v
  return typeof v === 'number' ? v : 0
}
function str(ws: Record<string, {v: unknown}>, r: number, c: number): string {
  const addr = cellAddr(r, c)
  const v = ws[addr]?.v
  return v != null ? String(v).trim() : ''
}
function cellAddr(r: number, c: number): string {
  let col = ''
  let n = c
  do { col = String.fromCharCode(65 + (n % 26)) + col; n = Math.floor(n / 26) - 1 } while (n >= 0)
  return `${col}${r + 1}`
}
function textBlock(ws: Record<string, {v: unknown}>, rowStart: number, rowEnd: number, col = 0): string {
  const lines: string[] = []
  for (let r = rowStart; r <= rowEnd; r++) {
    const v = str(ws, r, col)
    if (v) lines.push(v)
  }
  return lines.join('\n')
}

function parseXls(ws: Record<string, {v: unknown}>) {
  const triple = (r: number, c1: number, c2: number, c3: number) => ({
    campo: num(ws, r, c1), fora: num(ws, r, c2), total: num(ws, r, c3),
  })
  return {
    ano: num(ws, 2, 17) || new Date().getFullYear(),
    nome_ministro: str(ws, 7, 2),
    igrejas: str(ws, 22, 2),
    congregacoes: str(ws, 23, 2),
    doutrinacao: {
      pregacoes:       triple(26,6,9,12),
      palestras:       triple(26,21,24,27),
      aulas_ed:        triple(27,6,9,12),
      mensagens_radio: triple(27,21,24,27),
      trabalhos_evang: triple(28,6,9,12),
      artigos:         triple(28,21,24,27),
      estudos_biblicos:triple(29,6,9,12),
      entrevistas:     triple(29,21,24,27),
    },
    atos_pastorais: {
      bencaos_nupciais:       triple(31,6,9,12),
      profissoes_fe_batismo:  triple(31,21,24,27),
      funerais:               triple(32,6,9,12),
      batismos_infantis:      triple(32,21,24,27),
      profissoes_fe:          triple(33,6,9,12),
      santas_ceias:           triple(33,21,24,27),
    },
    assistencia_pastoral: {
      aconselhamentos:       triple(36,6,9,12),
      vis_congregacoes:      triple(36,21,24,27),
      vis_evangelicos:       triple(37,6,9,12),
      vis_pontos_pregacao:   triple(37,21,24,27),
      vis_nao_evangelicos:   triple(38,6,9,12),
      vis_campos_missionarios: triple(38,21,24,27),
      vis_depto_internos:    triple(39,6,9,12),
    },
    atuacao_conciliar: {
      reunioes_conselho:        triple(46,6,9,12),
      presbiteros_ordenados:    triple(46,21,24,27),
      diaconos_ordenados:       triple(47,6,9,12),
      presbiteros_investidos:   triple(47,21,24,27),
      diaconos_investidos:      triple(48,6,9,12),
      assembleias_gerais:       triple(48,21,24,27),
      reunioes_presbitério: num(ws,49,5),
      reunioes_sinodo: num(ws,50,5),
      reunioes_supremo_concilio: num(ws,51,5),
    },
    ministerio_designado: textBlock(ws, 41, 42),
    cargos_comissoes: [str(ws,53,0),str(ws,54,0),str(ws,55,0),str(ws,56,0)].filter(Boolean).join('\n'),
    atualizacao_aperfeicoamento: textBlock(ws, 61, 69),
    atividades_extra: textBlock(ws, 71, 79),
  }
}

// ── Labels para exibição ─────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  submetido:  { label: 'Submetido',   cls: 'badge-blue' },
  em_revisao: { label: 'Em revisão',  cls: 'badge-yellow' },
  aprovado:   { label: 'Aprovado',    cls: 'badge-green' },
}

type Dados = ReturnType<typeof parseXls>

export function RelatoriosMinClient({
  relatorios: inicial,
  oficiais,
}: {
  relatorios: RelMin[]
  oficiais: { id: string; nome: string }[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [relatorios, setRelatorios] = useState(inicial)
  const [preview, setPreview] = useState<Dados | null>(null)
  const [oficialSelecionado, setOficialSelecionado] = useState<string>('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [anoFiltro, setAnoFiltro] = useState<number | null>(null)

  const anos = [...new Set(relatorios.map(r => r.ano))].sort((a, b) => b - a)
  const filtrados = anoFiltro ? relatorios.filter(r => r.ano === anoFiltro) : relatorios

  // Agrupar por ano
  const porAno: Record<number, RelMin[]> = {}
  for (const r of filtrados) {
    if (!porAno[r.ano]) porAno[r.ano] = []
    porAno[r.ano].push(r)
  }
  const anosExibidos = Object.keys(porAno).map(Number).sort((a, b) => b - a)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErro('')
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]] as Record<string, {v: unknown}>
      const dados = parseXls(ws)
      if (!dados.nome_ministro) {
        setErro('Não foi possível identificar o nome do ministro na planilha.')
        return
      }
      // Tentar auto-match por nome
      const match = oficiais.find(o =>
        o.nome.toLowerCase().includes(dados.nome_ministro.split(' ')[1]?.toLowerCase() ?? '') ||
        dados.nome_ministro.toLowerCase().includes(o.nome.split(' ')[0]?.toLowerCase() ?? '')
      )
      setOficialSelecionado(match?.id ?? '')
      setPreview(dados)
    } catch {
      setErro('Erro ao ler a planilha. Verifique se é o modelo padrão IPB.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  async function salvar() {
    if (!preview || !oficialSelecionado) return
    setSalvando(true)
    setErro('')
    const { data, error } = await supabase
      .from('relatorios_ministeriais')
      .upsert({
        oficial_id: oficialSelecionado,
        nome_ministro: preview.nome_ministro,
        ano: preview.ano,
        igrejas: preview.igrejas || null,
        congregacoes: preview.congregacoes || null,
        doutrinacao: preview.doutrinacao,
        atos_pastorais: preview.atos_pastorais,
        assistencia_pastoral: preview.assistencia_pastoral,
        atuacao_conciliar: preview.atuacao_conciliar,
        ministerio_designado: preview.ministerio_designado || null,
        cargos_comissoes: preview.cargos_comissoes || null,
        atualizacao_aperfeicoamento: preview.atualizacao_aperfeicoamento || null,
        atividades_extra: preview.atividades_extra || null,
        status: 'submetido',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'oficial_id,ano' })
      .select()
      .single()
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setPreview(null)
    if (data) {
      setRelatorios(prev => {
        const filtrado = prev.filter(r => !(r.nome_ministro === preview.nome_ministro && r.ano === preview.ano))
        return [data as RelMin, ...filtrado].sort((a,b) => b.ano - a.ano || a.nome_ministro.localeCompare(b.nome_ministro))
      })
    }
    router.refresh()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Ministeriais</h1>
          <p className="text-gray-500 text-sm mt-1">
            Relatórios anuais individuais dos ministros (modelo IPB)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {anos.length > 0 && (
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
              value={anoFiltro ?? ''}
              onChange={e => setAnoFiltro(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Todos os anos</option>
              {anos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#1B3A6B' }}
          >
            + Importar planilha
          </button>
          <input ref={fileRef} type="file" accept=".xls,.xlsx,.xlt" className="hidden" onChange={handleFile} />
        </div>
      </div>

      {erro && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {erro}
        </div>
      )}

      {/* Modal de prévia */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Confirmar importação</h2>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Nome na planilha</div>
                  <div className="font-semibold text-gray-900">{preview.nome_ministro}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Ano</div>
                  <div className="font-semibold text-gray-900">{preview.ano}</div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Ministro no cadastro <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-200"
                    value={oficialSelecionado}
                    onChange={e => setOficialSelecionado(e.target.value)}
                  >
                    <option value="">Selecione o ministro...</option>
                    {oficiais.map(o => (
                      <option key={o.id} value={o.id}>{o.nome}</option>
                    ))}
                  </select>
                  {!oficialSelecionado && (
                    <p className="text-xs text-amber-600 mt-1">Obrigatório vincular ao cadastro antes de salvar.</p>
                  )}
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-400 mb-1">Igreja(s)</div>
                  <div className="text-gray-700">{preview.igrejas || '—'}</div>
                </div>
              </div>

              <PreviewSecao titulo="1. Doutrinação" dados={[
                ['Pregações', preview.doutrinacao.pregacoes],
                ['Aulas de ED', preview.doutrinacao.aulas_ed],
                ['Trabalhos de Evangelização', preview.doutrinacao.trabalhos_evang],
                ['Estudos Bíblicos', preview.doutrinacao.estudos_biblicos],
                ['Palestras', preview.doutrinacao.palestras],
                ['Artigos', preview.doutrinacao.artigos],
              ]} />

              <PreviewSecao titulo="2. Atos Pastorais" dados={[
                ['Bênçãos Nupciais', preview.atos_pastorais.bencaos_nupciais],
                ['Funerais', preview.atos_pastorais.funerais],
                ['Profissões de Fé', preview.atos_pastorais.profissoes_fe],
                ['Prof. de Fé e Batismo', preview.atos_pastorais.profissoes_fe_batismo],
                ['Batismos Infantis', preview.atos_pastorais.batismos_infantis],
                ['Santas Ceias', preview.atos_pastorais.santas_ceias],
              ]} />

              <PreviewSecao titulo="3. Assistência Pastoral" dados={[
                ['Aconselhamentos', preview.assistencia_pastoral.aconselhamentos],
                ['Visitas a Evangélicos', preview.assistencia_pastoral.vis_evangelicos],
                ['Visitas a Não Evangélicos', preview.assistencia_pastoral.vis_nao_evangelicos],
              ]} />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setPreview(null)}
                className="flex-1 py-2.5 rounded-md text-sm font-medium border border-gray-200 text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando || !oficialSelecionado}
                className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#1B3A6B' }}
              >
                {salvando ? 'Salvando...' : 'Confirmar e salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista por ano */}
      {anosExibidos.length === 0 ? (
        <div className="card text-center text-gray-400 py-16">
          <div className="text-4xl mb-3">📋</div>
          <div className="font-medium text-gray-500">Nenhum relatório importado</div>
          <div className="text-sm text-gray-400 mt-1">Clique em "Importar planilha" para começar</div>
        </div>
      ) : anosExibidos.map(ano => (
        <div key={ano} className="mb-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">{ano}</h2>
          <div className="card p-0 overflow-hidden">
            <table className="table-pssp">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Ministro</th>
                  <th>Igreja(s)</th>
                  <th>Enviado em</th>
                  <th>Status</th>
                  <th style={{ paddingRight: 20 }}></th>
                </tr>
              </thead>
              <tbody>
                {porAno[ano].map(r => {
                  const st = STATUS_MAP[r.status] ?? { label: r.status, cls: 'badge-gray' }
                  return (
                    <tr key={r.id}>
                      <td style={{ paddingLeft: 20 }}>
                        <div className="font-medium text-gray-900">{r.nome_ministro}</div>
                      </td>
                      <td className="text-gray-500 text-sm">{r.igrejas ?? '—'}</td>
                      <td className="text-gray-500 text-sm">
                        {new Date(r.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td style={{ paddingRight: 20 }}>
                        <a
                          href={`/relatorios/ministeriais/${r.id}`}
                          className="text-xs font-medium px-3 py-1.5 rounded-md border"
                          style={{ color: '#1B3A6B', borderColor: '#1B3A6B' }}
                        >
                          Ver relatório
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

function PreviewSecao({ titulo, dados }: {
  titulo: string
  dados: [string, { campo: number; fora: number; total: number }][]
}) {
  const temDados = dados.some(([, v]) => v.total > 0)
  if (!temDados) return null
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{titulo}</div>
      <div className="divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden">
        {dados.filter(([, v]) => v.total > 0).map(([label, v]) => (
          <div key={label} className="flex items-center justify-between px-4 py-2 text-sm">
            <span className="text-gray-700">{label}</span>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {v.campo > 0 && <span>Campo: <strong className="text-gray-800">{v.campo}</strong></span>}
              {v.fora > 0 && <span>Fora: <strong className="text-gray-800">{v.fora}</strong></span>}
              <span className="font-semibold text-gray-900">Total: {v.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

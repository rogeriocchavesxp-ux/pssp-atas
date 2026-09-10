'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { RelConselho, RelEstatistica, IgrejaLite } from './page'

// ── Helpers de leitura de células ────────────────────────────────────────
type WS = Record<string, { v: unknown }>

function colLetter(c: number): string {
  let col = ''
  let n = c
  do { col = String.fromCharCode(65 + (n % 26)) + col; n = Math.floor(n / 26) - 1 } while (n >= 0)
  return col
}
function addr(r: number, c: number) { return `${colLetter(c)}${r + 1}` }
function num(ws: WS, r: number, c: number): number {
  const v = ws[addr(r, c)]?.v
  return typeof v === 'number' ? v : 0
}
function str(ws: WS, r: number, c: number): string {
  const v = ws[addr(r, c)]?.v
  return v != null ? String(v).trim() : ''
}
function textBlock(ws: WS, r1: number, r2: number, c = 0): string {
  const lines: string[] = []
  for (let r = r1; r <= r2; r++) { const v = str(ws, r, c); if (v) lines.push(v) }
  return lines.join('\n')
}

// ── Parser: Conselho ou Mesa ──────────────────────────────────────────────
function parseConselho(ws: WS) {
  return {
    ano: num(ws, 2, 17) || new Date().getFullYear(),
    nome_igreja: str(ws, 7, 6),
    supervisao_espiritual: {
      santa_ceia_grupos:      num(ws, 19, 10),
      santa_ceia_individuos:  num(ws, 19, 23),
      santa_ceia_total:       num(ws, 19, 28),
      atividades_evangelisticas: num(ws, 21, 8),
      biblias:         num(ws, 22, 8),
      novos_testamentos: num(ws, 22, 14),
      folhetos:        num(ws, 22, 17),
      outras_literaturas: num(ws, 22, 23),
      textos_total:    num(ws, 22, 28),
      atos_beneficentes_diaconal: num(ws, 31, 12),
      atos_beneficentes_outros:   num(ws, 31, 21),
      atos_beneficentes_total:    num(ws, 31, 27),
      visitas_presbiteros:        num(ws, 32, 12),
      visitas_outros:             num(ws, 32, 21),
      visitas_total:              num(ws, 32, 27),
    },
    supervisao_administrativa: {
      reunioes_conselho:         num(ws, 35, 12),
      reunioes_junta_diaconal:   num(ws, 36, 12),
      reunioes_assembleia_geral: num(ws, 37, 12),
      reunioes_mesa_admin:       num(ws, 38, 12),
      reunioes_comissao_contas:  num(ws, 39, 12),
    },
    planejamento_alcancado:     textBlock(ws, 52, 55),
    planejamento_nao_alcancado: textBlock(ws, 56, 59),
  }
}

// ── Parser: Cadastro & Estatística ───────────────────────────────────────
function parseEstatistica(ws: WS) {
  return {
    ano: num(ws, 2, 17) || new Date().getFullYear(),
    nome_igreja: str(ws, 7, 5),
    lideranca: {
      pastores:     num(ws, 14, 4),
      licenciados:  num(ws, 15, 4),
      presbiteros:  num(ws, 16, 4),
      diaconos:     num(ws, 17, 4),
      evangelistas: num(ws, 18, 4),
      missionarios: num(ws, 19, 4),
      candidatos:   num(ws, 20, 4),
    },
    estrutura: {
      congregacoes:            num(ws, 14, 16),
      pontos_pregacao:         num(ws, 15, 16),
      escolas_dominicais:      num(ws, 16, 16),
      professores_ed:          num(ws, 17, 16),
      alunos_ed_atual:         num(ws, 18, 16),
      alunos_ed_anterior:      num(ws, 19, 16),
      departamentos_total:     num(ws, 21, 24),
      departamentos_membros:   num(ws, 21, 27),
    },
    rol_comungantes: {
      admissao_profissao_fe:         num(ws, 24, 12),
      admissao_profissao_fe_batismo: num(ws, 25, 12),
      admissao_transferencia:        num(ws, 26, 12),
      admissao_restauracao:          num(ws, 28, 12),
      demissao_transferencia:        num(ws, 30, 12),
      demissao_falecimento:          num(ws, 31, 12),
      demissao_exclusao:             num(ws, 32, 12),
      demissao_ordenacao:            num(ws, 33, 12),
      rol_anterior:                  num(ws, 36, 12),
      rol_atual:                     num(ws, 37, 12),
    },
    rol_nao_comungantes: {
      admissao_batismo:       num(ws, 24, 27),
      admissao_transferencia: num(ws, 25, 27),
      demissao_profissao_fe:  num(ws, 30, 27),
      demissao_transferencia: num(ws, 31, 27),
      demissao_exclusao:      num(ws, 33, 27),
      rol_anterior:           num(ws, 35, 27),
      rol_atual:              num(ws, 36, 27),
    },
    financeiro: {
      saldo_anterior:     num(ws, 44, 7),
      dizimos:            num(ws, 46, 7),
      ofertas_missionarias: num(ws, 48, 7),
      ofertas_especificas: num(ws, 49, 7),
      receitas_financeiras: num(ws, 50, 7),
      outras_receitas:    num(ws, 53, 7),
      total_receita:      num(ws, 54, 7),
      grande_total_entrada: num(ws, 55, 7),
      desp_patrimonio:    num(ws, 58, 7),
      desp_causas_locais: num(ws, 59, 7),
      desp_evangelismo:   num(ws, 60, 7),
      desp_missoes:       num(ws, 61, 7),
      desp_acao_social:   num(ws, 62, 7),
      desp_sustento_pastoral: num(ws, 63, 7),
      desp_verba_presbiterial: num(ws, 64, 7),
      desp_dizimo_supremo: num(ws, 65, 7),
      desp_outras:        num(ws, 67, 7),
      total_despesa:      num(ws, 68, 7),
      saldo_seguinte:     num(ws, 69, 7),
    },
  }
}

// ── Componentes UI ────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  submetido:  { label: 'Submetido',   cls: 'badge-blue' },
  em_revisao: { label: 'Em revisão',  cls: 'badge-yellow' },
  aprovado:   { label: 'Aprovado',    cls: 'badge-green' },
}

type Aba = 'conselho' | 'estatistica'

type PreviewConselho = ReturnType<typeof parseConselho>
type PreviewEstatistica = ReturnType<typeof parseEstatistica>

export function RelatoriosIgrejasClient({
  conselho: inicialC,
  estatistica: inicialE,
  igrejas,
}: {
  conselho: RelConselho[]
  estatistica: RelEstatistica[]
  igrejas: IgrejaLite[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const fileConselhoRef = useRef<HTMLInputElement>(null)
  const fileEstatRef = useRef<HTMLInputElement>(null)

  const [conselho, setConselho] = useState(inicialC)
  const [estatistica, setEstatistica] = useState(inicialE)
  const [aba, setAba] = useState<Aba>('conselho')
  const [anoFiltro, setAnoFiltro] = useState<number | null>(null)

  const [previewC, setPreviewC] = useState<PreviewConselho | null>(null)
  const [previewE, setPreviewE] = useState<PreviewEstatistica | null>(null)
  const [igrejaSel, setIgrejaSel] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const anosC = [...new Set(conselho.map(r => r.ano))].sort((a, b) => b - a)
  const anosE = [...new Set(estatistica.map(r => r.ano))].sort((a, b) => b - a)
  const anos = [...new Set([...anosC, ...anosE])].sort((a, b) => b - a)

  function autoMatch(nome: string) {
    const match = igrejas.find(i =>
      nome.toLowerCase().includes(i.nome.split(' ').slice(-2).join(' ').toLowerCase()) ||
      i.nome.toLowerCase().includes(nome.split(' ').slice(-2).join(' ').toLowerCase())
    )
    setIgrejaSel(match?.id ?? '')
  }

  async function handleFileConselho(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setErro('')
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const wsName = wb.SheetNames.find(n => n.toLowerCase().includes('conselho') || n.toLowerCase().includes('mesa'))
      if (!wsName) { setErro('Aba "Conselho ou Mesa" não encontrada.'); return }
      const dados = parseConselho(wb.Sheets[wsName] as WS)
      if (!dados.nome_igreja) { setErro('Nome da igreja não encontrado na planilha.'); return }
      autoMatch(dados.nome_igreja)
      setPreviewC(dados)
      setAba('conselho')
    } catch { setErro('Erro ao ler a planilha.') }
    if (fileConselhoRef.current) fileConselhoRef.current.value = ''
  }

  async function handleFileEstat(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setErro('')
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const wsName = wb.SheetNames.find(n => n.toLowerCase().includes('cadastro') || n.toLowerCase().includes('estat'))
      if (!wsName) { setErro('Aba "Cadastro & Estatística" não encontrada.'); return }
      const dados = parseEstatistica(wb.Sheets[wsName] as WS)
      if (!dados.nome_igreja) { setErro('Nome da igreja não encontrado na planilha.'); return }
      autoMatch(dados.nome_igreja)
      setPreviewE(dados)
      setAba('estatistica')
    } catch { setErro('Erro ao ler a planilha.') }
    if (fileEstatRef.current) fileEstatRef.current.value = ''
  }

  async function salvarConselho() {
    if (!previewC || !igrejaSel) return
    setSalvando(true); setErro('')
    const { data, error } = await supabase.from('relatorios_conselho').upsert({
      igreja_id: igrejaSel,
      nome_igreja: previewC.nome_igreja,
      ano: previewC.ano,
      supervisao_espiritual: previewC.supervisao_espiritual,
      supervisao_administrativa: previewC.supervisao_administrativa,
      planejamento_alcancado: previewC.planejamento_alcancado || null,
      planejamento_nao_alcancado: previewC.planejamento_nao_alcancado || null,
      status: 'submetido',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'igreja_id,ano' }).select().single()
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setPreviewC(null)
    if (data) setConselho(prev => [data as RelConselho, ...prev.filter(r => !(r.igreja_id === igrejaSel && r.ano === previewC.ano))])
    router.refresh()
  }

  async function salvarEstatistica() {
    if (!previewE || !igrejaSel) return
    setSalvando(true); setErro('')
    const { data, error } = await supabase.from('relatorios_estatistica').upsert({
      igreja_id: igrejaSel,
      nome_igreja: previewE.nome_igreja,
      ano: previewE.ano,
      lideranca: previewE.lideranca,
      estrutura: previewE.estrutura,
      rol_comungantes: previewE.rol_comungantes,
      rol_nao_comungantes: previewE.rol_nao_comungantes,
      financeiro: previewE.financeiro,
      status: 'submetido',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'igreja_id,ano' }).select().single()
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setPreviewE(null)
    if (data) setEstatistica(prev => [data as RelEstatistica, ...prev.filter(r => !(r.igreja_id === igrejaSel && r.ano === previewE.ano))])
    router.refresh()
  }

  const dadosAtivos = aba === 'conselho'
    ? (anoFiltro ? conselho.filter(r => r.ano === anoFiltro) : conselho)
    : (anoFiltro ? estatistica.filter(r => r.ano === anoFiltro) : estatistica)

  const porAno: Record<number, (RelConselho | RelEstatistica)[]> = {}
  for (const r of dadosAtivos) {
    if (!porAno[r.ano]) porAno[r.ano] = []
    porAno[r.ano].push(r)
  }
  const anosExibidos = Object.keys(porAno).map(Number).sort((a, b) => b - a)

  const IgrejaSeletor = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="col-span-2">
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        Igreja no cadastro <span className="text-red-500">*</span>
      </label>
      <select
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-200"
        value={value} onChange={e => onChange(e.target.value)}
      >
        <option value="">Selecione a igreja...</option>
        {igrejas.map(i => <option key={i.id} value={i.id}>{i.nome}{i.sigla ? ` (${i.sigla})` : ''}</option>)}
      </select>
      {!value && <p className="text-xs text-amber-600 mt-1">Obrigatório vincular ao cadastro antes de salvar.</p>}
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios das Igrejas</h1>
          <p className="text-gray-500 text-sm mt-1">Conselho/Mesa e Cadastro & Estatística (modelo IPB)</p>
        </div>
        <div className="flex items-center gap-3">
          {anos.length > 0 && (
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
              value={anoFiltro ?? ''} onChange={e => setAnoFiltro(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Todos os anos</option>
              {anos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          )}
          <button onClick={() => fileConselhoRef.current?.click()}
            className="px-3 py-2 rounded-lg text-sm font-semibold border"
            style={{ color: '#1B3A6B', borderColor: '#1B3A6B' }}>
            + Conselho/Mesa
          </button>
          <button onClick={() => fileEstatRef.current?.click()}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#1B3A6B' }}>
            + Cadastro & Estatística
          </button>
          <input ref={fileConselhoRef} type="file" accept=".xls,.xlsx,.xlt" className="hidden" onChange={handleFileConselho} />
          <input ref={fileEstatRef} type="file" accept=".xls,.xlsx,.xlt" className="hidden" onChange={handleFileEstat} />
        </div>
      </div>

      {erro && <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{erro}</div>}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {([['conselho', 'Conselho / Mesa', anosC.length], ['estatistica', 'Cadastro & Estatística', anosE.length]] as const).map(([key, label, count]) => (
          <button key={key} onClick={() => setAba(key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${aba === key ? 'text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            style={aba === key ? { borderBottomColor: '#1B3A6B' } : {}}>
            {label} {count > 0 && <span className="ml-1 text-xs text-gray-400">({count})</span>}
          </button>
        ))}
      </div>

      {/* Modal: prévia Conselho */}
      {previewC && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Confirmar — Conselho/Mesa</h2>
              <button onClick={() => setPreviewC(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-xs text-gray-400 mb-1">Igreja (planilha)</div>
                  <div className="font-semibold text-gray-900">{previewC.nome_igreja}</div></div>
                <div><div className="text-xs text-gray-400 mb-1">Ano</div>
                  <div className="font-semibold text-gray-900">{previewC.ano}</div></div>
                <IgrejaSeletor value={igrejaSel} onChange={setIgrejaSel} />
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">Supervisão Espiritual</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['Santa Ceia (total)', previewC.supervisao_espiritual.santa_ceia_total],
                  ['Atos evangelísticos', previewC.supervisao_espiritual.atividades_evangelisticas],
                  ['Textos distribuídos', previewC.supervisao_espiritual.textos_total],
                  ['Atos beneficentes', previewC.supervisao_espiritual.atos_beneficentes_total],
                  ['Visitas', previewC.supervisao_espiritual.visitas_total],
                ].map(([l, v]) => v ? (
                  <div key={l as string} className="flex justify-between px-3 py-1.5 bg-gray-50 rounded">
                    <span className="text-gray-600">{l as string}</span>
                    <span className="font-semibold">{v as number}</span>
                  </div>
                ) : null)}
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reuniões</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['Conselho', previewC.supervisao_administrativa.reunioes_conselho],
                  ['Junta Diaconal', previewC.supervisao_administrativa.reunioes_junta_diaconal],
                  ['Assembleia Geral', previewC.supervisao_administrativa.reunioes_assembleia_geral],
                ].map(([l, v]) => v ? (
                  <div key={l as string} className="flex justify-between px-3 py-1.5 bg-gray-50 rounded">
                    <span className="text-gray-600">{l as string}</span>
                    <span className="font-semibold">{v as number}</span>
                  </div>
                ) : null)}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button onClick={() => setPreviewC(null)} className="flex-1 py-2.5 rounded-md text-sm font-medium border border-gray-200 text-gray-600">Cancelar</button>
              <button onClick={salvarConselho} disabled={salvando || !igrejaSel}
                className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#1B3A6B' }}>
                {salvando ? 'Salvando...' : 'Confirmar e salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: prévia Cadastro & Estatística */}
      {previewE && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Confirmar — Cadastro & Estatística</h2>
              <button onClick={() => setPreviewE(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-xs text-gray-400 mb-1">Igreja (planilha)</div>
                  <div className="font-semibold text-gray-900">{previewE.nome_igreja}</div></div>
                <div><div className="text-xs text-gray-400 mb-1">Ano</div>
                  <div className="font-semibold text-gray-900">{previewE.ano}</div></div>
                <IgrejaSeletor value={igrejaSel} onChange={setIgrejaSel} />
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Liderança</div>
              <div className="grid grid-cols-3 gap-2 text-sm text-center">
                {[['Pastores', previewE.lideranca.pastores], ['Presbíteros', previewE.lideranca.presbiteros], ['Diáconos', previewE.lideranca.diaconos]].map(([l, v]) => (
                  <div key={l as string} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900">{v as number}</div>
                    <div className="text-xs text-gray-500">{l as string}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol de Membros</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['Comungantes atual', previewE.rol_comungantes.rol_atual],
                  ['Não-comungantes atual', previewE.rol_nao_comungantes.rol_atual],
                ].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between px-3 py-1.5 bg-gray-50 rounded">
                    <span className="text-gray-600">{l as string}</span>
                    <span className="font-semibold">{v as number}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Financeiro</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['Total Receitas', previewE.financeiro.total_receita],
                  ['Total Despesas', previewE.financeiro.total_despesa],
                  ['Saldo', previewE.financeiro.saldo_seguinte],
                ].map(([l, v]) => v ? (
                  <div key={l as string} className="flex justify-between px-3 py-1.5 bg-gray-50 rounded">
                    <span className="text-gray-600">{l as string}</span>
                    <span className="font-semibold">R$ {(v as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ) : null)}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button onClick={() => setPreviewE(null)} className="flex-1 py-2.5 rounded-md text-sm font-medium border border-gray-200 text-gray-600">Cancelar</button>
              <button onClick={salvarEstatistica} disabled={salvando || !igrejaSel}
                className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#1B3A6B' }}>
                {salvando ? 'Salvando...' : 'Confirmar e salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      {anosExibidos.length === 0 ? (
        <div className="card text-center text-gray-400 py-16">
          <div className="text-4xl mb-3">📊</div>
          <div className="font-medium text-gray-500">Nenhum relatório importado</div>
          <div className="text-sm text-gray-400 mt-1">Use os botões acima para importar</div>
        </div>
      ) : anosExibidos.map(ano => (
        <div key={ano} className="mb-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">{ano}</h2>
          <div className="card p-0 overflow-hidden">
            <table className="table-pssp">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Igreja</th>
                  <th>Enviado em</th>
                  <th>Status</th>
                  <th style={{ paddingRight: 20 }}></th>
                </tr>
              </thead>
              <tbody>
                {porAno[ano].map(r => {
                  const st = STATUS_MAP[r.status] ?? { label: r.status, cls: 'badge-gray' }
                  const base = aba === 'conselho' ? '/relatorios/igrejas/conselho' : '/relatorios/igrejas/estatistica'
                  return (
                    <tr key={r.id}>
                      <td style={{ paddingLeft: 20 }}>
                        <div className="font-medium text-gray-900">{r.nome_igreja}</div>
                      </td>
                      <td className="text-gray-500 text-sm">{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td style={{ paddingRight: 20 }}>
                        <a href={`${base}/${r.id}`}
                          className="text-xs font-medium px-3 py-1.5 rounded-md border"
                          style={{ color: '#1B3A6B', borderColor: '#1B3A6B' }}>
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

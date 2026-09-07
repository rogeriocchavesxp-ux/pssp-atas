'use client'
import { useState, forwardRef, useImperativeHandle } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Ata, Reuniao, AtaConteudo } from '@/types/database'
import type { DocAta } from './page'

export type AtaEditorHandle = {
  inserirNaAta: (doc: DocAta) => void
}

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let r = ''
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i] }
  }
  return r
}

function codigoTipoReuniao(tipo: string): string {
  if (tipo === 'extraordinaria') return 'E'
  if (tipo === 'solene') return 'S'
  if (tipo === 'administrativa') return 'A'
  return 'O'
}

function gerarTextoResolucao(doc: DocAta, reuniao: Reuniao): string {
  const res = doc.resolucao
  const com = doc.comissao
  if (!res || !com) return ''

  const ano = new Date(reuniao.data_inicio).getFullYear()
  const tipo = codigoTipoReuniao(reuniao.tipo)
  const codigoReuniao = `PSSP-${tipo} ${ano}`
  const nomeComissao = com.nome ?? 'Plenário'

  const cabecalho = `COMISSÃO ${toRoman(com.numero)} - ${nomeComissao} - ${codigoReuniao} - DOC.${toRoman(res.numero)}`

  const partes: string[] = [
    `Quanto ao documento ${String(doc.numero).padStart(3, '0')}`,
    doc.oriundo ? `- Oriundo do(a): ${doc.oriundo}` : '',
    `- Ementa: ${doc.assunto}.`,
  ].filter(Boolean)

  if (doc.conteudo?.trim()) {
    partes.push(`\nConsiderando: ${doc.conteudo.trim()}`)
  }

  // Remove prefixos legados ("O PSSP RESOLVE:", "O PSSP-O - 2026 Resolve:" etc.) que
  // o usuário possa ter digitado na proposta antes de existir geração automática
  const proposta = (doc.proposta?.trim() ?? '').replace(/^O PSSP[^:]*:\s*/i, '')
  partes.push(`\nO PSSP-${tipo} - ${ano} Resolve:\n${proposta}`)

  return `${cabecalho}\n${partes.join(' ')}`
}

const PLACEHOLDER_VERIFICACAO = `ATA DO ATO DE VERIFICAÇÃO DE PODERES DA [Nº] REUNIÃO [ORDINÁRIA/EXTRAORDINÁRIA] DO PRESBITÉRIO LESTE DE SÃO PAULO - PSSP

Às [HORA], do dia [DATA POR EXTENSO], na [LOCAL], reúne-se, previamente convocado, o Presbitério Leste de São Paulo - PSSP.

Composição da Mesa: Reverendo Amauri Costa de Oliveira, Presidente; Reverendo Fábio Luiz de Carvalho, Vice-presidente; Presbítero Anízio Alves Borges, Secretário Executivo; Reverendo Laércio Máximo Rodrigues, 1º Secretário; Reverendo Rogério de Castro Chaves, 2º Secretário; e Reverendo Atsushi Miyajima, Tesoureiro.

Feita a chamada pelo Secretário Executivo, registram-se a presença dos seguintes ministros:
[LISTA DE MINISTROS PRESENTES]

Todos os presentes assinaram o Livro de Presença do Concílio.

Ausentaram-se os seguintes ministros:
[LISTA DE AUSENTES]

Registram-se a presença das seguintes igrejas, por meio de seus representantes:
[IGREJAS E REPRESENTANTES PRESENTES]

Ausentes os representantes das Igrejas:
[IGREJAS AUSENTES]

Havendo quórum, às [HORA], o Presidente, Rev. Amauri Costa de Oliveira, declara instalada a [Nº] Reunião do Presbitério Leste de São Paulo - PSSP.

Às [HORA], encerra-se a sessão de verificação de poderes com oração feita pelo Rev. [QUEM].

E para constar eu, Rev. Rogério de Castro Chaves, 2º Secretário, a tudo presente, digito, dato e assino a presente ATA, a qual será transcrita pelo Secretário Executivo, Presb. Anízio Alves Borges, em livro próprio.

São Paulo, [DATA].`

const PLACEHOLDER_PREPARATORIA = `ATA DA SESSÃO PREPARATÓRIA DA [Nº] REUNIÃO [ORDINÁRIA/EXTRAORDINÁRIA] DO PRESBITÉRIO LESTE DE SÃO PAULO - PSSP

Aos [DATA POR EXTENSO], às [HORA], passa-se ao exercício devocional.

Entoam-se os cânticos [CÂNTICOS], conduzidos pelo Rev. [QUEM].

Em seguida, o Rev. [QUEM] ora ao Senhor, [DESCRIÇÃO DA ORAÇÃO].

O Rev. [QUEM] faz a leitura do texto bíblico de [REFERÊNCIA BÍBLICA] e ministra sob o tema: "[TEMA]", fundamentando a mensagem nos seguintes argumentos:
1) [ARGUMENTO 1];
2) [ARGUMENTO 2]; e
3) [ARGUMENTO 3].

Às [HORA], encerra-se o exercício devocional com oração feita pelo Rev. [QUEM].

E para constar eu, Rev. Rogério de Castro Chaves, 2º Secretário, a tudo presente, redijo, datilho e assino a presente ata, a qual será transcrita pelo Secretário Executivo, Presb. Anízio Alves Borges.

São Paulo, [DATA].`

function placeholderRegular(n: number) {
  const ordinal = ['Única', '1ª', '2ª', '3ª', '4ª', '5ª'][n] ?? `${n}ª`
  return `ATA DA SESSÃO REGULAR ${ordinal} DA [Nº] REUNIÃO [ORDINÁRIA/EXTRAORDINÁRIA] DO PRESBITÉRIO LESTE DE SÃO PAULO - PSSP

Às [HORA], sob a presidência do Rev. Amauri Costa de Oliveira, inicia-se a sessão regular ${ordinal.toLowerCase()}.

O Rev. [QUEM] ora ao Senhor, [DESCRIÇÃO].

Doc. 01, [DESCRIÇÃO DO DOCUMENTO].
[DELIBERAÇÃO — ex.: "Toma-se conhecimento e arquiva-se." ou "Após deliberação, o PSSP resolve..."]

Doc. 02, [DESCRIÇÃO DO DOCUMENTO].
[DELIBERAÇÃO]

Encerra-se a reunião às [HORA], com a oração do Rev. [QUEM].

E para constar eu, Rev. Rogério de Castro Chaves, 2º Secretário, a tudo presente, digito, dato e assino a presente ata, a qual será transcrita pelo Secretário Executivo, Presb. Anízio Alves Borges, em livro próprio.

São Paulo, [DATA].`
}

function labelRegular(idx: number, total: number): string {
  if (total === 1) return 'Sessão Regular'
  return `${idx + 1}ª Sessão Regular`
}

const CONTEUDO_VAZIO: AtaConteudo = {
  verificacao_poderes: '',
  sessao_preparatoria: '',
  sessoes_regulares: [''],
  observacoes: '',
}

function migrar(raw: Record<string, unknown>): AtaConteudo {
  if (Array.isArray(raw.sessoes_regulares)) return raw as unknown as AtaConteudo
  // dados antigos com sessao_regular (string) ou abertura/pauta
  const antiga = (raw.sessao_regular as string | undefined)
    ?? [raw.pauta, raw.deliberacoes, raw.encerramento].filter(Boolean).join('\n\n')
  const verificacao_poderes = (raw.verificacao_poderes as string)
    ?? [raw.abertura, raw.verificacao_quorum].filter(Boolean).join('\n\n')
  return {
    verificacao_poderes: verificacao_poderes ?? '',
    sessao_preparatoria: (raw.sessao_preparatoria as string) ?? '',
    sessoes_regulares: [antiga ?? ''],
    observacoes: (raw.observacoes as string) ?? '',
  }
}

type Tab =
  | { kind: 'verificacao' }
  | { kind: 'preparatoria' }
  | { kind: 'regular'; idx: number }
  | { kind: 'obs' }

export const AtaEditor = forwardRef<AtaEditorHandle, { reuniaoId: string; ata: Ata | null; reuniao: Reuniao }>(
function AtaEditorInner({ reuniaoId, ata, reuniao }, ref) {
  const router = useRouter()
  const supabase = createClient()
  const [conteudo, setConteudo] = useState<AtaConteudo>(
    ata ? migrar(ata.conteudo as unknown as Record<string, unknown>) : CONTEUDO_VAZIO
  )
  const [tab, setTab] = useState<Tab>({ kind: 'verificacao' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function markDirty() { setSaved(false) }

  function setFixo(key: 'verificacao_poderes' | 'sessao_preparatoria' | 'observacoes', value: string) {
    setConteudo(prev => ({ ...prev, [key]: value }))
    markDirty()
  }

  function setRegular(idx: number, value: string) {
    setConteudo(prev => {
      const nova = [...prev.sessoes_regulares]
      nova[idx] = value
      return { ...prev, sessoes_regulares: nova }
    })
    markDirty()
  }

  function adicionarSessao() {
    setConteudo(prev => ({ ...prev, sessoes_regulares: [...prev.sessoes_regulares, ''] }))
    setTab({ kind: 'regular', idx: conteudo.sessoes_regulares.length })
  }

  function removerSessao(idx: number) {
    if (conteudo.sessoes_regulares.length <= 1) return
    setConteudo(prev => {
      const nova = prev.sessoes_regulares.filter((_, i) => i !== idx)
      return { ...prev, sessoes_regulares: nova }
    })
    const novoIdx = Math.max(0, idx - 1)
    setTab({ kind: 'regular', idx: novoIdx })
    markDirty()
  }

  async function salvar() {
    setSaving(true)
    if (ata) {
      await supabase.from('atas').update({ conteudo }).eq('id', ata.id)
    } else {
      await supabase.from('atas').insert({ reuniao_id: reuniaoId, conteudo, status: 'rascunho' })
    }
    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  function inserirNaAta(doc: DocAta) {
    const texto = gerarTextoResolucao(doc, reuniao)
    if (!texto) return
    const idx = tab.kind === 'regular' ? tab.idx : 0
    setRegular(idx, (conteudo.sessoes_regulares[idx] ?? '').trimEnd() + '\n\n' + texto + '\n')
    if (tab.kind !== 'regular') setTab({ kind: 'regular', idx: 0 })
  }

  useImperativeHandle(ref, () => ({ inserirNaAta }), [tab, conteudo, reuniao])

  const total = conteudo.sessoes_regulares.length

  // valor e placeholder da aba ativa
  let valor = ''
  let placeholder = ''
  let descricao = ''
  let titulo = ''

  if (tab.kind === 'verificacao') {
    valor = conteudo.verificacao_poderes
    placeholder = PLACEHOLDER_VERIFICACAO
    titulo = 'ATA DO ATO DE VERIFICAÇÃO DE PODERES'
    descricao = 'Composição da mesa, chamada, quórum'
  } else if (tab.kind === 'preparatoria') {
    valor = conteudo.sessao_preparatoria
    placeholder = PLACEHOLDER_PREPARATORIA
    titulo = 'ATA DA SESSÃO PREPARATÓRIA'
    descricao = 'Devocional, cânticos, oração, mensagem bíblica'
  } else if (tab.kind === 'regular') {
    valor = conteudo.sessoes_regulares[tab.idx] ?? ''
    placeholder = placeholderRegular(total === 1 ? 0 : tab.idx + 1)
    titulo = total === 1 ? 'ATA DA SESSÃO REGULAR' : `ATA DA ${tab.idx + 1}ª SESSÃO REGULAR`
    descricao = 'Documentos, deliberações, encerramento'
  } else {
    valor = conteudo.observacoes ?? ''
    placeholder = 'Registros adicionais, notas para revisão, pendências...'
    titulo = 'Observações'
    descricao = ''
  }

  function onChange(v: string) {
    if (tab.kind === 'verificacao') setFixo('verificacao_poderes', v)
    else if (tab.kind === 'preparatoria') setFixo('sessao_preparatoria', v)
    else if (tab.kind === 'regular') setRegular(tab.idx, v)
    else setFixo('observacoes', v)
  }

  function preenchida(t: Tab): boolean {
    if (t.kind === 'verificacao') return conteudo.verificacao_poderes.trim().length > 0
    if (t.kind === 'preparatoria') return conteudo.sessao_preparatoria.trim().length > 0
    if (t.kind === 'regular') return (conteudo.sessoes_regulares[t.idx] ?? '').trim().length > 0
    return false
  }

  function tabAtiva(t: Tab): boolean {
    if (t.kind !== tab.kind) return false
    if (t.kind === 'regular' && tab.kind === 'regular') return t.idx === tab.idx
    return true
  }

  const cls = (t: Tab) =>
    `px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
      tabAtiva(t)
        ? 'border-b-2 text-gray-900'
        : 'border-transparent text-gray-400 hover:text-gray-600'
    }`

  const preenchimentoCount = [
    conteudo.verificacao_poderes.trim().length > 0,
    conteudo.sessao_preparatoria.trim().length > 0,
    ...conteudo.sessoes_regulares.map(s => s.trim().length > 0),
  ].filter(Boolean).length
  const totalSecoes = 2 + conteudo.sessoes_regulares.length

  return (
    <div className="card p-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto items-center">
        {/* Verificação */}
        <button
          onClick={() => setTab({ kind: 'verificacao' })}
          className={cls({ kind: 'verificacao' })}
          style={tabAtiva({ kind: 'verificacao' }) ? { borderBottomColor: '#1B3A6B' } : {}}
        >
          {preenchida({ kind: 'verificacao' }) && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
          Verif. Poderes
        </button>

        {/* Preparatória */}
        <button
          onClick={() => setTab({ kind: 'preparatoria' })}
          className={cls({ kind: 'preparatoria' })}
          style={tabAtiva({ kind: 'preparatoria' }) ? { borderBottomColor: '#1B3A6B' } : {}}
        >
          {preenchida({ kind: 'preparatoria' }) && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
          Preparatória
        </button>

        {/* Sessões regulares */}
        {conteudo.sessoes_regulares.map((_, idx) => {
          const t: Tab = { kind: 'regular', idx }
          return (
            <div key={idx} className="flex items-center">
              <button
                onClick={() => setTab(t)}
                className={cls(t)}
                style={tabAtiva(t) ? { borderBottomColor: '#1B3A6B' } : {}}
              >
                {preenchida(t) && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
                {labelRegular(idx, total)}
              </button>
              {total > 1 && (
                <button
                  onClick={() => removerSessao(idx)}
                  title="Remover sessão"
                  className="px-1 text-gray-300 hover:text-red-400 text-xs leading-none mt-0.5"
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}

        {/* + Nova sessão */}
        <button
          onClick={adicionarSessao}
          title="Adicionar sessão regular"
          className="px-3 py-3 text-xs text-gray-400 hover:text-gray-700 border-transparent border-b-2 whitespace-nowrap transition-colors"
        >
          + Sessão
        </button>

        {/* Observações */}
        <button
          onClick={() => setTab({ kind: 'obs' })}
          className={cls({ kind: 'obs' })}
          style={tabAtiva({ kind: 'obs' }) ? { borderBottomColor: '#1B3A6B' } : {}}
        >
          Obs.
        </button>
      </div>

      {/* Editor */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{titulo}</h3>
            {descricao && <p className="text-xs text-gray-400 mt-0.5">{descricao}</p>}
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-green-500">Salvo</span>}
            <button
              onClick={salvar}
              disabled={saving}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-60"
              style={{ background: '#1B3A6B' }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
        <textarea
          value={valor}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={20}
          className="w-full text-sm text-gray-800 leading-relaxed resize-none focus:outline-none font-mono"
          style={{ fontFamily: 'ui-monospace, "Courier New", monospace', fontSize: 13 }}
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {ata
            ? `Última atualização: ${new Date(ata.updated_at).toLocaleString('pt-BR')}`
            : 'Ata não iniciada'}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{preenchimentoCount}/{totalSecoes} seções preenchidas</span>
          <div className="flex items-center gap-1">
            {[
              { t: { kind: 'verificacao' } as Tab, label: 'VP' },
              { t: { kind: 'preparatoria' } as Tab, label: 'SP' },
              ...conteudo.sessoes_regulares.map((_, i) => ({ t: { kind: 'regular', idx: i } as Tab, label: `SR${i + 1}` })),
            ].map(({ t, label }) => (
              <div
                key={label}
                title={label}
                className={`w-2 h-2 rounded-full ${preenchida(t) ? 'bg-green-400' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

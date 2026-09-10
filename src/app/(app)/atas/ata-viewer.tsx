'use client'
import { useEffect, useRef } from 'react'

interface AtaConteudo {
  verificacao_poderes: string
  sessao_preparatoria: string
  sessoes_regulares: string[]
  observacoes?: string
}

interface AtaViewerProps {
  conteudo: AtaConteudo
  reuniao: { numero: string; data_inicio: string } | null
  onClose: () => void
}

const LINHAS_POR_PAGINA = 51
const LINHA_TRACEJADA = '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'

function secoes(conteudo: AtaConteudo): string {
  const partes: string[] = []
  if (conteudo.verificacao_poderes?.trim())
    partes.push(conteudo.verificacao_poderes.trim())
  if (conteudo.sessao_preparatoria?.trim())
    partes.push(conteudo.sessao_preparatoria.trim())
  conteudo.sessoes_regulares?.forEach(s => {
    if (s?.trim()) partes.push(s.trim())
  })
  if (conteudo.observacoes?.trim())
    partes.push('ANOTAÇÕES ' + conteudo.observacoes.trim())
  return partes.join(LINHA_TRACEJADA)
}

const CHARS_POR_LINHA = 80

function visualLen(s: string): number {
  let len = 0, inBold = false, i = 0
  while (i < s.length) {
    if (s[i] === '*' && s[i + 1] === '*') { inBold = !inBold; i += 2 }
    else if (s[i] === '_') { i++ }
    else { len += inBold ? 1.15 : 1; i++ }
  }
  return Math.ceil(len)
}

function wrapLinhas(texto: string): string[] {
  const resultado: string[] = []
  // Separadores de seção são tratados como tokens especiais (não quebrados)
  const blocos = texto.split(LINHA_TRACEJADA)
  for (let bi = 0; bi < blocos.length; bi++) {
    const palavras = blocos[bi].split(/\s+/).filter(Boolean)
    let linha = ''
    for (const palavra of palavras) {
      const candidato = linha ? `${linha} ${palavra}` : palavra
      if (visualLen(candidato) <= CHARS_POR_LINHA) {
        linha = candidato
      } else {
        if (linha) {
          const boldAberto = ((linha.match(/\*\*/g) || []).length % 2) !== 0
          resultado.push(boldAberto ? linha + '**' : linha)
          linha = (boldAberto ? '**' : '') + palavra
        } else {
          linha = palavra
        }
      }
    }
    if (linha) resultado.push(linha)
    if (bi < blocos.length - 1) resultado.push(LINHA_TRACEJADA)
  }
  return resultado
}

function renderLinha(texto: string): React.ReactNode {
  const partes = texto.split(/(\*\*[^*]*\*\*)/)
  if (partes.length === 1) return texto
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : p
      )}
    </>
  )
}

function paginar(linhasConteudo: string[]): string[][] {
  const paginas: string[][] = []
  let inicio = 0
  while (inicio < linhasConteudo.length) {
    paginas.push(linhasConteudo.slice(inicio, inicio + LINHAS_POR_PAGINA))
    inicio += LINHAS_POR_PAGINA
  }
  // Preenche última página com tracejado
  if (paginas.length > 0) {
    const ultima = paginas[paginas.length - 1]
    while (ultima.length < LINHAS_POR_PAGINA) {
      ultima.push(LINHA_TRACEJADA)
    }
  }
  // Se nenhuma página, cria uma vazia com tracejado
  if (paginas.length === 0) {
    paginas.push(Array(LINHAS_POR_PAGINA).fill(LINHA_TRACEJADA))
  }
  return paginas
}

const estiloDoc: React.CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '11pt',
  lineHeight: '1.42',
  color: '#000',
  background: '#fff',
}

const estiloNumLinha: React.CSSProperties = {
  width: '2.4em',
  textAlign: 'right',
  paddingRight: '0.7em',
  verticalAlign: 'top',
  color: '#666',
  fontSize: '9pt',
  fontFamily: 'Arial, sans-serif',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  lineHeight: '1.42',
}

const estiloTextoLinha: React.CSSProperties = {
  textAlign: 'justify',
  textAlignLast: 'justify',
  lineHeight: '1.42',
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
}

const estiloTracejado: React.CSSProperties = {
  ...estiloTextoLinha,
  textAlignLast: 'left',
  color: '#555',
  letterSpacing: '0.5px',
  overflow: 'hidden',
}

interface PaginaAtaProps {
  linhas: string[]
  numeroPagina: number
  offsetLinha: number
}

function PaginaAta({ linhas, numeroPagina, offsetLinha }: PaginaAtaProps) {
  return (
    <div style={{
      ...estiloDoc,
      padding: '1.4cm 2cm 1.4cm 1.8cm',
      maxWidth: '21cm',
      minHeight: '29.7cm',
      margin: '0 auto',
      position: 'relative',
      pageBreakAfter: 'always',
    }}>
      {/* Número de página */}
      <div style={{
        position: 'absolute',
        top: '0.7cm',
        right: '2cm',
        fontSize: '11pt',
        fontFamily: 'Arial, sans-serif',
      }}>
        {numeroPagina}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginTop: '0.4cm' }}>
        <colgroup>
          <col style={{ width: '2.4em' }} />
          <col />
        </colgroup>
        <tbody>
          {linhas.map((linha, i) => {
            const numLinha = offsetLinha + i + 1
            const ehTracejado = linha === LINHA_TRACEJADA
            return (
              <tr key={i}>
                <td style={estiloNumLinha}>{numLinha}</td>
                <td style={ehTracejado ? estiloTracejado : estiloTextoLinha} {...(ehTracejado ? { 'data-tracejado': '' } : {})}>
                  {ehTracejado ? linha : renderLinha(linha)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function DocumentoAta({ conteudo }: { conteudo: AtaConteudo }) {
  const texto = secoes(conteudo)
  const linhasConteudo = wrapLinhas(texto)
  const paginas = paginar(linhasConteudo)

  return (
    <div id="ata-documento">
      {paginas.map((linhas, pi) => (
        <div key={pi} style={{ marginBottom: pi < paginas.length - 1 ? '12px' : 0 }}>
          <PaginaAta
            linhas={linhas}
            numeroPagina={pi + 1}
            offsetLinha={pi * LINHAS_POR_PAGINA}
          />
        </div>
      ))}
    </div>
  )
}

export function AtaViewer({ conteudo, reuniao, onClose }: AtaViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function imprimir() {
    const ataHtml = document.getElementById('ata-documento')?.innerHTML ?? ''
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fff; }
  table { border-collapse: collapse; table-layout: fixed; }
  td { white-space: nowrap; line-height: 1.42; font-family: Arial, sans-serif; font-size: 11pt; vertical-align: top; }
  td[data-tracejado] { overflow: hidden; color: #555; }
  strong { font-weight: bold; }
  em { font-style: italic; }
  u { text-decoration: underline; }
  @page { size: A4; margin: 0; }
  @media print { body { -webkit-print-color-adjust: exact; } }
</style>
</head><body>${ataHtml}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div>
          <span className="text-sm font-semibold text-gray-900">
            Ata — {reuniao?.numero ?? ''}
          </span>
          {reuniao && (
            <span className="text-xs text-gray-400 ml-3">
              {new Date(reuniao.data_inicio).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={imprimir}
            className="px-4 py-1.5 rounded-md text-sm font-semibold text-white"
            style={{ background: '#1B3A6B' }}
          >
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg leading-none px-1"
            title="Fechar"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ background: '#6b7280' }}>
        <div className="py-8">
          <DocumentoAta conteudo={conteudo} />
        </div>
      </div>
    </div>
  )
}

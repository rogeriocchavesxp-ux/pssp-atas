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

function secoes(conteudo: AtaConteudo): { titulo: string; texto: string }[] {
  const result = []
  if (conteudo.verificacao_poderes?.trim())
    result.push({ titulo: '', texto: conteudo.verificacao_poderes.trim() })
  if (conteudo.sessao_preparatoria?.trim())
    result.push({ titulo: '', texto: conteudo.sessao_preparatoria.trim() })
  conteudo.sessoes_regulares?.forEach(s => {
    if (s?.trim()) result.push({ titulo: '', texto: s.trim() })
  })
  if (conteudo.observacoes?.trim())
    result.push({ titulo: 'ANOTAÇÕES', texto: conteudo.observacoes.trim() })
  return result
}

function DocumentoAta({ conteudo }: { conteudo: AtaConteudo }) {
  const secs = secoes(conteudo)
  // Concatena todo o texto com separador entre seções
  const textoCompleto = secs.map(s =>
    s.titulo ? `${s.titulo}\n\n${s.texto}` : s.texto
  ).join('\n\n\n')

  const linhas = textoCompleto.split('\n')

  return (
    <div id="ata-documento" style={{
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      lineHeight: '1.8',
      color: '#000',
      background: '#fff',
      padding: '2cm 2.5cm 2cm 3cm',
      maxWidth: '21cm',
      margin: '0 auto',
      minHeight: '29.7cm',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {linhas.map((linha, i) => {
            const num = i + 1
            const mostrarNum = num % 5 === 0 || num === 1
            return (
              <tr key={i}>
                <td style={{
                  width: '2.5em',
                  textAlign: 'right',
                  paddingRight: '1em',
                  verticalAlign: 'top',
                  color: mostrarNum ? '#555' : 'transparent',
                  fontSize: '9pt',
                  fontFamily: 'Arial, sans-serif',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.8',
                }}>
                  {mostrarNum ? num : ' '}
                </td>
                <td style={{
                  textAlign: linha.trim() === '' ? 'left' : 'justify',
                  lineHeight: '1.8',
                  verticalAlign: 'top',
                  wordBreak: 'break-word',
                }}>
                  {linha || ' '}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
    const conteudoDoc = document.getElementById('ata-documento')?.innerHTML ?? ''
    const janela = window.open('', '_blank', 'width=900,height=700')
    if (!janela) return
    janela.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Ata ${reuniao?.numero ?? ''}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #000;
      background: #fff;
    }
    #wrapper {
      padding: 2cm 2.5cm 2cm 3cm;
      max-width: 21cm;
      margin: 0 auto;
    }
    table { width: 100%; border-collapse: collapse; }
    td { vertical-align: top; line-height: 1.8; }
    @page { size: A4; margin: 0; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div id="wrapper">${conteudoDoc}</div>
  <script>window.onload = function(){ window.print(); window.close(); }<\/script>
</body>
</html>`)
    janela.document.close()
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Barra superior */}
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

      {/* Documento */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#e5e7eb' }}>
        <div className="py-8">
          <div style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: '21cm', margin: '0 auto' }}>
            <DocumentoAta conteudo={conteudo} />
          </div>
        </div>
      </div>
    </div>
  )
}

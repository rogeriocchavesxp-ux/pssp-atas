'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Comissao } from '@/types/database'

const TIPOS_DOC = [
  'Convocação',
  'Credencial',
  'Solicitação de Campo Pastoral',
  'Distribuição de Campo Ministerial',
  'Solicitação de Obreiro',
  'Renovação de Cessão',
  'Manutenção de Candidatura',
  'Relatório Pastoral',
  'Relatório de Igreja / Congregação',
  'Plantação de Igreja',
  'Solicitação de Transferência',
  'Resultado Financeiro',
  'Atas do Conselho',
  'Projeto de Resolução',
  'Informe',
  'Outros',
]

export function EmentaForm({
  reuniaoId,
  nextNumero,
  comissoes,
}: {
  reuniaoId: string
  nextNumero: number
  comissoes: Comissao[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [form, setForm] = useState({
    numero: nextNumero,
    assunto: '',
    oriundo: '',
    tipo: '',
    comissao_id: '',
  })
  const [arquivo, setArquivo] = useState<File | null>(null)

  function set(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.assunto.trim()) return
    setLoading(true)
    setUploadProgress('')

    let pdf_url: string | null = null

    if (arquivo) {
      setUploadProgress('Enviando arquivo...')
      const ext = arquivo.name.split('.').pop()
      const path = `reunioes/${reuniaoId}/doc-${form.numero}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(path, arquivo, { upsert: false })

      if (uploadError) {
        setUploadProgress(`Erro ao enviar: ${uploadError.message}`)
        setLoading(false)
        return
      }
      pdf_url = path
      setUploadProgress('')
    }

    await supabase.from('documentos').insert({
      reuniao_id: reuniaoId,
      numero: form.numero,
      assunto: form.assunto.trim(),
      oriundo: form.oriundo.trim() || null,
      tipo: form.tipo || null,
      comissao_id: form.comissao_id || null,
      pdf_url,
      status: 'recebido',
    })

    router.refresh()
    setArquivo(null)
    if (fileRef.current) fileRef.current.value = ''
    setForm(prev => ({
      ...prev,
      numero: prev.numero + 1,
      assunto: '',
      oriundo: '',
      tipo: '',
      comissao_id: '',
    }))
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Número</label>
          <input
            type="number"
            value={form.numero}
            onChange={e => set('numero', parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select
            value={form.tipo}
            onChange={e => set('tipo', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 bg-white"
          >
            <option value="">Selecione...</option>
            {TIPOS_DOC.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Assunto *</label>
        <textarea
          value={form.assunto}
          onChange={e => set('assunto', e.target.value)}
          rows={3}
          placeholder="Descrição completa do documento..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 resize-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Oriundo</label>
        <input
          type="text"
          value={form.oriundo}
          onChange={e => set('oriundo', e.target.value)}
          placeholder="Igreja, pastor ou entidade..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1"
        />
      </div>

      {comissoes.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Comissão</label>
          <select
            value={form.comissao_id}
            onChange={e => set('comissao_id', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 bg-white"
          >
            <option value="">Sem comissão</option>
            {comissoes.map(c => (
              <option key={c.id} value={c.id}>Comissão {c.numero}{c.nome ? ` — ${c.nome}` : ''}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Arquivo (PDF, DOC, imagem — máx 20 MB)
        </label>
        <div
          className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-gray-300 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {arquivo ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-700">{arquivo.name}</div>
                  <div className="text-xs text-gray-400">{(arquivo.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setArquivo(null); if (fileRef.current) fileRef.current.value = '' }}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remover
              </button>
            </div>
          ) : (
            <div>
              <div className="text-2xl mb-1">📎</div>
              <div className="text-sm text-gray-500">Clique para anexar um arquivo</div>
              <div className="text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX, JPG, PNG</div>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="hidden"
          onChange={e => setArquivo(e.target.files?.[0] ?? null)}
        />
        {uploadProgress && (
          <div className="mt-1 text-xs text-blue-500">{uploadProgress}</div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: '#1B3A6B' }}
      >
        {loading ? 'Salvando...' : 'Adicionar documento'}
      </button>
    </form>
  )
}

'use client'
import { useState } from 'react'

interface Props {
  igrejas: { id: string; nome: string; sigla: string | null }[]
  onSubmit: (formData: FormData) => void
}

const ANO_ATUAL = new Date().getFullYear()

export function NovoRelatorioForm({ igrejas, onSubmit }: Props) {
  const [loading, setLoading] = useState(false)

  return (
    <form
      action={async (fd) => {
        setLoading(true)
        await onSubmit(fd)
      }}
      className="card p-6 space-y-5"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Igreja / Congregação</label>
        <select name="igreja_id" required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm">
          <option value="">Selecione...</option>
          {igrejas.map(i => (
            <option key={i.id} value={i.id}>
              {i.nome}{i.sigla ? ` (${i.sigla})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ano de referência</label>
        <input
          name="ano"
          type="number"
          required
          min={2000}
          max={ANO_ATUAL}
          defaultValue={ANO_ATUAL - 1}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: '#1B3A6B' }}
      >
        {loading ? 'Criando...' : 'Criar e iniciar preenchimento'}
      </button>
    </form>
  )
}

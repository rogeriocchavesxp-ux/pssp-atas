'use client'
import { SecaoConselho } from './secao-conselho'

interface Props {
  dados: Record<string, unknown>
  readOnly: boolean
  saving: boolean
  onSave: (dados: unknown) => void
}

export function SecaoCongregacao({ dados, readOnly, saving, onSave }: Props) {
  return (
    <div>
      <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-700">
        Preencha esta aba apenas se a Igreja possuir congregações vinculadas. O formulário é idêntico ao do Conselho,
        mas aplicado à congregação.
      </div>
      <SecaoConselho
        dados={dados}
        readOnly={readOnly}
        saving={saving}
        titulo="Relatório da Congregação"
        onSave={onSave}
      />
    </div>
  )
}

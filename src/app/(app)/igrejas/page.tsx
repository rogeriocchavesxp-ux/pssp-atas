import { createClient } from '@/lib/supabase/server'
import type { Igreja } from '@/types/database'

const TIPO_MAP: Record<string, string> = {
  sede: 'Sede', congregacao: 'Congregação', campo: 'Campo', missao: 'Missão',
}

export default async function IgrejasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('igrejas')
    .select('*')
    .order('nome')

  const igrejas = (data ?? []) as Igreja[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Igrejas</h1>
          <p className="text-gray-500 text-sm mt-1">{igrejas.length} igrejas cadastradas</p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}
        >
          + Nova igreja
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {igrejas.length === 0 ? (
          <div className="col-span-3 card text-center text-gray-400 py-12">
            Nenhuma igreja cadastrada
          </div>
        ) : igrejas.map(ig => (
          <div key={ig.id} className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: '#1B3A6B' }}>
                {(ig.sigla ?? ig.nome.substring(0, 2)).substring(0, 3)}
              </div>
              <span className={`badge ${ig.ativa ? 'badge-green' : 'badge-gray'} text-xs`}>
                {ig.ativa ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <div className="font-semibold text-gray-900 mb-1 leading-snug">{ig.nome}</div>
            <div className="text-sm text-gray-400">
              {TIPO_MAP[ig.tipo] ?? ig.tipo}
              {ig.cidade ? ` · ${ig.cidade}` : ''}
              {ig.bairro ? `, ${ig.bairro}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

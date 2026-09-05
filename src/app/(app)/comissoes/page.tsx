import { createClient } from '@/lib/supabase/server'
import type { Comissao } from '@/types/database'

export default async function ComissoesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comissoes')
    .select('*, membros:comissao_membros(id, funcao, oficial:oficiais(nome, tipo))')
    .order('numero')

  const comissoes = (data ?? []) as Comissao[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comissões</h1>
          <p className="text-gray-500 text-sm mt-1">{comissoes.length} comissões</p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1B3A6B' }}
        >
          + Nova comissão
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {comissoes.length === 0 ? (
          <div className="col-span-3 card text-center text-gray-400 py-12">
            Nenhuma comissão cadastrada
          </div>
        ) : comissoes.map(c => {
          const membros = (c.membros ?? []) as Array<{
            id: string; funcao: string;
            oficial: { nome: string; tipo: string } | null
          }>
          const presidente = membros.find(m => m.funcao === 'presidente')
          return (
            <div key={c.id} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg text-white text-sm font-bold flex items-center justify-center"
                  style={{ background: '#B8962E' }}>
                  {c.numero}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Comissão {c.numero}</div>
                  {c.nome && <div className="text-xs text-gray-400">{c.nome}</div>}
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                {membros.length} membro(s)
                {presidente?.oficial && ` · Pres: ${presidente.oficial.nome.split(' ')[0]}`}
              </div>
              <div className="space-y-1">
                {membros.slice(0, 3).map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                    {m.oficial?.nome ?? '—'}
                    {m.funcao !== 'membro' && (
                      <span className="text-gray-400">({m.funcao})</span>
                    )}
                  </div>
                ))}
                {membros.length > 3 && (
                  <div className="text-xs text-gray-400">+{membros.length - 3} mais</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

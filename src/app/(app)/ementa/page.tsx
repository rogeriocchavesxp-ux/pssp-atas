import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function EmentarioPage() {
  const supabase = await createClient()

  const { data: reunioes } = await supabase
    .from('reunioes')
    .select('id, numero, tipo, data_inicio, status')
    .order('data_inicio', { ascending: false })
    .limit(10)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Ementário</h1>
        <p className="text-gray-500 text-sm mt-1">Índice de documentos e resoluções por reunião</p>
      </div>

      <div className="space-y-3">
        {(reunioes ?? []).map((r) => (
          <Link
            key={r.id}
            href={`/reunioes/${r.id}`}
            className="card flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="font-semibold text-gray-900">{r.numero}</div>
              <div className="text-sm text-gray-400">
                {r.tipo === 'ordinaria' ? 'Ordinária' : r.tipo === 'extraordinaria' ? 'Extraordinária' : r.tipo} ·{' '}
                {new Date(r.data_inicio).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div className="text-gray-300 text-xl">→</div>
          </Link>
        ))}

        {(reunioes ?? []).length === 0 && (
          <div className="card text-center text-gray-400 py-12">
            Nenhuma reunião cadastrada.{' '}
            <Link href="/reunioes/nova" style={{ color: '#1B3A6B' }}>Criar a primeira</Link>
          </div>
        )}
      </div>
    </div>
  )
}

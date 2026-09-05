'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0e1d37 0%, #1B3A6B 60%, #2a5dab 100%)' }}>
      {/* Painel esquerdo */}
      <div className="hidden lg:flex flex-col justify-between w-96 p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight">PSSP</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-4">
            Presbitério Leste<br />de São Paulo
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Igreja Presbiteriana do Brasil<br />
            SE-SC/IPB
          </p>
        </div>
        <div className="space-y-4">
          {[
            { icon: '📄', label: 'Ementário digital de documentos' },
            { icon: '🏛️', label: 'Gestão de reuniões e atas' },
            { icon: '✅', label: 'Fluxo de aprovação e publicação' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-sm text-white/70">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-8">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Sistema de Atas</div>
              <h2 className="text-2xl font-bold text-gray-900">Entrar</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700 focus:border-transparent"
                  style={{ '--tw-ring-color': '#1B3A6B' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700 focus:border-transparent"
                />
              </div>

              {erro && (
                <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ background: '#1B3A6B' }}
              >
                {loading ? 'Entrando...' : 'Entrar no sistema'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">PSSP — Presbitério Leste de São Paulo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

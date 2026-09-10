'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV_PRINCIPAL = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/reunioes', icon: '🏛️', label: 'Reuniões' },
  { href: '/comissao-executiva', icon: '🏅', label: 'Comissão Executiva' },
]

const NAV_MESA_GLOBAL = [
  { href: '/ementa', icon: '📋', label: 'Ementário' },
  { href: '/propostas', icon: '📄', label: 'Propostas' },
  { href: '/resolucoes', icon: '✅', label: 'Resoluções' },
  { href: '/atas', icon: '📝', label: 'Atas' },
]

const NAV_RELATORIOS = [
  { href: '/relatorios', icon: '📊', label: 'Relatórios Anuais' },
  { href: '/relatorios/ministeriais', icon: '📋', label: 'Relatórios de Ministro' },
  { href: '/relatorios/igrejas', icon: '⛪', label: 'Relatórios das Igrejas' },
]

const NAV_CADASTROS = [
  { href: '/oficiais', icon: '👤', label: 'Oficiais' },
  { href: '/seminaristas', icon: '🎓', label: 'Seminaristas' },
  { href: '/candidatos', icon: '📌', label: 'Candidatos' },
  { href: '/igrejas', icon: '⛪', label: 'Igrejas' },
  { href: '/comissoes', icon: '👥', label: 'Comissões' },
]

const NAV_ADMIN = [
  { href: '/usuarios', icon: '🔐', label: 'Usuários e Permissões' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [nomeUsuario, setNomeUsuario] = useState<string>('')
  const [reuniaoNumero, setReuniaoNumero] = useState<string | null>(null)

  const reuniaoMatch = pathname.match(/^\/reunioes\/([^/]+)/)
  const reuniaoId = reuniaoMatch?.[1] && reuniaoMatch[1] !== 'nova' ? reuniaoMatch[1] : undefined

  const mesaItems = reuniaoId ? [
    { href: `/reunioes/${reuniaoId}/ementa`, icon: '📋', label: 'Ementário' },
    { href: `/propostas?reuniao=${reuniaoId}`, icon: '📄', label: 'Propostas' },
    { href: `/resolucoes?reuniao=${reuniaoId}`, icon: '✅', label: 'Resoluções' },
    { href: `/reunioes/${reuniaoId}/ata`, icon: '📝', label: 'Atas' },
  ] : NAV_MESA_GLOBAL

  const mesaLabel = reuniaoId && reuniaoNumero ? `Mesa — ${reuniaoNumero}` : 'Mesa da Reunião'

  const NAV = [
    { label: 'Principal', items: NAV_PRINCIPAL },
    { label: mesaLabel, items: mesaItems },
    { label: 'Relatórios', items: NAV_RELATORIOS },
    { label: 'Cadastros', items: NAV_CADASTROS },
    { label: 'Administração', items: NAV_ADMIN },
  ]

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('perfis').select('nome').eq('id', user.id).single()
        .then(({ data }) => {
          const nome = (data as { nome?: string } | null)?.nome
          setNomeUsuario(nome || user.email?.split('@')[0] || '')
        })
    })
  }, [])

  useEffect(() => {
    if (!reuniaoId) { setReuniaoNumero(null); return }
    supabase.from('reunioes').select('numero').eq('id', reuniaoId).single()
      .then(({ data }) => setReuniaoNumero((data as { numero?: string } | null)?.numero ?? null))
  }, [reuniaoId])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col z-30"
      style={{ width: 'var(--sidebar-w)', background: 'var(--navy-700)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white text-sm font-bold">
            P
          </div>
          <div>
            <div className="text-white text-sm font-semibold leading-tight">PSSP</div>
            <div className="text-white/40 text-xs">Presbitério Leste SP</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-widest text-white/30">
              {group.label}
            </div>
            {group.items.map((item) => {
              const hrefPath = item.href.split('?')[0]
              const active = pathname === hrefPath || pathname.startsWith(hrefPath + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all ${
                    active
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-white/60 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        {nomeUsuario && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {nomeUsuario[0].toUpperCase()}
            </div>
            <span className="text-white/70 text-sm truncate">{nomeUsuario}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all"
        >
          <span>→</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}

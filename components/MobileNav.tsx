'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ClipboardList, Store, BarChart3,
  MoreHorizontal, UsersRound, Users, Package, LogOut, X, CalendarClock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Utilizador } from '@/types'

function Spinner() {
  return (
    <div style={{
      width: 20, height: 20,
      border: '2px solid rgba(37,99,235,0.2)',
      borderTop: '2px solid var(--accent)',
      borderRadius: '50%',
      animation: 'nav-spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

export default function MobileNav({ utilizador }: { utilizador: Utilizador | null }) {
  const pathname    = usePathname()
  const router      = useRouter()
  const [sheet, setSheet]         = useState(false)
  const [loadingHref, setLoading] = useState<string | null>(null)

  const isAdmin      = utilizador?.cargo === 'admin'
  const isSupervisor = utilizador?.cargo === 'supervisor'
  const isTecnico    = utilizador?.cargo === 'tecnico'

  // Clear loading when navigation completes
  useEffect(() => { setLoading(null) }, [pathname])

  async function logout() {
    setSheet(false)
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
  }

  function active(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  function handleLinkClick(href: string, exact?: boolean) {
    if (active(href, exact)) return // already here, no load
    setLoading(href)
  }

  const primary = [
    ...(!isTecnico ? [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true }] : []),
    { label: 'Serviços', href: '/dashboard/servicos', icon: ClipboardList },
    { label: 'Jornada',  href: '/dashboard/jornada',  icon: CalendarClock },
  ]

  const secondary = isAdmin
    ? [
        { label: 'Lojas',        href: '/dashboard/lojas',        icon: Store },
        { label: 'Relatórios',   href: '/dashboard/relatorios',   icon: BarChart3 },
        { label: 'Equipas',      href: '/dashboard/equipas',      icon: UsersRound },
        { label: 'Utilizadores', href: '/dashboard/utilizadores', icon: Users },
        { label: 'Materiais',    href: '/dashboard/materiais',    icon: Package },
      ]
    : isSupervisor
    ? [{ label: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 }]
    : []

  const hasMore = secondary.length > 0

  return (
    <>
      <style>{`
        @keyframes nav-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Slide-up sheet */}
      {sheet && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.35)' }}
            onClick={() => setSheet(false)}
          />
          <div
            className="fixed left-0 right-0 z-50 rounded-t-2xl"
            style={{
              bottom: 'calc(64px + env(safe-area-inset-bottom))',
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-sub)',
              padding: '16px',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                Mais opções
              </p>
              <button onClick={() => setSheet(false)}>
                <X size={18} style={{ color: 'var(--text-3)' }} />
              </button>
            </div>

            <div className="space-y-1">
              {secondary.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => { setSheet(false); handleLinkClick(href) }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium"
                  style={{
                    background: active(href) ? '#dbeafe' : undefined,
                    color:      active(href) ? 'var(--accent-h)' : 'var(--text-2)',
                  }}
                >
                  <Icon size={20} style={{ color: active(href) ? 'var(--accent)' : 'var(--text-3)', flexShrink: 0 }} />
                  {label}
                  {loadingHref === href && <Spinner />}
                </Link>
              ))}
            </div>

            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-sub)' }}>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium"
                style={{ color: '#dc2626' }}
              >
                <LogOut size={20} />
                Terminar sessão
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom nav bar */}
      <nav
        className="fixed left-0 right-0 z-30 md:hidden flex items-center justify-around"
        style={{
          bottom: 0,
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-sub)',
          height: 'calc(64px + env(safe-area-inset-bottom))',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {primary.map(({ label, href, icon: Icon, exact }) => {
          const on      = active(href, exact)
          const loading = loadingHref === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => handleLinkClick(href, exact)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
              style={{ color: on ? 'var(--accent)' : 'var(--text-3)' }}
            >
              {loading ? <Spinner /> : <Icon size={24} />}
              <span style={{ fontSize: '11px', fontWeight: 500 }}>{label}</span>
            </Link>
          )
        })}

        {hasMore ? (
          <button
            onClick={() => setSheet(s => !s)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
            style={{ color: sheet ? 'var(--accent)' : 'var(--text-3)', background: 'none', border: 'none' }}
          >
            <MoreHorizontal size={24} />
            <span style={{ fontSize: '11px', fontWeight: 500 }}>Mais</span>
          </button>
        ) : (
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
            style={{ color: 'var(--text-3)', background: 'none', border: 'none' }}
          >
            <LogOut size={24} />
            <span style={{ fontSize: '11px', fontWeight: 500 }}>Sair</span>
          </button>
        )}
      </nav>
    </>
  )
}

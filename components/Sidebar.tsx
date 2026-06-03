'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  Users,
  UsersRound,
  Package,
  BarChart3,
  LogOut,
  Wrench,
  CalendarClock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Utilizador } from '@/types'

const NAV = [
  { label: 'Dashboard',    href: '/dashboard',               icon: LayoutDashboard, exact: true },
  { label: 'Serviços',     href: '/dashboard/servicos',      icon: ClipboardList },
  { label: 'Jornada',      href: '/dashboard/jornada',       icon: CalendarClock },
  { label: 'Lojas',        href: '/dashboard/lojas',         icon: Store,       adminOnly: true },
  { label: 'Equipas',      href: '/dashboard/equipas',       icon: UsersRound,  adminOnly: true },
  { label: 'Utilizadores', href: '/dashboard/utilizadores',  icon: Users,       adminOnly: true },
  { label: 'Materiais',    href: '/dashboard/materiais',     icon: Package,     adminOnly: true },
  { label: 'Relatórios',   href: '/dashboard/relatorios',    icon: BarChart3,   adminOnly: true, supervisorOk: true },
]

const CARGO_LABEL: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
}

interface Props { utilizador: Utilizador | null }

export default function Sidebar({ utilizador }: Props) {
  const pathname     = usePathname()
  const router       = useRouter()
  const isAdmin      = utilizador?.cargo === 'admin'
  const isSupervisor = utilizador?.cargo === 'supervisor'

  async function logout() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-sub)' }}>

      {/* Marca */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border-sub)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent)' }}>
            <Wrench size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
              Manutenção
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>Inpulse Events</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-widest px-3 pt-2 pb-1" style={{ color: 'var(--text-3)' }}>
          Menu
        </p>

        {NAV.map(({ label, href, icon: Icon, exact, adminOnly, supervisorOk }) => {
          if (adminOnly && !isAdmin && !(supervisorOk && isSupervisor)) return null
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                active
                  ? { background: '#dbeafe', color: 'var(--accent-h)' }
                  : { color: 'var(--text-2)' }
              }
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-1)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-2)' }}
            >
              <Icon
                size={17}
                style={{ color: active ? 'var(--accent)' : 'inherit', flexShrink: 0 }}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Utilizador */}
      <div className="px-3 pb-4" style={{ borderTop: '1px solid var(--border-sub)', paddingTop: '12px' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1" style={{ background: 'var(--bg-card)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold uppercase"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {utilizador?.nome?.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>
              {utilizador?.nome ?? '—'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              {CARGO_LABEL[utilizador?.cargo ?? ''] ?? utilizador?.cargo}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#dc2626'; (e.currentTarget as HTMLElement).style.background = '#fef2f2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <LogOut size={16} />
          Terminar sessão
        </button>
      </div>
    </aside>
  )
}

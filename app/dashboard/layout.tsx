import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import MobileNav from '@/components/MobileNav'
import type { Utilizador } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const user = session.user

  const { data: utilizador } = await supabase
    .from('maint_utilizadores')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .single()

  if (!utilizador) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center max-w-sm mx-auto p-8 rounded-2xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <svg className="w-6 h-6" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="#dc2626"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="font-semibold text-base mb-1" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            Acesso não autorizado
          </p>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            O teu utilizador não tem acesso a este sistema. Contacta o administrador.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex overflow-hidden" style={{ height: '100dvh', background: 'var(--bg-base)' }}>
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar utilizador={utilizador as Utilizador} />
      </div>

      {/* Mobile top header */}
      <MobileHeader utilizador={utilizador as Utilizador} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden mobile-main">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileNav utilizador={utilizador as Utilizador} />
    </div>
  )
}

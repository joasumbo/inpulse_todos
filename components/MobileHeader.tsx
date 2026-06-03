'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Utilizador } from '@/types'

const CARGO_LABEL: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
}

export default function MobileHeader({ utilizador }: { utilizador: Utilizador | null }) {
  const router       = useRouter()
  const [menu, setMenu] = useState(false)

  async function logout() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {menu && (
        <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
      )}

      {menu && (
        <div
          className="fixed right-4 z-50 rounded-2xl shadow-xl"
          style={{
            top: 'calc(env(safe-area-inset-top) + 68px)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-sub)',
            width: '224px',
            padding: '14px',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold uppercase flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {utilizador?.nome?.charAt(0) ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
                {utilizador?.nome ?? '—'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {CARGO_LABEL[utilizador?.cargo ?? ''] ?? utilizador?.cargo}
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-sub)', paddingTop: '10px' }}>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium"
              style={{ color: '#dc2626' }}
            >
              <LogOut size={16} />
              Terminar sessão
            </button>
          </div>
        </div>
      )}

      <header
        className="fixed left-0 right-0 z-30 md:hidden flex items-center justify-between px-5"
        style={{
          top: 0,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-sub)',
          paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
          paddingBottom: '12px',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <Wrench size={18} color="white" />
          </div>
          <span
            className="text-base font-bold"
            style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}
          >
            Manutenção
          </span>
        </div>

        <button
          onClick={() => setMenu(m => !m)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {utilizador?.nome?.charAt(0) ?? '?'}
        </button>
      </header>
    </>
  )
}

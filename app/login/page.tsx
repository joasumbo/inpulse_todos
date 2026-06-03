'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Aceitar login por username: se não houver "@", assume o domínio interno.
    const identifier = email.trim()
    const loginEmail = identifier.includes('@')
      ? identifier.toLowerCase()
      : `${identifier.toLowerCase().replace(/[^a-z0-9._-]/g, '')}@inpulse.app`

    const sb = createClient()
    const { error } = await sb.auth.signInWithPassword({ email: loginEmail, password })

    if (error) {
      setError('Credenciais inválidas. Verifica o email e a password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* Painel lateral esquerdo */}
      <div className="hidden lg:flex w-2/5 flex-col justify-between p-12"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-sub)' }}>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Wrench size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>Manutenção</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Inpulse Events</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-snug mb-4" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            Gestão de<br />intervenções técnicas
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
            Controlo completo de serviços, equipas e lojas — num só sistema.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { title: 'Serviços em tempo real', sub: 'Acompanha o estado de cada intervenção' },
              { title: 'Gestão de equipas',      sub: 'Atribui técnicos e supervisores' },
              { title: 'Registo de materiais',   sub: 'Controla stock e custos por serviço' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--accent)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{f.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          &copy; {new Date().getFullYear()} Inpulse Events. Todos os direitos reservados.
        </p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Wrench size={18} className="text-white" />
            </div>
            <p className="font-semibold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>Manutenção</p>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            Bem-vindo de volta
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-2)' }}>
            Entra na tua conta para continuar
          </p>

          {error && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6 text-sm"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-2)' }}>
                Email ou username
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="username ou nome@empresa.pt"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-1)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-2)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-1)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all mt-2"
              style={{ background: 'var(--accent)', color: '#fff', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'A entrar...' : (
                <>Entrar <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--text-3)' }}>
            Acesso restrito. Para solicitar acesso contacta o administrador.
          </p>
        </div>
      </div>
    </div>
  )
}

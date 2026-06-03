'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, CheckCircle2, AlertCircle, User, Mail, Lock } from 'lucide-react'

const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
const inputStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-1)',
}

export default function SetupPage() {
  const router = useRouter()
  const [form, setForm]     = useState({ nome: '', email: '', password: '' })
  const [erro, setErro]     = useState('')
  const [sucesso, setSuc]   = useState(false)
  const [loading, setLoad]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoad(true)

    const res  = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setErro(data.error ?? 'Erro ao criar administrador')
      setLoad(false)
      return
    }

    setSuc(true)
    setTimeout(() => router.push('/login'), 2500)
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <CheckCircle2 size={32} style={{ color: '#16a34a' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            Administrador criado
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>A redirecionar para o login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent)' }}>
            <Wrench size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            Configuração inicial
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-2)' }}>
            Cria o primeiro administrador do sistema
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {erro && (
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                <AlertCircle size={15} className="flex-shrink-0" />
                {erro}
              </div>
            )}

            {[
              { label: 'Nome completo', field: 'nome',     type: 'text',     icon: User,  ph: 'João Silva' },
              { label: 'Email',        field: 'email',    type: 'email',    icon: Mail,  ph: 'admin@empresa.pt' },
              { label: 'Password',     field: 'password', type: 'password', icon: Lock,  ph: 'Mínimo 6 caracteres' },
            ].map(({ label, field, type, icon: Icon, ph }) => (
              <div key={field}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                  {label}
                </label>
                <div className="relative">
                  <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                  <input
                    type={type}
                    required
                    minLength={field === 'password' ? 6 : undefined}
                    placeholder={ph}
                    value={form[field as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    className={inputClass}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all mt-2"
              style={{ background: 'var(--accent)', color: '#fff', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'A criar...' : 'Criar Administrador'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-3)' }}>
          Esta pagina fica bloqueada apos criar o primeiro admin
        </p>
      </div>
    </div>
  )
}

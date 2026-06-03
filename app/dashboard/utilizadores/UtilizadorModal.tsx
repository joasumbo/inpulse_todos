'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import type { Utilizador, Cargo } from '@/types'

const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
const inputStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text-1)',
}

interface Props {
  utilizador: Utilizador | null
  onClose: () => void
  onSaved: (u: Utilizador) => void
}

export default function UtilizadorModal({ utilizador, onClose, onSaved }: Props) {
  const isEdicao = !!utilizador

  const [form, setForm] = useState({
    nome:     utilizador?.nome     ?? '',
    username: utilizador?.username ?? '',
    password: '',
    telefone: utilizador?.telefone ?? '',
    cargo:    (utilizador?.cargo   ?? 'tecnico') as Cargo,
    notas:    utilizador?.notas    ?? '',
    ativo:    utilizador?.ativo    ?? true,
  })
  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const method = isEdicao ? 'PATCH' : 'POST'
      const body = isEdicao
        ? {
            id: utilizador!.id, nome: form.nome, username: form.username,
            telefone: form.telefone, cargo: form.cargo, notas: form.notas, ativo: form.ativo,
            ...(form.password ? { password: form.password } : {}),
          }
        : { nome: form.nome, username: form.username, password: form.password, telefone: form.telefone, cargo: form.cargo, notas: form.notas }

      const res  = await fetch('/api/admin/utilizadores', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro desconhecido')
      onSaved(data)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: '#0008' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--border-sub)' }}>
          <h2 className="font-bold text-base" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            {isEdicao ? 'Editar Utilizador' : 'Novo Utilizador'}
          </h2>
          <button onClick={onClose} className="transition-all"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {erro && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
              <AlertCircle size={15} className="flex-shrink-0" />
              {erro}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">

            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Nome completo *
              </label>
              <input required value={form.nome} onChange={e => set('nome', e.target.value)}
                className={inputClass} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Username * <span style={{ color: 'var(--text-3)' }}>(usado para login)</span>
              </label>
              <input required value={form.username} onChange={e => set('username', e.target.value)}
                placeholder="ex: pedro.silva"
                autoCapitalize="none" autoCorrect="off" spellCheck={false}
                className={inputClass} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                {isEdicao
                  ? <>Nova password <span style={{ color: 'var(--text-3)' }}>(deixe vazio para manter)</span></>
                  : <>Password * <span style={{ color: 'var(--text-3)' }}>(mín. 6 caracteres)</span></>}
              </label>
              <input type="password" required={!isEdicao} minLength={6} value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder={isEdicao ? '••••••••' : ''}
                autoComplete="new-password"
                className={inputClass} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Telefone
              </label>
              <input value={form.telefone} onChange={e => set('telefone', e.target.value)}
                placeholder="+351 9XX XXX XXX"
                className={inputClass} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Cargo *
              </label>
              <select value={form.cargo} onChange={e => set('cargo', e.target.value as Cargo)}
                className={inputClass} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="tecnico">Técnico</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Notas
              </label>
              <textarea value={form.notas} onChange={e => set('notas', e.target.value)}
                rows={2} className={inputClass} style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            {isEdicao && (
              <div className="col-span-2 flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                    {form.ativo ? 'Utilizador ativo' : 'Utilizador inativo'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                    {form.ativo ? 'Tem acesso ao sistema' : 'Acesso bloqueado'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set('ativo', !form.ativo)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                  style={{ background: form.ativo ? 'var(--accent)' : 'var(--border)' }}>
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                    style={{ transform: form.ativo ? 'translateX(22px)' : 'translateX(2px)' }} />
                </button>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--border-sub)', paddingTop: '16px' }}>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border-sub)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'var(--accent)', color: '#fff', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'A guardar...' : isEdicao ? 'Guardar alterações' : 'Criar utilizador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

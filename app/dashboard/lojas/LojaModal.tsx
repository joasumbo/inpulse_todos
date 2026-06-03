'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import type { Loja } from '@/types'

const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
const inputStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text-1)',
}

interface Props {
  loja: Loja | null
  onClose: () => void
  onSaved: (l: Loja) => void
}

export default function LojaModal({ loja, onClose, onSaved }: Props) {
  const isEdicao = !!loja

  const [form, setForm] = useState({
    nome:           loja?.nome           ?? '',
    codigo:         loja?.codigo         ?? '',
    morada:         loja?.morada         ?? '',
    cidade:         loja?.cidade         ?? '',
    codigo_postal:  loja?.codigo_postal  ?? '',
    pais:           loja?.pais           ?? 'Portugal',
    telefone:       loja?.telefone       ?? '',
    email_contacto: loja?.email_contacto ?? '',
    contacto_nome:  loja?.contacto_nome  ?? '',
    notas:          loja?.notas          ?? '',
    estado:         loja?.estado         ?? 'ativa' as Loja['estado'],
  })
  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const method = isEdicao ? 'PATCH' : 'POST'
      const body   = isEdicao ? { id: loja!.id, ...form } : form

      const res  = await fetch('/api/admin/lojas', {
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
      style={{ background: '#00000060' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--border-sub)' }}>
          <h2 className="font-bold text-base" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            {isEdicao ? 'Editar Loja' : 'Nova Loja'}
          </h2>
          <button onClick={onClose} className="transition-all"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {erro && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
              <AlertCircle size={15} className="flex-shrink-0" />
              {erro}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">

            {/* Nome */}
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Nome da loja *
              </label>
              <input required value={form.nome} onChange={e => set('nome', e.target.value)}
                placeholder="Ex: Loja Centro Lisboa"
                className={inputClass} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            {/* Código + Estado */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Código interno
              </label>
              <input value={form.codigo} onChange={e => set('codigo', e.target.value)}
                placeholder="Ex: LJ-001"
                className={inputClass} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Estado
              </label>
              <select value={form.estado} onChange={e => set('estado', e.target.value)}
                className={inputClass} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
                <option value="suspensa">Suspensa</option>
              </select>
            </div>

            {/* Morada */}
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Morada
              </label>
              <input value={form.morada} onChange={e => set('morada', e.target.value)}
                placeholder="Rua, número, andar..."
                className={inputClass} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            {/* Cidade + CP */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Cidade
              </label>
              <input value={form.cidade} onChange={e => set('cidade', e.target.value)}
                placeholder="Ex: Lisboa"
                className={inputClass} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Código Postal
              </label>
              <input value={form.codigo_postal} onChange={e => set('codigo_postal', e.target.value)}
                placeholder="Ex: 1000-001"
                className={inputClass} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            {/* País */}
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                País
              </label>
              <input value={form.pais} onChange={e => set('pais', e.target.value)}
                className={inputClass} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            {/* Separador contacto */}
            <div className="col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider pt-1" style={{ color: 'var(--text-3)' }}>
                Contacto
              </p>
            </div>

            {/* Pessoa de contacto */}
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Nome do responsável
              </label>
              <input value={form.contacto_nome} onChange={e => set('contacto_nome', e.target.value)}
                placeholder="Ex: Ana Ferreira"
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
                Email
              </label>
              <input type="email" value={form.email_contacto} onChange={e => set('email_contacto', e.target.value)}
                placeholder="loja@empresa.pt"
                className={inputClass} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            {/* Notas */}
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Notas
              </label>
              <textarea value={form.notas} onChange={e => set('notas', e.target.value)}
                rows={2} placeholder="Observações sobre a loja..."
                className={inputClass} style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

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
              {loading ? 'A guardar...' : isEdicao ? 'Guardar alterações' : 'Criar loja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

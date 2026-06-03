'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

const UNIDADES = [
  { value: 'un',   label: 'Unidade (un)' },
  { value: 'm',    label: 'Metro (m)'    },
  { value: 'm2',   label: 'Metro² (m²)' },
  { value: 'kg',   label: 'Quilograma (kg)' },
  { value: 'L',    label: 'Litro (L)'   },
  { value: 'cx',   label: 'Caixa (cx)'  },
  { value: 'rolo', label: 'Rolo'        },
]

export interface Material {
  id: string
  referencia: string | null
  nome: string
  descricao: string | null
  unidade: string
  preco_unit: number
  stock_atual: number
  stock_minimo: number
  ativo: boolean
}

interface Props {
  material: Material | null
  onClose:  () => void
  onSaved:  (m: Material) => void
}

const inputStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text-1)',
}

export default function MaterialModal({ material, onClose, onSaved }: Props) {
  const isEdicao = !!material

  const [form, setForm] = useState({
    nome:         material?.nome         ?? '',
    descricao:    material?.descricao    ?? '',
    unidade:      material?.unidade      ?? 'un',
    preco_unit:   String(material?.preco_unit   ?? ''),
    stock_atual:  String(material?.stock_atual  ?? ''),
    stock_minimo: String(material?.stock_minimo ?? ''),
  })

  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)

  function set(k: string, v: string) { setForm(prev => ({ ...prev, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        nome:         form.nome,
        descricao:    form.descricao    || null,
        unidade:      form.unidade,
        preco_unit:   form.preco_unit   ? Number(form.preco_unit)   : 0,
        stock_minimo: form.stock_minimo ? Number(form.stock_minimo) : 0,
      }

      if (!isEdicao) {
        payload.stock_atual = form.stock_atual ? Number(form.stock_atual) : 0
      }

      if (isEdicao) {
        payload.id = material!.id
        payload.stock_atual = form.stock_atual ? Number(form.stock_atual) : 0
      }

      const res = await fetch('/api/admin/materiais', {
        method: isEdicao ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro desconhecido')
      onSaved(data as Material)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: '#00000065' }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-sub)' }}
        >
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
              {isEdicao ? 'Editar Material' : 'Novo Material'}
            </h2>
            {isEdicao && material!.referencia && (
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-3)' }}>
                {material!.referencia}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {erro && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                {erro}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Nome *
              </label>
              <input
                required
                value={form.nome}
                onChange={e => set('nome', e.target.value)}
                placeholder="Ex: Fusível 16A"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Descrição
              </label>
              <input
                value={form.descricao}
                onChange={e => set('descricao', e.target.value)}
                placeholder="Detalhe opcional"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Unidade + Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                  Unidade
                </label>
                <select
                  value={form.unidade}
                  onChange={e => set('unidade', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                  Preço / unidade (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.preco_unit}
                  onChange={e => set('preco_unit', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            {/* Stock atual + mínimo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                  Stock atual
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.stock_atual}
                  onChange={e => set('stock_atual', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                  Stock mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.stock_minimo}
                  onChange={e => set('stock_minimo', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex gap-3 px-6 py-4"
            style={{ borderTop: '1px solid var(--border-sub)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border-sub)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--accent)', color: '#fff', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'A guardar...' : isEdicao ? 'Guardar' : 'Criar material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

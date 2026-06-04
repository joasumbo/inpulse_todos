'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, Plus, Trash2, Crown, Wrench } from 'lucide-react'
import type { Equipa, Utilizador } from '@/types'

const CORES_PRESET = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
  '#84CC16', '#6B7280',
]

interface MembroUI {
  utilizador_id: string
  cargo_na_equipa: 'lider' | 'tecnico'
  utilizador: { id: string; nome: string; cargo: string; email: string }
}

interface Props {
  equipa: Equipa | null
  utilizadores: Pick<Utilizador, 'id' | 'nome' | 'cargo' | 'email'>[]
  onClose: () => void
  onSaved: (e: Equipa) => void
  onDeleted?: (id: string) => void
}

const inputStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text-1)',
}

export default function EquipaModal({ equipa, utilizadores, onClose, onSaved, onDeleted }: Props) {
  const isEdicao = !!equipa
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!equipa) return
    if (!confirm(`Eliminar definitivamente a equipa "${equipa.nome}"? Esta ação não pode ser anulada.`)) return
    setErro(''); setDeleting(true)
    try {
      const res = await fetch(`/api/admin/equipas?id=${equipa.id}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? 'Erro ao eliminar') }
      onDeleted?.(equipa.id)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao eliminar')
      setDeleting(false)
    }
  }

  const [form, setForm] = useState({
    nome:      equipa?.nome      ?? '',
    descricao: equipa?.descricao ?? '',
    cor:       equipa?.cor       ?? '#3B82F6',
    ativa:     equipa?.ativa     ?? true,
  })
  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)

  const [membros,        setMembros]        = useState<MembroUI[]>([])
  const [loadingMembros, setLoadingMembros] = useState(false)
  const [novoUtil,       setNovoUtil]       = useState('')
  const [novoCargo,      setNovoCargo]      = useState<'lider' | 'tecnico'>('tecnico')
  const [addLoading,     setAddLoading]     = useState(false)

  useEffect(() => {
    if (!isEdicao || !equipa) return
    setLoadingMembros(true)
    fetch(`/api/admin/equipas/${equipa.id}/membros`)
      .then(r => r.json())
      .then(d => setMembros(Array.isArray(d) ? d : []))
      .catch(() => setMembros([]))
      .finally(() => setLoadingMembros(false))
  }, [equipa, isEdicao])

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const method = isEdicao ? 'PATCH' : 'POST'
      const body   = isEdicao ? { id: equipa!.id, ...form } : form
      const res  = await fetch('/api/admin/equipas', {
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

  async function addMembro() {
    if (!novoUtil || !equipa) return
    setAddLoading(true)
    setErro('')
    try {
      const res = await fetch(`/api/admin/equipas/${equipa.id}/membros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utilizador_id: novoUtil, cargo_na_equipa: novoCargo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMembros(prev => [...prev.filter(m => m.utilizador_id !== novoUtil), data])
      setNovoUtil('')
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao adicionar membro')
    } finally {
      setAddLoading(false)
    }
  }

  async function removeMembro(utilizador_id: string) {
    if (!equipa) return
    try {
      await fetch(`/api/admin/equipas/${equipa.id}/membros`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utilizador_id }),
      })
      setMembros(prev => prev.filter(m => m.utilizador_id !== utilizador_id))
    } catch {}
  }

  const membroIds  = membros.map(m => m.utilizador_id)
  const disponiveis = utilizadores.filter(u => !membroIds.includes(u.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: '#00000060' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--border-sub)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full flex-shrink-0 transition-all" style={{ background: form.cor }} />
            <h2 className="font-bold text-base" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
              {isEdicao ? 'Editar Equipa' : 'Nova Equipa'}
            </h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {erro && (
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                <AlertCircle size={15} className="flex-shrink-0" />
                {erro}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Nome da equipa *
              </label>
              <input
                required value={form.nome} onChange={e => set('nome', e.target.value)}
                placeholder="Ex: Equipa Lisboa Norte"
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
              <textarea
                value={form.descricao} onChange={e => set('descricao', e.target.value)}
                rows={2} placeholder="Breve descrição da equipa..."
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Cor + Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-2)' }}>
                  Cor da equipa
                </label>
                <div className="flex flex-wrap gap-2">
                  {CORES_PRESET.map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => set('cor', c)}
                      className="w-7 h-7 rounded-full transition-all flex-shrink-0"
                      style={{
                        background: c,
                        outline: form.cor === c ? `3px solid ${c}` : 'none',
                        outlineOffset: '2px',
                        transform: form.cor === c ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-2)' }}>
                  Estado
                </label>
                <button
                  type="button"
                  onClick={() => set('ativa', !form.ativa)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm w-full transition-all"
                  style={{
                    background: form.ativa ? '#dcfce7' : 'var(--bg-card)',
                    border: `1px solid ${form.ativa ? '#86efac' : 'var(--border)'}`,
                    color: form.ativa ? '#166534' : 'var(--text-2)',
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 transition-all"
                    style={{ background: form.ativa ? '#16a34a' : '#9ca3af' }} />
                  {form.ativa ? 'Ativa' : 'Inativa'}
                </button>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-1" style={{ borderTop: '1px solid var(--border-sub)', paddingTop: '16px' }}>
              {isEdicao && onDeleted && (
                <button type="button" onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                  style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', opacity: deleting ? 0.6 : 1 }}>
                  <Trash2 size={15} /> {deleting ? 'A eliminar...' : 'Eliminar'}
                </button>
              )}
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border-sub)' }}>
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'var(--accent)', color: '#fff', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'A guardar...' : isEdicao ? 'Guardar alterações' : 'Criar equipa'}
              </button>
            </div>
          </form>

          {/* Gestão de membros — apenas em edição */}
          {isEdicao && (
            <div className="px-6 pb-6" style={{ borderTop: '1px solid var(--border-sub)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mt-5 mb-4" style={{ color: 'var(--text-3)' }}>
                Membros
              </p>

              {/* Adicionar membro */}
              <div className="flex gap-2 mb-4">
                <select
                  value={novoUtil}
                  onChange={e => setNovoUtil(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ ...inputStyle, color: novoUtil ? 'var(--text-1)' : 'var(--text-3)' }}
                >
                  <option value="">Adicionar utilizador...</option>
                  {disponiveis.map(u => (
                    <option key={u.id} value={u.id}>{u.nome} · {u.cargo}</option>
                  ))}
                </select>
                <select
                  value={novoCargo}
                  onChange={e => setNovoCargo(e.target.value as 'lider' | 'tecnico')}
                  className="px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="tecnico">Técnico</option>
                  <option value="lider">Líder</option>
                </select>
                <button
                  type="button"
                  onClick={addMembro}
                  disabled={!novoUtil || addLoading}
                  className="flex items-center justify-center w-10 rounded-xl transition-all flex-shrink-0"
                  style={{
                    background: novoUtil ? 'var(--accent)' : 'var(--bg-card)',
                    color: novoUtil ? '#fff' : 'var(--text-3)',
                    border: '1px solid var(--border-sub)',
                  }}
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Lista de membros */}
              {loadingMembros ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-3)' }}>A carregar...</p>
              ) : membros.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-3)' }}>
                  Sem membros nesta equipa.
                </p>
              ) : (
                <div className="space-y-2">
                  {membros.map(m => (
                    <div
                      key={m.utilizador_id}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-sub)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0"
                          style={{ background: form.cor + '22', color: form.cor }}
                        >
                          {m.utilizador?.nome?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                            {m.utilizador?.nome}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {m.cargo_na_equipa === 'lider'
                              ? <Crown size={10} style={{ color: '#d97706' }} />
                              : <Wrench size={10} style={{ color: 'var(--text-3)' }} />
                            }
                            <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                              {m.cargo_na_equipa === 'lider' ? 'Líder' : 'Técnico'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMembro(m.utilizador_id)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ color: 'var(--text-3)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#dc2626'; (e.currentTarget as HTMLElement).style.background = '#fef2f2' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

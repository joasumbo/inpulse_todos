'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import type { Loja, Equipa, Utilizador, Cargo } from '@/types'
import type { ServicoUI } from './types'
import { PRIORIDADE_META, COLUNAS } from './KanbanBoard'
import ServicoAnexos from './ServicoAnexos'
import ServicoMateriais from './ServicoMateriais'

const TIPOS = [
  { id: 'preventiva', label: 'Preventiva' },
  { id: 'corretiva',  label: 'Corretiva'  },
  { id: 'emergencia', label: 'Emergência' },
  { id: 'inspecao',   label: 'Inspeção'   },
] as const

const inputStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text-1)',
}

function toDateInput(d: string | null | undefined): string {
  if (!d) return ''
  return d.length > 10 ? d.slice(0, 10) : d
}

const inputDisabled = {
  background: 'var(--bg-base)',
  border: '1px solid var(--border-sub)',
  color: 'var(--text-3)',
  cursor: 'not-allowed',
}

interface Props {
  servico:       ServicoUI | null
  estadoInicial: string
  lojas:         Pick<Loja, 'id' | 'nome'>[]
  equipas:       Pick<Equipa, 'id' | 'nome' | 'cor'>[]
  utilizadores:  Pick<Utilizador, 'id' | 'nome' | 'cargo'>[]
  cargo:         Cargo
  canEdit:       boolean
  onClose:       () => void
  onSaved:       (s: ServicoUI) => void
}

export default function ServicoModal({
  servico, estadoInicial, lojas, equipas, utilizadores, cargo, canEdit, onClose, onSaved,
}: Props) {
  const isEdicao  = !!servico
  const isTecnico = cargo === 'tecnico'
  const canSave   = canEdit || (isTecnico && isEdicao)

  const [tab, setTab] = useState<'detalhes' | 'materiais' | 'anexos'>('detalhes')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const [form, setForm] = useState({
    titulo:                 servico?.titulo                 ?? '',
    descricao:              servico?.descricao              ?? '',
    loja_id:                servico?.loja_id                ?? '',
    equipa_id:              servico?.equipa_id              ?? '',
    tecnico_responsavel_id: servico?.tecnico_responsavel_id ?? '',
    estado:                 servico?.estado                 ?? estadoInicial,
    prioridade:             servico?.prioridade             ?? 'normal',
    tipo:                   servico?.tipo                   ?? '',
    data_prevista:          toDateInput(servico?.data_prevista),
    data_inicio:            toDateInput(servico?.data_inicio),
    data_fim:               toDateInput(servico?.data_fim),
    horas_trabalhadas:      String(servico?.horas_trabalhadas ?? ''),
    custo_materiais:        String(servico?.custo_materiais  ?? ''),
    custo_mao_obra:         String(servico?.custo_mao_obra   ?? ''),
    observacoes:            servico?.observacoes             ?? '',
  })

  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const [membrosEquipa, setMembrosEquipa] = useState<{ utilizador_id: string }[]>([])
  useEffect(() => {
    if (!form.equipa_id) { setMembrosEquipa([]); return }
    fetch(`/api/admin/equipas/${form.equipa_id}/membros`)
      .then(r => r.json())
      .then(d => setMembrosEquipa(Array.isArray(d) ? d : []))
      .catch(() => setMembrosEquipa([]))
  }, [form.equipa_id])

  const tecnicosDisponiveis = form.equipa_id && membrosEquipa.length > 0
    ? utilizadores.filter(u => membrosEquipa.some(m => m.utilizador_id === u.id))
    : utilizadores

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setErro('')
    setLoading(true)
    try {
      let payload: Record<string, unknown>

      if (canEdit) {
        payload = {
          titulo:                 form.titulo,
          descricao:              form.descricao || null,
          loja_id:                form.loja_id,
          equipa_id:              form.equipa_id  || null,
          tecnico_responsavel_id: form.tecnico_responsavel_id || null,
          estado:                 form.estado,
          prioridade:             form.prioridade,
          tipo:                   form.tipo || null,
          data_prevista:          form.data_prevista || null,
          observacoes:            form.observacoes || null,
        }
        if (isEdicao) {
          payload.id                = servico!.id
          payload.data_inicio       = form.data_inicio       || null
          payload.data_fim          = form.data_fim          || null
          payload.horas_trabalhadas = form.horas_trabalhadas ? Number(form.horas_trabalhadas) : 0
          payload.custo_materiais   = form.custo_materiais   ? Number(form.custo_materiais)   : 0
          payload.custo_mao_obra    = form.custo_mao_obra    ? Number(form.custo_mao_obra)    : 0
        }
      } else {
        // técnico: apenas campos permitidos
        payload = {
          id:                servico!.id,
          estado:            form.estado,
          data_prevista:     form.data_prevista  || null,
          data_inicio:       form.data_inicio    || null,
          data_fim:          form.data_fim        || null,
          horas_trabalhadas: form.horas_trabalhadas ? Number(form.horas_trabalhadas) : 0,
          observacoes:       form.observacoes    || null,
        }
      }

      const method = isEdicao ? 'PATCH' : 'POST'
      const res  = await fetch('/api/admin/servicos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro desconhecido')
      onSaved(data as ServicoUI)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: '#00000065' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full md:max-w-2xl rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-sub)' }}
        >
          <h2
            className="font-bold text-base"
            style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}
          >
            {isEdicao ? `${servico!.numero} — ${servico!.titulo}` : 'Nova Intervenção'}
          </h2>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs (edit mode only) */}
        {isEdicao && (
          <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid var(--border-sub)' }}>
            {(['detalhes', 'materiais', 'anexos'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="px-5 py-3 text-sm font-medium border-b-2 transition-all capitalize"
                style={{
                  borderBottomColor: tab === t ? 'var(--accent)' : 'transparent',
                  color: tab === t ? 'var(--accent)' : 'var(--text-2)',
                  marginBottom: '-1px',
                }}
              >
                {t === 'detalhes' ? 'Detalhes' : t === 'materiais' ? 'Materiais' : 'Anexos'}
              </button>
            ))}
          </div>
        )}

        {/* ── Aba Detalhes ── */}
        {tab === 'detalhes' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {erro && (
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                >
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {erro}
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Título *</label>
                <input
                  required={canEdit}
                  readOnly={!canEdit}
                  value={form.titulo}
                  onChange={e => set('titulo', e.target.value)}
                  placeholder="Ex: Substituição de elevador"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={canEdit ? inputStyle : inputDisabled}
                  onFocus={e => { if (canEdit) e.target.style.borderColor = 'var(--accent)' }}
                  onBlur={e => { if (canEdit) e.target.style.borderColor = 'var(--border)' }}
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-2)' }}>Tipo</label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => canEdit && set('tipo', form.tipo === t.id ? '' : t.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: form.tipo === t.id ? 'var(--accent)' : 'var(--bg-card)',
                        color:      form.tipo === t.id ? '#fff'          : canEdit ? 'var(--text-2)' : 'var(--text-3)',
                        border:     `1px solid ${form.tipo === t.id ? 'var(--accent)' : 'var(--border-sub)'}`,
                        opacity:    !canEdit ? 0.7 : 1,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-2)' }}>Prioridade</label>
                <div className="flex gap-2">
                  {Object.entries(PRIORIDADE_META).map(([id, meta]) => (
                    <button
                      key={id}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => canEdit && set('prioridade', id)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: form.prioridade === id ? meta.cor : meta.bg,
                        color:      form.prioridade === id ? '#fff'    : meta.cor,
                        border:     `1px solid ${form.prioridade === id ? meta.cor : meta.cor + '40'}`,
                        opacity:    !canEdit ? 0.7 : 1,
                      }}
                    >
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Descrição</label>
                <textarea
                  readOnly={!canEdit}
                  value={form.descricao}
                  onChange={e => set('descricao', e.target.value)}
                  rows={2}
                  placeholder="Detalhe do problema ou trabalho a realizar..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={canEdit ? inputStyle : inputDisabled}
                  onFocus={e => { if (canEdit) e.target.style.borderColor = 'var(--accent)' }}
                  onBlur={e => { if (canEdit) e.target.style.borderColor = 'var(--border)' }}
                />
              </div>

              {/* Loja + Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Loja *</label>
                  <select
                    required={canEdit}
                    disabled={!canEdit}
                    value={form.loja_id}
                    onChange={e => set('loja_id', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={canEdit ? inputStyle : inputDisabled}
                  >
                    <option value="">Selecionar loja...</option>
                    {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Estado</label>
                  <select
                    value={form.estado}
                    onChange={e => set('estado', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  >
                    {COLUNAS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Equipa + Técnico */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Equipa</label>
                  <select
                    disabled={!canEdit}
                    value={form.equipa_id}
                    onChange={e => { set('equipa_id', e.target.value); set('tecnico_responsavel_id', '') }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={canEdit ? inputStyle : inputDisabled}
                  >
                    <option value="">Sem equipa</option>
                    {equipas.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Técnico responsável</label>
                  <select
                    disabled={!canEdit}
                    value={form.tecnico_responsavel_id}
                    onChange={e => set('tecnico_responsavel_id', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={canEdit ? inputStyle : inputDisabled}
                  >
                    <option value="">Sem técnico</option>
                    {tecnicosDisponiveis.map(u => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data prevista + Data início */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Data prevista</label>
                  <input
                    type="date"
                    value={form.data_prevista}
                    onChange={e => set('data_prevista', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                {isEdicao && (
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Data início</label>
                    <input
                      type="date"
                      value={form.data_inicio}
                      onChange={e => set('data_inicio', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>

              {isEdicao && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Data fim</label>
                    <input
                      type="date"
                      value={form.data_fim}
                      onChange={e => set('data_fim', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Horas trabalhadas</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={form.horas_trabalhadas}
                      onChange={e => set('horas_trabalhadas', e.target.value)}
                      placeholder="0.0"
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {isEdicao && cargo === 'admin' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Custo materiais (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      readOnly={!canEdit}
                      value={form.custo_materiais}
                      onChange={e => set('custo_materiais', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={canEdit ? inputStyle : inputDisabled}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Custo mão de obra (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      readOnly={!canEdit}
                      value={form.custo_mao_obra}
                      onChange={e => set('custo_mao_obra', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={canEdit ? inputStyle : inputDisabled}
                    />
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Observações</label>
                <textarea
                  value={form.observacoes}
                  onChange={e => set('observacoes', e.target.value)}
                  rows={2}
                  placeholder="Notas adicionais..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border-sub)' }}>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border-sub)' }}
              >
                Cancelar
              </button>
              {canSave && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'var(--accent)', color: '#fff', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'A guardar...' : isEdicao ? 'Guardar alterações' : 'Criar intervenção'}
                </button>
              )}
            </div>
          </form>
        )}

        {/* ── Aba Materiais ── */}
        {tab === 'materiais' && isEdicao && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <ServicoMateriais
                servicoId={servico!.id}
                canAdd={canEdit || isTecnico}
                canDelete={canEdit || isTecnico}
              />
            </div>
            <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border-sub)' }}>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border-sub)' }}
              >
                Fechar
              </button>
            </div>
          </>
        )}

        {/* ── Aba Anexos ── */}
        {tab === 'anexos' && isEdicao && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <ServicoAnexos
                servicoId={servico!.id}
                canUpload={canEdit || isTecnico}
                canDelete={canEdit}
              />
            </div>
            <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border-sub)' }}>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border-sub)' }}
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

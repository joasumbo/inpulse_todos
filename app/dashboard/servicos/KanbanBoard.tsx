'use client'

import { useMemo } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import type { ServicoUI } from './types'

export const COLUNAS = [
  { id: 'pendente'  as const, label: 'Pendente',  cor: '#6B7280', bg: '#F9FAFB' },
  { id: 'em_curso'  as const, label: 'Em Curso',  cor: '#3B82F6', bg: '#EFF6FF' },
  { id: 'resolvido' as const, label: 'Pausado',   cor: '#10B981', bg: '#F0FDF4' },
  { id: 'fechado'   as const, label: 'Fechado',   cor: '#374151', bg: '#F3F4F6' },
]

export const PRIORIDADE_META: Record<string, { label: string; cor: string; bg: string }> = {
  baixa:   { label: 'Baixa',   cor: '#6B7280', bg: '#F3F4F6' },
  normal:  { label: 'Normal',  cor: '#2563EB', bg: '#EFF6FF' },
  alta:    { label: 'Alta',    cor: '#D97706', bg: '#FFFBEB' },
  urgente: { label: 'Urgente', cor: '#DC2626', bg: '#FEF2F2' },
}

function formatDate(d: string | null) {
  if (!d) return null
  const date = new Date(d.length === 10 ? d + 'T00:00:00' : d)
  if (isNaN(date.getTime())) return null
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
}

// ─── Card visual ────────────────────────────────────────────────────────────

export function ServicoCard({ servico }: { servico: ServicoUI }) {
  const prio = PRIORIDADE_META[servico.prioridade] ?? PRIORIDADE_META.normal

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-sub)',
        borderLeft: `3px solid ${prio.cor}`,
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'box-shadow 0.15s',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: prio.bg, color: prio.cor }}>
          {prio.label}
        </span>
        <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
          {servico.numero}
        </span>
      </div>

      <p className="text-sm font-semibold mb-1.5 line-clamp-2" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display', lineHeight: 1.35 }}>
        {servico.titulo}
      </p>

      <div className="flex items-center gap-1 mb-2.5">
        <MapPin size={10} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        <span className="text-xs truncate" style={{ color: 'var(--text-3)' }}>
          {(servico.loja as { nome: string } | null)?.nome ?? '—'}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-sub)' }}>
        <div className="flex items-center gap-2 min-w-0">
          {servico.data_prevista && (
            <div className="flex items-center gap-1">
              <Calendar size={10} style={{ color: 'var(--text-3)' }} />
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                {formatDate(servico.data_prevista)}
              </span>
            </div>
          )}
          {servico.equipa && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-md font-semibold truncate max-w-20"
              style={{
                background: (servico.equipa as { cor: string }).cor + '22',
                color: (servico.equipa as { cor: string }).cor,
              }}
            >
              {(servico.equipa as { nome: string }).nome.slice(0, 6)}
            </span>
          )}
        </div>
        {servico.tecnico && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ml-2"
            style={{ background: 'var(--accent)', color: '#fff' }}
            title={(servico.tecnico as { nome: string }).nome}
          >
            {(servico.tecnico as { nome: string }).nome.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Column ──────────────────────────────────────────────────────────────────

function KanbanColuna({
  coluna, cards, onCardClick,
}: {
  coluna: typeof COLUNAS[number]
  cards: ServicoUI[]
  onCardClick: (s: ServicoUI) => void
}) {
  return (
    <div
      className="flex flex-col flex-shrink-0 rounded-2xl overflow-hidden"
      style={{
        width: '272px',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-sub)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-sub)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: coluna.cor }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            {coluna.label}
          </span>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: coluna.cor + '20', color: coluna.cor }}>
          {cards.length}
        </span>
      </div>

      {/* Cards — sem altura máxima, a página faz scroll */}
      <div className="p-3 space-y-2.5">
        {cards.map(s => (
          <div key={s.id} onClick={() => onCardClick(s)}>
            <ServicoCard servico={s} />
          </div>
        ))}
        {cards.length === 0 && (
          <div
            className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed"
            style={{ borderColor: 'var(--border-sub)', color: 'var(--text-3)' }}
          >
            <span className="text-xs">Vazio</span>
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Board ───────────────────────────────────────────────────────────────────

interface Props {
  servicos:    ServicoUI[]
  onCardClick: (s: ServicoUI) => void
}

export default function KanbanBoard({ servicos, onCardClick }: Props) {
  const grouped = useMemo(() => {
    const g: Record<string, ServicoUI[]> = {}
    for (const col of COLUNAS) g[col.id] = []
    for (const s of servicos) {
      if (g[s.estado]) g[s.estado].push(s)
    }
    return g
  }, [servicos])

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
      {COLUNAS.map(col => (
        <KanbanColuna
          key={col.id}
          coluna={col}
          cards={grouped[col.id] ?? []}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  )
}

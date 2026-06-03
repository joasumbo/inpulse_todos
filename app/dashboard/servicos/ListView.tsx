'use client'

import { ChevronRight, AlertCircle, MapPin, Calendar } from 'lucide-react'
import type { ServicoUI } from './types'
import { PRIORIDADE_META, COLUNAS } from './KanbanBoard'

const ESTADO_META: Record<string, { label: string; cor: string; bg: string }> = Object.fromEntries(
  COLUNAS.map(c => [c.id, { label: c.label, cor: c.cor, bg: c.bg }])
)

const TIPO_LABEL: Record<string, string> = {
  preventiva: 'Preventiva',
  corretiva:  'Corretiva',
  emergencia: 'Emergência',
  inspecao:   'Inspeção',
}

function formatDate(d: string | null) {
  if (!d) return '—'
  const date = new Date(d.length === 10 ? d + 'T00:00:00' : d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: '2-digit' })
}

interface Props {
  servicos: ServicoUI[]
  onCardClick: (s: ServicoUI) => void
}

export default function ListView({ servicos, onCardClick }: Props) {
  if (servicos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle size={32} style={{ color: 'var(--text-3)' }} />
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>Nenhum serviço encontrado</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop: tabela ── */}
      <div
        className="hidden md:block rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border-sub)' }}
      >
        {/* Header row */}
        <div
          className="grid text-xs font-semibold uppercase tracking-wider px-5 py-3"
          style={{
            gridTemplateColumns: '90px 1fr 140px 120px 90px 100px 100px 36px',
            background: 'var(--bg-card)',
            color: 'var(--text-3)',
            borderBottom: '1px solid var(--border-sub)',
          }}
        >
          <span>#</span>
          <span>Título</span>
          <span>Loja</span>
          <span>Equipa</span>
          <span>Tipo</span>
          <span>Prioridade</span>
          <span>Estado</span>
          <span />
        </div>

        {/* Rows */}
        {servicos.map((s, i) => {
          const prio  = PRIORIDADE_META[s.prioridade] ?? PRIORIDADE_META.normal
          const est   = ESTADO_META[s.estado]         ?? ESTADO_META.pendente
          const isLast = i === servicos.length - 1

          return (
            <button
              key={s.id}
              onClick={() => onCardClick(s)}
              className="grid w-full px-5 py-3.5 text-left transition-all"
              style={{
                gridTemplateColumns: '90px 1fr 140px 120px 90px 100px 100px 36px',
                borderBottom: isLast ? 'none' : '1px solid var(--border-sub)',
                background: 'var(--bg-surface)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
            >
              <span className="text-xs font-mono self-center" style={{ color: 'var(--text-3)' }}>
                {s.numero}
              </span>
              <div className="min-w-0 self-center pr-4">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
                  {s.titulo}
                </p>
                {s.data_prevista && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                    Previsto: {formatDate(s.data_prevista)}
                  </p>
                )}
              </div>
              <span className="text-xs self-center truncate pr-2" style={{ color: 'var(--text-2)' }}>
                {(s.loja as { nome: string } | null)?.nome ?? '—'}
              </span>
              <div className="self-center">
                {s.equipa ? (
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: (s.equipa as { cor: string }).cor + '22', color: (s.equipa as { cor: string }).cor }}>
                    {(s.equipa as { nome: string }).nome}
                  </span>
                ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
              </div>
              <span className="text-xs self-center" style={{ color: 'var(--text-2)' }}>
                {s.tipo ? TIPO_LABEL[s.tipo] : '—'}
              </span>
              <div className="self-center">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: prio.bg, color: prio.cor }}>
                  {prio.label}
                </span>
              </div>
              <div className="self-center">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: est.bg, color: est.cor }}>
                  {est.label}
                </span>
              </div>
              <div className="flex items-center justify-end self-center">
                <ChevronRight size={15} style={{ color: 'var(--text-3)' }} />
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Mobile: cards ── */}
      <div className="md:hidden space-y-3">
        {servicos.map(s => {
          const prio = PRIORIDADE_META[s.prioridade] ?? PRIORIDADE_META.normal
          const est  = ESTADO_META[s.estado]         ?? ESTADO_META.pendente
          return (
            <button
              key={s.id}
              onClick={() => onCardClick(s)}
              className="w-full text-left rounded-2xl p-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)', borderLeft: `3px solid ${prio.cor}` }}
            >
              {/* Row 1: numero + badges */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{s.numero}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: prio.bg, color: prio.cor }}>
                    {prio.label}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: est.bg, color: est.cor }}>
                    {est.label}
                  </span>
                </div>
              </div>

              {/* Row 2: título */}
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
                {s.titulo}
              </p>

              {/* Row 3: loja + data */}
              <div className="flex items-center gap-3" style={{ color: 'var(--text-3)' }}>
                {(s.loja as { nome: string } | null)?.nome && (
                  <div className="flex items-center gap-1">
                    <MapPin size={11} />
                    <span className="text-xs">{(s.loja as { nome: string }).nome}</span>
                  </div>
                )}
                {s.data_prevista && (
                  <div className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span className="text-xs">{formatDate(s.data_prevista)}</span>
                  </div>
                )}
                {s.equipa && (
                  <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold" style={{ background: (s.equipa as { cor: string }).cor + '22', color: (s.equipa as { cor: string }).cor }}>
                    {(s.equipa as { nome: string }).nome}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import {
  Loader2, ClipboardList, TrendingUp, Clock,
  BarChart3, Package, AlertCircle,
} from 'lucide-react'

interface Sumario {
  total_servicos: number
  custo_total:    number
  horas_total:    number
  media_horas:    number
}
interface ByEstado { estado: string; total: number }
interface ByName   { nome:   string; total: number }
interface MaterialRow {
  nome:        string
  referencia:  string | null
  unidade:     string
  qtd_total:   number
  custo_total: number
}
interface MesRow {
  mes:             string
  servicos:        number
  custo_materiais: number
  custo_mao_obra:  number
  horas:           number
}
interface Dados {
  sumario:    Sumario
  por_estado: ByEstado[]
  por_equipa: ByName[]
  por_loja:   ByName[]
  materiais:  MaterialRow[]
  por_mes:    MesRow[]
}

const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
function fmtMes(mes: string) {
  const [yr, mo] = mes.split('-')
  return MESES[Number(mo) - 1] + '/' + yr.slice(2)
}
function fmt(n: number) {
  return Number(n).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
}

const ESTADO_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pendente:  { label: 'Pendente',  color: '#92400e', bg: '#fef3c7' },
  em_curso:  { label: 'Em curso',  color: '#1e40af', bg: '#dbeafe' },
  resolvido: { label: 'Resolvido', color: '#166534', bg: '#dcfce7' },
  fechado:   { label: 'Fechado',   color: '#374151', bg: '#f3f4f6' },
  faturado:  { label: 'Faturado',  color: '#6d28d9', bg: '#ede9fe' },
}

const PALETTE = [
  '#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444',
  '#06b6d4','#84cc16','#f97316','#ec4899','#6366f1',
]

function BarH({ label, value, max, color }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-sm truncate text-right flex-shrink-0"
        style={{ width: '128px', color: 'var(--text-2)' }}
      >
        {label}
      </span>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: '8px', background: 'var(--bg-card)' }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color ?? 'var(--accent)',
            borderRadius: 'inherit',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <span
        className="text-sm font-bold text-right flex-shrink-0"
        style={{ width: '28px', color: 'var(--text-1)' }}
      >
        {value}
      </span>
    </div>
  )
}

function EmptyState({ msg }: { msg?: string }) {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="text-sm" style={{ color: 'var(--text-3)' }}>{msg ?? 'Sem dados no período'}</p>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}
    >
      {children}
    </div>
  )
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-sub)' }}>
      <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{subtitle}</p>
      )}
    </div>
  )
}

export default function RelatoriosClient() {
  const [dias, setDias]    = useState<30 | 90 | 180 | 365>(30)
  const [dados, setDados]  = useState<Dados | null>(null)
  const [loading, setLoad] = useState(true)
  const [erro, setErro]    = useState('')

  useEffect(() => {
    setLoad(true)
    setErro('')
    fetch(`/api/admin/relatorios?dias=${dias}`)
      .then(r => r.json())
      .then(d => { if (d.error) setErro(d.error); else setDados(d) })
      .catch(() => setErro('Erro ao carregar relatório'))
      .finally(() => setLoad(false))
  }, [dias])

  const PERIODOS: { v: 30 | 90 | 180 | 365; label: string }[] = [
    { v: 30,  label: '30 dias'  },
    { v: 90,  label: '90 dias'  },
    { v: 180, label: '6 meses'  },
    { v: 365, label: '12 meses' },
  ]

  return (
    <div className="p-8 max-w-7xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}
          >
            Relatórios
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
            Análise operacional e financeira
          </p>
        </div>
        <div className="flex gap-1.5">
          {PERIODOS.map(p => (
            <button
              key={p.v}
              onClick={() => setDias(p.v)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: dias === p.v ? 'var(--accent)'   : 'var(--bg-surface)',
                color:      dias === p.v ? '#fff'             : 'var(--text-2)',
                border:     `1px solid ${dias === p.v ? 'var(--accent)' : 'var(--border-sub)'}`,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-3)' }} />
        </div>
      ) : erro ? (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
        >
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="text-sm">{erro}</span>
        </div>
      ) : dados ? (
        <Content dados={dados} />
      ) : null}
    </div>
  )
}

function Content({ dados }: { dados: Dados }) {
  const { sumario, por_estado, por_equipa, por_loja, materiais, por_mes } = dados

  const kpis = [
    {
      label: 'Total Serviços',
      value: String(sumario.total_servicos),
      icon: ClipboardList,
      color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
    },
    {
      label: 'Custo Total',
      value: fmt(sumario.custo_total),
      icon: TrendingUp,
      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
    },
    {
      label: 'Horas Trabalhadas',
      value: `${Number(sumario.horas_total).toFixed(1)} h`,
      icon: Clock,
      color: '#d97706', bg: '#fef9ee', border: '#fde68a',
    },
    {
      label: 'Média h/Serviço',
      value: `${Number(sumario.media_horas).toFixed(1)} h`,
      icon: BarChart3,
      color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff',
    },
  ]

  const maxEquipa = Math.max(...(por_equipa ?? []).map(x => x.total), 1)
  const maxLoja   = Math.max(...(por_loja   ?? []).map(x => x.total), 1)

  const maxMesCusto = Math.max(
    ...(por_mes ?? []).map(m => m.custo_materiais + m.custo_mao_obra),
    1,
  )
  const BAR_H = 108

  return (
    <>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <Icon size={17} style={{ color }} />
            </div>
            <div>
              <p
                className="text-xl font-bold"
                style={{ color, fontFamily: 'Red Hat Display' }}
              >
                {value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Por Estado + Por Equipa */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        <Card>
          <CardHeader title="Por Estado" />
          {!por_estado?.length ? <EmptyState /> : (
            <div className="px-6 py-5 space-y-3">
              {(() => {
                const maxE = Math.max(...por_estado.map(x => x.total), 1)
                return por_estado.map(({ estado, total }) => {
                  const cfg = ESTADO_CFG[estado] ?? { label: estado, color: '#6b7280', bg: '#f3f4f6' }
                  const pct = Math.round((total / maxE) * 100)
                  return (
                    <div key={estado} className="flex items-center gap-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full text-center flex-shrink-0"
                        style={{ background: cfg.bg, color: cfg.color, width: '88px' }}
                      >
                        {cfg.label}
                      </span>
                      <div
                        className="flex-1 rounded-full overflow-hidden"
                        style={{ height: '8px', background: 'var(--bg-card)' }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: cfg.color,
                            borderRadius: 'inherit',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                      <span
                        className="text-sm font-bold text-right flex-shrink-0"
                        style={{ width: '28px', color: 'var(--text-1)' }}
                      >
                        {total}
                      </span>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Por Equipa" />
          {!por_equipa?.length ? <EmptyState /> : (
            <div className="px-6 py-5 space-y-3">
              {por_equipa.map(({ nome, total }, i) => (
                <BarH
                  key={nome}
                  label={nome}
                  value={total}
                  max={maxEquipa}
                  color={PALETTE[i % PALETTE.length]}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Por Loja */}
      <Card>
        <CardHeader title="Por Loja" />
        {!por_loja?.length ? <EmptyState /> : (
          <div className="px-6 py-5 space-y-3">
            {por_loja.map(({ nome, total }, i) => (
              <BarH
                key={nome}
                label={nome}
                value={total}
                max={maxLoja}
                color={PALETTE[(i + 3) % PALETTE.length]}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Evolução Mensal */}
      {por_mes?.length > 0 && (
        <Card>
          <CardHeader
            title="Evolução Mensal"
            subtitle="Custo total (materiais + mão de obra)"
          />
          <div className="px-6 py-5">
            <div
              className="flex items-end gap-2 overflow-x-auto pb-1"
              style={{ height: '156px' }}
            >
              {por_mes.map((m, i) => {
                const custo = m.custo_materiais + m.custo_mao_obra
                const barH  = maxMesCusto > 0
                  ? Math.max(Math.round((custo / maxMesCusto) * BAR_H), 3)
                  : 3
                return (
                  <div
                    key={m.mes}
                    className="flex-1 flex flex-col items-center justify-end gap-1.5"
                    style={{ minWidth: '40px', height: '100%' }}
                  >
                    <span
                      className="text-center"
                      style={{ fontSize: '10px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}
                    >
                      {custo > 0 ? fmt(custo) : '—'}
                    </span>
                    <div
                      title={`${m.servicos} serviço${m.servicos !== 1 ? 's' : ''} • ${fmt(custo)}`}
                      style={{
                        width: '100%',
                        height: `${barH}px`,
                        background: PALETTE[i % PALETTE.length],
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.4s ease',
                      }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                      {fmtMes(m.mes)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Materiais mais usados */}
      <Card>
        <div
          className="px-6 py-4 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--border-sub)' }}
        >
          <Package size={15} style={{ color: 'var(--text-3)' }} />
          <h2
            className="text-sm font-semibold"
            style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}
          >
            Materiais mais usados
          </h2>
        </div>

        {!materiais?.length ? (
          <EmptyState msg="Sem materiais registados no período" />
        ) : (
          <>
            <div
              className="grid text-xs font-semibold uppercase tracking-wider px-6 py-2.5"
              style={{
                gridTemplateColumns: '1fr 100px 70px 90px 110px',
                background: 'var(--bg-card)',
                color: 'var(--text-3)',
                borderBottom: '1px solid var(--border-sub)',
              }}
            >
              <span>Material</span>
              <span>Referência</span>
              <span>Unidade</span>
              <span>Qtd Total</span>
              <span>Custo Total</span>
            </div>

            {materiais.map((m, i) => (
              <div
                key={m.nome + i}
                className="grid items-center px-6 py-3"
                style={{
                  gridTemplateColumns: '1fr 100px 70px 90px 110px',
                  borderBottom: i < materiais.length - 1 ? '1px solid var(--border-sub)' : 'none',
                  background: 'var(--bg-surface)',
                }}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                  {m.nome}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
                  {m.referencia ?? '—'}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>
                  {m.unidade}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>
                  {Number(m.qtd_total).toLocaleString('pt-PT')}
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
                  {fmt(m.custo_total)}
                </span>
              </div>
            ))}
          </>
        )}
      </Card>

      {/* spacing at bottom */}
      <div className="h-8" />
    </>
  )
}

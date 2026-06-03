import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const { data: perfil } = await supabase
      .from('maint_utilizadores')
      .select('cargo')
      .eq('user_id', session.user.id)
      .eq('ativo', true)
      .single()
    if (perfil?.cargo === 'tecnico') redirect('/dashboard/servicos')
  }

  const [{ data: stats }, { data: recentes }] = await Promise.all([
    supabase.from('maint_v_dashboard').select('*').single(),
    supabase
      .from('maint_v_servicos')
      .select('id,numero,titulo,estado,prioridade,loja_nome,data_prevista,created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const s = stats ?? {}

  const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pendente:  { label: 'Pendente',  color: '#92400e', bg: '#fef3c7' },
    em_curso:  { label: 'Em curso',  color: '#1e40af', bg: '#dbeafe' },
    resolvido: { label: 'Pausado',  color: '#166534', bg: '#dcfce7' },
    fechado:   { label: 'Fechado',   color: '#374151', bg: '#f3f4f6' },
    faturado:  { label: 'Faturado',  color: '#6d28d9', bg: '#ede9fe' },
  }

  const PRIO_CONFIG: Record<string, { label: string; color: string }> = {
    baixa:   { label: 'Baixa',   color: '#6b7280' },
    normal:  { label: 'Normal',  color: '#2563eb' },
    alta:    { label: 'Alta',    color: '#d97706' },
    urgente: { label: 'Urgente', color: '#dc2626' },
  }

  const kpis = [
    {
      label: 'Pendentes',
      value: s.pendentes ?? 0,
      icon: Clock,
      color: '#d97706',
      bg: '#fef9ee',
      border: '#fde68a',
    },
    {
      label: 'Em Curso',
      value: s.em_curso ?? 0,
      icon: ClipboardList,
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
    },
    {
      label: 'Resolvidos',
      value: s.resolvidos ?? 0,
      icon: CheckCircle2,
      color: '#16a34a',
      bg: '#f0fdf4',
      border: '#bbf7d0',
    },
    {
      label: 'Urgentes',
      value: s.urgentes ?? 0,
      icon: AlertTriangle,
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
    },
    {
      label: 'Fechados',
      value: s.fechados ?? 0,
      icon: XCircle,
      color: '#4b5563',
      bg: '#f9fafb',
      border: '#e5e7eb',
    },
    {
      label: 'Total',
      value: s.total_servicos ?? 0,
      icon: ClipboardList,
      color: '#0891b2',
      bg: '#ecfeff',
      border: '#a5f3fc',
    },
  ]

  return (
    <div className="p-8 max-w-7xl">

      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
          Resumo operacional em tempo real
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <Icon size={17} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color, fontFamily: 'Red Hat Display' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Serviços recentes */}
      <div>
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-sub)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
              Serviços Recentes
            </h2>
          </div>

          {!recentes?.length ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>Nenhum serviço registado</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-sub)' }}>
              {recentes.map(srv => {
                const estado = ESTADO_CONFIG[srv.estado] ?? ESTADO_CONFIG.pendente
                const prio   = PRIO_CONFIG[srv.prioridade]
                return (
                  <div key={srv.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
                          {srv.numero}
                        </span>
                        {srv.prioridade === 'urgente' && (
                          <AlertTriangle size={12} style={{ color: '#ef4444' }} />
                        )}
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>
                        {srv.titulo}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>
                        {srv.loja_nome}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: estado.bg, color: estado.color }}>
                        {estado.label}
                      </span>
                      <span className="text-xs" style={{ color: prio?.color ?? 'var(--text-3)' }}>
                        {prio?.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

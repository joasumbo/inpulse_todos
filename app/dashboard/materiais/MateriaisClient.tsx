'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, AlertTriangle, Package } from 'lucide-react'
import MaterialModal, { type Material } from './MaterialModal'
import type { Cargo } from '@/types'

interface Props {
  materiais: Material[]
  cargo:     Cargo
}

function stockStatus(m: Material) {
  if (m.stock_atual <= 0) return { label: 'Esgotado',    cor: '#DC2626', bg: '#FEF2F2' }
  if (m.stock_minimo > 0 && m.stock_atual <= m.stock_minimo) {
    return { label: 'Stock baixo', cor: '#D97706', bg: '#FFFBEB' }
  }
  return { label: 'OK', cor: '#10B981', bg: '#F0FDF4' }
}

function fmt(n: number) {
  return n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
}

type Filtro = 'todos' | 'baixo' | 'esgotado' | 'inativos'

export default function MateriaisClient({ materiais: inicial, cargo }: Props) {
  const canEdit = cargo === 'admin' || cargo === 'supervisor'

  const [lista,    setLista]   = useState<Material[]>(inicial)
  const [pesquisa, setPesq]    = useState('')
  const [filtro,   setFiltro]  = useState<Filtro>('todos')
  const [modal,    setModal]   = useState(false)
  const [sel,      setSel]     = useState<Material | null>(null)

  function abrirNovo()         { setSel(null);    setModal(true) }
  function abrirEditar(m: Material) { setSel(m); setModal(true) }

  function onSaved(m: Material) {
    setLista(prev => {
      const existe = prev.find(x => x.id === m.id)
      if (existe) return prev.map(x => x.id === m.id ? m : x)
      return [m, ...prev]
    })
    setModal(false)
  }

  const filtrados = useMemo(() => {
    return lista.filter(m => {
      if (pesquisa) {
        const q = pesquisa.toLowerCase()
        if (!m.nome.toLowerCase().includes(q) && !(m.referencia ?? '').toLowerCase().includes(q)) return false
      }
      if (filtro === 'inativos') return !m.ativo
      if (!m.ativo) return false
      if (filtro === 'baixo')    return m.stock_minimo > 0 && m.stock_atual > 0 && m.stock_atual <= m.stock_minimo
      if (filtro === 'esgotado') return m.stock_atual <= 0
      return true
    })
  }, [lista, pesquisa, filtro])

  const ativos   = lista.filter(m => m.ativo)
  const baixo    = ativos.filter(m => m.stock_minimo > 0 && m.stock_atual > 0 && m.stock_atual <= m.stock_minimo).length
  const esgotado = ativos.filter(m => m.stock_atual <= 0).length

  const FILTROS: { id: Filtro; label: string }[] = [
    { id: 'todos',    label: 'Todos'      },
    { id: 'baixo',    label: 'Stock baixo'},
    { id: 'esgotado', label: 'Esgotado'   },
    { id: 'inativos', label: 'Inativos'   },
  ]

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            Materiais
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
            {ativos.length} itens ativos
            {baixo > 0    && <> &middot; <span style={{ color: '#D97706' }}>{baixo} stock baixo</span></>}
            {esgotado > 0 && <> &middot; <span style={{ color: '#DC2626' }}>{esgotado} esgotados</span></>}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <Plus size={16} />
            Novo Material
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Pesquisar por nome ou referência..."
            value={pesquisa}
            onChange={e => setPesq(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
          />
        </div>

        <div className="flex gap-1.5">
          {FILTROS.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filtro === f.id ? 'var(--accent)'   : 'var(--bg-surface)',
                color:      filtro === f.id ? '#fff'             : 'var(--text-2)',
                border:     `1px solid ${filtro === f.id ? 'var(--accent)' : 'var(--border-sub)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Package size={32} style={{ color: 'var(--text-3)' }} />
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>Nenhum material encontrado</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-sub)' }}>
          {/* Header row */}
          <div
            className="grid text-xs font-semibold uppercase tracking-wider px-5 py-3"
            style={{
              gridTemplateColumns: '110px 1fr 90px 90px 120px 90px 48px',
              background: 'var(--bg-card)',
              color: 'var(--text-3)',
              borderBottom: '1px solid var(--border-sub)',
            }}
          >
            <span>Referência</span>
            <span>Nome</span>
            <span>Unidade</span>
            <span>€/un</span>
            <span>Stock</span>
            <span>Estado</span>
            <span />
          </div>

          {/* Rows */}
          {filtrados.map((m, i) => {
            const st = stockStatus(m)
            const isLast = i === filtrados.length - 1
            return (
              <div
                key={m.id}
                className="grid items-center px-5 py-3.5"
                style={{
                  gridTemplateColumns: '110px 1fr 90px 90px 120px 90px 48px',
                  borderBottom: isLast ? 'none' : '1px solid var(--border-sub)',
                  background: 'var(--bg-surface)',
                  opacity: m.ativo ? 1 : 0.5,
                }}
              >
                <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
                  {m.referencia ?? '—'}
                </span>
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
                    {m.nome}
                  </p>
                  {m.descricao && (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-3)' }}>{m.descricao}</p>
                  )}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>{m.unidade}</span>
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>{fmt(m.preco_unit)}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
                    {m.stock_atual}
                  </span>
                  {m.stock_minimo > 0 && (
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>/ mín {m.stock_minimo}</span>
                  )}
                  {m.stock_atual <= m.stock_minimo && m.stock_atual > 0 && m.stock_minimo > 0 && (
                    <AlertTriangle size={13} style={{ color: '#D97706' }} />
                  )}
                </div>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                  style={{ background: st.bg, color: st.cor }}
                >
                  {st.label}
                </span>
                {canEdit && (
                  <button
                    onClick={() => abrirEditar(m)}
                    className="flex items-center justify-center p-1.5 rounded-lg transition-all ml-auto"
                    style={{ color: 'var(--text-3)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--accent)'
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'
                      ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <MaterialModal
          material={sel}
          onClose={() => setModal(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}

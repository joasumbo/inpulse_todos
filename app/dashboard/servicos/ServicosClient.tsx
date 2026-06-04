'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, LayoutGrid, List, ChevronDown } from 'lucide-react'
import type { Loja, Equipa, Utilizador, Cargo } from '@/types'
import type { ServicoUI } from './types'
import KanbanBoard, { COLUNAS, PRIORIDADE_META } from './KanbanBoard'
import ListView from './ListView'
import ServicoModal from './ServicoModal'

interface Props {
  servicos:     ServicoUI[]
  lojas:        Pick<Loja, 'id' | 'nome'>[]
  equipas:      Pick<Equipa, 'id' | 'nome' | 'cor'>[]
  utilizadores: Pick<Utilizador, 'id' | 'nome' | 'cargo'>[]
  cargo:        Cargo
  equipaPadrao?: string
}

export default function ServicosClient({ servicos: inicial, lojas, equipas, utilizadores, cargo, equipaPadrao }: Props) {
  const canEdit = cargo === 'admin' || cargo === 'supervisor'

  const [lista,        setLista]       = useState<ServicoUI[]>(inicial)
  const [view,         setView]        = useState<'kanban' | 'lista'>('kanban')
  const [pesquisa,     setPesquisa]    = useState('')
  const [filtroEquipa, setFiltroEq]   = useState(equipaPadrao ?? '')
  const [filtroPrio,   setFiltroPrio]  = useState('')
  const [filtroEstado, setFiltroEst]  = useState('')
  const [filtroLoja,   setFiltroLoja] = useState('')
  const [modalAberto,  setModal]       = useState(false)
  const [selecionado,  setSel]         = useState<ServicoUI | null>(null)
  const [estadoInicial, setEstadoIni] = useState('pendente')

  function abrirNovo(estado = 'pendente') {
    setSel(null)
    setEstadoIni(estado)
    setModal(true)
  }
  function abrirEditar(s: ServicoUI) {
    setSel(s)
    setModal(true)
  }

  function onSaved(s: ServicoUI) {
    setLista(prev => {
      const existe = prev.find(x => x.id === s.id)
      return existe ? prev.map(x => x.id === s.id ? s : x) : [s, ...prev]
    })
    setModal(false)
  }

  function onDeleted(id: string) {
    setLista(prev => prev.filter(x => x.id !== id))
    setModal(false)
  }


  const filtrados = useMemo(() => {
    return lista.filter(s => {
      if (pesquisa) {
        const q = pesquisa.toLowerCase()
        if (!s.titulo.toLowerCase().includes(q) && !(s.numero ?? '').toLowerCase().includes(q)) return false
      }
      if (filtroEquipa && s.equipa_id !== filtroEquipa) return false
      if (filtroPrio   && s.prioridade !== filtroPrio)   return false
      if (view === 'lista') {
        if (filtroEstado && s.estado !== filtroEstado) return false
        if (filtroLoja   && s.loja_id !== filtroLoja)  return false
      }
      return true
    })
  }, [lista, pesquisa, filtroEquipa, filtroPrio, filtroEstado, filtroLoja, view])

  const total     = lista.length
  const pendentes = lista.filter(s => s.estado === 'pendente').length
  const em_curso  = lista.filter(s => s.estado === 'em_curso').length

  return (
    <div className="p-4 md:p-8">

      {/* Header */}
      <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}
          >
            Serviços
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
            {total} intervenções &middot; {pendentes} pendentes &middot; {em_curso} em curso
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-sub)', background: 'var(--bg-card)' }}
          >
            {(['kanban', 'lista'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: view === v ? 'var(--accent)' : 'transparent',
                  color:      view === v ? '#fff'          : 'var(--text-2)',
                }}
              >
                {v === 'kanban' ? <LayoutGrid size={16} /> : <List size={16} />}
                {v === 'kanban' ? 'Mosaico' : 'Lista'}
              </button>
            ))}
          </div>

          {canEdit && (
            <button
              onClick={() => abrirNovo()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-1 md:flex-none justify-center"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <Plus size={16} />
              Novo Serviço
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Pesquisar serviços..."
            value={pesquisa}
            onChange={e => setPesquisa(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
          />
        </div>

        {/* Equipa filter */}
        <div className="relative">
          <select
            value={filtroEquipa}
            onChange={e => setFiltroEq(e.target.value)}
            className="pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none appearance-none"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: filtroEquipa ? 'var(--text-1)' : 'var(--text-3)' }}
          >
            <option value="">Todas as equipas</option>
            {equipas.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-3)' }} />
        </div>

        {/* Prioridade chips */}
        <div className="flex gap-1.5">
          {Object.entries(PRIORIDADE_META).map(([id, meta]) => (
            <button
              key={id}
              onClick={() => setFiltroPrio(prev => prev === id ? '' : id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filtroPrio === id ? meta.cor : meta.bg,
                color:      filtroPrio === id ? '#fff'   : meta.cor,
                border:     `1px solid ${meta.cor + '40'}`,
              }}
            >
              {meta.label}
            </button>
          ))}
        </div>

        {/* Estado filter (lista only) */}
        {view === 'lista' && (
          <>
            <div className="relative">
              <select
                value={filtroEstado}
                onChange={e => setFiltroEst(e.target.value)}
                className="pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none appearance-none"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: filtroEstado ? 'var(--text-1)' : 'var(--text-3)' }}
              >
                <option value="">Todos os estados</option>
                {COLUNAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-3)' }} />
            </div>

            <div className="relative">
              <select
                value={filtroLoja}
                onChange={e => setFiltroLoja(e.target.value)}
                className="pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none appearance-none"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: filtroLoja ? 'var(--text-1)' : 'var(--text-3)' }}
              >
                <option value="">Todas as lojas</option>
                {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-3)' }} />
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {view === 'kanban' ? (
        <KanbanBoard
          servicos={filtrados}
          onCardClick={abrirEditar}
        />
      ) : (
        <ListView servicos={filtrados} onCardClick={abrirEditar} />
      )}

      {/* Modal */}
      {modalAberto && (
        <ServicoModal
          servico={selecionado}
          estadoInicial={estadoInicial}
          lojas={lojas}
          equipas={equipas}
          utilizadores={utilizadores}
          cargo={cargo}
          canEdit={canEdit}
          onClose={() => setModal(false)}
          onSaved={onSaved}
          onDeleted={cargo === 'admin' ? onDeleted : undefined}
        />
      )}
    </div>
  )
}

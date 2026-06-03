'use client'

import { useState } from 'react'
import { Plus, Search, Users, Circle, ChevronRight } from 'lucide-react'
import type { Equipa, Utilizador } from '@/types'
import EquipaModal from './EquipaModal'

interface Props {
  equipas: Equipa[]
  utilizadores: Pick<Utilizador, 'id' | 'nome' | 'cargo' | 'email'>[]
  contagemMembros: Record<string, number>
}

export default function EquipasClient({ equipas: inicial, utilizadores, contagemMembros }: Props) {
  const [lista,    setLista]   = useState<Equipa[]>(inicial)
  const [contagem, setContagem] = useState<Record<string, number>>(contagemMembros)
  const [modalAberto, setModal] = useState(false)
  const [selecionada, setSel]   = useState<Equipa | null>(null)
  const [pesquisa,  setPesquisa] = useState('')
  const [filtro,    setFiltro]   = useState<'todos' | 'ativa' | 'inativa'>('todos')

  function abrirCriar()           { setSel(null); setModal(true) }
  function abrirEditar(e: Equipa) { setSel(e);    setModal(true) }

  function onSaved(e: Equipa) {
    setLista(prev => {
      const existe = prev.find(x => x.id === e.id)
      return existe ? prev.map(x => x.id === e.id ? e : x) : [e, ...prev]
    })
    setContagem(prev => prev[e.id] !== undefined ? prev : { ...prev, [e.id]: 0 })
    setModal(false)
  }

  const filtradas = lista.filter(e => {
    const q = pesquisa.toLowerCase()
    const matchQ = e.nome.toLowerCase().includes(q) || (e.descricao ?? '').toLowerCase().includes(q)
    const matchF = filtro === 'todos' || (filtro === 'ativa' ? e.ativa : !e.ativa)
    return matchQ && matchF
  })

  const ativas   = lista.filter(e => e.ativa).length
  const inativas = lista.filter(e => !e.ativa).length

  return (
    <div className="p-8 max-w-6xl">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            Equipas
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
            {lista.length} equipas &middot; {ativas} ativas &middot; {inativas} inativas
          </p>
        </div>
        <button
          onClick={abrirCriar}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Plus size={16} />
          Nova Equipa
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Pesquisar equipas..."
            value={pesquisa}
            onChange={e => setPesquisa(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
          />
        </div>
        {(['todos', 'ativa', 'inativa'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background: filtro === f ? 'var(--accent)' : 'var(--bg-surface)',
              color: filtro === f ? '#fff' : 'var(--text-2)',
              border: `1px solid ${filtro === f ? 'var(--accent)' : 'var(--border-sub)'}`,
            }}
          >
            {f === 'todos' ? 'Todas' : f === 'ativa' ? 'Ativas' : 'Inativas'}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtradas.length === 0 ? (
        <div className="text-center py-20 text-sm" style={{ color: 'var(--text-3)' }}>
          Nenhuma equipa encontrada
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map(e => {
            const count = contagem[e.id] ?? 0
            return (
              <div
                key={e.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}
              >
                {/* Barra colorida */}
                <div className="h-1.5" style={{ background: e.cor }} />

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold uppercase flex-shrink-0"
                      style={{ background: e.cor + '22', color: e.cor }}
                    >
                      {e.nome.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-tight truncate"
                        style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
                        {e.nome}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Circle size={6} fill={e.ativa ? '#16a34a' : '#9ca3af'} strokeWidth={0} />
                        <span className="text-xs" style={{ color: e.ativa ? '#166534' : 'var(--text-3)' }}>
                          {e.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {e.descricao && (
                    <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-2)' }}>
                      {e.descricao}
                    </p>
                  )}

                  <div
                    className="flex items-center justify-between pt-3 mt-auto"
                    style={{ borderTop: '1px solid var(--border-sub)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users size={13} style={{ color: 'var(--text-3)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                        {count} {count === 1 ? 'membro' : 'membros'}
                      </span>
                    </div>
                    <button
                      onClick={() => abrirEditar(e)}
                      className="flex items-center gap-1 text-xs font-medium transition-all"
                      style={{ color: 'var(--text-3)' }}
                      onMouseEnter={ev => (ev.currentTarget.style.color = 'var(--accent-h)')}
                      onMouseLeave={ev => (ev.currentTarget.style.color = 'var(--text-3)')}
                    >
                      Editar <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalAberto && (
        <EquipaModal
          equipa={selecionada}
          utilizadores={utilizadores}
          onClose={() => setModal(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}

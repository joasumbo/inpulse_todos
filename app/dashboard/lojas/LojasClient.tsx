'use client'

import { useState } from 'react'
import { Plus, Search, MapPin, Phone, ChevronRight, Circle } from 'lucide-react'
import type { Loja } from '@/types'
import LojaModal from './LojaModal'

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ativa:    { label: 'Ativa',    color: '#166534', bg: '#dcfce7' },
  inativa:  { label: 'Inativa',  color: '#374151', bg: '#f3f4f6' },
  suspensa: { label: 'Suspensa', color: '#92400e', bg: '#fef3c7' },
}

const DOT_COLOR: Record<string, string> = {
  ativa:    '#16a34a',
  inativa:  '#9ca3af',
  suspensa: '#d97706',
}

export default function LojasClient({ lojas: inicial }: { lojas: Loja[] }) {
  const [lista, setLista]         = useState<Loja[]>(inicial)
  const [modalAberto, setModal]   = useState(false)
  const [selecionada, setSel]     = useState<Loja | null>(null)
  const [pesquisa, setPesquisa]   = useState('')
  const [filtroEstado, setFiltro] = useState<string>('todos')

  function abrirCriar()         { setSel(null); setModal(true) }
  function abrirEditar(l: Loja) { setSel(l);    setModal(true) }

  function onSaved(l: Loja) {
    setLista(prev => {
      const existe = prev.find(x => x.id === l.id)
      return existe ? prev.map(x => x.id === l.id ? l : x) : [l, ...prev]
    })
    setModal(false)
  }

  const filtradas = lista.filter(l => {
    const q = pesquisa.toLowerCase()
    const matchPesquisa =
      l.nome.toLowerCase().includes(q) ||
      (l.cidade ?? '').toLowerCase().includes(q) ||
      (l.codigo ?? '').toLowerCase().includes(q) ||
      (l.contacto_nome ?? '').toLowerCase().includes(q)
    const matchEstado = filtroEstado === 'todos' || l.estado === filtroEstado
    return matchPesquisa && matchEstado
  })

  const ativas   = lista.filter(l => l.estado === 'ativa').length
  const inativas = lista.filter(l => l.estado !== 'ativa').length

  return (
    <div className="p-4 md:p-8 w-full md:max-w-6xl">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            Lojas
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
            {lista.length} registadas &middot; {ativas} ativas &middot; {inativas} inativas
          </p>
        </div>
        <button
          onClick={abrirCriar}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Plus size={16} />
          Nova Loja
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Pesquisar por nome, cidade, código..."
            value={pesquisa}
            onChange={e => setPesquisa(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
            }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(['todos', 'ativa', 'inativa', 'suspensa'] as const).map(e => (
            <button
              key={e}
              onClick={() => setFiltro(e)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize"
              style={{
                background: filtroEstado === e ? 'var(--accent)' : 'var(--bg-surface)',
                color: filtroEstado === e ? '#fff' : 'var(--text-2)',
                border: `1px solid ${filtroEstado === e ? 'var(--accent)' : 'var(--border-sub)'}`,
              }}
            >
              {e === 'todos' ? 'Todas' : ESTADO_CONFIG[e]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: tabela | Mobile: cards */}
      <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-sub)' }}>
              {['Loja', 'Localização', 'Contacto', 'Estado', ''].map(h => (
                <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-3)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-sm" style={{ color: 'var(--text-3)' }}>
                  Nenhuma loja encontrada
                </td>
              </tr>
            ) : filtradas.map((l, i) => {
              const estado = ESTADO_CONFIG[l.estado]
              return (
                <tr
                  key={l.id}
                  style={{ borderBottom: i < filtradas.length - 1 ? '1px solid var(--border-sub)' : 'none' }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold uppercase flex-shrink-0"
                        style={{ background: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--border-sub)' }}>
                        {l.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{l.nome}</p>
                        {l.codigo && <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-3)' }}>{l.codigo}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {l.cidade ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                        <span className="text-sm" style={{ color: 'var(--text-2)' }}>
                          {l.cidade}{l.pais !== 'Portugal' ? `, ${l.pais}` : ''}
                        </span>
                      </div>
                    ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      {l.contacto_nome && <p className="text-sm" style={{ color: 'var(--text-1)' }}>{l.contacto_nome}</p>}
                      {l.telefone && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={11} style={{ color: 'var(--text-3)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-3)' }}>{l.telefone}</span>
                        </div>
                      )}
                      {!l.contacto_nome && !l.telefone && <span className="text-sm" style={{ color: 'var(--text-3)' }}>—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Circle size={7} fill={DOT_COLOR[l.estado]} strokeWidth={0} />
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: estado?.bg, color: estado?.color }}>
                        {estado?.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => abrirEditar(l)}
                      className="flex items-center gap-1 text-xs font-medium ml-auto transition-all"
                      style={{ color: 'var(--text-3)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-h)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
                    >
                      Editar <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {filtradas.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--text-3)' }}>
            Nenhuma loja encontrada
          </div>
        ) : filtradas.map(l => {
          const estado = ESTADO_CONFIG[l.estado]
          return (
            <button
              key={l.id}
              onClick={() => abrirEditar(l)}
              className="w-full text-left rounded-2xl p-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold uppercase flex-shrink-0"
                  style={{ background: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--border-sub)' }}>
                  {l.nome.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold truncate" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
                    {l.nome}
                  </p>
                  {l.codigo && <p className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{l.codigo}</p>}
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: estado?.bg, color: estado?.color }}>
                  {estado?.label}
                </span>
              </div>

              <div className="flex items-center gap-4" style={{ color: 'var(--text-3)' }}>
                {l.cidade && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    <span className="text-sm">{l.cidade}</span>
                  </div>
                )}
                {l.telefone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} />
                    <span className="text-sm">{l.telefone}</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {modalAberto && (
        <LojaModal
          loja={selecionada}
          onClose={() => setModal(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}

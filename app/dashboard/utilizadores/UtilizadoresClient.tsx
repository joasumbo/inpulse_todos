'use client'

import { useState } from 'react'
import { UserPlus, Search, Shield, ChevronRight, Circle, Phone } from 'lucide-react'
import type { Utilizador } from '@/types'
import UtilizadorModal from './UtilizadorModal'

const CARGO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  admin:      { label: 'Administrador', color: '#6d28d9', bg: '#ede9fe' },
  supervisor: { label: 'Supervisor',    color: '#1e40af', bg: '#dbeafe' },
  tecnico:    { label: 'Técnico',       color: '#374151', bg: '#f3f4f6' },
}

export default function UtilizadoresClient({ utilizadores: inicial }: { utilizadores: Utilizador[] }) {
  const [lista, setLista]           = useState<Utilizador[]>(inicial)
  const [modalAberto, setModal]     = useState(false)
  const [selecionado, setSel]       = useState<Utilizador | null>(null)
  const [pesquisa, setPesquisa]     = useState('')
  const [filtroCargo, setFiltro]    = useState<string>('todos')

  function abrirCriar()        { setSel(null);  setModal(true) }
  function abrirEditar(u: Utilizador) { setSel(u); setModal(true) }

  function onSaved(u: Utilizador) {
    setLista(prev => {
      const existe = prev.find(x => x.id === u.id)
      return existe ? prev.map(x => x.id === u.id ? u : x) : [u, ...prev]
    })
    setModal(false)
  }

  function onDeleted(id: string) {
    setLista(prev => prev.filter(x => x.id !== id))
    setModal(false)
  }

  function displayLogin(u: Utilizador) {
    return u.username ?? u.email
  }

  const filtrados = lista.filter(u => {
    const matchPesquisa = u.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      displayLogin(u).toLowerCase().includes(pesquisa.toLowerCase())
    const matchCargo = filtroCargo === 'todos' || u.cargo === filtroCargo
    return matchPesquisa && matchCargo
  })

  const ativos   = lista.filter(u => u.ativo).length
  const inativos = lista.filter(u => !u.ativo).length

  return (
    <div className="p-4 md:p-8 max-w-6xl">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
            Utilizadores
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
            {lista.length} registados &middot; {ativos} ativos &middot; {inativos} inativos
          </p>
        </div>
        <button
          onClick={abrirCriar}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <UserPlus size={16} />
          Novo Utilizador
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Pesquisar utilizador..."
            value={pesquisa}
            onChange={e => setPesquisa(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
            }}
          />
        </div>

        {['todos', 'admin', 'supervisor', 'tecnico'].map(c => (
          <button
            key={c}
            onClick={() => setFiltro(c)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium capitalize transition-all"
            style={{
              background: filtroCargo === c ? 'var(--accent)' : 'var(--bg-surface)',
              color: filtroCargo === c ? '#fff' : 'var(--text-2)',
              border: `1px solid ${filtroCargo === c ? 'var(--accent)' : 'var(--border-sub)'}`,
            }}
          >
            {c === 'todos' ? 'Todos' : CARGO_CONFIG[c]?.label}
          </button>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {filtrados.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--text-3)' }}>Nenhum utilizador encontrado</p>
        ) : filtrados.map(u => {
          const cargo = CARGO_CONFIG[u.cargo]
          return (
            <button
              key={u.id}
              onClick={() => abrirEditar(u)}
              className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase flex-shrink-0"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                {u.nome.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>{u.nome}</p>
                  <Circle size={6} fill={u.ativo ? '#16a34a' : '#9ca3af'} strokeWidth={0} className="flex-shrink-0" />
                </div>
                <p className="text-xs truncate mb-1" style={{ color: 'var(--text-3)' }}>{displayLogin(u)}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: cargo?.bg, color: cargo?.color }}>
                    {cargo?.label}
                  </span>
                  {u.telefone && (
                    <div className="flex items-center gap-1">
                      <Phone size={10} style={{ color: 'var(--text-3)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>{u.telefone}</span>
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            </button>
          )
        })}
      </div>

      {/* Tabela desktop */}
      <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-sub)' }}>
              {['Utilizador', 'Cargo', 'Telefone', 'Estado', ''].map(h => (
                <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-3)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-sm" style={{ color: 'var(--text-3)' }}>
                  Nenhum utilizador encontrado
                </td>
              </tr>
            ) : filtrados.map((u, i) => {
              const cargo = CARGO_CONFIG[u.cargo]
              return (
                <tr
                  key={u.id}
                  onClick={() => abrirEditar(u)}
                  style={{
                    borderBottom: i < filtrados.length - 1 ? '1px solid var(--border-sub)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0"
                        style={{ background: 'var(--accent)', color: '#fff' }}>
                        {u.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{u.nome}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{displayLogin(u)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield size={13} style={{ color: cargo?.color }} />
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: cargo?.bg, color: cargo?.color }}>
                        {cargo?.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-2)' }}>
                    {u.telefone ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Circle size={7} fill={u.ativo ? '#16a34a' : '#9ca3af'} strokeWidth={0} />
                      <span className="text-xs font-medium" style={{ color: u.ativo ? '#166534' : '#4b5563' }}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <UtilizadorModal
          utilizador={selecionado}
          onClose={() => setModal(false)}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      )}
    </div>
  )
}

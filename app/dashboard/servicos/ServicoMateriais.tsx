'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, PackageX } from 'lucide-react'

interface Material {
  id: string
  referencia: string | null
  nome: string
  unidade: string
  preco_unit: number
  stock_atual: number
}

interface ServicoMaterial {
  id: string
  material_id: string
  quantidade: number
  preco_unit: number
  material: Pick<Material, 'id' | 'referencia' | 'nome' | 'unidade' | 'stock_atual'>
}

interface Props {
  servicoId: string
  canAdd:    boolean
  canDelete: boolean
}

function fmt(n: number) {
  return n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
}

const inputSt = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-1)',
}

export default function ServicoMateriais({ servicoId, canAdd, canDelete }: Props) {
  const [lista,    setLista]   = useState<ServicoMaterial[]>([])
  const [catalogo, setCat]     = useState<Material[]>([])
  const [loading,  setLoading] = useState(true)
  const [saving,   setSaving]  = useState(false)
  const [erro,     setErro]    = useState('')

  const [selMat, setSelMat] = useState('')
  const [qty,    setQty]    = useState('')
  const [price,  setPrice]  = useState('')

  async function load() {
    setLoading(true)
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/admin/servicos/${servicoId}/materiais`),
        fetch('/api/admin/materiais'),
      ])
      const [d1, d2] = await Promise.all([r1.json(), r2.json()])
      setLista(Array.isArray(d1) ? d1 : [])
      setCat(Array.isArray(d2) ? d2 : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [servicoId]) // eslint-disable-line react-hooks/exhaustive-deps

  const jaAdicionados = new Set(lista.map(sm => sm.material_id))
  const disponiveis = catalogo.filter(m => !jaAdicionados.has(m.id))

  function onSelectMat(id: string) {
    setSelMat(id)
    const m = catalogo.find(c => c.id === id)
    if (m) setPrice(m.preco_unit > 0 ? String(m.preco_unit) : '')
  }

  async function handleAdd() {
    if (!selMat || !qty || Number(qty) <= 0) return
    setErro('')
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/servicos/${servicoId}/materiais`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_id: selMat,
          quantidade:  Number(qty),
          preco_unit:  price ? Number(price) : 0,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setErro(d.error ?? 'Erro ao adicionar')
      } else {
        setSelMat('')
        setQty('')
        setPrice('')
        await load()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(smId: string) {
    if (!confirm('Remover este material do serviço? O stock será reposto.')) return
    await fetch(`/api/admin/servicos/${servicoId}/materiais/${smId}`, { method: 'DELETE' })
    setLista(prev => prev.filter(sm => sm.id !== smId))
  }

  const total = lista.reduce((sum, sm) => sum + sm.quantidade * sm.preco_unit, 0)

  return (
    <div className="space-y-4">

      {/* Add form */}
      {canAdd && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-sub)' }}
        >
          <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>
            Adicionar material
          </p>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selMat}
              onChange={e => onSelectMat(e.target.value)}
              className="flex-1 min-w-40 px-3 py-2 rounded-xl text-sm outline-none"
              style={{ ...inputSt, color: selMat ? 'var(--text-1)' : 'var(--text-3)' }}
            >
              <option value="">Selecionar material...</option>
              {disponiveis.map(m => (
                <option key={m.id} value={m.id}>
                  {m.referencia ? `[${m.referencia}] ` : ''}{m.nome}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0.001"
              step="any"
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="Qtd"
              className="w-24 px-3 py-2 rounded-xl text-sm outline-none"
              style={inputSt}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="€/un"
              className="w-24 px-3 py-2 rounded-xl text-sm outline-none"
              style={inputSt}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selMat || !qty || saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                opacity: (!selMat || !qty || saving) ? 0.5 : 1,
              }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Adicionar
            </button>
          </div>
          {erro && <p className="text-xs" style={{ color: '#dc2626' }}>{erro}</p>}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-3)' }} />
        </div>
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <PackageX size={28} style={{ color: 'var(--text-3)' }} />
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>Sem materiais registados</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-sub)' }}>
            {/* Table header */}
            <div
              className="grid text-xs font-semibold uppercase tracking-wider px-4 py-2.5"
              style={{
                gridTemplateColumns: canDelete ? '1fr 90px 70px 90px 100px 36px' : '1fr 90px 70px 90px 100px',
                background: 'var(--bg-card)',
                color: 'var(--text-3)',
                borderBottom: '1px solid var(--border-sub)',
              }}
            >
              <span>Material</span>
              <span>Qtd</span>
              <span>Stock</span>
              <span>€/un</span>
              <span>Subtotal</span>
              {canDelete && <span />}
            </div>

            {/* Rows */}
            {lista.map((sm, i) => (
              <div
                key={sm.id}
                className="grid items-center px-4 py-3"
                style={{
                  gridTemplateColumns: canDelete ? '1fr 90px 70px 90px 100px 36px' : '1fr 90px 70px 90px 100px',
                  borderBottom: i < lista.length - 1 ? '1px solid var(--border-sub)' : 'none',
                  background: 'var(--bg-surface)',
                }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                    {sm.material.nome}
                  </p>
                  {sm.material.referencia && (
                    <p className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
                      {sm.material.referencia}
                    </p>
                  )}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>
                  {sm.quantidade} {sm.material.unidade}
                </span>
                <span className="text-sm" style={{ color: sm.material.stock_atual <= 0 ? '#dc2626' : 'var(--text-2)' }}>
                  {sm.material.stock_atual}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>
                  {fmt(sm.preco_unit)}
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
                  {fmt(sm.quantidade * sm.preco_unit)}
                </span>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(sm.id)}
                    className="flex items-center justify-center p-1.5 rounded-lg transition-all"
                    style={{ color: 'var(--text-3)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = '#dc2626'
                      ;(e.currentTarget as HTMLElement).style.background = '#fef2f2'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'
                      ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-sub)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-2)' }}>Total materiais</span>
              <span className="text-base font-bold" style={{ color: 'var(--text-1)' }}>{fmt(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

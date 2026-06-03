'use client'

import { useState, useEffect } from 'react'
import { Car, Wrench, UtensilsCrossed, Receipt, CheckCircle2, Clock, ChevronDown, ChevronUp, Camera, Loader2, CalendarDays, Eye, PlayCircle } from 'lucide-react'
import type { Acao, Jornada, TipoAcao } from '@/types'

type Meta = { label: string; cor: string; bg: string; icon: React.ElementType }

const TIPO_META: Record<TipoAcao, Meta> = {
  viagem:       { label: 'Viagem',       cor: '#2563eb', bg: '#dbeafe', icon: Car },
  trabalho:     { label: 'Serviço',      cor: '#16a34a', bg: '#dcfce7', icon: Wrench },
  alimentacao:  { label: 'Alimentação',  cor: '#d97706', bg: '#fef3c7', icon: UtensilsCrossed },
  despesa:      { label: 'Despesa',      cor: '#7c3aed', bg: '#ede9fe', icon: Receipt },
}

// Fallback defensivo: evita crash de renderização se uma ação tiver um tipo
// inesperado/legado (ex.: dados antigos). Sem isto, TIPO_META[tipo] === undefined
// e aceder a .icon/.cor rebenta a página inteira.
const META_FALLBACK: Meta = { label: 'Ação', cor: '#6b7280', bg: '#f3f4f6', icon: Clock }
function metaFor(tipo: string): Meta {
  return TIPO_META[tipo as TipoAcao] ?? META_FALLBACK
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}

function formatDuracao(inicio: string, fim: string | null) {
  if (!fim) return null
  const diff = new Date(fim).getTime() - new Date(inicio).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `${mins}min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h${m}min` : `${h}h`
}

function hojeLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function uploadImagem(file: File, jornadaId: string): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('jornada_id', jornadaId)
  const res = await fetch('/api/admin/jornadas/upload', { method: 'POST', body: fd })
  if (!res.ok) return null
  const { url } = await res.json()
  return url ?? null
}

interface Props {
  utilizadorId:   string
  utilizadorNome: string
  cargo:          string
  funcionarios:   { id: string; nome: string }[]
}

export default function JornadaClient({ utilizadorId, cargo, funcionarios }: Props) {
  const isAdmin = cargo === 'admin'
  const hoje = hojeLocal()

  const [selectedFuncionario, setSelectedFuncionario] = useState(utilizadorId)
  const [jornada, setJornada]     = useState<Jornada | null>(null)
  const [acoes, setAcoes]         = useState<Acao[]>([])
  const [acaoAtiva, setAcaoAtiva] = useState<Acao | null>(null)
  const [loading, setLoading]     = useState(false)
  const [savingTipo, setSaving]   = useState<TipoAcao | null>(null)

  const [descricao, setDescricao]     = useState('')
  const [imagemUrl, setImagemUrl]     = useState('')
  const [uploadingImg, setUploadingImg] = useState(false)

  // Edição de comentário/foto de uma ação já concluída
  const [editId, setEditId]             = useState<string | null>(null)
  const [editDesc, setEditDesc]         = useState('')
  const [editImg, setEditImg]           = useState('')
  const [editUploading, setEditUploading] = useState(false)
  const [savingEdit, setSavingEdit]     = useState(false)

  const [historico, setHistorico]       = useState<Jornada[]>([])
  const [jornadaAberta, setJAberta]     = useState<string | null>(null)
  const [acoesHist, setAcoesHist]       = useState<Record<string, Acao[]>>({})
  const [loadingHist, setLoadingHist]   = useState(false)
  const [mostrarHist, setMostrarHist]   = useState(false)

  // Admin a ver jornada de outro funcionário = modo leitura
  const isViewingOther = selectedFuncionario !== utilizadorId

  async function carregarJornada(funcionarioId: string) {
    setLoading(true)
    setJornada(null)
    setAcoes([])
    setAcaoAtiva(null)
    setDescricao('')
    setImagemUrl('')
    try {
      // Nunca cria a jornada automaticamente — apenas lê a do dia (se existir).
      const isOutro = funcionarioId !== utilizadorId
      const url = isOutro
        ? `/api/admin/jornadas?funcionario_id=${funcionarioId}`
        : '/api/admin/jornadas'
      let j: Jornada | null = null
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        j = Array.isArray(data) ? (data.find((x: Jornada) => x.dia === hoje) ?? null) : null
      }
      setJornada(j)
      if (j) await carregarAcoes(j.id)
    } catch {
      // evitar crash
    } finally {
      setLoading(false)
    }
  }

  // Cria a jornada do dia para o próprio utilizador (botão "Iniciar Jornada").
  async function iniciarJornada() {
    if (isViewingOther) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/jornadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dia: hoje }),
      })
      if (res.ok) {
        const j: Jornada = await res.json()
        setJornada(j?.id ? j : null)
        if (j?.id) await carregarAcoes(j.id)
      }
    } catch {
      // evitar crash
    } finally {
      setLoading(false)
    }
  }

  async function carregarAcoes(jornadaId: string) {
    try {
      const res = await fetch(`/api/admin/jornadas/${jornadaId}/acoes`)
      if (!res.ok) return
      const data = await res.json()
      if (!Array.isArray(data)) return
      setAcoes(data)
      const ativa = data.find((a: Acao) => !a.fim) ?? null
      setAcaoAtiva(ativa)
      if (ativa) {
        setDescricao(ativa.descricao ?? '')
        setImagemUrl(ativa.imagem_url ?? '')
      } else {
        setDescricao('')
        setImagemUrl('')
      }
    } catch {
      // evitar crash
    }
  }

  useEffect(() => {
    carregarJornada(selectedFuncionario)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFuncionario])

  async function iniciarAcao(tipo: TipoAcao) {
    if (!jornada || acaoAtiva || isViewingOther) return
    setSaving(tipo)
    try {
      const res = await fetch(`/api/admin/jornadas/${jornada.id}/acoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo }),
      })
      const nova: Acao = await res.json()
      setAcoes(prev => [...prev, nova])
      setAcaoAtiva(nova)
      setDescricao('')
      setImagemUrl('')
    } finally {
      setSaving(null)
    }
  }

  async function finalizarAcao() {
    if (!jornada || !acaoAtiva || isViewingOther) return
    setSaving(acaoAtiva.tipo as TipoAcao)
    try {
      const res = await fetch(`/api/admin/jornadas/${jornada.id}/acoes/${acaoAtiva.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fim: new Date().toISOString(),
          descricao: descricao || null,
          imagem_url: imagemUrl || null,
        }),
      })
      const atualizada: Acao = await res.json()
      setAcoes(prev => prev.map(a => a.id === atualizada.id ? atualizada : a))
      setAcaoAtiva(null)
      setDescricao('')
      setImagemUrl('')
    } finally {
      setSaving(null)
    }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !jornada) return
    setUploadingImg(true)
    try {
      const url = await uploadImagem(file, jornada.id)
      if (url) setImagemUrl(url)
    } finally {
      setUploadingImg(false)
      e.target.value = ''
    }
  }

  // --- Edição de comentário/foto de uma ação já concluída ---
  function abrirEdicao(a: Acao) {
    setEditId(a.id)
    setEditDesc(a.descricao ?? '')
    setEditImg(a.imagem_url ?? '')
  }

  function cancelarEdicao() {
    setEditId(null)
    setEditDesc('')
    setEditImg('')
  }

  async function handleEditImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !jornada) return
    setEditUploading(true)
    try {
      const url = await uploadImagem(file, jornada.id)
      if (url) setEditImg(url)
    } finally {
      setEditUploading(false)
      e.target.value = ''
    }
  }

  async function guardarEdicao(a: Acao) {
    if (!jornada) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/admin/jornadas/${jornada.id}/acoes/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: editDesc || null, imagem_url: editImg || null }),
      })
      if (res.ok) {
        const atualizada: Acao = await res.json()
        setAcoes(prev => prev.map(x => x.id === atualizada.id ? atualizada : x))
        cancelarEdicao()
      }
    } finally {
      setSavingEdit(false)
    }
  }

  async function carregarHistorico() {
    setLoadingHist(true)
    try {
      const url = isAdmin && isViewingOther
        ? `/api/admin/jornadas?funcionario_id=${selectedFuncionario}`
        : '/api/admin/jornadas'
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      if (!Array.isArray(data)) return
      setHistorico(data.filter((j: Jornada) => j.dia !== hoje))
    } catch {
      // evitar crash
    } finally {
      setLoadingHist(false)
    }
  }

  async function toggleJornadaHist(jornadaId: string) {
    if (jornadaAberta === jornadaId) { setJAberta(null); return }
    setJAberta(jornadaId)
    if (!acoesHist[jornadaId]) {
      try {
        const res = await fetch(`/api/admin/jornadas/${jornadaId}/acoes`)
        const data = await res.json()
        setAcoesHist(prev => ({ ...prev, [jornadaId]: Array.isArray(data) ? data : [] }))
      } catch {
        setAcoesHist(prev => ({ ...prev, [jornadaId]: [] }))
      }
    }
  }

  useEffect(() => {
    if (mostrarHist) carregarHistorico()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarHist, selectedFuncionario])

  const meta = acaoAtiva ? metaFor(acaoAtiva.tipo) : null

  return (
    <div className="p-4 md:p-8 max-w-2xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>
          Jornada de Trabalho
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
          {new Date(hoje + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Admin selector */}
      {isAdmin && funcionarios.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Funcionário</label>
          <select
            value={selectedFuncionario}
            onChange={e => setSelectedFuncionario(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
          >
            {funcionarios.map(f => (
              <option key={f.id} value={f.id}>{f.nome}{f.id === utilizadorId ? ' (eu)' : ''}</option>
            ))}
          </select>
        </div>
      )}

      {/* Modo leitura badge */}
      {isViewingOther && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5 text-xs font-medium"
          style={{ background: '#f3f4f6', color: '#4b5563' }}>
          <Eye size={13} />
          Modo visualização — não pode registar ações por outro funcionário
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-3)' }} />
        </div>
      ) : isViewingOther && !jornada ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <CalendarDays size={36} style={{ color: 'var(--text-3)', opacity: 0.35 }} />
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>Sem registo de jornada para hoje</p>
        </div>
      ) : (
        <>
          {/* Iniciar jornada — próprio utilizador, ainda sem jornada hoje */}
          {!jornada && !isViewingOther && (
            <div className="rounded-2xl p-8 mb-6 flex flex-col items-center text-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#dbeafe' }}>
                <PlayCircle size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>
                Ainda não iniciaste a jornada de hoje.
              </p>
              <button
                type="button"
                onClick={iniciarJornada}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                style={{ background: 'var(--accent)', color: '#fff', opacity: loading ? 0.7 : 1 }}
              >
                <PlayCircle size={18} /> Iniciar Jornada de Trabalho
              </button>
            </div>
          )}

          {/* Ação ativa */}
          {acaoAtiva && meta && (
            <div className="rounded-2xl p-5 mb-6" style={{ background: meta.bg, border: `1.5px solid ${meta.cor}30` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <meta.icon size={20} style={{ color: meta.cor }} />
                  <span className="text-sm font-bold" style={{ color: meta.cor }}>{meta.label} em curso</span>
                </div>
                <div className="flex items-center gap-1.5" style={{ color: meta.cor }}>
                  <Clock size={13} />
                  <span className="text-xs font-mono">{formatHora(acaoAtiva.inicio)}</span>
                </div>
              </div>

              {!isViewingOther && (
                <>
                  <textarea
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    placeholder="Descrição (opcional)..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none mb-3"
                    style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-1)' }}
                  />

                  {/* Upload imagem */}
                  <div className="mb-3">
                    <label
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.6)', color: meta.cor }}
                    >
                      {uploadingImg
                        ? <><Loader2 size={13} className="animate-spin" /> A carregar...</>
                        : imagemUrl
                          ? <><CheckCircle2 size={13} /> Foto adicionada — substituir</>
                          : <><Camera size={13} /> Tirar / escolher foto</>
                      }
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </label>
                    {imagemUrl && (
                      <img src={imagemUrl} alt="preview" className="mt-2 rounded-xl max-h-36 object-cover" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={finalizarAcao}
                    disabled={!!savingTipo || uploadingImg}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold"
                    style={{ background: meta.cor, color: '#fff', opacity: (savingTipo || uploadingImg) ? 0.7 : 1 }}
                  >
                    {savingTipo ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Finalizar {meta.label}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Botões iniciar ação — só com jornada criada e para o próprio utilizador */}
          {jornada && !acaoAtiva && !isViewingOther && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(Object.entries(TIPO_META) as [TipoAcao, typeof TIPO_META[TipoAcao]][]).map(([tipo, m]) => {
                const Icon = m.icon
                const isLoading = savingTipo === tipo
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => iniciarAcao(tipo)}
                    disabled={!!savingTipo}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1.5px solid var(--border-sub)',
                      opacity: savingTipo ? 0.6 : 1,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = m.cor }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-sub)' }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: m.bg }}>
                      {isLoading ? <Loader2 size={22} className="animate-spin" style={{ color: m.cor }} /> : <Icon size={22} style={{ color: m.cor }} />}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{m.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Ações do dia concluídas */}
          {acoes.filter(a => a.fim).length > 0 && (
            <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}>
              <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-sub)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-1)', fontFamily: 'Red Hat Display' }}>Hoje</p>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border-sub)' }}>
                {acoes.filter(a => a.fim).map(a => {
                  const m = metaFor(a.tipo)
                  const Icon = m.icon
                  const dur = formatDuracao(a.inicio, a.fim)
                  return (
                    <div key={a.id} className="flex items-start gap-3 px-5 py-4">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: m.bg }}>
                        <Icon size={15} style={{ color: m.cor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-sm font-semibold" style={{ color: m.cor }}>{m.label}</span>
                          {dur && <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-3)' }}>{dur}</span>}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                          {formatHora(a.inicio)} → {a.fim ? formatHora(a.fim) : '...'}
                        </p>

                        {editId === a.id ? (
                          /* Editor inline de comentário + foto */
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={editDesc}
                              onChange={e => setEditDesc(e.target.value)}
                              placeholder="Comentário..."
                              rows={2}
                              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                            />
                            <label
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl cursor-pointer"
                              style={{ background: 'var(--bg-card)', color: m.cor }}
                            >
                              {editUploading
                                ? <><Loader2 size={13} className="animate-spin" /> A carregar...</>
                                : editImg
                                  ? <><CheckCircle2 size={13} /> Foto adicionada — substituir</>
                                  : <><Camera size={13} /> Tirar / escolher foto</>}
                              <input type="file" accept="image/*" className="hidden" onChange={handleEditImage} />
                            </label>
                            {editImg && (
                              <img src={editImg} alt="preview" className="rounded-xl max-h-28 object-cover" />
                            )}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => guardarEdicao(a)}
                                disabled={savingEdit || editUploading}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                                style={{ background: m.cor, color: '#fff', opacity: (savingEdit || editUploading) ? 0.7 : 1 }}
                              >
                                {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={cancelarEdicao}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                style={{ background: 'var(--bg-card)', color: 'var(--text-2)' }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {a.descricao && <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{a.descricao}</p>}
                            {a.imagem_url && (
                              <a href={a.imagem_url} target="_blank" rel="noreferrer">
                                <img src={a.imagem_url} alt="" className="mt-2 rounded-xl max-h-28 object-cover" />
                              </a>
                            )}
                            {(!isViewingOther || isAdmin) && (
                              <button
                                type="button"
                                onClick={() => abrirEdicao(a)}
                                className="mt-1.5 text-xs font-medium"
                                style={{ color: 'var(--accent)' }}
                              >
                                {a.descricao || a.imagem_url ? 'Editar comentário / foto' : 'Adicionar comentário / foto'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Histórico */}
          <div>
            <button
              type="button"
              onClick={() => setMostrarHist(v => !v)}
              className="flex items-center gap-2 text-sm font-semibold mb-4"
              style={{ color: 'var(--text-2)' }}
            >
              <CalendarDays size={16} />
              Histórico de jornadas
              {mostrarHist ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {mostrarHist && (
              loadingHist ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-3)' }} />
                </div>
              ) : historico.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-3)' }}>Sem jornadas anteriores</p>
              ) : (
                <div className="space-y-2">
                  {historico.map(j => {
                    const isOpen = jornadaAberta === j.id
                    const acs = acoesHist[j.id] ?? []
                    const label = new Date(j.dia + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                    return (
                      <div key={j.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-sub)' }}>
                        <button
                          type="button"
                          onClick={() => toggleJornadaHist(j.id)}
                          className="w-full flex items-center justify-between px-5 py-4"
                        >
                          <div className="flex items-center gap-3">
                            <CalendarDays size={16} style={{ color: 'var(--text-3)' }} />
                            <span className="text-sm font-semibold capitalize" style={{ color: 'var(--text-1)' }}>{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isAdmin && j.funcionario && (
                              <span className="text-xs" style={{ color: 'var(--text-3)' }}>{j.funcionario.nome}</span>
                            )}
                            {isOpen ? <ChevronUp size={14} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-3)' }} />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="border-t divide-y" style={{ borderColor: 'var(--border-sub)' }}>
                            {acs.length === 0 ? (
                              <p className="text-sm text-center py-6" style={{ color: 'var(--text-3)' }}>Sem ações registadas</p>
                            ) : acs.map(a => {
                              const m = metaFor(a.tipo)
                              const Icon = m.icon
                              const dur = formatDuracao(a.inicio, a.fim)
                              return (
                                <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: m.bg }}>
                                    <Icon size={13} style={{ color: m.cor }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm font-semibold" style={{ color: m.cor }}>{m.label}</span>
                                      {dur && <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{dur}</span>}
                                    </div>
                                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                                      {formatHora(a.inicio)} → {a.fim ? formatHora(a.fim) : '—'}
                                    </p>
                                    {a.descricao && <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{a.descricao}</p>}
                                    {a.imagem_url && (
                                      <a href={a.imagem_url} target="_blank" rel="noreferrer">
                                        <img src={a.imagem_url} alt="" className="mt-1.5 rounded-lg max-h-24 object-cover" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}

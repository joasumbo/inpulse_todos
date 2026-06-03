'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, FileText, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface Anexo {
  id: string
  nome: string
  mime_type: string | null
  tamanho: number | null
  created_at: string
  signedUrl: string | null
}

interface Props {
  servicoId: string
  canUpload: boolean
  canDelete: boolean
}

function isImage(mime: string | null) {
  return mime?.startsWith('image/') ?? false
}

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ServicoAnexos({ servicoId, canUpload, canDelete }: Props) {
  const [anexos,    setAnexos]    = useState<Anexo[]>([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [lightbox,  setLightbox]  = useState<number | null>(null)
  const [erro,      setErro]      = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/servicos/${servicoId}/anexos`)
      const data = await res.json()
      setAnexos(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [servicoId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setErro('')
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          setErro(`"${file.name}" excede 10 MB`)
          continue
        }
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(`/api/admin/servicos/${servicoId}/anexos`, {
          method: 'POST',
          body: fd,
        })
        if (!res.ok) {
          const d = await res.json()
          setErro(d.error ?? 'Erro no upload')
        }
      }
      await load()
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminar este anexo?')) return
    await fetch(`/api/admin/servicos/${servicoId}/anexos/${id}`, { method: 'DELETE' })
    setAnexos(prev => prev.filter(a => a.id !== id))
  }

  const imagens = anexos.filter(a => isImage(a.mime_type))

  return (
    <div className="space-y-4">

      {/* Upload zone */}
      {canUpload && (
        <>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="hidden"
            onChange={e => handleUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed transition-all"
            style={{ borderColor: 'var(--border-sub)', color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-sub)')}
          >
            {uploading
              ? <Loader2 size={22} className="animate-spin" />
              : <Upload size={22} />
            }
            <span className="text-sm font-medium">
              {uploading ? 'A carregar...' : 'Clique para adicionar ficheiros'}
            </span>
            <span className="text-xs">Imagens, PDF, Word, Excel — máx. 10 MB</span>
          </button>
        </>
      )}

      {erro && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#dc2626' }}>
          {erro}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-3)' }} />
        </div>
      ) : anexos.length === 0 ? (
        <p className="text-center text-sm py-10" style={{ color: 'var(--text-3)' }}>
          Sem anexos
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {anexos.map(a => {
            const img = isImage(a.mime_type)
            const imgIdx = img ? imagens.indexOf(a) : -1
            return (
              <div
                key={a.id}
                className="relative group rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border-sub)', background: 'var(--bg-card)' }}
              >
                {/* Thumbnail */}
                {img && a.signedUrl ? (
                  <button
                    type="button"
                    onClick={() => setLightbox(imgIdx)}
                    className="block w-full aspect-square overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.signedUrl} alt={a.nome} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <a
                    href={a.signedUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center aspect-square"
                  >
                    <FileText size={32} style={{ color: 'var(--text-3)' }} />
                  </a>
                )}

                {/* Info */}
                <div className="px-2 py-1.5" style={{ borderTop: '1px solid var(--border-sub)' }}>
                  <p className="text-xs truncate font-medium" style={{ color: 'var(--text-1)' }}>
                    {a.nome}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {formatBytes(a.tamanho)}
                  </p>
                </div>

                {/* Delete */}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="absolute top-1.5 right-1.5 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: '#dc262699', color: '#fff' }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && imagens[lightbox] && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: '#000000e0' }}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white opacity-80 hover:opacity-100"
            onClick={() => setLightbox(null)}
          >
            <X size={28} />
          </button>

          {imagens.length > 1 && (
            <button
              type="button"
              className="absolute left-4 text-white opacity-80 hover:opacity-100"
              onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + imagens.length) % imagens.length) }}
            >
              <ChevronLeft size={40} />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagens[lightbox].signedUrl!}
            alt={imagens[lightbox].nome}
            className="max-w-[90vw] max-h-[75vh] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {imagens.length > 1 && (
            <button
              type="button"
              className="absolute right-4 text-white opacity-80 hover:opacity-100"
              onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % imagens.length) }}
            >
              <ChevronRight size={40} />
            </button>
          )}

          <p className="absolute bottom-4 text-white text-sm opacity-70">
            {imagens[lightbox].nome} &middot; {lightbox + 1}/{imagens.length}
          </p>
        </div>
      )}
    </div>
  )
}

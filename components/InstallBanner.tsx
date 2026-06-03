'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

function isIos() {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

function isStandalone() {
  if (typeof window === 'undefined') return true
  return (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
}

export default function InstallBanner() {
  const [show, setShow]     = useState(false)
  const [ios, setIos]       = useState(false)
  const [prompt, setPrompt] = useState<any>(null)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem('pwa-dismissed')) return

    const onMobile = window.innerWidth < 768

    if (isIos() && onMobile) {
      setIos(true)
      // small delay so the page settles first
      setTimeout(() => setShow(true), 1800)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e)
      if (onMobile && !localStorage.getItem('pwa-dismissed')) {
        setTimeout(() => setShow(true), 1800)
      }
    }
    window.addEventListener('beforeinstallprompt', handler as any)
    return () => window.removeEventListener('beforeinstallprompt', handler as any)
  }, [])

  function dismiss() {
    localStorage.setItem('pwa-dismissed', '1')
    setShow(false)
  }

  async function install() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') localStorage.setItem('pwa-dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '88px',
        left: '12px',
        right: '12px',
        zIndex: 9999,
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        border: '1px solid rgba(37,99,235,0.15)',
        padding: '16px',
        animation: 'pwa-slide-up 0.35s cubic-bezier(.16,1,.3,1)',
      }}
    >
      <style>{`
        @keyframes pwa-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <button
        onClick={dismiss}
        style={{
          position: 'absolute', top: '12px', right: '12px',
          background: '#f0f4f8', border: 'none', borderRadius: '50%',
          width: '28px', height: '28px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
        }}
      >
        <X size={14} color="#8c959f" />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <img src="/icons/icon.svg" alt="icon" width={44} height={44} style={{ borderRadius: '10px', flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontFamily: 'Red Hat Display', fontWeight: 700, fontSize: '15px', color: '#1a2332' }}>
            Instale a aplicação
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#57606a', marginTop: '2px' }}>
            Acesso rápido, funciona como app nativa
          </p>
        </div>
      </div>

      {ios ? (
        <div style={{
          background: '#f6f8fa', borderRadius: '12px', padding: '10px 12px',
          fontSize: '13px', color: '#57606a', lineHeight: '1.5',
        }}>
          Toque em{' '}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            background: '#2563eb', color: '#fff', borderRadius: '6px',
            padding: '1px 6px', fontSize: '12px', fontWeight: 600,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Partilhar
          </span>{' '}
          e depois em{' '}
          <strong style={{ color: '#1a2332' }}>"Adicionar ao ecrã inicial"</strong>
        </div>
      ) : (
        <button
          onClick={install}
          style={{
            width: '100%', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: '12px', padding: '10px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Red Hat Display',
          }}
        >
          Instalar agora
        </button>
      )}
    </div>
  )
}

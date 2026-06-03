'use client'

import { useEffect, useState } from 'react'
import { Wrench } from 'lucide-react'

export default function SplashScreen() {
  const [phase, setPhase] = useState<'show' | 'fade' | 'done'>('show')

  useEffect(() => {
    if (sessionStorage.getItem('splash-shown')) { setPhase('done'); return }
    const t1 = setTimeout(() => setPhase('fade'), 1600)
    const t2 = setTimeout(() => {
      setPhase('done')
      sessionStorage.setItem('splash-shown', '1')
    }, 2100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === 'done') return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#2563eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        opacity: phase === 'fade' ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: phase === 'fade' ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'splash-pop 0.5s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <Wrench size={44} color="white" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{
          margin: 0,
          fontFamily: 'Red Hat Display, sans-serif',
          fontWeight: 700,
          fontSize: '24px',
          color: '#fff',
          letterSpacing: '-0.3px',
        }}>
          Manutenção
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
          Inpulse Events
        </p>
      </div>

      <style>{`
        @keyframes splash-pop {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}

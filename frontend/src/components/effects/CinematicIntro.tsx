"use client"
import { useEffect, useState } from 'react'

export default function CinematicIntro({ 
  onComplete 
}: { 
  onComplete: () => void 
}) {
  const [stage, setStage] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [progress, setProgress] = useState(0)
  const [scanY, setScanY] = useState(-5)

  const fullText = 'INITIALIZING COLD CHAIN AI v2.0'

  useEffect(() => {
    // Stage 0 → 1: scan line
    const t1 = setTimeout(() => setStage(1), 500)
    // Stage 1 → 2: start typing
    const t2 = setTimeout(() => setStage(2), 1500)
    // Stage 2 → 3: radar
    const t3 = setTimeout(() => setStage(3), 2800)
    // Complete
    const t4 = setTimeout(() => onComplete(), 4500)
    return () => { clearTimeout(t1); clearTimeout(t2); 
                   clearTimeout(t3); clearTimeout(t4) }
  }, [onComplete])

  // Scan line animation
  useEffect(() => {
    if (stage < 1) return
    let y = -5
    const interval = setInterval(() => {
      y += 2
      setScanY(y)
      if (y > 105) clearInterval(interval)
    }, 16)
    return () => clearInterval(interval)
  }, [stage])

  // Typing animation
  useEffect(() => {
    if (stage < 2) return
    let i = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i))
      i++
      if (i > fullText.length) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [stage])

  // Progress bar
  useEffect(() => {
    if (stage < 3) return
    let p = 0
    const interval = setInterval(() => {
      p += 2
      setProgress(p)
      if (p >= 100) clearInterval(interval)
    }, 15)
    return () => clearInterval(interval)
  }, [stage])

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000000',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        overflow: 'hidden'
      }}
    >
      {/* Scan line */}
      {stage >= 1 && (
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${scanY}%`,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
          boxShadow: '0 0 20px #22d3ee',
          transition: 'none'
        }} />
      )}

      {/* Scanlines overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(34,211,238,0.03) 3px, rgba(34,211,238,0.03) 4px)',
        pointerEvents: 'none'
      }} />

      {/* Content */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        {/* Logo */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 32px',
          border: '2px solid #22d3ee',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(34,211,238,0.5)',
          fontSize: '24px',
          color: '#22d3ee',
          fontWeight: 'bold',
          animation: stage >= 1 ? 'spin 4s linear infinite' : 'none'
        }}>
          CC
        </div>

        {/* Typing text */}
        <div style={{
          color: '#22d3ee',
          fontSize: '20px',
          letterSpacing: '0.3em',
          marginBottom: '16px',
          minHeight: '30px'
        }}>
          {typedText}
          {stage >= 2 && typedText.length < fullText.length && (
            <span style={{ 
              animation: 'blink 0.7s infinite',
              borderRight: '2px solid #22d3ee'
            }}>&nbsp;</span>
          )}
        </div>

        <div style={{
          color: 'rgba(148,163,184,0.6)',
          fontSize: '11px',
          letterSpacing: '0.25em',
          marginBottom: '48px'
        }}>
          CLASSIFIED — AUTHORIZED PERSONNEL ONLY
        </div>

        {/* Progress bar */}
        {stage >= 3 && (
          <div style={{ width: '320px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'rgba(148,163,184,0.6)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              marginBottom: '8px'
            }}>
              <span>LOADING SYSTEMS</span>
              <span>{progress}%</span>
            </div>
            <div style={{
              height: '2px',
              background: 'rgba(34,211,238,0.2)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: '#22d3ee',
                boxShadow: '0 0 10px #22d3ee',
                transition: 'width 0.1s'
              }} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg) }
          to { transform: rotate(360deg) }
        }
        @keyframes blink {
          0%, 100% { opacity: 1 }
          50% { opacity: 0 }
        }
      `}</style>
    </div>
  )
}

"use client"
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'

interface VoiceCommandsProps {
  onOpenPanel?: (panel: string) => void
  onWarRoom?: () => void
  dashboardData?: {
    totalShipments: number
    alerts: number
    pending: number
    inTransit: number
    delivered: number
    shipments?: any[]
  }
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking'

interface Message {
  role: 'user' | 'assistant'
  text: string
  model?: string
}

export default function VoiceCommands({ 
  onOpenPanel, 
  onWarRoom,
  dashboardData 
}: VoiceCommandsProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      text: 'Namaste! Main ARIA hoon. Aap Hindi ya English mein baat kar sakte hain. How can I help you?',
      model: 'groq'
    }
  ])
  const [autoListen, setAutoListen] = useState(false)
  const [usedModel, setUsedModel] = useState('')
  const recognitionRef = useRef<any>(null)
  const sessionId = useRef(`session-${Date.now()}`)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const voiceStateRef = useRef<VoiceState>('idle')
  const updateVoiceState = useCallback((state: VoiceState) => {
    voiceStateRef.current = state
    setVoiceState(state)
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recognitionRef.current?.abort()
        updateVoiceState('idle')
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [updateVoiceState])

  // Refs for tracking mutable values to avoid callback re-creations
  const isOpenRef = useRef(isOpen)
  const autoListenRef = useRef(autoListen)
  const onOpenPanelRef = useRef(onOpenPanel)
  const onWarRoomRef = useRef(onWarRoom)
  const dashboardDataRef = useRef(dashboardData)

  isOpenRef.current = isOpen
  autoListenRef.current = autoListen
  onOpenPanelRef.current = onOpenPanel
  onWarRoomRef.current = onWarRoom
  dashboardDataRef.current = dashboardData

  // Ref handles for circular callbacks
  const startListeningRef = useRef<() => void>(() => {})
  const processCommandRef = useRef<(text: string) => Promise<void>>(async () => {})

  const speakText = useCallback((text: string, lang: string = 'en-US') => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9
    utterance.pitch = 1.0
    
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find(v => v.lang === lang) || 
                  voices.find(v => v.lang.startsWith('en'))
    if (voice) utterance.voice = voice
    
    utterance.onend = () => {
      updateVoiceState('idle')
      // Wait 1.2 seconds before listening again
      // This gives Chrome time to reset audio pipeline
      setTimeout(() => {
        if (isOpenRef.current && autoListenRef.current) {
          startListeningRef.current()
        }
      }, 1200)
    }
    
    utterance.onerror = () => {
      updateVoiceState('idle')
      setTimeout(() => {
        if (isOpenRef.current && autoListenRef.current) {
          startListeningRef.current()
        }
      }, 1200)
    }
    
    updateVoiceState('speaking')
    window.speechSynthesis.speak(utterance)
  }, [updateVoiceState])

  const processCommand = useCallback(async (text: string) => {
    updateVoiceState('processing')
    setMessages(prev => [...prev, { role: 'user', text }])
    
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          dashboardData: dashboardDataRef.current || {
            totalShipments: 85,
            alerts: 30,
            pending: 20,
            inTransit: 15,
            delivered: 20
          },
          sessionId: sessionId.current
        })
      })
      
      const data = await res.json()
      const response = data.response || 'Sorry, I could not process that.'
      const language = data.language || 'en-US'
      const model = data.error || !res.ok ? 'error' : (data.model || 'groq')
      
      setUsedModel(model)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: response,
        model 
      }])
      
      // Execute actions
      if (data.actions && Array.isArray(data.actions)) {
        data.actions.forEach((action: string) => {
          if (action.startsWith('NAVIGATE:')) {
            const path = action.replace('NAVIGATE:', '')
            setTimeout(() => router.push(path), 500)
          } else if (action.startsWith('SHOW_PANEL:')) {
            const panel = action.replace('SHOW_PANEL:', '')
            onOpenPanelRef.current?.(panel)
          } else if (action === 'WAR_ROOM') {
            onWarRoomRef.current?.()
          } else if (action === 'REFRESH') {
            router.refresh()
          }
        })
      }
      
      speakText(response, language)
      
    } catch (err) {
      const errMsg = 'Sorry, there was an error. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', text: errMsg }])
      speakText(errMsg)
    }
  }, [router, speakText])

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || 
               (window as any).webkitSpeechRecognition
    
    if (!SR) {
      alert('Voice commands require Google Chrome browser.')
      return
    }
    
    // IMPORTANT: Always abort and nullify the old instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        recognitionRef.current.abort()
      } catch (e) {}
      recognitionRef.current = null
    }
    
    // Small delay to let Chrome release the mic
    setTimeout(() => {
      try {
        // Always create a completely fresh instance
        const recognition = new SR()
        recognitionRef.current = recognition
        
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'
        recognition.maxAlternatives = 1
        
        recognition.onstart = () => {
          updateVoiceState('listening')
          setTranscript('')
        }
        
        recognition.onresult = (event: any) => {
          let final = ''
          let interim = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript
            if (event.results[i].isFinal) final += t
            else interim += t
          }
          setTranscript(final || interim)
          if (final) {
            try { recognition.stop() } catch(e) {}
            processCommandRef.current(final)
          }
        }
        
        recognition.onerror = (event: any) => {
          console.log('Speech error:', event.error)
          
          if (event.error === 'not-allowed') {
            updateVoiceState('idle')
            setTranscript('❌ Microphone access denied.')
            return
          }
          
          if (event.error === 'no-speech') {
            updateVoiceState('idle')
            setTranscript('No speech detected. Tap to try again.')
            return
          }
          
          if (event.error === 'network' || event.error === 'audio-capture') {
            updateVoiceState('idle')
            setTranscript('Mic issue. Tap to try again.')
            // Auto retry after 1.5 seconds
            setTimeout(() => {
              if (isOpenRef.current) {
                startListeningRef.current()
              }
            }, 1500)
            return
          }
          
          if (event.error === 'aborted') {
            updateVoiceState('idle')
            return
          }
          
          updateVoiceState('idle')
          setTranscript('')
        }
        
        recognition.onend = () => {
          // Only reset to idle if we were listening
          // (not if we moved to processing/speaking)
          if (voiceStateRef.current === 'listening') {
            updateVoiceState('idle')
          }
        }
        
        recognition.start()
        console.log('Fresh recognition instance started')
        
      } catch (e) {
        console.error('Failed to start recognition:', e)
        updateVoiceState('idle')
      }
    }, 150) // 150ms delay lets Chrome fully release previous instance
    
  }, [updateVoiceState])

  startListeningRef.current = startListening
  processCommandRef.current = processCommand

  const stopAll = useCallback(() => {
    recognitionRef.current?.abort()
    window.speechSynthesis.cancel()
    updateVoiceState('idle')
    setTranscript('')
  }, [])

  const togglePanel = useCallback(() => {
    setIsOpen(prev => {
      if (prev) {
        stopAll()
        return false
      }
      return true
    })
  }, [stopAll])

  console.log('isOpen state:', isOpen, 'voiceState:', voiceState)

  return (
    <>
      {/* Mic Button - stays in header */}
      <button
        onClick={togglePanel}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
          isOpen
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
            : 'bg-white/5 border-white/10 text-slate-400 hover:border-sky-500/50 hover:text-sky-300'
        }`}
      >
        {voiceState === 'listening' ? '● LISTENING' :
         voiceState === 'processing' ? '⚡ ARIA...' :
         voiceState === 'speaking' ? '🔊 SPEAKING' :
         isOpen ? '🎤 ARIA OPEN' : '🎤 VOICE'}
      </button>

      {/* Portal - renders outside header */}
      {mounted && createPortal(
        <>
          {/* Voice Panel */}
          {isOpen && (
            <div
              style={{
                position: 'fixed',
                top: '90px',
                right: '16px',
                width: '380px',
                maxHeight: 'calc(100vh - 110px)',
                zIndex: 999999,
                background: '#0f1629',
                border: '1px solid rgba(14,165,233,0.4)',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: voiceState === 'listening' ? '#f87171' :
                                voiceState === 'processing' ? '#fbbf24' :
                                voiceState === 'speaking' ? '#34d399' : '#38bdf8',
                    animation: voiceState !== 'idle' ? 'pulse 1s infinite' : 'none'
                  }} />
                  <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>
                    ARIA Assistant
                  </span>
                  <span style={{ color: '#475569', fontSize: '10px', fontFamily: 'monospace' }}>
                    {usedModel === 'error' ? 'Groq unavailable' : 'Groq'}
                  </span>
                </div>
                <button
                  onClick={() => { stopAll(); setIsOpen(false) }}
                  style={{
                    background: 'none', border: 'none', color: '#64748b',
                    fontSize: '20px', cursor: 'pointer', width: '32px',
                    height: '32px', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}
                >×</button>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '16px',
                display: 'flex', flexDirection: 'column', gap: '12px',
                minHeight: '220px', maxHeight: '320px'
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      maxWidth: '85%', borderRadius: '12px',
                      padding: '8px 12px', fontSize: '13px',
                      background: msg.role === 'user' 
                        ? 'rgba(14,165,233,0.2)' 
                        : 'rgba(255,255,255,0.05)',
                      color: msg.role === 'user' ? '#bae6fd' : '#cbd5e1'
                    }}>
                      {msg.text}
                      {msg.model && msg.role === 'assistant' && (
                        <div style={{ fontSize: '10px', color: '#334155', marginTop: '4px' }}>
                          {msg.model === 'error' ? 'Groq unavailable' : msg.model === 'groq' ? 'Powered by Groq' : `${msg.model} via Groq`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {transcript && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      maxWidth: '85%', borderRadius: '12px', padding: '8px 12px',
                      fontSize: '13px', fontStyle: 'italic',
                      background: 'rgba(14,165,233,0.1)',
                      color: '#7dd3fc',
                      border: '1px solid rgba(14,165,233,0.2)'
                    }}>
                      {transcript}...
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div style={{
                padding: '8px 16px', textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <span style={{
                  fontSize: '11px', fontFamily: 'monospace',
                  color: voiceState === 'listening' ? '#f87171' :
                         voiceState === 'processing' ? '#fbbf24' :
                         voiceState === 'speaking' ? '#34d399' : '#475569'
                }}>
                  {voiceState === 'idle' && (
                  autoListen ? (
                    <span style={{ color: '#475569' }}>
                      Auto-listening in 1s... • Say anything
                    </span>
                  ) : (
                    'Tap mic to speak • Hindi & English'
                  )
                )}
                {voiceState === 'listening' && '● Listening... speak now'}
                {voiceState === 'processing' && '⚡ ARIA is thinking...'}
                {voiceState === 'speaking' && '🔊 ARIA is speaking...'}
                </span>
              </div>

              {/* Controls */}
              <div style={{
                display: 'flex', gap: '8px', padding: '12px 16px',
                borderTop: '1px solid rgba(255,255,255,0.05)'
              }}>
                <button
                  onClick={startListening}
                  disabled={voiceState !== 'idle'}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '12px',
                    fontSize: '14px', fontWeight: 500, cursor: voiceState === 'idle' ? 'pointer' : 'not-allowed',
                    background: voiceState === 'listening' 
                      ? 'rgba(239,68,68,0.2)' 
                      : voiceState !== 'idle'
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(14,165,233,0.2)',
                    color: voiceState === 'listening' ? '#fca5a5' :
                           voiceState !== 'idle' ? '#475569' : '#7dd3fc',
                    border: `1px solid ${
                      voiceState === 'listening' ? 'rgba(239,68,68,0.4)' :
                      voiceState !== 'idle' ? 'rgba(255,255,255,0.05)' :
                      'rgba(14,165,233,0.3)'
                    }`
                  }}
                >
                  {voiceState === 'listening' ? '● Listening...' : '🎤 Tap to Speak'}
                </button>
                <button
                  onClick={stopAll}
                  style={{
                    padding: '10px 12px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#64748b', border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', fontSize: '14px'
                  }}
                >■</button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoListen}
                    onChange={e => setAutoListen(e.target.checked)}
                    style={{ width: '12px', height: '12px', accentColor: '#38bdf8' }}
                  />
                  <span style={{ fontSize: '10px', color: '#475569' }}>Auto</span>
                </label>
              </div>

              {/* Quick commands */}
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ fontSize: '10px', color: '#334155', marginBottom: '8px' }}>
                  Quick commands:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Kitne alerts hain?', 'Show map', 'Fleet health', 'War room'].map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => { if (voiceState === 'idle') processCommand(cmd) }}
                      disabled={voiceState !== 'idle'}
                      style={{
                        padding: '4px 10px', borderRadius: '8px', fontSize: '10px',
                        background: 'rgba(255,255,255,0.05)', color: '#64748b',
                        border: '1px solid rgba(255,255,255,0.05)',
                        cursor: voiceState === 'idle' ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {cmd}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      stopAll()
                      setTimeout(() => startListening(), 500)
                    }}
                    style={{
                      padding: '4px 10px', borderRadius: '8px', fontSize: '10px',
                      background: 'rgba(245,158,11,0.1)', color: '#fbbf24',
                      border: '1px solid rgba(245,158,11,0.2)',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Reset Mic
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating mic orb */}
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              style={{
                position: 'fixed', bottom: '32px', left: '50%',
                transform: 'translateX(-50%)', zIndex: 999999,
                width: '60px', height: '60px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(14,165,233,0.5) 0%, rgba(14,165,233,0.15) 100%)',
                border: '2px solid rgba(14,165,233,0.6)',
                boxShadow: '0 0 40px rgba(14,165,233,0.5), 0 0 80px rgba(14,165,233,0.2)',
                cursor: 'pointer', fontSize: '26px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              🎤
            </button>
          )}
        </>
        , document.body
      )}
    </>
  )
}

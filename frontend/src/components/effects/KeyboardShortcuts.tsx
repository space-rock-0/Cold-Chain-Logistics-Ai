"use client"
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SHORTCUTS = [
  { key: '?', description: 'Show this panel' },
  { key: 'D', description: 'Go to Dashboard' },
  { key: 'M', description: 'Go to Map View' },
  { key: 'A', description: 'Go to Analytics' },
  { key: 'L', description: 'Go to ML Insights' },
  { key: 'Esc', description: 'Close panels' },
  { key: 'Ctrl+R', description: 'Refresh data' },
]

interface KeyboardShortcutsProps {
  onNavigate?: (action: 'Dashboard' | 'Map View' | 'Analytics' | 'ML Insights' | 'Refresh') => void
  onCloseAll?: () => void
}

export default function KeyboardShortcuts({ onNavigate, onCloseAll }: KeyboardShortcutsProps) {
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      if (e.key === '?' && !e.ctrlKey) {
        setShow(s => !s)
      }
      if (e.key === 'Escape') {
        setShow(false)
        if (onCloseAll) onCloseAll()
      }

      const keyUpper = e.key.toUpperCase()
      if (e.ctrlKey && keyUpper === 'R') {
        if (onNavigate) {
          e.preventDefault()
          onNavigate('Refresh')
        }
      } else if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        if (keyUpper === 'D') {
          if (onNavigate) onNavigate('Dashboard')
        } else if (keyUpper === 'M') {
          if (onNavigate) onNavigate('Map View')
        } else if (keyUpper === 'A') {
          if (onNavigate) onNavigate('Analytics')
        } else if (keyUpper === 'L') {
          if (onNavigate) onNavigate('ML Insights')
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onNavigate, onCloseAll])
  
  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          onClick={() => setShow(false)}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-96 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-cyan-400 font-bold text-lg mb-6">
              ⌨️ Keyboard Shortcuts
            </h2>
            <div className="space-y-3">
              {SHORTCUTS.map(s => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{s.description}</span>
                  <kbd className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-cyan-300 font-mono">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-slate-600 text-xs mt-6 text-center">
              Press ? or Esc to close
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface DetailPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle: string
  accentColor: string
  children: React.ReactNode
}

export default function DetailPanel({ 
  isOpen, onClose, title, subtitle, accentColor, children 
}: DetailPanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[420px] z-50 overflow-y-auto"
            style={{
              background: '#0f1629',
              borderLeft: `1px solid ${accentColor}30`,
              boxShadow: `-20px 0 60px rgba(0,0,0,0.5)`
            }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 p-6 border-b border-white/5"
              style={{ background: '#0f1629' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">
                    {title}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 
                    flex items-center justify-center text-slate-400 
                    hover:text-slate-200 transition-all text-lg cursor-pointer"
                >
                  ×
                </button>
              </div>
              {/* Accent line */}
              <div className="mt-4 h-0.5 rounded-full"
                style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
            </div>
            
            {/* Content */}
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

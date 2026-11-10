"use client"
import { useEffect, useRef } from 'react'

export default function DeliveryExplosion({ 
  x, y, onComplete 
}: { x: number; y: number; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles = Array.from({ length: 60 }, () => ({
      x, y,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15,
      life: 1,
      size: Math.random() * 6 + 2,
      color: ['#22d3ee', '#10b981', '#6366f1', '#ffffff'][
        Math.floor(Math.random() * 4)
      ]
    }))
    
    let animId: number
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      
      particles.forEach(p => {
        p.life -= 0.02
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.3
        p.size *= 0.97
        if (p.life > 0) {
          alive = true
          ctx.globalAlpha = p.life
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.shadowBlur = 15
          ctx.shadowColor = p.color
          ctx.fill()
        }
      })
      
      ctx.globalAlpha = 1
      if (alive) animId = requestAnimationFrame(animate)
      else onComplete()
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [x, y, onComplete])
  
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100]"
    />
  )
}

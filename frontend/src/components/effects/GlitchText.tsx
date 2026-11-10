"use client"
import { useEffect, useRef } from 'react'

export default function GlitchText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  
  useEffect(() => {
    const chars = '!<>-_\\/[]{}—=+*^?#'
    let interval: ReturnType<typeof setInterval>
    let iteration = 0
    
    const glitch = () => {
      iteration = 0 // Reset iteration for each run
      interval = setInterval(() => {
        if (!ref.current) return
        ref.current.innerText = text
          .split('')
          .map((char, i) => {
            if (i < iteration) return text[i]
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')
        
        if (iteration >= text.length) {
          clearInterval(interval)
        }
        iteration += 1/3
      }, 30)
    }
    
    // Glitch every 4 seconds
    glitch()
    const outer = setInterval(glitch, 4000)
    return () => { 
      clearInterval(interval)
      clearInterval(outer) 
    }
  }, [text])
  
  return <span ref={ref}>{text}</span>
}

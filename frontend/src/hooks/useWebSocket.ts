"use client";

import { useEffect, useState } from "react";

const WS_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/shipments/')
  : null

export function useShipmentWebSocket() {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [liveMessage, setLiveMessage] = useState<string>("");

  useEffect(() => {
    if (!WS_URL) return
    
    let reconnectTimer: NodeJS.Timeout
    let ws: WebSocket
    
    let disposed = false
    const connect = async () => {
      try {
        const res = await fetch('/api/auth/socket', {cache: 'no-store'})
        if (!res.ok || disposed) return
        const {token} = await res.json()
        if (!token || disposed) return
        ws = new WebSocket(WS_URL, ['bearer', token])
        
        ws.onopen = () => {
          setConnected(true)
          console.log('WebSocket connected!')
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setLastUpdate(new Date().toLocaleTimeString())
            if (data.message) setLiveMessage(data.message)
            if (data.type === 'shipment_update') {
              setLiveMessage(data.message || 'Temperature update received')
            }
          } catch (e) {
            console.log('WS message parse error:', e)
          }
        }
        
        ws.onerror = (err) => {
          console.log('WebSocket error - will retry')
          setConnected(false)
        }
        
        ws.onclose = () => {
          setConnected(false)
          // Retry after 5 seconds
          if (!disposed) reconnectTimer = setTimeout(connect, 5000)
        }
        
      } catch (err) {
        setConnected(false)
        reconnectTimer = setTimeout(connect, 5000)
      }
    }
    
    connect()
    
    return () => {
      disposed = true
      clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [])

  console.log('WS connected state:', connected)
  return { connected, lastUpdate, liveMessage };
}

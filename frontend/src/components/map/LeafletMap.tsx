"use client"
import { useEffect, useRef } from 'react'

const HUBS = [
  { name: "Port of Singapore", lat: 1.29, lng: 103.85, shipments: 12 },
  { name: "Rotterdam Gateway", lat: 51.95, lng: 4.14, shipments: 8 },
  { name: "FedEx Memphis", lat: 35.04, lng: -89.98, shipments: 6 },
  { name: "Dubai World Central", lat: 24.90, lng: 55.16, shipments: 9 },
  { name: "Shanghai Yangshan", lat: 30.63, lng: 122.05, shipments: 11 },
  { name: "Los Angeles", lat: 33.74, lng: -118.27, shipments: 7 },
  { name: "Frankfurt Airport", lat: 50.03, lng: 8.57, shipments: 5 },
  { name: "Tokyo Narita", lat: 35.77, lng: 140.39, shipments: 8 },
  { name: "New York JFK", lat: 40.64, lng: -73.78, shipments: 10 },
  { name: "London Heathrow", lat: 51.47, lng: -0.45, shipments: 6 },
  { name: "Mumbai JNPT", lat: 18.93, lng: 72.95, shipments: 4 },
  { name: "Sydney Airport", lat: -33.94, lng: 151.18, shipments: 3 },
  { name: "Amsterdam Schiphol", lat: 52.31, lng: 4.76, shipments: 5 },
  { name: "Hong Kong Cargo", lat: 22.31, lng: 113.91, shipments: 7 },
  { name: "Istanbul Airport", lat: 41.26, lng: 28.74, shipments: 6 },
]

export default function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (mapInstanceRef.current) return
    if (!mapRef.current) return

    // Load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // Load Leaflet JS dynamically
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      const L = (window as any).L

      // Create map
      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
      })

      mapInstanceRef.current = map

      // Dark tile layer
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '©OpenStreetMap ©CartoDB',
          maxZoom: 19,
        }
      ).addTo(map)

      // Add hub markers
      HUBS.forEach(hub => {
        const radius = 6 + hub.shipments * 0.8
        const circle = L.circleMarker([hub.lat, hub.lng], {
          radius,
          fillColor: '#22d3ee',
          color: '#22d3ee',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.4,
        }).addTo(map)

        circle.bindPopup(`
          <div style="background:#0f172a;color:#e2e8f0;padding:8px;border-radius:8px;border:1px solid rgba(34,211,238,0.3)">
            <strong style="color:#22d3ee">${hub.name}</strong><br/>
            <span>${hub.shipments} active shipments</span>
          </div>
        `)
      })

      // Draw route lines between random hub pairs
      const routes = [
        [0, 8], [1, 3], [4, 2], [5, 7], [9, 6],
        [0, 4], [3, 8], [1, 9], [6, 13], [14, 2]
      ]
      routes.forEach(([a, b]) => {
        L.polyline(
          [[HUBS[a].lat, HUBS[a].lng], [HUBS[b].lat, HUBS[b].lng]],
          { color: '#22d3ee', weight: 1, opacity: 0.3, dashArray: '5,10' }
        ).addTo(map)
      })
    }

    document.head.appendChild(script)

    return () => {
      // Clean up script and styles
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={mapRef}
      style={{ height: '70vh', width: '100%', borderRadius: '12px' }}
    />
  )
}

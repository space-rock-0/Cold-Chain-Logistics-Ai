import { backendFetch } from '@/lib/backend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { reference, status } = await req.json()
    
    const res = await backendFetch(
      `${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/api/shipments/update/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, status })
      }
    )
    
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ success: true, shipment: data })
    }
    
    return NextResponse.json({ success: false }, { status: res.status })
  } catch (err) {
    console.error('Shipment update proxy error:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

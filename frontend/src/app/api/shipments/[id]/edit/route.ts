import { backendFetch } from '@/lib/backend'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params
    const id = params.id
    const body = await req.json()
    
    const res = await backendFetch(
      `${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/api/shipments/${id}/edit/`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    )
    
    const data = await res.json()
    if (res.ok) {
      return NextResponse.json(data)
    }
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('Shipment edit proxy error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

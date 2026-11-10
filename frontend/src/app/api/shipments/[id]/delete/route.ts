import { backendFetch } from '@/lib/backend'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params
    const id = params.id
    
    const res = await backendFetch(
      `${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/api/shipments/${id}/delete/`,
      {
        method: 'DELETE'
      }
    )
    
    const data = await res.json()
    if (res.ok) {
      return NextResponse.json(data)
    }
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('Shipment delete proxy error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

import { backendFetch } from '@/lib/backend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await backendFetch(`${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/api/ai/langchain/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    return NextResponse.json(data, {status: res.status})
  } catch (err) {
    console.error('LangChain proxy error:', err)
    return NextResponse.json({ 
      analysis: 'Backend unavailable',
      error: true 
    }, {status: 503})
  }
}

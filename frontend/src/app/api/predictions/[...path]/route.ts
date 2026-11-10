import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest, context: {params: Promise<{path: string[]}>}) {
  const {path} = await context.params
  const allowed = ['ml/predict/spoilage','ml/predict/eta','ml/detect/anomaly','ml/optimize/route']
  const route = path.join('/')
  if (!allowed.includes(route)) return NextResponse.json({error: 'Not found'}, {status: 404})
  try {
    const res = await fetch(`${process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000'}/${route}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(await req.json()), signal: AbortSignal.timeout(30000)})
    return NextResponse.json(await res.json(), {status: res.status})
  } catch { return NextResponse.json({error: 'Prediction service unavailable'}, {status: 503}) }
}

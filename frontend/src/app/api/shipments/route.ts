import { backendFetch } from '@/lib/backend'
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await backendFetch(`${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/api/shipments/`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}

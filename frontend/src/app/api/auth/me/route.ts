import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({user: null}, {status: 401});
  try {
    const res = await fetch(`${process.env.BACKEND_URL || 'http://127.0.0.1:8000'}/api/auth/me/`, {headers: {Authorization: `Bearer ${token}`}, cache: 'no-store'});
    return NextResponse.json(await res.json(), {status: res.status});
  } catch { return NextResponse.json({user: null}, {status: 503}); }
}

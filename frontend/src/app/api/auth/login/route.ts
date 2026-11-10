import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const {email, password} = await req.json();
    const res = await fetch(`${process.env.BACKEND_URL || 'http://127.0.0.1:8000'}/api/auth/login/`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: email, password})});
    const data = await res.json();
    if (!res.ok) return NextResponse.json({error: 'Invalid credentials'}, {status: 401});
    const response = NextResponse.json({success: true, user: data.user});
    response.cookies.set('auth_token', data.access, {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1800, path: '/'});
    return response;
  } catch { return NextResponse.json({error: 'Backend unavailable'}, {status: 503}); }
}

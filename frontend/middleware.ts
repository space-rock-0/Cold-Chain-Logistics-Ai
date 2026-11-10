import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/api/auth/login' || req.nextUrl.pathname === '/api/auth/logout') return NextResponse.next();
  const token = req.cookies.get("auth_token");

  if (!token) {
    return req.nextUrl.pathname.startsWith('/api/') ? NextResponse.json({error: 'Authentication required'}, {status: 401}) : NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const res = await fetch(`${process.env.BACKEND_URL || 'http://127.0.0.1:8000'}/api/auth/me/`, {headers: {Authorization: `Bearer ${token.value}`}, cache: 'no-store'});
    if (!res.ok) return req.nextUrl.pathname.startsWith('/api/') ? NextResponse.json({error: 'Session expired'}, {status: 401}) : NextResponse.redirect(new URL('/login', req.url));
  } catch { return NextResponse.json({error: 'Backend unavailable'}, {status: 503}); }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
};

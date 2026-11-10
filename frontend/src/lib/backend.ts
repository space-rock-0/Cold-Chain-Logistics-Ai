import { cookies } from 'next/headers'

export async function backendFetch(input: string, init: RequestInit = {}) {
  const token = (await cookies()).get('auth_token')?.value
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(input, { ...init, headers, cache: 'no-store', signal: init.signal || AbortSignal.timeout(35000) })
}

import { NextRequest, NextResponse } from 'next/server';

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:3000';

type Params = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, { params }: Params) {
  const { path } = await params;
  const cookie = req.headers.get('cookie') ?? '';
  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
  const body = req.method !== 'GET' ? await req.text() : undefined;

  const res = await fetch(`${AUTH_API}/api/auth/${path.join('/')}`, {
    method: req.method,
    headers: { 'Content-Type': 'application/json', cookie, origin },
    body,
  });

  const text = await res.text();
  const headers = new Headers({ 'Content-Type': 'application/json' });

  // forward set-cookie so the session cookie reaches the browser
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') headers.append('set-cookie', value);
  });

  return new NextResponse(text || null, { status: res.status, headers });
}

export { proxy as GET, proxy as POST };

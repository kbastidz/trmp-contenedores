import { NextRequest, NextResponse } from 'next/server';

const TRM_API = process.env.NEXT_PUBLIC_TRM_API_URL ?? 'http://localhost:3002';

type Params = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, { params }: Params) {
  const { path } = await params;
  const cookie = req.headers.get('cookie') ?? '';
  const { search } = new URL(req.url);
  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

  const url = `${TRM_API}/api/trm/${path.join('/')}${search}`;

  console.log(`[TRM proxy] ➡️  ${req.method} ${url}`);

  const res = await fetch(url, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      cookie,
    },
    body,
  });

  const text = await res.text();
  console.log(`[TRM proxy] ⬅️  ${res.status} ${req.method} ${url}`);

  const headers = new Headers({ 'Content-Type': 'application/json' });

  // Reenviar set-cookie si el backend TRM devuelve alguna
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') headers.append('set-cookie', value);
  });

  return new NextResponse(text || null, { status: res.status, headers });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PATCH,
  proxy as PUT,
  proxy as DELETE,
};

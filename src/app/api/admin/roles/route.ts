import { NextRequest, NextResponse } from 'next/server';

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:3000';

export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';
  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
  const res = await fetch(`${AUTH_API}/api/roles`, { headers: { cookie, origin } });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}

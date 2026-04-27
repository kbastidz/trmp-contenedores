import { NextRequest, NextResponse } from 'next/server';

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:3000';

type Params = { params: Promise<{ id: string; roleId: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, roleId } = await params;
  const cookie = req.headers.get('cookie') ?? '';
  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

  const res = await fetch(`${AUTH_API}/api/users/${id}/roles/${roleId}`, {
    method: 'DELETE',
    headers: { cookie, origin },
  });
  return new NextResponse(null, { status: res.status });
}

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const configuredToken = process.env.EXPORT_TOKEN?.trim()
  const body = await request.json().catch(() => ({})) as { token?: unknown }
  const providedToken = typeof body.token === 'string' ? body.token.trim() : ''
  const valid = Boolean(configuredToken && providedToken && providedToken === configuredToken)

  return NextResponse.json(
    { valid },
    {
      status: valid ? 200 : 401,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}

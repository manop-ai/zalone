// app/api/insights/route.ts
// Returns auto-generated market insight sentences for a neighborhood
// GET /api/insights?slug=lekki-phase-1

import { NextRequest, NextResponse } from 'next/server'
import { generateInsights } from '../../../lib/insights'

// Fetch live NGN rate (cached per request via Next.js fetch cache)
async function getLiveNGNRate(): Promise<number> {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 },
    })
    const d = await r.json()
    return d?.rates?.NGN || 1570
  } catch {
    return 1570
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || 'lekki-phase-1'
  const ngnRate = await getLiveNGNRate()
  const insights = generateInsights(slug, ngnRate)

  return NextResponse.json({
    slug,
    ngn_rate: ngnRate,
    count:    insights.length,
    insights,
    generated_at: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
  })
}
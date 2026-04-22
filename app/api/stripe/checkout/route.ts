// app/api/stripe/checkout/route.ts
// Creates a Stripe Checkout Session for Pro subscription
// POST /api/stripe/checkout
// Body: { email: string, plan: 'pro_monthly' | 'pro_annual' }

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const PRICE_IDS: Record<string, string> = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  pro_annual:  process.env.STRIPE_PRICE_PRO_ANNUAL  || '',
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://manopintel.com'

export async function POST(req: NextRequest) {
  try {
    const { email, plan = 'pro_monthly' } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const priceId = PRICE_IDS[plan]
    if (!priceId) {
      return NextResponse.json({ error: `Unknown plan: ${plan}` }, { status: 400 })
    }

    // Find or create Stripe customer
    const existing = await stripe.customers.list({ email, limit: 1 })
    const customer = existing.data.length > 0
      ? existing.data[0]
      : await stripe.customers.create({ email, metadata: { source: 'manop-platform' } })

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer:    customer.id,
      mode:        'subscription',
      line_items:  [{ price: priceId, quantity: 1 }],
      success_url: `${BASE_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
      cancel_url:  `${BASE_URL}/pricing?cancelled=true`,
      metadata: {
        email,
        plan,
        source: 'manop-platform',
      },
      subscription_data: {
        metadata: { email, plan },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url, session_id: session.id })

  } catch (err: unknown) {
    console.error('Stripe checkout error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
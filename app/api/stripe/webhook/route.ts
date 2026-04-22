// app/api/stripe/webhook/route.ts
// Stripe webhook receiver — the critical link between payment and access
//
// Events handled:
//   checkout.session.completed    → create subscription + flip user to Pro
//   customer.subscription.updated → handle plan changes
//   customer.subscription.deleted → downgrade to free
//   invoice.payment_failed        → mark past_due, send warning
//
// Setup in Stripe Dashboard:
//   1. Add endpoint: https://manopintel.com/api/stripe/webhook
//   2. Select events: checkout.session.completed, customer.subscription.*,
//      invoice.payment_failed, invoice.paid
//   3. Copy signing secret → STRIPE_WEBHOOK_SECRET env var

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

// Use service role key — webhook must bypass RLS to write to user tables
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
)

// ─── Upsert user profile ──────────────────────────────────────
async function upsertProfile(email: string, tier: string, stripeCustomerId: string) {
  const { error } = await sb
    .from('user_profiles')
    .upsert(
      { email, tier, stripe_customer_id: stripeCustomerId, updated_at: new Date().toISOString() },
      { onConflict: 'email' }
    )
  if (error) console.error('upsertProfile error:', error.message)
}

// ─── Upsert subscription ──────────────────────────────────────
async function upsertSubscription(
  email:           string,
  stripeCustomerId: string,
  sub:             Stripe.Subscription,
  status:          string,
) {
  // Get user profile id
  const { data: profile } = await sb
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!profile) return

  const priceId  = sub.items.data[0]?.price?.id || ''
  const plan     = priceId.includes('annual') ? 'pro_annual' : 'pro_monthly'
  const periodStart = new Date((sub as any).current_period_start * 1000).toISOString()
  const periodEnd   = new Date((sub as any).current_period_end   * 1000).toISOString()

  const { error } = await sb
    .from('user_subscriptions')
    .upsert(
      {
        user_id:                profile.id,
        email,
        stripe_customer_id:     stripeCustomerId,
        stripe_subscription_id: sub.id,
        stripe_price_id:        priceId,
        plan,
        status,
        current_period_start:   periodStart,
        current_period_end:     periodEnd,
        cancel_at_period_end:   sub.cancel_at_period_end,
        updated_at:             new Date().toISOString(),
      },
      { onConflict: 'stripe_subscription_id' }
    )
  if (error) console.error('upsertSubscription error:', error.message)
}

// ─── Main webhook handler ─────────────────────────────────────
export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  // Verify webhook signature — reject anything not from Stripe
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Webhook signature verification failed:', msg)
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 })
  }

  console.log(`Stripe event: ${event.type}`)

  try {
    switch (event.type) {

      // ── Checkout completed → user paid → flip to Pro ──────
      case 'checkout.session.completed': {
        const session    = event.data.object as Stripe.Checkout.Session
        const email      = session.metadata?.email || session.customer_email || ''
        const customerId = session.customer as string

        if (!email) { console.error('No email in checkout session'); break }

        // Ensure user profile exists as Pro
        await upsertProfile(email, 'pro', customerId)

        // If subscription mode, get subscription details
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await upsertSubscription(email, customerId, sub, 'active')
        }

        console.log(`✓ User ${email} upgraded to Pro`)
        break
      }

      // ── Subscription updated (plan change, renewal, etc.) ─
      case 'customer.subscription.updated': {
        const sub        = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const customer   = await stripe.customers.retrieve(customerId) as Stripe.Customer
        const email      = customer.email || ''

        if (!email) break

        const tier = ['active', 'trialing'].includes(sub.status) ? 'pro' : 'free'
        await upsertProfile(email, tier, customerId)
        await upsertSubscription(email, customerId, sub, sub.status)

        console.log(`✓ Subscription updated: ${email} → ${tier} (${sub.status})`)
        break
      }

      // ── Subscription cancelled / expired → downgrade ──────
      case 'customer.subscription.deleted': {
        const sub        = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const customer   = await stripe.customers.retrieve(customerId) as Stripe.Customer
        const email      = customer.email || ''

        if (!email) break

        // Flip back to free
        await upsertProfile(email, 'free', customerId)
        await upsertSubscription(email, customerId, sub, 'cancelled')

        console.log(`✓ Subscription cancelled: ${email} → free`)
        break
      }

      // ── Payment failed → mark past_due ────────────────────
      case 'invoice.payment_failed': {
        const invoice    = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const customer   = await stripe.customers.retrieve(customerId) as Stripe.Customer
        const email      = customer.email || ''

        if (!email || !(invoice as any).subscription) break

        const sub = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
        await upsertSubscription(email, customerId, sub, 'past_due')

        // Keep Pro access for now — Stripe will retry payment
        // After 3 failures Stripe fires subscription.deleted
        console.log(`⚠ Payment failed: ${email} — keeping Pro, marked past_due`)
        break
      }

      // ── Invoice paid → confirm active ─────────────────────
      case 'invoice.paid': {
        const invoice    = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const customer   = await stripe.customers.retrieve(customerId) as Stripe.Customer
        const email      = customer.email || ''

        if (!email || !(invoice as any).subscription) break

        const sub = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
        await upsertProfile(email, 'pro', customerId)
        await upsertSubscription(email, customerId, sub, 'active')

        console.log(`✓ Invoice paid: ${email} → Pro confirmed`)
        break
      }

      default:
        // Ignore other events
        break
    }

    return NextResponse.json({ received: true })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Webhook handler error:', msg)
    // Return 200 anyway — don't let Stripe retry on DB errors
    return NextResponse.json({ received: true, warning: msg })
  }
}
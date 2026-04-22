'use client'
// app/pricing/page.tsx
// MANOP Pricing — Day 10
// Monthly / annual toggle. Clean conversion surface.
// Stripe checkout on click. Email capture before redirect.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getInitialDark, listenTheme } from '../../lib/theme'
import { setUserEmail } from '../../lib/pro'

const FREE_FEATURES = [
  'Traditional yield on every property',
  'Cap rate (net operating income ÷ price)',
  'ROI signal — Strong / Moderate / Low',
  'vs Market median badge (real bedroom data)',
  'PropLens verdict — Fair / Overpriced / Underpriced',
  'Neighborhood comparison — price, yield, cap rate',
  'Dual NGN + USD pricing at live rate',
  'Search across all verified listings',
]

const PRO_FEATURES = [
  'Everything in Free',
  'STR / Airbnb yield on every property',
  'Cash-on-cash return (leveraged analysis)',
  'Full 10-year USD return model with chart',
  'Neighborhood comparison — STR yield row unlocked',
  'PropLens deep analysis — risk score + full explanation',
  'Price trend projection (5yr, 10yr)',
  'Priority support',
]

const FAQS = [
  {
    q: 'What data are the benchmarks based on?',
    a: 'Real agency-submitted listings from verified partners. Lekki Phase 1 benchmarks are computed from 33 for-sale and 17 rental listings from CW Real Estate. Labeled "verified" vs "research estimate" where applicable.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your account settings anytime. You keep Pro access until the end of the billing period.',
  },
  {
    q: 'Is this useful if I\'m outside Nigeria?',
    a: 'Yes — all prices are shown in USD at live exchange rates. The depreciation model is especially relevant for diaspora investors managing currency risk.',
  },
  {
    q: 'What currencies does Manop support?',
    a: 'NGN (Nigeria), GHS (Ghana), KES (Kenya). All converted to USD at live open.er-api.com rates. Your payment is in USD via Stripe.',
  },
  {
    q: 'What if the data isn\'t available for my area?',
    a: 'Manop shows verified data where it exists and clearly labels research estimates where it doesn\'t. As more agencies join, coverage expands. Contact us to request your area.',
  },
]

export default function PricingPage() {
  const [dark,      setDark]      = useState(true)
  const [annual,    setAnnual]    = useState(false)
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [emailErr,  setEmailErr]  = useState('')
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    setDark(getInitialDark())
    return listenTheme(d => setDark(d))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('cancelled') === 'true') setCancelled(true)
  }, [])

  const bg    = dark ? '#0F172A' : '#F8FAFC'
  const bg2   = dark ? '#1E293B' : '#F1F5F9'
  const bg3   = dark ? '#162032' : '#FFFFFF'
  const text  = dark ? '#F8FAFC' : '#0F172A'
  const text2 = dark ? 'rgba(248,250,252,0.65)' : 'rgba(15,23,42,0.65)'
  const text3 = dark ? 'rgba(248,250,252,0.32)' : 'rgba(15,23,42,0.32)'
  const border = dark ? 'rgba(248,250,252,0.07)' : 'rgba(15,23,42,0.07)'

  const monthlyPrice = 29
  const annualPrice  = 249
  const annualMonthly = Math.round(annualPrice / 12)

  async function handleCheckout(plan: 'pro_monthly' | 'pro_annual') {
    if (!email || !email.includes('@')) {
      setEmailErr('Enter your email to continue')
      return
    }
    setEmailErr('')
    setLoading(true)
    setUserEmail(email)

    try {
      const res  = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setEmailErr(data.error || 'Something went wrong. Try again.')
      }
    } catch (err) {
      setEmailErr('Could not connect to payment system. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp = { width: '100%', padding: '0.7rem 0.875rem', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: `1px solid ${border}`, borderRadius: 9, color: text, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }

  const checkItem = (text: string, pro = false) => (
    <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.6rem' }}>
      <span style={{ color: pro ? '#5B2EFF' : '#22C55E', fontSize: '0.75rem', flexShrink: 0, marginTop: 2 }}>✓</span>
      <span style={{ fontSize: '0.82rem', color: pro ? text : text2, lineHeight: 1.45 }}>{text}</span>
    </div>
  )

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text }}>

      {/* Header */}
      <div style={{ background: bg2, borderBottom: `1px solid ${border}`, padding: '2rem 2rem 1.5rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <Link href="/" style={{ fontSize: '0.75rem', color: text3, textDecoration: 'none' }}>Manop</Link>
            <span style={{ color: text3 }}>›</span>
            <span style={{ fontSize: '0.75rem', color: text2 }}>Pricing</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
            Invest with real intelligence.
          </h1>
          <p style={{ fontSize: '0.9rem', color: text2, maxWidth: 440, margin: '0 auto' }}>
            Free intelligence for every investor. Pro unlocks the deeper analysis.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 2rem' }}>

        {cancelled && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '0.875rem 1.25rem', fontSize: '0.82rem', color: '#F59E0B', marginBottom: '2rem', textAlign: 'center' }}>
            Payment was cancelled — your account stays on the free plan. No charge was made.
          </div>
        )}

        {/* Annual / monthly toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.875rem', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: !annual ? text : text3, fontWeight: !annual ? 600 : 400 }}>Monthly</span>
          <button
            onClick={() => setAnnual(a => !a)}
            style={{ width: 48, height: 26, borderRadius: 100, background: annual ? '#5B2EFF' : border, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: annual ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </button>
          <span style={{ fontSize: '0.82rem', color: annual ? text : text3, fontWeight: annual ? 600 : 400 }}>
            Annual
            <span style={{ fontSize: '0.68rem', background: 'rgba(91,46,255,0.12)', color: '#7C5FFF', borderRadius: 20, padding: '0.1rem 0.45rem', marginLeft: '0.4rem', fontWeight: 700, border: '1px solid rgba(91,46,255,0.2)' }}>
              Save $99
            </span>
          </span>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '3rem' }}>

          {/* Free */}
          <div style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 16, padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>Free · Beta</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: text, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.25rem' }}>$0</div>
            <div style={{ fontSize: '0.75rem', color: text3, marginBottom: '1.5rem' }}>Forever. No credit card.</div>

            <div style={{ flex: 1, marginBottom: '1.5rem' }}>
              {FREE_FEATURES.map(f => checkItem(f))}
            </div>

            <Link href="/search" style={{ display: 'block', background: 'transparent', border: `1px solid ${border}`, color: text2, borderRadius: 10, padding: '0.75rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
              Start browsing →
            </Link>
          </div>

          {/* Pro */}
          <div style={{ background: bg3, border: '1.5px solid rgba(91,46,255,0.5)', borderRadius: 16, padding: '1.75rem', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: dark ? '0 0 0 1px rgba(91,46,255,0.1), 0 8px 32px rgba(91,46,255,0.12)' : '0 8px 32px rgba(91,46,255,0.08)' }}>
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#5B2EFF', color: '#fff', borderRadius: 20, padding: '0.2rem 0.875rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Most complete
            </div>

            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#7C5FFF', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>Pro</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: text, letterSpacing: '-0.04em', lineHeight: 1 }}>
                ${annual ? annualMonthly : monthlyPrice}
              </div>
              <div style={{ fontSize: '0.8rem', color: text3 }}>/month</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: text3, marginBottom: '1.5rem' }}>
              {annual ? `$${annualPrice} billed annually` : 'Billed monthly · cancel anytime'}
            </div>

            {/* Email input */}
            <div style={{ marginBottom: '0.75rem' }}>
              <input
                style={inp}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailErr('') }}
                onKeyDown={e => e.key === 'Enter' && handleCheckout(annual ? 'pro_annual' : 'pro_monthly')}
              />
              {emailErr && <div style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: '0.35rem' }}>{emailErr}</div>}
            </div>

            <button
              onClick={() => handleCheckout(annual ? 'pro_annual' : 'pro_monthly')}
              disabled={loading}
              style={{ background: '#5B2EFF', color: '#fff', border: 'none', borderRadius: 10, padding: '0.825rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1, transition: 'background 0.15s, transform 0.1s', marginBottom: '1rem' }}
              onMouseEnter={e => { if (!loading) { (e.target as HTMLButtonElement).style.background = '#7C5FFF'; (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#5B2EFF'; (e.target as HTMLButtonElement).style.transform = 'translateY(0)' }}>
              {loading ? 'Connecting to Stripe…' : `Get Pro${annual ? ' — annual' : ''} →`}
            </button>

            <div style={{ fontSize: '0.65rem', color: text3, textAlign: 'center', marginBottom: '1.25rem' }}>
              Secure checkout via Stripe · Cancel anytime
            </div>

            <div style={{ flex: 1 }}>
              {PRO_FEATURES.map(f => checkItem(f, true))}
            </div>
          </div>
        </div>

        {/* Feature comparison table */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem', textAlign: 'center' }}>
            Full comparison
          </div>
          {[
            { feature: 'Traditional yield', free: true, pro: true },
            { feature: 'Cap rate', free: true, pro: true },
            { feature: 'ROI signal', free: true, pro: true },
            { feature: 'vs Market median badge', free: true, pro: true },
            { feature: 'PropLens verdict', free: true, pro: true },
            { feature: 'Dual NGN + USD pricing', free: true, pro: true },
            { feature: 'Neighborhood comparison (price, yield, cap)', free: true, pro: true },
            { feature: 'STR / Airbnb yield', free: false, pro: true },
            { feature: 'Cash-on-cash return', free: false, pro: true },
            { feature: '10-year USD return chart', free: false, pro: true },
            { feature: 'Price trend projection', free: false, pro: true },
            { feature: 'Neighborhood comparison (STR row)', free: false, pro: true },
            { feature: 'PropLens deep analysis', free: false, pro: true },
          ].map((row, i) => (
            <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '0.5rem', padding: '0.65rem 1rem', background: i % 2 === 0 ? (dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') : 'transparent', borderRadius: 6, alignItems: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: text2 }}>{row.feature}</div>
              <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>{row.free ? '✓' : <span style={{ color: text3 }}>—</span>}</div>
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#7C5FFF' }}>{row.pro ? '✓' : '—'}</div>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '0.5rem', padding: '0.5rem 1rem', marginTop: '0.5rem' }}>
            <div />
            <div style={{ textAlign: 'center', fontSize: '0.65rem', color: text3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Free</div>
            <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#7C5FFF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pro</div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem', textAlign: 'center' }}>
            Questions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {FAQS.map(faq => (
              <div key={faq.q} style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: text, marginBottom: '0.5rem', lineHeight: 1.35 }}>{faq.q}</div>
                <div style={{ fontSize: '0.78rem', color: text2, lineHeight: 1.6 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${border}` }}>
          <div style={{ fontSize: '0.75rem', color: text3, marginBottom: '0.5rem' }}>
            Questions about the data or partnership?
          </div>
          <a href="mailto:partners@manopintel.com" style={{ fontSize: '0.85rem', color: '#14B8A6', fontWeight: 600 }}>
            partners@manopintel.com
          </a>
        </div>
      </div>
    </div>
  )
}

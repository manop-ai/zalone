'use client'
// app/pricing/success/page.tsx
// Shown after successful Stripe checkout
// Confirms Pro access, caches tier in localStorage, redirects to search

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { setUserEmail, clearProCache } from '../../../lib/pro'
import { getInitialDark } from '../../../lib/theme'

export default function PricingSuccess() {
  const [dark]    = useState(getInitialDark())
  const [ready,   setReady]   = useState(false)
  const [seconds, setSeconds] = useState(5)
  const params    = useSearchParams()
  const email     = params.get('email') || ''

  useEffect(() => {
    if (!email) return

    // Store email and force tier refresh
    setUserEmail(email)
    clearProCache()

    // Confirm Pro status from DB
    fetch(`/api/pro/status?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => {
        if (d.is_pro) {
          localStorage.setItem('manop_tier', 'pro')
          localStorage.setItem('manop_tier_at', String(Date.now()))
        }
        setReady(true)
      })
      .catch(() => setReady(true))
  }, [email])

  // Countdown redirect
  useEffect(() => {
    if (!ready) return
    if (seconds <= 0) { window.location.href = '/search'; return }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [ready, seconds])

  const bg    = dark ? '#0F172A' : '#F8FAFC'
  const text  = dark ? '#F8FAFC' : '#0F172A'
  const text2 = dark ? 'rgba(248,250,252,0.65)' : 'rgba(15,23,42,0.65)'
  const text3 = dark ? 'rgba(248,250,252,0.32)' : 'rgba(15,23,42,0.32)'
  const border = dark ? 'rgba(248,250,252,0.07)' : 'rgba(15,23,42,0.07)'

  return (
    <div style={{ background: bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Success mark */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem', fontSize: '2rem' }}>
          ✓
        </div>

        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.5rem' }}>
          Welcome to Pro
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: text, marginBottom: '0.75rem' }}>
          You're all set.
        </h1>

        <p style={{ fontSize: '0.9rem', color: text2, lineHeight: 1.7, marginBottom: '2rem' }}>
          {email && <><strong style={{ color: text }}>{email}</strong><br /></>}
          Your Pro access is now active. STR yields, cash-on-cash returns, full 10-year return models, and all Pro intelligence are unlocked.
        </p>

        {/* What's unlocked */}
        <div style={{ background: dark ? '#162032' : '#FFFFFF', border: `1px solid ${border}`, borderRadius: 14, padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#7C5FFF', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.875rem' }}>Now unlocked</div>
          {[
            'STR / Airbnb yield on every property',
            'Cash-on-cash return (leveraged)',
            'Full 10-year USD return model',
            'Neighborhood comparison — all rows',
            'PropLens deep analysis',
          ].map(f => (
            <div key={f} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.45rem', fontSize: '0.82rem', color: text2 }}>
              <span style={{ color: '#7C5FFF', flexShrink: 0 }}>✓</span>{f}
            </div>
          ))}
        </div>

        <Link href="/search" style={{ display: 'block', background: '#5B2EFF', color: '#fff', borderRadius: 10, padding: '0.875rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.875rem' }}>
          Start exploring Pro →
        </Link>

        {ready && (
          <div style={{ fontSize: '0.72rem', color: text3 }}>
            Redirecting in {seconds}s…
          </div>
        )}

        <div style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: text3 }}>
          Need help? <a href="mailto:partners@manopintel.com" style={{ color: '#14B8A6' }}>partners@manopintel.com</a>
        </div>
      </div>
    </div>
  )
}

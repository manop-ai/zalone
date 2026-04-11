'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getInitialDark, listenTheme } from '../lib/theme'

// ─── Global Markets — honest about where we have data ─────────────────────
const LIVE_MARKETS = [
  { name: 'Lekki Phase 1', city: 'Lagos', country: 'Nigeria', flag: '🇳🇬', slug: 'lekki-phase-1', live: true },
  { name: 'Ikoyi',         city: 'Lagos', country: 'Nigeria', flag: '🇳🇬', slug: 'ikoyi',         live: true },
  { name: 'Victoria Island',city: 'Lagos', country: 'Nigeria', flag: '🇳🇬', slug: 'victoria-island',live: true },
  { name: 'Lekki',         city: 'Lagos', country: 'Nigeria', flag: '🇳🇬', slug: 'lekki',         live: true },
  { name: 'Ikota',         city: 'Lagos', country: 'Nigeria', flag: '🇳🇬', slug: 'ikota',         live: true },
  { name: 'Chevron',       city: 'Lagos', country: 'Nigeria', flag: '🇳🇬', slug: 'chevron',       live: true },
  { name: 'Ajah',          city: 'Lagos', country: 'Nigeria', flag: '🇳🇬', slug: 'ajah',          live: true },
  { name: 'Abuja',         city: 'Abuja', country: 'Nigeria', flag: '🇳🇬', slug: 'abuja',         live: false },
  { name: 'East Legon',    city: 'Accra', country: 'Ghana',   flag: '🇬🇭', slug: 'east-legon',    live: false },
  { name: 'Westlands',     city: 'Nairobi',country: 'Kenya',  flag: '🇰🇪', slug: 'westlands',     live: false },
  { name: 'Karen',         city: 'Nairobi',country: 'Kenya',  flag: '🇰🇪', slug: 'karen',         live: false },
  { name: 'Cantonments',   city: 'Accra', country: 'Ghana',   flag: '🇬🇭', slug: 'cantonments',   live: false },
]

const QUICK_SEARCH = [
  'Lekki Phase 1, Lagos',
  'Ikoyi, Lagos',
  'East Legon, Accra',
  'Westlands, Nairobi',
  'Victoria Island, Lagos',
]

const INTELLIGENCE_METRICS = [
  { icon: '◈', label: 'Traditional Yield',   desc: 'Gross & net rental return on asking price' },
  { icon: '◉', label: 'Short-let Yield',      desc: 'Airbnb/short-let return with local occupancy' },
  { icon: '⬡', label: 'Cap Rate & NOI',       desc: 'Net operating income after all expenses' },
  { icon: '◇', label: 'Cash-on-Cash',         desc: 'Return on equity after local mortgage costs' },
  { icon: '△', label: 'Price vs Market',      desc: 'How this property sits against area median' },
  { icon: '○', label: 'Strategy Signal',      desc: 'Data-driven: buy-to-let, short-let, or hold' },
]

// Global slug resolver — maps any search to a neighborhood slug
function resolveSlug(query: string): { slug: string; found: boolean } {
  const q = query.toLowerCase().trim()
  const map: Record<string, string> = {
    'lekki phase 1': 'lekki-phase-1', 'lekki phase one': 'lekki-phase-1',
    'lekki ph 1': 'lekki-phase-1', 'lekki ph1': 'lekki-phase-1',
    'ikoyi': 'ikoyi', 'victoria island': 'victoria-island', 'v.i': 'victoria-island', 'vi': 'victoria-island',
    'lekki': 'lekki', 'ikota': 'ikota', 'chevron': 'chevron', 'ajah': 'ajah',
    'gbagada': 'gbagada', 'yaba': 'yaba', 'ikeja': 'ikeja', 'surulere': 'surulere', 'magodo': 'magodo',
    'abuja': 'abuja', 'maitama': 'maitama', 'asokoro': 'asokoro', 'wuse': 'wuse', 'wuse 2': 'wuse-2',
    'east legon': 'east-legon', 'cantonments': 'cantonments', 'labone': 'labone',
    'airport residential': 'airport-residential', 'accra': 'accra', 'spintex': 'spintex',
    'westlands': 'westlands', 'karen': 'karen', 'kilimani': 'kilimani', 'lavington': 'lavington', 'nairobi': 'nairobi',
  }
  for (const [key, slug] of Object.entries(map)) {
    if (q.includes(key)) return { slug, found: true }
  }
  const fallback = q.replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return { slug: fallback, found: false }
}

export default function Home() {
  const [dark,    setDark]    = useState(true)
  const [query,   setQuery]   = useState('')
  const [focused, setFocused] = useState(false)
  const [suggest, setSuggest] = useState<string[]>([])
  const [ph,      setPh]      = useState('Search any city or neighborhood...')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync dark mode from NavBar
  useEffect(() => {
    setDark(getInitialDark())
    return listenTheme(d => setDark(d))
  }, [])

  // Animated placeholder
  useEffect(() => {
    const examples = ['Lekki Phase 1, Lagos', 'East Legon, Accra', 'Westlands, Nairobi', 'Ikoyi, Lagos', 'Karen, Nairobi', 'Victoria Island, Lagos']
    let i = 0, ci = 0, dir = 1, paused = false
    const tick = () => {
      const word = 'Search ' + examples[i] + '...'
      if (paused) { paused = false; return }
      if (dir === 1) {
        setPh(word.slice(0, ci + 1))
        ci++
        if (ci >= word.length) { dir = -1; paused = true }
      } else {
        setPh(word.slice(0, ci - 1))
        ci--
        if (ci <= 7) { dir = 1; i = (i + 1) % examples.length }
      }
    }
    const id = setInterval(tick, 70)
    return () => clearInterval(id)
  }, [])

  const handleInput = (val: string) => {
    setQuery(val)
    if (val.length > 1) {
      const v = val.toLowerCase()
      setSuggest(LIVE_MARKETS.filter(m =>
        m.name.toLowerCase().includes(v) ||
        m.city.toLowerCase().includes(v) ||
        m.country.toLowerCase().includes(v)
      ).slice(0, 6).map(m => `${m.name}, ${m.city}, ${m.country}`))
    } else {
      setSuggest([])
    }
  }

  const go = (val?: string) => {
    const q = val || query
    if (!q.trim()) return
    const { slug } = resolveSlug(q)
    router.push(`/neighborhood/${slug}?q=${encodeURIComponent(q)}`)
  }

  // CSS vars based on dark state
  const v = (dk: string, lt: string) => dark ? dk : lt
  const bg      = v('#0F172A', '#F8FAFC')
  const bg2     = v('#1E293B', '#F1F5F9')
  const bg3     = v('#162032', '#FFFFFF')
  const text     = v('#F8FAFC', '#0F172A')
  const text2    = v('rgba(248,250,252,0.65)', 'rgba(15,23,42,0.65)')
  const text3    = v('rgba(248,250,252,0.35)', 'rgba(15,23,42,0.35)')
  const border   = v('rgba(248,250,252,0.07)', 'rgba(15,23,42,0.08)')
  const borderP  = 'rgba(91,46,255,0.2)'

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text, transition: 'background 0.3s, color 0.3s' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(5rem,11vw,9rem) 2rem clamp(4rem,8vw,7rem)' }}>
        {/* Glows */}
        <div style={{ position: 'absolute', top: -200, left: '25%', width: 700, height: 700, borderRadius: '50%', background: dark ? 'radial-gradient(circle, rgba(91,46,255,0.16) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(91,46,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -200, right: '5%', width: 500, height: 500, borderRadius: '50%', background: dark ? 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(20,184,166,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Global pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: dark ? 'rgba(20,184,166,0.1)' : 'rgba(20,184,166,0.07)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 100, padding: '0.3rem 0.875rem', fontSize: '0.72rem', fontWeight: 600, color: '#14B8A6', letterSpacing: '0.04em', marginBottom: '2rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#14B8A6', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Nigeria · Ghana · Kenya · South Africa · and beyond
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4.8rem)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.05em', color: text, marginBottom: '1.25rem' }}>
            Invest in African real estate{' '}
            <span style={{ background: 'linear-gradient(135deg,#5B2EFF 0%,#14B8A6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              with real data.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem,2vw,1.15rem)', color: text2, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 2.5rem', fontWeight: 300 }}>
            Search any city or neighborhood across Africa to see verified yield analysis,
            cap rates, and market benchmarks — before you invest.
          </p>

          {/* ── SEARCH BAR ── */}
          <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              background: bg3,
              border: `1.5px solid ${focused ? '#5B2EFF' : border}`,
              borderRadius: 14,
              boxShadow: focused ? '0 0 0 4px rgba(91,46,255,0.12), 0 8px 32px rgba(0,0,0,0.12)' : dark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.07)',
              transition: 'all 0.2s',
              overflow: 'visible',
            }}>
              <div style={{ padding: '0 0.875rem 0 1.25rem', display: 'flex', alignItems: 'center', color: focused ? '#5B2EFF' : text3, fontSize: '1.1rem', flexShrink: 0, transition: 'color 0.2s' }}>
                ⌕
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => handleInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => { setFocused(false); setSuggest([]) }, 150)}
                onKeyDown={e => e.key === 'Enter' && go()}
                placeholder={ph}
                style={{ flex: 1, padding: '1rem 0.5rem', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem', color: text, minWidth: 0 }}
              />
              <button onClick={() => go()} style={{ background: '#5B2EFF', color: '#fff', border: 'none', padding: '0 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', borderRadius: '0 12px 12px 0', whiteSpace: 'nowrap', flexShrink: 0, transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#7C5FFF')}
                onMouseLeave={e => (e.currentTarget.style.background = '#5B2EFF')}
              >
                Analyze →
              </button>
            </div>

            {/* Suggestions */}
            {suggest.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50, background: bg3, border: `1px solid ${border}`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                {suggest.map(s => (
                  <button key={s} onMouseDown={() => { setQuery(s); setSuggest([]); go(s) }} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%', padding: '0.75rem 1.25rem', background: 'transparent', border: 'none', borderBottom: `1px solid ${border}`, textAlign: 'left', cursor: 'pointer', color: text, fontSize: '0.875rem', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = dark ? 'rgba(91,46,255,0.08)' : '#F1F5F9')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: '#14B8A6', fontSize: '0.8rem' }}>📍</span>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick search chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: text3, alignSelf: 'center', marginRight: '0.1rem' }}>Try:</span>
            {QUICK_SEARCH.map(q => (
              <button key={q} onClick={() => { setQuery(q); go(q) }} style={{ padding: '0.28rem 0.75rem', background: dark ? 'rgba(91,46,255,0.1)' : 'rgba(91,46,255,0.06)', border: '1px solid rgba(91,46,255,0.2)', borderRadius: 100, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, color: '#7C5FFF', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,46,255,0.2)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = dark ? 'rgba(91,46,255,0.1)' : 'rgba(91,46,255,0.06)'; e.currentTarget.style.color = '#7C5FFF' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, background: dark ? 'rgba(30,41,59,0.5)' : bg2 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {[
            { val: '4',       label: 'Countries' },
            { val: '7+',      label: 'Live Markets' },
            { val: '6',       label: 'Intel Metrics' },
            { val: 'Global',  label: 'Investor Access' },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', borderRight: i < 3 ? `1px solid ${border}` : 'none', padding: '0 1rem' }}>
              <div style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 800, color: text, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.35rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LIVE MARKETS ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
              <span style={{ width: 16, height: 2, background: '#14B8A6', display: 'inline-block' }} />
              Markets
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: text, letterSpacing: '-0.04em' }}>
              Africa. Market by market.
            </h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: text2, maxWidth: 320, lineHeight: 1.6, fontWeight: 300 }}>
            We build neighborhood by neighborhood — verified data first, then intelligence. Live now in Lagos. Expanding to Accra, Nairobi, and beyond.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {LIVE_MARKETS.map(m => (
            <div
              key={m.slug}
              onClick={() => m.live && router.push(`/neighborhood/${m.slug}`)}
              style={{
                background: bg3,
                border: `1px solid ${m.live ? borderP : border}`,
                borderRadius: 14, padding: '1.25rem',
                cursor: m.live ? 'pointer' : 'default',
                opacity: m.live ? 1 : 0.55,
                transition: 'all 0.2s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (m.live) { e.currentTarget.style.borderColor = 'rgba(91,46,255,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = m.live ? borderP : border; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem' }}>{m.flag}</span>
                {m.live ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)', color: '#14B8A6', borderRadius: 100, padding: '0.15rem 0.55rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#14B8A6', display: 'inline-block' }} />
                    LIVE
                  </span>
                ) : (
                  <span style={{ fontSize: '0.65rem', color: text3, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Coming soon</span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: text, marginBottom: '0.2rem' }}>{m.name}</div>
              <div style={{ fontSize: '0.78rem', color: text2 }}>{m.city}, {m.country}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT ZALONE COMPUTES ── */}
      <section style={{ background: dark ? bg2 : bg2, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.875rem' }}>
                <span style={{ width: 16, height: 2, background: '#14B8A6', display: 'inline-block' }} />
                What Zalone Computes
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 800, color: text, letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: '1rem' }}>
                Not listings.<br />Intelligence.
              </h2>
              <p style={{ color: text2, lineHeight: 1.7, marginBottom: '2rem', fontWeight: 300, fontSize: '1rem' }}>
                Every search returns real financial metrics computed from verified market benchmarks.
                Not estimates. Not guesses. Math on real inputs — so you can invest with confidence.
              </p>
              <button onClick={() => inputRef.current?.focus()} style={{ background: '#5B2EFF', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem 1.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#7C5FFF'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#5B2EFF'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Start Analyzing →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {INTELLIGENCE_METRICS.map(m => (
                <div key={m.label} style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 12, padding: '1.1rem', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(91,46,255,0.35)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = border)}
                >
                  <div style={{ fontSize: '1.2rem', color: '#14B8A6', marginBottom: '0.5rem' }}>{m.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: text, marginBottom: '0.3rem' }}>{m.label}</div>
                  <div style={{ fontSize: '0.75rem', color: text2, lineHeight: 1.5, fontWeight: 300 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AGENCY CTA ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ background: dark ? 'linear-gradient(135deg, rgba(91,46,255,0.13) 0%, rgba(20,184,166,0.07) 100%)' : 'linear-gradient(135deg, rgba(91,46,255,0.05) 0%, rgba(20,184,166,0.03) 100%)', border: '1px solid rgba(91,46,255,0.22)', borderRadius: 24, padding: 'clamp(2rem,4vw,3.5rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,46,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.875rem' }}>
              <span style={{ width: 14, height: 2, background: '#14B8A6', display: 'inline-block' }} />
              Founding Agency Partners
            </div>
            <h3 style={{ fontSize: 'clamp(1.4rem,2.5vw,1.9rem)', fontWeight: 800, color: text, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '0.875rem' }}>
              Your listings get intelligence.<br />Free. Forever.
            </h3>
            <p style={{ fontSize: '0.9rem', color: text2, lineHeight: 1.7, fontWeight: 300 }}>
              Founding agency partners receive free yield analysis and cap rate reports
              on every listing they share — across Nigeria, Ghana, Kenya, or wherever you operate.
              Your data. Our intelligence. Source credit on every property we publish.
            </p>
          </div>
          <a href="mailto:partners@manop.africa" style={{ background: '#5B2EFF', color: '#fff', padding: '0.875rem 1.75rem', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', position: 'relative', zIndex: 1, display: 'inline-block', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#7C5FFF')}
            onMouseLeave={e => (e.currentTarget.style.background = '#5B2EFF')}
          >
            Become a Founding Partner →
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: dark ? bg2 : bg2, borderTop: `1px solid ${border}`, padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#5B2EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Z</div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: text }}>Zalone</div>
              <div style={{ fontSize: '0.65rem', color: text3 }}>Nigeria · Ghana · Kenya · South Africa</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: text2, flexWrap: 'wrap' }}>
            <a href="/search" style={{ color: text2, textDecoration: 'none' }}>Properties</a>
            <a href="/neighborhood/lekki-phase-1" style={{ color: text2, textDecoration: 'none' }}>Markets</a>
            <a href="mailto:partners@manop.africa" style={{ color: text2, textDecoration: 'none' }}>Agency Partners</a>
          </div>
          <div style={{ fontSize: '0.68rem', color: text3, letterSpacing: '0.04em' }}>
            Making Africa Real Estate Investable
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(20,184,166,0.4)} 50%{opacity:0.6;box-shadow:0 0 0 4px rgba(20,184,166,0)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        a { color:inherit; }
        input::placeholder { color: rgba(148,163,184,0.5); }
        @media(max-width:768px){
          section[style*="grid-template-columns: 1fr 1fr"]{display:block!important;}
          section[style*="grid-template-columns: 1fr 1fr"] > div:last-child{margin-top:2rem;}
        }
      `}</style>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const PropertySection = dynamic(() => import('./PropertySection'), { ssr: false })
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ─── Lagos Neighborhood Intelligence Data ──────────────────────────────────
// Seeded from manual market research — Manop grows this over time

const NEIGHBORHOOD_DATA: Record<string, {
  display:          string
  city:             string
  tier:             string
  demand:           string
  description:      string
  median_sale_3bed: number
  median_rent_3bed: number
  nightly_3bed:     number
  occupancy_pct:    number
  price_per_sqm:    number
  dom_avg:          number
  yoy_change_pct:   number
  supply_score:     number  // 1-10 (10 = many listings)
  demand_score:     number  // 1-10
  title_types:      string[]
  key_facts:        string[]
  best_for:         string[]
  risks:            string[]
}> = {
  'lekki-phase-1': {
    display:          'Lekki Phase 1',
    city:             'Lagos',
    tier:             'Premium',
    demand:           'High',
    description:      'Lagos\'s most sought-after residential corridor. Dense with embassies, corporate tenants, and diaspora buyers. Short-let demand is consistently strong year-round.',
    median_sale_3bed: 120_000_000,
    median_rent_3bed: 6_000_000,
    nightly_3bed:     95_000,
    occupancy_pct:    60,
    price_per_sqm:    200_000,
    dom_avg:          75,
    yoy_change_pct:   8.2,
    supply_score:     7,
    demand_score:     9,
    title_types:      ['C of O', 'Governor\'s Consent', 'Deed of Assignment'],
    key_facts:        [
      'Highest short-let demand in Lagos outside Ikoyi/VI',
      'Corporate relocation hub — embassy staff, oil sector',
      'Strong capital appreciation over 5 years',
      'Serviced apartment market very active',
    ],
    best_for:         ['Short-let / Airbnb', 'Corporate rental', 'Capital appreciation'],
    risks:            ['Traffic congestion affects desirability', 'Oversupply risk in some streets', 'Variable title quality — verify thoroughly'],
  },
  'ikoyi': {
    display:          'Ikoyi',
    city:             'Lagos',
    tier:             'Prime',
    demand:           'Very High',
    description:      'Lagos\'s most prestigious address. Ultra-high-net-worth enclave with limited supply and consistent demand from multinationals, senior executives, and foreign residents.',
    median_sale_3bed: 280_000_000,
    median_rent_3bed: 14_000_000,
    nightly_3bed:     180_000,
    occupancy_pct:    65,
    price_per_sqm:    350_000,
    dom_avg:          60,
    yoy_change_pct:   11.4,
    supply_score:     4,
    demand_score:     10,
    title_types:      ['C of O', 'Governor\'s Consent'],
    key_facts:        [
      'Highest price per sqm in Nigeria',
      'Sub-markets: Old Ikoyi, Banana Island, Parkview Estate',
      'Institutional and family office buyer base',
      'Luxury short-let rates highest in West Africa',
    ],
    best_for:         ['Luxury short-let', 'Buy & hold', 'Institutional investment'],
    risks:            ['Requires significant capital', 'Title fraud risk is real — use verified lawyers', 'Limited entry points'],
  },
  'victoria-island': {
    display:          'Victoria Island',
    city:             'Lagos',
    tier:             'Prime',
    demand:           'Very High',
    description:      'Lagos\'s commercial and diplomatic hub. Mixed-use — offices, hotels, embassies, high-end residential. Business travel drives strong short-let demand.',
    median_sale_3bed: 220_000_000,
    median_rent_3bed: 12_000_000,
    nightly_3bed:     150_000,
    occupancy_pct:    62,
    price_per_sqm:    280_000,
    dom_avg:          55,
    yoy_change_pct:   9.8,
    supply_score:     5,
    demand_score:     10,
    title_types:      ['C of O', 'Governor\'s Consent', 'Leasehold'],
    key_facts:        [
      'Business district — highest corporate rental demand',
      'Embassy row drives consistent expat rental demand',
      'Proximity to Eko Atlantic — appreciation catalyst',
      'Hotel-grade short-let occupancy year-round',
    ],
    best_for:         ['Corporate rental', 'Short-let', 'Mixed-use investment'],
    risks:            ['Traffic among worst in Lagos', 'Some leasehold complications', 'Noise and commercial activity'],
  },
  'lekki': {
    display:          'Lekki',
    city:             'Lagos',
    tier:             'Premium',
    demand:           'High',
    description:      'Broad Lekki corridor encompassing Phase 2, Ikota, Chevron, and surrounding areas. Growing middle-to-upper class residential market with improving infrastructure.',
    median_sale_3bed: 95_000_000,
    median_rent_3bed: 4_800_000,
    nightly_3bed:     85_000,
    occupancy_pct:    58,
    price_per_sqm:    160_000,
    dom_avg:          80,
    yoy_change_pct:   7.1,
    supply_score:     8,
    demand_score:     8,
    title_types:      ['C of O', 'Governor\'s Consent', 'Deed of Assignment', 'Gazette'],
    key_facts:        [
      'Broadest buyer pool in Lagos — accessible to professionals',
      'New developments continuously entering market',
      'Lekki-Epe Expressway infrastructure driving values',
      'Strong off-plan investment activity',
    ],
    best_for:         ['Buy-to-let', 'First investment property', 'Off-plan play'],
    risks:            ['Flooding risk in some areas — verify drainage', 'Traffic on Lekki-Epe expressway', 'Over-supply risk in some sub-areas'],
  },
  'ikota': {
    display:          'Ikota',
    city:             'Lagos',
    tier:             'Premium',
    demand:           'High',
    description:      'Dense, established community within the Lekki corridor. Known for Ikota Shopping Complex area. Good balance of value and accessibility.',
    median_sale_3bed: 90_000_000,
    median_rent_3bed: 4_500_000,
    nightly_3bed:     80_000,
    occupancy_pct:    55,
    price_per_sqm:    150_000,
    dom_avg:          85,
    yoy_change_pct:   6.4,
    supply_score:     7,
    demand_score:     7,
    title_types:      ['Governor\'s Consent', 'Deed of Assignment', 'C of O'],
    key_facts:        [
      'Established community — lower vacancy than newer areas',
      'Good schools and amenities nearby',
      'Mix of property sizes and price points',
      'Accessible to VI and Lekki Phase 1 via expressway',
    ],
    best_for:         ['Buy-to-let', 'Family rental market', 'Mid-range investment'],
    risks:            ['Some older stock needs refurbishment', 'Traffic at peak hours', 'Mixed title quality'],
  },
  'chevron': {
    display:          'Chevron',
    city:             'Lagos',
    tier:             'Premium',
    demand:           'High',
    description:      'Oil and gas sector hub area. Strong corporate and expat rental demand driven by proximity to Chevron Nigeria HQ and other energy companies.',
    median_sale_3bed: 85_000_000,
    median_rent_3bed: 4_200_000,
    nightly_3bed:     75_000,
    occupancy_pct:    55,
    price_per_sqm:    140_000,
    dom_avg:          85,
    yoy_change_pct:   5.8,
    supply_score:     6,
    demand_score:     8,
    title_types:      ['C of O', 'Governor\'s Consent'],
    key_facts:        [
      'Oil sector employment base provides stable rental demand',
      'Serviced apartment demand from expat workforce',
      'Good estate development quality',
      'Close to Lekki Free Trade Zone — future catalyst',
    ],
    best_for:         ['Corporate rental', 'Expat accommodation', 'Serviced apartments'],
    risks:            ['Oil sector volatility affects demand', 'Limited short-let appeal vs Lekki/Ikoyi', 'Some flooding history'],
  },
  'ajah': {
    display:          'Ajah',
    city:             'Lagos',
    tier:             'Mid',
    demand:           'Medium',
    description:      'Rapidly developing corridor east of Lekki. Increasingly popular with mid-income professionals seeking more space at lower price points than central Lekki.',
    median_sale_3bed: 65_000_000,
    median_rent_3bed: 3_200_000,
    nightly_3bed:     60_000,
    occupancy_pct:    50,
    price_per_sqm:    110_000,
    dom_avg:          100,
    yoy_change_pct:   9.3,
    supply_score:     8,
    demand_score:     7,
    title_types:      ['Deed of Assignment', 'Governor\'s Consent', 'Gazette', 'C of O'],
    key_facts:        [
      'Fastest price appreciation corridor in Lagos 2023-2025',
      'Attracts buyers priced out of Lekki',
      'Large land parcels still available for development',
      'Sangotedo and Abraham Adesanya estate sub-markets growing fast',
    ],
    best_for:         ['Capital appreciation play', 'Development land', 'Affordable buy-to-let'],
    risks:            ['Infrastructure still developing', 'Title fraud risk higher than established areas', 'Traffic and road quality'],
  },
  'gbagada': {
    display:          'Gbagada',
    city:             'Lagos',
    tier:             'Mid',
    demand:           'Medium',
    description:      'Well-established mainland Lagos community. Popular with middle-class professionals. Stable rental market with lower volatility than Island properties.',
    median_sale_3bed: 70_000_000,
    median_rent_3bed: 3_500_000,
    nightly_3bed:     65_000,
    occupancy_pct:    50,
    price_per_sqm:    120_000,
    dom_avg:          95,
    yoy_change_pct:   4.2,
    supply_score:     6,
    demand_score:     7,
    title_types:      ['C of O', 'Governor\'s Consent', 'Deed of Assignment'],
    key_facts:        [
      'Stable middle-class rental base',
      'Good infrastructure vs mainland alternatives',
      'Access to Third Mainland Bridge and Lagos Island',
      'Phase 1 and Phase 2 have distinct price points',
    ],
    best_for:         ['Stable buy-to-let', 'Middle-income rental', 'Lower-risk entry'],
    risks:            ['Lower capital appreciation than Island', 'Flooding in some areas', 'Island vs mainland preference among HNW buyers'],
  },
  'yaba': {
    display:          'Yaba',
    city:             'Lagos',
    tier:             'Mid',
    demand:           'Medium',
    description:      'Lagos\'s tech and academic hub. Growing startup ecosystem, university presence, and young professional demographic creating new short-let demand.',
    median_sale_3bed: 60_000_000,
    median_rent_3bed: 3_000_000,
    nightly_3bed:     55_000,
    occupancy_pct:    50,
    price_per_sqm:    100_000,
    dom_avg:          100,
    yoy_change_pct:   6.8,
    supply_score:     6,
    demand_score:     6,
    title_types:      ['C of O', 'Deed of Assignment'],
    key_facts:        [
      'Tech hub — co-living and serviced apartment demand growing',
      'University of Lagos proximity drives student rental market',
      'Startup and SME office conversions increasing',
      'Gentrification underway — early appreciation signals',
    ],
    best_for:         ['Co-living / serviced apartments', 'Student accommodation', 'Long-term appreciation'],
    risks:            ['Older building stock in many areas', 'Mixed neighborhood quality', 'Infrastructure gaps'],
  },
  'ikeja': {
    display:          'Ikeja',
    city:             'Lagos',
    tier:             'Mid',
    demand:           'Medium',
    description:      'Lagos State capital and commercial centre. Government, aviation, and business hub. Stable rental market with consistent corporate demand.',
    median_sale_3bed: 75_000_000,
    median_rent_3bed: 3_800_000,
    nightly_3bed:     70_000,
    occupancy_pct:    52,
    price_per_sqm:    130_000,
    dom_avg:          90,
    yoy_change_pct:   5.1,
    supply_score:     7,
    demand_score:     7,
    title_types:      ['C of O', 'Governor\'s Consent', 'Deed of Assignment'],
    key_facts:        [
      'Airport proximity drives short-let and corporate demand',
      'GRA sub-market significantly higher quality',
      'Government and civil service stable rental base',
      'Alausa government area proximity',
    ],
    best_for:         ['Corporate rental', 'Airport proximity short-let', 'Government tenant base'],
    risks:            ['Wide quality variation across sub-areas', 'GRA vs non-GRA price gap significant', 'Some infrastructure aging'],
  },
}

// ─── Computation Engine (inline — works without API) ──────────────────────

const MORTGAGE_RATE = 0.22
const MORTGAGE_YEARS = 15
const DOWN_PCT = 0.30
const OPEX = 0.25
const PLATFORM_FEE = 0.20
const SHORTLET_OPEX = 0.35
const MEDIAN_INCOME = 180_000

function computeMetrics(nd: typeof NEIGHBORHOOD_DATA[string], bedrooms: number, price: number) {
  // Scale benchmarks to bedrooms
  const bedroomScale = bedrooms <= 1 ? 0.45 : bedrooms === 2 ? 0.72 : bedrooms === 3 ? 1.0 : bedrooms === 4 ? 1.35 : 1.65
  const annualRent   = nd.median_rent_3bed * bedroomScale
  const nightly      = nd.nightly_3bed * bedroomScale
  const occupancy    = nd.occupancy_pct / 100

  // Traditional yield
  const tradGross = (annualRent / price) * 100
  const tradNet   = ((annualRent * (1 - OPEX)) / price) * 100
  const noi       = annualRent * (1 - OPEX)

  // Short-let yield
  const slGrossAnnual = nightly * occupancy * 365
  const slNet         = slGrossAnnual * (1 - PLATFORM_FEE) * (1 - SHORTLET_OPEX)
  const slGrossPct    = (slGrossAnnual / price) * 100
  const slNetPct      = (slNet / price) * 100

  // Cap rate
  const capRate = (noi / price) * 100

  // Cash on cash
  const r       = MORTGAGE_RATE / 12
  const n       = MORTGAGE_YEARS * 12
  const loan    = price * (1 - DOWN_PCT)
  const down    = price * DOWN_PCT
  const monthly = loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const annualCF = annualRent - (annualRent * OPEX) - (monthly * 12)
  const coc     = (annualCF / down) * 100

  // Affordability
  const incomeMultiple = (monthly / 0.30) / MEDIAN_INCOME
  const accessible = incomeMultiple >= 20 ? 'Top 1%' : incomeMultiple >= 10 ? 'Top 5%' : incomeMultiple >= 5 ? 'Top 10%' : 'Top 20%'

  // Strategy
  let strategy = 'buy_to_let', strategyLabel = 'Buy to Let', reason = `Traditional yield of ${tradNet.toFixed(1)}% net is reasonable for Lagos`
  if (slNetPct > tradNet + 2) {
    strategy = 'short_let'; strategyLabel = 'Short-let / Airbnb'
    reason = `Short-let yields ${slNetPct.toFixed(1)}% net vs ${tradNet.toFixed(1)}% traditional — ${(slNetPct - tradNet).toFixed(1)}pp premium`
  } else if (nd.yoy_change_pct > 8 && tradNet < 5) {
    strategy = 'buy_hold'; strategyLabel = 'Buy & Hold'
    reason = `${nd.yoy_change_pct}% annual appreciation makes capital gain the primary return`
  } else if (tradNet < 3) {
    strategy = 'review'; strategyLabel = 'Negotiate Hard'
    reason = `Yields are thin at median price — push for 15-20% below asking`
  }

  return { tradGross, tradNet, noi, slGrossPct, slNetPct, slGrossAnnual, slNet, capRate, coc, annualCF, monthly, down, accessible, incomeMultiple, strategy, strategyLabel, reason, annualRent, nightly }
}

// ─── Formatter ────────────────────────────────────────────────────────────

function fmtN(n: number) {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toFixed(0)}`
}

// ─── Component ────────────────────────────────────────────────────────────

export default function NeighborhoodPage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const slug         = (params?.slug as string) || ''
  const q            = searchParams?.get('q') || ''

  const [dark,      setDark]      = useState(true)
  const [bedrooms,  setBedrooms]  = useState(3)

  // Sync dark mode from NavBar
  useEffect(() => {
    // Import inline to avoid SSR issues
    const { getInitialDark, listenTheme } = require('../../../lib/theme')
    setDark(getInitialDark())
    return listenTheme((d: boolean) => setDark(d))
  }, [])
  const [price,     setPrice]     = useState(0)
  const [priceInput,setPriceInput]= useState('')

  const nd = NEIGHBORHOOD_DATA[slug]

  useEffect(() => {
    if (nd) setPrice(nd.median_sale_3bed)
  }, [slug, nd])

  const metrics = nd && price > 0 ? computeMetrics(nd, bedrooms, price) : null

  const css = {
    '--bg':      dark ? '#0F172A' : '#F8FAFC',
    '--bg2':     dark ? '#1E293B' : '#F1F5F9',
    '--bg3':     dark ? '#273549' : '#E2E8F0',
    '--text':    dark ? '#F8FAFC' : '#0F172A',
    '--text2':   dark ? 'rgba(248,250,252,0.65)' : 'rgba(15,23,42,0.65)',
    '--text3':   dark ? 'rgba(248,250,252,0.35)' : 'rgba(15,23,42,0.35)',
    '--purple':  '#5B2EFF',
    '--purpleL': '#7C5FFF',
    '--teal':    dark ? '#14B8A6' : '#0D9488',
    '--tealL':   '#2DD4BF',
    '--border':  'rgba(91,46,255,0.18)',
    '--borderL': dark ? 'rgba(248,250,252,0.07)' : 'rgba(15,23,42,0.08)',
    '--card':    dark ? '#162032' : '#FFFFFF',
    '--green':   '#22C55E',
    '--red':     '#EF4444',
    '--amber':   '#F59E0B',
  } as React.CSSProperties

  const card = {
    background: 'var(--card)',
    border: '1px solid var(--borderL)',
    borderRadius: 16,
    padding: '1.5rem',
    marginBottom: '1rem',
  }

  const label = {
    fontSize: '0.68rem', fontWeight: 700,
    color: 'var(--teal)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    marginBottom: '0.35rem',
    display: 'block',
  }

  const bigNum = (val: string, color?: string) => ({
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 800, letterSpacing: '-0.04em',
    color: color || 'var(--text)',
    lineHeight: 1,
  })

  const subText = {
    fontSize: '0.72rem',
    color: 'var(--text3)',
    fontFamily: 'var(--font-mono)' as const,
    marginTop: '0.25rem',
  }

  // Not found state
  if (!nd) return (
    <div style={{ ...css, background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⌕</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
        "{q || slug}" not yet covered
      </h1>
      <p style={{ color: 'var(--text2)', marginBottom: '1.5rem', maxWidth: 380, lineHeight: 1.6 }}>
        We're mapping Lagos neighborhood by neighborhood. This area is on our list.
      </p>
      <Link href="/" style={{ background: 'var(--purple)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
        Search another area →
      </Link>
    </div>
  )

  const demandColor = nd.demand === 'Very High' ? 'var(--green)' : nd.demand === 'High' ? 'var(--teal)' : 'var(--amber)'

  return (
    <div style={{ ...css, background: 'var(--bg)', minHeight: '100vh', transition: 'all 0.3s' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: dark ? 'rgba(15,23,42,0.92)' : 'rgba(248,250,252,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--borderL)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Z</div>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Zalone</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--text2)', textDecoration: 'none' }}>← New Search</Link>
          <button onClick={() => setDark(!dark)} style={{ width: 40, height: 24, borderRadius: 100, background: dark ? 'var(--purple)' : '#CBD5E1', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s' }}>
            <div style={{ position: 'absolute', top: 3, left: dark ? 19 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>
              {dark ? '☀' : '☾'}
            </div>
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: dark ? 'var(--bg2)' : 'var(--bg2)',
        borderBottom: '1px solid var(--borderL)',
        padding: '2.5rem 2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,46,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            Lagos · {nd.tier} Area
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '0.5rem' }}>
                {nd.display}
              </h1>
              <p style={{ fontSize: '0.925rem', color: 'var(--text2)', maxWidth: 560, lineHeight: 1.65, fontWeight: 300 }}>
                {nd.description}
              </p>
            </div>

            {/* Key badges */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ background: dark ? 'rgba(20,184,166,0.1)' : 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 10, padding: '0.875rem 1.25rem', textAlign: 'center', minWidth: 110 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Demand</div>
                <div style={{ fontWeight: 800, color: demandColor, fontSize: '1rem' }}>{nd.demand}</div>
              </div>
              <div style={{ background: dark ? 'rgba(91,46,255,0.1)' : 'rgba(91,46,255,0.06)', border: '1px solid rgba(91,46,255,0.2)', borderRadius: 10, padding: '0.875rem 1.25rem', textAlign: 'center', minWidth: 110 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--purpleL)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>YoY Price</div>
                <div style={{ fontWeight: 800, color: 'var(--purpleL)', fontSize: '1rem' }}>+{nd.yoy_change_pct}%</div>
              </div>
              <div style={{ background: dark ? 'rgba(248,250,252,0.05)' : 'rgba(15,23,42,0.04)', border: '1px solid var(--borderL)', borderRadius: 10, padding: '0.875rem 1.25rem', textAlign: 'center', minWidth: 110 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Avg DOM</div>
                <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1rem' }}>{nd.dom_avg}d</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>

          {/* ── LEFT ── */}
          <div>

            {/* Scenario inputs */}
            <div style={{ ...card, background: dark ? 'rgba(91,46,255,0.06)' : 'rgba(91,46,255,0.04)', borderColor: 'rgba(91,46,255,0.2)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--purpleL)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem' }}>
                ◈ Run Your Scenario
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={label}>Property Price (₦)</span>
                  <input
                    type="text"
                    value={priceInput || (price > 0 ? (price / 1_000_000).toFixed(0) + 'M' : '')}
                    onChange={e => {
                      setPriceInput(e.target.value)
                      const num = parseFloat(e.target.value.replace(/[^0-9.]/g, ''))
                      if (!isNaN(num)) {
                        // Detect if they typed in millions or full
                        const val = num > 10000 ? num : num * 1_000_000
                        setPrice(val)
                      }
                    }}
                    placeholder={`e.g. ${(nd.median_sale_3bed / 1_000_000).toFixed(0)}M`}
                    style={{
                      width: '100%', padding: '0.65rem 0.875rem',
                      background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      border: '1px solid var(--borderL)',
                      borderRadius: 8, color: 'var(--text)',
                      fontSize: '0.9rem', outline: 'none',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <div style={{ ...subText, marginTop: '0.3rem' }}>Type 120M, 85000000, etc.</div>
                </div>
                <div>
                  <span style={label}>Bedrooms</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[1, 2, 3, 4, 5].map(b => (
                      <button key={b} onClick={() => setBedrooms(b)} style={{
                        flex: 1, padding: '0.65rem 0',
                        background: bedrooms === b ? 'var(--purple)' : 'transparent',
                        color: bedrooms === b ? '#fff' : 'var(--text2)',
                        border: `1px solid ${bedrooms === b ? 'var(--purple)' : 'var(--borderL)'}`,
                        borderRadius: 8, cursor: 'pointer',
                        fontSize: '0.85rem', fontWeight: 600,
                        transition: 'all 0.15s',
                      }}>{b}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '0.875rem', fontSize: '0.75rem', color: 'var(--text3)', lineHeight: 1.5 }}>
                Metrics recalculate instantly. Rent and short-let rates estimated from verified {nd.display} benchmarks.
                <span style={{ color: 'var(--teal)', marginLeft: '0.3rem' }}>You can override with your own figures.</span>
              </div>
            </div>

            {/* Metrics grid */}
            {metrics && (
              <>
                {/* Yield row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {/* Traditional */}
                  <div style={card}>
                    <span style={label}>Traditional Yield</span>
                    <div style={bigNum(metrics.tradGross.toFixed(1) + '%', metrics.tradGross >= 7 ? 'var(--green)' : metrics.tradGross >= 5 ? 'var(--amber)' : 'var(--red)')}>
                      {metrics.tradGross.toFixed(2)}%
                    </div>
                    <div style={subText}>Net: {metrics.tradNet.toFixed(2)}%</div>
                    <div style={{ ...subText, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--borderL)' }}>
                      Est. rent: {fmtN(metrics.annualRent)}/yr
                    </div>
                  </div>

                  {/* Short-let */}
                  <div style={card}>
                    <span style={label}>Short-let / Airbnb Yield</span>
                    <div style={bigNum(metrics.slGrossPct.toFixed(1) + '%', metrics.slGrossPct >= 15 ? 'var(--green)' : metrics.slGrossPct >= 10 ? 'var(--amber)' : 'var(--text)')}>
                      {metrics.slGrossPct.toFixed(2)}%
                    </div>
                    <div style={subText}>Net: {metrics.slNetPct.toFixed(2)}%</div>
                    <div style={{ ...subText, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--borderL)' }}>
                      {fmtN(metrics.nightly)}/night · {nd.occupancy_pct}% occ.
                    </div>
                  </div>
                </div>

                {/* Cap rate + CoC */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={card}>
                    <span style={label}>Cap Rate</span>
                    <div style={bigNum(metrics.capRate.toFixed(2) + '%')}>
                      {metrics.capRate.toFixed(2)}%
                    </div>
                    <div style={subText}>NOI: {fmtN(metrics.noi)}/yr</div>
                    <div style={{ ...subText, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--borderL)' }}>
                      After {(OPEX * 100).toFixed(0)}% operating expenses
                    </div>
                  </div>

                  <div style={card}>
                    <span style={label}>Cash-on-Cash Return</span>
                    <div style={bigNum((metrics.coc > 0 ? '+' : '') + metrics.coc.toFixed(1) + '%', metrics.coc > 0 ? 'var(--green)' : 'var(--red)')}>
                      {metrics.coc > 0 ? '+' : ''}{metrics.coc.toFixed(2)}%
                    </div>
                    <div style={subText}>
                      {metrics.coc < 0 ? 'Negative — Nigerian mortgage rates (22%) make leveraged buy challenging' : 'Positive cashflow after mortgage'}
                    </div>
                    <div style={{ ...subText, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--borderL)' }}>
                      Monthly mortgage: {fmtN(metrics.monthly)} · 30% down
                    </div>
                  </div>
                </div>

                {/* Market benchmarks */}
                <div style={card}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem' }}>
                    Market Benchmarks · {nd.display}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[
                      { label: 'Median 3-Bed Sale', value: fmtN(nd.median_sale_3bed) },
                      { label: 'Median Annual Rent', value: fmtN(nd.median_rent_3bed) },
                      { label: 'Price / sqm', value: fmtN(nd.price_per_sqm) },
                      { label: 'STR Nightly (3-Bed)', value: fmtN(nd.nightly_3bed) },
                      { label: 'STR Occupancy', value: `${nd.occupancy_pct}%` },
                      { label: 'YoY Appreciation', value: `+${nd.yoy_change_pct}%` },
                    ].map(m => (
                      <div key={m.label} style={{ padding: '0.875rem', background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 10 }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>{m.label}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supply/Demand */}
                <div style={card}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem' }}>
                    Supply / Demand Signals
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {[
                      { label: 'Supply (Inventory)', score: nd.supply_score, invert: true },
                      { label: 'Buyer Demand', score: nd.demand_score, invert: false },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text2)', fontWeight: 500 }}>{s.label}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.score}/10</span>
                        </div>
                        <div style={{ height: 6, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 100, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${s.score * 10}%`,
                            background: s.invert
                              ? s.score > 7 ? 'var(--amber)' : 'var(--green)'
                              : s.score > 7 ? 'var(--green)' : 'var(--amber)',
                            borderRadius: 100,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text3)', marginTop: '0.3rem' }}>
                          {s.invert ? (s.score > 7 ? 'High inventory — more negotiation room' : 'Low inventory — competitive') : (s.score > 7 ? 'Strong demand — faster sales' : 'Moderate demand')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </>
            )}

            {/* Key facts */}
            <div style={card}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>
                Market Intelligence
              </div>
              {nd.key_facts.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0', borderBottom: i < nd.key_facts.length - 1 ? '1px solid var(--borderL)' : 'none' }}>
                  <span style={{ color: 'var(--teal)', fontSize: '0.7rem', flexShrink: 0, marginTop: 3 }}>◆</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Title types */}
            <div style={card}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>
                Common Title Types
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {nd.title_types.map(t => (
                  <span key={t} style={{
                    padding: '0.3rem 0.75rem',
                    background: dark ? 'rgba(20,184,166,0.1)' : 'rgba(20,184,166,0.08)',
                    border: '1px solid rgba(20,184,166,0.25)',
                    borderRadius: 100, fontSize: '0.75rem',
                    color: 'var(--teal)', fontWeight: 600,
                  }}>
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div>

            {/* Strategy signal */}
            {metrics && (
              <div style={{
                background: dark ? 'linear-gradient(135deg, rgba(91,46,255,0.15) 0%, rgba(20,184,166,0.08) 100%)' : 'linear-gradient(135deg, rgba(91,46,255,0.06) 0%, rgba(20,184,166,0.04) 100%)',
                border: '1px solid rgba(91,46,255,0.25)',
                borderRadius: 16, padding: '1.5rem',
                marginBottom: '1rem',
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} />
                  Zalone Strategy Signal
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
                  {metrics.strategyLabel}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.55 }}>
                  {metrics.reason}
                </div>
              </div>
            )}

            {/* Affordability */}
            {metrics && (
              <div style={card}>
                <span style={label}>Buyer Profile</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>
                  {metrics.accessible} of Lagos earners
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.5, marginBottom: '0.875rem' }}>
                  Requires ~{fmtN(metrics.monthly / 0.30)}/month income at 30% housing ratio
                </div>
                <div style={{ padding: '0.75rem', background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 10, fontSize: '0.78rem', color: 'var(--text3)', lineHeight: 1.5 }}>
                  {metrics.incomeMultiple >= 10
                    ? 'Target: Diaspora buyers, HNW individuals, institutional investors'
                    : metrics.incomeMultiple >= 5
                    ? 'Target: Senior professionals, dual-income households, SME owners'
                    : 'Target: Mid-senior professionals, young executives'}
                </div>
              </div>
            )}

            {/* Best for / Risks */}
            <div style={card}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={label}>Best For</span>
                {nd.best_for.map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem 0', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green)', fontSize: '0.75rem', marginTop: 2, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>{b}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--borderL)', paddingTop: '1.25rem' }}>
                <span style={{ ...label, color: 'var(--red)' }}>Risk Factors</span>
                {nd.risks.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem 0', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--amber)', fontSize: '0.75rem', marginTop: 2, flexShrink: 0 }}>⚠</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data note */}
            <div style={{ padding: '1rem', background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: '1px solid var(--borderL)', borderRadius: 12, fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
              Benchmarks from verified Lagos market research. Metrics computed from your scenario inputs. Always conduct independent due diligence. Data: Manop Intelligence.
            </div>

            {/* Properties in this area */}
            <div style={{ marginTop: '2rem' }}>
              <PropertySection neighborhood={slug} dark={dark} />
            </div>

            {/* Agency CTA */}
            <div style={{ marginTop: '1rem', background: dark ? 'rgba(91,46,255,0.08)' : 'rgba(91,46,255,0.04)', border: '1px solid rgba(91,46,255,0.2)', borderRadius: 16, padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--purpleL)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                Agency in {nd.display}?
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Get free intelligence reports on your listings. Investors see your properties with verified data.
              </div>
              <a href="mailto:partners@manop.africa" style={{ display: 'block', background: 'var(--purple)', color: '#fff', padding: '0.65rem 1rem', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
                Become a Founding Partner →
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; }
        input { transition: border-color 0.15s; }
        input:focus { border-color: var(--purple) !important; outline: none; }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 380px"] {
            display: block !important;
          }
          div[style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  )
}

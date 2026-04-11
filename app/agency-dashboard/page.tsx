'use client'
import { useState, useEffect } from 'react'
import { getInitialDark, listenTheme } from '../../lib/theme'

// ─── Mock data for demo — replace with real Supabase queries ─────────────
const MOCK_AGENCY = {
  name: 'Vala Homes',
  city: 'Lagos',
  tier: 'Founding Partner',
  joined: 'April 2026',
  listings_total: 30,
  listings_live: 28,
  listings_pending: 2,
  total_views: 847,
  investor_enquiries: 12,
  avg_confidence: 91,
}

const MOCK_LISTINGS = [
  { id: '1', title: '5-Bed Detached Duplex', neighborhood: 'Lekki Phase 1', price: 120_000_000, type: 'for-sale', views: 143, enquiries: 3, title_doc: "Governor's Consent", confidence: 94, trad_yield: 6.2, shortlet_yield: 24.1, status: 'live' },
  { id: '2', title: '3-Bed Flat', neighborhood: 'Lekki Phase 1', price: 65_000_000, type: 'for-sale', views: 87, enquiries: 1, title_doc: 'C of O', confidence: 96, trad_yield: 7.4, shortlet_yield: 19.3, status: 'live' },
  { id: '3', title: '4-Bed Terrace Duplex', neighborhood: 'Lekki Phase 1', price: 95_000_000, type: 'for-sale', views: 211, enquiries: 4, title_doc: 'C of O', confidence: 93, trad_yield: 5.9, shortlet_yield: 22.8, status: 'live' },
  { id: '4', title: '2-Bed Apartment', neighborhood: 'Lekki Phase 1', price: 45_000_000, type: 'for-rent', views: 76, enquiries: 2, title_doc: 'Deed of Assignment', confidence: 88, trad_yield: 8.1, shortlet_yield: 21.4, status: 'live' },
  { id: '5', title: '6-Bed Mansion', neighborhood: 'Lekki Phase 1', price: 280_000_000, type: 'for-sale', views: 198, enquiries: 2, title_doc: "Governor's Consent", confidence: 97, trad_yield: 4.8, shortlet_yield: 28.6, status: 'live' },
  { id: '6', title: '3-Bed Bungalow', neighborhood: 'Lekki Phase 1', price: 70_000_000, type: 'for-sale', views: 0, enquiries: 0, title_doc: 'C of O', confidence: 90, trad_yield: 6.8, shortlet_yield: 18.9, status: 'pending' },
]

const MOCK_ENQUIRIES = [
  { id: 'e1', investor: 'Diaspora Investor (UK)', property: '4-Bed Terrace Duplex', time: '2 hours ago', type: 'Yield Analysis', status: 'new' },
  { id: 'e2', investor: 'HNW Individual (Lagos)', property: '6-Bed Mansion', time: '5 hours ago', type: 'Property Visit', status: 'new' },
  { id: 'e3', investor: 'Fund Manager (US)', property: '5-Bed Detached Duplex', time: 'Yesterday', type: 'Full Report', status: 'viewed' },
  { id: 'e4', investor: 'Private Investor (Dubai)', property: '3-Bed Flat', time: '2 days ago', type: 'Yield Analysis', status: 'viewed' },
]

function fmtN(n: number) {
  if (n >= 1_000_000_000) return `₦${(n/1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `₦${(n/1_000_000).toFixed(0)}M`
  return `₦${(n/1_000).toFixed(0)}K`
}

export default function AgencyDashboard() {
  const [dark, setDark] = useState(true)
  const [tab,  setTab]  = useState<'overview'|'listings'|'enquiries'|'upload'>('overview')

  useEffect(() => {
    setDark(getInitialDark())
    return listenTheme(d => setDark(d))
  }, [])

  const v = (d: string, l: string) => dark ? d : l
  const bg     = v('#0F172A','#F8FAFC')
  const bg2    = v('#1E293B','#F1F5F9')
  const bg3    = v('#162032','#FFFFFF')
  const text   = v('#F8FAFC','#0F172A')
  const text2  = v('rgba(248,250,252,0.65)','rgba(15,23,42,0.65)')
  const text3  = v('rgba(248,250,252,0.35)','rgba(15,23,42,0.35)')
  const border = v('rgba(248,250,252,0.07)','rgba(15,23,42,0.08)')

  const card = { background: bg3, border: `1px solid ${border}`, borderRadius: 16, padding: '1.5rem' }
  const lbl  = { fontSize: '0.65rem', fontWeight: 700 as const, color: '#14B8A6', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '0.35rem', display: 'block' as const }

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text, fontFamily: 'system-ui, sans-serif', transition: 'all 0.3s' }}>

      {/* ── SIDEBAR ── */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{
          width: 240, flexShrink: 0,
          background: bg2,
          borderRight: `1px solid ${border}`,
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh',
          overflow: 'auto',
        }}>
          {/* Logo */}
          <div style={{ padding: '1.5rem', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', marginBottom: '1.25rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#5B2EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>Z</div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: text }}>Zalone</div>
                <div style={{ fontSize: '0.52rem', fontWeight: 600, color: '#14B8A6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Agency Portal</div>
              </div>
            </div>

            {/* Agency badge */}
            <div style={{ background: dark ? 'rgba(91,46,255,0.12)' : 'rgba(91,46,255,0.06)', border: '1px solid rgba(91,46,255,0.2)', borderRadius: 10, padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: text, marginBottom: '0.2rem' }}>{MOCK_AGENCY.name}</div>
              <div style={{ fontSize: '0.65rem', color: '#14B8A6', fontWeight: 600 }}>✦ {MOCK_AGENCY.tier}</div>
              <div style={{ fontSize: '0.65rem', color: text3, marginTop: '0.2rem' }}>{MOCK_AGENCY.city} · Since {MOCK_AGENCY.joined}</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
            {[
              { id: 'overview',   label: 'Overview',    icon: '◈' },
              { id: 'listings',   label: 'My Listings', icon: '◉' },
              { id: 'enquiries',  label: 'Enquiries',   icon: '△', badge: MOCK_ENQUIRIES.filter(e=>e.status==='new').length },
              { id: 'upload',     label: 'Upload Data', icon: '⊕' },
            ].map(item => (
              <button key={item.id} onClick={() => setTab(item.id as typeof tab)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '0.65rem 0.875rem',
                background: tab === item.id ? 'rgba(91,46,255,0.15)' : 'transparent',
                border: `1px solid ${tab === item.id ? 'rgba(91,46,255,0.3)' : 'transparent'}`,
                borderRadius: 10, cursor: 'pointer',
                color: tab === item.id ? '#7C5FFF' : text2,
                fontSize: '0.85rem', fontWeight: tab === item.id ? 600 : 400,
                marginBottom: '0.25rem', transition: 'all 0.15s', textAlign: 'left',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.9rem', color: tab === item.id ? '#5B2EFF' : '#14B8A6' }}>{item.icon}</span>
                  {item.label}
                </span>
                {item.badge ? <span style={{ background: '#5B2EFF', color: '#fff', borderRadius: 100, padding: '0.1rem 0.45rem', fontSize: '0.65rem', fontWeight: 700 }}>{item.badge}</span> : null}
              </button>
            ))}
          </nav>

          {/* Data quality score */}
          <div style={{ padding: '1rem 0.75rem', borderTop: `1px solid ${border}` }}>
            <div style={lbl}>Data Quality</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ flex: 1, height: 6, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${MOCK_AGENCY.avg_confidence}%`, background: 'linear-gradient(90deg, #5B2EFF, #14B8A6)', borderRadius: 100 }} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: text }}>{MOCK_AGENCY.avg_confidence}%</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: text3, marginTop: '0.35rem' }}>Avg confidence across listings</div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, overflow: 'auto' }}>

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.35rem' }}>Agency Dashboard</div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: text, letterSpacing: '-0.03em' }}>
                  Good morning, {MOCK_AGENCY.name} 👋
                </h1>
                <p style={{ color: text2, fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  Here's how your listings are performing on Zalone.
                </p>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Live Listings',      value: MOCK_AGENCY.listings_live,    color: '#14B8A6' },
                  { label: 'Total Views',         value: MOCK_AGENCY.total_views.toLocaleString(), color: '#7C5FFF' },
                  { label: 'Investor Enquiries',  value: MOCK_AGENCY.investor_enquiries, color: '#22C55E' },
                  { label: 'Avg Confidence',      value: `${MOCK_AGENCY.avg_confidence}%`, color: '#F59E0B' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <span style={lbl}>{s.label}</span>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Recent enquiries */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={card}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem' }}>Recent Enquiries</div>
                  {MOCK_ENQUIRIES.slice(0,3).map(e => (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.75rem 0', borderBottom: `1px solid ${border}` }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: text, marginBottom: '0.15rem' }}>{e.investor}</div>
                        <div style={{ fontSize: '0.72rem', color: text2 }}>{e.property}</div>
                        <div style={{ fontSize: '0.68rem', color: text3 }}>{e.type} · {e.time}</div>
                      </div>
                      {e.status === 'new' && (
                        <span style={{ background: 'rgba(91,46,255,0.15)', border: '1px solid rgba(91,46,255,0.3)', color: '#7C5FFF', borderRadius: 100, padding: '0.15rem 0.55rem', fontSize: '0.62rem', fontWeight: 700, whiteSpace: 'nowrap' }}>NEW</span>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setTab('enquiries')} style={{ width: '100%', marginTop: '1rem', padding: '0.6rem', background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, color: text2, fontSize: '0.78rem', cursor: 'pointer' }}>
                    View all enquiries →
                  </button>
                </div>

                {/* Intelligence preview */}
                <div style={card}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem' }}>
                    ◈ Intelligence Preview
                  </div>
                  <div style={{ background: dark ? 'rgba(91,46,255,0.08)' : 'rgba(91,46,255,0.04)', border: '1px solid rgba(91,46,255,0.15)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: text3, marginBottom: '0.25rem' }}>Your best performer</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: text, marginBottom: '0.5rem' }}>5-Bed Detached Duplex, Lekki Phase 1</div>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: text3, marginBottom: '0.15rem' }}>Short-let Yield</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22C55E' }}>24.1%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: text3, marginBottom: '0.15rem' }}>Traditional Yield</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#14B8A6' }}>6.2%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: text3, marginBottom: '0.15rem' }}>Views</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: text }}>143</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: text2, lineHeight: 1.6 }}>
                    Zalone computes yield, cap rate, and market positioning for every listing you upload. Investors see this intelligence alongside your property.
                  </div>
                </div>
              </div>

              {/* What intelligence means for agencies */}
              <div style={{ ...card, marginTop: '1.5rem', background: dark ? 'linear-gradient(135deg, rgba(91,46,255,0.1) 0%, rgba(20,184,166,0.06) 100%)' : 'linear-gradient(135deg, rgba(91,46,255,0.04) 0%, rgba(20,184,166,0.02) 100%)', borderColor: 'rgba(91,46,255,0.2)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                  {[
                    { icon: '◈', title: 'Verified Intelligence', desc: 'Every listing gets yield analysis, cap rate, and investment signals — attracting serious investors, not browsers.' },
                    { icon: '△', title: 'Source Attribution', desc: 'Your agency name appears on every property. When investors click, they see your brand. Direct lead flow to you.' },
                    { icon: '○', title: 'Data Quality Score', desc: 'Zalone scores your data quality transparently. Better data = higher visibility = more investor attention.' },
                  ].map(f => (
                    <div key={f.title}>
                      <div style={{ fontSize: '1.2rem', color: '#14B8A6', marginBottom: '0.5rem' }}>{f.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: text, marginBottom: '0.4rem' }}>{f.title}</div>
                      <div style={{ fontSize: '0.8rem', color: text2, lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── LISTINGS TAB ── */}
          {tab === 'listings' && (
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>Listings</div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: text, letterSpacing: '-0.03em' }}>My Properties</h1>
                </div>
                <button onClick={() => setTab('upload')} style={{ background: '#5B2EFF', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem 1.25rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                  + Upload New Listings
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {MOCK_LISTINGS.map(l => (
                  <div key={l.id} style={{
                    ...card, padding: '1.25rem',
                    display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap',
                    opacity: l.status === 'pending' ? 0.7 : 1,
                  }}>
                    {/* Status indicator */}
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.status === 'live' ? '#22C55E' : '#F59E0B', flexShrink: 0 }} />

                    {/* Property info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: text, marginBottom: '0.2rem' }}>{l.title}</div>
                      <div style={{ fontSize: '0.78rem', color: text2 }}>
                        📍 {l.neighborhood} · {fmtN(l.price)} · {l.type.replace(/-/g, ' ')} · 📄 {l.title_doc}
                      </div>
                    </div>

                    {/* Intelligence */}
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.62rem', color: text3, marginBottom: '0.15rem' }}>Trad. Yield</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: l.trad_yield >= 7 ? '#22C55E' : '#14B8A6' }}>{l.trad_yield}%</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.62rem', color: text3, marginBottom: '0.15rem' }}>STR Yield</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22C55E' }}>{l.shortlet_yield}%</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.62rem', color: text3, marginBottom: '0.15rem' }}>Views</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: text }}>{l.views}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.62rem', color: text3, marginBottom: '0.15rem' }}>Enquiries</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: l.enquiries > 0 ? '#7C5FFF' : text3 }}>{l.enquiries}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.62rem', color: text3, marginBottom: '0.15rem' }}>Quality</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: l.confidence >= 90 ? '#22C55E' : '#F59E0B' }}>{l.confidence}%</div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      background: l.status === 'live' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                      border: `1px solid ${l.status === 'live' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      color: l.status === 'live' ? '#22C55E' : '#F59E0B',
                      borderRadius: 100, padding: '0.2rem 0.65rem',
                      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' as const,
                      letterSpacing: '0.06em', whiteSpace: 'nowrap' as const,
                    }}>
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ENQUIRIES TAB ── */}
          {tab === 'enquiries' && (
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>Investor Interest</div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: text, letterSpacing: '-0.03em' }}>Enquiries</h1>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {MOCK_ENQUIRIES.map(e => (
                  <div key={e.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(91,46,255,0.15)', border: '1px solid rgba(91,46,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        👤
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: text, marginBottom: '0.15rem' }}>{e.investor}</div>
                        <div style={{ fontSize: '0.78rem', color: text2 }}>{e.property}</div>
                        <div style={{ fontSize: '0.68rem', color: text3 }}>{e.type} · {e.time}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {e.status === 'new' && <span style={{ background: 'rgba(91,46,255,0.15)', border: '1px solid rgba(91,46,255,0.3)', color: '#7C5FFF', borderRadius: 100, padding: '0.15rem 0.55rem', fontSize: '0.62rem', fontWeight: 700 }}>NEW</span>}
                      <a href={`mailto:partners@manop.africa?subject=Enquiry: ${e.property}`} style={{ background: '#5B2EFF', color: '#fff', padding: '0.45rem 1rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                        Respond →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── UPLOAD TAB ── */}
          {tab === 'upload' && (
            <div style={{ padding: '2rem', maxWidth: 700 }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>Data Upload</div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: text, letterSpacing: '-0.03em' }}>Upload Your Listings</h1>
                <p style={{ color: text2, fontSize: '0.875rem', marginTop: '0.4rem', lineHeight: 1.6 }}>
                  Upload any spreadsheet export. Manop cleans, structures, and adds intelligence automatically. Your data — attributed to {MOCK_AGENCY.name} on every property.
                </p>
              </div>

              {/* Drop zone */}
              <a href="/admin/upload" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: `2px dashed ${border}`, borderRadius: 16, padding: '3rem 2rem',
                textDecoration: 'none', color: text, marginBottom: '1.5rem',
                transition: 'border-color 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(91,46,255,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = border)}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📂</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Drop CSV or Excel file</div>
                <div style={{ color: text2, fontSize: '0.82rem', marginBottom: '1.25rem' }}>or click to open the upload tool</div>
                <div style={{ background: '#5B2EFF', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600 }}>
                  Open Upload Tool →
                </div>
              </a>

              {/* What happens */}
              <div style={card}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>What Manop Does With Your Data</div>
                {[
                  { step: '01', title: 'Clean & Structure', desc: 'Messy column names, mixed formats, Pidgin descriptions — handled automatically.' },
                  { step: '02', title: 'Validate & Flag', desc: 'Price outliers flagged. Duplicate listings detected. Location names standardized.' },
                  { step: '03', title: 'Add Intelligence', desc: 'Yield analysis, cap rate, market position — computed for every listing.' },
                  { step: '04', title: 'Publish with Credit', desc: 'Your listings go live on Zalone with "{MOCK_AGENCY.name}" as the verified source.' },
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: `1px solid ${border}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(91,46,255,0.12)', border: '1px solid rgba(91,46,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#7C5FFF', flexShrink: 0 }}>
                      {s.step}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: text, marginBottom: '0.15rem' }}>{s.title}</div>
                      <div style={{ fontSize: '0.78rem', color: text2 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } a { color: inherit; }`}</style>
    </div>
  )
}

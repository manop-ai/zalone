'use client'
// PropertySection.tsx
// Shows real properties from Supabase under neighborhood intelligence
// With freemium gates on advanced metrics

import { useState, useEffect } from 'react'

interface Property {
  id: string
  property_type: string | null
  bedrooms: number | null
  bathrooms: number | null
  price_local: number | null
  currency_code: string | null
  listing_type: string | null
  title_document_type: string | null
  size_sqm: number | null
  source_type: string | null
  created_at: string | null
  raw_data: Record<string, unknown> | null
}

function fmtN(n: number | null, c?: string | null) {
  if (!n) return 'POA'
  const sym = c === 'USD' ? '$' : c === 'GHS' ? 'GH₵' : '₦'
  if (n >= 1_000_000_000) return `${sym}${(n/1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `${sym}${(n/1_000_000).toFixed(0)}M`
  return `${sym}${(n/1_000).toFixed(0)}K`
}

// Compute basic yield inline — no API needed
function quickYield(price: number | null, neighborhood: string) {
  if (!price || price === 0) return null
  const rentBenchmarks: Record<string, number> = {
    'lekki phase 1': 6_000_000, 'ikoyi': 14_000_000,
    'victoria island': 12_000_000, 'lekki': 4_800_000,
    'ikota': 4_500_000, 'chevron': 4_200_000, 'ajah': 3_200_000,
  }
  const rent = rentBenchmarks[neighborhood.toLowerCase()] || 3_000_000
  return ((rent / price) * 100).toFixed(1)
}

function LockedBadge() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.68rem', fontWeight: 600, color: '#F59E0B', cursor: 'pointer' }}>
      🔒 Pro
    </div>
  )
}

export default function PropertySection({
  neighborhood,
  dark,
}: {
  neighborhood: string
  dark: boolean
}) {
  const [props, setProps] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const v = (d: string, l: string) => dark ? d : l
  const bg3    = v('#162032', '#FFFFFF')
  const text   = v('#F8FAFC', '#0F172A')
  const text2  = v('rgba(248,250,252,0.65)', 'rgba(15,23,42,0.65)')
  const text3  = v('rgba(248,250,252,0.35)', 'rgba(15,23,42,0.35)')
  const border = v('rgba(248,250,252,0.07)', 'rgba(15,23,42,0.08)')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Normalize slug to neighborhood name for query
        const neighborhoodName = neighborhood
          .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          .replace('Phase 1', 'Phase 1').replace('Phase 2', 'Phase 2')

        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )
        const { data } = await sb
          .from('properties')
          .select('id,property_type,bedrooms,bathrooms,price_local,currency_code,listing_type,title_document_type,size_sqm,source_type,created_at,raw_data')
          .or(`neighborhood.ilike.%${neighborhoodName}%,neighborhood.ilike.%${neighborhood.replace(/-/g,' ')}%`)
          .order('created_at', { ascending: false })
          .limit(12)

        setProps((data as Property[]) || [])
      } catch {
        setProps([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [neighborhood])

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: text3, fontSize: '0.82rem' }}>
      Loading properties...
    </div>
  )

  if (props.length === 0) return (
    <div style={{ padding: '2.5rem', textAlign: 'center', background: bg3, border: `1px solid ${border}`, borderRadius: 16 }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🏗</div>
      <div style={{ fontWeight: 700, color: text, marginBottom: '0.4rem', fontSize: '0.95rem' }}>
        Seeding data for this area
      </div>
      <div style={{ fontSize: '0.82rem', color: text2, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
        We're verifying listings for this neighborhood. Check back soon — or contact us if you're an agency with properties here.
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.2rem' }}>
            Verified Listings
          </div>
          <div style={{ fontWeight: 700, color: text, fontSize: '1rem' }}>
            {props.length} properties in this area
          </div>
        </div>
        <div style={{ fontSize: '0.72rem', color: text3 }}>
          Source: {props[0]?.source_type || 'Agency Partner'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {props.map(p => {
          const raw = (p.raw_data || {}) as Record<string, unknown>
          const mediaUrls = Array.isArray(raw['media_urls']) ? raw['media_urls'] as string[] : []
          const agentPhone = ((p.raw_data as Record<string, unknown>)?.['agent_phone'] as string || '').replace(/\D/g,'')
          const sourceAgency = (raw['source_agency'] as string) || 'Verified Source'
          const yieldEst = quickYield(p.price_local, neighborhood.replace(/-/g,' '))
          const isRent = p.listing_type === 'for-rent' || p.listing_type === 'short-let'

          return (
            <div key={p.id} style={{
              background: bg3,
              border: `1px solid ${border}`,
              borderRadius: 16, overflow: 'hidden',
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(91,46,255,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Image */}
              <div style={{ height: 180, background: dark ? '#1E293B' : '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
                {mediaUrls[0] ? (
                  <img src={mediaUrls[0]} alt="Property" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: 0.3 }}>🏠</div>
                )}
                {/* Listing type badge */}
                <div style={{ position: 'absolute', top: 10, left: 10, background: isRent ? 'rgba(20,184,166,0.9)' : 'rgba(91,46,255,0.9)', color: '#fff', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: 700, backdropFilter: 'blur(4px)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {p.listing_type?.replace(/-/g,' ') || 'For Sale'}
                </div>
                {/* Source */}
                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 6, padding: '0.15rem 0.5rem', fontSize: '0.6rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                  {sourceAgency}
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: '1.25rem' }}>
                {/* Title + price */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: text, marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
                    {p.bedrooms ? `${p.bedrooms}-Bed ` : ''}{p.property_type || 'Property'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7C5FFF', letterSpacing: '-0.03em' }}>
                    {fmtN(p.price_local, p.currency_code)}
                    {isRent && <span style={{ fontSize: '0.75rem', color: text2, fontWeight: 400 }}>/month</span>}
                  </div>
                </div>

                {/* Specs */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
                  {p.bedrooms && <span style={{ fontSize: '0.75rem', color: text2, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>🛏 {p.bedrooms} bed</span>}
                  {p.bathrooms && <span style={{ fontSize: '0.75rem', color: text2, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>🚿 {p.bathrooms} bath</span>}
                  {p.size_sqm && <span style={{ fontSize: '0.75rem', color: text2, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>📐 {p.size_sqm}m²</span>}
                </div>

                {/* Title document */}
                {p.title_document_type && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.68rem', color: '#14B8A6', fontWeight: 600, marginBottom: '1rem' }}>
                    ✓ {p.title_document_type}
                  </div>
                )}

                {/* Intelligence preview — free vs locked */}
                <div style={{ background: dark ? 'rgba(91,46,255,0.06)' : 'rgba(91,46,255,0.03)', border: '1px solid rgba(91,46,255,0.12)', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>
                    ◈ Quick Intelligence
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    {/* Free — basic yield estimate */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', color: text3, marginBottom: '0.15rem' }}>Est. Yield</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#22C55E' }}>
                        {yieldEst ? `~${yieldEst}%` : '—'}
                      </div>
                    </div>
                    {/* Locked — short-let yield */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', color: text3, marginBottom: '0.15rem' }}>STR Yield</div>
                      <LockedBadge />
                    </div>
                    {/* Locked — cap rate */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', color: text3, marginBottom: '0.15rem' }}>Cap Rate</div>
                      <LockedBadge />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={`/property/${p.id}`} style={{ flex: 1, background: '#5B2EFF', color: '#fff', padding: '0.6rem 0.75rem', borderRadius: 8, textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>
                    Full Report →
                  </a>
                  {agentPhone && (
                    <a href={`https://wa.me/${agentPhone}`} target="_blank" rel="noopener" style={{ background: '#25D366', color: '#fff', padding: '0.6rem 0.75rem', borderRadius: 8, textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>
                      📱
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Upgrade CTA */}
      <div style={{ marginTop: '1.5rem', background: dark ? 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(91,46,255,0.08) 100%)' : 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(91,46,255,0.04) 100%)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: text, fontSize: '0.9rem', marginBottom: '0.2rem' }}>🔒 Unlock Full Intelligence</div>
          <div style={{ fontSize: '0.78rem', color: text2 }}>See short-let yield, cap rate, cash-on-cash, and full market report for every property.</div>
        </div>
        <button style={{ background: '#F59E0B', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.25rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Upgrade to Pro
        </button>
      </div>
    </div>
  )
}

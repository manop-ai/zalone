import Link from 'next/link'
import { getProperty } from '../../../lib/supabase'
import { getIntelligenceReport, fmtNGN, yieldColor, positionLabel } from '../../../lib/intelligence'
import { notFound } from 'next/navigation'

export const revalidate = 60

function IntelRow({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color?: string
}) {
  return (
    <div className="intel-row">
      <div>
        <div className="intel-label">{label}</div>
        {sub && <div className="intel-sub">{sub}</div>}
      </div>
      <div className="intel-value" style={{ color: color || 'var(--white)' }}>
        {value}
      </div>
    </div>
  )
}

export default async function PropertyDetail({ params }: { params: { id: string } }) {
  const p = await getProperty(params.id)
  if (!p) notFound()

  const raw        = (p.raw_data || {}) as Record<string, unknown>
  const agentPhone = ((p.agent_phone || String(raw['agent_phone'] || '')) as string).replace(/\D/g, '')
  const features   = Array.isArray(raw['features']) ? raw['features'] as string[] : []
  const mediaUrls  = Array.isArray(raw['media_urls']) ? raw['media_urls'] as string[] : []
  const location   = [p.neighborhood, p.city].filter(Boolean).join(', ')
  const isRent     = p.listing_type === 'for-rent' || p.listing_type === 'short-let'

  const intel = await getIntelligenceReport({
    price:         p.price_local || 0,
    bedrooms:      p.bedrooms || 3,
    neighborhood:  p.neighborhood || undefined,
    city:          p.city || 'Lagos',
    property_type: p.property_type || undefined,
    size_sqm:      p.size_sqm || undefined,
    listing_type:  p.listing_type || undefined,
  })

  const pricePos = intel ? positionLabel(intel.price_vs_market.price_position) : null

  return (
    <>
      {/* ── HERO ── */}
      <section className="detail-hero">
        <div className="detail-inner">
          <Link href="/search" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            fontSize: '0.8rem', fontWeight: 500, color: 'var(--white-muted)',
            marginBottom: '1.5rem', transition: 'color 0.15s',
          }}>
            ← Back to Properties
          </Link>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem',
          }}>
            <div>
              {/* Source + location tag */}
              <div style={{
                display: 'flex', gap: '0.5rem',
                marginBottom: '1rem', flexWrap: 'wrap',
              }}>
                <span className="pill">{p.source_type || 'Agent Verified'}</span>
                {location && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    background: 'rgba(20,184,166,0.1)',
                    border: '1px solid var(--border-teal)',
                    borderRadius: 100, padding: '0.25rem 0.75rem',
                    fontSize: '0.72rem', fontWeight: 600, color: 'var(--teal)',
                  }}>
                    📍 {location}
                  </span>
                )}
              </div>

              <h1 className="detail-title">
                {p.bedrooms ? `${p.bedrooms}-Bedroom ` : ''}
                {p.property_type || 'Property'}
                {p.neighborhood ? ` in ${p.neighborhood}` : ''}
              </h1>

              <div className="detail-price">
                {fmtNGN(p.price_local)}
                {isRent && (
                  <span style={{ fontSize: '1rem', color: 'var(--white-muted)', fontWeight: 400 }}>
                    {' '}/ month
                  </span>
                )}
              </div>
            </div>

            {/* Price position */}
            {pricePos && (
              <div style={{
                background: `${pricePos.color}12`,
                border: `1px solid ${pricePos.color}40`,
                borderRadius: 16, padding: '1rem 1.5rem',
                textAlign: 'center', minWidth: 160,
              }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 700,
                  color: 'var(--white-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  marginBottom: '0.35rem',
                }}>
                  vs Market
                </div>
                <div style={{
                  fontSize: '1.1rem', fontWeight: 800,
                  color: pricePos.color, letterSpacing: '-0.02em',
                }}>
                  {pricePos.label}
                </div>
                {intel && (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem', color: 'var(--white-muted)',
                    marginTop: '0.25rem',
                  }}>
                    {intel.price_vs_market.pct_vs_median > 0 ? '+' : ''}
                    {intel.price_vs_market.pct_vs_median}% vs median
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── IMAGES ── */}
      {mediaUrls.length > 0 && (
        <div style={{ maxWidth: 1200, margin: '1.5rem auto 0', padding: '0 2rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: mediaUrls.length === 1 ? '1fr'
              : mediaUrls.length === 2 ? '1fr 1fr'
              : '2fr 1fr 1fr',
            gap: '0.5rem', borderRadius: 16, overflow: 'hidden',
          }}>
            {mediaUrls.slice(0, 3).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener">
                <img src={url} alt={`Photo ${i+1}`} style={{
                  width: '100%',
                  height: i === 0 ? 320 : 155,
                  objectFit: 'cover', display: 'block',
                }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div className="detail-body">

        {/* ── LEFT ── */}
        <div>
          <div className="detail-section">
            <div className="detail-section-title">Property Details</div>
            {([
              ['Type',       p.property_type],
              ['Bedrooms',   p.bedrooms],
              ['Bathrooms',  p.bathrooms],
              ['Size',       p.size_sqm ? `${p.size_sqm} m²` : null],
              ['Location',   location],
              ['Listing',    p.listing_type?.replace(/-/g, ' ')],
            ] as [string, unknown][]).filter(r => r[1] != null && r[1] !== '').map(([l, v]) => (
              <div key={l as string} className="detail-row">
                <span className="lbl">{l as string}</span>
                <span className="val">{String(v)}</span>
              </div>
            ))}
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Legal &amp; Title</div>
            {p.title_document_type ? (
              <div className="detail-row">
                <span className="lbl">Document type</span>
                <span className="val" style={{ color: 'var(--teal)' }}>
                  ✓ {p.title_document_type}
                </span>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--white-muted)' }}>
                Title information pending verification.
              </p>
            )}
          </div>

          {features.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">Features &amp; Amenities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {features.map((f, i) => (
                  <div key={i} className="feature-tag">{f}</div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            padding: '1rem 1.25rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            fontSize: '0.75rem', color: 'var(--white-dim)',
            lineHeight: 1.6,
            fontFamily: 'var(--font-mono)',
          }}>
            Data structured by Manop Intelligence. Metrics computed from verified
            Lagos neighborhood benchmarks. Conduct independent due diligence before investing.
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div>
          {intel ? (
            <>
              {/* Strategy */}
              <div className="rec-box">
                <div className="rec-label">Manop Strategy Signal</div>
                <div className="rec-strategy">{intel.recommendation.strategy_label}</div>
                <div className="rec-reason">{intel.recommendation.reason}</div>
              </div>

              {/* Yield */}
              <div className="intel-panel">
                <div className="intel-panel-header">
                  <div className="intel-panel-title">Yield Analysis</div>
                </div>
                <IntelRow
                  label="Traditional Rental Yield"
                  value={`${intel.traditional_rental.gross_pct}%`}
                  sub={`Net ${intel.traditional_rental.net_pct}% · ${fmtNGN(intel.traditional_rental.annual_rent)}/yr`}
                  color={yieldColor(intel.traditional_rental.gross_pct)}
                />
                <IntelRow
                  label="Short-let / Airbnb Yield"
                  value={`${intel.shortlet.gross_pct}%`}
                  sub={`Net ${intel.shortlet.net_pct}% · ₦${(intel.shortlet.nightly_rate/1000).toFixed(0)}K/night · ${intel.shortlet.occupancy_rate}% occ.`}
                  color={yieldColor(intel.shortlet.gross_pct)}
                />
                <IntelRow
                  label="Cap Rate"
                  value={`${intel.cap_rate.cap_rate_pct}%`}
                  sub={`NOI ${fmtNGN(intel.cap_rate.noi_annual)}/yr`}
                />
              </div>

              {/* Investment */}
              <div className="intel-panel">
                <div className="intel-panel-header">
                  <div className="intel-panel-title">Investment Metrics</div>
                </div>
                <IntelRow
                  label="Cash-on-Cash Return"
                  value={`${intel.cash_on_cash.coc_pct > 0 ? '+' : ''}${intel.cash_on_cash.coc_pct}%`}
                  sub="30% down · 22% mortgage · 15yr term"
                  color={intel.cash_on_cash.coc_pct > 0 ? 'var(--green)' : 'var(--red)'}
                />
                <IntelRow
                  label="Monthly Mortgage"
                  value={fmtNGN(intel.cash_on_cash.monthly_mortgage)}
                  sub={`Down payment: ${fmtNGN(intel.cash_on_cash.down_payment)}`}
                />
              </div>

              {/* Market */}
              <div className="intel-panel">
                <div className="intel-panel-header">
                  <div className="intel-panel-title">Market Position</div>
                </div>
                <IntelRow
                  label="Area Median Price"
                  value={fmtNGN(intel.price_vs_market.median_price_area)}
                  sub={`${intel.area_benchmark.area_tier} · ${intel.area_benchmark.demand_level} demand`}
                />
                <IntelRow
                  label="Est. Days on Market"
                  value={`${intel.days_on_market.estimated_dom} days`}
                  sub={intel.days_on_market.dom_range}
                />
                <IntelRow
                  label="Buyer Profile"
                  value={intel.affordability.accessible_to}
                  sub={intel.affordability.buyer_profile}
                />
              </div>
            </>
          ) : (
            <div style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 16, padding: '2rem',
              textAlign: 'center',
            }}>
              <div className="intel-badge" style={{ justifyContent: 'center', marginBottom: '0.75rem' }}>
                Intelligence API Offline
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--white-muted)', lineHeight: 1.5 }}>
                Start the Manop intelligence service to see yield analysis.
              </p>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem', color: 'var(--white-dim)',
                marginTop: '1rem', padding: '0.75rem',
                background: 'rgba(0,0,0,0.3)', borderRadius: 8,
              }}>
                uvicorn ...roi_analysis_service.main:app --port 8002
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="detail-section" style={{ marginTop: '1rem' }}>
            <div className="detail-section-title">Contact Agent</div>
            {agentPhone ? (
              <>
                <a
                  href={`https://wa.me/${agentPhone}`}
                  target="_blank" rel="noopener"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', background: '#22C55E', color: 'white',
                    padding: '0.75rem 1.25rem', borderRadius: 10,
                    fontWeight: 600, fontSize: '0.875rem',
                    textDecoration: 'none', width: '100%',
                    marginBottom: '0.5rem',
                  }}
                >
                  WhatsApp Agent
                </a>
                <Link
                  href={`https://manop-mls.vercel.app/agent/${agentPhone}`}
                  target="_blank"
                  style={{
                    display: 'block', textAlign: 'center',
                    fontSize: '0.8rem', color: 'var(--lavender)',
                    paddingTop: '0.25rem',
                  }}
                >
                  View agent portfolio →
                </Link>
              </>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--white-muted)' }}>
                Contact available via Manop platform.
              </p>
            )}
          </div>
        </div>

      </div>
    </>
  )
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const p = await getProperty(params.id)
  if (!p) return { title: 'Property — Zalone' }
  const loc  = p.neighborhood || p.city || 'Lagos'
  const beds = p.bedrooms ? `${p.bedrooms}-Bed ` : ''
  return {
    title: `${beds}${p.property_type || 'Property'} in ${loc} — Zalone`,
    description: `Intelligence report: yield analysis, cap rate, market position. Powered by Manop.`,
  }
}

'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import type { ZaloneProperty } from '../../lib/supabase'
import { fmtNGN } from '../../lib/intelligence'

const TYPES = ['All', 'apartment', 'duplex', 'detached', 'land', 'commercial']
const BEDS  = ['Any', '1', '2', '3', '4', '5+']
const AREAS = ['All', 'Lekki', 'Ikoyi', 'Victoria Island', 'Ajah', 'Ikeja', 'Yaba', 'Abuja']

export default function SearchPage() {
  const [listings, setListings] = useState<ZaloneProperty[]>([])
  const [loading,  setLoading]  = useState(true)
  const [area,     setArea]     = useState('All')
  const [type,     setType]     = useState('All')
  const [beds,     setBeds]     = useState('Any')

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase
        .from('properties').select('*')
        .order('created_at', { ascending: false })
        .limit(48)

      if (area !== 'All')  q = q.ilike('neighborhood', `%${area}%`)
      if (type !== 'All')  q = q.eq('property_type', type)
      if (beds !== 'Any') {
        const b = parseInt(beds)
        if (beds === '5+') q = q.gte('bedrooms', 5)
        else q = q.eq('bedrooms', b)
      }

      const { data } = await q
      setListings((data as ZaloneProperty[]) || [])
      setLoading(false)
    }
    load()
  }, [area, type, beds])

  return (
    <>
      <section style={{
        background: 'var(--ink-mid)',
        borderBottom: '1px solid var(--border-light)',
        padding: '2.5rem 2rem',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem', color: 'var(--gold)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}>
            Property Intelligence
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem', fontWeight: 700,
            color: 'var(--cream)', letterSpacing: '-0.03em',
            marginBottom: '0.4rem',
          }}>
            Lagos Properties
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--mist)' }}>
            {loading ? 'Loading...' : `${listings.length} listings with Manop intelligence`}
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        {/* Filters */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem', color: 'var(--mist)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}>
              Area
            </div>
            <div className="filter-bar">
              {AREAS.map(a => (
                <button key={a} className={`filter-chip ${area === a ? 'active' : ''}`}
                  onClick={() => setArea(a)}>{a}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem', color: 'var(--mist)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}>
                Type
              </div>
              <div className="filter-bar" style={{ marginBottom: 0 }}>
                {TYPES.map(t => (
                  <button key={t} className={`filter-chip ${type === t ? 'active' : ''}`}
                    onClick={() => setType(t)}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem', color: 'var(--mist)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}>
                Bedrooms
              </div>
              <div className="filter-bar" style={{ marginBottom: 0 }}>
                {BEDS.map(b => (
                  <button key={b} className={`filter-chip ${beds === b ? 'active' : ''}`}
                    onClick={() => setBeds(b)}>{b}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{
            textAlign: 'center', padding: '4rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
            color: 'var(--mist)',
          }}>
            Loading intelligence...
          </div>
        ) : listings.length > 0 ? (
          <div className="prop-grid">
            {listings.map(p => {
              const loc = [p.neighborhood, p.city].filter(Boolean).join(', ')
              return (
                <Link key={p.id} href={`/property/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div className="prop-card">
                    <div className="prop-card-header">
                      <div className="prop-card-type">
                        {p.bedrooms ? `${p.bedrooms}-Bed ` : ''}{p.property_type || 'Property'}
                      </div>
                      <div className="yield-badge" style={{
                        color: 'var(--gold)', borderColor: 'var(--gold-dim)',
                        fontSize: '0.65rem',
                      }}>
                        Intel →
                      </div>
                    </div>
                    <div className="prop-card-body">
                      <div className="prop-price">{fmtNGN(p.price_local)}</div>
                      {loc && <div className="prop-location">📍 {loc}</div>}
                      <div className="prop-specs">
                        {p.bedrooms  && <span>{p.bedrooms} bed</span>}
                        {p.bathrooms && <span>{p.bathrooms} bath</span>}
                        {p.size_sqm  && <span>{p.size_sqm}m²</span>}
                      </div>
                      {p.title_document_type && (
                        <div style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem', color: 'var(--gold)',
                          marginTop: '0.5rem',
                        }}>
                          ◆ {p.title_document_type}
                        </div>
                      )}
                    </div>
                    <div className="prop-card-footer">
                      <span className="source-tag">{p.source_type || 'verified'}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold)' }}>
                        View Report →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '4rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--mist)',
          }}>
            No listings match these filters.
          </div>
        )}
      </div>
    </>
  )
}

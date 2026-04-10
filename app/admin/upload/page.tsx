'use client'

import { useState, useRef, useCallback } from 'react'
import { parseCSV, processRawData, fmtClean } from '../../../lib/manop-cleaner'
import type { ProcessingResult, CleanRecord } from '../../../lib/manop-cleaner'

// ─── Theme ────────────────────────────────────────────────────────────────
const D = {
  bg:       '#0F172A',
  bg2:      '#1E293B',
  bg3:      '#162032',
  text:     '#F8FAFC',
  text2:    'rgba(248,250,252,0.65)',
  text3:    'rgba(248,250,252,0.35)',
  purple:   '#5B2EFF',
  purpleL:  '#7C5FFF',
  teal:     '#14B8A6',
  green:    '#22C55E',
  amber:    '#F59E0B',
  red:      '#EF4444',
  border:   'rgba(248,250,252,0.07)',
  borderP:  'rgba(91,46,255,0.25)',
  card:     '#162032',
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}40`,
      color, borderRadius: 100, padding: '0.15rem 0.6rem',
      fontSize: '0.68rem', fontWeight: 700,
      letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      background: D.bg3, border: `1px solid ${D.border}`,
      borderRadius: 12, padding: '1rem 1.25rem',
    }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: D.teal, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: color || D.text, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function UploadPage() {
  const [step,        setStep]        = useState<'upload' | 'mapping' | 'results' | 'approved'>('upload')
  const [dragging,    setDragging]    = useState(false)
  const [fileName,    setFileName]    = useState('')
  const [agencyName,  setAgencyName]  = useState('')
  const [defaultCity, setDefaultCity] = useState('')
  const [processing,  setProcessing]  = useState(false)
  const [result,      setResult]      = useState<ProcessingResult | null>(null)
  const [approved,    setApproved]    = useState<CleanRecord[]>([])
  const [rejected,    setRejected]    = useState<Set<number>>(new Set())
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [activeTab,   setActiveTab]   = useState<'clean' | 'flagged' | 'duplicates'>('clean')
  const fileRef = useRef<HTMLInputElement>(null)
  const rawDataRef = useRef<string>('')

  const processFile = useCallback((text: string, name: string) => {
    setFileName(name)
    rawDataRef.current = text
  }, [])

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      processFile(text, file.name)
      setStep('mapping')
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const runCleaning = () => {
    setProcessing(true)
    setTimeout(() => {
      try {
        const rows = parseCSV(rawDataRef.current)
        const r    = processRawData(rows, {
          source_agency:        agencyName || 'Manual Upload',
          default_city:         defaultCity || undefined,
          default_listing_type: 'for-sale',
        })
        setResult(r)
        setApproved(r.clean)
        setStep('results')
      } catch (err) {
        alert('Error processing file: ' + String(err))
      } finally {
        setProcessing(false)
      }
    }, 100)
  }

  const toggleReject = (i: number) => {
    setRejected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const handleSubmit = async () => {
    if (!result) return
    setSubmitting(true)

    const toSubmit = result.clean.filter((_, i) => !rejected.has(i))

    try {
      const res = await fetch('/api/ingest', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          records: toSubmit,
          source_agency: agencyName || 'Manual Upload',
        }),
      })
      if (res.ok) {
        setSubmitted(true)
        setStep('approved')
      } else {
        alert('Submission failed — check your Supabase connection')
      }
    } catch {
      alert('Network error — is the dev server running?')
    } finally {
      setSubmitting(false)
    }
  }

  // ── STEP: Upload ─────────────────────────────────────────────────────────
  if (step === 'upload') return (
    <div style={{ background: D.bg, minHeight: '100vh', padding: '3rem 2rem', color: D.text }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: D.teal, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            Manop Intelligence
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
            Data Upload & Cleaning
          </h1>
          <p style={{ color: D.text2, lineHeight: 1.65, fontWeight: 300 }}>
            Upload any CSV or Excel export from an agency or your own research.
            Manop will clean, standardize, deduplicate, and validate the data
            before storing it — no manual formatting needed.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? D.purple : D.border}`,
            borderRadius: 16,
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'rgba(91,46,255,0.08)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📂</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
            Drop your CSV or Excel file here
          </div>
          <div style={{ color: D.text3, fontSize: '0.82rem', marginBottom: '1rem' }}>
            or click to browse
          </div>
          <div style={{
            display: 'inline-block',
            background: D.purple, color: '#fff',
            padding: '0.5rem 1.25rem', borderRadius: 8,
            fontSize: '0.82rem', fontWeight: 600,
          }}>
            Choose File
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls,.tsv,.txt"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>

        {/* What columns it accepts */}
        <div style={{ background: D.bg3, border: `1px solid ${D.border}`, borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: D.teal, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>
            Accepts Any Column Names — Examples
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              ['Location / Neighborhood / Area / Address', 'Price / Amount / Asking / Cost'],
              ['Bedroom / Bed / Rooms / BR', 'Bathroom / Bath / Toilet'],
              ['Type / Property Type / Category', 'Title / Document / C of O / Legal'],
              ['Size / SQM / Floor Area', 'Description / Details / Features'],
              ['Listing / Purpose / For Sale / Rent', 'URL / Link / Source'],
            ].map(([a, b], i) => (
              <div key={i} style={{ fontSize: '0.78rem', color: D.text2, padding: '0.4rem 0', borderBottom: `1px solid ${D.border}` }}>
                {a}
              </div>
            )).concat([
              <div key="b" style={{ fontSize: '0.78rem', color: D.text2, padding: '0.4rem 0', borderBottom: `1px solid ${D.border}` }}>
                URL / Link / Source / Property URL
              </div>
            ])}
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: D.text3 }}>
            Column names don't need to match exactly — Manop guesses intelligently.
            Extra columns are preserved in the raw data record.
          </div>
        </div>
      </div>
    </div>
  )

  // ── STEP: Mapping (agency name + options) ─────────────────────────────────
  if (step === 'mapping') return (
    <div style={{ background: D.bg, minHeight: '100vh', padding: '3rem 2rem', color: D.text }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.72rem', color: D.teal, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>File Ready</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Configure & Clean
          </h1>
          <div style={{ color: D.text2, marginTop: '0.4rem', fontSize: '0.875rem' }}>
            📄 {fileName}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: D.bg3, border: `1px solid ${D.border}`, borderRadius: 12, padding: '1.5rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: D.teal, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>
              Source Agency / Platform Name
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={e => setAgencyName(e.target.value)}
              placeholder="e.g. Vala Homes, Revolution Plus, My Research..."
              style={{
                width: '100%', padding: '0.65rem 0.875rem',
                background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`,
                borderRadius: 8, color: D.text, fontSize: '0.9rem', outline: 'none',
              }}
            />
            <div style={{ fontSize: '0.72rem', color: D.text3, marginTop: '0.4rem' }}>
              This appears as the data source credit on Zalone: "Data: Vala Homes"
            </div>
          </div>

          <div style={{ background: D.bg3, border: `1px solid ${D.border}`, borderRadius: 12, padding: '1.5rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: D.teal, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>
              Default City (if not in file)
            </label>
            <input
              type="text"
              value={defaultCity}
              onChange={e => setDefaultCity(e.target.value)}
              placeholder="e.g. Lagos"
              style={{
                width: '100%', padding: '0.65rem 0.875rem',
                background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`,
                borderRadius: 8, color: D.text, fontSize: '0.9rem', outline: 'none',
              }}
            />
            <div style={{ fontSize: '0.72rem', color: D.text3, marginTop: '0.4rem' }}>
              Used when the file doesn't have a city column
            </div>
          </div>

          <button
            onClick={runCleaning}
            disabled={processing}
            style={{
              background: D.purple, color: '#fff', border: 'none',
              borderRadius: 10, padding: '0.875rem',
              fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
              opacity: processing ? 0.7 : 1, transition: 'opacity 0.15s',
            }}
          >
            {processing ? '⟳ Cleaning data...' : 'Run Manop Cleaner →'}
          </button>

          <button onClick={() => setStep('upload')} style={{ background: 'transparent', border: `1px solid ${D.border}`, color: D.text2, borderRadius: 10, padding: '0.75rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            ← Upload different file
          </button>
        </div>
      </div>
    </div>
  )

  // ── STEP: Results ─────────────────────────────────────────────────────────
  if (step === 'results' && result) {
    const tabData = activeTab === 'clean' ? result.clean : activeTab === 'flagged' ? result.flagged : result.duplicates.map(d => d.duplicate)

    return (
      <div style={{ background: D.bg, minHeight: '100vh', color: D.text }}>

        {/* Header */}
        <div style={{ background: D.bg2, borderBottom: `1px solid ${D.border}`, padding: '1.5rem 2rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: D.teal, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem' }}>
                  Cleaning Complete · {agencyName || 'Manual Upload'}
                </div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                  {fileName}
                </h1>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  background: D.green, color: '#fff', border: 'none',
                  borderRadius: 10, padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting
                  ? '⟳ Saving...'
                  : `✓ Approve & Save ${result.clean.length - rejected.size} Records`}
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Stat label="Total Rows" value={result.summary.total} />
              <Stat label="Clean" value={result.summary.clean} color={D.green} />
              <Stat label="Flagged" value={result.summary.flagged} color={D.amber} />
              <Stat label="Duplicates" value={result.summary.duplicates} color={D.text3} />
              <Stat label="Median Price" value={fmtClean(result.summary.median_price)} color={D.purpleL} />
            </div>

            {/* Neighborhoods found */}
            {Object.keys(result.summary.neighborhoods).length > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: D.text3 }}>Areas:</span>
                {Object.entries(result.summary.neighborhoods).map(([n, count]) => (
                  <span key={n} style={{
                    background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)',
                    color: D.teal, borderRadius: 100, padding: '0.2rem 0.6rem',
                    fontSize: '0.72rem', fontWeight: 600,
                  }}>
                    {n} ({count})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: `1px solid ${D.border}`, padding: '0 2rem', background: D.bg2 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: '0' }}>
            {(['clean', 'flagged', 'duplicates'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.875rem 1.25rem',
                  background: 'transparent', border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? D.purple : 'transparent'}`,
                  color: activeTab === tab ? D.text : D.text2,
                  fontSize: '0.82rem', fontWeight: activeTab === tab ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
              >
                {tab === 'clean' && <span style={{ color: D.green }}>✓</span>}
                {tab === 'flagged' && <span style={{ color: D.amber }}>⚠</span>}
                {tab === 'duplicates' && <span style={{ color: D.text3 }}>⊕</span>}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span style={{ background: tab === 'clean' ? D.green : tab === 'flagged' ? D.amber : D.text3, color: '#fff', borderRadius: 100, padding: '0.05rem 0.45rem', fontSize: '0.65rem', fontWeight: 700 }}>
                  {tab === 'clean' ? result.clean.length : tab === 'flagged' ? result.flagged.length : result.duplicates.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Records table */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 2rem' }}>
          {tabData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: D.text3, fontSize: '0.875rem' }}>
              No records in this category
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(tabData as CleanRecord[]).map((record, i) => {
                const isRejected = rejected.has(i)
                return (
                  <div key={i} style={{
                    background: isRejected ? 'rgba(239,68,68,0.05)' : D.card,
                    border: `1px solid ${isRejected ? 'rgba(239,68,68,0.2)' : record.price_flagged ? 'rgba(245,158,11,0.25)' : D.border}`,
                    borderRadius: 12, padding: '1rem 1.25rem',
                    opacity: isRejected ? 0.55 : 1,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      {/* Left: property info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {record.bedrooms ? `${record.bedrooms}-Bed ` : ''}{record.property_type || 'Property'}
                          </span>
                          {record.neighborhood && (
                            <span style={{ fontSize: '0.8rem', color: D.text2 }}>
                              📍 {record.neighborhood}{record.city ? `, ${record.city}` : ''}
                            </span>
                          )}
                          <Badge color={record.location_confidence === 'exact' ? D.green : record.location_confidence === 'fuzzy' ? D.amber : D.red}>
                            {record.location_confidence}
                          </Badge>
                          {record.listing_type && <Badge color={D.purpleL}>{record.listing_type.replace(/-/g, ' ')}</Badge>}
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                          <span style={{ color: record.price_flagged ? D.amber : D.teal, fontWeight: 700 }}>
                            {fmtClean(record.price, record.currency)}
                            {record.price_flagged && ' ⚠'}
                          </span>
                          {record.bathrooms && <span style={{ color: D.text2 }}>{record.bathrooms} bath</span>}
                          {record.size_sqm && <span style={{ color: D.text2 }}>{record.size_sqm} m²</span>}
                          {record.title_document && <span style={{ color: D.text2 }}>📄 {record.title_document}</span>}
                          {record.source_url && (
                            <a href={record.source_url} target="_blank" rel="noopener" style={{ color: D.purpleL, fontSize: '0.75rem' }}>
                              Source ↗
                            </a>
                          )}
                        </div>

                        {record.price_flagged && (
                          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: D.amber, background: 'rgba(245,158,11,0.08)', borderRadius: 6, padding: '0.35rem 0.6rem' }}>
                            ⚠ {record.price_flag_reason}
                          </div>
                        )}

                        {record.location_confidence === 'unknown' && (
                          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: D.red, background: 'rgba(239,68,68,0.08)', borderRadius: 6, padding: '0.35rem 0.6rem' }}>
                            ✗ Location could not be matched — verify "{record.neighborhood}"
                          </div>
                        )}
                      </div>

                      {/* Right: approve/reject */}
                      {activeTab === 'clean' && (
                        <button
                          onClick={() => toggleReject(i)}
                          style={{
                            padding: '0.4rem 0.875rem',
                            background: isRejected ? 'rgba(239,68,68,0.15)' : 'transparent',
                            border: `1px solid ${isRejected ? D.red : D.border}`,
                            color: isRejected ? D.red : D.text3,
                            borderRadius: 8, cursor: 'pointer',
                            fontSize: '0.78rem', fontWeight: 600,
                            transition: 'all 0.15s', flexShrink: 0,
                          }}
                        >
                          {isRejected ? '↩ Restore' : '✕ Reject'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── STEP: Approved ────────────────────────────────────────────────────────
  if (step === 'approved') return (
    <div style={{ background: D.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: D.text }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem', color: D.green }}>
          Data Saved
        </h1>
        <p style={{ color: D.text2, lineHeight: 1.65, marginBottom: '2rem' }}>
          {result?.clean.length ? result.clean.length - rejected.size : 0} records from <strong>{agencyName || 'Manual Upload'}</strong> have been cleaned and stored in Manop's database. They will appear on Zalone with source attribution.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { setStep('upload'); setResult(null); setFileName(''); setAgencyName(''); setRejected(new Set()); setSubmitted(false) }}
            style={{ background: D.purple, color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
            Upload Another File →
          </button>
          <a href="/neighborhood/lekki-phase-1" style={{ background: D.bg3, color: D.text, border: `1px solid ${D.border}`, borderRadius: 10, padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block' }}>
            View Lekki Phase 1 →
          </a>
        </div>
      </div>
    </div>
  )

  return null
}

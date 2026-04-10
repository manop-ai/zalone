'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const MARKETS = [
  'Lekki Phase 1, Lagos',
  'Ikoyi, Lagos',
  'Victoria Island, Lagos',
  'Lekki, Lagos',
  'Ikota, Lagos',
  'Chevron, Lagos',
  'Ajah, Lagos',
  'Gbagada, Lagos',
  'Yaba, Lagos',
  'Ikeja GRA, Lagos',
]

const STATS = [
  { value: '6–24%', label: 'Rental Yield Range' },
  { value: '₦45M–₦280M', label: 'Market Price Range' },
  { value: '13', label: 'Neighborhoods Covered' },
  { value: 'Live', label: 'Lagos Intelligence' },
]

const FEATURES = [
  {
    icon: '◈',
    title: 'Traditional Yield',
    desc: 'Annual rental return as % of property value. Computed from verified Lagos benchmarks.',
  },
  {
    icon: '◉',
    title: 'Short-let / Airbnb Yield',
    desc: 'Nightly rate × occupancy × 365. Lagos short-let market modelled per neighborhood.',
  },
  {
    icon: '⬡',
    title: 'Cap Rate & NOI',
    desc: 'Net operating income after expenses. What the property actually earns, not what it asks.',
  },
  {
    icon: '◇',
    title: 'Cash-on-Cash Return',
    desc: 'Return on your equity after Nigerian mortgage costs. Honest about the 22% rate reality.',
  },
  {
    icon: '△',
    title: 'Price vs Market',
    desc: 'How this property sits against neighborhood median. Overpriced, underpriced, or fair.',
  },
  {
    icon: '○',
    title: 'Strategy Signal',
    desc: 'Data-driven recommendation: buy-to-let, short-let, hold, or review the deal.',
  },
]

export default function Home() {
  const [dark, setDark] = useState(true)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [typed, setTyped] = useState('')
  const [placeholder, setPlaceholder] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Animated placeholder cycling
  useEffect(() => {
    const examples = ['Lekki Phase 1', 'Ikoyi', 'Victoria Island', 'Chevron', 'Ajah']
    let i = 0, ci = 0, dir = 1
    const interval = setInterval(() => {
      const word = examples[i]
      if (dir === 1) {
        setPlaceholder('Search ' + word.slice(0, ci + 1) + '...')
        ci++
        if (ci >= word.length) { dir = -1; setTimeout(() => {}, 800) }
      } else {
        setPlaceholder('Search ' + word.slice(0, ci - 1) + '...')
        ci--
        if (ci <= 0) { dir = 1; i = (i + 1) % examples.length }
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  const handleInput = (val: string) => {
    setQuery(val)
    if (val.length > 1) {
      setSuggestions(MARKETS.filter(m => m.toLowerCase().includes(val.toLowerCase())).slice(0, 5))
    } else {
      setSuggestions([])
    }
  }

  const handleSearch = (val?: string) => {
    const q = val || query
    if (!q.trim()) return
    const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    router.push(`/neighborhood/${slug}?q=${encodeURIComponent(q)}`)
  }

  // CSS variables for dark/light
  const css = dark ? {
    '--bg':         '#0F172A',
    '--bg2':        '#1E293B',
    '--bg3':        '#273549',
    '--text':       '#F8FAFC',
    '--text2':      'rgba(248,250,252,0.65)',
    '--text3':      'rgba(248,250,252,0.35)',
    '--purple':     '#5B2EFF',
    '--purpleL':    '#7C5FFF',
    '--teal':       '#14B8A6',
    '--tealL':      '#2DD4BF',
    '--border':     'rgba(91,46,255,0.18)',
    '--borderL':    'rgba(248,250,252,0.07)',
    '--card':       '#162032',
  } as React.CSSProperties : {
    '--bg':         '#F8FAFC',
    '--bg2':        '#F1F5F9',
    '--bg3':        '#E2E8F0',
    '--text':       '#0F172A',
    '--text2':      'rgba(15,23,42,0.65)',
    '--text3':      'rgba(15,23,42,0.35)',
    '--purple':     '#5B2EFF',
    '--purpleL':    '#7C5FFF',
    '--teal':       '#0D9488',
    '--tealL':      '#14B8A6',
    '--border':     'rgba(91,46,255,0.2)',
    '--borderL':    'rgba(15,23,42,0.08)',
    '--card':       '#FFFFFF',
  } as React.CSSProperties

  return (
    <div style={{ ...css, background: 'var(--bg)', minHeight: '100vh', transition: 'all 0.3s' }}>



      {/* ── HERO ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(5rem, 12vw, 9rem) 2rem clamp(4rem, 8vw, 7rem)',
      }}>
        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: -200, left: '30%',
          width: 600, height: 600, borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(91,46,255,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(91,46,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -150, right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 760, margin: '0 auto',
          textAlign: 'center', position: 'relative', zIndex: 1,
        }}>

          {/* Status pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: dark ? 'rgba(20,184,166,0.1)' : 'rgba(20,184,166,0.08)',
            border: '1px solid rgba(20,184,166,0.25)',
            borderRadius: 100, padding: '0.3rem 0.875rem',
            fontSize: '0.72rem', fontWeight: 600,
            color: 'var(--teal)',
            letterSpacing: '0.04em',
            marginBottom: '2rem',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--teal)', display: 'inline-block',
              animation: 'pulse 2s infinite',
            }} />
            Lagos · Phase 1 Active
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
            fontWeight: 800, lineHeight: 1.05,
            letterSpacing: '-0.04em',
            color: 'var(--text)',
            marginBottom: '1.25rem',
          }}>
            Invest in African real estate{' '}
            <span style={{
              background: 'linear-gradient(135deg, #5B2EFF 0%, #14B8A6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              with real data.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'var(--text2)',
            lineHeight: 1.7, maxWidth: 540, margin: '0 auto 2.5rem',
            fontWeight: 300,
          }}>
            Search any Lagos neighborhood to see verified yield analysis,
            cap rates, and market benchmarks — before you invest a naira.
          </p>

          {/* ── SEARCH BAR ── */}
          <div style={{
            position: 'relative', maxWidth: 580, margin: '0 auto',
          }}>
            <div style={{
              display: 'flex', gap: 0,
              background: 'var(--card)',
              border: `1.5px solid ${focused ? 'var(--purple)' : 'var(--borderL)'}`,
              borderRadius: 14,
              boxShadow: focused
                ? '0 0 0 4px rgba(91,46,255,0.12), 0 8px 32px rgba(0,0,0,0.15)'
                : '0 4px 24px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}>
              {/* Search icon */}
              <div style={{
                padding: '0 1rem 0 1.25rem',
                display: 'flex', alignItems: 'center',
                color: focused ? 'var(--purple)' : 'var(--text3)',
                fontSize: '1.1rem', flexShrink: 0,
                transition: 'color 0.2s',
              }}>
                ⌕
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => handleInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => { setFocused(false); setSuggestions([]) }, 150)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={placeholder || 'Search a neighborhood, e.g. Lekki Phase 1...'}
                style={{
                  flex: 1, padding: '1rem 0.5rem',
                  background: 'transparent', border: 'none', outline: 'none',
                  fontSize: '0.95rem', color: 'var(--text)',
                  fontFamily: 'var(--font-display)',
                }}
              />

              <button
                onClick={() => handleSearch()}
                style={{
                  background: 'var(--purple)',
                  color: '#fff', border: 'none',
                  padding: '0 1.5rem',
                  fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '0 12px 12px 0',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontFamily: 'var(--font-display)',
                  transition: 'background 0.15s',
                }}
              >
                Analyze →
              </button>
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
                background: 'var(--card)',
                border: '1px solid var(--borderL)',
                borderRadius: 12,
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                overflow: 'hidden',
              }}>
                {suggestions.map(s => (
                  <button
                    key={s}
                    onMouseDown={() => { setQuery(s); setSuggestions([]); handleSearch(s) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      width: '100%', padding: '0.75rem 1.25rem',
                      background: 'transparent', border: 'none',
                      textAlign: 'left', cursor: 'pointer',
                      color: 'var(--text)', fontSize: '0.875rem',
                      borderBottom: '1px solid var(--borderL)',
                      fontFamily: 'var(--font-display)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = dark ? 'rgba(91,46,255,0.08)' : '#F1F5F9')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: 'var(--teal)', fontSize: '0.8rem' }}>📍</span>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick market chips */}
          <div style={{
            display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
            justifyContent: 'center', marginTop: '1.25rem',
          }}>
            <span style={{
              fontSize: '0.72rem', color: 'var(--text3)',
              marginRight: '0.25rem', alignSelf: 'center',
            }}>
              Popular:
            </span>
            {['Lekki Phase 1', 'Ikoyi', 'Victoria Island', 'Chevron', 'Ajah'].map(area => (
              <button
                key={area}
                onClick={() => { setQuery(area); handleSearch(area) }}
                style={{
                  padding: '0.3rem 0.75rem',
                  background: dark ? 'rgba(91,46,255,0.1)' : 'rgba(91,46,255,0.06)',
                  border: '1px solid rgba(91,46,255,0.2)',
                  borderRadius: 100, cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 500,
                  color: 'var(--purpleL)',
                  fontFamily: 'var(--font-display)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,46,255,0.18)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = dark ? 'rgba(91,46,255,0.1)' : 'rgba(91,46,255,0.06)'; e.currentTarget.style.color = 'var(--purpleL)' }}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{
        borderTop: '1px solid var(--borderL)',
        borderBottom: '1px solid var(--borderL)',
        background: dark ? 'rgba(30,41,59,0.5)' : 'var(--bg2)',
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          padding: '1.75rem 2rem',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              textAlign: 'center',
              borderRight: i < 3 ? '1px solid var(--borderL)' : 'none',
              padding: '0 1.5rem',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                fontWeight: 800, color: 'var(--text)',
                letterSpacing: '-0.03em', lineHeight: 1,
                marginBottom: '0.35rem',
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: '0.68rem', fontWeight: 600,
                color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHAT ZALONE COMPUTES ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)',
            textTransform: 'uppercase', letterSpacing: '0.15em',
            marginBottom: '0.875rem',
          }}>
            <span style={{ width: 20, height: 2, background: 'var(--teal)', display: 'inline-block' }} />
            What Zalone Computes
            <span style={{ width: 20, height: 2, background: 'var(--teal)', display: 'inline-block' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontWeight: 800, color: 'var(--text)',
            letterSpacing: '-0.04em', lineHeight: 1.1,
            marginBottom: '0.75rem',
          }}>
            Not listings. Intelligence.
          </h2>
          <p style={{
            fontSize: '1rem', color: 'var(--text2)',
            maxWidth: 480, margin: '0 auto', lineHeight: 1.7, fontWeight: 300,
          }}>
            Every neighborhood search returns real financial metrics — computed
            from verified Lagos market benchmarks, not estimated from thin air.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: 'var(--card)',
              border: '1px solid var(--borderL)',
              borderRadius: 16, padding: '1.5rem',
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(91,46,255,0.35)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--borderL)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              <div style={{
                fontSize: '1.4rem', color: 'var(--teal)',
                marginBottom: '0.75rem', lineHeight: 1,
              }}>
                {f.icon}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem', fontWeight: 700,
                color: 'var(--text)', marginBottom: '0.4rem',
                letterSpacing: '-0.01em',
              }}>
                {f.title}
              </div>
              <div style={{
                fontSize: '0.85rem', color: 'var(--text2)',
                lineHeight: 1.6, fontWeight: 300,
              }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        background: dark ? 'var(--bg2)' : 'var(--bg2)',
        borderTop: '1px solid var(--borderL)',
        borderBottom: '1px solid var(--borderL)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)',
            textTransform: 'uppercase', letterSpacing: '0.15em',
            marginBottom: '1rem',
          }}>
            How It Works
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 800, color: 'var(--text)',
            letterSpacing: '-0.03em', marginBottom: '3rem',
          }}>
            Search a neighborhood. Get your report.
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          }}>
            {[
              { step: '01', title: 'Search', desc: 'Enter any Lagos neighborhood — Lekki, Ikoyi, Chevron, anywhere we cover.' },
              { step: '02', title: 'Analyze', desc: 'Zalone computes yield, cap rate, cash-on-cash, and market position instantly.' },
              { step: '03', title: 'Decide', desc: 'See the strategy signal. Buy, hold, short-let, or walk away — with data behind you.' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(91,46,255,0.12)',
                  border: '1px solid rgba(91,46,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem', fontWeight: 700,
                  color: 'var(--purpleL)',
                  letterSpacing: '0.06em',
                }}>
                  {s.step}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem', fontWeight: 700,
                  color: 'var(--text)', marginBottom: '0.5rem',
                }}>
                  {s.title}
                </div>
                <div style={{
                  fontSize: '0.85rem', color: 'var(--text2)',
                  lineHeight: 1.6, fontWeight: 300,
                }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => inputRef.current?.focus()}
            style={{
              marginTop: '3rem',
              background: 'var(--purple)', color: '#fff',
              border: 'none', borderRadius: 10,
              padding: '0.875rem 2rem',
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem', fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--purpleL)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--purple)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Start Analyzing →
          </button>
        </div>
      </section>

      {/* ── AGENCY PARTNER CTA ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{
          background: dark
            ? 'linear-gradient(135deg, rgba(91,46,255,0.12) 0%, rgba(20,184,166,0.06) 100%)'
            : 'linear-gradient(135deg, rgba(91,46,255,0.05) 0%, rgba(20,184,166,0.03) 100%)',
          border: '1px solid rgba(91,46,255,0.2)',
          borderRadius: 24, padding: 'clamp(2rem, 4vw, 3.5rem)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', gap: '2rem',
          justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{
            position: 'absolute', top: -80, right: -60,
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(91,46,255,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, color: 'var(--teal)',
              textTransform: 'uppercase', letterSpacing: '0.14em',
              marginBottom: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <span style={{ width: 14, height: 2, background: 'var(--teal)', display: 'inline-block' }} />
              Founding Agency Partners
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
              fontWeight: 800, color: 'var(--text)',
              letterSpacing: '-0.03em', lineHeight: 1.15,
              marginBottom: '0.875rem',
            }}>
              Your listings get intelligence.<br />Free. Forever.
            </h3>
            <p style={{
              fontSize: '0.9rem', color: 'var(--text2)',
              lineHeight: 1.7, fontWeight: 300,
            }}>
              Founding agency partners receive free yield analysis and cap rate
              reports on every listing they share. Investors see your properties
              with verified intelligence. You get notified when they enquire.
            </p>
          </div>
          <a
            href="mailto:partners@manop.africa"
            style={{
              background: 'var(--purple)', color: '#fff',
              padding: '0.875rem 1.75rem',
              borderRadius: 12,
              fontSize: '0.9rem', fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-display)',
              position: 'relative', zIndex: 1,
              transition: 'background 0.15s, transform 0.15s',
              display: 'inline-block',
            }}
          >
            Become a Founding Partner →
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: dark ? 'var(--bg2)' : 'var(--bg2)',
        borderTop: '1px solid var(--borderL)',
        padding: '2.5rem 2rem',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 800, color: '#fff',
              fontFamily: 'var(--font-display)',
            }}>Z</div>
            <div>
              <div style={{
                fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)',
                fontFamily: 'var(--font-display)',
              }}>
                Zalone
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>
                Lagos · Nigeria · V1
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex', gap: '1.5rem',
            fontSize: '0.8rem', color: 'var(--text2)',
          }}>
            <a href="/search" style={{ color: 'var(--text2)', textDecoration: 'none' }}>Properties</a>
            <a href="#" style={{ color: 'var(--text2)', textDecoration: 'none' }}>Markets</a>
            <a href="mailto:partners@manop.africa" style={{ color: 'var(--text2)', textDecoration: 'none' }}>
              Agency Partners
            </a>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem', color: 'var(--text3)',
            letterSpacing: '0.04em',
          }}>
            Powered by Manop Intelligence
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(20,184,166,0.4); }
          50% { opacity: 0.6; box-shadow: 0 0 0 4px rgba(20,184,166,0); }
        }
        @media (min-width: 640px) {
          .nav-link { display: block !important; }
        }
        @media (max-width: 639px) {
          .nav-link { display: none !important; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; }
        input::placeholder { color: rgba(148,163,184,0.6); }
      `}</style>
    </div>
  )
}

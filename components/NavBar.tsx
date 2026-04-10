'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// Global dark mode — stored in localStorage so it persists
export default function NavBar() {
  const [dark, setDark] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('zalone-dark')
    if (saved !== null) setDark(saved === 'true')

    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('zalone-dark', String(next))
    // Broadcast to page so it can react
    window.dispatchEvent(new CustomEvent('zalone-theme', { detail: next }))
    // Also set on document for CSS var access
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  const bg = dark
    ? `rgba(15,23,42,${scrolled ? '0.96' : '0.88'})`
    : `rgba(248,250,252,${scrolled ? '0.98' : '0.92'})`

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: bg,
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${dark ? 'rgba(248,250,252,0.07)' : 'rgba(15,23,42,0.08)'}`,
      padding: '0 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 64,
      transition: 'background 0.3s',
    }}>

      {/* Brand */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: '#5B2EFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', fontWeight: 800, color: '#fff',
          letterSpacing: '-0.02em',
        }}>
          Z
        </div>
        <div>
          <div style={{
            fontSize: '1rem', fontWeight: 700,
            color: dark ? '#F8FAFC' : '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            Zalone
          </div>
          <div style={{
            fontSize: '0.55rem', fontWeight: 600,
            color: '#14B8A6', letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Africa Intelligence
          </div>
        </div>
      </Link>

      {/* Links + controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {/* Desktop nav links */}
        <Link href="/search" style={{
          fontSize: '0.82rem', fontWeight: 500,
          color: dark ? 'rgba(248,250,252,0.65)' : 'rgba(15,23,42,0.65)',
          padding: '0.4rem 0.875rem', borderRadius: 8,
          textDecoration: 'none', transition: 'all 0.15s',
        }}>
          Properties
        </Link>

        {/* Dark/light toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          style={{
            width: 42, height: 24,
            borderRadius: 100,
            background: dark ? '#5B2EFF' : '#CBD5E1',
            border: 'none', cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.25s',
            marginLeft: '0.5rem', marginRight: '0.5rem',
            flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute',
            top: 3, left: dark ? 21 : 3,
            width: 18, height: 18,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.25s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem',
          }}>
            {dark ? '☀' : '☾'}
          </div>
        </button>

        {/* Agency CTA */}
        <a
          href="mailto:partners@manop.africa"
          style={{
            background: '#5B2EFF', color: '#fff',
            padding: '0.42rem 1rem',
            borderRadius: 8,
            fontSize: '0.8rem', fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
        >
          Agency Partner →
        </a>
      </div>
    </nav>
  )
}

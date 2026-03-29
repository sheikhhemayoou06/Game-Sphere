'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import SmartSearch from '@/components/SmartSearch';
import LiveCricketScore from '@/components/LiveCricketScore';
import { Sun, Moon, Menu, X, LogIn, UserPlus, Info, History } from 'lucide-react';

const sports = [
  { name: 'Cricket', icon: '🏏', color: '#3B82F6' },
  { name: 'Football', icon: '⚽', color: '#16A34A' },
  { name: 'Basketball', icon: '🏀', color: '#EA580C' },
  { name: 'Tennis', icon: '🎾', color: '#D97706' },
  { name: 'Badminton', icon: '🏸', color: '#E11D48' },
  { name: 'Kabaddi', icon: '🤼', color: '#0F766E' },
  { name: 'Hockey', icon: '🏑', color: '#2563EB' },
  { name: 'Athletics', icon: '🏃', color: '#EAB308' },
];



export default function HomePage() {
  const [dark, setDark] = useState(false);
  const [activeSport, setActiveSport] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Rotating sports text
    const interval = setInterval(() => {
      setActiveSport((prev) => (prev + 1) % sports.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Navbar */}
      <nav className="mobile-padding" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '14px 16px',
        background: dark ? 'rgba(15, 13, 26, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '28px' }}>🌐</span>
          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #4f46e5, #ec4899, #f43f5e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}>Game Sphere</span>
          </span>
        </div>

        {/* Navigation Actions (Hamburger) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background: 'transparent', border: 'none', color: dark ? 'white' : '#1e1b4b',
            padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '12px', transition: 'background 0.2s',
            ...(menuOpen ? { background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' } : {})
          }}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '72px', left: 0, right: 0, zIndex: 49,
          background: dark ? '#0f0d1a' : 'white',
          borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px',
          animation: 'fadeInDown 0.2s ease-out'
        }}>
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', color: dark ? 'white' : '#1e1b4b', fontWeight: 600, fontSize: '15px',
            background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc'
          }}>
            <LogIn size={20} color="#6366f1" /> Log In
          </Link>
          <Link href="/register" onClick={() => setMenuOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', color: dark ? 'white' : '#1e1b4b', fontWeight: 600, fontSize: '15px',
            background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc'
          }}>
            <UserPlus size={20} color="#10b981" /> Sign Up
          </Link>
          <button onClick={() => { setDark(!dark); setMenuOpen(false); }} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px',
            border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
            color: dark ? 'white' : '#1e1b4b', fontWeight: 600, fontSize: '15px',
            background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc'
          }}>
            {dark ? <Sun size={20} color="#fcd34d" /> : <Moon size={20} color="#475569" />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div style={{ height: '1px', background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', margin: '8px 0' }} />


          <Link href="/rankings" onClick={() => setMenuOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', color: dark ? 'rgba(255,255,255,0.8)' : '#475569', fontWeight: 600, fontSize: '15px',
            background: 'transparent'
          }}>
            Rankings
          </Link>
          <Link href="/shop" onClick={() => setMenuOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', color: dark ? 'rgba(255,255,255,0.8)' : '#475569', fontWeight: 600, fontSize: '15px',
            background: 'transparent'
          }}>
            Pro Shop
          </Link>
          <Link href="/sponsorships" onClick={() => setMenuOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', color: dark ? 'rgba(255,255,255,0.8)' : '#475569', fontWeight: 600, fontSize: '15px',
            background: 'transparent'
          }}>
            Apply for Sponsorship
          </Link>
          <div style={{ height: '1px', background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', margin: '8px 0' }} />
          <Link href="/about" onClick={() => setMenuOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', color: dark ? 'rgba(255,255,255,0.8)' : '#475569', fontWeight: 600, fontSize: '15px',
            background: 'transparent'
          }}>
            <Info size={20} /> About Us
          </Link>
          <button onClick={() => setMenuOpen(false)} style={{ /* Placeholder for Search History as its likely handled via modal later */
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px',
            border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
            color: dark ? 'rgba(255,255,255,0.8)' : '#475569', fontWeight: 600, fontSize: '15px',
            background: 'transparent'
          }}>
            <History size={20} /> History of Search
          </button>
        </div>
      )}

      {/* Hero with Horizontal Live Scorecard */}
      <section className="gradient-bg" style={{
        padding: '100px 16px 40px', position: 'relative', overflow: 'hidden', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        {/* Floating sport orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {sports.map((sport, i) => (
            <div key={sport.name} className="float" style={{
              position: 'absolute',
              left: `${10 + (i * 10) % 80}%`,
              top: `${15 + (i * 13) % 70}%`,
              fontSize: '24px',
              opacity: 0.15,
              animationDelay: `${i * 0.5}s`,
            }}>
              {sport.icon}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginBottom: '40px' }}>
          <h1 style={{
            fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 900, lineHeight: 1.1,
            color: 'white', marginBottom: '16px', letterSpacing: '-1px',
          }}>
            Powering <span style={{ color: sports[activeSport].color, transition: 'color 0.5s ease-in-out' }}>Every Game</span>.<br />
            Everywhere.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', maxWidth: '600px', margin: '0 auto', padding: '0 8px' }}>
            Follow the latest ongoing matches across India instantly.
          </p>
        </div>

        {/* ── Global Search Bar ── */}
        <div style={{ width: '100%', maxWidth: '720px', position: 'relative', zIndex: 10, marginBottom: '24px', padding: '0 16px' }}>
          <SmartSearch placeholder="Search players, teams, tournaments, matches..." dark={false} />
        </div>

        {/* ── Google-style Live Cricket Score Widget ── */}
        <div style={{ width: '100%', maxWidth: '800px', position: 'relative', zIndex: 2, padding: '0 16px' }}>
          <LiveCricketScore />
        </div>
      </section>

      {/* Drug Free Society Mission */}
      <section style={{
        padding: '64px 16px',
        background: dark ? '#0f0d1a' : '#fafafa',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.5px', color: dark ? 'white' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.2em' }}>🛡️</span> Promoting a Drug-Free Society
          </h2>
          <p style={{ color: dark ? 'rgba(255,255,255,0.8)' : '#475569', fontSize: '17px', lineHeight: 1.8, fontWeight: 500 }}>
            Game Sphere India is committed to empowering the youth and building a healthier nation.
            We believe that actively engaging individuals in sports is the most powerful method to combat substance abuse.
            By providing professional platforms for everyone to play and compete, we are championing a completely drug-free society.
          </p>
        </div>
      </section>

      {/* Removed Features grid via User feedback targeting fan portal explicitly. Info moved to /about */}



      {/* Footer */}
      < footer style={{
        padding: '32px 16px',
        background: dark ? '#080612' : '#1e1b4b',
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        fontSize: '14px',
      }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '20px' }}>🌐</span>{' '}
          <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Game Sphere</span>
        </div>
        <p>Powering Every Game. Everywhere. — India&apos;s National Sports Digital Infrastructure Platform</p>
        <p style={{ marginTop: '8px', fontSize: '12px' }}>© 2026 Game Sphere. All rights reserved.</p>
      </footer >
    </div >
  );
}

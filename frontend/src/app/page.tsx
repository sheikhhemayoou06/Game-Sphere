'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const sports = [
  { name: 'Cricket', icon: '🏏', color: '#0D9488' },
  { name: 'Football', icon: '⚽', color: '#16A34A' },
  { name: 'Basketball', icon: '🏀', color: '#EA580C' },
  { name: 'Kabaddi', icon: '🤼', color: '#F97316' },
  { name: 'Volleyball', icon: '🏐', color: '#7C3AED' },
  { name: 'Badminton', icon: '🏸', color: '#06B6D4' },
  { name: 'Hockey', icon: '🏑', color: '#2563EB' },
  { name: 'Tennis', icon: '🎾', color: '#84CC16' },
  { name: 'Athletics', icon: '🏃', color: '#EAB308' },
];

const features = [
  { title: 'Universal Sports ID', desc: 'Every player gets a verified digital identity — track careers across all sports', icon: '🆔' },
  { title: 'Multi-Sport Engine', desc: 'Configure any sport dynamically — cricket, football, kabaddi and more', icon: '⚙️' },
  { title: 'Tournament Lifecycle', desc: 'From registration to certification — fully paperless tournament management', icon: '🏆' },
  { title: 'Live Scoring', desc: 'Real-time match scoring with offline sync for rural connectivity', icon: '📊' },
  { title: 'Smart Analytics', desc: 'Performance metrics, rankings, and trend analysis across all levels', icon: '📈' },
  { title: 'Digital Certificates', desc: 'QR-verifiable, tamper-proof certificates generated automatically', icon: '📜' },
];

const stats = [
  { label: 'Sports Supported', value: '10+' },
  { label: 'Tournament Formats', value: '6' },
  { label: 'Governance Levels', value: '7' },
  { label: 'Fully Paperless', value: '100%' },
];

export default function HomePage() {
  const [dark, setDark] = useState(false);
  const [activeSport, setActiveSport] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSport((prev) => (prev + 1) % sports.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="mobile-padding" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 40px',
        background: dark ? 'rgba(15, 13, 26, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '28px' }}>🌐</span>
          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span className="gradient-text">Game Sphere</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setDark(!dark)}
            className="hide-mobile"
            style={{
              padding: '8px 12px', borderRadius: '10px', border: 'none',
              background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              cursor: 'pointer', fontSize: '18px',
            }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <Link href="/login" className="btn-secondary hide-mobile" style={{ padding: '8px 16px', fontSize: '14px' }}>
            Log In
          </Link>
          <Link href="/register" className="btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-bg mobile-padding" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 40px 80px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Floating sport orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {sports.map((sport, i) => (
            <div key={sport.name} className="float" style={{
              position: 'absolute',
              left: `${10 + (i * 10) % 80}%`,
              top: `${15 + (i * 13) % 70}%`,
              fontSize: '36px',
              opacity: 0.15,
              animationDelay: `${i * 0.5}s`,
            }}>
              {sport.icon}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', maxWidth: '800px', position: 'relative', zIndex: 2 }}>
          {/* Live sport badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '8px 20px', borderRadius: '30px', marginBottom: '28px',
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <span style={{
              fontSize: '28px',
              transition: 'all 0.5s ease',
            }}>
              {sports[activeSport].icon}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500 }}>
              Supporting {sports[activeSport].name} & {sports.length - 1} more sports
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 900, lineHeight: 1.08,
            color: 'white', marginBottom: '24px', letterSpacing: '-1.5px',
          }}>
            Powering Every Game.
            <br />
            <span style={{ color: sports[activeSport].color, transition: 'color 0.5s ease' }}>
              Everywhere.
            </span>
          </h1>

          <p style={{
            fontSize: '18px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7,
            maxWidth: '600px', margin: '0 auto 40px',
          }}>
            India&apos;s National Sports Digital Infrastructure Platform.
            From school tournaments to international championships — one unified ecosystem.
          </p>

          <div className="btn-stack-mobile" style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{
              padding: '16px 36px', fontSize: '16px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            }}>
              🚀 Start Free
            </Link>
            <Link href="/tournaments" className="btn-secondary" style={{
              padding: '16px 36px', fontSize: '16px', borderRadius: '14px',
              borderColor: 'rgba(255,255,255,0.3)', color: 'white',
            }}>
              Browse Tournaments
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid-cols-2-mobile" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
            marginTop: '60px',
          }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{
                padding: '16px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports carousel */}
      <section className="mobile-padding" style={{
        padding: '80px 40px',
        background: dark ? '#0f0d1a' : '#fafafa',
      }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
          One Platform. <span className="gradient-text">Every Sport.</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '16px' }}>
          Configure any sport dynamically — the UI adapts automatically
        </p>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap',
        }}>
          {sports.map((sport) => (
            <div key={sport.name} className="card-hover" style={{
              padding: '24px 20px', borderRadius: '16px', textAlign: 'center',
              minWidth: '110px', cursor: 'pointer',
              background: dark ? 'rgba(255,255,255,0.04)' : 'white',
              border: `2px solid ${dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
              transition: 'all 0.3s ease',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{sport.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: sport.color }}>{sport.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="mobile-padding" style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Built for <span className="gradient-text">Scale</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '16px' }}>
          Everything you need to digitize sports — from grassroots to national level
        </p>
        <div className="responsive-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px',
        }}>
          {features.map((feat) => (
            <div key={feat.title} className="card-hover" style={{
              padding: '32px', borderRadius: '18px',
              background: dark ? 'rgba(255,255,255,0.03)' : 'white',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
              boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{feat.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{feat.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-bg" style={{
        padding: '80px 40px', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'white', marginBottom: '16px', letterSpacing: '-0.5px' }}>
          Ready to Transform Sports in India?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '36px', fontSize: '16px' }}>
          Join the digital sports revolution. Register your school, college, or federation today.
        </p>
        <Link href="/register" className="btn-primary" style={{
          padding: '18px 44px', fontSize: '17px', borderRadius: '14px',
          background: 'white', color: '#4338ca',
        }}>
          🎯 Get Started for Free
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px',
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
      </footer>
    </div>
  );
}

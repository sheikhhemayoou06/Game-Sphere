'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import SmartSearch from '@/components/SmartSearch';
import { Sun, Moon } from 'lucide-react';

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



export default function HomePage() {
  const [dark, setDark] = useState(false);
  const [activeSport, setActiveSport] = useState(0);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  useEffect(() => {
    // Rotating sports text
    const interval = setInterval(() => {
      setActiveSport((prev) => (prev + 1) % sports.length);
    }, 2500);

    // Fetch live matches for the scorecard
    const fetchMatches = async () => {
      try {
        const matches = await api.getLiveMatches();
        setLiveMatches(matches);
      } catch (err) {
        console.error("Failed to load live matches", err);
      }
    };
    fetchMatches();

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
          <Link href="/about" className="hide-mobile" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600, color: dark ? 'rgba(255,255,255,0.9)' : '#475569', textDecoration: 'none' }}>
            About Us
          </Link>
          <button
            onClick={() => setDark(!dark)}
            className="hide-mobile"
            style={{
              padding: '8px 12px', borderRadius: '10px', border: 'none',
              background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: dark ? '#fcd34d' : '#475569'
            }}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link href="/login" className="btn-secondary hide-mobile" style={{ padding: '8px 16px', fontSize: '14px' }}>
            Log In
          </Link>
          <Link href="/register" className="btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero with Horizontal Live Scorecard */}
      <section className="gradient-bg mobile-padding" style={{
        padding: '120px 40px 60px', position: 'relative', overflow: 'hidden', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
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

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginBottom: '40px' }}>
          <h1 style={{
            fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 900, lineHeight: 1.1,
            color: 'white', marginBottom: '16px', letterSpacing: '-1px',
          }}>
            Powering <span style={{ color: sports[activeSport].color, transition: 'color 0.5s ease-in-out' }}>Every Game</span>.<br />
            Everywhere.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            Follow the latest ongoing matches across India instantly.
          </p>
        </div>

        {/* Horizontal Scorecard Widget */}
        <div style={{ width: '100%', maxWidth: '1000px', position: 'relative', zIndex: 2 }}>
          {liveMatches.length > 0 ? (
            <Link href="/explore" style={{ textDecoration: 'none', display: 'block' }}>
              <div className="card-hover" style={{
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
                borderRadius: '16px', padding: '20px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#1e1b4b',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap'
              }}>
                {/* Match Info */}
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', padding: '2px 6px', background: '#fef2f2', borderRadius: '4px' }}>
                      Live
                    </span>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{liveMatches[0].tournament?.name}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>{liveMatches[0].tournament?.sport?.name || sports[activeSport].name}</div>
                </div>

                {/* Score Grid (Horizontal) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flex: '2', minWidth: '300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e1b4b' }}>{liveMatches[0].homeTeam?.name}</div>
                    <div style={{ fontSize: '28px', backgroundColor: '#f1f5f9', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 800 }}>
                      {liveMatches[0].homeScore || 0}
                    </div>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8' }}>VS</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                    <div style={{ fontSize: '28px', backgroundColor: '#f1f5f9', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 800 }}>
                      {liveMatches[0].awayScore || 0}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e1b4b' }}>{liveMatches[0].awayTeam?.name}</div>
                  </div>
                </div>

                {/* Action */}
                <div style={{ flex: '1', minWidth: '150px', textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#4f46e5', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View Details →
                  </div>
                  {liveMatches.length > 1 && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                      +{liveMatches.length - 1} more live
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
              borderRadius: '16px', padding: '32px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.2)', color: 'white',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px'
            }}>
              <div style={{ width: '100%', maxWidth: '600px' }}>
                <SmartSearch placeholder="Search Live Matches, Players, or Teams..." />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                  No matches currently live
                </div>
              </div>
            </div>
          )}
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
      </section >

      {/* Removed Features grid via User feedback targeting fan portal explicitly. Info moved to /about */}

      {/* CTA */}
      < section className="gradient-bg" style={{
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
      </section >

      {/* Footer */}
      < footer style={{
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
      </footer >
    </div >
  );
}

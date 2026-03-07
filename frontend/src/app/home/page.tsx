'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import SmartSearch from '@/components/SmartSearch';
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
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

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

        {/* Horizontal Scorecard Widget */}
        <div style={{ width: '100%', maxWidth: '1000px', position: 'relative', zIndex: 2 }}>
          {liveMatches.length > 0 ? (
            <Link href="/explore" style={{ textDecoration: 'none', display: 'block' }}>
              <div className="card-hover" style={{
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
                borderRadius: '16px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#1e1b4b',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap'
              }}>
                {/* Match Info */}
                <div style={{ flex: '1', minWidth: '120px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', padding: '2px 6px', background: '#fef2f2', borderRadius: '4px' }}>
                      Live
                    </span>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{liveMatches[0].tournament?.name}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>{liveMatches[0].tournament?.sport?.name || sports[activeSport].name}</div>
                </div>

                {/* Score Grid (Horizontal) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flex: '2', minWidth: '0', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{liveMatches[0].homeTeam?.name}</div>
                    <div style={{ fontSize: '24px', backgroundColor: '#f1f5f9', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 800, flexShrink: 0 }}>
                      {liveMatches[0].homeScore || 0}
                    </div>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8' }}>VS</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                    <div style={{ fontSize: '24px', backgroundColor: '#f1f5f9', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 800, flexShrink: 0 }}>
                      {liveMatches[0].awayScore || 0}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{liveMatches[0].awayTeam?.name}</div>
                  </div>
                </div>

                {/* Action */}
                <div style={{ flex: '1', minWidth: '80px', textAlign: 'right' }}>
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
              borderRadius: '16px', padding: '20px 16px', textAlign: 'center',
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

        {/* Drug Free Society Mission */}
        <div style={{ position: 'relative', zIndex: 2, marginTop: '40px', textAlign: 'center', width: '100%', maxWidth: '800px' }}>
          <div style={{
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)',
            padding: '20px 16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#fcd34d', fontSize: '17px', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🛡️</span> Promoting a Drug-Free Society
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: 1.6, fontWeight: 500 }}>
              Game Sphere India is committed to empowering the youth and building a healthier nation.
              We believe that actively engaging individuals in sports is the most powerful method to combat substance abuse.
              By providing professional platforms for everyone to play and compete, we are championing a completely drug-free society.
            </p>
          </div>
        </div>
      </section>

      {/* Sports carousel */}
      <section style={{
        padding: '48px 16px',
        background: dark ? '#0f0d1a' : '#fafafa',
      }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
          One Platform. <span className="gradient-text">Every Sport.</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
          Configure any sport dynamically — the UI adapts automatically
        </p>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap',
        }}>
          {sports.map((sport) => (
            <div key={sport.name} className="card-hover" style={{
              padding: '16px 14px', borderRadius: '14px', textAlign: 'center',
              minWidth: '80px', flex: '1', cursor: 'pointer',
              background: dark ? 'rgba(255,255,255,0.04)' : 'white',
              border: `2px solid ${dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
              transition: 'all 0.3s ease',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{sport.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: sport.color }}>{sport.name}</div>
            </div>
          ))}
        </div>
      </section >

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

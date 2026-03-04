'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import SmartSearch from '@/components/SmartSearch';
import { Sun, Moon } from 'lucide-react';

const sports = [
  { name: 'Cricket', icon: '', color: '#3B82F6' },
  { name: 'Football', icon: '', color: '#16A34A' },
  { name: 'Basketball', icon: '', color: '#EA580C' },
  { name: 'Tennis', icon: '', color: '#D97706' },
  { name: 'Badminton', icon: '', color: '#E11D48' },
  { name: 'Kabaddi', icon: '', color: '#0F766E' },
  { name: 'Hockey', icon: '🏑', color: '#2563EB' },
  { name: 'Tennis', icon: '🎾', color: '#84CC16' },
  { name: 'Athletics', icon: '🏃', color: '#EAB308' },
];



export default function HomePage() {
  const [dark, setDark] = useState(false);
  const [activeSport, setActiveSport] = useState(0);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [showGateway, setShowGateway] = useState(true);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const router = useRouter();
  const { user, setAuth } = useAuthStore();

  useEffect(() => {
    // Check if they are logged in or have already skipped
    const checkSkip = () => {
      if (user) {
        setShowGateway(false);
        return;
      }
      const hasSkipped = localStorage.getItem('hasSkippedGateway');
      if (hasSkipped === 'true') {
        setShowGateway(false);
      }
    };

    // Slight timeout to prevent flickering immediately before Zustand rehydrates
    setTimeout(checkSkip, 100);

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
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const handleSkip = () => {
    localStorage.setItem('hasSkippedGateway', 'true');
    setShowGateway(false);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (!isOtpSent) {
        await api.sendOtp({ phone });
        setIsOtpSent(true);
        setMessage(`OTP sent to ${phone}`);
      } else {
        const res = await api.verifyOtp({ phone, otp });
        setAuth(res.user, res.accessToken);
        setShowGateway(false); // Hide gateway and show landing page or redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* PHONE LOGIN GATEWAY OVERLAY */}
      {showGateway && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="card-hover" style={{
            width: '100%', maxWidth: '440px', padding: '48px 40px',
            borderRadius: '24px', background: 'white',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontSize: '48px' }}>🌐</span>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e1b4b', marginTop: '16px', letterSpacing: '-0.5px' }}>
                Game Sphere
              </h1>
              <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px' }}>
                Enter your phone number to get personalized live updates for your favorite teams.
              </p>
            </div>

            {error && <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 500 }}>{error}</div>}
            {message && <div style={{ padding: '12px', background: '#f0fdf4', color: '#16a34a', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 500 }}>{message}</div>}

            <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              {!isOtpSent ? (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91 98765 43210" className="input-field" style={{ color: '#1e1b4b', padding: '14px' }} />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Enter 6-Digit OTP</label>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} placeholder="123456" className="input-field" style={{ color: '#1e1b4b', padding: '14px', letterSpacing: '8px', textAlign: 'center', fontSize: '24px', fontWeight: 800 }} />
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '16px', width: '100%', justifyContent: 'center', fontSize: '16px', marginTop: '8px' }}>
                {loading ? '⏳ Please Wait...' : (!isOtpSent ? '📱 Request OTP' : '✅ Verify & Enter')}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
              <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>OR</span>
              <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
            </div>

            <button onClick={handleSkip} style={{
              background: 'transparent', border: '2px solid #e2e8f0', color: '#64748b',
              padding: '14px', width: '100%', borderRadius: '12px', fontWeight: 600,
              fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
            >
              Skip to Explore →
            </button>

            <div style={{ marginTop: '24px' }}>
              <Link href="/login" style={{ fontSize: '13px', color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                Staff Member or Official? Sign in here
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Landing Page Content */}
      <div style={{
        opacity: showGateway ? 0 : 1,
        visibility: showGateway ? 'hidden' : 'visible',
        height: showGateway ? '0' : 'auto',
        overflow: showGateway ? 'hidden' : 'visible'
      }}>
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
              <span style={{
                background: 'linear-gradient(135deg, #4f46e5, #ec4899, #f43f5e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
              }}>Game Sphere</span>
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
            <Link href="/login" className="btn-secondary" style={{ padding: '8px 12px', fontSize: '14px' }}>
              Staff Log In
            </Link>
            <button onClick={() => { setShowGateway(true); localStorage.removeItem('hasSkippedGateway'); }} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Fan Register
            </button>
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
            One Platform. <span style={{
              background: 'linear-gradient(135deg, #4f46e5, #ec4899, #f43f5e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}>Every Sport.</span>
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
      </div>
    </div >
  );
}

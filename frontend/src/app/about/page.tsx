'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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

export default function AboutPage() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);

    return (
        <div style={{ minHeight: '100vh', background: dark ? '#0f0d1a' : '#fafafa' }}>
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
                    <img src="/logo.png" alt="Game Sphere Logo" style={{ width: "100px", height: "auto", objectFit: "contain" }} />
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                            <span className="gradient-text">Game Sphere</span>
                        </span>
                    </Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/about" className="hide-mobile" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 700, color: dark ? 'rgba(255,255,255,0.9)' : '#4338ca', textDecoration: 'none' }}>
                        About Us
                    </Link>
                    <Link href="/explore" className="hide-mobile" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600, color: dark ? 'rgba(255,255,255,0.9)' : '#475569', textDecoration: 'none' }}>
                        Explore Live Games
                    </Link>
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
                </div>
            </nav>

            {/* Header */}
            <section className="gradient-bg mobile-padding" style={{
                padding: '160px 40px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'white', marginBottom: '24px', letterSpacing: '-1px' }}>
                        About Game Sphere
                    </h1>
                    <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                        India&apos;s National Sports Digital Infrastructure. We are on a mission to digitize sports across all governance levels.
                    </p>
                </div>
            </section>

            {/* Stats Row */}
            <div style={{ padding: '0 40px', marginTop: '-40px', position: 'relative', zIndex: 10 }}>
                <div className="grid-cols-2-mobile" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
                    maxWidth: '1200px', margin: '0 auto',
                }}>
                    {stats.map((stat) => (
                        <div key={stat.label} style={{
                            padding: '24px', borderRadius: '16px', textAlign: 'center',
                            background: dark ? 'rgba(255,255,255,0.05)' : 'white', backdropFilter: 'blur(10px)',
                            border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                            boxShadow: dark ? 'none' : '0 10px 30px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: '36px', fontWeight: 800, color: dark ? 'white' : '#1e1b4b' }}>{stat.value}</div>
                            <div style={{ fontSize: '14px', color: dark ? 'rgba(255,255,255,0.6)' : '#64748b', marginTop: '8px', fontWeight: 600 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features grid */}
            <section className="mobile-padding" style={{ padding: '100px 40px', maxWidth: '1100px', margin: '0 auto' }}>
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
                    background: 'white', color: "inherit", fontWeight: 700, textDecoration: 'none'
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <img src="/logo.png" alt="Game Sphere Logo" style={{ width: "60px", height: "auto", objectFit: "contain" }} />
                    <span className="gradient-text" style={{ fontSize: '20px', fontWeight: 700 }}>Game Sphere</span>
                </div>
                <p>Powering Every Game. Everywhere. — India&apos;s National Sports Digital Infrastructure Platform</p>
                <p style={{ marginTop: '8px', fontSize: '12px' }}>© 2026 Game Sphere. All rights reserved.</p>
            </footer>
        </div>
    );
}

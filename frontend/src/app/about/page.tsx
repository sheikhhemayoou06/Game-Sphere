'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const features = [
    { title: 'Universal Sports ID', desc: 'Every player gets a verified digital identity — track careers, stats, and records across all sports seamlessly.', icon: '🆔' },
    { title: 'Multi-Sport Engine', desc: 'Dynamically configure any sport. Currently supporting cricket, football, kabaddi, and ready for many more.', icon: '⚙️' },
    { title: 'Tournament Management', desc: 'From online registration to fully automated fixture generation (knockout & round-robin) — a complete paperless lifecycle.', icon: '🏆' },
    { title: 'Live Match Scoring', desc: 'Real-time granular match scoring. Every run, wicket, or goal updates the live dashboard instantly for viewers worldwide.', icon: '📊' },
    { title: 'Live Auctions', desc: 'Host IPL-style live player auctions with virtual budgets, base prices, live bidding wars, and automatic team purse tracking.', icon: '🔨' },
    { title: 'Financial Tracking', desc: 'Integrated financial dashboard for organizers to track registration fees, prize pools, expenses, and generate overall balance sheets.', icon: '💰' },
    { title: 'Media & Announcements', desc: 'Dedicated tournament media galleries for organizers to share highlight videos, photos, and official announcements.', icon: '📸' },
    { title: 'Training Sessions', desc: 'Schedule team practice sessions, track player attendance, and manage training locations effortlessly.', icon: '🏃' },
    { title: 'Player Transfers', desc: 'Manage the complete player transfer lifecycle between teams with approvals, transfer windows, and historical logs.', icon: '🔄' },
];

const stats = [
    { label: 'Sports Supported', value: '10+' },
    { label: 'Tournament Formats', value: '4+' },
    { label: 'Platform Features', value: '15+' },
    { label: 'Paperless Automation', value: '100%' },
];

export default function AboutPage() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);

    return (
        <div style={{ minHeight: '100vh', background: dark ? '#0f0d1a' : '#fafafa', color: dark ? 'white' : '#1e1b4b' }}>
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
                    <Link href="/home" style={{ textDecoration: 'none' }}>
                        <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                            <span className="gradient-text">Game Sphere</span>
                        </span>
                    </Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/about" className="hide-mobile" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 700, color: dark ? 'rgba(255,255,255,0.9)' : '#4338ca', textDecoration: 'none' }}>
                        About Us
                    </Link>
                    <Link href="/dashboard" className="hide-mobile" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600, color: dark ? 'rgba(255,255,255,0.9)' : '#475569', textDecoration: 'none' }}>
                        Dashboard
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
                    <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                        India&apos;s National Sports Digital Infrastructure. We are on a mission to digitize
                        and elevate sports management across all governance levels, providing professional tools
                        for organizers, teams, and players.
                    </p>

                    {/* Social Mission */}
                    <div style={{
                        marginTop: '40px', padding: '24px 32px', background: 'rgba(0,0,0,0.2)',
                        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-block',
                        maxWidth: '800px', backdropFilter: 'blur(10px)'
                    }}>
                        <h3 style={{ color: '#fcd34d', fontSize: '20px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '24px' }}>🛡️</span> Promoting a Drug-Free Society
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: 1.6, fontWeight: 500 }}>
                            Game Sphere India is deeply committed to empowering the youth and building a healthier nation.
                            We believe that actively engaging individuals in sports and athletic communities is the most powerful
                            proven method to combat substance abuse. By providing professional platforms for everyone to play,
                            compete, and grow, we are championing a <strong>completely drug-free society</strong>.
                        </p>
                    </div>
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
            <section className="mobile-padding" style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
                    Built for <span className="gradient-text">Complete Ecosystems</span>
                </h2>
                <p style={{ textAlign: 'center', color: dark ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)', marginBottom: '48px', fontSize: '16px', maxWidth: '600px', margin: '0 auto 48px' }}>
                    Everything you need to run professional tournaments and manage sports organizations seamlessly.
                </p>

                <div className="responsive-grid" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px',
                }}>
                    {features.map((feat) => (
                        <div key={feat.title} className="card-hover" style={{
                            padding: '32px', borderRadius: '18px',
                            background: dark ? 'rgba(255,255,255,0.03)' : 'white',
                            border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                            boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)',
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '20px' }}>{feat.icon}</div>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', color: dark ? 'white' : '#1e1b4b' }}>{feat.title}</h3>
                            <p style={{ fontSize: '15px', color: dark ? 'rgba(255,255,255,0.6)' : '#64748b', lineHeight: 1.6 }}>{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Developer Credit */}
            <section style={{ padding: '60px 40px', background: dark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`, borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}` }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>👨‍💻</div>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', color: dark ? 'white' : '#1e1b4b' }}>
                        Platform Development
                    </h2>
                    <p style={{ fontSize: '18px', color: dark ? 'rgba(255,255,255,0.7)' : '#475569', lineHeight: 1.8, marginBottom: '24px' }}>
                        Game Sphere is proudly designed, architected, and developed by
                        <strong style={{ display: 'block', fontSize: '26px', color: dark ? '#818cf8' : '#4f46e5', marginTop: '12px', fontWeight: 900 }}>
                            Sheikh Hemayoou
                        </strong>
                    </p>
                    <div style={{ display: 'inline-block', padding: '10px 24px', background: dark ? 'rgba(99,102,241,0.1)' : '#e0e7ff', borderRadius: '100px', color: dark ? '#818cf8' : '#4338ca', fontWeight: 700, fontSize: '14px' }}>
                        Dedicated to advancing the sports technology landscape
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="gradient-bg" style={{
                padding: '80px 40px', textAlign: 'center',
            }}>
                <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'white', marginBottom: '16px', letterSpacing: '-0.5px' }}>
                    Ready to Transform Sports?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '36px', fontSize: '16px' }}>
                    Join the digital sports revolution. Register your tournament, team, or player profile today.
                </p>
                <Link href="/register" className="btn-primary" style={{
                    padding: '18px 44px', fontSize: '17px', borderRadius: '14px',
                    background: 'white', color: '#4338ca', fontWeight: 700, textDecoration: 'none'
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
                <p style={{ marginTop: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Developed with ❤️ by Sheikh Hemayoou</p>
                <p style={{ marginTop: '8px', fontSize: '12px' }}>© 2026 Game Sphere. All rights reserved.</p>
            </footer>
        </div>
    );
}

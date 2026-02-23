'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AnalyticsPage() {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [sports, setSports] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getTournaments().catch(() => []),
            api.getSports().catch(() => []),
            api.getTeams().catch(() => []),
            api.getMatches().catch(() => []),
        ]).then(([t, s, te, m]) => {
            setTournaments(t); setSports(s); setTeams(te); setMatches(m);
        }).finally(() => setLoading(false));
    }, []);

    const statusCounts = tournaments.reduce((acc: Record<string, number>, t: any) => {
        acc[t.status] = (acc[t.status] || 0) + 1; return acc;
    }, {});

    const sportsCounts = tournaments.reduce((acc: Record<string, number>, t: any) => {
        const sport = sports.find((s: any) => s.id === t.sportId);
        const name = sport?.name || 'Unknown';
        acc[name] = (acc[name] || 0) + 1; return acc;
    }, {});

    const totalRevenue = tournaments.reduce((sum: number, t: any) => sum + (t.registrationFee || 0) * (t.teams?.length || 0), 0);
    const totalPlayers = teams.reduce((sum: number, t: any) => sum + (t.players?.length || 0), 0);

    const statsCards = [
        { label: 'Total Tournaments', value: tournaments.length, icon: '🏆', color: '#6366f1', bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' },
        { label: 'Active Sports', value: sports.length, icon: '⚽', color: '#22c55e', bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' },
        { label: 'Registered Teams', value: teams.length, icon: '👥', color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)' },
        { label: 'Total Matches', value: matches.length, icon: '🏏', color: '#ef4444', bg: 'linear-gradient(135deg, #fef2f2, #fee2e2)' },
        { label: 'Est. Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: '#8b5cf6', bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' },
        { label: 'Total Players', value: totalPlayers, icon: '🧑‍🤝‍🧑', color: '#06b6d4', bg: 'linear-gradient(135deg, #ecfeff, #cffafe)' },
    ];

    const statusColors: Record<string, string> = {
        DRAFT: '#94a3b8', REGISTRATION: '#3b82f6', LIVE: '#22c55e', COMPLETED: '#8b5cf6', ARCHIVED: '#6b7280',
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>📊</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>Loading Analytics...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#818cf8', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>📊 Analytics Dashboard</h1>
                <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '32px' }}>Platform performance insights and metrics</p>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    {statsCards.map((stat) => (
                        <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)', transition: 'transform 0.2s, background 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                    {/* Status Distribution */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>Tournament Status</h3>
                        {Object.entries(statusCounts).length === 0 ? (
                            <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No data yet</div>
                        ) : (
                            Object.entries(statusCounts).map(([status, count]) => {
                                const pct = Math.round(((count as number) / tournaments.length) * 100);
                                return (
                                    <div key={status} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                                            <span style={{ color: statusColors[status] || '#94a3b8' }}>{status}</span>
                                            <span style={{ color: '#64748b' }}>{count as number} ({pct}%)</span>
                                        </div>
                                        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', background: statusColors[status] || '#94a3b8', transition: 'width 0.8s ease' }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Sports Distribution */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>Sports Distribution</h3>
                        {Object.entries(sportsCounts).length === 0 ? (
                            <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No data yet</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                {Object.entries(sportsCounts).map(([sport, count]) => {
                                    const s = sports.find((s: any) => s.name === sport);
                                    return (
                                        <div key={sport} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}>
                                            <span style={{ fontSize: '24px' }}>{s?.icon || '🏅'}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#e2e8f0' }}>{sport}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{count as number} tournament{(count as number) > 1 ? 's' : ''}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>Recent Tournaments</h3>
                    {tournaments.length === 0 ? (
                        <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No tournaments yet</div>
                    ) : (
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {tournaments.slice(0, 10).map((t: any) => {
                                const sport = sports.find((s: any) => s.id === t.sportId);
                                return (
                                    <Link key={t.id} href={`/tournaments/${t.id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', textDecoration: 'none', color: 'inherit', transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}>
                                        <span style={{ fontSize: '24px' }}>{sport?.icon || '🏅'}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '15px', color: '#e2e8f0' }}>{t.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{sport?.name || 'Sport'} · {t.format} · {t.level}</div>
                                        </div>
                                        <div style={{ padding: '4px 12px', borderRadius: '8px', background: `${statusColors[t.status] || '#64748b'}20`, color: statusColors[t.status] || '#64748b', fontSize: '11px', fontWeight: 700 }}>{t.status}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Bottom Links */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
                    {[
                        { href: '/leaderboard', label: '🏆 Leaderboard', color: '#6366f1' },
                        { href: '/certificates', label: '🏅 Certificates', color: '#f59e0b' },
                        { href: '/transfers', label: '🔄 Transfers', color: '#22c55e' },
                    ].map((link) => (
                        <Link key={link.href} href={link.href}
                            style={{ padding: '12px 24px', borderRadius: '12px', background: `${link.color}20`, color: link.color, fontWeight: 700, fontSize: '14px', textDecoration: 'none', border: `1px solid ${link.color}30`, transition: 'transform 0.2s' }}>
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

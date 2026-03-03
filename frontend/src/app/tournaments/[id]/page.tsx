'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons, sportConfig, defaultSportConfig, statusColors, formatDate } from '@/lib/utils';
import AuctionDashboard from '@/components/AuctionDashboard';

type Tab = 'overview' | 'teams' | 'fixtures' | 'scoring' | 'auction' | 'transfers' | 'financials' | 'leaderboard' | 'media' | 'chat' | 'settings';

export default function TournamentDashboard() {
    const { id } = useParams();
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const isOrganizer = user?.id === tournament?.organizerId;
    const config = tournament?.sport?.name ? (sportConfig[tournament.sport.name] || defaultSportConfig) : defaultSportConfig;
    const sportEmoji = tournament?.sport?.icon || sportIcons[tournament?.sport?.name] || config.emoji;

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.getTournament(id as string)
            .then((t) => {
                setTournament(t);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 2s infinite' }}>🏆</div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading tournament...</div>
            </div>
        </div>
    );

    if (!tournament) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <div style={{ textAlign: 'center', color: '#e2e8f0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
                <h2>Tournament not found</h2>
                <Link href="/tournaments" style={{ color: '#6366f1', marginTop: '12px', display: 'inline-block' }}>← Back to tournaments</Link>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #0f172a 100%)' }}>
            {/* Header */}
            <nav style={{ padding: '14px 32px', background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(16px)' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#e2e8f0', fontSize: '14px' }}>
                    ← Dashboard Home
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{sportEmoji}</span>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>{tournament.name}</span>
                    <span className="status-badge" style={{ background: `${statusColors[tournament.status] || '#6366f1'}20`, color: statusColors[tournament.status] || '#6366f1', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                        {tournament.status}
                    </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{tournament.sport?.name} • {tournament.format}</div>
            </nav>

            {/* Content */}
            <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto' }}>

                {/* ─── Active Context & Quick Actions ─── */}
                <div className="flex-wrap-mobile" style={{ padding: '16px', borderRadius: '12px', background: `#7c3aed10`, border: `1px solid #7c3aed30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '24px' }}>🔒</div>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Context Lock</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#e2e8f0' }}>{tournament.name}</div>
                        </div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {tournament.sport?.name} • {tournament.format}
                    </span>
                </div>

                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { href: `/tournaments/${id}/profile`, label: 'Tournament Profile', desc: 'Info & Contact Details', icon: '🏆', gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
                        { href: `/tournaments/${id}/teams`, label: 'Teams', desc: 'Registrations & Squads', icon: '📝', gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
                        { href: `/fixtures?tournamentId=${id}`, label: 'Fixtures', desc: 'Schedule & Results', icon: '📅', gradient: 'linear-gradient(135deg, #991b1b, #dc2626)' },
                        { href: `/scoring?tournamentId=${id}`, label: 'Live Scoring', desc: 'Score Matches', icon: '🔴', gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
                        { href: `/auction?tournamentId=${id}`, label: 'Auction', desc: 'Live Bidding', icon: '🔨', gradient: 'linear-gradient(135deg, #166534, #22c55e)' },
                        { href: `/transfers?tournamentId=${id}`, label: 'Transfers', desc: 'Player Movement', icon: '🔄', gradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)' },
                        { href: `/financial?tournamentId=${id}`, label: 'Financials', desc: 'Fees & Payouts', icon: '💰', gradient: 'linear-gradient(135deg, #854d0e, #ca8a04)' },
                        { href: `/leaderboard?tournamentId=${id}`, label: 'Leaderboard', desc: 'Points & Rankings', icon: '🥇', gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
                        { href: `/messages?tournamentId=${id}`, label: 'Chat', desc: 'Team & Admin Comm', icon: '💬', gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
                        { href: `/media?tournamentId=${id}`, label: 'Media', desc: 'Photos & Videos', icon: '📸', gradient: 'linear-gradient(135deg, #9d174d, #ec4899)' },
                        { href: `/settings?tournamentId=${id}`, label: 'Settings', desc: 'Configure Tournament', icon: '⚙️', gradient: 'linear-gradient(135deg, #1e293b, #334155)' },
                    ].map((item: any) => (
                        <Link key={item.label} href={item.href} className="card-hover" style={{
                            display: 'block', padding: '24px', borderRadius: '16px', background: item.gradient,
                            border: '2px solid transparent',
                            textDecoration: 'none', textAlign: 'left', color: 'white', position: 'relative', overflow: 'hidden', cursor: 'pointer'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontSize: '12px', opacity: 0.85 }}>{item.desc}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

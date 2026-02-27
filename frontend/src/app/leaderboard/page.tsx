'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';

const LEVELS = ['ALL', 'DISTRICT', 'STATE', 'NATIONAL'];

export default function LeaderboardPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '🏆';
    const [rankings, setRankings] = useState<any[]>([]);
    const [sports, setSports] = useState<any[]>([]);
    const [sportId, setSportId] = useState(selectedSport?.id || '');
    const [level, setLevel] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => { api.getSports().then(setSports).catch(() => { }); }, []);
    useEffect(() => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (sportId) params.sportId = sportId;
        if (level !== 'ALL') params.level = level;
        api.getRankings(params).then(setRankings).catch(() => setRankings([])).finally(() => setLoading(false));
    }, [sportId, level]);

    const getRankBadge = (rank: number) => {
        if (rank === 1) return { emoji: '🥇', bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#78350f' };
        if (rank === 2) return { emoji: '🥈', bg: 'linear-gradient(135deg, #d1d5db, #9ca3af)', color: '#1f2937' };
        if (rank === 3) return { emoji: '🥉', bg: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff' };
        return { emoji: `#${rank}`, bg: '#f1f5f9', color: '#475569' };
    };

    const getRankDelta = (r: any) => {
        if (!r.previousRank || !r.rank) return null;
        const delta = r.previousRank - r.rank;
        if (delta > 0) return { icon: '▲', text: `+${delta}`, color: '#22c55e' };
        if (delta < 0) return { icon: '▼', text: `${delta}`, color: '#ef4444' };
        return { icon: '━', text: '0', color: '#94a3b8' };
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0b2e 0%, #1a1145 30%, #0d1b3e 100%)', color: '#fff' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)', padding: '48px 24px 40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '8px' }}>{selectedSport ? `${sportLabel} Leaderboard` : 'Leaderboard'}</h1>
                <p style={{ opacity: 0.8, fontSize: '16px' }}>{selectedSport ? `${sportLabel} player & team rankings` : 'Player & team rankings across sports and levels'}</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
                    <select value={sportId} onChange={(e) => setSportId(e.target.value)}
                        style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                        <option value="" style={{ color: '#000' }}>All Sports</option>
                        {sports.map((s: any) => <option key={s.id} value={s.id} style={{ color: '#000' }}>{s.icon} {s.name}</option>)}
                    </select>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                        {LEVELS.map((l) => (
                            <button key={l} onClick={() => setLevel(l)}
                                style={{ padding: '10px 16px', border: 'none', background: level === l ? 'rgba(255,255,255,0.3)' : 'transparent', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rankings Table */}
            <div style={{ maxWidth: '900px', margin: '-20px auto 0', padding: '0 24px 48px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto', backdropFilter: 'blur(20px)' }}>
                    <div style={{ minWidth: '800px' }}>
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 100px 80px 80px 80px 100px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>
                            <span>Rank</span><span>Player / Team</span><span>Points</span><span>W</span><span>L</span><span>D</span><span>Matches</span>
                        </div>

                        {loading ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ fontSize: '36px', marginBottom: '12px', animation: 'pulse 1.5s infinite' }}>⏳</div>
                                Loading rankings...
                            </div>
                        ) : rankings.length === 0 ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No Rankings Yet</div>
                                <div style={{ color: '#94a3b8', fontSize: '14px' }}>Rankings will appear as matches are played and scored</div>
                            </div>
                        ) : (
                            rankings.map((r, i) => {
                                const badge = getRankBadge(r.rank || i + 1);
                                const delta = getRankDelta(r);
                                return (
                                    <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 100px 80px 80px 80px 100px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', background: badge.bg, color: badge.color, fontSize: '13px', fontWeight: 800 }}>
                                                {(r.rank || i + 1) <= 3 ? badge.emoji : r.rank || i + 1}
                                            </span>
                                            {delta && <span style={{ fontSize: '10px', color: delta.color, fontWeight: 700 }}>{delta.icon}</span>}
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{r.playerId ? `Player ${r.playerId.slice(0, 8)}...` : `Team ${r.teamId?.slice(0, 8)}...`}</div>
                                        <div style={{ fontWeight: 800, fontSize: '18px', color: '#a78bfa' }}>{r.points}</div>
                                        <div style={{ color: '#22c55e', fontWeight: 600 }}>{r.wins}</div>
                                        <div style={{ color: '#ef4444', fontWeight: 600 }}>{r.losses}</div>
                                        <div style={{ color: '#94a3b8', fontWeight: 600 }}>{r.draws}</div>
                                        <div style={{ color: '#94a3b8', fontWeight: 600 }}>{r.matchesPlayed}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Link href="/dashboard" style={{ color: '#a78bfa', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>← Back to Dashboard</Link>
                </div>
            </div>
        </div>
    );
}

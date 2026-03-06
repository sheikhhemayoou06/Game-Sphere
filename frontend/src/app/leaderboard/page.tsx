'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';
import { Trophy, Medal, Search as SearchIcon, ChevronDown, User, Users, ChevronLeft, Calendar, ArrowUpRight } from 'lucide-react';
import RunningAthleteLoader from '@/components/RunningAthleteLoader';
import PageNavbar from '@/components/PageNavbar';

export default function LeaderboardPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0b2e 0%, #1a1145 30%, #0d1b3e 100%)', color: '#fff' }}>
            <PageNavbar title="Leaderboard" emoji="🏆" />
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading leaderboard...</div>
                </div>
            </div>
        }>
            <LeaderboardContent />
        </Suspense>
    );
}

const LEVELS = ['ALL', 'DISTRICT', 'STATE', 'NATIONAL'];

interface LeaderboardEntry {
    rank: number;
    playerId: string;
    playerName: string;
    teamName: string;
    value: number;
    runs: number;
    wickets: number;
    catches: number;
    matches: number;
}

const CATEGORIES = [
    { key: 'mostRuns', label: 'Most Runs', icon: '🏏', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', accent: '#fbbf24', statLabel: 'Runs' },
    { key: 'mostWickets', label: 'Most Wickets', icon: '🎯', gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)', accent: '#f87171', statLabel: 'Wickets' },
    { key: 'mvp', label: 'Most Valuable Player', icon: '⭐', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', accent: '#a78bfa', statLabel: 'MVP Score' },
    { key: 'emergingPlayer', label: 'Emerging Player', icon: '🌟', gradient: 'linear-gradient(135deg, #22c55e, #15803d)', accent: '#4ade80', statLabel: 'Score' },
];

function LeaderboardContent() {
    const searchParams = useSearchParams();
    const tournamentId = searchParams.get('tournamentId');
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '🏆';

    // ─── Tournament Leaderboard State ───
    const [playerData, setPlayerData] = useState<any>(null);
    const [tournament, setTournament] = useState<any>(null);
    const [teamTable, setTeamTable] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');

    // ─── Global Leaderboard State ───
    const [rankings, setRankings] = useState<any[]>([]);
    const [sports, setSports] = useState<any[]>([]);
    const [sportId, setSportId] = useState(selectedSport?.id || '');
    const [level, setLevel] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tournamentId) {
            setLoading(true);
            Promise.all([
                api.getTournament(tournamentId),
                api.getPlayerLeaderboard(tournamentId),
                api.getLeaderboard(tournamentId),
            ]).then(([t, pData, tTable]) => {
                setTournament(t);
                setPlayerData(pData);
                setTeamTable(tTable);
            }).catch(() => { }).finally(() => setLoading(false));
        } else {
            api.getSports().then(setSports).catch(() => { });
        }
    }, [tournamentId]);

    // Global leaderboard data
    useEffect(() => {
        if (tournamentId) return;
        setLoading(true);
        const params: Record<string, string> = {};
        if (sportId) params.sportId = sportId;
        if (level !== 'ALL') params.level = level;
        api.getRankings(params).then(setRankings).catch(() => setRankings([])).finally(() => setLoading(false));
    }, [sportId, level, tournamentId]);

    const getRankBadge = (rank: number) => {
        if (rank === 1) return { emoji: '🥇', bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#78350f' };
        if (rank === 2) return { emoji: '🥈', bg: 'linear-gradient(135deg, #d1d5db, #9ca3af)', color: '#1f2937' };
        if (rank === 3) return { emoji: '🥉', bg: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff' };
        return { emoji: `#${rank}`, bg: 'rgba(255,255,255,0.08)', color: '#94a3b8' };
    };

    // ═══════════════════════════════════
    // TOURNAMENT-SCOPED LEADERBOARD
    // ═══════════════════════════════════
    if (tournamentId) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0b2e 0%, #1a1145 30%, #0d1b3e 100%)', color: '#fff' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)', padding: '48px 24px 40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, marginBottom: '8px' }}>Tournament Leaderboard</div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '8px' }}>
                        🏆 {tournament?.name || 'Loading...'}
                    </h1>
                    <p style={{ opacity: 0.8, fontSize: '15px' }}>
                        {tournament?.sport?.name} • {playerData?.totalCompletedMatches || 0} matches completed • {playerData?.totalPlayersTracked || 0} players tracked
                    </p>

                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '24px' }}>
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                            {(['players', 'teams'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '10px 24px', border: 'none',
                                        background: activeTab === tab ? 'rgba(255,255,255,0.3)' : 'transparent',
                                        color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                        transition: 'all 0.2s', textTransform: 'capitalize',
                                    }}
                                >
                                    {tab === 'players' ? '🏏 Player Stats' : '📊 Points Table'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: '1100px', margin: '-20px auto 0', padding: '0 24px 48px' }}>
                    {loading ? (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <RunningAthleteLoader />
                        </div>
                    ) : activeTab === 'players' ? (
                        /* ─── PLAYER STATS VIEW ─── */
                        <>
                            {(!playerData || (playerData.mostRuns.length === 0 && playerData.mostWickets.length === 0 && playerData.mvp.length === 0)) ? (
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '60px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', marginTop: '20px' }}>
                                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
                                    <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>No Player Stats Yet</div>
                                    <div style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                                        Player leaderboards will appear once matches are completed and player statistics are recorded.
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                    {CATEGORIES.map(cat => {
                                        const entries: LeaderboardEntry[] = playerData?.[cat.key] || [];
                                        if (entries.length === 0 && cat.key !== 'emergingPlayer') return null;
                                        return (
                                            <div key={cat.key} style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                borderRadius: '20px',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                overflow: 'hidden',
                                                backdropFilter: 'blur(12px)',
                                            }}>
                                                {/* Category Header */}
                                                <div style={{
                                                    background: cat.gradient,
                                                    padding: '20px 24px',
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                }}>
                                                    <span style={{ fontSize: '28px' }}>{cat.icon}</span>
                                                    <div>
                                                        <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px' }}>{cat.label}</div>
                                                        <div style={{ fontSize: '12px', opacity: 0.85 }}>
                                                            {cat.key === 'emergingPlayer' ? 'Players with ≤ 3 matches' : `Top ${entries.length} by ${cat.statLabel.toLowerCase()}`}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Entries */}
                                                {entries.length === 0 ? (
                                                    <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                                                        No data available yet
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '8px' }}>
                                                        {entries.map((entry, idx) => {
                                                            const badge = getRankBadge(entry.rank);
                                                            return (
                                                                <div key={entry.playerId} style={{
                                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                                    padding: '12px 16px', borderRadius: '12px',
                                                                    background: idx === 0 ? 'rgba(255,255,255,0.06)' : 'transparent',
                                                                    transition: 'background 0.2s', cursor: 'default',
                                                                }}
                                                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                                                                    onMouseLeave={(e) => (e.currentTarget.style.background = idx === 0 ? 'rgba(255,255,255,0.06)' : 'transparent')}
                                                                >
                                                                    {/* Rank */}
                                                                    <span style={{
                                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                        width: '36px', height: '36px', borderRadius: '10px',
                                                                        background: badge.bg, color: badge.color,
                                                                        fontSize: entry.rank <= 3 ? '16px' : '13px', fontWeight: 800,
                                                                        flexShrink: 0,
                                                                    }}>
                                                                        {entry.rank <= 3 ? badge.emoji : entry.rank}
                                                                    </span>

                                                                    {/* Player Info */}
                                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                            {entry.playerName}
                                                                        </div>
                                                                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                            <span>{entry.teamName}</span>
                                                                            <span style={{ opacity: 0.4 }}>•</span>
                                                                            <span>{entry.matches} {entry.matches === 1 ? 'match' : 'matches'}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Value */}
                                                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                                        <div style={{ fontSize: '22px', fontWeight: 900, color: cat.accent, lineHeight: 1 }}>
                                                                            {entry.value}
                                                                        </div>
                                                                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                            {cat.statLabel}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        /* ─── TEAM POINTS TABLE VIEW ─── */
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto', backdropFilter: 'blur(20px)', marginTop: '20px' }}>
                            <div style={{ minWidth: '700px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 70px 70px 70px 70px 90px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>
                                    <span>#</span><span>Team</span><span>P</span><span>W</span><span>L</span><span>D</span><span>Pts</span>
                                </div>
                                {teamTable.length === 0 ? (
                                    <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                        No team standings available yet.
                                    </div>
                                ) : (
                                    teamTable.map((t, i) => {
                                        const badge = getRankBadge(i + 1);
                                        return (
                                            <div key={t.teamId} style={{
                                                display: 'grid', gridTemplateColumns: '60px 1fr 70px 70px 70px 70px 90px',
                                                padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                alignItems: 'center', transition: 'background 0.2s',
                                            }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    width: '32px', height: '32px', borderRadius: '10px',
                                                    background: badge.bg, color: badge.color, fontSize: '13px', fontWeight: 800,
                                                }}>
                                                    {i + 1 <= 3 ? badge.emoji : i + 1}
                                                </span>
                                                <div style={{ fontWeight: 700, fontSize: '15px' }}>{t.teamName}</div>
                                                <div style={{ color: '#94a3b8', fontWeight: 600 }}>{t.played}</div>
                                                <div style={{ color: '#22c55e', fontWeight: 700 }}>{t.wins}</div>
                                                <div style={{ color: '#ef4444', fontWeight: 700 }}>{t.losses}</div>
                                                <div style={{ color: '#94a3b8', fontWeight: 600 }}>{t.draws}</div>
                                                <div style={{ fontWeight: 900, fontSize: '18px', color: '#a78bfa' }}>{t.points}</div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Link href={`/tournaments/${tournamentId}`} style={{ color: '#a78bfa', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                            ← Back to Tournament
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════
    // GLOBAL LEADERBOARD (original)
    // ═══════════════════════════════════
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

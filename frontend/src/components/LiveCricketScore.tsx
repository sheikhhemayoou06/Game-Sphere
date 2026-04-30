'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/* ═══════════════════════════════════════════════════════════
   Multi-Sport Live Scores (Google-Style)
   — CricAPI for external cricket matches
   — Game Sphere internal API for all sports
   ═══════════════════════════════════════════════════════════ */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

/* ── Sport config ── */
const SPORT_CONFIG: Record<string, { icon: string; color: string }> = {
    Cricket: { icon: '🏏', color: '#3B82F6' },
    Football: { icon: '⚽', color: '#16A34A' },
    Basketball: { icon: '🏀', color: '#EA580C' },
    Tennis: { icon: '🎾', color: '#D97706' },
    Badminton: { icon: '🏸', color: '#E11D48' },
    Kabaddi: { icon: '🤼', color: '#0F766E' },
    Hockey: { icon: '🏑', color: '#2563EB' },
    Athletics: { icon: '🏃', color: '#EAB308' },
};

/* ── Types ── */
interface LiveMatch {
    id: string;
    sport: string;
    name: string;
    matchType: string;
    status: string;
    venue: string;
    date: string;
    isLive: boolean;
    source: 'internal';
    level: string;
    team1: { name: string; shortName: string; img: string; score: string; detail: string; isBatting?: boolean };
    team2: { name: string; shortName: string; img: string; score: string; detail: string; isBatting?: boolean };
}



/* ── Map Internal match (any sport) ── */
function mapInternalMatch(m: any): LiveMatch | null {
    if (!m) return null;
    const sportName = m.tournament?.sport?.name || m.sport?.name || 'Other';
    const isLive = m.status === 'LIVE' || m.status === 'IN_PROGRESS';
    const level = m.tournament?.level || 'LOCAL';
    return {
        id: m.id, sport: sportName, name: `${m.homeTeam?.name || 'TBD'} vs ${m.awayTeam?.name || 'TBD'}`,
        matchType: m.tournament?.name || sportName, status: m.status || 'Scheduled', venue: m.venue || m.tournament?.venue || '',
        date: m.scheduledAt || m.date || '', isLive, source: 'internal', level,
        team1: { name: m.homeTeam?.name || 'TBD', shortName: (m.homeTeam?.name || 'TBD').substring(0, 3).toUpperCase(), img: '', score: m.homeScore != null ? `${m.homeScore}` : '-', detail: '', },
        team2: { name: m.awayTeam?.name || 'TBD', shortName: (m.awayTeam?.name || 'TBD').substring(0, 3).toUpperCase(), img: '', score: m.awayScore != null ? `${m.awayScore}` : '-', detail: '', },
    };
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function LiveCricketScore() {
    const [matches, setMatches] = useState<LiveMatch[]>([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSport, setActiveSport] = useState<string>('All');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [activeTournament, setActiveTournament] = useState<string>('All');
    const [activeTeam, setActiveTeam] = useState<string>('All');
    const router = useRouter();

    /* ── Fetch both sources ── */
    const fetchLiveScores = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        setRefreshing(true);
        try {
            // Fetch internal Game Sphere matches (all sports)
            const internalRes = await fetch(`${API_BASE}/matches/live`).then(r => r.json()).catch(() => []);

            let allMatches: LiveMatch[] = [];

            if (Array.isArray(internalRes)) {
                const intMatches = internalRes
                    .map((m: any) => mapInternalMatch(m))
                    .filter(Boolean) as LiveMatch[];
                allMatches.push(...intMatches);
            }

            // Sort: live first, then recent
            allMatches.sort((a, b) => {
                if (a.isLive && !b.isLive) return -1;
                if (!a.isLive && b.isLive) return 1;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            setMatches(allMatches);
            setLastUpdated(new Date());
            setError(allMatches.length === 0 ? 'No matches available right now' : '');
        } catch (err) {
            console.error('Score fetch failed', err);
            setError('Failed to fetch live scores');
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLiveScores(true);
        const interval = setInterval(() => fetchLiveScores(false), 15000);
        return () => clearInterval(interval);
    }, [fetchLiveScores]);

    /* ── Loading ── */
    if (loading) {
        return (
            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Loading live scores...</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Get available sports for filter pills (always show all configured sports)
    const availableSports = ['All', ...Object.keys(SPORT_CONFIG)];

    // Match Category Heuristic
    const getMatchCategory = (m: LiveMatch) => {
        const lvl = m.level?.toUpperCase() || '';
        if (['STATE', 'NATIONAL', 'INTERNATIONAL', 'RECOGNISED'].includes(lvl)) return 'Recognised';
        return 'Local';
    };

    // Filter Pipeline
    const sportFiltered = activeSport === 'All' ? matches : matches.filter(m => m.sport === activeSport);
    const categoryFiltered = activeCategory === 'All' ? sportFiltered : sportFiltered.filter(m => getMatchCategory(m) === activeCategory);
    
    // Derived Tournaments
    const availableTournaments = Array.from(new Set(categoryFiltered.map(m => m.matchType))).filter(Boolean).sort();
    
    const tournamentFiltered = activeTournament === 'All' ? categoryFiltered : categoryFiltered.filter(m => m.matchType === activeTournament);

    // Derived Teams
    const availableTeams = Array.from(new Set(tournamentFiltered.flatMap(m => [m.team1.name, m.team2.name]))).filter(Boolean).sort();

    const teamFiltered = activeTeam === 'All' ? tournamentFiltered : tournamentFiltered.filter(m => 
        m.team1.name === activeTeam || m.team2.name === activeTeam || 
        m.team1.shortName === activeTeam || m.team2.shortName === activeTeam
    );

    const filteredMatches = searchQuery.trim()
        ? teamFiltered.filter(m => {
            const q = searchQuery.toLowerCase();
            return m.team1.name.toLowerCase().includes(q) || m.team2.name.toLowerCase().includes(q) ||
                m.team1.shortName.toLowerCase().includes(q) || m.team2.shortName.toLowerCase().includes(q) ||
                m.name.toLowerCase().includes(q) || m.venue.toLowerCase().includes(q) || m.sport.toLowerCase().includes(q);
        })
        : teamFiltered.slice(0, 8);

    const safeIdx = activeIdx < filteredMatches.length ? activeIdx : 0;
    const match = filteredMatches[safeIdx] || filteredMatches[0];
    const liveCount = filteredMatches.filter(m => m.isLive).length;
    const sportCfg = match ? (SPORT_CONFIG[match.sport] || { icon: '🏆', color: '#6366f1' }) : { icon: '🏆', color: '#6366f1' };

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

            {/* ── Filter Controls ── */}
            <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px',
                alignItems: 'center'
            }}>
                {/* Category Filters */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', scrollbarWidth: 'none', maxWidth: '100%' }}>
                    {['All', 'Recognised', 'Local'].map(cat => (
                        <button key={cat} onClick={() => { setActiveCategory(cat); setActiveTournament('All'); setActiveTeam('All'); setActiveIdx(0); }}
                            style={{
                                padding: '4px 10px', borderRadius: '16px', border: '1px solid', fontSize: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, whiteSpace: 'nowrap',
                                background: activeCategory === cat ? '#0f172a' : '#ffffff',
                                color: activeCategory === cat ? '#ffffff' : '#64748b',
                                borderColor: activeCategory === cat ? '#0f172a' : '#e2e8f0',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                    
                    {availableTournaments.length > 0 && (
                        <select
                            value={activeTournament}
                            onChange={(e) => { setActiveTournament(e.target.value); setActiveTeam('All'); setActiveIdx(0); }}
                            style={{
                                padding: '4px 24px 4px 10px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', color: activeTournament !== 'All' ? '#0f172a' : '#64748b',
                                fontSize: '10px', fontWeight: 700, outline: 'none', cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M8 11.5l-5-5h10l-5 5z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', textOverflow: 'ellipsis', maxWidth: '140px',
                            }}
                        >
                            <option value="All">All Tournaments</option>
                            {availableTournaments.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    )}

                    {activeTournament !== 'All' && availableTeams.length > 0 && (
                        <select
                            value={activeTeam}
                            onChange={(e) => { setActiveTeam(e.target.value); setActiveIdx(0); }}
                            style={{
                                padding: '4px 24px 4px 10px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', color: activeTeam !== 'All' ? '#0f172a' : '#64748b',
                                fontSize: '10px', fontWeight: 700, outline: 'none', cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M8 11.5l-5-5h10l-5 5z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', textOverflow: 'ellipsis', maxWidth: '120px',
                            }}
                        >
                            <option value="All">All Teams</option>
                            {availableTeams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    )}
                </div>

                {/* ── Sport Filter Pills ── */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'nowrap', width: '100%', maxWidth: '100%', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
                    {availableSports.map(sport => {
                        const cfg = SPORT_CONFIG[sport] || { icon: '🏆', color: '#6366f1' };
                        const isActive = activeSport === sport;
                        const count = sport === 'All' ? matches.length : matches.filter(m => m.sport === sport).length;
                        return (
                            <button
                                key={sport}
                                onClick={() => { setActiveSport(sport); setActiveCategory('All'); setActiveTournament('All'); setActiveTeam('All'); setActiveIdx(0); }}
                                style={{
                                    padding: '6px 12px', borderRadius: '20px', border: '1px solid',
                                    fontSize: '11px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px',
                                    background: isActive ? '#1e293b' : '#f1f5f9',
                                    color: isActive ? '#ffffff' : '#64748b',
                                    borderColor: isActive ? '#1e293b' : '#e2e8f0',
                                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                                }}
                            >
                                {sport === 'All' ? 'All' : sport}
                                <span style={{
                                    fontSize: '9px', background: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                                    padding: '1px 5px', borderRadius: '8px', fontWeight: 800,
                                }}>{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── No Results / Error ── */}
            {filteredMatches.length === 0 && (
                <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px dashed #cbd5e1', maxWidth: '500px', margin: '0 auto' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                        {error && matches.length === 0 ? error : (searchQuery ? `No matches found for "${searchQuery}"` : `No ${activeSport === 'All' ? 'live' : activeSport} matches right now`)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        Try a different search or sport filter
                    </div>
                </div>
            )}

            {/* ── Match Cards Carousel (Cricbuzz Style) ── */}
            {filteredMatches.length > 0 && (
                <div className="match-carousel" style={{ 
                    display: 'flex', gap: '16px', overflowX: 'auto', padding: '8px 4px 16px', 
                    scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
                    justifyContent: filteredMatches.length === 1 ? 'center' : 'flex-start'
                }}>
                    {filteredMatches.map(m => {
                        const mSportCfg = SPORT_CONFIG[m.sport] || { icon: '🏆', color: '#6366f1' };
                        return (
                            <div key={m.id} onClick={() => router.push(`/live-scores?matchId=${m.id}`)} style={{
                                background: '#ffffff', borderRadius: '16px', overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                border: '1px solid #e2e8f0', flexShrink: 0,
                                width: '320px', scrollSnapAlign: 'start',
                                cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                                display: 'flex', flexDirection: 'column'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                            >
                                {/* Card Header */}
                                <div style={{
                                    padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                        {/* Sport Badge */}
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            background: `${mSportCfg.color}12`, color: mSportCfg.color,
                                            fontSize: '10px', fontWeight: 800, padding: '3px 8px',
                                            borderRadius: '4px', flexShrink: 0,
                                        }}>
                                            {m.sport}
                                        </span>
                                        {m.isLive ? (
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                background: '#fef2f2', color: '#dc2626', fontSize: '10px',
                                                fontWeight: 800, padding: '3px 8px', borderRadius: '4px',
                                                textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0,
                                            }}>
                                                LIVE
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                                                RESULT
                                            </span>
                                        )}
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {m.matchType}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                        {refreshing && <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />}
                                    </div>
                                </div>

                                {/* Scoreboard */}
                                <div style={{ padding: '14px 16px', flex: 1 }}>
                                    <ScoreRow team={m.team1} sport={m.sport} />
                                    <div style={{ height: '1px', background: '#f1f5f9', margin: '10px 0' }} />
                                    <ScoreRow team={m.team2} sport={m.sport} />
                                </div>

                                {/* Footer */}
                                <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: m.isLive ? '#dc2626' : '#16a34a', lineHeight: 1.4 }}>
                                        {m.status}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                                            {m.venue && `📍 ${m.venue}`}
                                        </span>
                                        {lastUpdated && (
                                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>
                                                🔄 {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* View All Link */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <Link href="/live-scores" style={{
                    fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 700,
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: 'rgba(255,255,255,0.12)', padding: '8px 18px', borderRadius: '20px',
                    transition: 'all 0.2s',
                }}>
                    View All Matches & Scorecards →
                </Link>
            </div>

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SCORE ROW — Sport-Agnostic
   ═══════════════════════════════════════════════════════════ */

function ScoreRow({ team, sport }: { team: LiveMatch['team1']; sport: string }) {
    const isDefaultImg = !team.img || team.img.includes('icon512.png');
    const sportCfg = SPORT_CONFIG[sport] || { icon: '🏆', color: '#6366f1' };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    flexShrink: 0, border: '1px solid #e2e8f0',
                }}>
                    {isDefaultImg ? (
                        <span style={{ fontSize: '13px', fontWeight: 900, color: sportCfg.color }}>{team.shortName.substring(0, 2)}</span>
                    ) : (
                        <img src={team.img} alt={team.shortName} style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {team.shortName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                        {team.name}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexShrink: 0 }}>
                {team.score !== '-' && team.score !== '0' ? (
                    <>
                        <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{team.score}</span>
                        {team.detail && <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginLeft: '2px' }}>{team.detail}</span>}
                    </>
                ) : team.score === '0' ? (
                    <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>0</span>
                ) : (
                    <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>-</span>
                )}
            </div>
        </div>
    );
}

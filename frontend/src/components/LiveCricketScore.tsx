'use client';

import { useEffect, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════
   Multi-Sport Live Scores (Google-Style)
   — CricAPI for external cricket matches
   — Game Sphere internal API for all sports
   ═══════════════════════════════════════════════════════════ */

const CRICAPI_KEY = 'c96e46df-0777-40cf-b456-81bdf44dd874';
const CRICAPI_URL = `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`;
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
    source: 'cricapi' | 'internal';
    team1: { name: string; shortName: string; img: string; score: string; detail: string; isBatting?: boolean };
    team2: { name: string; shortName: string; img: string; score: string; detail: string; isBatting?: boolean };
}

/* ── Map CricAPI match ── */
function mapCricAPIMatch(m: any): LiveMatch | null {
    if (!m || !m.teamInfo || m.teamInfo.length < 2) return null;
    const t1 = m.teamInfo[0], t2 = m.teamInfo[1];
    const scores = m.score || [];
    const findInnings = (name: string) => scores.find((s: any) => s.inning?.toLowerCase().startsWith(name.toLowerCase())) || null;
    const s1 = findInnings(t1.name), s2 = findInnings(t2.name);
    const isLive = m.matchStarted === true && m.matchEnded === false;
    let t1Bat = false, t2Bat = false;
    if (isLive) { if (scores.length === 1) { if (s1) t1Bat = true; else t2Bat = true; } else if (scores.length >= 2) t2Bat = true; }
    return {
        id: m.id, sport: 'Cricket', name: m.name || `${t1.name} vs ${t2.name}`,
        matchType: (m.matchType || 't20').toUpperCase(), status: m.status || '', venue: m.venue || '',
        date: m.date || '', isLive, source: 'cricapi',
        team1: { name: t1.name, shortName: t1.shortname || t1.name.substring(0, 3).toUpperCase(), img: t1.img || '', score: s1 ? `${s1.r}/${s1.w}` : '-', detail: s1 ? `(${s1.o} ov)` : '', isBatting: t1Bat },
        team2: { name: t2.name, shortName: t2.shortname || t2.name.substring(0, 3).toUpperCase(), img: t2.img || '', score: s2 ? `${s2.r}/${s2.w}` : '-', detail: s2 ? `(${s2.o} ov)` : '', isBatting: t2Bat },
    };
}

/* ── Map Internal match (any sport) ── */
function mapInternalMatch(m: any): LiveMatch | null {
    if (!m) return null;
    const sportName = m.tournament?.sport?.name || m.sport?.name || 'Other';
    const isLive = m.status === 'LIVE' || m.status === 'IN_PROGRESS';
    return {
        id: m.id, sport: sportName, name: `${m.homeTeam?.name || 'TBD'} vs ${m.awayTeam?.name || 'TBD'}`,
        matchType: m.tournament?.name || sportName, status: m.status || 'Scheduled', venue: m.venue || m.tournament?.venue || '',
        date: m.scheduledAt || m.date || '', isLive, source: 'internal',
        team1: { name: m.homeTeam?.name || 'TBD', shortName: (m.homeTeam?.name || 'TBD').substring(0, 3).toUpperCase(), img: '', score: `${m.homeScore ?? 0}`, detail: '', },
        team2: { name: m.awayTeam?.name || 'TBD', shortName: (m.awayTeam?.name || 'TBD').substring(0, 3).toUpperCase(), img: '', score: `${m.awayScore ?? 0}`, detail: '', },
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

    /* ── Fetch both sources ── */
    const fetchLiveScores = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        setRefreshing(true);
        try {
            // Fetch both sources in parallel
            const [cricRes, internalRes] = await Promise.allSettled([
                fetch(CRICAPI_URL).then(r => r.json()),
                fetch(`${API_BASE}/matches/live`).then(r => r.json()).catch(() => []),
            ]);

            let allMatches: LiveMatch[] = [];

            // CricAPI matches
            if (cricRes.status === 'fulfilled' && cricRes.value?.data) {
                const cricMatches = cricRes.value.data
                    .map((m: any) => mapCricAPIMatch(m))
                    .filter(Boolean) as LiveMatch[];
                allMatches.push(...cricMatches);
            }

            // Internal Game Sphere matches (all sports)
            if (internalRes.status === 'fulfilled' && Array.isArray(internalRes.value)) {
                const intMatches = internalRes.value
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

    /* ── Error / Empty ── */
    if (error && matches.length === 0) {
        return (
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '28px 16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{error}</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>Check back soon for live updates</div>
            </div>
        );
    }

    // Get available sports for filter pills
    const availableSports = ['All', ...Array.from(new Set(matches.map(m => m.sport)))];

    // Filter by sport
    const sportFiltered = activeSport === 'All' ? matches : matches.filter(m => m.sport === activeSport);

    // Then filter by search
    const filteredMatches = searchQuery.trim()
        ? sportFiltered.filter(m => {
            const q = searchQuery.toLowerCase();
            return m.team1.name.toLowerCase().includes(q) || m.team2.name.toLowerCase().includes(q) ||
                m.team1.shortName.toLowerCase().includes(q) || m.team2.shortName.toLowerCase().includes(q) ||
                m.name.toLowerCase().includes(q) || m.venue.toLowerCase().includes(q) || m.sport.toLowerCase().includes(q);
        })
        : sportFiltered.slice(0, 8);

    const safeIdx = activeIdx < filteredMatches.length ? activeIdx : 0;
    const match = filteredMatches[safeIdx] || filteredMatches[0];
    const liveCount = filteredMatches.filter(m => m.isLive).length;
    const sportCfg = match ? (SPORT_CONFIG[match.sport] || { icon: '🏆', color: '#6366f1' }) : { icon: '🏆', color: '#6366f1' };

    return (
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>

            {/* ── Search Bar ── */}
            <div style={{ marginBottom: '10px' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.95)',
                    borderRadius: '12px', padding: '0 14px', gap: '10px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.3)',
                }}>
                    <span style={{ color: '#94a3b8', fontSize: '16px', flexShrink: 0 }}>🔍</span>
                    <input
                        type="text" value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setActiveIdx(0); }}
                        placeholder="Search matches, teams, sports, venues..."
                        style={{ flex: 1, padding: '12px 0', border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}
                    />
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setActiveIdx(0); }}
                            style={{ background: '#e2e8f0', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px', color: '#64748b', fontWeight: 800, flexShrink: 0 }}>
                            ✕
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: '4px', fontWeight: 600 }}>
                        {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''} found
                    </div>
                )}
            </div>

            {/* ── Sport Filter Pills ── */}
            <div style={{
                display: 'flex', gap: '6px', marginBottom: '10px',
                justifyContent: 'center', flexWrap: 'wrap',
            }}>
                {availableSports.map(sport => {
                    const cfg = SPORT_CONFIG[sport] || { icon: '🏆', color: '#6366f1' };
                    const isActive = activeSport === sport;
                    const count = sport === 'All' ? matches.length : matches.filter(m => m.sport === sport).length;
                    return (
                        <button
                            key={sport}
                            onClick={() => { setActiveSport(sport); setActiveIdx(0); }}
                            style={{
                                padding: '6px 12px', borderRadius: '20px', border: 'none',
                                fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px',
                                background: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)',
                                color: isActive ? '#1e293b' : 'rgba(255,255,255,0.8)',
                                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                            }}
                        >
                            <span style={{ fontSize: '13px' }}>{sport === 'All' ? '🏆' : cfg.icon}</span>
                            {sport === 'All' ? 'All' : sport}
                            <span style={{
                                fontSize: '9px', background: isActive ? '#e2e8f0' : 'rgba(255,255,255,0.15)',
                                padding: '1px 5px', borderRadius: '8px', fontWeight: 800,
                            }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Match Tabs ── */}
            {filteredMatches.length > 1 && (
                <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {filteredMatches.slice(0, 8).map((m, i) => (
                        <button key={m.id} onClick={() => setActiveIdx(i)}
                            style={{
                                padding: '4px 10px', borderRadius: '16px', border: 'none',
                                fontSize: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                background: safeIdx === i ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.12)',
                                color: safeIdx === i ? '#1e293b' : 'rgba(255,255,255,0.7)',
                                boxShadow: safeIdx === i ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
                                display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                            {m.isLive && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444' }} />}
                            <span style={{ fontSize: '11px' }}>{(SPORT_CONFIG[m.sport] || { icon: '🏆' }).icon}</span>
                            {m.team1.shortName} v {m.team2.shortName}
                        </button>
                    ))}
                </div>
            )}

            {/* ── No Results ── */}
            {filteredMatches.length === 0 && (
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                        {searchQuery ? `No matches found for "${searchQuery}"` : `No ${activeSport} matches right now`}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                        Try a different search or sport filter
                    </div>
                </div>
            )}

            {/* ── Main Score Card ── */}
            {match && <div style={{
                background: '#ffffff', borderRadius: '16px', overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255,255,255,0.3)',
            }}>
                {/* Card Header */}
                <div style={{
                    padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        {/* Sport Badge */}
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: `${sportCfg.color}12`, color: sportCfg.color,
                            fontSize: '10px', fontWeight: 800, padding: '3px 8px',
                            borderRadius: '4px', flexShrink: 0,
                        }}>
                            <span style={{ fontSize: '12px' }}>{sportCfg.icon}</span>
                            {match.sport}
                        </span>
                        {match.isLive ? (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                background: '#fef2f2', color: '#dc2626', fontSize: '10px',
                                fontWeight: 800, padding: '3px 8px', borderRadius: '4px',
                                textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0,
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', animation: 'pulse 1.5s infinite' }} />
                                LIVE
                            </span>
                        ) : (
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                                RESULT
                            </span>
                        )}
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {match.matchType}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {refreshing && <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />}
                        {liveCount > 0 && <span style={{ fontSize: '10px', fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>{liveCount} Live</span>}
                    </div>
                </div>

                {/* Scoreboard */}
                <div style={{ padding: '14px 16px' }}>
                    <ScoreRow team={match.team1} sport={match.sport} />
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '10px 0' }} />
                    <ScoreRow team={match.team2} sport={match.sport} />
                </div>

                {/* Footer */}
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: match.isLive ? '#dc2626' : '#16a34a', lineHeight: 1.4 }}>
                        {match.status}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                            {match.venue && `📍 ${match.venue}`}
                        </span>
                        {lastUpdated && (
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>
                                🔄 {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </span>
                        )}
                    </div>
                </div>
            </div>}

            {/* Powered by */}
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.5px' }}>
                    POWERED BY CRICAPI + GAME SPHERE • AUTO-REFRESHES EVERY 15s
                </span>
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
                        {team.isBatting && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />}
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

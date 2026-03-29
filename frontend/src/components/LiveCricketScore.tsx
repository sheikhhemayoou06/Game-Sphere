'use client';

import { useEffect, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════
   CricAPI — Live Cricket Score (Google-Style)
   API: https://api.cricapi.com/v1/currentMatches
   ═══════════════════════════════════════════════════════════ */

const CRICAPI_KEY = 'c96e46df-0777-40cf-b456-81bdf44dd874';
const CRICAPI_URL = `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`;

/* ── Types ── */

interface TeamInnings {
    name: string;
    shortName: string;
    img: string;
    runs: number;
    wickets: number;
    overs: number;
    isBatting: boolean;
}

interface LiveMatch {
    id: string;
    name: string;
    matchType: string;
    status: string;
    venue: string;
    date: string;
    isLive: boolean;
    team1: TeamInnings;
    team2: TeamInnings;
}

/* ── Map CricAPI response to our interface ── */

function mapCricAPIMatch(m: any): LiveMatch | null {
    if (!m || !m.teamInfo || m.teamInfo.length < 2) return null;

    const t1Info = m.teamInfo[0];
    const t2Info = m.teamInfo[1];

    // Parse scores — CricAPI returns an array of innings objects
    const scores = m.score || [];

    // Find innings for each team by matching team name in inning string
    const findInnings = (teamName: string) => {
        // Try to match by team name (case-insensitive) at the START of the inning string
        const found = scores.find((s: any) =>
            s.inning?.toLowerCase().startsWith(teamName.toLowerCase())
        );
        return found || null;
    };

    const t1Score = findInnings(t1Info.name);
    const t2Score = findInnings(t2Info.name);

    const isLive = m.matchStarted === true && m.matchEnded === false;

    // Determine who is currently batting for live matches
    // The team with fewer completed overs is likely batting, OR the second team in the innings order
    let t1Batting = false;
    let t2Batting = false;
    if (isLive) {
        if (scores.length === 1) {
            // Only one innings — that team is batting
            if (t1Score) t1Batting = true;
            else t2Batting = true;
        } else if (scores.length >= 2) {
            // Two innings — the second team is batting (chasing)
            t2Batting = true;
        }
    }

    return {
        id: m.id,
        name: m.name || `${t1Info.name} vs ${t2Info.name}`,
        matchType: (m.matchType || 't20').toUpperCase(),
        status: m.status || '',
        venue: m.venue || '',
        date: m.date || '',
        isLive,
        team1: {
            name: t1Info.name,
            shortName: t1Info.shortname || t1Info.name.substring(0, 3).toUpperCase(),
            img: t1Info.img || '',
            runs: t1Score?.r ?? 0,
            wickets: t1Score?.w ?? 0,
            overs: t1Score?.o ?? 0,
            isBatting: t1Batting,
        },
        team2: {
            name: t2Info.name,
            shortName: t2Info.shortname || t2Info.name.substring(0, 3).toUpperCase(),
            img: t2Info.img || '',
            runs: t2Score?.r ?? 0,
            wickets: t2Score?.w ?? 0,
            overs: t2Score?.o ?? 0,
            isBatting: t2Batting,
        },
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

    /* ── Fetch from CricAPI ── */
    const fetchLiveScores = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        setRefreshing(true);
        try {
            const res = await fetch(CRICAPI_URL);
            const json = await res.json();

            if (json.status !== 'success' || !json.data) {
                setError('Could not load match data');
                return;
            }

            const mapped: LiveMatch[] = json.data
                .map((m: any) => mapCricAPIMatch(m))
                .filter(Boolean) as LiveMatch[];

            // Sort: live matches first, then most recent completed
            mapped.sort((a, b) => {
                if (a.isLive && !b.isLive) return -1;
                if (!a.isLive && b.isLive) return 1;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            // Store all matches
            setMatches(mapped);
            setLastUpdated(new Date());
            setError('');
        } catch (err) {
            console.error('CricAPI fetch failed', err);
            setError('Failed to fetch live scores');
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }, []);

    /* ── Initial fetch + Auto-refresh every 15 seconds ── */
    useEffect(() => {
        fetchLiveScores(true);
        const interval = setInterval(() => fetchLiveScores(false), 15000);
        return () => clearInterval(interval);
    }, [fetchLiveScores]);

    /* ── Loading State ── */
    if (loading) {
        return (
            <div style={{
                background: 'rgba(255,255,255,0.95)', borderRadius: '16px',
                padding: '32px', textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}>
                <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    border: '3px solid #e2e8f0', borderTopColor: '#6366f1',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
                }} />
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Loading live scores...</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    /* ── Error / Empty State ── */
    if (error || matches.length === 0) {
        return (
            <div style={{
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
                borderRadius: '16px', padding: '28px 16px', textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.2)', color: 'white',
            }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏏</div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
                    {error || 'No matches available right now'}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>Check back soon for live updates</div>
            </div>
        );
    }

    // Filter matches based on search
    const filteredMatches = searchQuery.trim()
        ? matches.filter(m => {
            const q = searchQuery.toLowerCase();
            return (
                m.team1.name.toLowerCase().includes(q) ||
                m.team2.name.toLowerCase().includes(q) ||
                m.team1.shortName.toLowerCase().includes(q) ||
                m.team2.shortName.toLowerCase().includes(q) ||
                m.name.toLowerCase().includes(q) ||
                m.venue.toLowerCase().includes(q)
            );
        })
        : matches.slice(0, 6); // Show top 6 by default, all when searching

    const safeIdx = activeIdx < filteredMatches.length ? activeIdx : 0;
    const match = filteredMatches[safeIdx] || filteredMatches[0];
    const liveCount = filteredMatches.filter(m => m.isLive).length;

    return (
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
            {/* ── Search Bar ── */}
            <div style={{
                marginBottom: '10px',
                position: 'relative',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center',
                    background: 'rgba(255,255,255,0.95)', borderRadius: '12px',
                    padding: '0 14px', gap: '10px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(255,255,255,0.3)',
                }}>
                    <span style={{ color: '#94a3b8', fontSize: '16px', flexShrink: 0 }}>🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setActiveIdx(0); }}
                        placeholder="Search matches, teams, venues..."
                        style={{
                            flex: 1, padding: '12px 0', border: 'none', outline: 'none',
                            background: 'transparent', fontSize: '13px', fontWeight: 600,
                            color: '#1e293b',
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(''); setActiveIdx(0); }}
                            style={{
                                background: '#e2e8f0', border: 'none', borderRadius: '50%',
                                width: '20px', height: '20px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', fontSize: '11px', color: '#64748b',
                                fontWeight: 800, flexShrink: 0,
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <div style={{
                        fontSize: '10px', color: 'rgba(255,255,255,0.6)',
                        textAlign: 'center', marginTop: '4px', fontWeight: 600,
                    }}>
                        {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''} found
                    </div>
                )}
            </div>
            {/* ── Match Tab Selector ── */}
            {filteredMatches.length > 1 && (
                <div style={{
                    display: 'flex', gap: '6px', marginBottom: '8px',
                    justifyContent: 'center', flexWrap: 'wrap',
                }}>
                    {filteredMatches.map((m, i) => (
                        <button
                            key={m.id}
                            onClick={() => setActiveIdx(i)}
                            style={{
                                padding: '5px 12px', borderRadius: '20px', border: 'none',
                                fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: safeIdx === i
                                    ? 'rgba(255,255,255,0.95)'
                                    : 'rgba(255,255,255,0.15)',
                                color: safeIdx === i ? '#1e293b' : 'rgba(255,255,255,0.8)',
                                boxShadow: safeIdx === i ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                                display: 'flex', alignItems: 'center', gap: '4px',
                            }}
                        >
                            {m.isLive && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />}
                            {m.team1.shortName} v {m.team2.shortName}
                        </button>
                    ))}
                </div>
            )}

            {/* No results message */}
            {filteredMatches.length === 0 && searchQuery && (
                <div style={{
                    background: 'rgba(255,255,255,0.1)', borderRadius: '12px',
                    padding: '24px', textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.15)',
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏏</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                        No matches found for &quot;{searchQuery}&quot;
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                        Try a different team name or venue
                    </div>
                </div>
            )}

            {/* ── Main Score Card ── */}
            {match && <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255,255,255,0.3)',
            }}>
                {/* ── Card Header ── */}
                <div style={{
                    padding: '10px 16px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        {match.isLive ? (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                background: '#fef2f2', color: '#dc2626',
                                fontSize: '10px', fontWeight: 800, padding: '3px 8px',
                                borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px',
                                flexShrink: 0,
                            }}>
                                <span style={{
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    background: '#dc2626',
                                    animation: 'pulse 1.5s infinite',
                                }} />
                                LIVE
                            </span>
                        ) : (
                            <span style={{
                                fontSize: '10px', fontWeight: 800, padding: '3px 8px',
                                borderRadius: '4px', background: '#f0fdf4', color: '#16a34a',
                                textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0,
                            }}>
                                RESULT
                            </span>
                        )}
                        <span style={{
                            fontSize: '11px', fontWeight: 600, color: '#64748b',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {match.matchType} • {match.name.split(',').slice(1).join(',').trim() || match.name}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {refreshing && (
                            <div style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                border: '2px solid #e2e8f0', borderTopColor: '#6366f1',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                        )}
                        {liveCount > 0 && (
                            <span style={{
                                fontSize: '10px', fontWeight: 700, color: '#dc2626',
                                background: '#fef2f2', padding: '2px 6px', borderRadius: '4px',
                            }}>
                                {liveCount} Live
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Scoreboard ── */}
                <div style={{ padding: '14px 16px' }}>
                    <TeamRow team={match.team1} />
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '10px 0' }} />
                    <TeamRow team={match.team2} />
                </div>

                {/* ── Footer Status ── */}
                <div style={{
                    padding: '10px 16px',
                    background: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                }}>
                    <div style={{
                        fontSize: '12px', fontWeight: 600,
                        color: match.isLive ? '#dc2626' : '#16a34a',
                        lineHeight: 1.4,
                    }}>
                        {match.status}
                    </div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginTop: '6px',
                    }}>
                        <span style={{
                            fontSize: '10px', color: '#94a3b8', fontWeight: 500,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            maxWidth: '60%',
                        }}>
                            📍 {match.venue}
                        </span>
                        {lastUpdated && (
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>
                                🔄 {lastUpdated.toLocaleTimeString('en-IN', {
                                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
                                })}
                            </span>
                        )}
                    </div>
                </div>
            </div>}

            {/* ── Powered by badge ── */}
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{
                    fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 600,
                    letterSpacing: '0.5px',
                }}>
                    POWERED BY CRICAPI • AUTO-REFRESHES EVERY 15s
                </span>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   TEAM ROW SUB-COMPONENT
   ═══════════════════════════════════════════════════════════ */

function TeamRow({ team }: { team: TeamInnings }) {
    const isDefaultImg = !team.img || team.img.includes('icon512.png');

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 0',
        }}>
            {/* Left: Logo + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                {/* Team Logo */}
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                    border: '1px solid #e2e8f0',
                }}>
                    {isDefaultImg ? (
                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#6366f1' }}>
                            {team.shortName.substring(0, 2)}
                        </span>
                    ) : (
                        <img
                            src={team.img}
                            alt={team.shortName}
                            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    )}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        fontSize: '14px', fontWeight: 800, color: '#1e293b',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        {team.shortName}
                        {team.isBatting && (
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: '#22c55e', flexShrink: 0,
                            }} />
                        )}
                    </div>
                    <div style={{
                        fontSize: '11px', color: '#94a3b8', fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        maxWidth: '140px',
                    }}>
                        {team.name}
                    </div>
                </div>
            </div>

            {/* Right: Score */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexShrink: 0 }}>
                {(team.runs > 0 || team.overs > 0 || team.isBatting) ? (
                    <>
                        <span style={{
                            fontSize: '22px', fontWeight: 900, color: '#0f172a',
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            {team.runs}/{team.wickets}
                        </span>
                        <span style={{
                            fontSize: '12px', fontWeight: 600, color: '#64748b',
                            marginLeft: '2px',
                        }}>
                            ({team.overs})
                        </span>
                    </>
                ) : (
                    <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>
                        Yet to bat
                    </span>
                )}
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════
   MOCK IPL DATA — Replace with CricAPI fetch when ready
   ═══════════════════════════════════════════════════════════ */

interface TeamInnings {
    name: string;
    shortName: string;
    logo: string; // emoji/flag placeholder
    color: string;
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    isBatting: boolean;
}

interface LiveMatch {
    id: string;
    series: string;
    matchNo: string;
    venue: string;
    status: 'live' | 'completed' | 'upcoming';
    statusText: string;
    team1: TeamInnings;
    team2: TeamInnings;
    currentRunRate: number;
    requiredRunRate: number | null;
}

const MOCK_MATCHES: LiveMatch[] = [
    {
        id: '1',
        series: 'TATA IPL 2026',
        matchNo: 'Match 24',
        venue: 'M.A. Chidambaram Stadium, Chennai',
        status: 'live',
        statusText: 'CSK need 42 runs in 28 balls',
        team1: {
            name: 'Royal Challengers Bengaluru',
            shortName: 'RCB',
            logo: '🔴',
            color: '#E4002B',
            runs: 186,
            wickets: 5,
            overs: 20,
            balls: 0,
            isBatting: false,
        },
        team2: {
            name: 'Chennai Super Kings',
            shortName: 'CSK',
            logo: '🟡',
            color: '#FCCA0A',
            runs: 145,
            wickets: 3,
            overs: 15,
            balls: 2,
            isBatting: true,
        },
        currentRunRate: 9.57,
        requiredRunRate: 10.5,
    },
    {
        id: '2',
        series: 'TATA IPL 2026',
        matchNo: 'Match 25',
        venue: 'Wankhede Stadium, Mumbai',
        status: 'live',
        statusText: 'MI won the toss and chose to bat',
        team1: {
            name: 'Mumbai Indians',
            shortName: 'MI',
            logo: '🔵',
            color: '#004BA0',
            runs: 78,
            wickets: 2,
            overs: 8,
            balls: 4,
            isBatting: true,
        },
        team2: {
            name: 'Kolkata Knight Riders',
            shortName: 'KKR',
            logo: '🟣',
            color: '#3A225D',
            runs: 0,
            wickets: 0,
            overs: 0,
            balls: 0,
            isBatting: false,
        },
        currentRunRate: 9.18,
        requiredRunRate: null,
    },
    {
        id: '3',
        series: 'TATA IPL 2026',
        matchNo: 'Match 23',
        venue: 'Narendra Modi Stadium, Ahmedabad',
        status: 'completed',
        statusText: 'GT won by 6 wickets',
        team1: {
            name: 'Rajasthan Royals',
            shortName: 'RR',
            logo: '🩷',
            color: '#EA1A85',
            runs: 158,
            wickets: 8,
            overs: 20,
            balls: 0,
            isBatting: false,
        },
        team2: {
            name: 'Gujarat Titans',
            shortName: 'GT',
            logo: '🔷',
            color: '#1C1C2B',
            runs: 162,
            wickets: 4,
            overs: 18,
            balls: 3,
            isBatting: false,
        },
        currentRunRate: 0,
        requiredRunRate: null,
    },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function LiveCricketScore() {
    const [matches, setMatches] = useState<LiveMatch[]>(MOCK_MATCHES);
    const [activeIdx, setActiveIdx] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);

    /* ── CricAPI Fetch (replace MOCK with your real API) ── */
    const fetchLiveScores = useCallback(async () => {
        setRefreshing(true);
        try {
            /*
             * ══ CricAPI Integration Point ══
             * Uncomment and replace with your actual CricAPI endpoint and key:
             *
             * const res = await fetch('https://api.cricapi.com/v1/currentMatches?apikey=YOUR_API_KEY&offset=0');
             * const data = await res.json();
             * const mapped = data.data?.map((m: any) => mapCricAPIToLiveMatch(m)).filter(Boolean) || [];
             * setMatches(mapped.length > 0 ? mapped : MOCK_MATCHES);
             */

            // Simulate slight score randomization for demo
            setMatches(prev =>
                prev.map(m => {
                    if (m.status !== 'live') return m;
                    const battingTeam = m.team1.isBatting ? 'team1' : 'team2';
                    const addRuns = Math.floor(Math.random() * 7); // 0-6 runs
                    const newBall = (m[battingTeam].balls + 1) % 6;
                    const newOver = newBall === 0 ? m[battingTeam].overs + 1 : m[battingTeam].overs;
                    return {
                        ...m,
                        [battingTeam]: {
                            ...m[battingTeam],
                            runs: m[battingTeam].runs + addRuns,
                            overs: newOver,
                            balls: newBall,
                        },
                    };
                })
            );
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to refresh live scores', err);
        } finally {
            setRefreshing(false);
        }
    }, []);

    /* ── Auto-refresh every 10 seconds ── */
    useEffect(() => {
        const interval = setInterval(fetchLiveScores, 10000);
        return () => clearInterval(interval);
    }, [fetchLiveScores]);

    const match = matches[activeIdx] || matches[0];
    if (!match) return null;

    const formatOvers = (t: TeamInnings) =>
        t.balls === 0 ? `${t.overs}` : `${t.overs}.${t.balls}`;

    return (
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
            {/* ── Tab Selector (Multiple Matches) ── */}
            {matches.length > 1 && (
                <div style={{
                    display: 'flex', gap: '6px', marginBottom: '8px', justifyContent: 'center',
                }}>
                    {matches.map((m, i) => (
                        <button
                            key={m.id}
                            onClick={() => setActiveIdx(i)}
                            style={{
                                padding: '5px 14px', borderRadius: '20px', border: 'none',
                                fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: activeIdx === i
                                    ? 'rgba(255,255,255,0.95)'
                                    : 'rgba(255,255,255,0.15)',
                                color: activeIdx === i ? '#1e293b' : 'rgba(255,255,255,0.8)',
                                boxShadow: activeIdx === i ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                            }}
                        >
                            {m.team1.shortName} vs {m.team2.shortName}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Main Card ── */}
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255,255,255,0.3)',
            }}>
                {/* ── Card Header ── */}
                <div style={{
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {match.status === 'live' && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                background: '#fef2f2', color: '#dc2626',
                                fontSize: '10px', fontWeight: 800, padding: '3px 8px',
                                borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px',
                            }}>
                                <span style={{
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    background: '#dc2626',
                                    animation: 'pulse 1.5s infinite',
                                }} />
                                LIVE
                            </span>
                        )}
                        {match.status === 'completed' && (
                            <span style={{
                                fontSize: '10px', fontWeight: 800, padding: '3px 8px',
                                borderRadius: '4px', background: '#f0fdf4', color: '#16a34a',
                                textTransform: 'uppercase', letterSpacing: '0.5px',
                            }}>
                                RESULT
                            </span>
                        )}
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                            {match.series} • {match.matchNo}
                        </span>
                    </div>
                    {refreshing && (
                        <div style={{
                            width: '12px', height: '12px', borderRadius: '50%',
                            border: '2px solid #e2e8f0', borderTopColor: '#6366f1',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                    )}
                </div>

                {/* ── Scoreboard ── */}
                <div style={{ padding: '16px' }}>
                    {/* Team 1 Row */}
                    <TeamRow team={match.team1} formatOvers={formatOvers} />

                    {/* Separator */}
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '10px 0' }} />

                    {/* Team 2 Row */}
                    <TeamRow team={match.team2} formatOvers={formatOvers} />
                </div>

                {/* ── Footer Status ── */}
                <div style={{
                    padding: '10px 16px',
                    background: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                }}>
                    <div style={{
                        fontSize: '12px', fontWeight: 600,
                        color: match.status === 'live' ? '#dc2626' : '#16a34a',
                        lineHeight: 1.4,
                    }}>
                        {match.statusText}
                    </div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginTop: '6px',
                    }}>
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>
                            {match.venue}
                        </span>
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>
                            Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </span>
                    </div>

                    {/* Run Rate Row */}
                    {match.status === 'live' && (
                        <div style={{
                            display: 'flex', gap: '16px', marginTop: '8px',
                            paddingTop: '8px', borderTop: '1px solid #e2e8f0',
                        }}>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                                CRR: <span style={{ color: '#1e293b', fontWeight: 800 }}>{match.currentRunRate.toFixed(2)}</span>
                            </span>
                            {match.requiredRunRate && (
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                                    RRR: <span style={{ color: '#dc2626', fontWeight: 800 }}>{match.requiredRunRate.toFixed(2)}</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Pulse animation keyframe */}
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

function TeamRow({ team, formatOvers }: { team: TeamInnings; formatOvers: (t: TeamInnings) => string }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 0',
        }}>
            {/* Left: Logo + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                {/* Team Logo/Emoji */}
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: `${team.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                    border: `1.5px solid ${team.color}30`,
                }}>
                    {team.logo}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        fontSize: '14px', fontWeight: 800, color: '#1e293b',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {team.shortName}
                    </div>
                    <div style={{
                        fontSize: '11px', color: '#94a3b8', fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
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
                            ({formatOvers(team)})
                        </span>
                        {team.isBatting && (
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: '#22c55e', marginLeft: '4px', flexShrink: 0,
                            }} />
                        )}
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

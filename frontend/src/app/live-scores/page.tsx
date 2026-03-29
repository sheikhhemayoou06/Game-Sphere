'use client';

import { useEffect, useState, useCallback } from 'react';
import PageNavbar from '@/components/PageNavbar';

/* ═══════════════════════════════════════════════════════════
   MATCH CENTER — Google-Style Full Scorecard Page
   ═══════════════════════════════════════════════════════════ */

const CRICAPI_KEY = 'c96e46df-0777-40cf-b456-81bdf44dd874';
const CRICAPI_MATCHES = `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`;
const CRICAPI_SCORECARD = (id: string) => `https://api.cricapi.com/v1/match_scorecard?apikey=${CRICAPI_KEY}&id=${id}`;

type ViewTab = 'live' | 'completed' | 'upcoming';
type DetailTab = 'scorecard' | 'squads' | 'info';

interface MatchSummary {
    id: string; name: string; matchType: string; status: string; venue: string;
    date: string; isLive: boolean; isCompleted: boolean; isUpcoming: boolean;
    teams: string[];
    teamInfo: { name: string; shortname: string; img: string }[];
    score: { r: number; w: number; o: number; inning: string }[];
    hasSquad: boolean;
}

export default function LiveScoresPage() {
    const [matches, setMatches] = useState<MatchSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewTab, setViewTab] = useState<ViewTab>('live');
    const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
    const [detailTab, setDetailTab] = useState<DetailTab>('scorecard');
    const [scorecardData, setScorecardData] = useState<any>(null);
    const [scorecardLoading, setScorecardLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    /* ── Fetch all matches ── */
    const fetchMatches = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(CRICAPI_MATCHES);
            const json = await res.json();
            if (json.status === 'success' && json.data) {
                const mapped: MatchSummary[] = json.data
                    .filter((m: any) => m.teamInfo && m.teamInfo.length >= 2)
                    .map((m: any) => ({
                        id: m.id, name: m.name || '', matchType: (m.matchType || 't20').toUpperCase(),
                        status: m.status || '', venue: m.venue || '', date: m.date || '',
                        isLive: m.matchStarted && !m.matchEnded,
                        isCompleted: m.matchStarted && m.matchEnded,
                        isUpcoming: !m.matchStarted && !m.matchEnded,
                        teams: m.teams || [],
                        teamInfo: m.teamInfo || [],
                        score: m.score || [],
                        hasSquad: m.hasSquad || false,
                    }));
                setMatches(mapped);
                // Auto-select tab with matches
                const liveCount = mapped.filter(m => m.isLive).length;
                if (liveCount > 0) setViewTab('live');
                else if (mapped.filter(m => m.isCompleted).length > 0) setViewTab('completed');
            }
        } catch (err) { console.error('Failed to fetch matches', err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchMatches(); }, [fetchMatches]);

    /* ── Fetch scorecard for a match ── */
    const fetchScorecard = useCallback(async (matchId: string) => {
        setScorecardLoading(true);
        setScorecardData(null);
        try {
            const res = await fetch(CRICAPI_SCORECARD(matchId));
            const json = await res.json();
            if (json.status === 'success' && json.data) {
                setScorecardData(json.data);
            }
        } catch (err) { console.error('Scorecard fetch failed', err); }
        finally { setScorecardLoading(false); }
    }, []);

    const openMatch = (matchId: string) => {
        setSelectedMatch(matchId);
        setDetailTab('scorecard');
        fetchScorecard(matchId);
    };

    /* ── Filter matches ── */
    const filteredByTab = matches.filter(m =>
        viewTab === 'live' ? m.isLive : viewTab === 'completed' ? m.isCompleted : m.isUpcoming
    );
    const filtered = searchQuery.trim()
        ? filteredByTab.filter(m => {
            const q = searchQuery.toLowerCase();
            return m.name.toLowerCase().includes(q) || m.venue.toLowerCase().includes(q) ||
                m.teams.some(t => t.toLowerCase().includes(q));
        })
        : filteredByTab;

    const tabCounts = {
        live: matches.filter(m => m.isLive).length,
        completed: matches.filter(m => m.isCompleted).length,
        upcoming: matches.filter(m => m.isUpcoming).length,
    };

    /* ── DETAIL VIEW ── */
    if (selectedMatch && scorecardData) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <PageNavbar title="Match Details" />
                <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px', paddingTop: '8px' }}>
                    {/* Back Button */}
                    <button onClick={() => setSelectedMatch(null)}
                        style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                        ← Back to all matches
                    </button>

                    {/* Match Header Card */}
                    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                        <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {scorecardData.matchStarted && !scorecardData.matchEnded ? (
                                <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', animation: 'pulse 1.5s infinite' }} /> LIVE
                                </span>
                            ) : (
                                <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a' }}>RESULT</span>
                            )}
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{scorecardData.matchType?.toUpperCase()}</span>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: '0 0 12px 0', lineHeight: 1.4 }}>{scorecardData.name}</h2>
                            {/* Score Summary */}
                            {scorecardData.teamInfo?.map((team: any, idx: number) => {
                                const scoreEntry = scorecardData.score?.find((s: any) => s.inning?.toLowerCase().startsWith(team.name.toLowerCase()));
                                return (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx === 0 ? '1px solid #f1f5f9' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 900, color: '#6366f1' }}>
                                                {team.shortname?.substring(0, 2) || '??'}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{team.shortname}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{team.name}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            {scoreEntry ? (
                                                <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>{scoreEntry.r}/{scoreEntry.w} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>({scoreEntry.o})</span></span>
                                            ) : (
                                                <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>Yet to bat</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', marginTop: '12px' }}>{scorecardData.status}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>📍 {scorecardData.venue}</div>
                            {scorecardData.tossWinner && (
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>🪙 Toss: {scorecardData.tossWinner} chose to {scorecardData.tossChoice}</div>
                            )}
                        </div>
                    </div>

                    {/* Detail Tabs */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'white', borderRadius: '12px', padding: '4px', border: '1px solid #e2e8f0' }}>
                        {(['scorecard', 'squads', 'info'] as DetailTab[]).map(tab => (
                            <button key={tab} onClick={() => setDetailTab(tab)}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                    fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                    background: detailTab === tab ? '#1e293b' : 'transparent',
                                    color: detailTab === tab ? 'white' : '#64748b',
                                    textTransform: 'capitalize',
                                }}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* SCORECARD TAB */}
                    {detailTab === 'scorecard' && (
                        <div>
                            {scorecardData.scorecard?.map((innings: any, idx: number) => (
                                <div key={idx} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                    {/* Innings Header */}
                                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                                        {innings.inning}
                                    </div>

                                    {/* Batting Table */}
                                    {innings.batting && innings.batting.length > 0 && (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                <thead>
                                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Batter</th>
                                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '10px' }}>R</th>
                                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '10px' }}>B</th>
                                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '10px' }}>4s</th>
                                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '10px' }}>6s</th>
                                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '10px' }}>SR</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {innings.batting.map((b: any, bi: number) => (
                                                        <tr key={bi} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '13px' }}>{b.batsman?.name || 'Unknown'}</div>
                                                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{b['dismissal-text'] || ''}</div>
                                                            </td>
                                                            <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{b.r}</td>
                                                            <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b' }}>{b.b}</td>
                                                            <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b' }}>{b['4s']}</td>
                                                            <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b' }}>{b['6s']}</td>
                                                            <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b' }}>{b.sr?.toFixed(1)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Bowling Table */}
                                    {innings.bowling && innings.bowling.length > 0 && (
                                        <div style={{ borderTop: '2px solid #e2e8f0', overflowX: 'auto' }}>
                                            <div style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 800, color: '#64748b', background: '#f8fafc', textTransform: 'uppercase' }}>Bowling</div>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                <thead>
                                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Bowler</th>
                                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '10px' }}>O</th>
                                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '10px' }}>M</th>
                                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '10px' }}>R</th>
                                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '10px' }}>W</th>
                                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '10px' }}>ECO</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {innings.bowling.map((bw: any, bwi: number) => (
                                                        <tr key={bwi} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e293b', fontSize: '13px' }}>{bw.bowler?.name || 'Unknown'}</td>
                                                            <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b' }}>{bw.o}</td>
                                                            <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b' }}>{bw.m}</td>
                                                            <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b' }}>{bw.r}</td>
                                                            <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{bw.w}</td>
                                                            <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b' }}>{bw.eco?.toFixed(1)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {(!scorecardData.scorecard || scorecardData.scorecard.length === 0) && (
                                <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>Scorecard not available yet</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SQUADS TAB */}
                    {detailTab === 'squads' && (
                        <div>
                            {scorecardData.scorecard && scorecardData.scorecard.length > 0 ? (
                                scorecardData.scorecard.map((innings: any, idx: number) => {
                                    const players = new Map<string, string>();
                                    innings.batting?.forEach((b: any) => { if (b.batsman?.name) players.set(b.batsman.id || b.batsman.name, b.batsman.name); });
                                    innings.bowling?.forEach((bw: any) => { if (bw.bowler?.name) players.set(bw.bowler.id || bw.bowler.name, bw.bowler.name); });
                                    innings.catching?.forEach((c: any) => { if (c.catcher?.name) players.set(c.catcher.id || c.catcher.name, c.catcher.name); });
                                    const playerList = Array.from(players.values());
                                    const teamName = innings.inning?.split('Inning')[0]?.trim() || `Team ${idx + 1}`;
                                    return (
                                        <div key={idx} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                            <div style={{ padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', textTransform: 'capitalize' }}>{teamName}</span>
                                                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{playerList.length} players</span>
                                            </div>
                                            <div style={{ padding: '8px 0' }}>
                                                {playerList.map((name, pi) => (
                                                    <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: pi < playerList.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', fontWeight: 800, flexShrink: 0 }}>
                                                            {name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>Squad information not available</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* INFO TAB */}
                    {detailTab === 'info' && (
                        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            {[
                                { label: 'Match', value: scorecardData.name },
                                { label: 'Format', value: scorecardData.matchType?.toUpperCase() },
                                { label: 'Venue', value: scorecardData.venue },
                                { label: 'Date', value: scorecardData.date },
                                { label: 'Status', value: scorecardData.status },
                                { label: 'Toss', value: scorecardData.tossWinner ? `${scorecardData.tossWinner} chose to ${scorecardData.tossChoice}` : 'N/A' },
                                { label: 'Teams', value: scorecardData.teams?.join(' vs ') },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', padding: '14px 16px', borderBottom: i < 6 ? '1px solid #f1f5f9' : 'none' }}>
                                    <span style={{ width: '90px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', flexShrink: 0, textTransform: 'uppercase' }}>{item.label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', flex: 1 }}>{item.value || '-'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
            </div>
        );
    }

    /* ── SCORECARD LOADING ── */
    if (selectedMatch && scorecardLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <PageNavbar title="Match Details" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Loading scorecard...</div>
                    </div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    /* ══════════ MAIN LIST VIEW ══════════ */
    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageNavbar title="Match Center" />

            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px', paddingBottom: '100px' }}>

                {/* Search */}
                <div style={{ marginBottom: '16px' }}>
                    <input type="text" value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search matches, teams, venues..."
                        style={{
                            width: '100%', padding: '14px 16px', borderRadius: '12px',
                            border: '1px solid #e2e8f0', background: 'white', fontSize: '14px',
                            fontWeight: 600, color: '#1e293b', outline: 'none',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', boxSizing: 'border-box',
                        }}
                    />
                </div>

                {/* Tab Bar */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'white', borderRadius: '12px', padding: '4px', border: '1px solid #e2e8f0' }}>
                    {(['live', 'completed', 'upcoming'] as ViewTab[]).map(tab => (
                        <button key={tab} onClick={() => setViewTab(tab)}
                            style={{
                                flex: 1, padding: '12px 8px', borderRadius: '8px', border: 'none',
                                fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                background: viewTab === tab ? (tab === 'live' ? '#dc2626' : '#1e293b') : 'transparent',
                                color: viewTab === tab ? 'white' : '#64748b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                textTransform: 'capitalize',
                            }}>
                            {tab === 'live' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: viewTab === tab ? 'white' : '#dc2626' }} />}
                            {tab} ({tabCounts[tab]})
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Loading matches...</div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏏</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#334155' }}>No {viewTab} matches</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                            {searchQuery ? `No results for "${searchQuery}"` : `Check back soon for ${viewTab} matches`}
                        </div>
                    </div>
                )}

                {/* Match Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filtered.map(match => {
                        const t1 = match.teamInfo[0], t2 = match.teamInfo[1];
                        const s1 = match.score.find(s => s.inning?.toLowerCase().startsWith(t1.name.toLowerCase()));
                        const s2 = match.score.find(s => s.inning?.toLowerCase().startsWith(t2.name.toLowerCase()));
                        return (
                            <div key={match.id} onClick={() => openMatch(match.id)}
                                style={{
                                    background: 'white', borderRadius: '16px', overflow: 'hidden',
                                    border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                }}>
                                {/* Header */}
                                <div style={{ padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {match.isLive ? (
                                            <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#dc2626', animation: 'pulse 1.5s infinite' }} /> LIVE
                                            </span>
                                        ) : match.isCompleted ? (
                                            <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a' }}>COMPLETED</span>
                                        ) : (
                                            <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb' }}>UPCOMING</span>
                                        )}
                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{match.matchType}</span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 700 }}>View Scorecard →</span>
                                </div>

                                {/* Scores */}
                                <div style={{ padding: '14px 16px' }}>
                                    {/* Team 1 */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#6366f1', border: '1px solid #e2e8f0' }}>
                                                {t1.shortname?.substring(0, 2)}
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{t1.shortname}</span>
                                        </div>
                                        {s1 ? <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{s1.r}/{s1.w} <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>({s1.o})</span></span> : <span style={{ fontSize: '13px', color: '#94a3b8' }}>-</span>}
                                    </div>
                                    {/* Team 2 */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#6366f1', border: '1px solid #e2e8f0' }}>
                                                {t2.shortname?.substring(0, 2)}
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{t2.shortname}</span>
                                        </div>
                                        {s2 ? <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{s2.r}/{s2.w} <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>({s2.o})</span></span> : <span style={{ fontSize: '13px', color: '#94a3b8' }}>-</span>}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{ padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: match.isLive ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                                    {match.status}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

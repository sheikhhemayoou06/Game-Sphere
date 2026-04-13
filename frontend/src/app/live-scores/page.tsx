'use client';

import { useEffect, useState, useCallback } from 'react';
import PageNavbar from '@/components/PageNavbar';

/* ═══════════════════════════════════════════════════════════
   MATCH CENTER — Google-Style Full Scorecard Page
   ═══════════════════════════════════════════════════════════ */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

type ViewTab = 'live' | 'completed' | 'upcoming';
type DetailTab = 'scorecard' | 'commentary' | 'run_rate' | 'squads' | 'info';

interface MatchSummary {
    id: string; name: string; matchType: string; status: string; venue: string;
    date: string; isLive: boolean; isCompleted: boolean; isUpcoming: boolean;
    level: string;
    teams: string[];
    teamInfo: { name: string; shortname: string; img: string; score: string }[];
    score: { r: number; w: number; o: number; inning: string }[];
    hasSquad: boolean;
}

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LiveScoresPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0f0d1a' }}>Loading Match Center...</div>}>
            <LiveScoresContent />
        </Suspense>
    );
}

function LiveScoresContent() {
    const [matches, setMatches] = useState<MatchSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewTab, setViewTab] = useState<ViewTab>('live');
    const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
    const [detailTab, setDetailTab] = useState<DetailTab>('scorecard');
    const [scorecardData, setScorecardData] = useState<any>(null);
    const [scorecardLoading, setScorecardLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedTournament, setSelectedTournament] = useState<string>('All');
    const [selectedTeam, setSelectedTeam] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [commentaryData, setCommentaryData] = useState<any[]>([]);
    const [commentaryLoading, setCommentaryLoading] = useState(false);

    const searchParams = useSearchParams();

    /* ── Fetch all internal matches ── */
    const fetchMatches = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/matches`);
            const json = await res.json();
            if (Array.isArray(json)) {
                const mapped: MatchSummary[] = json
                    .map((m: any) => {
                        const sportName = m.tournament?.sport?.name || m.sport?.name || 'Other';
                        const isLive = m.status === 'LIVE' || m.status === 'IN_PROGRESS';
                        const isCompleted = m.status === 'COMPLETED';
                        const isUpcoming = m.status === 'SCHEDULED' || m.status === 'DRAFT';
                        const level = m.tournament?.level || 'LOCAL';
                        return {
                            id: m.id, name: `${m.homeTeam?.name || 'TBD'} vs ${m.awayTeam?.name || 'TBD'}`, matchType: m.tournament?.name || sportName,
                            status: m.status || 'Scheduled', venue: m.venue || m.tournament?.venue || '', date: m.scheduledAt || m.createdAt || '',
                            isLive, isCompleted, isUpcoming, level,
                            teams: [m.homeTeam?.name || 'TBD', m.awayTeam?.name || 'TBD'],
                            teamInfo: [
                                { name: m.homeTeam?.name || 'TBD', shortname: (m.homeTeam?.name || 'TBD').substring(0, 3).toUpperCase(), img: '', score: m.homeScore != null ? `${m.homeScore}` : '-' },
                                { name: m.awayTeam?.name || 'TBD', shortname: (m.awayTeam?.name || 'TBD').substring(0, 3).toUpperCase(), img: '', score: m.awayScore != null ? `${m.awayScore}` : '-' }
                            ],
                            score: [
                                { inning: m.homeTeam?.name || 'TBD', r: m.homeScore ?? 0, w: 0, o: 0 },
                                { inning: m.awayTeam?.name || 'TBD', r: m.awayScore ?? 0, w: 0, o: 0 }
                            ],
                            hasSquad: false,
                        };
                    });
                setMatches(mapped);
                // Auto-select tab logic
                const liveCount = mapped.filter(m => m.isLive).length;
                if (liveCount > 0) setViewTab('live');
                else if (mapped.filter(m => m.isCompleted).length > 0) setViewTab('completed');
            } else {
                setApiError('Failed to parse match data.');
            }
        } catch (err) { 
            console.error('Failed to fetch internal matches', err); 
            setApiError('Network error while connecting to data service.');
        }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchMatches(); }, [fetchMatches]);

    /* ── Fetch scorecard for a match ── */
    const fetchScorecard = useCallback(async (matchId: string) => {
        setScorecardLoading(true);
        setScorecardData(null);
        try {
            const res = await fetch(`${API_BASE}/matches/${matchId}`);
            const json = await res.json();
            if (json && json.id) {
                setScorecardData({
                    name: `${json.homeTeam?.name || 'TBD'} vs ${json.awayTeam?.name || 'TBD'}`,
                    matchType: json.tournament?.name || json.sport?.name,
                    status: json.status, venue: json.venue || json.tournament?.venue,
                    date: json.scheduledAt, matchStarted: json.status === 'LIVE' || json.status === 'COMPLETED',
                    matchEnded: json.status === 'COMPLETED',
                    tossWinner: null, tossChoice: null,
                    teamInfo: [
                        { name: json.homeTeam?.name, shortname: (json.homeTeam?.name || '').substring(0, 3).toUpperCase() },
                        { name: json.awayTeam?.name, shortname: (json.awayTeam?.name || '').substring(0, 3).toUpperCase() }
                    ],
                    score: [
                        { inning: json.homeTeam?.name, r: json.homeScore ?? 0, w: 0, o: 0 },
                        { inning: json.awayTeam?.name, r: json.awayScore ?? 0, w: 0, o: 0 }
                    ],
                    scorecard: [] // Empty scorecard array for graceful fallback
                });
            }
        } catch (err) { console.error('Scorecard fetch failed', err); }
        finally { setScorecardLoading(false); }
    }, []);

    /* ── Fetch ball-by-ball commentary (Not supported for internal matches yet) ── */
    const fetchCommentary = useCallback(async (matchId: string) => {
        setCommentaryData([]);
    }, []);

    const openMatch = useCallback((matchId: string) => {
        setSelectedMatch(matchId);
        setDetailTab('scorecard');
        fetchScorecard(matchId);
        fetchCommentary(matchId);
    }, [fetchScorecard, fetchCommentary]);

    // Read matchId from query params
    useEffect(() => {
        const mid = searchParams.get('matchId');
        if (mid && mid !== selectedMatch) {
            openMatch(mid);
        }
    }, [searchParams, selectedMatch, openMatch]);

    /* ── Match Category Inference ── */
    const getCategory = (m: MatchSummary) => {
        const lvl = m.level?.toUpperCase() || '';
        if (['STATE', 'NATIONAL', 'INTERNATIONAL', 'RECOGNISED'].includes(lvl)) return 'Recognised';
        return 'Local';
    };

    /* ── Filter matches ── */
    const filteredByCategory = selectedCategory === 'All' 
        ? matches 
        : matches.filter(m => getCategory(m) === selectedCategory);

    const availableTournaments = Array.from(new Set(filteredByCategory.map(m => m.matchType))).filter(Boolean).sort();

    const filteredByTournament = selectedTournament === 'All'
        ? filteredByCategory
        : filteredByCategory.filter(m => m.matchType === selectedTournament);

    const availableTeams = Array.from(new Set(filteredByTournament.flatMap(m => m.teamInfo.map(t => t.name)))).sort();

    const filteredByTeam = selectedTeam === 'All'
        ? filteredByTournament
        : filteredByTournament.filter(m => m.teams.some(t => t.includes(selectedTeam)) || m.teamInfo.some(t => t.name === selectedTeam));

    const filteredByTab = filteredByTeam.filter(m =>
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
        live: filteredByTeam.filter(m => m.isLive).length,
        completed: filteredByTeam.filter(m => m.isCompleted).length,
        upcoming: filteredByTeam.filter(m => m.isUpcoming).length,
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
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '16px', background: 'white', borderRadius: '12px', padding: '4px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                        {(['scorecard', 'commentary', 'run_rate', 'squads', 'info'] as DetailTab[]).map(tab => (
                            <button key={tab} onClick={() => setDetailTab(tab)}
                                style={{
                                    flex: '0 0 auto', padding: '10px 12px', borderRadius: '8px', border: 'none',
                                    fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                    background: detailTab === tab ? '#1e293b' : 'transparent',
                                    color: detailTab === tab ? 'white' : '#64748b',
                                    whiteSpace: 'nowrap',
                                }}>
                                {tab === 'run_rate' ? 'Run Rate' : tab === 'commentary' ? 'Commentary' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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

                    {/* COMMENTARY TAB */}
                    {detailTab === 'commentary' && (
                        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <div style={{ padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                                Ball-by-Ball Commentary
                            </div>
                            {commentaryLoading ? (
                                <div style={{ padding: '40px', textAlign: 'center' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>Loading commentary...</div>
                                </div>
                            ) : commentaryData.length > 0 ? (
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    {commentaryData.map((ball: any, i: number) => (
                                        <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <div style={{
                                                minWidth: '36px', height: '36px', borderRadius: '8px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '11px', fontWeight: 800, flexShrink: 0,
                                                background: ball.six ? '#7c3aed' : ball.four ? '#2563eb' : ball.wicket ? '#dc2626' : '#f1f5f9',
                                                color: (ball.six || ball.four || ball.wicket) ? 'white' : '#1e293b',
                                            }}>
                                                {ball.over || ball.opiData?.over || `${i + 1}`}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>
                                                    {ball.bpiData?.commentary || ball.commentary || ball.text || `Over ${ball.over || i + 1}`}
                                                </div>
                                                {(ball.batsman || ball.bowler) && (
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        {ball.batsman && `${ball.batsman.name} `}
                                                        {ball.bowler && `to ${ball.bowler.name}`}
                                                    </div>
                                                )}
                                            </div>
                                            {(ball.six || ball.four || ball.wicket) && (
                                                <span style={{
                                                    fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px',
                                                    background: ball.six ? '#f3e8ff' : ball.four ? '#dbeafe' : '#fef2f2',
                                                    color: ball.six ? '#7c3aed' : ball.four ? '#2563eb' : '#dc2626',
                                                }}>
                                                    {ball.six ? 'SIX' : ball.four ? 'FOUR' : 'WICKET'}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>Commentary not available</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Ball-by-ball data may not be available for this match</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* RUN RATE CHART TAB */}
                    {detailTab === 'run_rate' && (
                        <div>
                            {scorecardData.scorecard && scorecardData.scorecard.length > 0 ? (
                                scorecardData.scorecard.map((innings: any, idx: number) => {
                                    // Build per-over run rate from batting data
                                    const batsmen = innings.batting || [];
                                    const totalRuns = batsmen.reduce((sum: number, b: any) => sum + (b.r || 0), 0);
                                    const totalOvers = Math.max(...(scorecardData.score || []).filter((s: any) => s.inning === innings.inning).map((s: any) => s.o || 0), 1);
                                    const runRate = totalOvers > 0 ? (totalRuns / totalOvers).toFixed(2) : '0.00';

                                    // Generate over-by-over data from bowling figures
                                    const bowlers = innings.bowling || [];
                                    const overData: { over: number; runs: number }[] = [];
                                    let overNum = 1;
                                    bowlers.forEach((bw: any) => {
                                        const fullOvers = Math.floor(bw.o || 0);
                                        const runsPerOver = fullOvers > 0 ? bw.r / fullOvers : bw.r;
                                        for (let i = 0; i < fullOvers; i++) {
                                            overData.push({ over: overNum++, runs: Math.round(runsPerOver) });
                                        }
                                    });

                                    const maxRuns = Math.max(...overData.map(d => d.runs), 1);
                                    const teamName = innings.inning?.split('Inning')[0]?.trim() || `Team ${idx + 1}`;
                                    const scoreInfo = scorecardData.score?.find((s: any) => s.inning === innings.inning);

                                    return (
                                        <div key={idx} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                            <div style={{ padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', textTransform: 'capitalize' }}>{teamName}</span>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    {scoreInfo && <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{scoreInfo.r}/{scoreInfo.w} ({scoreInfo.o} ov)</span>}
                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1' }}>RR: {runRate}</span>
                                                </div>
                                            </div>
                                            {/* Bar Chart */}
                                            {overData.length > 0 ? (
                                                <div style={{ padding: '20px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '120px', marginBottom: '8px' }}>
                                                        {overData.map((d, oi) => (
                                                            <div key={oi} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                                                                <span style={{ fontSize: '8px', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>{d.runs}</span>
                                                                <div style={{
                                                                    width: '100%', borderRadius: '4px 4px 0 0',
                                                                    height: `${Math.max((d.runs / maxRuns) * 100, 5)}%`,
                                                                    background: d.runs >= 10 ? 'linear-gradient(180deg, #7c3aed, #a855f7)' :
                                                                        d.runs >= 7 ? 'linear-gradient(180deg, #2563eb, #3b82f6)' :
                                                                            'linear-gradient(180deg, #6366f1, #818cf8)',
                                                                    transition: 'height 0.3s ease',
                                                                }} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* X-axis labels */}
                                                    <div style={{ display: 'flex', gap: '3px', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
                                                        {overData.map((d, oi) => (
                                                            <div key={oi} style={{ flex: 1, textAlign: 'center', fontSize: '8px', color: '#94a3b8', fontWeight: 600 }}>
                                                                {d.over}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '8px' }}>OVERS →</div>
                                                </div>
                                            ) : (
                                                <div style={{ padding: '40px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Chart data not available for this innings</div>
                                                </div>
                                            )}

                                            {/* Stats Row */}
                                            <div style={{ padding: '12px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{totalRuns}</div>
                                                    <div style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Total Runs</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{totalOvers}</div>
                                                    <div style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Overs</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#6366f1' }}>{runRate}</div>
                                                    <div style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Run Rate</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{batsmen.reduce((s: number, b: any) => s + (b['6s'] || 0), 0)}</div>
                                                    <div style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Sixes</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{batsmen.reduce((s: number, b: any) => s + (b['4s'] || 0), 0)}</div>
                                                    <div style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Fours</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>Run rate data not available</div>
                                </div>
                            )}
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
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="🔍 Search matches, teams, venues..."
                        style={{
                            width: '100%', padding: '10px 14px', borderRadius: '10px',
                            border: '1px solid #e2e8f0', background: 'white', fontSize: '13px',
                            fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
                        }}
                    />
                </div>

                {/* Filters — single row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', overflowX: 'auto', scrollbarWidth: 'none', flexWrap: 'nowrap', paddingBottom: '4px' }}>
                    {[
                        { key: 'All', label: 'All' },
                        { key: 'Recognised', label: 'Recognised' },
                        { key: 'Local', label: 'Local' },
                    ].map(cat => (
                        <button key={cat.key} onClick={() => { 
                            setSelectedCategory(cat.key); 
                            setSelectedTournament('All');
                            setSelectedTeam('All'); 
                            const newFilteredCat = cat.key === 'All' ? matches : matches.filter(m => getCategory(m) === cat.key);
                            const lCount = newFilteredCat.filter(m => m.isLive).length;
                            const cCount = newFilteredCat.filter(m => m.isCompleted).length;
                            const uCount = newFilteredCat.filter(m => m.isUpcoming).length;
                            const currentCount = viewTab === 'live' ? lCount : viewTab === 'completed' ? cCount : uCount;
                            if (currentCount === 0) {
                                if (lCount > 0) setViewTab('live');
                                else if (cCount > 0) setViewTab('completed');
                                else if (uCount > 0) setViewTab('upcoming');
                            }
                        }}
                            style={{
                                padding: '6px 14px', borderRadius: '16px', border: '1px solid',
                                fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                                background: selectedCategory === cat.key ? '#1e293b' : 'white',
                                color: selectedCategory === cat.key ? 'white' : '#64748b',
                                borderColor: selectedCategory === cat.key ? '#1e293b' : '#e2e8f0',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}

                    {/* Divider */}
                    <div style={{ width: '1px', height: '20px', background: '#e2e8f0', flexShrink: 0 }} />

                    {/* Tournament Dropdown */}
                    {availableTournaments.length > 0 && (
                        <select
                            value={selectedTournament}
                            onChange={(e) => {
                                const newTournament = e.target.value;
                                setSelectedTournament(newTournament);
                                setSelectedTeam('All');
                                const newFilteredTournament = newTournament === 'All'
                                    ? filteredByCategory
                                    : filteredByCategory.filter(m => m.matchType === newTournament);
                                const lCount = newFilteredTournament.filter(m => m.isLive).length;
                                const cCount = newFilteredTournament.filter(m => m.isCompleted).length;
                                const uCount = newFilteredTournament.filter(m => m.isUpcoming).length;
                                const currentCount = viewTab === 'live' ? lCount : viewTab === 'completed' ? cCount : uCount;
                                if (currentCount === 0) {
                                    if (lCount > 0) setViewTab('live');
                                    else if (cCount > 0) setViewTab('completed');
                                    else if (uCount > 0) setViewTab('upcoming');
                                }
                            }}
                            style={{
                                padding: '6px 10px', borderRadius: '16px', border: '1px solid',
                                fontSize: '12px', fontWeight: 700, cursor: 'pointer', outline: 'none',
                                background: selectedTournament !== 'All' ? '#eef2ff' : 'white',
                                color: selectedTournament !== 'All' ? '#6366f1' : '#64748b',
                                borderColor: selectedTournament !== 'All' ? '#6366f1' : '#e2e8f0',
                                flexShrink: 0, maxWidth: '140px', textOverflow: 'ellipsis'
                            }}
                        >
                            <option value="All">All Tournaments</option>
                            {availableTournaments.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    )}

                    {/* Team Dropdown */}
                    {selectedTournament !== 'All' && availableTeams.length > 0 && (
                        <select
                            value={selectedTeam}
                            onChange={(e) => {
                                const newTeam = e.target.value;
                                setSelectedTeam(newTeam);
                                const newFilteredTeam = newTeam === 'All'
                                    ? filteredByTournament
                                    : filteredByTournament.filter(m => m.teams.some(t => t.includes(newTeam)) || m.teamInfo.some(t => t.name === newTeam));
                                const lCount = newFilteredTeam.filter(m => m.isLive).length;
                                const cCount = newFilteredTeam.filter(m => m.isCompleted).length;
                                const uCount = newFilteredTeam.filter(m => m.isUpcoming).length;
                                const currentCount = viewTab === 'live' ? lCount : viewTab === 'completed' ? cCount : uCount;
                                if (currentCount === 0) {
                                    if (lCount > 0) setViewTab('live');
                                    else if (cCount > 0) setViewTab('completed');
                                    else if (uCount > 0) setViewTab('upcoming');
                                }
                            }}
                            style={{
                                padding: '6px 10px', borderRadius: '16px', border: '1px solid',
                                fontSize: '12px', fontWeight: 700, cursor: 'pointer', outline: 'none',
                                background: selectedTeam !== 'All' ? '#eef2ff' : 'white',
                                color: selectedTeam !== 'All' ? '#6366f1' : '#64748b',
                                borderColor: selectedTeam !== 'All' ? '#6366f1' : '#e2e8f0',
                                flexShrink: 0, maxWidth: '140px', textOverflow: 'ellipsis'
                            }}
                        >
                            <option value="All">All Teams</option>
                            {availableTeams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    )}
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

                {/* Empty / Error State */}
                {!loading && (apiError || filtered.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        {apiError ? (
                            <>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626' }}>API Unavailable</div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>{apiError}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px', background: '#f1f5f9', display: 'inline-block', padding: '6px 12px', borderRadius: '8px' }}>The external cricket service has rate-limited our server. Please try again later.</div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏏</div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: '#334155' }}>No {viewTab} matches</div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                                    {searchQuery ? `No matches found for "${searchQuery}"` : "Try checking other tabs or filters"}
                                </div>
                            </>
                        )}
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

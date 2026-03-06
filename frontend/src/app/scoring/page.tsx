'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons, sportConfig, defaultSportConfig } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';
import { ArrowLeft } from 'lucide-react';

type MatchTab = 'overview' | 'scorecard' | 'commentary' | 'stats';

export default function LiveScoringPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const [matches, setMatches] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({ home: 0, away: 0 });
    const [events, setEvents] = useState<{ time: string; team: string; type: string; desc: string }[]>([]);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [activeTab, setActiveTab] = useState<MatchTab>('overview');

    const activeConfig = selectedSport ? (sportConfig[selectedSport.name] || defaultSportConfig) : defaultSportConfig;
    const [timer, setTimer] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        api.getMatches().then((m) => {
            const filtered = selectedSport ? m.filter((x: any) => x.sport?.name === selectedSport.name || x.sport?.id === selectedSport.id) : m;
            setMatches(filtered);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const selectMatch = useCallback((match: any) => {
        setSelected(match);
        setScores({ home: match?.homeScore || 0, away: match?.awayScore || 0 });
        setEvents([]);
        setTimer(0);
        setRunning(false);
        setActiveTab('overview');

        if (match?.tournament?.id && user) {
            api.getTournament(match.tournament.id).then((tournament: any) => {
                setIsOrganizer(tournament.organizerId === user.id);
            }).catch(() => setIsOrganizer(false));
        } else {
            setIsOrganizer(false);
        }

        if (match?.scoreData) {
            try {
                const data = typeof match.scoreData === 'string' ? JSON.parse(match.scoreData) : match.scoreData;
                if (data.home !== undefined) setScores({ home: data.home, away: data.away });
                if (data.events) setEvents(data.events);
                if (data.timer) setTimer(data.timer);
            } catch { }
        }
    }, [user]);

    useEffect(() => {
        if (!selected || isOrganizer) return;
        const interval = setInterval(() => {
            api.getMatch(selected.id).then((match: any) => {
                if (match.scoreData) {
                    try {
                        const data = typeof match.scoreData === 'string' ? JSON.parse(match.scoreData) : match.scoreData;
                        if (data.home !== undefined) setScores({ home: data.home, away: data.away });
                        if (data.events) setEvents(data.events);
                        if (data.timer) setTimer(data.timer);
                    } catch { }
                }
                if (match.status !== selected.status) {
                    setSelected((prev: any) => ({ ...prev, status: match.status }));
                }
            }).catch(() => { });
        }, 3000);
        return () => clearInterval(interval);
    }, [selected, isOrganizer]);

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [running]);

    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const addGoal = (team: 'home' | 'away') => {
        const newScores = { ...scores, [team]: scores[team] + 1 };
        setScores(newScores);
        const teamName = team === 'home' ? (selected?.homeTeam?.name || 'Home') : (selected?.awayTeam?.name || 'Away');
        const newEvents = [{ time: formatTime(timer), team: teamName, type: 'SCORE', desc: `${activeConfig.stat} scored!` }, ...events];
        setEvents(newEvents);
        api.updateScore(selected.id, { home: newScores.home, away: newScores.away, events: newEvents, timer }).catch(() => { });
    };

    const addEvent = (type: string, desc: string, team: string) => {
        const newEvents = [{ time: formatTime(timer), team, type, desc }, ...events];
        setEvents(newEvents);
        api.updateScore(selected.id, { home: scores.home, away: scores.away, events: newEvents, timer }).catch(() => { });
    };

    const EVENT_ICONS: Record<string, string> = {
        SCORE: activeConfig.emoji,
        YELLOW_CARD: '🟨', RED_CARD: '🟥', SUBSTITUTION: '🔄', INJURY: '🏥', TIMEOUT: '⏱️',
        WICKET: '🏏', SIX: '💥', FOUR: '🏏',
        TACKLE: '🤼', RAID: '🏃',
        FOUL: '⚠️', BLOCK: '🛡️', ACE: '🎾', SMASH: '🏸'
    };

    const TABS: { key: MatchTab; label: string }[] = [
        { key: 'overview', label: 'Overview' },
        { key: 'scorecard', label: 'Scorecard' },
        { key: 'commentary', label: 'Commentary' },
        { key: 'stats', label: 'Stats' },
    ];

    /* ── Match List View (no match selected) ── */
    if (!selected) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <PageNavbar title="Live Scoring" />
                <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 16px 80px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>⏳ Loading matches…</div>
                    ) : matches.length === 0 ? (
                        <div style={{ padding: '60px 20px', borderRadius: '20px', background: 'white', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔴</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>No live matches</h3>
                            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>Matches will appear here when they are scheduled or live.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {matches.map(m => {
                                const isLive = m.status === 'LIVE' || m.status === 'IN_PROGRESS';
                                return (
                                    <div
                                        key={m.id}
                                        onClick={() => selectMatch(m)}
                                        style={{
                                            padding: '16px 18px', borderRadius: '14px', background: 'white',
                                            border: `1px solid ${isLive ? '#fecaca' : '#f1f5f9'}`,
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', gap: '14px',
                                        }}
                                    >
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '12px',
                                            background: isLive ? '#fef2f2' : '#f1f5f9',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '18px',
                                        }}>
                                            {isLive ? '🔴' : '⚽'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b' }}>
                                                {m.homeTeam?.name || 'TBD'} vs {m.awayTeam?.name || 'TBD'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                                {m.tournament?.name || 'Match'} • {m.sport?.name || ''}
                                            </div>
                                        </div>
                                        {isLive && (
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '8px',
                                                background: '#fef2f2', color: '#dc2626',
                                                fontSize: '11px', fontWeight: 700,
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                            }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'livePulse 1.5s infinite' }} />
                                                LIVE
                                            </span>
                                        )}
                                        {!isLive && (
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '8px',
                                                background: '#f1f5f9', color: '#64748b',
                                                fontSize: '11px', fontWeight: 700,
                                            }}>
                                                {m.status || 'SCHEDULED'}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <style>{`@keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
            </div>
        );
    }

    /* ── Match Detail View ── */
    const isLive = selected.status === 'LIVE' || selected.status === 'IN_PROGRESS';
    const homeName = selected.homeTeam?.name || 'Home';
    const awayName = selected.awayTeam?.name || 'Away';

    /* Worm graph data — build from events */
    const wormData = (() => {
        const data: { minute: number; home: number; away: number }[] = [{ minute: 0, home: 0, away: 0 }];
        let h = 0, a = 0;
        [...events].reverse().forEach(ev => {
            if (ev.type === 'SCORE') {
                if (ev.team === homeName) h++;
                else a++;
                const min = parseInt(ev.time.split(':')[0]) * 1 + Math.round(parseInt(ev.time.split(':')[1]) / 60);
                data.push({ minute: min, home: h, away: a });
            }
        });
        if (data.length === 1) data.push({ minute: Math.round(timer / 60), home: 0, away: 0 });
        return data;
    })();
    const maxScore = Math.max(scores.home, scores.away, 1);
    const maxMinute = Math.max(wormData[wormData.length - 1]?.minute || 1, 1);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Navbar with back + match title */}
            <div style={{
                background: 'white', borderBottom: '1px solid #e2e8f0',
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                position: 'sticky', top: 0, zIndex: 50,
            }}>
                <button onClick={() => setSelected(null)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                    display: 'flex', alignItems: 'center',
                }}>
                    <ArrowLeft size={20} color="#4f46e5" />
                </button>
                <div style={{ flex: 1 }}>
                    <span style={{
                        fontSize: '15px', fontWeight: 800,
                        background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text', color: 'transparent',
                    }}>
                        {homeName} vs {awayName}
                    </span>
                </div>
                {isLive && (
                    <span style={{
                        padding: '3px 10px', borderRadius: '8px', background: '#fef2f2',
                        color: '#dc2626', fontSize: '11px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'livePulse 1.5s infinite' }} /> LIVE
                    </span>
                )}
            </div>

            {/* ── Mini Scoreboard ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '20px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>{homeName}</div>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: 'white' }}>{scores.home}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'rgba(255,255,255,0.3)' }}>VS</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444', marginTop: '2px' }}>{formatTime(timer)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>{awayName}</div>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: 'white' }}>{scores.away}</div>
                </div>
            </div>

            {/* Organizer controls */}
            {isOrganizer && (
                <div style={{ background: '#fefce8', borderBottom: '1px solid #fde68a', padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => {
                        if (!running && selected.status === 'SCHEDULED' && selected.scheduledAt) {
                            const scheduledTime = new Date(selected.scheduledAt);
                            if (new Date() < scheduledTime) {
                                alert(`Cannot start before: ${scheduledTime.toLocaleString()}`);
                                return;
                            }
                        }
                        setRunning(!running);
                    }} style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: running ? '#ef4444' : '#22c55e', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                        {running ? '⏸ Pause' : '▶ Start'}
                    </button>
                    <button onClick={() => addGoal('home')} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#1e1b4b', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                        +1 {homeName}
                    </button>
                    <button onClick={() => addGoal('away')} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#1e1b4b', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                        +1 {awayName}
                    </button>
                    {activeConfig.events?.map((ev: { type: string, label: string }) => (
                        <button key={ev.type} onClick={() => addEvent(ev.type, ev.label, homeName)}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, fontSize: '11px', cursor: 'pointer' }}>
                            {EVENT_ICONS[ev.type] || '📝'} {ev.label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Tab Navigation Bar ── */}
            <div style={{
                background: 'white', borderBottom: '1px solid #e2e8f0',
                position: 'sticky', top: '49px', zIndex: 49,
                overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any,
            }}>
                <div style={{
                    maxWidth: '700px', margin: '0 auto', padding: '0 16px',
                    display: 'flex', gap: '0', justifyContent: 'center',
                    minWidth: 'max-content',
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '12px 20px', border: 'none', background: 'none',
                                cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                                color: activeTab === tab.key ? '#4f46e5' : '#94a3b8',
                                borderBottom: activeTab === tab.key ? '3px solid #4f46e5' : '3px solid transparent',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 16px 80px' }}>

                {/* ── OVERVIEW TAB ── */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {/* Worm Graph */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginBottom: '16px' }}>📈 Worm Graph</h3>
                            <div style={{ position: 'relative', height: '160px', background: '#f8fafc', borderRadius: '12px', padding: '8px', overflow: 'hidden' }}>
                                {/* Grid lines */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ position: 'absolute', left: '8px', right: '8px', bottom: `${(i / 4) * 100}%`, borderBottom: '1px dashed #e2e8f0' }} />
                                ))}
                                {/* Home line (indigo) */}
                                <svg style={{ position: 'absolute', inset: '8px', width: 'calc(100% - 16px)', height: 'calc(100% - 16px)' }}>
                                    <polyline
                                        fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinejoin="round"
                                        points={wormData.map((d, i) => `${(d.minute / maxMinute) * 100}%,${100 - (d.home / maxScore) * 90}%`).join(' ')}
                                    />
                                    <polyline
                                        fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="5,3"
                                        points={wormData.map((d, i) => `${(d.minute / maxMinute) * 100}%,${100 - (d.away / maxScore) * 90}%`).join(' ')}
                                    />
                                </svg>
                                {/* Legend */}
                                <div style={{ position: 'absolute', top: '8px', right: '12px', display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 600 }}>
                                    <span style={{ color: '#4f46e5' }}>— {homeName}</span>
                                    <span style={{ color: '#ef4444' }}>- - {awayName}</span>
                                </div>
                            </div>
                        </div>

                        {/* Player of the Match */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>🏅 Player of the Match</h3>
                            <div style={{ padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #fef3c7, #fffbeb)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '20px', fontWeight: 800,
                                }}>⭐</div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b' }}>Not yet decided</div>
                                    <div style={{ fontSize: '12px', color: '#92400e' }}>Will be announced after the match</div>
                                </div>
                            </div>
                        </div>

                        {/* Match Info */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>📋 Match Info</h3>
                            {[
                                { label: 'Tournament', value: selected.tournament?.name || '—' },
                                { label: 'Sport', value: selected.sport?.name || '—' },
                                { label: 'Venue', value: selected.venue || '—' },
                                { label: 'Status', value: selected.status },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SCORECARD TAB ── */}
                {activeTab === 'scorecard' && (
                    <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginBottom: '16px' }}>📊 Scorecard</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ textAlign: 'center', padding: '20px', borderRadius: '14px', background: '#f0f0ff' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5', marginBottom: '4px' }}>{homeName}</div>
                                <div style={{ fontSize: '40px', fontWeight: 900, color: '#1e1b4b' }}>{scores.home}</div>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 900, color: '#94a3b8' }}>VS</div>
                            <div style={{ textAlign: 'center', padding: '20px', borderRadius: '14px', background: '#fef2f2' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>{awayName}</div>
                                <div style={{ fontSize: '40px', fontWeight: 900, color: '#1e1b4b' }}>{scores.away}</div>
                            </div>
                        </div>

                        {/* Scoring events list */}
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Scoring Timeline</div>
                        {events.filter(e => e.type === 'SCORE').length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No goals scored yet.</div>
                        ) : (
                            events.filter(e => e.type === 'SCORE').map((ev, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5', width: '40px' }}>{ev.time}</span>
                                    <span style={{ fontSize: '16px' }}>{activeConfig.emoji}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{ev.team}</span>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>— {ev.desc}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ── COMMENTARY TAB ── */}
                {activeTab === 'commentary' && (
                    <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginBottom: '16px' }}>🎙️ Commentary</h3>
                        {events.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                Commentary will appear here as events unfold.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '0' }}>
                                {events.map((ev, i) => (
                                    <div key={i} style={{
                                        padding: '14px 0', borderBottom: i < events.length - 1 ? '1px solid #f1f5f9' : 'none',
                                        display: 'flex', gap: '12px',
                                    }}>
                                        <div style={{
                                            width: '40px', textAlign: 'center', flexShrink: 0,
                                        }}>
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5' }}>{ev.time}</div>
                                        </div>
                                        <div style={{
                                            width: '4px', borderRadius: '2px', flexShrink: 0,
                                            background: ev.type === 'SCORE' ? '#22c55e'
                                                : ev.type === 'RED_CARD' ? '#ef4444'
                                                    : ev.type === 'YELLOW_CARD' ? '#f59e0b'
                                                        : '#e2e8f0',
                                        }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e1b4b' }}>
                                                {EVENT_ICONS[ev.type] || '📝'} {ev.desc}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                                {ev.team && `${ev.team}`}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── STATS TAB ── */}
                {activeTab === 'stats' && (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginBottom: '16px' }}>📊 Match Stats</h3>
                            {(() => {
                                const homeEvents = events.filter(e => e.team === homeName);
                                const awayEvents = events.filter(e => e.team === awayName);
                                const homeGoals = homeEvents.filter(e => e.type === 'SCORE').length;
                                const awayGoals = awayEvents.filter(e => e.type === 'SCORE').length;
                                const homeCards = homeEvents.filter(e => e.type === 'YELLOW_CARD' || e.type === 'RED_CARD').length;
                                const awayCards = awayEvents.filter(e => e.type === 'YELLOW_CARD' || e.type === 'RED_CARD').length;
                                const homeFouls = homeEvents.filter(e => e.type === 'FOUL').length;
                                const awayFouls = awayEvents.filter(e => e.type === 'FOUL').length;

                                const stats = [
                                    { label: activeConfig.stat + 's', home: homeGoals, away: awayGoals },
                                    { label: 'Cards', home: homeCards, away: awayCards },
                                    { label: 'Fouls', home: homeFouls, away: awayFouls },
                                    { label: 'Total Events', home: homeEvents.length, away: awayEvents.length },
                                ];

                                return stats.map((stat, i) => {
                                    const total = stat.home + stat.away || 1;
                                    const homePerc = (stat.home / total) * 100;
                                    return (
                                        <div key={i} style={{ marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '6px' }}>
                                                <span>{stat.home}</span>
                                                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{stat.label}</span>
                                                <span>{stat.away}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '3px', height: '8px' }}>
                                                <div style={{ flex: homePerc, background: '#4f46e5', borderRadius: '4px 0 0 4px', transition: 'flex 0.5s' }} />
                                                <div style={{ flex: 100 - homePerc, background: '#ef4444', borderRadius: '0 4px 4px 0', transition: 'flex 0.5s' }} />
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        {/* Event breakdown */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>📋 Event Breakdown</h3>
                            {(() => {
                                const typeCount: Record<string, number> = {};
                                events.forEach(e => { typeCount[e.type] = (typeCount[e.type] || 0) + 1; });
                                const entries = Object.entries(typeCount);
                                if (entries.length === 0) return <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No events recorded yet.</div>;
                                return entries.map(([type, count], i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < entries.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '16px' }}>{EVENT_ICONS[type] || '📝'}</span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{type.replace(/_/g, ' ')}</span>
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#4f46e5' }}>{count}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                )}
            </div>

            <style>{`@keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
        </div>
    );
}

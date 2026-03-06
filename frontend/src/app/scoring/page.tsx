'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons, sportConfig, defaultSportConfig } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';

export default function LiveScoringPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '🔴';
    const [matches, setMatches] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({ home: 0, away: 0 });
    const [events, setEvents] = useState<{ time: string; team: string; type: string; desc: string }[]>([]);
    const [isOrganizer, setIsOrganizer] = useState(false);

    const activeConfig = selectedSport ? (sportConfig[selectedSport.name] || defaultSportConfig) : defaultSportConfig;
    const [timer, setTimer] = useState(0);
    const [running, setRunning] = useState(false);

    // Load matches
    useEffect(() => {
        api.getMatches().then((m) => {
            const filtered = selectedSport ? m.filter((x: any) => x.sport?.name === selectedSport.name || x.sport?.id === selectedSport.id) : m;
            setMatches(filtered);
            const liveOrScheduled = filtered.find((x: any) => x.status === 'IN_PROGRESS' || x.status === 'SCHEDULED' || x.status === 'LIVE');
            if (liveOrScheduled) {
                selectMatch(liveOrScheduled);
            }
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    // Check organizer status when match is selected
    const selectMatch = useCallback((match: any) => {
        setSelected(match);
        setScores({ home: match?.homeScore || 0, away: match?.awayScore || 0 });
        setEvents([]);
        setTimer(0);
        setRunning(false);

        // Check if the current user is the organizer of this match's tournament
        if (match?.tournament?.id && user) {
            api.getTournament(match.tournament.id).then((tournament: any) => {
                setIsOrganizer(tournament.organizerId === user.id);
            }).catch(() => setIsOrganizer(false));
        } else {
            setIsOrganizer(false);
        }

        // Parse existing scoreData if match is LIVE
        if (match?.scoreData) {
            try {
                const data = typeof match.scoreData === 'string' ? JSON.parse(match.scoreData) : match.scoreData;
                if (data.home !== undefined) setScores({ home: data.home, away: data.away });
                if (data.events) setEvents(data.events);
                if (data.timer) setTimer(data.timer);
            } catch { }
        }
    }, [user]);

    // Auto-poll for live updates (viewers get real-time scores)
    useEffect(() => {
        if (!selected || isOrganizer) return; // Organizer doesn't need to poll — they're the one updating
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
        }, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [selected, isOrganizer]);

    // Timer for organizer
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

        // Push live update to backend
        api.updateScore(selected.id, { home: newScores.home, away: newScores.away, events: newEvents, timer }).catch(() => { });
    };

    const addEvent = (type: string, desc: string, team: string) => {
        const newEvents = [{ time: formatTime(timer), team, type, desc }, ...events];
        setEvents(newEvents);
        // Push event update to backend
        api.updateScore(selected.id, { home: scores.home, away: scores.away, events: newEvents, timer }).catch(() => { });
    };

    const EVENT_ICONS: Record<string, string> = {
        SCORE: activeConfig.emoji,
        YELLOW_CARD: '🟨', RED_CARD: '🟥', SUBSTITUTION: '🔄', INJURY: '🏥', TIMEOUT: '⏱️',
        WICKET: '🏏', SIX: '💥', FOUR: '🏏',
        TACKLE: '🤼', RAID: '🏃',
        FOUL: '⚠️', BLOCK: '🛡️', ACE: '🎾', SMASH: '🏸'
    };

    const liveIndicator = selected?.status === 'LIVE' ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} /> LIVE
        </span>
    ) : null;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #0f172a 100%)' }}>
            <PageNavbar title="Live Scoring" emoji="🔴" />
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
                <div className="flex-wrap-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {selectedSport ? `${sportLabel} Live Scoring` : 'Live Scoring'}
                            {liveIndicator}
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '15px' }}>
                            {isOrganizer
                                ? '🎯 You are the organizer — update scores in real time'
                                : '📡 Live updates — scores refresh automatically'}
                        </p>
                    </div>
                    <select value={selected?.id || ''} onChange={(e) => { const m = matches.find(x => x.id === e.target.value); if (m) selectMatch(m); }}
                        style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>
                        <option value="">Select Match...</option>
                        {matches.map(m => <option key={m.id} value={m.id}>{m.homeTeam?.name || 'TBD'} vs {m.awayTeam?.name || 'TBD'}</option>)}
                    </select>
                </div>

                {!selected ? (
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '60px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔴</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Select a Match</div>
                        <div style={{ color: '#64748b', fontSize: '14px' }}>Choose a match to {isOrganizer ? 'start live scoring' : 'view live scores'}</div>
                    </div>
                ) : (
                    <>
                        {/* Scoreboard — visible to everyone */}
                        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '24px', padding: '36px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                            {/* Timer */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '48px', fontWeight: 900, color: '#ef4444', fontVariantNumeric: 'tabular-nums', letterSpacing: '4px' }}>{formatTime(timer)}</div>
                                {isOrganizer && (
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                                        <button onClick={() => {
                                            if (!running && selected.status === 'SCHEDULED' && selected.scheduledAt) {
                                                const scheduledTime = new Date(selected.scheduledAt);
                                                if (new Date() < scheduledTime) {
                                                    alert(`You cannot start scoring before the scheduled time: ${scheduledTime.toLocaleString()}`);
                                                    return;
                                                }
                                            }
                                            setRunning(!running);
                                        }} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: running ? '#ef4444' : '#22c55e', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                                            {running ? '⏸ Pause' : '▶ Start'}
                                        </button>
                                        <button onClick={() => { setTimer(0); setRunning(false); }} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Reset</button>
                                    </div>
                                )}
                                {!isOrganizer && selected.status !== 'LIVE' && (
                                    <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>Waiting for organizer to start the match...</div>
                                )}
                            </div>

                            {/* Score */}
                            <div className="flex-wrap-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', marginBottom: '12px' }}>{selected.homeTeam?.name || 'Home Team'}</div>
                                    <div style={{ fontSize: '72px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{scores.home}</div>
                                    {isOrganizer && (
                                        <button onClick={() => addGoal('home')} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#22c55e', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '16px' }}>
                                            {activeConfig.emoji} +1 {activeConfig.stat}
                                        </button>
                                    )}
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: '#334155' }}>VS</div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', marginBottom: '12px' }}>{selected.awayTeam?.name || 'Away Team'}</div>
                                    <div style={{ fontSize: '72px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{scores.away}</div>
                                    {isOrganizer && (
                                        <button onClick={() => addGoal('away')} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '16px' }}>
                                            {activeConfig.emoji} +1 {activeConfig.stat}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick event buttons — organizer only */}
                        {isOrganizer && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {activeConfig.events?.map((ev: { type: string, label: string }) => (
                                    <button key={ev.type} onClick={() => addEvent(ev.type, ev.label, selected.homeTeam?.name || 'Home')}
                                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                        {EVENT_ICONS[ev.type] || '📝'} {ev.label}
                                    </button>
                                ))}
                                <button onClick={() => addEvent('TIMEOUT', 'Timeout', '')}
                                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                    ⏱️ Timeout
                                </button>
                            </div>
                        )}

                        {/* Event timeline — visible to everyone */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>📝 Match Timeline</h3>
                            {events.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '14px' }}>
                                    {isOrganizer ? 'No events yet. Start the timer and record events as they happen.' : 'No events yet. Events will appear here in real time.'}
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '6px' }}>
                                    {events.map((ev, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444', fontVariantNumeric: 'tabular-nums', width: '50px' }}>{ev.time}</span>
                                            <span style={{ fontSize: '18px' }}>{EVENT_ICONS[ev.type] || '📝'}</span>
                                            <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>{ev.team}</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>— {ev.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Viewer info banner */}
                        {!isOrganizer && (
                            <div style={{ marginTop: '20px', padding: '16px 20px', borderRadius: '12px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '24px' }}>📡</span>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa' }}>Live Updates Active</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Scores and events refresh automatically every few seconds</div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
}

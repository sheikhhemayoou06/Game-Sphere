'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSportStore } from '@/lib/store';
import { sportIcons, sportConfig, defaultSportConfig } from '@/lib/utils';

export default function LiveScoringPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '🔴';
    const [matches, setMatches] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({ home: 0, away: 0 });
    const [events, setEvents] = useState<{ time: string; team: string; type: string; desc: string }[]>([]);

    const activeConfig = selectedSport ? (sportConfig[selectedSport.name] || defaultSportConfig) : defaultSportConfig;
    const [timer, setTimer] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        api.getMatches().then((m) => {
            const filtered = selectedSport ? m.filter((x: any) => x.sport?.name === selectedSport.name || x.sport?.id === selectedSport.id) : m;
            setMatches(filtered);
            const liveOrScheduled = filtered.find((x: any) => x.status === 'IN_PROGRESS' || x.status === 'SCHEDULED');
            if (liveOrScheduled) { setSelected(liveOrScheduled); setScores({ home: liveOrScheduled.homeScore || 0, away: liveOrScheduled.awayScore || 0 }); }
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [running]);

    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const addGoal = (team: 'home' | 'away') => {
        setScores(prev => ({ ...prev, [team]: prev[team] + 1 }));
        const teamName = team === 'home' ? (selected?.homeTeam?.name || 'Home') : (selected?.awayTeam?.name || 'Away');
        setEvents(prev => [{ time: formatTime(timer), team: teamName, type: 'GOAL', desc: 'Goal scored!' }, ...prev]);
    };

    const addEvent = (type: string, desc: string, team: string) => {
        setEvents(prev => [{ time: formatTime(timer), team, type, desc }, ...prev]);
    };

    const EVENT_ICONS: Record<string, string> = {
        SCORE: activeConfig.emoji,
        YELLOW_CARD: '🟨', RED_CARD: '🟥', SUBSTITUTION: '🔄', INJURY: '🏥', TIMEOUT: '⏱️',
        WICKET: '🏏', SIX: '💥', FOUR: '🏏',
        TACKLE: '🤼', RAID: '🏃',
        FOUL: '⚠️', BLOCK: '🛡️', ACE: '🎾', SMASH: '🏸'
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #0f172a 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#94a3b8', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
                <div className="flex-wrap-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>{selectedSport ? `${sportLabel} Live Scoring` : 'Live Scoring'}</h1>
                        <p style={{ color: '#64748b', fontSize: '15px' }}>{selectedSport ? `${sportLabel} real-time match scoring & event tracking` : 'Real-time match scoring & event tracking'}</p>
                    </div>
                    <select value={selected?.id || ''} onChange={(e) => { const m = matches.find(x => x.id === e.target.value); setSelected(m); setScores({ home: m?.homeScore || 0, away: m?.awayScore || 0 }); setEvents([]); setTimer(0); setRunning(false); }}
                        style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>
                        <option value="">Select Match...</option>
                        {matches.map(m => <option key={m.id} value={m.id}>{m.homeTeam?.name || 'TBD'} vs {m.awayTeam?.name || 'TBD'}</option>)}
                    </select>
                </div>

                {!selected ? (
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '60px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔴</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Select a Match</div>
                        <div style={{ color: '#64748b', fontSize: '14px' }}>Choose a match to start live scoring</div>
                    </div>
                ) : (
                    <>
                        {/* Scoreboard */}
                        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '24px', padding: '36px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                            {/* Timer */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '48px', fontWeight: 900, color: '#ef4444', fontVariantNumeric: 'tabular-nums', letterSpacing: '4px' }}>{formatTime(timer)}</div>
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
                            </div>

                            {/* Score */}
                            <div className="flex-wrap-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', marginBottom: '12px' }}>{selected.homeTeam?.name || 'Home Team'}</div>
                                    <div style={{ fontSize: '72px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{scores.home}</div>
                                    <button onClick={() => addGoal('home')} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#22c55e', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '16px' }}>
                                        {activeConfig.emoji} +1 {activeConfig.stat}
                                    </button>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: '#334155' }}>VS</div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', marginBottom: '12px' }}>{selected.awayTeam?.name || 'Away Team'}</div>
                                    <div style={{ fontSize: '72px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{scores.away}</div>
                                    <button onClick={() => addGoal('away')} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '16px' }}>
                                        {activeConfig.emoji} +1 {activeConfig.stat}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick event buttons */}
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

                        {/* Event timeline */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>📝 Match Timeline</h3>
                            {events.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '14px' }}>No events yet. Start the timer and record events as they happen.</div>
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
                    </>
                )}
            </div>
        </div >
    );
}

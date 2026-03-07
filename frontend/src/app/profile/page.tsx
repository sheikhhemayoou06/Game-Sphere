'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore, useSportStore } from '@/lib/store';
import { api } from '@/lib/api';
import { sportIcons } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';
import { User, BarChart3, Users, Trophy, History, ChevronDown, ChevronUp, Settings, MapPin, Phone, Mail, Shield, Award } from 'lucide-react';

type ProfileTab = 'overview' | 'stats' | 'teams' | 'tournaments' | 'history';

/* ═══════ DEFAULT EMPTY STATS ═══════ */
const EMPTY_CRICKET = {
    matches: 0, innings: 0, runs: 0, highScore: 0, avg: 0, strikeRate: 0,
    centuries: 0, fifties: 0, fours: 0, sixes: 0,
    wickets: 0, bowlAvg: 0, economy: 0, bestBowling: '0/0',
    catches: 0, stumpings: 0, runOuts: 0,
};
const EMPTY_FOOTBALL = {
    matches: 0, goals: 0, assists: 0, saves: 0,
    yellowCards: 0, redCards: 0, passAccuracy: 0,
    shotsOnTarget: 0, minutesPlayed: 0,
};

export default function PlayerProfilePage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
    const [showSecondaryStats, setShowSecondaryStats] = useState(false);
    const [careerStats, setCareerStats] = useState({ cricket: EMPTY_CRICKET, football: EMPTY_FOOTBALL });
    const [recentMatches, setRecentMatches] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [injuries] = useState<any[]>([]);
    const [performanceIndex, setPerformanceIndex] = useState(0);
    const [teams, setTeams] = useState<any[]>([]);

    const selectedSportKey = selectedSport?.name?.toLowerCase() as 'cricket' | 'football' | undefined;

    /* ── Force refresh profile ── */
    useEffect(() => {
        api.getProfile().then((updatedUser: any) => {
            const token = localStorage.getItem('token');
            if (updatedUser && token) useAuthStore.getState().setAuth(updatedUser, token);
        }).catch(() => { });
    }, []);

    /* ── Fetch all profile data ── */
    useEffect(() => {
        const playerId = user?.player?.id;
        if (!playerId) return;

        // Teams
        api.getMyTeams?.()?.then?.((t: any[]) => {
            if (Array.isArray(t)) setTeams(t);
        }).catch(() => { });

        // Matches & career stats
        api.getMatches?.()?.then?.((matches: any[]) => {
            if (!Array.isArray(matches)) return;
            const playerMatches = matches.filter((m: any) =>
                m.playerStats?.some((ps: any) => ps.playerId === playerId)
            ).slice(0, 10).map((m: any) => {
                const stat = m.playerStats?.find((ps: any) => ps.playerId === playerId);
                const sd = stat?.statsData ? (typeof stat.statsData === 'string' ? JSON.parse(stat.statsData) : stat.statsData) : {};
                return {
                    opponent: m.awayTeam?.name || m.homeTeam?.name || 'Unknown',
                    result: m.winnerTeamId ? 'Won' : 'Draw',
                    date: m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—',
                    performance: sd.runs ? `${sd.runs} runs` : sd.goals ? `${sd.goals} goals` : '—',
                    sport: m.sport?.name || 'Unknown',
                    tournament: m.tournament?.name || '—',
                };
            });
            setRecentMatches(playerMatches);

            // Cricket stats
            const cricketMatches = matches.filter((m: any) =>
                m.sport?.name?.toLowerCase() === 'cricket' && m.playerStats?.some((ps: any) => ps.playerId === playerId)
            );
            if (cricketMatches.length > 0) {
                let totalRuns = 0, totalWickets = 0, highScore = 0, totalCatches = 0;
                cricketMatches.forEach((m: any) => {
                    const stat = m.playerStats?.find((ps: any) => ps.playerId === playerId);
                    const sd = stat?.statsData ? (typeof stat.statsData === 'string' ? JSON.parse(stat.statsData) : stat.statsData) : {};
                    totalRuns += sd.runs || 0;
                    totalWickets += sd.wickets || 0;
                    totalCatches += sd.catches || 0;
                    if ((sd.runs || 0) > highScore) highScore = sd.runs || 0;
                });
                setCareerStats(prev => ({
                    ...prev,
                    cricket: { ...EMPTY_CRICKET, matches: cricketMatches.length, innings: cricketMatches.length, runs: totalRuns, highScore, avg: Math.round((totalRuns / cricketMatches.length) * 100) / 100, wickets: totalWickets, catches: totalCatches },
                }));
            }

            // Football stats
            const footballMatches = matches.filter((m: any) =>
                m.sport?.name?.toLowerCase() === 'football' && m.playerStats?.some((ps: any) => ps.playerId === playerId)
            );
            if (footballMatches.length > 0) {
                let totalGoals = 0, totalAssists = 0;
                footballMatches.forEach((m: any) => {
                    const stat = m.playerStats?.find((ps: any) => ps.playerId === playerId);
                    const sd = stat?.statsData ? (typeof stat.statsData === 'string' ? JSON.parse(stat.statsData) : stat.statsData) : {};
                    totalGoals += sd.goals || 0;
                    totalAssists += sd.assists || 0;
                });
                setCareerStats(prev => ({
                    ...prev,
                    football: { ...EMPTY_FOOTBALL, matches: footballMatches.length, goals: totalGoals, assists: totalAssists },
                }));
            }
        }).catch(() => { });

        // Certificates & achievements
        api.getCertificates?.()?.then?.((certs: any[]) => {
            if (!Array.isArray(certs)) return;
            const pc = certs.filter((c: any) => c.playerId === playerId);
            setCertificates(pc.map((c: any) => ({
                title: c.tournamentName || c.recipientName || 'Certificate',
                type: c.type || 'PARTICIPATION',
                date: c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—',
                sport: c.sportName || 'General',
            })));
            setAchievements(pc.filter((c: any) => c.type === 'WINNER' || c.type === 'AWARD').map((c: any) => ({
                title: c.tournamentName || c.recipientName || 'Achievement',
                icon: c.type === 'WINNER' ? '🏆' : '🏅',
                date: c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—',
                sport: c.sportName || 'General',
            })));
        }).catch(() => { });

        // Transfers
        api.getTransfers?.()?.then?.((allTxs: any[]) => {
            const txs = Array.isArray(allTxs) ? allTxs.filter((t: any) => t.playerId === playerId) : [];
            setTransfers(txs.map((t: any) => ({
                from: t.fromTeam?.name || 'Free Agent',
                to: t.toTeam?.name || 'Unknown',
                date: t.requestedAt ? new Date(t.requestedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—',
                status: t.status || 'PENDING',
            })));
        }).catch(() => { });

        // Rankings
        api.getPlayerRankings?.(playerId)?.then?.((rankings: any[]) => {
            if (Array.isArray(rankings) && rankings.length > 0) setPerformanceIndex(Math.round(rankings[0].points || 0));
        }).catch(() => { });

        // Tournaments
        api.getTournaments?.()?.then?.((t: any[]) => {
            if (Array.isArray(t)) setTournaments(t.slice(0, 20));
        }).catch(() => { });
    }, [user]);

    /* ── Player info ── */
    const playerName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Player';
    const initials = playerName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const sportsId = user?.player?.sportsId || 'Pending';
    const phone = user?.phone ? `+${user?.countryCode || '91'} ${user.phone}` : '—';
    const email = user?.email || '—';
    const district = user?.player?.district || '—';
    const state = user?.player?.state || '—';
    const country = user?.player?.country || 'India';
    const height = user?.player?.heightCm ? `${user.player.heightCm} cm` : '—';
    const gender = user?.player?.gender || '—';
    const verified = user?.isVerified || false;
    const primarySport = selectedSport?.name || user?.player?.primarySport || '—';

    const cs = careerStats.cricket;
    const fs = careerStats.football;
    const totalMatches = cs.matches + fs.matches;
    const winCount = recentMatches.filter(m => m.result === 'Won').length;
    const winRate = recentMatches.length > 0 ? Math.round((winCount / recentMatches.length) * 100) : 0;

    const TABS: { key: ProfileTab; icon: any; label: string }[] = [
        { key: 'overview', icon: <User size={18} />, label: 'Overview' },
        { key: 'stats', icon: <BarChart3 size={18} />, label: 'Stats' },
        { key: 'teams', icon: <Users size={18} />, label: 'Teams' },
        { key: 'tournaments', icon: <Trophy size={18} />, label: 'Tournaments' },
        { key: 'history', icon: <History size={18} />, label: 'History' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageNavbar title="Profile" />

            {/* ── Hero Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)',
                padding: '28px 16px 48px', position: 'relative',
            }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', fontWeight: 900, color: 'white',
                        border: '3px solid rgba(255,255,255,0.2)', overflow: 'hidden',
                    }}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>{playerName}</h1>
                            {verified && (
                                <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(34,197,94,0.2)', color: '#4ade80', fontSize: '10px', fontWeight: 700 }}>✓ Verified</span>
                            )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '6px' }}>
                            ID: {sportsId} • {primarySport} • {gender}
                        </div>
                        {/* Quick stats row */}
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {[
                                { label: 'Matches', value: totalMatches },
                                { label: 'Win %', value: `${winRate}%` },
                                { label: 'PI', value: performanceIndex },
                            ].map(s => (
                                <div key={s.label}>
                                    <div style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>{s.value}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Edit button */}
                    <Link href="/settings" style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                    }}>
                        <Settings size={16} color="rgba(255,255,255,0.7)" />
                    </Link>
                </div>
            </div>

            {/* ── Icon-Only Tab Bar ── */}
            <div style={{
                background: 'white', borderBottom: '1px solid #e2e8f0',
                position: 'sticky', top: '45px', zIndex: 49,
                marginTop: '-24px', borderRadius: '16px 16px 0 0',
            }}>
                <div style={{
                    maxWidth: '700px', margin: '0 auto',
                    display: 'flex', justifyContent: 'center',
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            title={tab.label}
                            style={{
                                flex: 1, padding: '14px 0', border: 'none', background: 'none',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '4px',
                                color: activeTab === tab.key ? '#4f46e5' : '#94a3b8',
                                borderBottom: activeTab === tab.key ? '3px solid #4f46e5' : '3px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab.icon}
                            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px 16px 80px' }}>

                {/* ═══════ OVERVIEW TAB ═══════ */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gap: '14px' }}>
                        {/* Personal Info */}
                        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={14} /> Personal Info
                            </h3>
                            {[
                                { icon: <Phone size={13} />, label: 'Phone', value: phone },
                                { icon: <Mail size={13} />, label: 'Email', value: email },
                                { icon: <MapPin size={13} />, label: 'Location', value: `${district}, ${state}, ${country}` },
                                { icon: <Shield size={13} />, label: 'Height', value: height },
                                { icon: <Award size={13} />, label: 'Primary Sport', value: primarySport },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '8px 0', borderBottom: i < 4 ? '1px solid #f8fafc' : 'none',
                                }}>
                                    <span style={{ color: '#94a3b8' }}>{item.icon}</span>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', width: '80px' }}>{item.label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Recent Matches */}
                        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>⚡ Recent Matches</h3>
                            {recentMatches.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No recent matches.</div>
                            ) : (
                                recentMatches.slice(0, 5).map((m, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0',
                                        borderBottom: i < Math.min(recentMatches.length, 5) - 1 ? '1px solid #f8fafc' : 'none',
                                    }}>
                                        <div style={{
                                            width: '6px', height: '6px', borderRadius: '50%',
                                            background: m.result === 'Won' ? '#22c55e' : '#94a3b8',
                                        }} />
                                        <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>vs {m.opponent}</div>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{m.performance}</span>
                                        <span style={{ fontSize: '10px', color: '#cbd5e1' }}>{m.date}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Achievements */}
                        {achievements.length > 0 && (
                            <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>🏅 Achievements</h3>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {achievements.map((a, i) => (
                                        <div key={i} style={{
                                            padding: '8px 14px', borderRadius: '10px',
                                            background: '#fffbeb', border: '1px solid #fef3c7',
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                        }}>
                                            <span style={{ fontSize: '16px' }}>{a.icon}</span>
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>{a.title}</div>
                                                <div style={{ fontSize: '10px', color: '#b45309' }}>{a.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ STATS TAB ═══════ */}
                {activeTab === 'stats' && (
                    <div style={{ display: 'grid', gap: '14px' }}>
                        {/* Primary Stats */}
                        {selectedSportKey === 'cricket' || (!selectedSportKey && cs.matches > 0) ? (
                            <>
                                <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '14px' }}>🏏 Batting (Primary)</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                        {[
                                            { label: 'Matches', value: cs.matches },
                                            { label: 'Innings', value: cs.innings },
                                            { label: 'Runs', value: cs.runs },
                                            { label: 'High Score', value: cs.highScore },
                                            { label: 'Average', value: cs.avg },
                                            { label: 'Strike Rate', value: cs.strikeRate },
                                            { label: '100s', value: cs.centuries },
                                            { label: '50s', value: cs.fifties },
                                            { label: '4s', value: cs.fours },
                                            { label: '6s', value: cs.sixes },
                                        ].map(s => (
                                            <div key={s.label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '10px', background: '#f8fafc' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b' }}>{s.value}</div>
                                                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Secondary Stats Toggle */}
                                <button
                                    onClick={() => setShowSecondaryStats(!showSecondaryStats)}
                                    style={{
                                        padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        background: 'white', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'space-between', width: '100%',
                                    }}
                                >
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5' }}>
                                        {showSecondaryStats ? 'Hide' : 'Show'} Bowling & Fielding Stats
                                    </span>
                                    {showSecondaryStats ? <ChevronUp size={16} color="#4f46e5" /> : <ChevronDown size={16} color="#4f46e5" />}
                                </button>

                                {showSecondaryStats && (
                                    <>
                                        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '14px' }}>🎯 Bowling</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                                {[
                                                    { label: 'Wickets', value: cs.wickets },
                                                    { label: 'Bowl Avg', value: cs.bowlAvg },
                                                    { label: 'Economy', value: cs.economy },
                                                    { label: 'Best Bowling', value: cs.bestBowling },
                                                ].map(s => (
                                                    <div key={s.label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '10px', background: '#f8fafc' }}>
                                                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b' }}>{s.value}</div>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '14px' }}>🧤 Fielding</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                                {[
                                                    { label: 'Catches', value: cs.catches },
                                                    { label: 'Stumpings', value: cs.stumpings },
                                                    { label: 'Run Outs', value: cs.runOuts },
                                                ].map(s => (
                                                    <div key={s.label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '10px', background: '#f8fafc' }}>
                                                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b' }}>{s.value}</div>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : null}

                        {selectedSportKey === 'football' || (!selectedSportKey && fs.matches > 0) ? (
                            <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '14px' }}>⚽ Football Stats</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {[
                                        { label: 'Matches', value: fs.matches },
                                        { label: 'Goals', value: fs.goals },
                                        { label: 'Assists', value: fs.assists },
                                        { label: 'Saves', value: fs.saves },
                                        { label: 'Yellow Cards', value: fs.yellowCards },
                                        { label: 'Red Cards', value: fs.redCards },
                                        { label: 'Pass Acc %', value: fs.passAccuracy },
                                        { label: 'Shots on Target', value: fs.shotsOnTarget },
                                        { label: 'Minutes', value: fs.minutesPlayed },
                                    ].map(s => (
                                        <div key={s.label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '10px', background: '#f8fafc' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b' }}>{s.value}</div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Performance Index */}
                        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>📊 Performance Index</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: `conic-gradient(#4f46e5 ${performanceIndex}%, #e2e8f0 ${performanceIndex}%)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%', background: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '16px', fontWeight: 900, color: '#4f46e5',
                                    }}>{performanceIndex}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b' }}>
                                        {performanceIndex >= 80 ? 'Excellent' : performanceIndex >= 60 ? 'Good' : performanceIndex >= 40 ? 'Average' : 'Developing'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Based on your overall performance</div>
                                </div>
                            </div>
                        </div>

                        {totalMatches === 0 && (
                            <div style={{ padding: '40px 20px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b' }}>No stats yet</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Play matches to build your stats profile.</div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ TEAMS TAB ═══════ */}
                {activeTab === 'teams' && (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {teams.length === 0 ? (
                            <div style={{ padding: '50px 20px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛡️</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b' }}>No teams yet</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Join a team to see it here.</div>
                            </div>
                        ) : (
                            teams.map((team, i) => {
                                const level = team.level || team.district ? (
                                    team.state === 'National' || team.level === 'NATIONAL' ? 'National'
                                        : team.level === 'STATE' ? 'State'
                                            : team.level === 'DISTRICT' ? 'District'
                                                : 'Local'
                                ) : 'Local';
                                const levelColors: Record<string, { bg: string; text: string; border: string }> = {
                                    'National': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
                                    'State': { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
                                    'District': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
                                    'Local': { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
                                };
                                const lc = levelColors[level] || levelColors['Local'];

                                return (
                                    <div key={i} style={{
                                        padding: '16px', borderRadius: '14px', background: 'white',
                                        border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '14px',
                                    }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '14px',
                                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: '18px', fontWeight: 800, flexShrink: 0,
                                            overflow: 'hidden',
                                        }}>
                                            {team.logo && team.logo.startsWith('http') ? (
                                                <img src={team.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : team.name?.charAt(0) || '⚡'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b' }}>{team.name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                                {team.sport?.name || '—'} • {team.city || district}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                                            background: lc.bg, color: lc.text, border: `1px solid ${lc.border}`,
                                            textTransform: 'uppercase', letterSpacing: '0.3px',
                                        }}>{level}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* ═══════ TOURNAMENTS TAB ═══════ */}
                {activeTab === 'tournaments' && (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {tournaments.length === 0 ? (
                            <div style={{ padding: '50px 20px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏆</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b' }}>No tournaments</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Tournament participation will appear here.</div>
                            </div>
                        ) : (
                            tournaments.map((t, i) => {
                                const statusColor: Record<string, string> = {
                                    LIVE: '#ef4444', REGISTRATION: '#f59e0b', COMPLETED: '#22c55e', DRAFT: '#94a3b8',
                                };
                                return (
                                    <Link key={i} href={`/tournaments/${t.id}`} style={{
                                        padding: '16px', borderRadius: '14px', background: 'white',
                                        border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '14px',
                                        textDecoration: 'none', color: 'inherit',
                                    }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '12px',
                                            background: `${statusColor[t.status] || '#6366f1'}12`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                                        }}>
                                            {t.status === 'LIVE' ? '🔴' : t.status === 'COMPLETED' ? '✅' : '🏆'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                                {t.sport?.name || '—'} • {t.format || '—'} • {t._count?.teams || 0} teams
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                                            background: `${statusColor[t.status] || '#6366f1'}12`,
                                            color: statusColor[t.status] || '#6366f1',
                                            textTransform: 'uppercase',
                                        }}>{t.status}</span>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                )}

                {/* ═══════ HISTORY TAB ═══════ */}
                {activeTab === 'history' && (
                    <div style={{ display: 'grid', gap: '14px' }}>

                        {/* Injuries */}
                        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>🏥 Injuries</h3>
                            {injuries.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No injury records. Keep it that way! 💪</div>
                            ) : (
                                injuries.map((inj: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: i < injuries.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                        <span style={{ fontSize: '16px' }}>🏥</span>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{inj.type || 'Injury'}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{inj.date} • {inj.recovery || 'Recovered'}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Transfers */}
                        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>🔁 Transfers</h3>
                            {transfers.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No transfer history.</div>
                            ) : (
                                transfers.map((tr, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0',
                                        borderBottom: i < transfers.length - 1 ? '1px solid #f8fafc' : 'none',
                                    }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                                        }}>🔁</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{tr.from} → {tr.to}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{tr.date}</div>
                                        </div>
                                        <span style={{
                                            padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                                            background: tr.status === 'APPROVED' ? '#f0fdf4' : tr.status === 'PENDING' ? '#fffbeb' : '#fef2f2',
                                            color: tr.status === 'APPROVED' ? '#16a34a' : tr.status === 'PENDING' ? '#d97706' : '#dc2626',
                                        }}>{tr.status}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Certificates */}
                        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>📜 Certificates</h3>
                            {certificates.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No certificates yet.</div>
                            ) : (
                                certificates.map((cert, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0',
                                        borderBottom: i < certificates.length - 1 ? '1px solid #f8fafc' : 'none',
                                    }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: cert.type === 'WINNER' ? '#fffbeb' : '#f0f0ff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                                        }}>{cert.type === 'WINNER' ? '🏆' : cert.type === 'AWARD' ? '🏅' : '📜'}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{cert.title}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{cert.type} • {cert.date}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Awards / Achievements */}
                        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>🥇 Awards</h3>
                            {achievements.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No awards yet. Keep grinding!</div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                    {achievements.map((a, i) => (
                                        <div key={i} style={{
                                            padding: '14px', borderRadius: '12px', background: '#fffbeb',
                                            border: '1px solid #fef3c7', textAlign: 'center',
                                        }}>
                                            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{a.icon}</div>
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>{a.title}</div>
                                            <div style={{ fontSize: '10px', color: '#b45309', marginTop: '2px' }}>{a.date}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

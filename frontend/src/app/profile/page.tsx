'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore, useSportStore } from '@/lib/store';
import { api } from '@/lib/api';
import { sportIcons } from '@/lib/utils';
import { Fingerprint } from 'lucide-react';

type RoleView = 'owner' | 'player';
function getProfileRole(role: string): RoleView {
    if (['ORGANIZER', 'TEAM_MANAGER'].includes(role)) return 'owner';
    return 'player';
}

/* ═══════ DEFAULT EMPTY STATS (no hardcoded fakes) ═══════ */

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
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '👤';
    const roleView = getProfileRole(user?.role || 'PLAYER');

    const [editMode, setEditMode] = useState(false);
    const selectedSportKey = selectedSport?.name?.toLowerCase() as 'cricket' | 'football' | undefined;
    const defaultTab = selectedSportKey && (selectedSportKey === 'cricket' || selectedSportKey === 'football') ? selectedSportKey : 'overview';
    const [activeTab, setActiveTab] = useState<'overview' | 'cricket' | 'football' | 'tournaments' | 'history'>(defaultTab);
    const [ownerTab, setOwnerTab] = useState<'team' | 'financial' | 'seasons'>('team');

    // Real data states (default: empty/zero)
    const [careerStats, setCareerStats] = useState({ cricket: EMPTY_CRICKET, football: EMPTY_FOOTBALL });
    const [recentMatches, setRecentMatches] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [injuries] = useState<any[]>([]);
    const [performanceIndex, setPerformanceIndex] = useState(0);

    useEffect(() => {
        if (selectedSportKey && activeTab !== 'overview' && activeTab !== 'tournaments' && activeTab !== 'history' && activeTab !== selectedSportKey) {
            setActiveTab('overview');
        }
    }, [selectedSportKey, activeTab]);

    // Force hydrate the store so old sessions receive the latest playerSports metadata
    useEffect(() => {
        api.getProfile().then((updatedUser: any) => {
            const token = localStorage.getItem('token');
            if (updatedUser && token) {
                useAuthStore.getState().setAuth(updatedUser, token);
            }
        }).catch(() => { });
    }, []);

    // Fetch real profile data from backend APIs
    useEffect(() => {
        const playerId = user?.player?.id;
        if (!playerId) return;

        // Fetch recent matches
        api.getMatches?.()?.then?.((matches: any[]) => {
            if (!Array.isArray(matches)) return;
            const playerMatches = matches.filter((m: any) =>
                m.playerStats?.some((ps: any) => ps.playerId === playerId)
            ).slice(0, 6).map((m: any) => {
                const stat = m.playerStats?.find((ps: any) => ps.playerId === playerId);
                const statsData = stat?.statsData ? (typeof stat.statsData === 'string' ? JSON.parse(stat.statsData) : stat.statsData) : {};
                return {
                    opponent: m.awayTeam?.name || m.homeTeam?.name || 'Unknown',
                    result: m.winnerTeamId ? (m.homeTeam?.name ? 'Won' : 'Lost') : 'Draw',
                    score: m.scoreData || '—',
                    date: m.scheduledAt ? new Date(m.scheduledAt).toISOString().split('T')[0] : '—',
                    performance: statsData.runs ? `${statsData.runs} runs` : '—',
                    sport: m.sport?.name || 'Unknown',
                };
            });
            setRecentMatches(playerMatches);

            // Calculate career stats from match data
            const cricketMatches = matches.filter((m: any) =>
                m.sport?.name?.toLowerCase() === 'cricket' &&
                m.playerStats?.some((ps: any) => ps.playerId === playerId)
            );
            const footballMatches = matches.filter((m: any) =>
                m.sport?.name?.toLowerCase() === 'football' &&
                m.playerStats?.some((ps: any) => ps.playerId === playerId)
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
                    cricket: {
                        ...EMPTY_CRICKET,
                        matches: cricketMatches.length,
                        innings: cricketMatches.length,
                        runs: totalRuns,
                        highScore,
                        avg: cricketMatches.length > 0 ? Math.round((totalRuns / cricketMatches.length) * 100) / 100 : 0,
                        wickets: totalWickets,
                        catches: totalCatches,
                    }
                }));
            }

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
                    football: {
                        ...EMPTY_FOOTBALL,
                        matches: footballMatches.length,
                        goals: totalGoals,
                        assists: totalAssists,
                    }
                }));
            }
        }).catch(() => { });

        // Fetch certificates
        api.getCertificates?.()?.then?.((certs: any[]) => {
            if (!Array.isArray(certs)) return;
            const playerCerts = certs.filter((c: any) => c.playerId === playerId);
            setCertificates(playerCerts.map((c: any) => ({
                title: c.tournamentName || c.recipientName || 'Certificate',
                type: c.type || 'PARTICIPATION',
                date: c.issuedAt ? new Date(c.issuedAt).toISOString().substring(0, 7) : '—',
                qr: !!c.verificationCode,
                sport: c.sportName || 'General',
            })));
            // Derive achievements from certificates
            setAchievements(playerCerts.filter((c: any) => c.type === 'WINNER' || c.type === 'AWARD').map((c: any) => ({
                title: c.tournamentName || c.recipientName || 'Achievement',
                icon: c.type === 'WINNER' ? '🏆' : '🏅',
                date: c.issuedAt ? new Date(c.issuedAt).toISOString().substring(0, 7) : '—',
                sport: c.sportName || 'General',
            })));
        }).catch(() => { });

        // Fetch transfers
        api.getTransfers?.()?.then?.((allTxs: any[]) => {
            const txs = Array.isArray(allTxs) ? allTxs.filter((t: any) => t.playerId === playerId) : [];
            if (txs.length === 0) return;
            setTransfers(txs.map((t: any) => ({
                from: t.fromTeam?.name || 'Free Agent',
                to: t.toTeam?.name || 'Unknown',
                date: t.requestedAt ? new Date(t.requestedAt).toISOString().substring(0, 7) : '—',
                status: t.status || 'PENDING',
                fee: t.transferFee ? `₹${t.transferFee.toLocaleString('en-IN')}` : '₹0',
                sport: 'General',
            })));
        }).catch(() => { });

        // Fetch ranking for PI score
        api.getPlayerRankings?.(playerId)?.then?.((rankings: any[]) => {
            if (Array.isArray(rankings) && rankings.length > 0) {
                setPerformanceIndex(Math.round(rankings[0].points || 0));
            }
        }).catch(() => { });
    }, [user]);

    // Sport filtering
    const filteredTournaments = selectedSport ? tournaments.filter(t => t.sport === selectedSport.name) : tournaments;
    const filteredAchievements = selectedSport ? achievements.filter(a => a.sport === selectedSport.name) : achievements;
    const filteredMatches = selectedSport ? recentMatches.filter(m => m.sport === selectedSport.name) : recentMatches;
    const filteredCertificates = selectedSport ? certificates.filter(c => c.sport === selectedSport.name) : certificates;
    const filteredTransfers = selectedSport ? transfers.filter(t => t.sport === selectedSport.name) : transfers;
    const filteredInjuries = selectedSport ? injuries.filter((i: any) => i.sport === selectedSport.name) : injuries;

    const dynamicPlayer = {
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'New Player',
        sportsId: user?.player?.sportsId || 'USI-Pending',
        phone: user?.phone ? `+${user?.countryCode || '91'} ${user.phone}` : 'Not set',
        email: user?.email || 'Not set',
        district: user?.player?.district || 'Not set',
        state: user?.player?.state || 'Not set',
        country: user?.player?.country || 'India',
        height: user?.player?.heightCm ? `${user.player.heightCm} cm` : 'Not set',
        gender: user?.player?.gender || 'Not Specified',
        verified: user?.isVerified || false,
        photo: user?.avatar ? (
            <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : '👤',
        primarySport: selectedSport?.name || 'Not set',
        secondarySport: '',
        level: 'DISTRICT',
        age: 0,
        bloodGroup: 'Not set',
        dob: '',
        weight: 'Not set',
        battingStyle: 'Not set',
        bowlingStyle: 'Not set',
        position: 'Player',
        jerseyNo: 0,
        performanceIndex,
    };

    const [form, setForm] = useState({
        name: dynamicPlayer.name, phone: user?.phone || dynamicPlayer.phone, email: dynamicPlayer.email,
        district: dynamicPlayer.district, state: dynamicPlayer.state, country: dynamicPlayer.country,
        height: user?.player?.heightCm?.toString() || dynamicPlayer.height, gender: dynamicPlayer.gender,
        weight: dynamicPlayer.weight, battingStyle: dynamicPlayer.battingStyle, bowlingStyle: dynamicPlayer.bowlingStyle,
    });

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!editMode) {
            setEditMode(true);
            return;
        }
        setSaving(true);
        try {
            const updatedUser = await api.updateProfile(form);
            const token = localStorage.getItem('token');
            if (updatedUser && token) {
                useAuthStore.getState().setAuth(updatedUser, token);
            }
            setEditMode(false);
        } catch (error) {
            console.error('Failed to save profile', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const cs = careerStats.cricket;
    const fs = careerStats.football;
    const totalMatches = cs.matches + fs.matches;
    const winRate = totalMatches > 0 ? Math.round((recentMatches.filter(m => m.result === 'Won').length / Math.max(recentMatches.length, 1)) * 100) : 0;
    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

    /* ═══════ OWNER VIEW ═══════ */
    if (roleView === 'owner') {
        const TEAM_PROFILE = {
            name: user?.firstName ? `${user.firstName}'s Team` : 'No Team Yet', logo: '⚡', sport: selectedSport?.name || 'Not set', founded: '—',
            owner: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Not set', coach: 'Not set', homeGround: 'Not set',
            city: user?.player?.district || 'Not set', players: 0, wins: 0, losses: 0, draws: 0, titles: 0,
            rating: 0, rank: 'Unranked',
        };
        const SEASON_HISTORY: any[] = [];
        const FINANCIALS = [
            { label: 'Total Revenue', value: fmt(0), color: '#16a34a' },
            { label: 'Total Expenses', value: fmt(0), color: '#ef4444' },
            { label: 'Auction Spend', value: fmt(0), color: '#f59e0b' },
            { label: 'Sponsorship', value: fmt(0), color: '#7c3aed' },
            { label: 'Player Registrations', value: fmt(0), color: '#0ea5e9' },
            { label: 'Venue Costs', value: fmt(0), color: '#ec4899' },
        ];
        const tp = TEAM_PROFILE;

        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#a5b4fc', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Link href="/dashboard" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
                        <button onClick={handleSave} disabled={saving} style={{
                            padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                            background: editMode ? '#22c55e' : 'rgba(255,255,255,0.1)', color: '#fff',
                            fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: saving ? 0.7 : 1
                        }}>
                            {saving ? 'Saving...' : editMode ? '✓ Save Profile' : '✏️ Edit Profile'}
                        </button>
                    </div>
                </nav>

                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
                    {/* Team Header */}
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' as const }}>
                        <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px', border: '3px solid rgba(255,255,255,0.2)' }}>⚡</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ flex: 1 }}>
                                {editMode ? (
                                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        style={{ fontSize: '28px', fontWeight: 900, color: '#fff', background: 'rgba(255,255,255,0.1)', border: '2px solid #6366f1', borderRadius: '8px', padding: '4px 12px', marginBottom: '6px' }} />
                                ) : (
                                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>{form.name ? `${form.name}'s Setup` : tp.name}</h1>
                                )}
                                <div style={{ fontSize: '14px', color: '#a5b4fc', fontWeight: 600, marginBottom: '8px' }}>🏏 {tp.sport} • 📍 {tp.city} • 🏟️ {tp.homeGround}</div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                                    {[`👤 Owner: ${tp.owner}`, `🎯 Coach: ${tp.coach}`, `📅 Est. ${tp.founded}`, `⭐ Rating: ${tp.rating}`].map(tag => (
                                        <span key={tag} style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '12px', fontWeight: 600 }}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Manager Contact Details */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px', minWidth: '220px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>PERSONAL DETAILS</div>
                            {editMode ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { label: 'Phone', key: 'phone' as const },
                                        { label: 'Email', key: 'email' as const },
                                        { label: 'District', key: 'district' as const },
                                        { label: 'State', key: 'state' as const },
                                    ].map(f => (
                                        <div key={f.key} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', color: '#64748b', width: '60px' }}>{f.label}:</span>
                                            <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                                style={{ flex: 1, padding: '5px 10px', borderRadius: '6px', border: '1px solid #4338ca', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '12px' }} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                                    <span>📞 {form.phone}</span>
                                    <span>📧 {form.email}</span>
                                    <span>📍 {form.district}, {form.state}, {form.country}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
                        {[
                            { label: 'Matches', value: tp.wins + tp.losses + tp.draws, color: '#6366f1' },
                            { label: 'Wins', value: tp.wins, color: '#22c55e' },
                            { label: 'Losses', value: tp.losses, color: '#ef4444' },
                            { label: 'Win Rate', value: `${Math.round((tp.wins / (tp.wins + tp.losses + tp.draws)) * 100)}%`, color: '#f59e0b' },
                            { label: 'Titles', value: tp.titles, color: '#ec4899' },
                            { label: 'Rating', value: tp.rating, color: '#8b5cf6' },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px', textAlign: 'center' as const, border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Owner Tabs */}
                    <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
                        {[
                            { key: 'team' as const, label: '👥 Team Profile' },
                            { key: 'financial' as const, label: '💰 Financial Summary' },
                            { key: 'seasons' as const, label: '📅 Season History' },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setOwnerTab(tab.key)} style={{
                                padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                background: ownerTab === tab.key ? '#6366f1' : 'rgba(255,255,255,0.08)',
                                color: ownerTab === tab.key ? '#fff' : '#a5b4fc', fontWeight: 700, fontSize: '13px',
                            }}>{tab.label}</button>
                        ))}
                    </div>

                    {ownerTab === 'team' && (
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>🏟️ Team Details</h3>
                                {[{ l: 'Team Name', v: tp.name }, { l: 'Sport', v: tp.sport }, { l: 'Home Ground', v: tp.homeGround }, { l: 'City', v: tp.city }, { l: 'Founded', v: tp.founded }, { l: 'Owner', v: tp.owner }, { l: 'Head Coach', v: tp.coach }].map(r => (
                                    <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{r.l}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{r.v}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>🏆 Achievements</h3>
                                <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No achievements yet. Participate in tournaments to earn achievements!</div>
                            </div>
                        </div>
                    )}

                    {ownerTab === 'financial' && (
                        <div>
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
                                {FINANCIALS.slice(0, 3).map((f, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px', textAlign: 'center' as const, border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 900, color: f.color }}>{f.value}</div>
                                        <div style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 600, marginTop: '4px' }}>{f.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>📊 Breakdown</h3>
                                {FINANCIALS.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < FINANCIALS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 600 }}>{f.label}</span>
                                        <span style={{ fontSize: '16px', fontWeight: 800, color: f.color }}>{f.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {ownerTab === 'seasons' && (
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', textAlign: 'center' as const, border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>No Season History Yet</div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>Season data will appear here as your team participates in tournaments.</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ═══════ PLAYER VIEW ═══════ */
    let overviewStats = [];
    if (selectedSportKey === 'cricket') {
        overviewStats = [
            { label: 'Matches', value: cs.matches, color: '#6366f1' },
            { label: 'Runs', value: cs.runs.toLocaleString(), color: '#22c55e' },
            { label: 'Wickets', value: cs.wickets, color: '#f59e0b' },
            { label: 'High Score', value: cs.highScore, color: '#ef4444' },
            { label: 'Win Rate', value: `${winRate}%`, color: '#ec4899' },
            { label: 'PI Score', value: performanceIndex, color: '#8b5cf6' }
        ];
    } else if (selectedSportKey === 'football') {
        overviewStats = [
            { label: 'Matches', value: fs.matches, color: '#6366f1' },
            { label: 'Goals', value: fs.goals, color: '#22c55e' },
            { label: 'Assists', value: fs.assists, color: '#f59e0b' },
            { label: 'SOT', value: fs.shotsOnTarget, color: '#ef4444' },
            { label: 'Win Rate', value: `${winRate}%`, color: '#ec4899' },
            { label: 'PI Score', value: performanceIndex, color: '#8b5cf6' }
        ];
    } else if (!selectedSportKey) {
        // All Sports selected
        overviewStats = [
            { label: 'Total Matches', value: cs.matches + fs.matches, color: '#6366f1' },
            { label: 'Total Runs', value: cs.runs.toLocaleString(), color: '#22c55e' },
            { label: 'Total Goals', value: fs.goals, color: '#ef4444' },
            { label: 'Total Wickets', value: cs.wickets, color: '#f59e0b' },
            { label: 'Win Rate', value: `${winRate}%`, color: '#ec4899' },
            { label: 'PI Score', value: performanceIndex, color: '#8b5cf6' }
        ];
    } else {
        // Specific sport selected but no mock data available (e.g. Kabaddi)
        overviewStats = [
            { label: 'Matches', value: 0, color: '#6366f1' },
            { label: 'Points/Goals', value: 0, color: '#22c55e' },
            { label: 'Assists/Defenses', value: 0, color: '#f59e0b' },
            { label: 'Fouls', value: 0, color: '#ef4444' },
            { label: 'Win Rate', value: '0%', color: '#ec4899' },
            { label: 'PI Score', value: performanceIndex, color: '#8b5cf6' }
        ];
    }

    const profileTabs: { key: 'overview' | 'cricket' | 'football' | 'tournaments' | 'history', label: string }[] = [
        { key: 'overview', label: '📋 Overview' }
    ];
    if (!selectedSportKey || selectedSportKey === 'cricket') profileTabs.push({ key: 'cricket', label: '🏏 Cricket Stats' });
    if (!selectedSportKey || selectedSportKey === 'football') profileTabs.push({ key: 'football', label: 'Football Stats' });
    profileTabs.push({ key: 'tournaments', label: '🏆 Tournament Breakdown' });
    profileTabs.push({ key: 'history', label: '📜 History' });

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#a5b4fc', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link href="/dashboard" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
                    <button onClick={handleSave} disabled={saving} style={{
                        padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                        background: editMode ? '#22c55e' : 'rgba(255,255,255,0.1)', color: '#fff',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: saving ? 0.7 : 1
                    }}>
                        {saving ? 'Saving...' : editMode ? '✓ Save Profile' : '✏️ Edit Profile'}
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
                {/* ─── Profile Header ─── */}
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px', flexShrink: 0, border: '3px solid rgba(255,255,255,0.2)' }}>
                        {dynamicPlayer.photo}
                    </div>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            {editMode ? (
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    style={{ fontSize: '28px', fontWeight: 900, color: '#fff', background: 'rgba(255,255,255,0.1)', border: '2px solid #6366f1', borderRadius: '8px', padding: '4px 12px' }} />
                            ) : (
                                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>{form.name}</h1>
                            )}
                            {dynamicPlayer.verified && <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#22c55e', color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓ Verified</span>}
                        </div>
                        <div style={{ fontSize: '14px', color: '#a5b4fc', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Fingerprint size={16} />
                            {(() => {
                                const ps = user?.player?.playerSports;
                                const { selectedSport } = useSportStore.getState();
                                let code = dynamicPlayer.sportsId;
                                let jno = dynamicPlayer.jerseyNo;
                                let pos = selectedSport ? (selectedSport.name === 'Athletics' ? 'Athlete' : 'Player') : dynamicPlayer.position;

                                if (ps && selectedSport) {
                                    const m = ps.find((s: any) => s.sportId === selectedSport.id);
                                    if (m) {
                                        code = m.sportCode || code;
                                        if (m.metadata) {
                                            const meta = typeof m.metadata === 'string' ? JSON.parse(m.metadata) : m.metadata;
                                            if (meta.role) pos = meta.role;
                                            if (meta.Position) pos = meta.Position; // some sports might capitalize
                                            if (meta.position) pos = meta.position; // football form metadata uses 'position'
                                            if (meta.jerseyNo) jno = meta.jerseyNo;
                                        }
                                    }
                                }
                                return `${code} • #${jno} • ${pos}`;
                            })()}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {!selectedSportKey && (
                                <>
                                    <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '12px', fontWeight: 600 }}>🏏 {dynamicPlayer.primarySport}</span>
                                    <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '12px', fontWeight: 600 }}>{dynamicPlayer.secondarySport}</span>
                                </>
                            )}
                            {selectedSportKey && (
                                <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '12px', fontWeight: 600 }}>{sportLabel}</span>
                            )}
                            {[
                                `🏟️ ${dynamicPlayer.level} Level`,
                                `📅 Age ${dynamicPlayer.age}`, `🩸 ${dynamicPlayer.bloodGroup}`,
                            ].map(tag => (
                                <span key={tag} style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '12px', fontWeight: 600 }}>{tag}</span>
                            ))}
                            <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', fontSize: '12px', fontWeight: 700 }}>⚡ PI: {dynamicPlayer.performanceIndex}/100</span>
                        </div>
                    </div>
                    {/* Contact info (editable) */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px', minWidth: '220px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>CONTACT & DETAILS</div>
                        {editMode ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { label: 'Phone', key: 'phone' as const },
                                    { label: 'Email', key: 'email' as const },
                                    { label: 'District', key: 'district' as const },
                                    { label: 'State', key: 'state' as const },
                                    { label: 'Height', key: 'height' as const },
                                    { label: 'Weight', key: 'weight' as const },
                                ].map(f => (
                                    <div key={f.key} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', color: '#64748b', width: '60px' }}>{f.label}:</span>
                                        <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                            style={{ flex: 1, padding: '5px 10px', borderRadius: '6px', border: '1px solid #4338ca', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '12px' }} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                                <span>📞 {form.phone}</span>
                                <span>📧 {form.email}</span>
                                <span>📍 {form.district}, {form.state}, {form.country}</span>
                                <span>👤 {form.gender}</span>
                                <span>📏 {form.height} • {form.weight}</span>
                                <span>🏏 {form.battingStyle}</span>
                                <span>⚾ {form.bowlingStyle}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Career Overview Stats ─── */}
                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {overviewStats.map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ─── Section Dropdown ─── */}
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as any)}
                        style={{
                            padding: '12px 20px', borderRadius: '12px', border: '2px solid rgba(99,102,241,0.4)',
                            background: 'rgba(255,255,255,0.08)', color: '#e2e8f0',
                            fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                            outline: 'none', appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a5b4fc' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                            paddingRight: '40px', minWidth: '240px',
                        }}
                    >
                        {profileTabs.map(tab => (
                            <option key={tab.key} value={tab.key} style={{ background: '#1e1b4b', color: '#e2e8f0' }}>
                                {tab.label}
                            </option>
                        ))}
                    </select>
                    <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600 }}>
                        {profileTabs.find(t => t.key === activeTab)?.label}
                    </span>
                </div>

                {/* ═══ OVERVIEW TAB ═══ */}
                {activeTab === 'overview' && (
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Achievements */}
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>🏆 Achievements ({filteredAchievements.length})</h3>
                                {filteredAchievements.length === 0 && <div style={{ fontSize: '12px', color: '#64748b', padding: '12px 0' }}>No achievements yet</div>}
                                {filteredAchievements.map((a, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < filteredAchievements.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <span style={{ fontSize: '24px' }}>{a.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#e2e8f0' }}>{a.title}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{a.date} • {a.sport}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Matches */}
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>⚡ Recent Matches</h3>
                                {filteredMatches.length === 0 && <div style={{ fontSize: '12px', color: '#64748b', padding: '12px 0' }}>No matches yet</div>}
                                {filteredMatches.map((m, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < filteredMatches.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#e2e8f0' }}>vs {m.opponent}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{m.date} • {m.score}</div>
                                            <div style={{ fontSize: '11px', color: '#a5b4fc', marginTop: '2px' }}>{m.performance}</div>
                                        </div>
                                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: m.result === 'Won' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: m.result === 'Won' ? '#22c55e' : '#ef4444' }}>{m.result}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Certificates */}
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🏅 Certificates</h3>
                                {filteredCertificates.length === 0 && <div style={{ fontSize: '12px', color: '#64748b', padding: '12px 0' }}>No certificates yet</div>}
                                {filteredCertificates.map((c, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < filteredCertificates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '12px', color: '#e2e8f0' }}>{c.title}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b' }}>{c.type} • {c.date}</div>
                                        </div>
                                        {c.qr && <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600 }}>📱 QR Verified</span>}
                                    </div>
                                ))}
                            </div>

                            {/* Transfers */}
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🔄 Transfers</h3>
                                {filteredTransfers.length === 0 && <div style={{ fontSize: '12px', color: '#64748b', padding: '12px 0' }}>No transfers yet</div>}
                                {filteredTransfers.map((t, i) => (
                                    <div key={i} style={{ padding: '8px 0' }}>
                                        <div style={{ fontWeight: 600, fontSize: '12px', color: '#e2e8f0' }}>{t.from} → {t.to}</div>
                                        <div style={{ fontSize: '10px', color: '#64748b' }}>{t.date} • {t.status} • <span style={{ color: '#f59e0b' }}>{t.fee}</span></div>
                                    </div>
                                ))}
                            </div>

                            {/* Injury History */}
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🏥 Injury History</h3>
                                {filteredInjuries.length === 0 && <div style={{ fontSize: '12px', color: '#64748b', padding: '12px 0' }}>No injuries recorded</div>}
                                {filteredInjuries.map((inj, i) => (
                                    <div key={i} style={{ padding: '8px 0', borderBottom: i < filteredInjuries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <div style={{ fontWeight: 600, fontSize: '12px', color: '#e2e8f0' }}>{inj.type}</div>
                                        <div style={{ fontSize: '10px', color: '#64748b' }}>{inj.duration} • {inj.date} • <span style={{ color: '#22c55e' }}>{inj.status}</span></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ CRICKET STATS TAB ═══ */}
                {activeTab === 'cricket' && (
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
                            {/* Batting */}
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>🏏 Batting Statistics</h3>
                                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                                    {[
                                        { label: 'Innings', value: cs.innings, color: '#6366f1' },
                                        { label: 'Runs', value: cs.runs.toLocaleString(), color: '#22c55e' },
                                        { label: 'High Score', value: cs.highScore, color: '#f59e0b' },
                                        { label: 'Average', value: cs.avg, color: '#ec4899' },
                                        { label: 'Strike Rate', value: cs.strikeRate, color: '#8b5cf6' },
                                        { label: 'Centuries', value: cs.centuries, color: '#ef4444' },
                                        { label: 'Fifties', value: cs.fifties, color: '#14b8a6' },
                                        { label: 'Fours', value: cs.fours, color: '#0ea5e9' },
                                        { label: 'Sixes', value: cs.sixes, color: '#f97316' },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bowling */}
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>⚾ Bowling Statistics</h3>
                                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                                    {[
                                        { label: 'Wickets', value: cs.wickets, color: '#f59e0b' },
                                        { label: 'Bowl Avg', value: cs.bowlAvg, color: '#22c55e' },
                                        { label: 'Economy', value: cs.economy, color: '#ef4444' },
                                        { label: 'Best', value: cs.bestBowling, color: '#6366f1' },
                                        { label: 'Catches', value: cs.catches, color: '#14b8a6' },
                                        { label: 'Run Outs', value: cs.runOuts, color: '#ec4899' },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Performance Bar Chart */}
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>📊 Performance Over Last 6 Months</h3>
                            {cs.matches > 0 ? (
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', height: '150px' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e' }}>{cs.runs}</div>
                                        <div style={{ width: '100%', background: 'linear-gradient(180deg, #22c55e, #065f46)', borderRadius: '6px 6px 0 0', height: '80px' }} />
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Total</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '13px' }}>
                                    📉 No match data yet. Play cricket matches to see your performance chart!
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ FOOTBALL STATS TAB ═══ */}
                {activeTab === 'football' && (
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>Football Statistics</h3>
                            <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                                {[
                                    { label: 'Matches', value: fs.matches, color: '#6366f1' },
                                    { label: 'Goals', value: fs.goals, color: '#22c55e' },
                                    { label: 'Assists', value: fs.assists, color: '#f59e0b' },
                                    { label: 'Pass Accuracy', value: `${fs.passAccuracy}%`, color: '#ec4899' },
                                    { label: 'Shots on Target', value: fs.shotsOnTarget, color: '#0ea5e9' },
                                    { label: 'Minutes Played', value: fs.minutesPlayed.toLocaleString(), color: '#8b5cf6' },
                                ].map(s => (
                                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>🟡 Discipline</h3>
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                                {[
                                    { label: 'Yellow Cards', value: fs.yellowCards, color: '#f59e0b' },
                                    { label: 'Red Cards', value: fs.redCards, color: '#ef4444' },
                                ].map(s => (
                                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '36px', fontWeight: 900, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ TOURNAMENT BREAKDOWN TAB ═══ */}
                {activeTab === 'tournaments' && (
                    <div style={{ borderRadius: '20px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ minWidth: '700px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        {['Tournament', 'Sport', 'M', 'Runs/Goals', 'Wkts/Ast', 'Catches', 'Best', 'Result'].map(h => (
                                            <th key={h} style={{ padding: '14px 12px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTournaments.map((t, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '14px 12px', fontWeight: 700, fontSize: '13px', color: '#e2e8f0' }}>{t.name}</td>
                                            <td style={{ padding: '14px 12px' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: '4px', background: t.sport === 'Cricket' ? 'rgba(99,102,241,0.2)' : 'rgba(239,68,68,0.2)', color: t.sport === 'Cricket' ? '#a5b4fc' : '#fca5a5', fontSize: '11px', fontWeight: 600 }}>{t.sport}</span>
                                            </td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#94a3b8', fontWeight: 700 }}>{t.matches}</td>
                                            <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: 800, color: '#22c55e' }}>{t.sport === 'Cricket' ? t.runs : t.bestScore}</td>
                                            <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>{t.sport === 'Cricket' ? t.wickets : '—'}</td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#94a3b8' }}>{t.sport === 'Cricket' ? t.catches : '—'}</td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', fontWeight: 700, color: '#8b5cf6' }}>{t.bestScore}</td>
                                            <td style={{ padding: '14px 12px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 700 }}>{t.result}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ═══ HISTORY TAB ═══ */}
                {activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🏅 Certificates</h3>
                            {filteredCertificates.map((c, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < filteredCertificates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '12px', color: '#e2e8f0' }}>{c.title}</div>
                                        <div style={{ fontSize: '10px', color: '#64748b' }}>{c.type} • {c.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🔄 Transfers</h3>
                            {filteredTransfers.map((t, i) => (
                                <div key={i} style={{ padding: '8px 0' }}>
                                    <div style={{ fontWeight: 600, fontSize: '12px', color: '#e2e8f0' }}>{t.from} → {t.to}</div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>{t.date} • {t.status} • <span style={{ color: '#f59e0b' }}>{t.fee}</span></div>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🏥 Injury History</h3>
                            {filteredInjuries.map((inj, i) => (
                                <div key={i} style={{ padding: '8px 0', borderBottom: i < filteredInjuries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <div style={{ fontWeight: 600, fontSize: '12px', color: '#e2e8f0' }}>{inj.type}</div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>{inj.duration} • {inj.date} • <span style={{ color: '#22c55e' }}>{inj.status}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}

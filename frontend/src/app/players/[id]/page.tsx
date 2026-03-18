'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { sportIcons } from '@/lib/utils';
import { api } from '@/lib/api';
import PageNavbar from '@/components/PageNavbar';
import {
    MapPin, Trophy, UserPlus, MessageSquare, BadgeCheck,
    Info, Users, Calendar, BarChart3, Image as ImageIcon,
    Phone, Mail, MessageCircle, ChevronDown, ChevronUp
} from 'lucide-react';

type TabKey = 'overview' | 'stats' | 'teams';

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
    shotsOnTarget: 0, minutesPlayed: 0, tackles: 0,
    interceptions: 0, cleanSheets: 0, goalsConceded: 0,
};
const EMPTY_BASKETBALL = {
    matches: 0, points: 0, rebounds: 0, assists: 0,
    steals: 0, blocks: 0, turnovers: 0, minutesPlayed: 0,
};
const EMPTY_KABADDI = {
    matches: 0, raidPoints: 0, tacklePoints: 0, superRaids: 0,
    superTackles: 0, totalPoints: 0,
};
const EMPTY_VOLLEYBALL = {
    matches: 0, kills: 0, blocks: 0, aces: 0,
    digs: 0, assists: 0, serviceErrors: 0,
};
const EMPTY_HOCKEY = {
    matches: 0, goals: 0, assists: 0, saves: 0,
    yellowCards: 0, greenCards: 0, penaltyCorners: 0,
};

export default function PlayerProfilePage() {
    const { id } = useParams();
    const [player, setPlayer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [showContactMenu, setShowContactMenu] = useState(false);
    const [showSecondaryStats, setShowSecondaryStats] = useState(false);

    // Career stats state
    const [careerStats, setCareerStats] = useState({
        cricket: EMPTY_CRICKET, football: EMPTY_FOOTBALL,
        basketball: EMPTY_BASKETBALL, kabaddi: EMPTY_KABADDI,
        volleyball: EMPTY_VOLLEYBALL, hockey: EMPTY_HOCKEY,
    });
    const [recentMatches, setRecentMatches] = useState<any[]>([]);
    const [performanceIndex, setPerformanceIndex] = useState(0);

    useEffect(() => {
        if (id) {
            const apiUrl = process.env.NODE_ENV === 'development' && typeof window !== 'undefined'
                ? `http://${window.location.hostname}:4000/api` : (process.env.NEXT_PUBLIC_API_URL || '/api');

            fetch(`${apiUrl}/auth/profile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
                .then((r) => r.json())
                .then((data) => setPlayer(data))
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    }, [id]);

    /* ── Fetch match data & compute career stats ── */
    useEffect(() => {
        const playerId = player?.player?.id;
        if (!playerId) return;

        api.getMatches?.()?.then?.((matches: any[]) => {
            if (!Array.isArray(matches)) return;
            const playerMatches = matches.filter((m: any) =>
                m.playerStats?.some((ps: any) => ps.playerId === playerId)
            ).slice(0, 20).map((m: any) => {
                const stat = m.playerStats?.find((ps: any) => ps.playerId === playerId);
                const sd = stat?.statsData ? (typeof stat.statsData === 'string' ? JSON.parse(stat.statsData) : stat.statsData) : {};
                return {
                    opponent: m.awayTeam?.name || m.homeTeam?.name || 'Unknown',
                    result: m.winnerTeamId ? 'Won' : 'Draw',
                    date: m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—',
                    performance: sd.runs ? `${sd.runs} runs` : sd.goals ? `${sd.goals} goals` : sd.points ? `${sd.points} pts` : '—',
                    sport: m.sport?.name || 'Unknown',
                };
            });
            setRecentMatches(playerMatches);

            // ── Aggregate Cricket Stats ──
            const cricketMatches = matches.filter((m: any) =>
                m.sport?.name?.toLowerCase() === 'cricket' && m.playerStats?.some((ps: any) => ps.playerId === playerId)
            );
            if (cricketMatches.length > 0) {
                let totalRuns = 0, totalWickets = 0, highScore = 0, totalCatches = 0;
                let totalFours = 0, totalSixes = 0, totalCenturies = 0, totalFifties = 0;
                let totalStumpings = 0, totalRunOuts = 0;
                cricketMatches.forEach((m: any) => {
                    const stat = m.playerStats?.find((ps: any) => ps.playerId === playerId);
                    const sd = stat?.statsData ? (typeof stat.statsData === 'string' ? JSON.parse(stat.statsData) : stat.statsData) : {};
                    totalRuns += sd.runs || 0;
                    totalWickets += sd.wickets || 0;
                    totalCatches += sd.catches || 0;
                    totalFours += sd.fours || 0;
                    totalSixes += sd.sixes || 0;
                    totalStumpings += sd.stumpings || 0;
                    totalRunOuts += sd.runOuts || 0;
                    if ((sd.runs || 0) > highScore) highScore = sd.runs || 0;
                    if ((sd.runs || 0) >= 100) totalCenturies++;
                    if ((sd.runs || 0) >= 50 && (sd.runs || 0) < 100) totalFifties++;
                });
                setCareerStats(prev => ({
                    ...prev,
                    cricket: {
                        ...EMPTY_CRICKET, matches: cricketMatches.length, innings: cricketMatches.length,
                        runs: totalRuns, highScore,
                        avg: Math.round((totalRuns / cricketMatches.length) * 100) / 100,
                        wickets: totalWickets, catches: totalCatches,
                        fours: totalFours, sixes: totalSixes,
                        centuries: totalCenturies, fifties: totalFifties,
                        stumpings: totalStumpings, runOuts: totalRunOuts,
                    },
                }));
            }

            // ── Aggregate Football Stats ──
            const footballMatches = matches.filter((m: any) =>
                m.sport?.name?.toLowerCase() === 'football' && m.playerStats?.some((ps: any) => ps.playerId === playerId)
            );
            if (footballMatches.length > 0) {
                let totalGoals = 0, totalAssists = 0, totalSaves = 0, totalTackles = 0;
                let totalYellow = 0, totalRed = 0, totalMinutes = 0;
                footballMatches.forEach((m: any) => {
                    const stat = m.playerStats?.find((ps: any) => ps.playerId === playerId);
                    const sd = stat?.statsData ? (typeof stat.statsData === 'string' ? JSON.parse(stat.statsData) : stat.statsData) : {};
                    totalGoals += sd.goals || 0;
                    totalAssists += sd.assists || 0;
                    totalSaves += sd.saves || 0;
                    totalTackles += sd.tackles || 0;
                    totalYellow += sd.yellowCards || 0;
                    totalRed += sd.redCards || 0;
                    totalMinutes += sd.minutesPlayed || 0;
                });
                setCareerStats(prev => ({
                    ...prev,
                    football: {
                        ...EMPTY_FOOTBALL, matches: footballMatches.length,
                        goals: totalGoals, assists: totalAssists, saves: totalSaves,
                        tackles: totalTackles, yellowCards: totalYellow, redCards: totalRed,
                        minutesPlayed: totalMinutes,
                    },
                }));
            }
        }).catch(() => { });

        // Rankings / Performance Index
        api.getPlayerRankings?.(playerId)?.then?.((rankings: any[]) => {
            if (Array.isArray(rankings) && rankings.length > 0) setPerformanceIndex(Math.round(rankings[0].points || 0));
        }).catch(() => { });
    }, [player]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const user = player || {};
    const profile = user.player || {};
    const sportName = profile.primarySport || 'Multi-sport';
    const sportColor = '#1e3a8a';

    // Determine player role from playerSports metadata
    const playerSports = profile.playerSports || [];
    const primaryPlayerSport = playerSports.find((ps: any) => ps.sport?.name?.toLowerCase() === sportName.toLowerCase()) || playerSports[0];
    const metadata = primaryPlayerSport?.metadata ? (typeof primaryPlayerSport.metadata === 'string' ? JSON.parse(primaryPlayerSport.metadata) : primaryPlayerSport.metadata) : {};
    const playerRole = metadata.role || metadata.position || '—';
    const battingStyle = metadata.battingStyle || '—';
    const bowlingStyle = metadata.bowlingStyle || 'None';

    const cs = careerStats.cricket;
    const fs = careerStats.football;
    const sportKey = sportName.toLowerCase();

    const TAB_CONFIG: { key: TabKey; label: string; icon: any }[] = [
        { key: 'overview', label: 'Overview', icon: Info },
        { key: 'stats', label: 'Stats', icon: BarChart3 },
        { key: 'teams', label: 'Teams', icon: Users },
    ];

    const totalMatches = profile.totalMatches || 0;
    const totalWins = profile.totalWins || 0;
    const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

    /* ── Stat card renderer ── */
    const StatGrid = ({ title, emoji, stats }: { title: string; emoji: string; stats: { label: string; value: any }[] }) => (
        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {emoji} {title}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {stats.map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '10px', background: '#f8fafc' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b' }}>{s.value}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    /* ── Determine which stats sections to show based on sport + role ── */
    const renderCricketStats = () => {
        const isBatsman = playerRole === 'Batsman' || playerRole === 'All-Rounder' || playerRole === 'Wicketkeeper';
        const isBowler = playerRole === 'Bowler' || playerRole === 'All-Rounder';
        const isKeeper = playerRole === 'Wicketkeeper';

        const battingStats = [
            { label: 'Matches', value: cs.matches }, { label: 'Innings', value: cs.innings },
            { label: 'Runs', value: cs.runs }, { label: 'High Score', value: cs.highScore },
            { label: 'Average', value: cs.avg }, { label: 'Strike Rate', value: cs.strikeRate },
            { label: '100s', value: cs.centuries }, { label: '50s', value: cs.fifties },
            { label: '4s', value: cs.fours }, { label: '6s', value: cs.sixes },
        ];
        const bowlingStats = [
            { label: 'Wickets', value: cs.wickets }, { label: 'Bowl Avg', value: cs.bowlAvg },
            { label: 'Economy', value: cs.economy }, { label: 'Best Bowling', value: cs.bestBowling },
        ];
        const fieldingStats = [
            { label: 'Catches', value: cs.catches }, { label: 'Stumpings', value: cs.stumpings },
            { label: 'Run Outs', value: cs.runOuts },
        ];

        return (
            <>
                {/* Primary Section: depends on role */}
                {isBatsman && <StatGrid title={`Batting${playerRole === 'All-Rounder' ? '' : ' (Primary)'}`} emoji="🏏" stats={battingStats} />}
                {isBowler && !isBatsman && <StatGrid title="Bowling (Primary)" emoji="🎯" stats={bowlingStats} />}
                {isKeeper && <StatGrid title="Wicketkeeping" emoji="🧤" stats={fieldingStats} />}

                {/* All-Rounders get bowling as primary too */}
                {playerRole === 'All-Rounder' && <StatGrid title="Bowling" emoji="🎯" stats={bowlingStats} />}

                {/* Secondary Stats Toggle */}
                {(isBatsman && playerRole !== 'All-Rounder') && (
                    <>
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
                                <StatGrid title="Bowling" emoji="🎯" stats={bowlingStats} />
                                <StatGrid title="Fielding" emoji="🧤" stats={fieldingStats} />
                            </>
                        )}
                    </>
                )}

                {/* For Bowlers: secondary batting */}
                {playerRole === 'Bowler' && (
                    <>
                        <button
                            onClick={() => setShowSecondaryStats(!showSecondaryStats)}
                            style={{
                                padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                background: 'white', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'space-between', width: '100%',
                            }}
                        >
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5' }}>
                                {showSecondaryStats ? 'Hide' : 'Show'} Batting & Fielding Stats
                            </span>
                            {showSecondaryStats ? <ChevronUp size={16} color="#4f46e5" /> : <ChevronDown size={16} color="#4f46e5" />}
                        </button>
                        {showSecondaryStats && (
                            <>
                                <StatGrid title="Batting" emoji="🏏" stats={battingStats} />
                                <StatGrid title="Fielding" emoji="🧤" stats={fieldingStats} />
                            </>
                        )}
                    </>
                )}

                {/* For All-Rounders: fielding as secondary */}
                {playerRole === 'All-Rounder' && (
                    <>
                        <button
                            onClick={() => setShowSecondaryStats(!showSecondaryStats)}
                            style={{
                                padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                background: 'white', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'space-between', width: '100%',
                            }}
                        >
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5' }}>
                                {showSecondaryStats ? 'Hide' : 'Show'} Fielding Stats
                            </span>
                            {showSecondaryStats ? <ChevronUp size={16} color="#4f46e5" /> : <ChevronDown size={16} color="#4f46e5" />}
                        </button>
                        {showSecondaryStats && <StatGrid title="Fielding" emoji="🧤" stats={fieldingStats} />}
                    </>
                )}
            </>
        );
    };

    const renderFootballStats = () => {
        const pos = playerRole.toLowerCase();
        const isGK = pos === 'goalkeeper';
        const isDefender = pos === 'defender';
        const isForward = pos === 'forward';
        const isMidfielder = pos === 'midfielder';

        const allStats = [
            { label: 'Matches', value: fs.matches },
            ...(isForward || isMidfielder || pos === '—' ? [{ label: 'Goals', value: fs.goals }, { label: 'Assists', value: fs.assists }, { label: 'Shots on Target', value: fs.shotsOnTarget }] : []),
            ...(isDefender ? [{ label: 'Tackles', value: fs.tackles }, { label: 'Interceptions', value: fs.interceptions }, { label: 'Yellow Cards', value: fs.yellowCards }, { label: 'Red Cards', value: fs.redCards }] : []),
            ...(isGK ? [{ label: 'Saves', value: fs.saves }, { label: 'Goals Conceded', value: fs.goalsConceded }, { label: 'Clean Sheets', value: fs.cleanSheets }] : []),
            ...(isMidfielder ? [{ label: 'Pass Acc %', value: fs.passAccuracy }] : []),
            { label: 'Minutes', value: fs.minutesPlayed },
            ...(!isDefender && !isGK ? [{ label: 'Yellow Cards', value: fs.yellowCards }, { label: 'Red Cards', value: fs.redCards }] : []),
        ];

        const roleLabel = playerRole !== '—' ? ` (${playerRole})` : '';
        return <StatGrid title={`Football Stats${roleLabel}`} emoji="⚽" stats={allStats} />;
    };

    const renderOtherSportStats = () => {
        if (sportKey === 'basketball') {
            const bs = careerStats.basketball;
            return <StatGrid title="Basketball Stats" emoji="🏀" stats={[
                { label: 'Matches', value: bs.matches }, { label: 'Points', value: bs.points },
                { label: 'Rebounds', value: bs.rebounds }, { label: 'Assists', value: bs.assists },
                { label: 'Steals', value: bs.steals }, { label: 'Blocks', value: bs.blocks },
                { label: 'Turnovers', value: bs.turnovers }, { label: 'Minutes', value: bs.minutesPlayed },
            ]} />;
        }
        if (sportKey === 'kabaddi') {
            const ks = careerStats.kabaddi;
            return <StatGrid title="Kabaddi Stats" emoji="🤼" stats={[
                { label: 'Matches', value: ks.matches }, { label: 'Raid Points', value: ks.raidPoints },
                { label: 'Tackle Points', value: ks.tacklePoints }, { label: 'Super Raids', value: ks.superRaids },
                { label: 'Super Tackles', value: ks.superTackles }, { label: 'Total Points', value: ks.totalPoints },
            ]} />;
        }
        if (sportKey === 'volleyball') {
            const vs = careerStats.volleyball;
            return <StatGrid title="Volleyball Stats" emoji="🏐" stats={[
                { label: 'Matches', value: vs.matches }, { label: 'Kills', value: vs.kills },
                { label: 'Blocks', value: vs.blocks }, { label: 'Aces', value: vs.aces },
                { label: 'Digs', value: vs.digs }, { label: 'Assists', value: vs.assists },
            ]} />;
        }
        if (sportKey === 'hockey') {
            const hs = careerStats.hockey;
            return <StatGrid title="Hockey Stats" emoji="🏑" stats={[
                { label: 'Matches', value: hs.matches }, { label: 'Goals', value: hs.goals },
                { label: 'Assists', value: hs.assists }, { label: 'Saves', value: hs.saves },
                { label: 'Penalty Corners', value: hs.penaltyCorners },
                { label: 'Yellow Cards', value: hs.yellowCards },
            ]} />;
        }
        return null;
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
            <PageNavbar title="Player Profile" />

            {/* ── Cricbuzz-Style Hero Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                padding: '30px 20px', color: 'white'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            fontSize: '36px', fontWeight: 900, color: 'white',
                            border: '4px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                            {user.firstName?.[0] || '?'}{user.lastName?.[0] || ''}
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                                        {user.firstName || 'Player'} {user.lastName || ''}
                                    </h2>
                                    {user.isVerified && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                                            <BadgeCheck size={12} /> Verified
                                        </div>
                                    )}
                                </div>
                                {profile.sportsId && (
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>
                                        UID: {profile.sportsId}
                                    </div>
                                )}
                                <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 12px 0', maxWidth: '400px', lineHeight: 1.4 }}>
                                    {profile.bio || `${sportName} ${playerRole !== '—' ? playerRole : 'player'}. Passionate about sports and always ready for a challenge.`}
                                </p>
                            </div>

                            {/* Interaction buttons */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <UserPlus size={14} /> Follow
                                </button>
                                <div style={{ position: 'relative' }}>
                                    <button onClick={() => setShowContactMenu(!showContactMenu)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MessageSquare size={14} /> Contact
                                    </button>
                                    {showContactMenu && (
                                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {[
                                                { icon: <Phone size={14} color="#64748b" />, label: 'Phone' },
                                                { icon: <MessageCircle size={14} color="#64748b" />, label: 'Message' },
                                                { icon: <Mail size={14} color="#64748b" />, label: 'Email' },
                                            ].map(c => (
                                                <button key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#334155', fontWeight: 600, fontSize: '13px', textAlign: 'left', width: '100%' }} className="hover-bg-slate">
                                                    {c.icon} {c.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px 24px', fontSize: '13px', color: '#cbd5e1', marginTop: '16px' }}>
                            <div><span style={{ color: '#94a3b8' }}>Sport:</span> <strong style={{ color: 'white' }}>{sportName}</strong></div>
                            <div><span style={{ color: '#94a3b8' }}>Role:</span> <strong style={{ color: 'white' }}>{playerRole}</strong></div>
                            <div><span style={{ color: '#94a3b8' }}>Location:</span> <strong style={{ color: 'white' }}>{profile.city || 'N/A'}, {profile.country || 'India'}</strong></div>
                            {sportKey === 'cricket' && battingStyle !== '—' && (
                                <div><span style={{ color: '#94a3b8' }}>Bat:</span> <strong style={{ color: 'white' }}>{battingStyle}</strong></div>
                            )}
                            {sportKey === 'cricket' && bowlingStyle !== 'None' && bowlingStyle !== '—' && (
                                <div><span style={{ color: '#94a3b8' }}>Bowl:</span> <strong style={{ color: 'white' }}>{bowlingStyle}</strong></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '53px', zIndex: 90, overflowX: 'auto' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'center', minWidth: 'max-content', gap: '4px' }}>
                    {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            style={{
                                padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
                                fontSize: '13px', fontWeight: activeTab === key ? 800 : 600,
                                color: activeTab === key ? sportColor : '#64748b',
                                borderBottom: activeTab === key ? `3px solid ${sportColor}` : '3px solid transparent',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px',
                            }}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div style={{ maxWidth: '1000px', margin: '20px auto 0', padding: '0 20px' }}>

                {/* ═══════ OVERVIEW TAB ═══════ */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                        {/* Summary Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'Matches', val: totalMatches },
                                { label: 'Won', val: totalWins, color: sportColor },
                                { label: 'Win Rate', val: `${winRate}%`, color: sportColor },
                            ].map((stat, i) => (
                                <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', fontWeight: 900, color: stat.color || '#0f172a', lineHeight: 1 }}>{stat.val}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '6px' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Personal Info */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Personal Info</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {[
                                    { icon: <Phone size={14} />, label: 'Phone', value: user.phone ? `+${user.countryCode || '91'} ${user.phone}` : '—' },
                                    { icon: <Mail size={14} />, label: 'Email', value: user.email || '—' },
                                    { icon: <MapPin size={14} />, label: 'Location', value: `${profile.district || '—'}, ${profile.state || '—'}, ${profile.country || 'India'}` },
                                    { icon: <Trophy size={14} />, label: 'Primary Sport', value: `${sportName} • ${playerRole}` },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                                        <span style={{ color: '#94a3b8' }}>{item.icon}</span>
                                        <span style={{ fontSize: '13px', color: '#94a3b8', width: '100px' }}>{item.label}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Matches */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>⚡ Recent Matches</h3>
                            {recentMatches.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No recent matches.</p>
                            ) : (
                                recentMatches.slice(0, 5).map((m, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0',
                                        borderBottom: i < Math.min(recentMatches.length, 5) - 1 ? '1px solid #f8fafc' : 'none',
                                    }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.result === 'Won' ? '#22c55e' : '#94a3b8' }} />
                                        <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>vs {m.opponent}</div>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{m.performance}</span>
                                        <span style={{ fontSize: '10px', color: '#cbd5e1' }}>{m.date}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════ STATS TAB ═══════ */}
                {activeTab === 'stats' && (
                    <div style={{ display: 'grid', gap: '14px' }}>
                        {/* Role Badge */}
                        {playerRole !== '—' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                    {sportKey === 'cricket' ? '🏏' : sportKey === 'football' ? '⚽' : sportKey === 'basketball' ? '🏀' : sportKey === 'kabaddi' ? '🤼' : sportKey === 'volleyball' ? '🏐' : sportKey === 'hockey' ? '🏑' : '🎮'}
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e1b4b' }}>{playerRole}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{sportName} • Career Statistics</div>
                                </div>
                            </div>
                        )}

                        {/* Sport-specific stats */}
                        {sportKey === 'cricket' && renderCricketStats()}
                        {sportKey === 'football' && renderFootballStats()}
                        {!['cricket', 'football'].includes(sportKey) && renderOtherSportStats()}

                        {/* Performance Index */}
                        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>📊 Performance Index</h3>
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
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Based on overall performance</div>
                                </div>
                            </div>
                        </div>

                        {totalMatches === 0 && (
                            <div style={{ padding: '40px 20px', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b' }}>No stats yet</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Play matches to build your stats profile.</div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ TEAMS TAB ═══════ */}
                {activeTab === 'teams' && (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Team Memberships</h3>
                        {(profile.teamPlayers?.length || 0) === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <Users size={40} color="#cbd5e1" />
                                <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '12px' }}>Not part of any team yet</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {profile.teamPlayers?.map((tp: any) => (
                                    <div key={tp.id} style={{
                                        padding: '14px 18px', borderRadius: '12px', background: '#f8fafc',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e1b4b' }}>{tp.team?.name}</span>
                                            {tp.role && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b' }}>({tp.role})</span>}
                                        </div>
                                        {tp.jersey && <span style={{ fontSize: '13px', fontWeight: 700, color: sportColor }}>#{tp.jersey}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .hover-bg-slate:hover { background-color: #f8fafc !important; }
            `}</style>
        </div>
    );
}

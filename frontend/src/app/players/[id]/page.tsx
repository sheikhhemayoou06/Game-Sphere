'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { sportIcons } from '@/lib/utils';
import { api } from '@/lib/api';
import PageNavbar from '@/components/PageNavbar';
import {
    MapPin, Trophy, UserPlus, MessageSquare, BadgeCheck,
    Info, Users, Calendar, BarChart3, Image as ImageIcon,
    Phone, Mail, MessageCircle, ChevronDown, ChevronUp,
    Award, History, ArrowRightLeft, Stethoscope, Star, Medal, Crown,
    Crosshair, Shield, Swords, Target, CircleDot, Dumbbell, Activity, Flame, Zap
} from 'lucide-react';

type TabKey = 'overview' | 'stats' | 'teams' | 'achievements' | 'history';

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

    // Achievements & History state
    const [certificates, setCertificates] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [injuries] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            const apiUrl = process.env.NODE_ENV === 'development' && typeof window !== 'undefined'
                ? `http://${window.location.hostname}:4000/api` : (process.env.NEXT_PUBLIC_API_URL || '/api');

            fetch(`${apiUrl}/auth/user/${id}`, {
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

        // Certificates
        api.getCertificates?.(playerId)?.then?.((certs: any[]) => {
            if (Array.isArray(certs)) setCertificates(certs.map((c: any) => ({
                ...c, date: c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
                title: c.recipientName ? `${c.type} — ${c.tournamentName || 'Tournament'}` : c.type,
            })));
        }).catch(() => { });

        // Transfers
        api.getTransfers?.(playerId)?.then?.((trs: any[]) => {
            if (Array.isArray(trs)) setTransfers(trs.map((t: any) => ({
                ...t, from: t.fromTeam?.name || 'Free Agent', to: t.toTeam?.name || 'Unknown',
                date: t.requestedAt ? new Date(t.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
            })));
        }).catch(() => { });

        // Achievements (from certificates of type WINNER/AWARD + custom)
        api.getCertificates?.(playerId)?.then?.((certs: any[]) => {
            if (Array.isArray(certs)) {
                const awards = certs.filter((c: any) => c.type === 'WINNER' || c.type === 'AWARD' || c.type === 'MVP').map((c: any) => ({
                    title: c.type === 'WINNER' ? `Champion — ${c.tournamentName || 'Tournament'}` :
                           c.type === 'MVP' ? `Player of the Match — ${c.tournamentName || 'Match'}` :
                           `${c.position || 'Award'} — ${c.tournamentName || 'Event'}`,
                    icon: c.type === 'WINNER' ? <Trophy size={20} color="#f59e0b" /> : c.type === 'MVP' ? <Star size={20} color="#6366f1" /> : <Medal size={20} color="#6366f1" />,
                    date: c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
                    type: c.type,
                    tournament: c.tournamentName || '—',
                }));
                setAchievements(awards);
            }
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
    const playerSports = profile.playerSports || [];
    const sportName = profile.primarySport || playerSports[0]?.sport?.name || 'Multi-sport';
    const sportColor = '#1e3a8a';

    // Determine player role from playerSports metadata
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
        { key: 'achievements', label: 'Awards', icon: Award },
        { key: 'history', label: 'History', icon: History },
    ];

    const totalMatches = profile.totalMatches || 0;
    const totalWins = profile.totalWins || 0;
    const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

    /* ── Stat card renderer ── */
    const StatGrid = ({ title, icon, stats }: { title: string; icon: React.ReactNode; stats: { label: string; value: any }[] }) => (
        <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {icon} {title}
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
                {isBatsman && <StatGrid title={`Batting${playerRole === 'All-Rounder' ? '' : ' (Primary)'}`} icon={<Swords size={16} color="#4f46e5" />} stats={battingStats} />}
                {isBowler && !isBatsman && <StatGrid title="Bowling (Primary)" icon={<Target size={16} color="#dc2626" />} stats={bowlingStats} />}
                {isKeeper && <StatGrid title="Wicketkeeping" icon={<Shield size={16} color="#0d9488" />} stats={fieldingStats} />}

                {/* All-Rounders get bowling as primary too */}
                {playerRole === 'All-Rounder' && <StatGrid title="Bowling" icon={<Target size={16} color="#dc2626" />} stats={bowlingStats} />}

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
                                <StatGrid title="Bowling" icon={<Target size={16} color="#dc2626" />} stats={bowlingStats} />
                                <StatGrid title="Fielding" icon={<Shield size={16} color="#0d9488" />} stats={fieldingStats} />
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
                                <StatGrid title="Batting" icon={<Swords size={16} color="#4f46e5" />} stats={battingStats} />
                                <StatGrid title="Fielding" icon={<Shield size={16} color="#0d9488" />} stats={fieldingStats} />
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
                        {showSecondaryStats && <StatGrid title="Fielding" icon={<Shield size={16} color="#0d9488" />} stats={fieldingStats} />}
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
        return <StatGrid title={`Football Stats${roleLabel}`} icon={<CircleDot size={16} color="#16a34a" />} stats={allStats} />;
    };

    const renderOtherSportStats = () => {
        if (sportKey === 'basketball') {
            const bs = careerStats.basketball;
            return <StatGrid title="Basketball Stats" icon={<Flame size={16} color="#ea580c" />} stats={[
                { label: 'Matches', value: bs.matches }, { label: 'Points', value: bs.points },
                { label: 'Rebounds', value: bs.rebounds }, { label: 'Assists', value: bs.assists },
                { label: 'Steals', value: bs.steals }, { label: 'Blocks', value: bs.blocks },
                { label: 'Turnovers', value: bs.turnovers }, { label: 'Minutes', value: bs.minutesPlayed },
            ]} />;
        }
        if (sportKey === 'kabaddi') {
            const ks = careerStats.kabaddi;
            return <StatGrid title="Kabaddi Stats" icon={<Dumbbell size={16} color="#7c3aed" />} stats={[
                { label: 'Matches', value: ks.matches }, { label: 'Raid Points', value: ks.raidPoints },
                { label: 'Tackle Points', value: ks.tacklePoints }, { label: 'Super Raids', value: ks.superRaids },
                { label: 'Super Tackles', value: ks.superTackles }, { label: 'Total Points', value: ks.totalPoints },
            ]} />;
        }
        if (sportKey === 'volleyball') {
            const vs = careerStats.volleyball;
            return <StatGrid title="Volleyball Stats" icon={<Zap size={16} color="#0ea5e9" />} stats={[
                { label: 'Matches', value: vs.matches }, { label: 'Kills', value: vs.kills },
                { label: 'Blocks', value: vs.blocks }, { label: 'Aces', value: vs.aces },
                { label: 'Digs', value: vs.digs }, { label: 'Assists', value: vs.assists },
            ]} />;
        }
        if (sportKey === 'hockey') {
            const hs = careerStats.hockey;
            return <StatGrid title="Hockey Stats" icon={<Activity size={16} color="#0d9488" />} stats={[
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
                            {sportKey === 'cricket' && bowlingStyle !== 'None' && bowlingStyle !== '—' && (playerRole === 'Bowler' || playerRole === 'All-Rounder') && (
                                <div><span style={{ color: '#94a3b8' }}>Bowl:</span> <strong style={{ color: 'white' }}>{bowlingStyle}</strong></div>
                            )}
                            {sportKey === 'cricket' && battingStyle !== '—' && (playerRole === 'Batsman' || playerRole === 'Wicketkeeper' || playerRole === 'All-Rounder') && (
                                <div><span style={{ color: '#94a3b8' }}>Bat:</span> <strong style={{ color: 'white' }}>{battingStyle}</strong></div>
                            )}
                            {sportKey === 'football' && metadata.preferredFoot && (
                                <div><span style={{ color: '#94a3b8' }}>Foot:</span> <strong style={{ color: 'white' }}>{metadata.preferredFoot}</strong></div>
                            )}
                            {sportKey === 'basketball' && metadata.height && (
                                <div><span style={{ color: '#94a3b8' }}>Height:</span> <strong style={{ color: 'white' }}>{metadata.height} cm</strong></div>
                            )}
                            {sportKey === 'kabaddi' && metadata.position && (
                                <div><span style={{ color: '#94a3b8' }}>Position:</span> <strong style={{ color: 'white' }}>{metadata.position}</strong></div>
                            )}
                            {(profile.city || profile.state || profile.district) && (
                                <div><span style={{ color: '#94a3b8' }}>Location:</span> <strong style={{ color: 'white' }}>{[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'India'}</strong></div>
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

                        {/* Personal Details */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Info size={18} color={sportColor} /> Personal Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {[
                                    { icon: <Phone size={14} />, label: 'Phone', value: user.phone ? `+${user.countryCode || '91'} ${user.phone}` : '—' },
                                    { icon: <Mail size={14} />, label: 'Email', value: user.email || '—' },
                                    { icon: <MapPin size={14} />, label: 'Location', value: [profile.district, profile.state, profile.country].filter(Boolean).join(', ') || 'India' },
                                    ...(profile.heightCm ? [{ icon: <Activity size={14} />, label: 'Height', value: `${profile.heightCm} cm` }] : []),
                                    ...(profile.gender ? [{ icon: <Users size={14} />, label: 'Gender', value: profile.gender }] : []),
                                    { icon: <Calendar size={14} />, label: 'Sports ID', value: profile.sportsId || '—' },
                                ].map((item, i, arr) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                        <span style={{ color: '#94a3b8', display: 'flex' }}>{item.icon}</span>
                                        <span style={{ fontSize: '13px', color: '#94a3b8', width: '90px', flexShrink: 0 }}>{item.label}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Current Teams */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={18} color={sportColor} /> Current Teams
                            </h3>
                            {(profile.teamPlayers?.length || 0) === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center' }}>
                                    <Users size={36} color="#cbd5e1" />
                                    <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>Not part of any team yet</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {profile.teamPlayers?.map((tp: any, i: number) => (
                                        <div key={tp.id || i} style={{
                                            display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px',
                                            borderRadius: '10px', background: '#f8fafc',
                                        }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontSize: '16px', fontWeight: 800, flexShrink: 0,
                                            }}>
                                                <Users size={20} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b' }}>{tp.team?.name || 'Unknown'}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                                    {tp.role || playerRole} {tp.jersey ? `• #${tp.jersey}` : ''} • Joined {new Date(tp.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Matches */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={18} color="#f59e0b" /> Recent Matches
                            </h3>
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
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {sportKey === 'cricket' ? <Swords size={20} color="#4f46e5" /> : sportKey === 'football' ? <CircleDot size={20} color="#16a34a" /> : sportKey === 'basketball' ? <Flame size={20} color="#ea580c" /> : sportKey === 'kabaddi' ? <Dumbbell size={20} color="#7c3aed" /> : sportKey === 'volleyball' ? <Zap size={20} color="#0ea5e9" /> : sportKey === 'hockey' ? <Activity size={20} color="#0d9488" /> : <Trophy size={20} color="#4f46e5" />}
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

                {/* ═══════ ACHIEVEMENTS & AWARDS TAB ═══════ */}
                {activeTab === 'achievements' && (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {/* Trophies & Championships */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Crown size={18} color="#f59e0b" /> Trophies & Championships
                            </h3>
                            {achievements.filter(a => a.type === 'WINNER').length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center' }}>
                                    <Trophy size={40} color="#cbd5e1" />
                                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '12px' }}>No trophies yet. Keep competing!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                    {achievements.filter(a => a.type === 'WINNER').map((a, i) => (
                                        <div key={i} style={{
                                            padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                                            border: '1px solid #fde68a', textAlign: 'center',
                                        }}>
                                            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><Trophy size={32} color="#f59e0b" /></div>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>Champion</div>
                                            <div style={{ fontSize: '12px', color: '#b45309', marginTop: '4px' }}>{a.tournament}</div>
                                            <div style={{ fontSize: '10px', color: '#d97706', marginTop: '4px' }}>{a.date}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Player Awards */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Star size={18} color="#6366f1" /> Individual Awards
                            </h3>
                            {achievements.filter(a => a.type !== 'WINNER').length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center' }}>
                                    <Medal size={40} color="#cbd5e1" />
                                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '12px' }}>No individual awards yet.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {achievements.filter(a => a.type !== 'WINNER').map((a, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                            borderRadius: '10px', background: '#f8fafc',
                                        }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                                {a.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b' }}>{a.title}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{a.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Certificates */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BadgeCheck size={18} color="#6366f1" /> Certificates
                            </h3>
                            {certificates.length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center' }}>
                                    <Award size={40} color="#cbd5e1" />
                                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '12px' }}>No certificates earned yet.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {certificates.map((cert, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                                            borderRadius: '10px', background: '#f8fafc',
                                        }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: cert.type === 'WINNER' ? '#fffbeb' : '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {cert.type === 'WINNER' ? <Trophy size={18} color="#f59e0b" /> : cert.type === 'AWARD' ? <Medal size={18} color="#6366f1" /> : <BadgeCheck size={18} color="#6366f1" />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{cert.title}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{cert.type} • {cert.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════ CAREER HISTORY TAB ═══════ */}
                {activeTab === 'history' && (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {/* Career Timeline */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <History size={18} color="#4f46e5" /> Career Timeline
                            </h3>
                            <div style={{ position: 'relative', paddingLeft: '24px' }}>
                                {/* Timeline line */}
                                <div style={{ position: 'absolute', left: '7px', top: '4px', bottom: '4px', width: '2px', background: '#e2e8f0' }} />

                                {/* Current Team */}
                                {(profile.teamPlayers?.length || 0) > 0 && profile.teamPlayers.map((tp: any, i: number) => (
                                    <div key={`team-${i}`} style={{ position: 'relative', marginBottom: '20px' }}>
                                        <div style={{ position: 'absolute', left: '-21px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#4f46e5', border: '2px solid white', boxShadow: '0 0 0 2px #4f46e5' }} />
                                        <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Team</div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginTop: '4px' }}>{tp.team?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                                {tp.role ? `${tp.role}` : playerRole} {tp.jersey ? `• #${tp.jersey}` : ''} • Joined {new Date(tp.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Debut Info */}
                                <div style={{ position: 'relative', marginBottom: '20px' }}>
                                    <div style={{ position: 'absolute', left: '-21px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid white', boxShadow: '0 0 0 2px #22c55e' }} />
                                    <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Career Debut</div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginTop: '4px' }}>{sportName} {playerRole !== '—' ? `• ${playerRole}` : ''}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                            Registered {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Created */}
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-21px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#94a3b8', border: '2px solid white', boxShadow: '0 0 0 2px #94a3b8' }} />
                                    <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Profile Created</div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginTop: '4px' }}>Joined Game Sphere</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transfers */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ArrowRightLeft size={18} color="#3b82f6" /> Transfer History
                            </h3>
                            {transfers.length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center' }}>
                                    <ArrowRightLeft size={40} color="#cbd5e1" />
                                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '12px' }}>No transfer history.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {transfers.map((tr, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                            borderRadius: '10px', background: '#f8fafc',
                                        }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <ArrowRightLeft size={18} color="#3b82f6" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b' }}>{tr.from} → {tr.to}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{tr.date} {tr.reason ? `• ${tr.reason}` : ''}</div>
                                            </div>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                                                background: tr.status === 'APPROVED' ? '#f0fdf4' : tr.status === 'PENDING' ? '#fffbeb' : '#fef2f2',
                                                color: tr.status === 'APPROVED' ? '#16a34a' : tr.status === 'PENDING' ? '#d97706' : '#dc2626',
                                                textTransform: 'uppercase',
                                            }}>{tr.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Injury History */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Stethoscope size={18} color="#ef4444" /> Injury History
                            </h3>
                            {injuries.length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center' }}>
                                    <Stethoscope size={40} color="#cbd5e1" />
                                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '12px' }}>No injury records. Stay healthy!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {injuries.map((inj: any, i: number) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                            borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca',
                                        }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Stethoscope size={18} color="#ef4444" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b' }}>{inj.type || 'Injury'}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                                    {inj.date} • Recovery: {inj.recovery || 'Recovered'} {inj.matchesMissed ? `• ${inj.matchesMissed} matches missed` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .hover-bg-slate:hover { background-color: #f8fafc !important; }
            `}</style>
        </div>
    );
}

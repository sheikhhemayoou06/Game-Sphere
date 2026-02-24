'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';
import { Fingerprint } from 'lucide-react';

type RoleView = 'owner' | 'player';
function getProfileRole(role: string): RoleView {
    if (['ORGANIZER', 'TEAM_MANAGER'].includes(role)) return 'owner';
    return 'player';
}

/* ═══════ COMPREHENSIVE PLAYER PROFILE DATA ═══════ */

const PLAYER = {
    name: 'Arjun Patel', sportsId: 'USI-Pending', age: 22,
    phone: '+91 98765 43210', email: 'arjun.patel@gamesphere.in',
    photo: '🧑‍🦱', primarySport: 'Cricket', secondarySport: 'Football',
    district: 'Mumbai', state: 'Maharashtra', country: 'India',
    level: 'STATE', verified: true, bloodGroup: 'O+',
    dob: '2004-03-15', height: '5\'11"', weight: '72 kg',
    battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium',
    position: 'All-Rounder', jerseyNo: 7,
    performanceIndex: 82,
};

const CAREER_STATS = {
    cricket: {
        matches: 87, innings: 78, runs: 2845, highScore: 142, avg: 42.46, strikeRate: 128.5,
        centuries: 3, fifties: 18, fours: 312, sixes: 89,
        wickets: 48, bowlAvg: 28.3, economy: 6.2, bestBowling: '4/22',
        catches: 34, stumpings: 0, runOuts: 8,
    },
    football: {
        matches: 24, goals: 12, assists: 8, saves: 0,
        yellowCards: 3, redCards: 0, passAccuracy: 78.5,
        shotsOnTarget: 38, minutesPlayed: 1920,
    },
};

const TOURNAMENT_BREAKDOWN = [
    { name: 'District Cricket Championship 2025', sport: 'Cricket', matches: 8, runs: 456, wickets: 12, catches: 6, bestScore: '142', result: '🏆 Winner' },
    { name: 'State Under-25 Trophy', sport: 'Cricket', matches: 6, runs: 312, wickets: 8, catches: 4, bestScore: '98', result: '🥈 Runner-up' },
    { name: 'Inter-District T20 League', sport: 'Cricket', matches: 12, runs: 580, wickets: 15, catches: 8, bestScore: '88*', result: '🏆 Winner' },
    { name: 'Mumbai Cricket Association Cup', sport: 'Cricket', matches: 5, runs: 198, wickets: 4, catches: 3, bestScore: '76', result: 'Semi-Final' },
    { name: 'Corporate Football League', sport: 'Football', matches: 10, runs: 0, wickets: 0, catches: 0, bestScore: '5 goals', result: '🥉 3rd Place' },
    { name: 'State Football Championship', sport: 'Football', matches: 4, runs: 0, wickets: 0, catches: 0, bestScore: '3 goals', result: 'Quarter-Final' },
];

const ACHIEVEMENTS = [
    { title: 'District Champion 2025', icon: '🏆', date: 'Jun 2025', sport: 'Cricket' },
    { title: 'Best All-Rounder Award', icon: '🏅', date: 'Aug 2025', sport: 'Cricket' },
    { title: 'State Level Qualifier', icon: '⭐', date: 'Nov 2025', sport: 'Cricket' },
    { title: 'Century Scorer (3x)', icon: '💯', date: 'Jan 2026', sport: 'Cricket' },
    { title: 'Top Scorer — Corp. League', icon: '⚽', date: 'Dec 2025', sport: 'Football' },
];

const RECENT_MATCHES = [
    { opponent: 'Blue Blazers', result: 'Won', score: '185-142', date: '2026-02-18', performance: '78 runs, 2 wkts', sport: 'Cricket' },
    { opponent: 'Red Dragons', result: 'Won', score: '220-165', date: '2026-02-15', performance: '45 runs, 3 wkts', sport: 'Cricket' },
    { opponent: 'Silver Sharks', result: 'Lost', score: '145-178', date: '2026-02-10', performance: '22 runs, 1 wkt', sport: 'Cricket' },
    { opponent: 'Golden Eagles', result: 'Won', score: '198-190', date: '2026-02-05', performance: '92* runs, 0 wkts', sport: 'Cricket' },
    { opponent: 'Storm FC', result: 'Won', score: '3-1', date: '2026-01-28', performance: '2 goals, 1 assist', sport: 'Football' },
    { opponent: 'Iron Hawks FC', result: 'Lost', score: '1-2', date: '2026-01-20', performance: '1 goal', sport: 'Football' },
];

const CERTIFICATES = [
    { title: 'District Cricket Championship', type: 'WINNER', date: '2025-06', qr: true, sport: 'Cricket' },
    { title: 'State Tournament', type: 'PARTICIPATION', date: '2025-11', qr: true, sport: 'Cricket' },
    { title: 'Best All-Rounder', type: 'AWARD', date: '2025-08', qr: false, sport: 'Cricket' },
    { title: 'Corporate Football League', type: 'PARTICIPATION', date: '2025-12', qr: true, sport: 'Football' },
];

const TRANSFERS = [
    { from: 'Mumbai XI', to: 'Thunder Warriors', date: '2025-09', status: 'COMPLETED', fee: '₹50,000', sport: 'Cricket' },
    { from: 'Storm FC B-team', to: 'Storm FC', date: '2025-11', status: 'COMPLETED', fee: '₹20,000', sport: 'Football' },
];

const INJURY_HISTORY = [
    { type: 'Hamstring Strain', duration: '2 weeks', date: '2025-07', status: 'Recovered', sport: 'Cricket' },
    { type: 'Ankle Sprain', duration: '10 days', date: '2025-03', status: 'Recovered', sport: 'Football' },
];

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

    // Fetch live player sports data to get metadata (roles/positions)
    const [playerSportsData, setPlayerSportsData] = useState<any[]>([]);
    useEffect(() => {
        if (roleView === 'player' && user && (user.player?.id || user.id)) {
            import('@/lib/api').then(({ api }) => {
                api.getPlayerSports(user.player?.id || user.id)
                    .then(setPlayerSportsData)
                    .catch(() => { });
            });
        }
    }, [user, roleView]);

    useEffect(() => {
        if (selectedSportKey && activeTab !== 'overview' && activeTab !== 'tournaments' && activeTab !== 'history' && activeTab !== selectedSportKey) {
            setActiveTab('overview');
        }
    }, [selectedSportKey, activeTab]);

    // Sport filtering
    const filteredTournaments = selectedSport ? TOURNAMENT_BREAKDOWN.filter(t => t.sport === selectedSport.name) : TOURNAMENT_BREAKDOWN;
    const filteredAchievements = selectedSport ? ACHIEVEMENTS.filter(a => a.sport === selectedSport.name) : ACHIEVEMENTS;
    const filteredMatches = selectedSport ? RECENT_MATCHES.filter(m => m.sport === selectedSport.name) : RECENT_MATCHES;
    const filteredCertificates = selectedSport ? CERTIFICATES.filter(c => c.sport === selectedSport.name) : CERTIFICATES;
    const filteredTransfers = selectedSport ? TRANSFERS.filter(t => t.sport === selectedSport.name) : TRANSFERS;
    const filteredInjuries = selectedSport ? INJURY_HISTORY.filter(i => i.sport === selectedSport.name) : INJURY_HISTORY;
    let dynamicPosition = PLAYER.position;
    let dynamicBatting = PLAYER.battingStyle;
    let dynamicBowling = PLAYER.bowlingStyle;

    if (selectedSport && playerSportsData.length > 0) {
        const ps = playerSportsData.find((s: any) => s.sportId === selectedSport.id);
        if (ps && ps.metadata) {
            try {
                const meta = JSON.parse(ps.metadata);
                // "role" or "position" are both used depending on the sport form config
                dynamicPosition = meta.position || meta.role || dynamicPosition;
                if (meta.battingStyle) dynamicBatting = meta.battingStyle;
                if (meta.bowlingStyle) dynamicBowling = meta.bowlingStyle;
            } catch (e) { }
        }
    }

    const dynamicPlayer = {
        ...PLAYER,
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : PLAYER.name,
        sportsId: user?.player?.sportsId || 'USI-Pending',
        position: dynamicPosition,
        battingStyle: dynamicBatting,
        bowlingStyle: dynamicBowling,
    };

    const [form, setForm] = useState({
        name: dynamicPlayer.name, phone: dynamicPlayer.phone, email: dynamicPlayer.email,
        district: dynamicPlayer.district, state: dynamicPlayer.state, height: dynamicPlayer.height,
        weight: dynamicPlayer.weight, battingStyle: dynamicPlayer.battingStyle, bowlingStyle: dynamicPlayer.bowlingStyle,
    });

    useEffect(() => {
        setForm(prev => ({
            ...prev,
            battingStyle: dynamicPlayer.battingStyle,
            bowlingStyle: dynamicPlayer.bowlingStyle
        }));
    }, [dynamicPlayer.battingStyle, dynamicPlayer.bowlingStyle]);

    const winRate = Math.round((62 / 87) * 100);
    const cs = CAREER_STATS.cricket;
    const fs = CAREER_STATS.football;
    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

    /* ═══════ OWNER VIEW ═══════ */
    if (roleView === 'owner') {
        const TEAM_PROFILE = {
            name: 'Thunder Warriors', logo: '⚡', sport: 'Cricket', founded: '2023',
            owner: 'Rajiv Mehta', coach: 'Coach Raj Malhotra', homeGround: 'Wankhede Stadium',
            city: 'Mumbai', players: 12, wins: 28, losses: 10, draws: 4, titles: 3,
            rating: 92, rank: '#2 District',
        };
        const SEASON_HISTORY = [
            { season: '2025-26', played: 14, won: 10, lost: 3, drawn: 1, points: 31, result: '🏆 Champions', position: 1 },
            { season: '2024-25', played: 12, won: 8, lost: 3, drawn: 1, points: 25, result: '🥈 Runner-up', position: 2 },
            { season: '2023-24', played: 10, won: 6, lost: 3, drawn: 1, points: 19, result: 'Semi-Final', position: 4 },
        ];
        const FINANCIALS = [
            { label: 'Total Revenue', value: fmt(565000), color: "inherit" },
            { label: 'Total Expenses', value: fmt(875000), color: "inherit" },
            { label: 'Auction Spend', value: fmt(1420000), color: "inherit" },
            { label: 'Sponsorship', value: fmt(350000), color: "inherit" },
            { label: 'Player Registrations', value: fmt(60000), color: "inherit" },
            { label: 'Venue Costs', value: fmt(45000), color: "inherit" },
        ];
        const tp = TEAM_PROFILE;

        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: "inherit", textDecoration: 'none' }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto", objectFit: "contain" }} /> <span className="gradient-text">Game Sphere</span></div></Link>
                    <Link href="/dashboard" style={{ color: "inherit", fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
                </nav>

                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
                    {/* Team Header */}
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' as const }}>
                        <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px', border: '3px solid rgba(255,255,255,0.2)' }}>⚡</div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>{tp.name}</h1>
                            <div style={{ fontSize: '14px', color: "inherit", fontWeight: 600, marginBottom: '8px' }}>🏏 {tp.sport} • 📍 {tp.city} • 🏟️ {tp.homeGround}</div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                                {[`👤 Owner: ${tp.owner}`, `🎯 Coach: ${tp.coach}`, `📅 Est. ${tp.founded}`, `⭐ Rating: ${tp.rating}`].map(tag => (
                                    <span key={tag} style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: "inherit", fontSize: '12px', fontWeight: 600 }}>{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px', minWidth: '200px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: "inherit", marginBottom: '8px' }}>QUICK STATS</div>
                            {[{ l: 'Rank', v: tp.rank }, { l: 'Players', v: tp.players }, { l: 'Record', v: `${tp.wins}W-${tp.losses}L-${tp.draws}D` }, { l: 'Titles', v: `🏆 ${tp.titles}` }].map(s => (
                                <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '12px' }}>
                                    <span style={{ color: "inherit" }}>{s.l}</span>
                                    <span style={{ color: "inherit", fontWeight: 700 }}>{s.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
                        {[
                            { label: 'Matches', value: tp.wins + tp.losses + tp.draws, color: "inherit" },
                            { label: 'Wins', value: tp.wins, color: "inherit" },
                            { label: 'Losses', value: tp.losses, color: "inherit" },
                            { label: 'Win Rate', value: `${Math.round((tp.wins / (tp.wins + tp.losses + tp.draws)) * 100)}%`, color: "inherit" },
                            { label: 'Titles', value: tp.titles, color: "inherit" },
                            { label: 'Rating', value: tp.rating, color: "inherit" },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px', textAlign: 'center' as const, border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '11px', color: "inherit", fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Owner Tabs border & layout styling */}
                    <div className="flex-wrap-mobile" style={{
                        display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap',
                        background: 'rgba(15, 23, 42, 0.4)', padding: '6px', borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(12px)',
                        width: 'fit-content'
                    }}>
                        {[
                            { key: 'team' as const, label: '👥 Team Profile' },
                            { key: 'financial' as const, label: '💰 Financial Summary' },
                            { key: 'seasons' as const, label: '📅 Season History' },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setOwnerTab(tab.key)} style={{
                                padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                background: ownerTab === tab.key ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                                color: ownerTab === tab.key ? '#ffffff' : '#94a3b8',
                                fontWeight: ownerTab === tab.key ? 800 : 700,
                                fontSize: '14px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: ownerTab === tab.key ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
                            }}
                                onMouseEnter={(e) => {
                                    if (ownerTab !== tab.key) {
                                        e.currentTarget.style.color = '#e2e8f0';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (ownerTab !== tab.key) {
                                        e.currentTarget.style.color = '#94a3b8';
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {ownerTab === 'team' && (
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>🏟️ Team Details</h3>
                                {[{ l: 'Team Name', v: tp.name }, { l: 'Sport', v: tp.sport }, { l: 'Home Ground', v: tp.homeGround }, { l: 'City', v: tp.city }, { l: 'Founded', v: tp.founded }, { l: 'Owner', v: tp.owner }, { l: 'Head Coach', v: tp.coach }].map(r => (
                                    <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ fontSize: '13px', color: "inherit" }}>{r.l}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: "inherit" }}>{r.v}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>🏆 Achievements</h3>
                                {[{ t: 'District Champions 2025-26', i: '🏆', d: 'Cricket' }, { t: '3x Season Winners', i: '⭐', d: '2023-2026' }, { t: 'Best Team Award 2025', i: '🏅', d: 'District Association' }, { t: 'Fair Play Award', i: '🤝', d: 'Season 2024-25' }].map((a, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <span style={{ fontSize: '24px' }}>{a.i}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '13px', color: "inherit" }}>{a.t}</div>
                                            <div style={{ fontSize: '11px', color: "inherit" }}>{a.d}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {ownerTab === 'financial' && (
                        <div>
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
                                {FINANCIALS.slice(0, 3).map((f, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px', textAlign: 'center' as const, border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 900, color: f.color }}>{f.value}</div>
                                        <div style={{ fontSize: '12px', color: "inherit", fontWeight: 600, marginTop: '4px' }}>{f.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>📊 Breakdown</h3>
                                {FINANCIALS.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < FINANCIALS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <span style={{ fontSize: '14px', color: "inherit", fontWeight: 600 }}>{f.label}</span>
                                        <span style={{ fontSize: '16px', fontWeight: 800, color: f.color }}>{f.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {ownerTab === 'seasons' && (
                        <div style={{ borderRadius: '16px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ minWidth: '600px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.08)' }}>
                                            {['Season', 'P', 'W', 'L', 'D', 'Pts', 'Pos', 'Result'].map(h => (
                                                <th key={h} style={{ padding: '14px 12px', fontSize: '11px', fontWeight: 700, color: "inherit", textAlign: 'left' as const }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {SEASON_HISTORY.map((s, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '14px 12px', fontWeight: 700, fontSize: '14px', color: "inherit" }}>{s.season}</td>
                                                <td style={{ padding: '14px 12px', fontSize: '13px', color: "inherit" }}>{s.played}</td>
                                                <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: 700, color: "inherit" }}>{s.won}</td>
                                                <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: 700, color: "inherit" }}>{s.lost}</td>
                                                <td style={{ padding: '14px 12px', fontSize: '13px', color: "inherit" }}>{s.drawn}</td>
                                                <td style={{ padding: '14px 12px', fontSize: '15px', fontWeight: 800, color: "inherit" }}>{s.points}</td>
                                                <td style={{ padding: '14px 12px', fontSize: '16px', fontWeight: 800, color: "inherit" }}>#{s.position}</td>
                                                <td style={{ padding: '14px 12px', fontSize: '13px', fontWeight: 700 }}>{s.result}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
            { label: 'Matches', value: cs.matches, color: "inherit" },
            { label: 'Runs', value: cs.runs.toLocaleString(), color: "inherit" },
            { label: 'Wickets', value: cs.wickets, color: "inherit" },
            { label: 'High Score', value: cs.highScore, color: "inherit" },
            { label: 'Win Rate', value: `${winRate}%`, color: "inherit" },
            { label: 'PI Score', value: PLAYER.performanceIndex, color: "inherit" }
        ];
    } else if (selectedSportKey === 'football') {
        overviewStats = [
            { label: 'Matches', value: fs.matches, color: "inherit" },
            { label: 'Goals', value: fs.goals, color: "inherit" },
            { label: 'Assists', value: fs.assists, color: "inherit" },
            { label: 'SOT', value: fs.shotsOnTarget, color: "inherit" },
            { label: 'Win Rate', value: `${winRate}%`, color: "inherit" },
            { label: 'PI Score', value: PLAYER.performanceIndex, color: "inherit" }
        ];
    } else if (!selectedSportKey) {
        // All Sports selected
        overviewStats = [
            { label: 'Total Matches', value: cs.matches + fs.matches, color: "inherit" },
            { label: 'Total Runs', value: cs.runs.toLocaleString(), color: "inherit" },
            { label: 'Total Goals', value: fs.goals, color: "inherit" },
            { label: 'Total Wickets', value: cs.wickets, color: "inherit" },
            { label: 'Win Rate', value: `${winRate}%`, color: "inherit" },
            { label: 'PI Score', value: PLAYER.performanceIndex, color: "inherit" }
        ];
    } else {
        // Specific sport selected but no mock data available (e.g. Kabaddi)
        overviewStats = [
            { label: 'Matches', value: 0, color: "inherit" },
            { label: 'Points/Goals', value: 0, color: "inherit" },
            { label: 'Assists/Defenses', value: 0, color: "inherit" },
            { label: 'Fouls', value: 0, color: "inherit" },
            { label: 'Win Rate', value: '0%', color: "inherit" },
            { label: 'PI Score', value: PLAYER.performanceIndex, color: "inherit" }
        ];
    }

    const profileTabs: { key: 'overview' | 'cricket' | 'football' | 'tournaments' | 'history', label: string }[] = [
        { key: 'overview', label: '📋 Overview' }
    ];
    if (!selectedSportKey || selectedSportKey === 'cricket') profileTabs.push({ key: 'cricket', label: '🏏 Cricket Stats' });
    if (!selectedSportKey || selectedSportKey === 'football') profileTabs.push({ key: 'football', label: '⚽ Football Stats' });
    profileTabs.push({ key: 'tournaments', label: '🏆 Tournament Breakdown' });
    profileTabs.push({ key: 'history', label: '📜 History' });

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: "inherit", textDecoration: 'none' }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto", objectFit: "contain" }} /> <span className="gradient-text">Game Sphere</span></div></Link>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link href="/dashboard" style={{ color: "inherit", fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
                    <button onClick={() => setEditMode(!editMode)} style={{
                        padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                        background: editMode ? '#22c55e' : 'rgba(255,255,255,0.1)', color: '#fff',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    }}>
                        {editMode ? '✓ Save Profile' : '✏️ Edit Profile'}
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
                {/* ─── Profile Header ─── */}
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px', flexShrink: 0, border: '3px solid rgba(255,255,255,0.2)' }}>
                        {PLAYER.photo}
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
                        <div style={{ fontSize: '14px', color: "inherit", fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Fingerprint size={16} />
                            {(() => {
                                const ps = user?.player?.playerSports;
                                const { selectedSport } = useSportStore.getState();
                                if (ps && selectedSport) {
                                    const m = ps.find((s: any) => s.sportId === selectedSport.id);
                                    if (m) return m.sportCode;
                                }
                                return dynamicPlayer.sportsId;
                            })()} • #{dynamicPlayer.jerseyNo} • {dynamicPlayer.position}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {!selectedSportKey && (
                                <>
                                    <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: "inherit", fontSize: '12px', fontWeight: 600 }}>🏏 {dynamicPlayer.primarySport}</span>
                                    <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: "inherit", fontSize: '12px', fontWeight: 600 }}>⚽ {dynamicPlayer.secondarySport}</span>
                                </>
                            )}
                            {selectedSportKey && (
                                <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: "inherit", fontSize: '12px', fontWeight: 600 }}>{sportIcon} {sportLabel}</span>
                            )}
                            {[
                                `🏟️ ${dynamicPlayer.level} Level`,
                                `📅 Age ${dynamicPlayer.age}`, `🩸 ${dynamicPlayer.bloodGroup}`,
                            ].map(tag => (
                                <span key={tag} style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: "inherit", fontSize: '12px', fontWeight: 600 }}>{tag}</span>
                            ))}
                            <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(99,102,241,0.3)', color: "inherit", fontSize: '12px', fontWeight: 700 }}>⚡ PI: {dynamicPlayer.performanceIndex}/100</span>
                        </div>
                    </div>
                    {/* Contact info (editable) */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px', minWidth: '220px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: "inherit", marginBottom: '10px' }}>CONTACT & DETAILS</div>
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
                                        <span style={{ fontSize: '11px', color: "inherit", width: '60px' }}>{f.label}:</span>
                                        <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                            style={{ flex: 1, padding: '5px 10px', borderRadius: '6px', border: '1px solid #4338ca', background: 'rgba(255,255,255,0.05)', color: "inherit", fontSize: '12px' }} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: "inherit" }}>
                                <span>📞 {form.phone}</span>
                                <span>📧 {form.email}</span>
                                <span>📍 {form.district}, {form.state}</span>
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
                            <div style={{ fontSize: '11px', color: "inherit", fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ─── Tabs border & layout styling ─── */}
                <div style={{
                    display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap',
                    background: 'rgba(15, 23, 42, 0.4)', padding: '6px', borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(12px)',
                    width: 'fit-content'
                }}>
                    {profileTabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                            padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                            background: activeTab === tab.key ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                            color: activeTab === tab.key ? '#ffffff' : '#94a3b8',
                            fontWeight: activeTab === tab.key ? 800 : 700,
                            fontSize: '14px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: activeTab === tab.key ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none',
                        }}
                            onMouseEnter={(e) => {
                                if (activeTab !== tab.key) {
                                    e.currentTarget.style.color = '#e2e8f0';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== tab.key) {
                                    e.currentTarget.style.color = '#94a3b8';
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══ OVERVIEW TAB ═══ */}
                {activeTab === 'overview' && (
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Achievements */}
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>🏆 Achievements ({filteredAchievements.length})</h3>
                            {filteredAchievements.map((a, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < filteredAchievements.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <span style={{ fontSize: '24px' }}>{a.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '13px', color: "inherit" }}>{a.title}</div>
                                        <div style={{ fontSize: '11px', color: "inherit" }}>{a.date} • {a.sport}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Matches */}
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>⚡ Recent Matches</h3>
                            {filteredMatches.map((m, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < filteredMatches.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '13px', color: "inherit" }}>vs {m.opponent}</div>
                                        <div style={{ fontSize: '11px', color: "inherit" }}>{m.date} • {m.score}</div>
                                        <div style={{ fontSize: '11px', color: "inherit", marginTop: '2px' }}>{m.performance}</div>
                                    </div>
                                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: m.result === 'Won' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: m.result === 'Won' ? '#22c55e' : '#ef4444' }}>{m.result}</span>
                                </div>
                            ))}
                        </div>

                        {/* Certificates */}
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🏅 Certificates</h3>
                            {filteredCertificates.map((c, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < filteredCertificates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '12px', color: "inherit" }}>{c.title}</div>
                                        <div style={{ fontSize: '10px', color: "inherit" }}>{c.type} • {c.date}</div>
                                    </div>
                                    {c.qr && <span style={{ fontSize: '10px', color: "inherit", fontWeight: 600 }}>📱 QR Verified</span>}
                                </div>
                            ))}
                        </div>

                        {/* Injury + Transfers */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🔄 Transfers</h3>
                                {filteredTransfers.map((t, i) => (
                                    <div key={i} style={{ padding: '8px 0' }}>
                                        <div style={{ fontWeight: 600, fontSize: '12px', color: "inherit" }}>{t.from} → {t.to}</div>
                                        <div style={{ fontSize: '10px', color: "inherit" }}>{t.date} • {t.status} • <span style={{ color: "inherit" }}>{t.fee}</span></div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🏥 Injury History</h3>
                                {filteredInjuries.map((inj, i) => (
                                    <div key={i} style={{ padding: '8px 0', borderBottom: i < filteredInjuries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <div style={{ fontWeight: 600, fontSize: '12px', color: "inherit" }}>{inj.type}</div>
                                        <div style={{ fontSize: '10px', color: "inherit" }}>{inj.duration} • {inj.date} • <span style={{ color: "inherit" }}>{inj.status}</span></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ CRICKET STATS TAB ═══ */}
                {activeTab === 'cricket' && (
                    <div>
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            {/* Batting */}
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>🏏 Batting Statistics</h3>
                                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                                    {[
                                        { label: 'Innings', value: cs.innings, color: "inherit" },
                                        { label: 'Runs', value: cs.runs.toLocaleString(), color: "inherit" },
                                        { label: 'High Score', value: cs.highScore, color: "inherit" },
                                        { label: 'Average', value: cs.avg, color: "inherit" },
                                        { label: 'Strike Rate', value: cs.strikeRate, color: "inherit" },
                                        { label: 'Centuries', value: cs.centuries, color: "inherit" },
                                        { label: 'Fifties', value: cs.fifties, color: "inherit" },
                                        { label: 'Fours', value: cs.fours, color: "inherit" },
                                        { label: 'Sixes', value: cs.sixes, color: "inherit" },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: '10px', color: "inherit", fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bowling */}
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>⚾ Bowling Statistics</h3>
                                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                                    {[
                                        { label: 'Wickets', value: cs.wickets, color: "inherit" },
                                        { label: 'Bowl Avg', value: cs.bowlAvg, color: "inherit" },
                                        { label: 'Economy', value: cs.economy, color: "inherit" },
                                        { label: 'Best', value: cs.bestBowling, color: "inherit" },
                                        { label: 'Catches', value: cs.catches, color: "inherit" },
                                        { label: 'Run Outs', value: cs.runOuts, color: "inherit" },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: '10px', color: "inherit", fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Performance Bar Chart */}
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>📊 Performance Over Last 6 Months</h3>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', height: '150px' }}>
                                {[
                                    { month: 'Sep', runs: 280, wickets: 6 },
                                    { month: 'Oct', runs: 420, wickets: 10 },
                                    { month: 'Nov', runs: 350, wickets: 8 },
                                    { month: 'Dec', runs: 510, wickets: 12 },
                                    { month: 'Jan', runs: 380, wickets: 5 },
                                    { month: 'Feb', runs: 456, wickets: 7 },
                                ].map(m => (
                                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 700, color: "inherit" }}>{m.runs}</div>
                                        <div style={{ width: '100%', background: 'linear-gradient(180deg, #22c55e, #065f46)', borderRadius: '6px 6px 0 0', height: `${(m.runs / 510) * 120}px` }} />
                                        <div style={{ fontSize: '11px', color: "inherit", fontWeight: 600 }}>{m.month}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ FOOTBALL STATS TAB ═══ */}
                {activeTab === 'football' && (
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>⚽ Football Statistics</h3>
                            <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                                {[
                                    { label: 'Matches', value: fs.matches, color: "inherit" },
                                    { label: 'Goals', value: fs.goals, color: "inherit" },
                                    { label: 'Assists', value: fs.assists, color: "inherit" },
                                    { label: 'Pass Accuracy', value: `${fs.passAccuracy}%`, color: "inherit" },
                                    { label: 'Shots on Target', value: fs.shotsOnTarget, color: "inherit" },
                                    { label: 'Minutes Played', value: fs.minutesPlayed.toLocaleString(), color: "inherit" },
                                ].map(s => (
                                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: '10px', color: "inherit", fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>🟡 Discipline</h3>
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                                {[
                                    { label: 'Yellow Cards', value: fs.yellowCards, color: "inherit" },
                                    { label: 'Red Cards', value: fs.redCards, color: "inherit" },
                                ].map(s => (
                                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '36px', fontWeight: 900, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: '12px', color: "inherit", fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
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
                                            <th key={h} style={{ padding: '14px 12px', fontSize: '11px', fontWeight: 700, color: "inherit", textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTournaments.map((t, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '14px 12px', fontWeight: 700, fontSize: '13px', color: "inherit" }}>{t.name}</td>
                                            <td style={{ padding: '14px 12px' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: '4px', background: t.sport === 'Cricket' ? 'rgba(99,102,241,0.2)' : 'rgba(239,68,68,0.2)', color: t.sport === 'Cricket' ? '#a5b4fc' : '#fca5a5', fontSize: '11px', fontWeight: 600 }}>{t.sport}</span>
                                            </td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: "inherit", fontWeight: 700 }}>{t.matches}</td>
                                            <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: 800, color: "inherit" }}>{t.sport === 'Cricket' ? t.runs : t.bestScore}</td>
                                            <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: 700, color: "inherit" }}>{t.sport === 'Cricket' ? t.wickets : '—'}</td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: "inherit" }}>{t.sport === 'Cricket' ? t.catches : '—'}</td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', fontWeight: 700, color: "inherit" }}>{t.bestScore}</td>
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
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🏅 Certificates</h3>
                            {filteredCertificates.map((c, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < filteredCertificates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '12px', color: "inherit" }}>{c.title}</div>
                                        <div style={{ fontSize: '10px', color: "inherit" }}>{c.type} • {c.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🔄 Transfers</h3>
                            {filteredTransfers.map((t, i) => (
                                <div key={i} style={{ padding: '8px 0' }}>
                                    <div style={{ fontWeight: 600, fontSize: '12px', color: "inherit" }}>{t.from} → {t.to}</div>
                                    <div style={{ fontSize: '10px', color: "inherit" }}>{t.date} • {t.status} • <span style={{ color: "inherit" }}>{t.fee}</span></div>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>🏥 Injury History</h3>
                            {filteredInjuries.map((inj, i) => (
                                <div key={i} style={{ padding: '8px 0', borderBottom: i < filteredInjuries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <div style={{ fontWeight: 600, fontSize: '12px', color: "inherit" }}>{inj.type}</div>
                                    <div style={{ fontSize: '10px', color: "inherit" }}>{inj.duration} • {inj.date} • <span style={{ color: "inherit" }}>{inj.status}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}

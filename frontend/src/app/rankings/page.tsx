'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSportStore } from '@/lib/store';
import PageNavbar from '@/components/PageNavbar';
import { Users, Shield, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function RankingsPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                <PageNavbar title="Global Rankings" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            </div>
        }>
            <RankingsContent />
        </Suspense>
    );
}

type TabKey = 'players' | 'teams' | 'tournaments';

const SPORT_ROLES: Record<string, string[]> = {
    'Cricket': ['Batsman', 'Bowler', 'All Rounder'],
    'Football': ['Striker', 'Midfielder', 'Defender', 'Goalkeeper'],
    'Basketball': ['Point Guard', 'Shooting Guard', 'Forward', 'Center'],
    'Tennis': ['Singles', 'Doubles']
};

const SPORT_FORMATS: Record<string, string[]> = {
    'Cricket': ['Test', 'ODI', 'T20', 'T10'],
    'Football': ['11 Player', '9A Side', '7 Side'],
    'Basketball': ['Regular Season', 'Playoffs'],
    'Tennis': ['Grand Slam', 'Masters', 'Pro Circuit']
};

function RankingsContent() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'Cricket';
    const normalizedSport = sportLabel.trim().toLowerCase();

    // Case-insensitive matching for Roles & Formats
    const matchedRoleKey = Object.keys(SPORT_ROLES).find(k => k.toLowerCase() === normalizedSport);
    const matchedFormatKey = Object.keys(SPORT_FORMATS).find(k => k.toLowerCase() === normalizedSport);

    const playerRoles = matchedRoleKey ? SPORT_ROLES[matchedRoleKey] : ['Offense', 'Defense', 'Utility'];
    const teamFormats = matchedFormatKey ? SPORT_FORMATS[matchedFormatKey] : ['Standard', 'Short Format', 'Exhibition'];

    const [activeTab, setActiveTab] = useState<TabKey>('players');
    const [activeRole, setActiveRole] = useState<string>(playerRoles[0] || '');
    const [activeFormat, setActiveFormat] = useState<string>(teamFormats[0] || '');

    useEffect(() => {
        if (!playerRoles.includes(activeRole)) setActiveRole(playerRoles[0]);
        if (!teamFormats.includes(activeFormat)) setActiveFormat(teamFormats[0]);
    }, [sportLabel, playerRoles, activeRole, teamFormats, activeFormat]);

    const TABS: { key: TabKey; label: string; icon: any; highlight: string }[] = [
        { key: 'players', label: 'Players', icon: <Users size={20} />, highlight: '#0ea5e9' },
        { key: 'teams', label: 'Teams', icon: <Shield size={20} />, highlight: '#22c55e' },
        { key: 'tournaments', label: 'Tournaments', icon: <Trophy size={20} />, highlight: '#f59e0b' },
    ];

    // MOCK GENERATORS for Data (empty handles clean states if no data exists)
    const mockPlayers = [
        // Cricket
        { id: 1, name: 'Virat Singh', sport: 'cricket', subText: 'Mumbai Indians', gsp: 942, trend: 15, role: 'Batsman' },
        { id: 2, name: 'David W.', sport: 'cricket', subText: 'Delhi Capitals', gsp: 910, trend: -5, role: 'Batsman' },
        { id: 3, name: 'Bumrah J.', sport: 'cricket', subText: 'Mumbai Indians', gsp: 890, trend: 22, role: 'Bowler' },
        { id: 4, name: 'Rashid K.', sport: 'cricket', subText: 'Gujarat Titans', gsp: 865, trend: 8, role: 'Bowler' },
        { id: 5, name: 'Hardik P.', sport: 'cricket', subText: 'Mumbai Indians', gsp: 915, trend: 0, role: 'All Rounder' },
        // Football
        { id: 6, name: 'Lionel Messi', sport: 'football', subText: 'Inter Miami', gsp: 980, trend: 10, role: 'Striker' },
        { id: 7, name: 'K. Mbappe', sport: 'football', subText: 'Real Madrid', gsp: 975, trend: 15, role: 'Striker' },
        { id: 8, name: 'K. De Bruyne', sport: 'football', subText: 'Manchester City', gsp: 950, trend: -2, role: 'Midfielder' },
        { id: 9, name: 'V. van Dijk', sport: 'football', subText: 'Liverpool', gsp: 910, trend: 5, role: 'Defender' },
        { id: 10, name: 'Alisson B.', sport: 'football', subText: 'Liverpool', gsp: 890, trend: 12, role: 'Goalkeeper' },
        // Basketball
        { id: 11, name: 'Stephen Curry', sport: 'basketball', subText: 'Warriors', gsp: 960, trend: 20, role: 'Point Guard' },
        { id: 12, name: 'LeBron James', sport: 'basketball', subText: 'Lakers', gsp: 945, trend: 5, role: 'Forward' },
        { id: 13, name: 'N. Jokic', sport: 'basketball', subText: 'Nuggets', gsp: 970, trend: 15, role: 'Center' },
    ].filter(p => playerRoles.includes(p.role) && p.role === activeRole && p.sport === normalizedSport);

    const mockTeams = [
        // Cricket
        { id: 1, name: 'Mumbai Indians', sport: 'cricket', subText: 'India', matches: 144, gsp: 8400, trend: 120, format: 'T20' },
        { id: 2, name: 'Chennai Super Kings', sport: 'cricket', subText: 'India', matches: 142, gsp: 8250, trend: -40, format: 'T20' },
        { id: 3, name: 'Australia National', sport: 'cricket', subText: 'World', matches: 840, gsp: 12400, trend: 210, format: 'Test' },
        { id: 4, name: 'India National', sport: 'cricket', subText: 'World', matches: 850, gsp: 12350, trend: 180, format: 'Test' },
        { id: 5, name: 'England National', sport: 'cricket', subText: 'World', matches: 600, gsp: 9200, trend: -100, format: 'ODI' },
        // Football
        { id: 6, name: 'Real Madrid', sport: 'football', subText: 'Spain', matches: 38, gsp: 9500, trend: 300, format: '11 Player' },
        { id: 7, name: 'Manchester City', sport: 'football', subText: 'England', matches: 38, gsp: 9400, trend: 150, format: '11 Player' },
        { id: 8, name: 'Bayern Munich', sport: 'football', subText: 'Germany', matches: 34, gsp: 9100, trend: -50, format: '11 Player' },
        { id: 9, name: 'Argentina National', sport: 'football', subText: 'World', matches: 12, gsp: 10500, trend: 400, format: '9A Side' },
        { id: 10, name: 'France National', sport: 'football', subText: 'World', matches: 14, gsp: 10200, trend: 100, format: '7 Side' },
        // Basketball
        { id: 11, name: 'Boston Celtics', sport: 'basketball', subText: 'USA', matches: 82, gsp: 8900, trend: 250, format: 'Regular Season' },
        { id: 12, name: 'Denver Nuggets', sport: 'basketball', subText: 'USA', matches: 82, gsp: 8800, trend: -120, format: 'Regular Season' },
        { id: 13, name: 'LA Lakers', sport: 'basketball', subText: 'USA', matches: 20, gsp: 9300, trend: 400, format: 'Playoffs' },
    ].filter(t => teamFormats.includes(t.format) && t.format === activeFormat && t.sport === normalizedSport);

    const mockTournaments = [
        { id: 1, name: 'Indian Premier League (IPL)', org: 'BCCI', rating: 98.5, sport: 'cricket' },
        { id: 2, name: 'World Cup 2023', org: 'ICC', rating: 97.2, sport: 'cricket' },
        { id: 3, name: 'Big Bash League', org: 'CA', rating: 92.1, sport: 'cricket' },
        { id: 4, name: 'Champions League', org: 'UEFA', rating: 99.1, sport: 'football' },
        { id: 5, name: 'Premier League', org: 'FA', rating: 98.0, sport: 'football' },
        { id: 6, name: 'FIFA World Cup', org: 'FIFA', rating: 100.0, sport: 'football' },
        { id: 7, name: 'NBA Finals', org: 'NBA', rating: 99.5, sport: 'basketball' },
        { id: 8, name: 'EuroLeague', org: 'FIBA', rating: 94.0, sport: 'basketball' },
    ].filter(t => t.sport === normalizedSport);

    const TrendIndicator = ({ value }: { value: number }) => {
        if (value > 0) return <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '13px', fontWeight: 700 }}><TrendingUp size={14} strokeWidth={3} /> +{value}</span>;
        if (value < 0) return <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '13px', fontWeight: 700 }}><TrendingDown size={14} strokeWidth={3} /> {value}</span>;
        return <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '13px', fontWeight: 700 }}><Minus size={14} strokeWidth={3} /> {value}</span>;
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageNavbar title="Global Rankings" emoji="🌍" />

            {/* ── Main Tab Navigation ── */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '45px', zIndex: 49 }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1, padding: '16px 0', border: 'none', background: 'none',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '8px',
                                color: activeTab === tab.key ? tab.highlight : '#94a3b8',
                                borderBottom: activeTab === tab.key ? `3px solid ${tab.highlight}` : '3px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab.icon}
                            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px 80px' }}>

                {/* ── Sub-Tab Filters (Pills) ── */}
                {activeTab === 'players' && (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '8px', scrollbarWidth: 'none' }}>
                        {playerRoles.map(role => (
                            <button
                                key={role}
                                onClick={() => setActiveRole(role)}
                                style={{
                                    padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
                                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                    background: activeRole === role ? '#0ea5e9' : 'white',
                                    color: activeRole === role ? 'white' : '#64748b',
                                    boxShadow: activeRole === role ? '0 4px 12px rgba(14,165,233,0.3)' : '0 2px 6px rgba(0,0,0,0.04)',
                                }}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                )}
                {activeTab === 'teams' && (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '8px', scrollbarWidth: 'none' }}>
                        {teamFormats.map(fmt => (
                            <button
                                key={fmt}
                                onClick={() => setActiveFormat(fmt)}
                                style={{
                                    padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
                                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                    background: activeFormat === fmt ? '#22c55e' : 'white',
                                    color: activeFormat === fmt ? 'white' : '#64748b',
                                    boxShadow: activeFormat === fmt ? '0 4px 12px rgba(34,197,94,0.3)' : '0 2px 6px rgba(0,0,0,0.04)',
                                }}
                            >
                                {fmt}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── List Headers ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', marginBottom: '12px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <span>Rank & Name</span>
                    <span>{activeTab === 'tournaments' ? 'Rating Points' : 'GameSphere Points'}</span>
                </div>

                {/* ── Data Views ── */}
                <div style={{ display: 'grid', gap: '8px' }}>

                    {/* PLAYERS */}
                    {activeTab === 'players' && (
                        mockPlayers.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                <div style={{ color: '#94a3b8', fontWeight: 700 }}>No ranked players found for this role.</div>
                            </div>
                        ) : mockPlayers.sort((a, b) => b.gsp - a.gsp).map((p, idx) => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                                <div style={{ width: '28px', fontSize: '16px', fontWeight: 900, color: idx < 3 ? '#0ea5e9' : '#94a3b8' }}>#{idx + 1}</div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginRight: '16px' }}>👤</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{p.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{p.subText}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0ea5e9' }}>{p.gsp}</div>
                                    <TrendIndicator value={p.trend} />
                                </div>
                            </div>
                        ))
                    )}

                    {/* TEAMS */}
                    {activeTab === 'teams' && (
                        mockTeams.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                <div style={{ color: '#94a3b8', fontWeight: 700 }}>No ranked teams found for this format.</div>
                            </div>
                        ) : mockTeams.sort((a, b) => b.gsp - a.gsp).map((t, idx) => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                                <div style={{ width: '28px', fontSize: '16px', fontWeight: 900, color: idx < 3 ? '#22c55e' : '#94a3b8' }}>#{idx + 1}</div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginRight: '16px' }}>🛡️</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{t.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{t.matches} Matches Played</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#22c55e' }}>{t.gsp}</div>
                                    <TrendIndicator value={t.trend} />
                                </div>
                            </div>
                        ))
                    )}

                    {/* TOURNAMENTS */}
                    {activeTab === 'tournaments' && (
                        mockTournaments.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                <div style={{ color: '#94a3b8', fontWeight: 700 }}>No ranked tournaments found.</div>
                            </div>
                        ) : mockTournaments.sort((a, b) => b.rating - a.rating).map((t, idx) => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                                <div style={{ width: '28px', fontSize: '16px', fontWeight: 900, color: idx < 3 ? '#f59e0b' : '#94a3b8' }}>#{idx + 1}</div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginRight: '16px' }}>🏆</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{t.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{t.org}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#f59e0b' }}>{t.rating.toFixed(1)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

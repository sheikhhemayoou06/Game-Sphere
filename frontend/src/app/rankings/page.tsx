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
    'Football': ['League', 'Cup', 'Friendly'],
    'Basketball': ['Regular Season', 'Playoffs'],
    'Tennis': ['Grand Slam', 'Masters', 'Pro Circuit']
};

function RankingsContent() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'Cricket';

    const [activeTab, setActiveTab] = useState<TabKey>('players');

    // Dynamic Sub-tabs logic based on sport context
    const playerRoles = SPORT_ROLES[sportLabel] || ['Offense', 'Defense', 'Utility'];
    const teamFormats = SPORT_FORMATS[sportLabel] || ['Standard', 'Short Format', 'Exhibition'];

    const [activeRole, setActiveRole] = useState<string>(playerRoles[0]);
    const [activeFormat, setActiveFormat] = useState<string>(teamFormats[0]);

    // Ensure state resets intelligently if the sport context globally changes underneath the view
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
        { id: 1, name: 'Virat Singh', subText: 'Mumbai Indians', gsp: 942, trend: 15, role: 'Batsman' },
        { id: 2, name: 'David W.', subText: 'Delhi Capitals', gsp: 910, trend: -5, role: 'Batsman' },
        { id: 3, name: 'Bumrah J.', subText: 'Mumbai Indians', gsp: 890, trend: 22, role: 'Bowler' },
        { id: 4, name: 'Rashid K.', subText: 'Gujarat Titans', gsp: 865, trend: 8, role: 'Bowler' },
        { id: 5, name: 'Hardik P.', subText: 'Mumbai Indians', gsp: 915, trend: 0, role: 'All Rounder' },
        { id: 6, name: 'Lionel M.', subText: 'Inter Miami', gsp: 980, trend: 10, role: 'Striker' },
    ].filter(p => playerRoles.includes(p.role) && p.role === activeRole);

    const mockTeams = [
        { id: 1, name: 'Mumbai Indians', subText: 'India', matches: 144, gsp: 8400, trend: 120, format: 'T20' },
        { id: 2, name: 'Chennai Super Kings', subText: 'India', matches: 142, gsp: 8250, trend: -40, format: 'T20' },
        { id: 3, name: 'Australia National', subText: 'World', matches: 840, gsp: 12400, trend: 210, format: 'Test' },
        { id: 4, name: 'Real Madrid', subText: 'Spain', matches: 38, gsp: 9500, trend: 300, format: 'League' },
    ].filter(t => teamFormats.includes(t.format) && t.format === activeFormat);

    const mockTournaments = [
        { id: 1, name: 'Indian Premier League (IPL)', org: 'BCCI', rating: 98.5 },
        { id: 2, name: 'World Cup 2023', org: 'ICC', rating: 97.2 },
        { id: 3, name: 'Champions League', org: 'UEFA', rating: 99.1 },
    ]; // In production, we'd filter these by sport too.

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

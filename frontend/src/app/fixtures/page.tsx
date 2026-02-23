'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';

type BracketMatch = { id: number; round: number; position: number; teamA: string; teamB: string; scoreA?: number; scoreB?: number; winner?: string };

export default function FixturesPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '🏟️';
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<any>(null);
    const [format, setFormat] = useState<'KNOCKOUT' | 'ROUND_ROBIN'>('KNOCKOUT');
    const [fixtures, setFixtures] = useState<BracketMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [generated, setGenerated] = useState(false);

    useEffect(() => {
        api.getTournaments().then(setTournaments).catch(() => []).finally(() => setLoading(false));
    }, []);

    const CRICKET_TEAMS = ['Thunder Warriors', 'Blue Blazers', 'Red Dragons', 'Golden Eagles', 'Silver Sharks', 'Green Vipers', 'Iron Falcons', 'Storm Riders'];
    const FOOTBALL_TEAMS = ['Storm FC', 'Iron Hawks FC', 'Blue Devils FC', 'Red Bulls FC', 'Golden Tigers FC', 'Silver Knights FC', 'Green Arrows FC', 'Black Panthers FC'];
    const sampleTeams = selectedSport?.name === 'Football' ? FOOTBALL_TEAMS : CRICKET_TEAMS;

    const filteredTournaments = selectedSport ? tournaments.filter(t => !t.sport || t.sport === selectedSport.name || t.sport?.name === selectedSport.name) : tournaments;

    const generateKnockout = () => {
        const teams = [...sampleTeams];
        const rounds = Math.ceil(Math.log2(teams.length));
        const matches: BracketMatch[] = [];
        let id = 1;
        for (let r = 0; r < rounds; r++) {
            const matchesInRound = Math.pow(2, rounds - r - 1);
            for (let p = 0; p < matchesInRound; p++) {
                if (r === 0) {
                    matches.push({ id: id++, round: r, position: p, teamA: teams[p * 2] || 'BYE', teamB: teams[p * 2 + 1] || 'BYE' });
                } else {
                    matches.push({ id: id++, round: r, position: p, teamA: 'Winner M' + (matches.find(m => m.round === r - 1 && m.position === p * 2)?.id || '?'), teamB: 'Winner M' + (matches.find(m => m.round === r - 1 && m.position === p * 2 + 1)?.id || '?') });
                }
            }
        }
        setFixtures(matches);
        setGenerated(true);
    };

    const generateRoundRobin = () => {
        const teams = sampleTeams.slice(0, 6);
        const matches: BracketMatch[] = [];
        let id = 1;
        let round = 0;
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                matches.push({ id: id++, round: round, position: 0, teamA: teams[i], teamB: teams[j] });
                if (id % 3 === 0) round++;
            }
        }
        setFixtures(matches);
        setGenerated(true);
    };

    const handleGenerate = () => {
        if (format === 'KNOCKOUT') generateKnockout();
        else generateRoundRobin();
    };

    const roundLabels: Record<number, string> = { 0: 'Quarter-Finals', 1: 'Semi-Finals', 2: 'Final' };
    const groupedByRound = fixtures.reduce((acc, m) => { (acc[m.round] = acc[m.round] || []).push(m); return acc; }, {} as Record<number, BracketMatch[]>);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fbbf24 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#92400e', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#92400e', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#78350f', marginBottom: '8px' }}>{sportIcon} {selectedSport ? `${sportLabel} Fixture Generator` : 'Fixture Generator'}</h1>
                <p style={{ color: '#92400e', fontSize: '16px', marginBottom: '28px' }}>{selectedSport ? `Auto-generate ${sportLabel} brackets and schedules` : 'Auto-generate tournament brackets and round-robin schedules'}</p>

                {/* Config panel */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 4px 24px rgba(120,53,15,0.08)', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#78350f', display: 'block', marginBottom: '6px' }}>Tournament</label>
                        <select value={selectedTournament?.id || ''} onChange={(e) => setSelectedTournament(tournaments.find(t => t.id === e.target.value))}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #fde68a', fontSize: '14px', fontWeight: 600 }}>
                            <option value="">Select tournament...</option>
                            {filteredTournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#78350f', display: 'block', marginBottom: '6px' }}>Format</label>
                        <div style={{ display: 'flex', gap: '4px', background: '#fef3c7', borderRadius: '10px', padding: '4px' }}>
                            {(['KNOCKOUT', 'ROUND_ROBIN'] as const).map(f => (
                                <button key={f} onClick={() => { setFormat(f); setGenerated(false); }}
                                    style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: format === f ? '#92400e' : 'transparent', color: format === f ? '#fff' : '#92400e', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                                    {f === 'KNOCKOUT' ? '🏆 Knockout' : '🔄 Round Robin'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleGenerate}
                        style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#92400e', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '14px' }}>
                        ⚡ Generate Fixtures
                    </button>
                </div>

                {!generated ? (
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 4px 24px rgba(120,53,15,0.06)' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏟️</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#78350f', marginBottom: '8px' }}>Ready to Generate</div>
                        <div style={{ color: '#92400e', fontSize: '14px' }}>Select a tournament and format, then click Generate Fixtures</div>
                    </div>
                ) : format === 'KNOCKOUT' ? (
                    /* Knockout bracket view */
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'flex', gap: '32px', minWidth: '800px', alignItems: 'center' }}>
                            {Object.entries(groupedByRound).map(([round, matches]) => (
                                <div key={round} style={{ flex: 1 }}>
                                    <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '14px', fontWeight: 800, color: '#78350f' }}>
                                        {roundLabels[Number(round)] || `Round ${Number(round) + 1}`}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', minHeight: `${matches.length * 100}px` }}>
                                        {matches.map(m => (
                                            <div key={m.id} style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 12px rgba(120,53,15,0.08)', border: `2px solid ${Number(round) === 2 ? '#fbbf24' : '#fde68a'}` }}>
                                                <div style={{ fontSize: '10px', color: '#92400e', fontWeight: 700, marginBottom: '8px' }}>Match {m.id}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{m.teamA}</span>
                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>vs</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{m.teamB}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {/* Trophy */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ fontSize: '48px' }}>🏆</div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: '#78350f' }}>Champion</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Round robin table view */
                    <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(120,53,15,0.08)' }}>
                        <div style={{ padding: '20px 24px', background: '#92400e', color: '#fff' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '16px' }}>Round Robin — {fixtures.length} Matches</h3>
                        </div>
                        <div style={{ display: 'grid', gap: '0' }}>
                            {fixtures.map((m, i) => (
                                <div key={m.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid #f5f3ff', background: i % 2 === 0 ? '#fffbeb' : '#fff' }}>
                                    <div style={{ width: '50px', fontSize: '12px', fontWeight: 700, color: '#92400e' }}>M{m.id}</div>
                                    <div style={{ flex: 1, fontWeight: 700, fontSize: '14px', color: '#1e1b4b', textAlign: 'right', paddingRight: '16px' }}>{m.teamA}</div>
                                    <div style={{ padding: '4px 12px', borderRadius: '6px', background: '#fef3c7', fontSize: '12px', fontWeight: 800, color: '#92400e' }}>VS</div>
                                    <div style={{ flex: 1, fontWeight: 700, fontSize: '14px', color: '#1e1b4b', paddingLeft: '16px' }}>{m.teamB}</div>
                                    <div style={{ width: '80px', textAlign: 'right' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#ecfdf5', color: '#22c55e', fontSize: '11px', fontWeight: 700 }}>Scheduled</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

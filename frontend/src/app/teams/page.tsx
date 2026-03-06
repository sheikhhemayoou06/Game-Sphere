'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore, useSportStore } from '@/lib/store';
import { api } from '@/lib/api';
import { sportIcons, sportConfig, defaultSportConfig } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';
import { Search, X } from 'lucide-react';

export default function TeamsPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const [myTeams, setMyTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTeamIdx, setActiveTeamIdx] = useState(0);
    const [playerSearch, setPlayerSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        const fetchTeams = async () => {
            try {
                if (selectedSport?.id) {
                    const teams = await api.getMyTeams(selectedSport.id);
                    setMyTeams(teams);
                } else {
                    setMyTeams([]);
                }
            } catch {
                setMyTeams([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, [selectedSport?.id]);

    const activeTeam = myTeams[activeTeamIdx] || null;
    const roster: any[] = activeTeam?.players || activeTeam?.roster || [];

    /* Filter roster by search */
    const filteredRoster = roster.filter((p: any) => {
        if (!playerSearch.trim()) return true;
        const q = playerSearch.toLowerCase();
        const name = (p.user?.firstName || p.name || '').toLowerCase() + ' ' + (p.user?.lastName || '').toLowerCase();
        const position = (p.position || p.role || '').toLowerCase();
        return name.includes(q) || position.includes(q);
    });

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Navbar — plain "My Team" */}
            <PageNavbar title="My Team" />

            {/* ── Team Selector (if multiple) ── */}
            {myTeams.length > 1 && (
                <div style={{
                    background: 'white', borderBottom: '1px solid #e2e8f0',
                    padding: '10px 32px', overflowX: 'auto',
                }}>
                    <div style={{ display: 'flex', gap: '8px', maxWidth: '1100px', margin: '0 auto' }}>
                        {myTeams.map((t, idx) => (
                            <button key={t.id || idx} onClick={() => { setActiveTeamIdx(idx); setPlayerSearch(''); }}
                                style={{
                                    padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                    fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
                                    background: activeTeamIdx === idx ? '#4f46e5' : 'white',
                                    color: activeTeamIdx === idx ? 'white' : '#64748b',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                    transition: 'all 0.2s',
                                }}>
                                {t.sport?.icon || sportIcons[t.sport?.name] || '🛡️'} {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Search Bar ── */}
            <div style={{
                display: 'flex', justifyContent: 'center',
                padding: '28px 20px 16px',
            }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '560px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search teammates by name or position…"
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '14px 44px 14px 46px', borderRadius: '14px',
                            border: '1.5px solid #e2e8f0', background: '#f1f5f9',
                            fontSize: '15px', fontWeight: 600, color: '#0f172a', outline: 'none',
                        }}
                    />
                    {playerSearch && (
                        <button onClick={() => setPlayerSearch('')} style={{
                            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                            background: '#e2e8f0', border: 'none', borderRadius: '50%',
                            width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                        }}>
                            <X size={14} color="#64748b" />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Content ── */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px', paddingBottom: '80px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '16px' }}>
                        ⏳ Loading your team…
                    </div>
                ) : myTeams.length === 0 ? (
                    <div style={{
                        padding: '60px', borderRadius: '20px', background: 'white',
                        border: '1px solid #f1f5f9', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>You're not part of any team yet</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px', marginBottom: '20px' }}>
                            Explore teams and apply to join from the Search page.
                        </p>
                        <Link href="/explore" style={{
                            padding: '12px 28px', borderRadius: '12px',
                            background: '#4f46e5', color: 'white', fontWeight: 700, fontSize: '14px',
                            textDecoration: 'none', display: 'inline-block',
                        }}>
                            🔍 Explore Teams
                        </Link>
                    </div>
                ) : !activeTeam ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Select a team</div>
                ) : (
                    <>
                        {/* Team Header */}
                        <div style={{
                            padding: '24px', borderRadius: '16px', background: 'white',
                            border: '1px solid #e2e8f0', marginBottom: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: '16px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '24px', color: 'white',
                                }}>
                                    {activeTeam.sport?.icon || sportIcons[activeTeam.sport?.name] || '🛡️'}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b' }}>{activeTeam.name}</h2>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                                        {activeTeam.sport?.name} {activeTeam.city ? `• ${activeTeam.city}` : ''} • {roster.length} players
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', textAlign: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#4f46e5' }}>{roster.length}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Players</div>
                                </div>
                            </div>
                        </div>

                        {/* Teammates Grid */}
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '12px' }}>
                            {playerSearch ? `${filteredRoster.length} result${filteredRoster.length !== 1 ? 's' : ''}` : `${roster.length} Teammate${roster.length !== 1 ? 's' : ''}`}
                        </div>

                        {filteredRoster.length === 0 ? (
                            <div style={{
                                padding: '40px', borderRadius: '16px', background: 'white',
                                border: '1px solid #f1f5f9', textAlign: 'center', color: '#94a3b8',
                            }}>
                                {playerSearch ? `No teammates matching "${playerSearch}"` : 'No players in roster yet'}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                {filteredRoster.map((p: any, i: number) => {
                                    const name = p.user ? `${p.user.firstName} ${p.user.lastName}` : (p.name || 'Unknown');
                                    const initials = p.user ? `${p.user.firstName?.[0] || ''}${p.user.lastName?.[0] || ''}` : (p.name?.[0] || '?');
                                    const position = p.position || p.role || 'Player';
                                    const isOnline = p.online ?? false;
                                    const isCaptain = position.toLowerCase().includes('captain');

                                    return (
                                        <div key={p.id || i} className="card-hover" style={{
                                            padding: '18px', borderRadius: '14px', background: 'white',
                                            border: `1px solid ${isCaptain ? '#fde68a' : '#f1f5f9'}`,
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                                            display: 'flex', alignItems: 'center', gap: '14px',
                                        }}>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{
                                                    width: '44px', height: '44px', borderRadius: '50%',
                                                    background: isCaptain ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: 800, fontSize: '15px',
                                                }}>
                                                    {initials}
                                                </div>
                                                <div style={{
                                                    position: 'absolute', bottom: '0', right: '0',
                                                    width: '12px', height: '12px', borderRadius: '50%',
                                                    background: isOnline ? '#22c55e' : '#d4d4d8',
                                                    border: '2px solid white',
                                                }}></div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {name}
                                                    {isCaptain && <span style={{ fontSize: '14px' }}>👑</span>}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{position}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

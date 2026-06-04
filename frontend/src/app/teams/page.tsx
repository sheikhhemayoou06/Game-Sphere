'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore, useSportStore } from '@/lib/store';
import { api } from '@/lib/api';
import { sportIcons, sportConfig, defaultSportConfig } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';
import { Search, X, Users, Settings, Trophy, Info, ChevronDown, LogOut, Check } from 'lucide-react';
import SportIcon from '@/components/SportIcon';

export default function TeamsPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const [myTeams, setMyTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTeamIdx, setActiveTeamIdx] = useState(0);
    const [playerSearch, setPlayerSearch] = useState('');
    
    // UI state
    const [activeTab, setActiveTab] = useState<'squad' | 'roles' | 'dream11' | 'info'>('squad');
    const [editingRoleFor, setEditingRoleFor] = useState<string | null>(null);
    const [releasingPlayerId, setReleasingPlayerId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Dream11 State
    const [dream11Squad, setDream11Squad] = useState<any[]>([]);
    const [dreamCaptain, setDreamCaptain] = useState<string | null>(null);
    const [dreamViceCaptain, setDreamViceCaptain] = useState<string | null>(null);

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

    useEffect(() => {
        setLoading(true);
        fetchTeams();
    }, [selectedSport?.id]);
    
    // Load Dream11 from local storage when team changes
    useEffect(() => {
        const team = myTeams[activeTeamIdx];
        if (team) {
            try {
                const saved = localStorage.getItem(`dream11_${team.id}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setDream11Squad(parsed.squad || []);
                    setDreamCaptain(parsed.captain || null);
                    setDreamViceCaptain(parsed.viceCaptain || null);
                } else {
                    setDream11Squad([]);
                    setDreamCaptain(null);
                    setDreamViceCaptain(null);
                }
            } catch {
                setDream11Squad([]);
            }
        }
    }, [activeTeamIdx, myTeams]);

    const activeTeam = myTeams[activeTeamIdx] || null;
    const roster: any[] = activeTeam?.players || activeTeam?.roster || [];
    const sportName = activeTeam?.sport?.name || 'Cricket';
    const sportColor = activeTeam?.sport?.accentColor || '#1e3a8a';
    
    // Determine permissions
    const isManager = activeTeam?.managerId === user?.id;
    const currentUserAsPlayer = roster.find((p: any) => p.player?.userId === user?.id);
    const isCaptain = currentUserAsPlayer?.role?.toLowerCase().includes('captain');
    const canManagePlayers = isManager || isCaptain;

    const handleRoleUpdate = async (playerId: string, newRole: string) => {
        if (!activeTeam || !canManagePlayers) return;
        setActionLoading(true);
        try {
            await api.updatePlayerRole(activeTeam.id, playerId, newRole);
            await fetchTeams(); // Refresh
        } catch (e: any) {
            alert('Failed to update role: ' + e.message);
        } finally {
            setActionLoading(false);
            setEditingRoleFor(null);
        }
    };

    const handleReleasePlayer = async () => {
        if (!activeTeam || !releasingPlayerId || !canManagePlayers) return;
        setActionLoading(true);
        try {
            await api.leaveTeam(activeTeam.id, releasingPlayerId);
            await fetchTeams();
        } catch (e: any) {
            alert('Failed to release player: ' + e.message);
        } finally {
            setActionLoading(false);
            setReleasingPlayerId(null);
        }
    };
    
    // Dream11 logic
    const toggleDream11Player = (player: any) => {
        if (dream11Squad.some(p => p.playerId === player.playerId)) {
            // Remove
            const newSquad = dream11Squad.filter(p => p.playerId !== player.playerId);
            setDream11Squad(newSquad);
            if (dreamCaptain === player.playerId) setDreamCaptain(null);
            if (dreamViceCaptain === player.playerId) setDreamViceCaptain(null);
        } else {
            // Add if < 11
            if (dream11Squad.length < 11) {
                setDream11Squad([...dream11Squad, player]);
            } else {
                alert("You can only select 11 players for your Dream XI.");
            }
        }
    };
    
    const saveDream11 = () => {
        if (!activeTeam) return;
        if (dream11Squad.length !== 11) {
            alert("Please select exactly 11 players.");
            return;
        }
        if (!dreamCaptain || !dreamViceCaptain) {
            alert("Please select a Captain and Vice-Captain.");
            return;
        }
        localStorage.setItem(`dream11_${activeTeam.id}`, JSON.stringify({
            squad: dream11Squad,
            captain: dreamCaptain,
            viceCaptain: dreamViceCaptain
        }));
        alert("Dream XI saved locally!");
    };

    // UI Helpers
    const getRoleBadge = (roleStr: string = 'Player') => {
        const lower = roleStr.toLowerCase();
        if (lower.includes('captain')) return { bg: '#fef3c7', color: '#d97706', text: roleStr, icon: '👑' };
        if (lower.includes('vice')) return { bg: '#f1f5f9', color: '#64748b', text: roleStr, icon: '⭐' };
        if (lower.includes('bowl')) return { bg: '#e0e7ff', color: '#4338ca', text: roleStr, icon: '🥎' };
        if (lower.includes('bat')) return { bg: '#dcfce7', color: '#15803d', text: roleStr, icon: '🏏' };
        if (lower.includes('all')) return { bg: '#fce7f3', color: '#be185d', text: roleStr, icon: '⚔️' };
        if (lower.includes('keep') || lower.includes('wk')) return { bg: '#ffedd5', color: '#c2410c', text: roleStr, icon: '🧤' };
        return { bg: '#f8fafc', color: '#475569', text: roleStr, icon: '👤' };
    };

    const ROLE_OPTIONS = ['Captain', 'Vice-Captain', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper', 'Fielder', 'Player'];

    /* Filter roster by search */
    const filteredRoster = roster.filter((p: any) => {
        if (!playerSearch.trim()) return true;
        const q = playerSearch.toLowerCase();
        const name = (p.player?.user?.firstName || p.name || '').toLowerCase() + ' ' + (p.player?.user?.lastName || '').toLowerCase();
        const position = (p.position || p.role || '').toLowerCase();
        return name.includes(q) || position.includes(q);
    });
    
    // Grouped by role for the Roles tab
    const roleGroups = roster.reduce((acc: any, p: any) => {
        const r = p.role || 'Player';
        if (!acc[r]) acc[r] = [];
        acc[r].push(p);
        return acc;
    }, {});

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Navbar */}
            <PageNavbar title="My Team" />

            {/* Team Selector */}
            {myTeams.length > 1 && (
                <div style={{
                    background: 'white', borderBottom: '1px solid #e2e8f0',
                    padding: '10px 32px', overflowX: 'auto',
                }}>
                    <div style={{ display: 'flex', gap: '8px', maxWidth: '1100px', margin: '0 auto' }}>
                        {myTeams.map((t, idx) => (
                            <button key={t.id || idx} onClick={() => { setActiveTeamIdx(idx); setPlayerSearch(''); setActiveTab('squad'); }}
                                style={{
                                    padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                    fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
                                    background: activeTeamIdx === idx ? '#4f46e5' : 'white',
                                    color: activeTeamIdx === idx ? 'white' : '#64748b',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                    transition: 'all 0.2s',
                                }}>
                                <SportIcon sport={t.sport?.name || 'Athletics'} size={20} color="currentColor" /> {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px', paddingBottom: '80px', paddingTop: '24px' }}>
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
                            border: '1px solid #e2e8f0', marginBottom: '24px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: '16px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '28px', color: 'white',
                                }}>
                                    {activeTeam.sport?.icon || sportIcons[activeTeam.sport?.name] || '🛡️'}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e1b4b' }}>{activeTeam.name}</h2>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                        {activeTeam.sport?.name} {activeTeam.city ? `• ${activeTeam.city}` : ''}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>
                                        UID: {activeTeam.teamCode || 'N/A'} {isManager ? ' (You are the Manager)' : ''}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', textAlign: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#4f46e5' }}>{roster.length}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Players</div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', overflowX: 'auto' }}>
                            <button onClick={() => setActiveTab('squad')} style={{
                                padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '15px', fontWeight: 700, color: activeTab === 'squad' ? '#4f46e5' : '#64748b',
                                borderBottom: activeTab === 'squad' ? '3px solid #4f46e5' : '3px solid transparent',
                                marginBottom: '-11px', display: 'flex', alignItems: 'center', gap: '8px',
                            }}>
                                <Users size={18} /> Squad
                            </button>
                            <button onClick={() => setActiveTab('roles')} style={{
                                padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '15px', fontWeight: 700, color: activeTab === 'roles' ? '#4f46e5' : '#64748b',
                                borderBottom: activeTab === 'roles' ? '3px solid #4f46e5' : '3px solid transparent',
                                marginBottom: '-11px', display: 'flex', alignItems: 'center', gap: '8px',
                            }}>
                                <Settings size={18} /> Roles
                            </button>
                            <button onClick={() => setActiveTab('dream11')} style={{
                                padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '15px', fontWeight: 700, color: activeTab === 'dream11' ? '#4f46e5' : '#64748b',
                                borderBottom: activeTab === 'dream11' ? '3px solid #4f46e5' : '3px solid transparent',
                                marginBottom: '-11px', display: 'flex', alignItems: 'center', gap: '8px',
                            }}>
                                <Trophy size={18} /> Dream XI
                            </button>
                            <button onClick={() => setActiveTab('info')} style={{
                                padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '15px', fontWeight: 700, color: activeTab === 'info' ? '#4f46e5' : '#64748b',
                                borderBottom: activeTab === 'info' ? '3px solid #4f46e5' : '3px solid transparent',
                                marginBottom: '-11px', display: 'flex', alignItems: 'center', gap: '8px',
                            }}>
                                <Info size={18} /> Info
                            </button>
                        </div>
                        
                        {/* ═════════ TAB: SQUAD ═════════ */}
                        {activeTab === 'squad' && (
                            <>
                                {/* Ground Pitch UI */}
                                <div style={{
                                    position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto 40px',
                                    aspectRatio: '3/4', background: sportName.toLowerCase().includes('foot') ? '#22c55e' : '#4ade80',
                                    borderRadius: '16px', border: '4px solid white', overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                }}>
                                    {/* Ground markings */}
                                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.5)' }}></div>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)' }}></div>
                                    {/* Pitch for cricket */}
                                    {!sportName.toLowerCase().includes('foot') && (
                                        <div style={{ position: 'absolute', top: '30%', bottom: '30%', left: '40%', right: '40%', background: '#d1cebd', borderRadius: '4px' }}></div>
                                    )}
                                    {/* Players */}
                                    <div style={{ position: 'absolute', inset: '10%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'space-around', gap: '20px' }}>
                                        {roster.slice(0, 11).map((p: any, i: number) => {
                                            const name = p.player?.user?.firstName ? `${p.player.user.firstName} ${p.player.user.lastName}` : (p.name || 'Unknown');
                                            const shortName = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2);
                                            return (
                                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', border: `2px solid ${sportColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: sportColor, boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                                                        {shortName}
                                                    </div>
                                                    <div style={{ background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                        {name.split(' ')[0]}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Search */}
                                <div style={{ position: 'relative', width: '100%', maxWidth: '400px', marginBottom: '24px' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="text"
                                        placeholder="Search teammates…"
                                        value={playerSearch}
                                        onChange={(e) => setPlayerSearch(e.target.value)}
                                        style={{
                                            width: '100%', padding: '12px 44px 12px 46px', borderRadius: '12px',
                                            border: '1.5px solid #e2e8f0', background: 'white',
                                            fontSize: '14px', fontWeight: 600, color: '#0f172a', outline: 'none',
                                        }}
                                    />
                                </div>
                                
                                {filteredRoster.length === 0 ? (
                                    <div style={{ padding: '40px', background: 'white', borderRadius: '16px', textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                                        No players found.
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                        {filteredRoster.map((p: any) => {
                                            const u = p.player?.user || p.user || {};
                                            const name = u.firstName ? `${u.firstName} ${u.lastName}` : (p.name || 'Unknown Player');
                                            const initials = u.firstName ? `${u.firstName[0]}${u.lastName?.[0] || ''}` : '?';
                                            const roleStr = p.role || 'Player';
                                            const badge = getRoleBadge(roleStr);
                                            const isMe = u.id === user?.id;
                                            
                                            return (
                                                <div key={p.playerId || p.id} style={{
                                                    padding: '20px', borderRadius: '16px', background: 'white',
                                                    border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{
                                                            width: '56px', height: '56px', borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#475569', fontWeight: 800, fontSize: '20px',
                                                            border: isMe ? '2px solid #4f46e5' : 'none'
                                                        }}>
                                                            {initials}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 800, fontSize: '16px', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {name} {isMe && <span style={{ fontSize: '10px', background: '#4f46e5', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>YOU</span>}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                                                <span style={{ 
                                                                    fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', 
                                                                    background: badge.bg, color: badge.color, display: 'flex', alignItems: 'center', gap: '4px' 
                                                                }}>
                                                                    {badge.icon} {badge.text}
                                                                </span>
                                                                {p.jersey && <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>#{p.jersey}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Management Actions */}
                                                    {canManagePlayers && !isMe && (
                                                        <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                                                            <div style={{ position: 'relative', flex: 1 }}>
                                                                <button onClick={() => setEditingRoleFor(editingRoleFor === p.playerId ? null : p.playerId)} style={{
                                                                    width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', 
                                                                    borderRadius: '8px', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                                }}>
                                                                    Change Role <ChevronDown size={14} />
                                                                </button>
                                                                {editingRoleFor === p.playerId && (
                                                                    <div style={{
                                                                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white',
                                                                        border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                                                        zIndex: 10, padding: '4px', display: 'flex', flexDirection: 'column', maxHeight: '200px', overflowY: 'auto'
                                                                    }}>
                                                                        {ROLE_OPTIONS.map(r => (
                                                                            <button key={r} onClick={() => handleRoleUpdate(p.playerId, r)} disabled={actionLoading} style={{
                                                                                padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left',
                                                                                fontSize: '13px', fontWeight: 500, color: '#1e293b', cursor: 'pointer', borderRadius: '4px'
                                                                            }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                                                                                {r}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button onClick={() => setReleasingPlayerId(p.playerId)} style={{
                                                                padding: '8px 16px', background: '#fef2f2', border: '1px solid #fecaca', 
                                                                borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', gap: '4px'
                                                            }}>
                                                                <LogOut size={14} /> Release
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ═════════ TAB: ROLES ═════════ */}
                        {activeTab === 'roles' && (
                            <div style={{ display: 'grid', gap: '24px' }}>
                                {Object.keys(roleGroups).sort().map(role => (
                                    <div key={role} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <span style={{ 
                                                fontSize: '14px', fontWeight: 700, padding: '6px 12px', borderRadius: '8px', 
                                                background: getRoleBadge(role).bg, color: getRoleBadge(role).color 
                                            }}>
                                                {getRoleBadge(role).icon} {role}
                                            </span>
                                            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>({roleGroups[role].length})</span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                            {roleGroups[role].map((p: any) => {
                                                const u = p.player?.user || {};
                                                const name = u.firstName ? `${u.firstName} ${u.lastName}` : (p.name || 'Unknown');
                                                return (
                                                    <div key={p.playerId} style={{
                                                        padding: '8px 16px', background: '#f8fafc', borderRadius: '20px', 
                                                        border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#1e293b'
                                                    }}>
                                                        {name}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ═════════ TAB: DREAM11 ═════════ */}
                        {activeTab === 'dream11' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
                                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>Create Dream XI</h3>
                                            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Select 11 players for your starting lineup.</p>
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: 900, color: dream11Squad.length === 11 ? '#16a34a' : '#4f46e5' }}>
                                            {dream11Squad.length} / 11
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {roster.map((p: any) => {
                                            const u = p.player?.user || {};
                                            const name = u.firstName ? `${u.firstName} ${u.lastName}` : (p.name || 'Unknown');
                                            const isSelected = dream11Squad.some(s => s.playerId === p.playerId);
                                            
                                            return (
                                                <div key={p.playerId} onClick={() => toggleDream11Player(p)} style={{
                                                    padding: '12px 16px', borderRadius: '12px', border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                                    background: isSelected ? '#eef2ff' : 'white', display: 'flex', justifyContent: 'space-between',
                                                    alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            width: '24px', height: '24px', borderRadius: '50%', border: isSelected ? 'none' : '1px solid #cbd5e1',
                                                            background: isSelected ? '#4f46e5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {isSelected && <Check size={14} color="white" />}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{name}</div>
                                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{p.role || 'Player'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ background: '#1e1b4b', borderRadius: '16px', padding: '20px', color: 'white' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Your Dream XI</h3>
                                        
                                        {dream11Squad.length === 0 ? (
                                            <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No players selected.</div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                                                {dream11Squad.map((p, idx) => {
                                                    const u = p.player?.user || {};
                                                    const name = u.firstName ? `${u.firstName} ${u.lastName}` : (p.name || 'Unknown');
                                                    const isCap = dreamCaptain === p.playerId;
                                                    const isVc = dreamViceCaptain === p.playerId;
                                                    
                                                    return (
                                                        <div key={p.playerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                                                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{idx + 1}. {name}</div>
                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                <button onClick={(e) => { e.stopPropagation(); setDreamCaptain(isCap ? null : p.playerId); if(dreamViceCaptain===p.playerId) setDreamViceCaptain(null); }} style={{
                                                                    width: '24px', height: '24px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                                                    background: isCap ? '#f59e0b' : 'rgba(255,255,255,0.1)', color: isCap ? 'white' : '#94a3b8',
                                                                    fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                }}>C</button>
                                                                <button onClick={(e) => { e.stopPropagation(); setDreamViceCaptain(isVc ? null : p.playerId); if(dreamCaptain===p.playerId) setDreamCaptain(null); }} style={{
                                                                    width: '24px', height: '24px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                                                    background: isVc ? '#94a3b8' : 'rgba(255,255,255,0.1)', color: isVc ? 'white' : '#94a3b8',
                                                                    fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                }}>VC</button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        
                                        <button onClick={saveDream11} style={{
                                            width: '100%', padding: '14px', background: '#4f46e5', color: 'white', border: 'none',
                                            borderRadius: '12px', fontWeight: 800, fontSize: '14px', marginTop: '16px', cursor: 'pointer',
                                            opacity: dream11Squad.length === 11 ? 1 : 0.5
                                        }}>
                                            Save Dream XI
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═════════ TAB: INFO ═════════ */}
                        {activeTab === 'info' && (
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', maxWidth: '600px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e1b4b', marginBottom: '24px' }}>Team Information</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Team Name</div>
                                        <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700 }}>{activeTeam.name}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Team Code</div>
                                        <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px' }}>{activeTeam.teamCode}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Sport</div>
                                        <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700 }}>{activeTeam.sport?.name}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Manager</div>
                                        <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700 }}>
                                            {activeTeam.manager?.firstName ? `${activeTeam.manager.firstName} ${activeTeam.manager.lastName}` : 'Unknown'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', paddingBottom: '16px' }}>
                                        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Location</div>
                                        <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700 }}>{activeTeam.city || 'Not specified'} {activeTeam.state ? `, ${activeTeam.state}` : ''}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Release Player Modal */}
            {releasingPlayerId && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <LogOut size={32} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '12px' }}>Release Player?</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px', lineHeight: 1.5 }}>
                            Are you sure you want to remove this player from the team roster? They will lose access to team features.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setReleasingPlayerId(null)} disabled={actionLoading} style={{
                                flex: 1, padding: '12px', background: '#f8fafc', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer'
                            }}>Cancel</button>
                            <button onClick={handleReleasePlayer} disabled={actionLoading} style={{
                                flex: 1, padding: '12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer'
                            }}>{actionLoading ? 'Releasing...' : 'Release Player'}</button>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx global>{`
                .card-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.2s; }
            `}</style>
        </div>
    );
}

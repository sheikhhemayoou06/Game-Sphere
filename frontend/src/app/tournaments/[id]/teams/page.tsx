'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { sportIcons, defaultSportConfig, sportConfig, statusColors } from '@/lib/utils';

export default function TournamentTeams() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [tournament, setTournament] = useState<any>(null);
    const [teams, setTeams] = useState<any[]>([]);
    const [bans, setBans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [banModalOpen, setBanModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [banReason, setBanReason] = useState('');
    const [banDurationDays, setBanDurationDays] = useState('7');

    const isOrganizer = user?.id === tournament?.organizerId;
    const config = tournament?.sport?.name ? (sportConfig[tournament.sport.name] || defaultSportConfig) : defaultSportConfig;
    const sportEmoji = tournament?.sport?.icon || sportIcons[tournament?.sport?.name] || config.emoji;

    useEffect(() => {
        if (!id) return;
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [t, ts, bs] = await Promise.all([
                api.getTournament(id as string),
                api.getTournamentTeams(id as string),
                api.getTournamentBans(id as string)
            ]);
            setTournament(t);
            setTeams(ts);
            setBans(bs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBanPlayerClick = (player: any) => {
        setSelectedPlayer(player);
        setBanReason('');
        setBanDurationDays('7');
        setBanModalOpen(true);
    };

    const handleBanSubmit = async () => {
        if (!selectedPlayer) return;
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + parseInt(banDurationDays, 10));

            await api.banPlayer(id as string, {
                playerId: selectedPlayer.id,
                reason: banReason,
                expiresAt: expiresAt.toISOString(),
            });
            setBanModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to ban player');
        }
    };

    const handleUnban = async (playerId: string) => {
        try {
            await api.unbanPlayer(id as string, playerId);
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to unban player');
        }
    };

    const isPlayerBanned = (playerId: string) => {
        return bans.some(b => b.playerId === playerId);
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 2s infinite' }}>👥</div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading teams...</div>
            </div>
        </div>
    );

    if (!tournament) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <div style={{ textAlign: 'center', color: '#e2e8f0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
                <h2>Tournament not found</h2>
                <Link href="/tournaments" style={{ color: '#6366f1', marginTop: '12px', display: 'inline-block' }}>← Back to tournaments</Link>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #0f172a 100%)' }}>
            {/* Header */}
            <nav style={{ padding: '14px 32px', background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(16px)' }}>
                <Link href={`/tournaments/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#e2e8f0', fontSize: '14px' }}>
                    ← Back to Dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{sportEmoji}</span>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>{tournament.name}</span>
                    <span className="status-badge" style={{ background: `${statusColors[tournament.status] || '#6366f1'}20`, color: statusColors[tournament.status] || '#6366f1', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                        {tournament.status}
                    </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Teams & Players</div>
            </nav>

            <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>Registered Teams</h1>
                        <p style={{ color: '#94a3b8', fontSize: '15px' }}>View squads, players, and manage participant access</p>
                    </div>
                    {isOrganizer && bans.length > 0 && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '12px', color: '#fca5a5', fontSize: '14px', fontWeight: 600 }}>
                            {bans.length} Active Bans
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {teams.map((tournamentTeam) => {
                        const team = tournamentTeam.team;
                        return (
                            <div key={team.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{team.name}</h3>
                                            <span style={{ padding: '4px 10px', borderRadius: '12px', background: statusColors[tournamentTeam.status] ? `${statusColors[tournamentTeam.status]}20` : '#64748b20', color: statusColors[tournamentTeam.status] || '#cbd5e1', fontSize: '11px', fontWeight: 700 }}>
                                                {tournamentTeam.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                                            Manager: {team.manager?.firstName} {team.manager?.lastName} ({team.manager?.email})
                                        </div>
                                    </div>
                                    <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>
                                        {team.players.length} Players
                                    </div>
                                </div>
                                <div style={{ padding: '20px 24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        {team.players.map((teamPlayer: any) => {
                                            const p = teamPlayer.player;
                                            const banned = isPlayerBanned(p.id);
                                            return (
                                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: banned ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)', border: banned ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc', fontWeight: 700, fontSize: '14px' }}>
                                                            {p.user?.firstName?.[0] || '?'}
                                                        </div>
                                                        <div>
                                                            <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                {p.user?.firstName} {p.user?.lastName}
                                                                {banned && <span style={{ padding: '2px 6px', background: '#ef4444', color: 'white', fontSize: '10px', borderRadius: '4px', fontWeight: 800 }}>BANNED</span>}
                                                            </div>
                                                            <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                                                                {teamPlayer.role || 'Player'} {teamPlayer.jersey ? ` • #${teamPlayer.jersey}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isOrganizer && (
                                                        <div>
                                                            {banned ? (
                                                                <button onClick={() => handleUnban(p.id)} style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                                    Unban
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => handleBanPlayerClick(p)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                                                                    Restrict
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                        {team.players.length === 0 && (
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '16px 0' }}>
                                                No players have joined this team yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {teams.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '64px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏟️</div>
                            <h3 style={{ color: '#f8fafc', fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>No Teams Registered</h3>
                            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>There are no teams registered for this tournament yet.</p>
                        </div>
                    )}
                </div>

                {/* Bans List */}
                {isOrganizer && bans.length > 0 && (
                    <div style={{ marginTop: '48px', background: 'rgba(69, 10, 10, 0.2)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fca5a5', margin: 0 }}>Active Player Restrictions</h3>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#ef4444', fontSize: '12px', textTransform: 'uppercase' }}>
                                        <th style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>Player</th>
                                        <th style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>Reason</th>
                                        <th style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>Expires</th>
                                        <th style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bans.map((ban) => (
                                        <tr key={ban.id}>
                                            <td style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f8fafc', fontWeight: 600 }}>
                                                {ban.player?.user?.firstName} {ban.player?.user?.lastName}
                                            </td>
                                            <td style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '14px' }}>
                                                {ban.reason || 'No reason provided'}
                                            </td>
                                            <td style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '14px' }}>
                                                {ban.expiresAt ? new Date(ban.expiresAt).toLocaleDateString() : 'Permanent'}
                                            </td>
                                            <td style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <button onClick={() => handleUnban(ban.playerId)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                    Remove Ban
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Ban Modal */}
            {banModalOpen && selectedPlayer && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ width: '400px', background: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px', fontWeight: 800 }}>Restrict Player</h3>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '20px' }}>
                                You are about to restrict <strong>{selectedPlayer.user?.firstName} {selectedPlayer.user?.lastName}</strong>. They will be marked as banned in this tournament.
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Duration</label>
                                <select value={banDurationDays} onChange={(e) => setBanDurationDays(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px', outline: 'none' }}>
                                    <option value="1">1 Day</option>
                                    <option value="7">1 Week</option>
                                    <option value="30">1 Month</option>
                                    <option value="365">1 Year</option>
                                    <option value="36500">Permanent</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Reason (Optional)</label>
                                <input value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="e.g. Code of conduct violation" style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px', outline: 'none' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setBanModalOpen(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleBanSubmit} style={{ padding: '10px 16px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Ban Player</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

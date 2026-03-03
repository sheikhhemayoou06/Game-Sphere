'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons, sportConfig, defaultSportConfig, statusColors, formatDate } from '@/lib/utils';
import AuctionDashboard from '@/components/AuctionDashboard';

type Tab = 'overview' | 'teams' | 'fixtures' | 'scoring' | 'auction' | 'transfers' | 'financials' | 'leaderboard' | 'media' | 'chat' | 'settings';

export default function TournamentDashboard() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const [tournament, setTournament] = useState<any>(null);
    const urlTab = searchParams.get('tab') as Tab | null;
    const [tab, setTab] = useState<Tab>(urlTab || 'overview');
    const [loading, setLoading] = useState(true);

    // Tab data
    const [teams, setTeams] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [financials, setFinancials] = useState<any>(null);
    const [auction, setAuction] = useState<any>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [media, setMedia] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');

    // Media Upload State
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaForm, setMediaForm] = useState({ title: '', type: 'PHOTO', url: '', description: '' });

    const isOrganizer = user?.id === tournament?.organizerId;
    const config = tournament?.sport?.name ? (sportConfig[tournament.sport.name] || defaultSportConfig) : defaultSportConfig;
    const sportEmoji = tournament?.sport?.icon || sportIcons[tournament?.sport?.name] || config.emoji;

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        Promise.all([
            api.getTournament(id as string),
            api.getTournamentStats(id as string),
        ]).then(([t, s]) => {
            setTournament(t);
            setStats(s);
        }).finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!id) return;
        if (tab === 'teams') api.getTournamentTeams(id as string).then(setTeams);
        if (tab === 'leaderboard') api.getLeaderboard(id as string).then(setLeaderboard);
        if (tab === 'financials') api.getTournamentFinancials(id as string).then(setFinancials);
        if (tab === 'auction') api.getTournamentAuction(id as string).then(setAuction);
        if (tab === 'chat') api.getTournamentChat(id as string).then(setChatMessages);
        if (tab === 'media') api.getTournamentMedia(id as string).then(setMedia);
    }, [id, tab]);

    const sendChat = async () => {
        if (!chatInput.trim() || !id) return;
        await api.sendChatMessage(id as string, chatInput);
        setChatInput('');
        api.getTournamentChat(id as string).then(setChatMessages);
    };

    const updateSetting = async (field: string, value: any) => {
        try {
            const updated = await api.updateTournament(id as string, { [field]: value });
            setTournament(updated);
        } catch (err) {
            alert('Failed to update setting');
        }
    };

    const handleMediaUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mediaForm.title || !mediaForm.url) return;
        try {
            await api.addTournamentMedia(id as string, mediaForm);
            setShowMediaModal(false);
            setMediaForm({ title: '', type: 'PHOTO', url: '', description: '' });
            api.getTournamentMedia(id as string).then(setMedia);
        } catch (err) {
            alert('Failed to upload media');
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 2s infinite' }}>🏆</div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading tournament...</div>
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

    // Determine current tab label for header
    const currentTabLabel = tab.charAt(0).toUpperCase() + tab.slice(1);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #0f172a 100%)' }}>
            {/* Header */}
            <nav style={{ padding: '14px 32px', background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(16px)' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#e2e8f0', fontSize: '14px' }}>
                    ← Dashboard Home
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{sportEmoji}</span>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>{tournament.name} <span style={{ color: '#64748b' }}>/</span> <span style={{ color: '#a5b4fc' }}>{currentTabLabel}</span></span>
                    <span className="status-badge" style={{ background: `${statusColors[tournament.status] || '#6366f1'}20`, color: statusColors[tournament.status] || '#6366f1', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                        {tournament.status}
                    </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{tournament.sport?.name} • {tournament.format}</div>
            </nav>

            {/* Content */}
            <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto' }}>

                {/* ─── Active Context & Quick Actions ─── */}
                <div className="flex-wrap-mobile" style={{ padding: '16px', borderRadius: '12px', background: `#7c3aed10`, border: `1px solid #7c3aed30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '24px' }}>🔒</div>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Context Lock</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#e2e8f0' }}>{tournament.name}</div>
                        </div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {tournament.sport?.name} • {tournament.format}
                    </span>
                </div>

                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { id: 'overview', label: 'Overview', desc: 'Stats & Activity', icon: '🏆', gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
                        { id: 'teams', label: 'Teams', desc: 'Registrations & Squads', icon: '📝', gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
                        { id: 'fixtures', label: 'Fixtures', desc: 'Schedule & Results', icon: '📅', gradient: 'linear-gradient(135deg, #991b1b, #dc2626)' },
                        { id: 'scoring', label: 'Live Scoring', desc: 'Score Matches', icon: '🔴', gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
                        { id: 'auction', label: 'Auction', desc: 'Live Bidding', icon: '🔨', gradient: 'linear-gradient(135deg, #166534, #22c55e)' },
                        { id: 'transfers', label: 'Transfers', desc: 'Player Movement', icon: '🔄', gradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)' },
                        { id: 'financials', label: 'Financials', desc: 'Fees & Payouts', icon: '💰', gradient: 'linear-gradient(135deg, #854d0e, #ca8a04)' },
                        { id: 'leaderboard', label: 'Leaderboard', desc: 'Points & Rankings', icon: '🥇', gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
                        { id: 'chat', label: 'Chat', desc: 'Team & Admin Comm', icon: '💬', gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
                        { id: 'media', label: 'Media', desc: 'Photos & Videos', icon: '📸', gradient: 'linear-gradient(135deg, #9d174d, #ec4899)' },
                        { id: 'settings', label: 'Settings', desc: 'Configure Tournament', icon: '⚙️', gradient: 'linear-gradient(135deg, #1e293b, #334155)' },
                    ].map((item: any) => (
                        <button key={item.id} onClick={() => setTab(item.id)} className="card-hover" style={{
                            display: 'block', padding: '24px', borderRadius: '16px', background: item.gradient,
                            border: tab === item.id ? '2px solid white' : '2px solid transparent',
                            textAlign: 'left', color: 'white', position: 'relative', overflow: 'hidden', cursor: 'pointer'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontSize: '12px', opacity: 0.85 }}>{item.desc}</div>
                        </button>
                    ))}
                </div>

                {/* ═══════ OVERVIEW ═══════ */}
                {tab === 'overview' && (
                    <div>
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            {[
                                { label: 'Teams', value: stats?.totalTeams || 0, icon: '👥', color: '#6366f1' },
                                { label: 'Approved', value: stats?.approvedTeams || 0, icon: '✅', color: '#22c55e' },
                                { label: 'Matches', value: stats?.totalMatches || 0, icon: '📅', color: '#f59e0b' },
                                { label: 'Live', value: stats?.liveMatches || 0, icon: '🔴', color: '#ef4444' },
                            ].map(card => (
                                <div key={card.label} style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{card.icon}</div>
                                    <div style={{ fontSize: '32px', fontWeight: 900, color: card.color }}>{card.value}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{card.label}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px' }}>
                            <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ color: '#e2e8f0', fontWeight: 800, marginBottom: '16px' }}>📋 Tournament Info</h3>
                                {[
                                    ['Sport', `${sportEmoji} ${tournament.sport?.name}`],
                                    ['Format', tournament.format],
                                    ['Level', tournament.level],
                                    ['Max Teams', tournament.maxTeams],
                                    ['Squad Size', tournament.squadSize || 15],
                                    ['Registration Fee', `₹${tournament.registrationFee}`],
                                    ['Prize Pool', `₹${tournament.prizePool || 0}`],
                                    ['Venue', tournament.venue || 'TBD'],
                                ].map(([label, val]) => (
                                    <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</span>
                                        <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════ TEAMS ═══════ */}
                {tab === 'teams' && (
                    <div>
                        <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '22px', marginBottom: '20px' }}>👥 Teams & Registrations</h2>

                        {/* Summary Dashboard */}
                        {isOrganizer && (
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                    <div style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 600, marginBottom: '4px' }}>TOTAL APPLICATIONS</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#e2e8f0' }}>{teams.length}</div>
                                </div>
                                <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                                    <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600, marginBottom: '4px' }}>APPROVED</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#e2e8f0' }}>{teams.filter(t => t.status === 'APPROVED').length}</div>
                                </div>
                                <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                    <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, marginBottom: '4px' }}>PENDING</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#e2e8f0' }}>{teams.filter(t => t.status === 'PENDING').length}</div>
                                </div>
                                <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                    <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginBottom: '4px' }}>REJECTED</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#e2e8f0' }}>{teams.filter(t => t.status === 'REJECTED').length}</div>
                                </div>
                            </div>
                        )}

                        {teams.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                No teams registered yet.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {teams.map((tt: any) => (
                                    <div key={tt.id} style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                                {tt.team?.logo || '🏟️'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '15px' }}>{tt.team?.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    Manager: {tt.team?.manager?.firstName} {tt.team?.manager?.lastName} • {tt.team?.players?.length || 0} players
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 700,
                                                background: tt.status === 'APPROVED' ? '#22c55e20' : tt.status === 'REJECTED' || tt.status === 'WITHDRAWN' ? '#ef444420' : '#f59e0b20',
                                                color: tt.status === 'APPROVED' ? '#22c55e' : tt.status === 'REJECTED' || tt.status === 'WITHDRAWN' ? '#ef4444' : '#f59e0b',
                                            }}>
                                                {tt.status}
                                            </span>
                                            {isOrganizer && tt.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => api.approveTeam(id as string, tt.teamId).then(() => api.getTournamentTeams(id as string).then(setTeams))}
                                                        style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#22c55e', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                                        ✓ Approve
                                                    </button>
                                                    <button onClick={() => api.rejectTeam(id as string, tt.teamId).then(() => api.getTournamentTeams(id as string).then(setTeams))}
                                                        style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                                        ✗ Reject Registration
                                                    </button>
                                                </>
                                            )}
                                            {isOrganizer && tt.status === 'APPROVED' && (
                                                <button onClick={() => {
                                                    if (confirm('Are you sure you want to cancel this team\'s registration?')) {
                                                        api.withdrawTeam(id as string, tt.teamId).then(() => api.getTournamentTeams(id as string).then(setTeams))
                                                    }
                                                }}
                                                    style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                                    Cancel Registration
                                                </button>
                                            )}
                                            {user?.id === tt.team?.managerId && (tt.status === 'PENDING' || tt.status === 'APPROVED') && (
                                                <button onClick={() => {
                                                    if (confirm('Are you sure you want to withdraw your team from this tournament?')) {
                                                        api.withdrawTeam(id as string, tt.teamId).then(() => api.getTournamentTeams(id as string).then(setTeams))
                                                    }
                                                }}
                                                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                                    Withdraw
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ FIXTURES ═══════ */}
                {tab === 'fixtures' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '22px' }}>📅 Fixtures</h2>
                            {isOrganizer && (!tournament.matches || tournament.matches.length === 0) && (
                                <button onClick={() => api.generateFixtures(tournament.id).then(t => { setTournament(t); })}
                                    style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                                    ⚡ Generate Fixtures
                                </button>
                            )}
                        </div>
                        {(!tournament.matches || tournament.matches.length === 0) ? (
                            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                No fixtures generated yet. Approve teams first, then generate fixtures.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {tournament.matches.map((m: any) => (
                                    <div key={m.id} style={{ padding: '18px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, width: '60px' }}>{m.round}</span>
                                            <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '14px' }}>{m.homeTeam?.name || 'TBD'}</span>
                                            <span style={{ color: '#64748b', fontSize: '12px' }}>vs</span>
                                            <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '14px' }}>{m.awayTeam?.name || 'TBD'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {m.venue && <span style={{ color: '#64748b', fontSize: '11px' }}>📍 {m.venue}</span>}
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                                                background: m.status === 'COMPLETED' ? '#22c55e15' : m.status === 'LIVE' ? '#ef444415' : '#6366f115',
                                                color: m.status === 'COMPLETED' ? '#22c55e' : m.status === 'LIVE' ? '#ef4444' : '#6366f1',
                                            }}>
                                                {m.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ SCORING ═══════ */}
                {tab === 'scoring' && (
                    <div>
                        <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '22px', marginBottom: '20px' }}>🔴 Live Scoring</h2>
                        <div style={{ textAlign: 'center', padding: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{config.emoji}</div>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Select a match from Fixtures tab to start live scoring.</p>
                            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>Scoring uses {config.stat} as the primary stat for {tournament.sport?.name}</p>
                            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {config.events?.map((ev: any) => (
                                    <span key={ev.type} style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontSize: '12px', fontWeight: 600 }}>
                                        {ev.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════ AUCTION ═══════ */}
                {tab === 'auction' && (
                    <AuctionDashboard tournamentId={id as string} isOrganizer={isOrganizer} />
                )}

                {/* ═══════ TRANSFERS ═══════ */}
                {tab === 'transfers' && (
                    <div>
                        <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '22px', marginBottom: '20px' }}>🔄 Transfer Window</h2>
                        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔄</div>
                            <p style={{ fontSize: '14px' }}>Transfer requests for this tournament will appear here.</p>
                            <p style={{ fontSize: '12px', marginTop: '6px' }}>Team managers can request trades and swaps. All transfers require organiser approval.</p>
                        </div>
                    </div>
                )}

                {/* ═══════ FINANCIALS ═══════ */}
                {tab === 'financials' && financials && (
                    <div>
                        <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '22px', marginBottom: '20px' }}>💰 Financial Dashboard</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                                <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, marginBottom: '6px' }}>TOTAL COLLECTED</div>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: '#22c55e' }}>₹{financials.totalCollected?.toLocaleString()}</div>
                            </div>
                            <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginBottom: '6px' }}>PENDING</div>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: '#f59e0b' }}>{financials.pendingPayments}</div>
                            </div>
                            <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600, marginBottom: '6px' }}>REGISTRATIONS</div>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: '#6366f1' }}>{financials.totalRegistrations}</div>
                            </div>
                        </div>
                        {financials.payments?.length > 0 && (
                            <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                            {['Amount', 'Status', 'Method', 'Date'].map(h => (
                                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {financials.payments.map((p: any) => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 600, fontSize: '13px' }}>₹{p.amount}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: p.status === 'COMPLETED' ? '#22c55e15' : '#f59e0b15', color: p.status === 'COMPLETED' ? '#22c55e' : '#f59e0b' }}>{p.status}</span>
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '12px' }}>{p.method || 'N/A'}</td>
                                                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>{formatDate(p.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ LEADERBOARD ═══════ */}
                {tab === 'leaderboard' && (
                    <div>
                        <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '22px', marginBottom: '20px' }}>🏅 Leaderboard</h2>
                        {leaderboard.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                No match results yet. Leaderboard will update as matches are completed.
                            </div>
                        ) : (
                            <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                            {['#', 'Team', 'P', 'W', 'L', 'D', 'Pts'].map(h => (
                                                <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Team' ? 'left' : 'center', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((row: any, i: number) => (
                                            <tr key={row.teamId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i < 2 ? 'rgba(99,102,241,0.04)' : 'transparent' }}>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: i === 0 ? '#f59e0b' : '#94a3b8', fontSize: '14px' }}>{i + 1}</td>
                                                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#e2e8f0', fontSize: '14px' }}>{row.teamName}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>{row.played}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e', fontWeight: 600, fontSize: '13px' }}>{row.wins}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#ef4444', fontSize: '13px' }}>{row.losses}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>{row.draws}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 900, color: '#a5b4fc', fontSize: '16px' }}>{row.points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ MEDIA ═══════ */}
                {tab === 'media' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '22px' }}>📸 Media Gallery</h2>
                            {isOrganizer && (
                                <button onClick={() => setShowMediaModal(true)} style={{
                                    padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px'
                                }}>
                                    + Upload Media
                                </button>
                            )}
                        </div>

                        {showMediaModal && (
                            <div style={{
                                padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '24px'
                            }}>
                                <h3 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '16px', marginBottom: '16px' }}>Upload New Media</h3>
                                <form onSubmit={handleMediaUpload} style={{ display: 'grid', gap: '16px' }}>
                                    <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Title *</label>
                                            <input type="text" required value={mediaForm.title} onChange={e => setMediaForm({ ...mediaForm, title: e.target.value })}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Type *</label>
                                            <select value={mediaForm.type} onChange={e => setMediaForm({ ...mediaForm, type: e.target.value })}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}>
                                                <option value="PHOTO" style={{ color: '#000' }}>Photo</option>
                                                <option value="VIDEO" style={{ color: '#000' }}>Video</option>
                                                <option value="DOCUMENT" style={{ color: '#000' }}>Document</option>
                                                <option value="LINK" style={{ color: '#000' }}>External Link</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>URL (Image/Video Link) *</label>
                                        <input type="url" required value={mediaForm.url} onChange={e => setMediaForm({ ...mediaForm, url: e.target.value })} placeholder="https://..."
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                        <button type="button" onClick={() => setShowMediaModal(false)}
                                            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                                            Cancel
                                        </button>
                                        <button type="submit"
                                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                                            Upload
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {media.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📸</div>
                                <p style={{ fontSize: '14px' }}>No media uploaded yet.</p>
                                <p style={{ fontSize: '12px', marginTop: '6px' }}>Upload match photos, highlight videos, and official announcements.</p>
                            </div>
                        ) : (
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                {media.map((m: any) => (
                                    <div key={m.id} style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        {m.type === 'PHOTO' && (
                                            <div style={{ width: '100%', height: '140px', borderRadius: '10px', background: `url(${m.url}) center/cover`, marginBottom: '12px' }}></div>
                                        )}
                                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '14px', marginBottom: '4px' }}>{m.title}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{m.type} • {formatDate(m.createdAt)}</div>
                                        {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>View →</a>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ CHAT ═══════ */}
                {tab === 'chat' && (
                    <div>
                        <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '22px', marginBottom: '20px' }}>💬 Tournament Chat</h2>
                        <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{ height: '400px', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {chatMessages.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: '13px' }}>No messages yet. Start the conversation!</div>
                                ) : chatMessages.map((msg: any) => (
                                    <div key={msg.id} style={{
                                        padding: '10px 14px', borderRadius: '12px', maxWidth: '70%',
                                        background: msg.senderId === user?.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
                                        alignSelf: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                                    }}>
                                        <div style={{ fontSize: '13px', color: '#e2e8f0' }}>{msg.message}</div>
                                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{new Date(msg.createdAt).toLocaleTimeString()}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px' }}>
                                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                                    placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', outline: 'none' }} />
                                <button onClick={sendChat} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Send</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════ SETTINGS ═══════ */}
                {tab === 'settings' && isOrganizer && (
                    <div style={{ paddingBottom: '60px' }}>
                        <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '22px', marginBottom: '20px' }}>⚙️ Tournament Settings</h2>

                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                            {/* General Info */}
                            <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '16px', marginBottom: '16px' }}>General Information</h3>
                                {[
                                    ['Name', tournament.name],
                                    ['Sport', `${sportEmoji} ${tournament.sport?.name}`],
                                    ['Format', tournament.format],
                                    ['Level', tournament.level],
                                    ['Status', tournament.status],
                                    ['Venue', tournament.venue || 'Not set'],
                                    ['Start Date', tournament.startDate ? formatDate(tournament.startDate) : 'Not set'],
                                ].map(([label, val]) => (
                                    <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>{label}</span>
                                        <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700 }}>{val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Registration Controls */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ color: '#a5b4fc', fontWeight: 800, fontSize: '16px' }}>Registration Status</h3>
                                        <button onClick={() => updateSetting('isRegistrationOpen', !tournament.isRegistrationOpen)} style={{
                                            padding: '6px 12px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                                            background: tournament.isRegistrationOpen ? '#ef4444' : '#22c55e', color: '#fff'
                                        }}>
                                            {tournament.isRegistrationOpen ? 'Close Registration' : 'Open Registration'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: tournament.isRegistrationOpen ? '#22c55e' : '#ef4444', boxShadow: `0 0 10px ${tournament.isRegistrationOpen ? '#22c55e' : '#ef4444'}` }}></div>
                                        <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>Currently {tournament.isRegistrationOpen ? 'OPEN' : 'CLOSED'}</span>
                                    </div>
                                </div>

                                <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <h3 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '16px', marginBottom: '16px' }}>Registration Settings</h3>
                                    <div key={tournament.id} style={{ display: 'grid', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Max Teams</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input type="number" defaultValue={tournament.maxTeams} id="setMaxTeams"
                                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                                                <button onClick={() => updateSetting('maxTeams', Number((document.getElementById('setMaxTeams') as HTMLInputElement).value))}
                                                    style={{ padding: '0 16px', borderRadius: '8px', border: 'none', background: '#334155', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Registration Fee (₹)</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input type="number" defaultValue={tournament.registrationFee} id="setRegFee"
                                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                                                <button onClick={() => updateSetting('registrationFee', Number((document.getElementById('setRegFee') as HTMLInputElement).value))}
                                                    style={{ padding: '0 16px', borderRadius: '8px', border: 'none', background: '#334155', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Approval Mode</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <select defaultValue={tournament.approvalMode || 'MANUAL'} id="setAppMode"
                                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}>
                                                    <option value="MANUAL" style={{ color: '#000' }}>Manual Approval</option>
                                                    <option value="AUTOMATIC" style={{ color: '#000' }}>Automatic Approval</option>
                                                </select>
                                                <button onClick={() => updateSetting('approvalMode', (document.getElementById('setAppMode') as HTMLSelectElement).value)}
                                                    style={{ padding: '0 16px', borderRadius: '8px', border: 'none', background: '#334155', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

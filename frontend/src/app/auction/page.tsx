'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons, sportConfig, defaultSportConfig } from '@/lib/utils';

export default function AuctionPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const activeConfig = selectedSport ? (sportConfig[selectedSport.name] || defaultSportConfig) : defaultSportConfig;

    // State
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<any>(null);
    const [auction, setAuction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [tab, setTab] = useState<'live' | 'players' | 'purse' | 'sold'>('live');
    const [bidAmount, setBidAmount] = useState(0);
    const [selectedTeamForSell, setSelectedTeamForSell] = useState('');
    const [sellPrice, setSellPrice] = useState(0);
    const [teamBudget, setTeamBudget] = useState(5000000);
    const [addPlayerSearch, setAddPlayerSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [basePrice, setBasePrice] = useState(50000);
    const [scheduleDate, setScheduleDate] = useState('');

    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

    // Load tournaments that have auctions or are organizable
    useEffect(() => {
        const params: Record<string, string> = {};
        if (selectedSport) params.sportId = selectedSport.id;
        api.getTournaments(params).then((t) => {
            setTournaments(t);
            // Auto-select first tournament
            if (t.length > 0 && !selectedTournament) {
                handleSelectTournament(t[0]);
            }
        }).catch(() => { }).finally(() => setLoading(false));
    }, [selectedSport]);

    // Load auction data for selected tournament
    const loadAuction = useCallback(async (tournamentId: string) => {
        try {
            const data = await api.getTournamentAuction(tournamentId);
            setAuction(data);
            return data;
        } catch {
            setAuction(null);
            return null;
        }
    }, []);

    const handleSelectTournament = async (tournament: any) => {
        setSelectedTournament(tournament);
        // Check organizer: try store user first, fallback to localStorage
        let currentUserId = user?.id;
        if (!currentUserId) {
            try {
                const stored = localStorage.getItem('user');
                if (stored) currentUserId = JSON.parse(stored).id;
            } catch { }
        }
        setIsOrganizer(!!currentUserId && currentUserId === tournament.organizerId);
        await loadAuction(tournament.id);
    };

    // Auto-poll for live updates (every 3 seconds for viewers)
    useEffect(() => {
        if (!selectedTournament) return;
        const interval = setInterval(() => {
            loadAuction(selectedTournament.id);
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedTournament, loadAuction]);

    // Organizer actions
    const handleCreateAuction = async () => {
        if (!selectedTournament) return;
        try {
            await api.createAuction(selectedTournament.id, teamBudget);
            await loadAuction(selectedTournament.id);
        } catch (e: any) { alert(e.message); }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!auction) return;
        try {
            await api.updateAuctionStatus(auction.id, status);
            await loadAuction(selectedTournament.id);
        } catch (e: any) { alert(e.message); }
    };

    const handleApprovePlayer = async (auctionPlayerId: string) => {
        try {
            await api.approvePlayer(auctionPlayerId);
            await loadAuction(selectedTournament.id);
        } catch (e: any) { alert(e.message); }
    };

    const handleStartBidding = async (auctionPlayerId: string) => {
        try {
            await api.startBidding(auctionPlayerId);
            await loadAuction(selectedTournament.id);
        } catch (e: any) { alert(e.message); }
    };

    const handleSellPlayer = async (auctionPlayerId: string) => {
        if (!selectedTeamForSell || !sellPrice) { alert('Select a team and enter price'); return; }
        try {
            await api.sellPlayer(auctionPlayerId, selectedTeamForSell, sellPrice);
            await loadAuction(selectedTournament.id);
            setSelectedTeamForSell('');
            setSellPrice(0);
        } catch (e: any) { alert(e.message); }
    };

    const handleMarkUnsold = async (auctionPlayerId: string) => {
        try {
            await api.markUnsold(auctionPlayerId);
            await loadAuction(selectedTournament.id);
        } catch (e: any) { alert(e.message); }
    };

    const handlePlaceBid = async (auctionPlayerId: string, teamId: string, amount: number) => {
        try {
            await api.placeBid(auctionPlayerId, teamId, amount);
            await loadAuction(selectedTournament.id);
        } catch (e: any) { alert(e.message); }
    };

    const handleAddPlayer = async (playerId: string) => {
        if (!auction) return;
        try {
            await api.addAuctionPlayer(auction.id, playerId, basePrice);
            await loadAuction(selectedTournament.id);
            setAddPlayerSearch('');
            setSearchResults([]);
        } catch (e: any) { alert(e.message); }
    };

    const searchPlayers = async (query: string) => {
        setAddPlayerSearch(query);
        if (query.length < 2) { setSearchResults([]); return; }
        try {
            const results = await api.globalSearch(query, selectedSport?.id);
            setSearchResults(results.players || []);
        } catch { setSearchResults([]); }
    };

    // Derived data
    const players = auction?.players || [];
    const currentBidding = players.find((p: any) => p.status === 'IN_BIDDING');
    const pendingPlayers = players.filter((p: any) => p.status === 'PENDING');
    const approvedPlayers = players.filter((p: any) => p.status === 'APPROVED');
    const soldPlayers = players.filter((p: any) => p.status === 'SOLD');
    const unsoldPlayers = players.filter((p: any) => p.status === 'UNSOLD');
    const teamPurses = auction?.teamPurses || [];

    const statusColor = (s: string) => {
        switch (s) {
            case 'PENDING': return { bg: '#fef3c7', text: '#92400e' };
            case 'APPROVED': return { bg: '#dbeafe', text: '#1e40af' };
            case 'IN_BIDDING': return { bg: '#fce7f3', text: '#9d174d' };
            case 'SOLD': return { bg: '#dcfce7', text: '#166534' };
            case 'UNSOLD': return { bg: '#fef2f2', text: '#991b1b' };
            case 'DRAFT': return { bg: '#f1f5f9', text: '#475569' };
            case 'OPEN': return { bg: '#dbeafe', text: '#1e40af' };
            case 'IN_PROGRESS': return { bg: '#fce7f3', text: '#9d174d' };
            case 'COMPLETED': return { bg: '#dcfce7', text: '#166534' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    const auctionStatusFlow = ['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED'];
    const nextStatus = auction ? auctionStatusFlow[auctionStatusFlow.indexOf(auction.status) + 1] : null;

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#f59e0b', fontSize: '18px', fontWeight: 700 }}>Loading auctions...</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>

            {/* Header */}
            <div style={{ background: '#1a1a2e', borderBottom: '1px solid #2d2d44', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/dashboard" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>← Dashboard</Link>
                    <span style={{ color: '#2d2d44' }}>|</span>
                    <span style={{ fontWeight: 800, fontSize: '18px', color: '#f59e0b' }}>🔨 {sportLabel} Auction</span>
                    {auction?.status === 'IN_PROGRESS' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} /> LIVE
                        </span>
                    )}
                </div>
                <select value={selectedTournament?.id || ''} onChange={(e) => {
                    const t = tournaments.find(x => x.id === e.target.value);
                    if (t) handleSelectTournament(t);
                }} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #2d2d44', background: '#0f0f1a', color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>
                    <option value="">Select Tournament...</option>
                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' }}>

                {/* No Tournament Selected */}
                {!selectedTournament ? (
                    <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #2d2d44' }}>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔨</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Select a Tournament</div>
                        <div style={{ color: '#64748b', fontSize: '14px' }}>Choose a tournament to view or manage its auction</div>
                    </div>
                ) : !auction ? (
                    /* No Auction Yet */
                    <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #2d2d44' }}>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>No Auction Created</div>
                        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                            {isOrganizer ? 'Create an auction for this tournament to get started' : 'The organizer has not created an auction for this tournament yet'}
                        </div>
                        {isOrganizer && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Team Budget</label>
                                    <input type="number" value={teamBudget} onChange={e => setTeamBudget(Number(e.target.value))}
                                        style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #2d2d44', background: '#0f0f1a', color: '#e2e8f0', fontSize: '14px', fontWeight: 600, width: '200px' }} />
                                </div>
                                <button onClick={handleCreateAuction} style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f0f1a', fontWeight: 800, cursor: 'pointer', fontSize: '15px', marginTop: '18px' }}>
                                    🔨 Create Auction
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Auction Status Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px 20px', borderRadius: '12px', background: '#1a1a2e', border: '1px solid #2d2d44', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Status:</span>
                                <span style={{ padding: '4px 12px', borderRadius: '6px', background: statusColor(auction.status).bg, color: statusColor(auction.status).text, fontSize: '12px', fontWeight: 700 }}>{auction.status.replace('_', ' ')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Budget:</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#4ade80' }}>{fmt(auction.teamBudget)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Players:</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>{players.length}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Sold:</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>{soldPlayers.length}</span>
                            </div>
                            {auction.scheduledAt && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>📅 Scheduled:</span>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa' }}>{new Date(auction.scheduledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                </div>
                            )}
                            {isOrganizer && nextStatus && (
                                <button onClick={() => handleUpdateStatus(nextStatus)} style={{ marginLeft: 'auto', padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f0f1a', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                                    → Move to {nextStatus.replace('_', ' ')}
                                </button>
                            )}
                            {!isOrganizer && (
                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#60a5fa' }}>
                                    📡 Live updates active
                                </div>
                            )}
                        </div>

                        {/* Schedule Auction (Organizer only) */}
                        {isOrganizer && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '16px 20px', borderRadius: '12px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#60a5fa' }}>📅 {auction.scheduledAt ? 'Reschedule' : 'Schedule'} Auction</span>
                                <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #2d2d44', background: '#0f0f1a', color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }} />
                                <button onClick={async () => {
                                    if (!scheduleDate) { alert('Please select a date and time'); return; }
                                    try {
                                        await api.scheduleAuction(auction.id, new Date(scheduleDate).toISOString());
                                        await loadAuction(selectedTournament.id);
                                        setScheduleDate('');
                                        alert('Auction scheduled! All teams & players have been notified. A reminder will be sent 12 hours before.');
                                    } catch (e: any) { alert(e.message); }
                                }} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                                    🔔 Schedule & Notify All
                                </button>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>Teams & players get notified now + 12 hours before</span>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                            {[
                                { key: 'live' as const, label: '🔴 Live Bidding', show: true },
                                { key: 'players' as const, label: `👥 Player Pool (${players.length})`, show: true },
                                { key: 'purse' as const, label: `💰 Team Purse (${teamPurses.length})`, show: true },
                                { key: 'sold' as const, label: `✅ Sold (${soldPlayers.length})`, show: true },
                            ].filter(t => t.show).map((t) => (
                                <button key={t.key} onClick={() => setTab(t.key)} style={{
                                    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                    border: tab === t.key ? '2px solid #f59e0b' : '1px solid #2d2d44',
                                    background: tab === t.key ? '#f59e0b' : '#1a1a2e',
                                    color: tab === t.key ? '#0f0f1a' : '#f59e0b',
                                }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* ═══════ LIVE BIDDING TAB ═══════ */}
                        {tab === 'live' && (
                            <div>
                                {currentBidding ? (
                                    <div style={{ padding: '28px', borderRadius: '16px', background: '#1a1a2e', border: '2px solid #f59e0b40', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                                                <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '13px' }}>LIVE BIDDING</span>
                                            </div>
                                            <span style={{ padding: '6px 14px', borderRadius: '8px', background: '#f59e0b20', border: '1px solid #f59e0b40', fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>
                                                Base: {fmt(currentBidding.basePrice)}
                                            </span>
                                        </div>

                                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            {/* Player Info */}
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                                                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                                                        {currentBidding.player?.user?.avatar || activeConfig.emoji}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '22px', color: 'white' }}>
                                                            {currentBidding.player?.user?.firstName} {currentBidding.player?.user?.lastName}
                                                        </div>
                                                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                                                            {currentBidding.player?.primarySport || sportLabel} • ID: {currentBidding.player?.sportsId}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Player Stats */}
                                                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                                    {[
                                                        { label: 'Matches', value: currentBidding.player?.totalMatches || 0 },
                                                        { label: 'Wins', value: currentBidding.player?.totalWins || 0 },
                                                        { label: 'Base Price', value: fmt(currentBidding.basePrice) },
                                                    ].map((s, i) => (
                                                        <div key={i} style={{ padding: '10px', borderRadius: '8px', background: '#0f0f1a', textAlign: 'center' as const }}>
                                                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b' }}>{s.value}</div>
                                                            <div style={{ fontSize: '10px', color: '#64748b' }}>{s.label}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Bidding Panel */}
                                            <div style={{ padding: '20px', borderRadius: '14px', background: '#0f0f1a', border: '1px solid #2d2d44' }}>
                                                {/* Current bid info */}
                                                <div style={{ textAlign: 'center' as const, marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>CURRENT BID</div>
                                                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#4ade80' }}>
                                                        {currentBidding.bids?.length > 0 ? fmt(currentBidding.bids[0].amount) : fmt(currentBidding.basePrice)}
                                                    </div>
                                                    {currentBidding.bids?.length > 0 && (
                                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                            {currentBidding.bids.length} bid(s) placed
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Organizer: Sell or Unsold controls */}
                                                {isOrganizer ? (
                                                    <div>
                                                        <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700, marginBottom: '8px' }}>SELL TO TEAM</div>
                                                        <select value={selectedTeamForSell} onChange={e => setSelectedTeamForSell(e.target.value)}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #2d2d44', background: '#1a1a2e', color: '#e2e8f0', fontSize: '13px', marginBottom: '8px' }}>
                                                            <option value="">Select team...</option>
                                                            {teamPurses.map((t: any) => (
                                                                <option key={t.teamId} value={t.teamId}>{t.teamName} (Remaining: {fmt(t.remainingPurse)})</option>
                                                            ))}
                                                        </select>
                                                        <input type="number" value={sellPrice || ''} onChange={e => setSellPrice(Number(e.target.value))}
                                                            placeholder="Sell price"
                                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #2d2d44', background: '#1a1a2e', color: '#e2e8f0', fontSize: '13px', marginBottom: '10px', boxSizing: 'border-box' }} />
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                            <button onClick={() => handleSellPlayer(currentBidding.id)} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '14px' }}>
                                                                ✅ SOLD
                                                            </button>
                                                            <button onClick={() => handleMarkUnsold(currentBidding.id)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 800, cursor: 'pointer', fontSize: '14px' }}>
                                                                ❌ UNSOLD
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Viewer sees bid history */
                                                    <div>
                                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>BID HISTORY</div>
                                                        {(currentBidding.bids || []).slice(0, 5).map((bid: any, i: number) => (
                                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #2d2d44', fontSize: '13px' }}>
                                                                <span style={{ color: i === 0 ? '#4ade80' : '#94a3b8', fontWeight: i === 0 ? 700 : 400 }}>
                                                                    {i === 0 && '👑 '} Bid #{currentBidding.bids.length - i}
                                                                </span>
                                                                <span style={{ color: 'white', fontWeight: 700 }}>{fmt(bid.amount)}</span>
                                                            </div>
                                                        ))}
                                                        {(!currentBidding.bids || currentBidding.bids.length === 0) && (
                                                            <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '12px' }}>No bids yet</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #2d2d44' }}>
                                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>⏸️</div>
                                        <div style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>No Player Currently in Bidding</div>
                                        <div style={{ color: '#64748b', fontSize: '14px' }}>
                                            {isOrganizer
                                                ? 'Go to Player Pool tab to start bidding on an approved player'
                                                : 'Waiting for the organizer to start bidding on a player...'}
                                        </div>
                                    </div>
                                )}

                                {/* Recent bid history feed */}
                                {currentBidding && currentBidding.bids?.length > 0 && (
                                    <div style={{ padding: '20px', borderRadius: '14px', background: '#1a1a2e', border: '1px solid #2d2d44', marginTop: '16px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '12px' }}>📜 ALL BIDS FOR THIS PLAYER</div>
                                        {currentBidding.bids.map((bid: any, i: number) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < currentBidding.bids.length - 1 ? '1px solid #2d2d44' : 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '13px', color: i === 0 ? '#4ade80' : '#94a3b8' }}>
                                                        Bid #{currentBidding.bids.length - i}
                                                    </span>
                                                    {i === 0 && <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#16a34a20', color: '#4ade80', fontSize: '10px', fontWeight: 700 }}>HIGHEST</span>}
                                                </div>
                                                <span style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{fmt(bid.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ═══════ PLAYER POOL TAB ═══════ */}
                        {tab === 'players' && (
                            <div>
                                {/* Add Player (Organizer only) */}
                                {isOrganizer && (
                                    <div style={{ padding: '20px', borderRadius: '14px', background: '#1a1a2e', border: '1px solid #2d2d44', marginBottom: '20px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b', marginBottom: '12px' }}>➕ Add Player to Auction</div>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                            <div style={{ flex: 1, minWidth: '200px' }}>
                                                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Search Player</label>
                                                <input type="text" value={addPlayerSearch} onChange={e => searchPlayers(e.target.value)} placeholder="Type player name..."
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #2d2d44', background: '#0f0f1a', color: '#e2e8f0', fontSize: '13px', boxSizing: 'border-box' }} />
                                            </div>
                                            <div style={{ width: '150px' }}>
                                                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Base Price</label>
                                                <input type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #2d2d44', background: '#0f0f1a', color: '#e2e8f0', fontSize: '13px', boxSizing: 'border-box' }} />
                                            </div>
                                        </div>
                                        {searchResults.length > 0 && (
                                            <div style={{ marginTop: '8px', maxHeight: '200px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #2d2d44' }}>
                                                {searchResults.map((p: any) => (
                                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #2d2d44', background: '#0f0f1a' }}>
                                                        <span style={{ fontSize: '13px', color: 'white', fontWeight: 600 }}>{p.user?.firstName} {p.user?.lastName} — {p.sportsId}</span>
                                                        <button onClick={() => handleAddPlayer(p.id)} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: '#f59e0b', color: '#0f0f1a', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>+ Add</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Player List */}
                                <div style={{ background: '#1a1a2e', borderRadius: '16px', border: '1px solid #2d2d44', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #2d2d44', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>👥 All Players ({players.length})</span>
                                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                                            <span style={{ color: '#94a3b8' }}>Pending: {pendingPlayers.length}</span>
                                            <span style={{ color: '#60a5fa' }}>Approved: {approvedPlayers.length}</span>
                                            <span style={{ color: '#4ade80' }}>Sold: {soldPlayers.length}</span>
                                            <span style={{ color: '#ef4444' }}>Unsold: {unsoldPlayers.length}</span>
                                        </div>
                                    </div>

                                    {players.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                                            {isOrganizer ? 'No players added yet. Use the search above to add players.' : 'No players in this auction yet.'}
                                        </div>
                                    ) : (
                                        <div>
                                            {players.map((p: any) => (
                                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #2d2d44', flexWrap: 'wrap', gap: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #334155, #1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                                                            {p.player?.user?.avatar || activeConfig.emoji}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>
                                                                {p.player?.user?.firstName} {p.player?.user?.lastName}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {p.player?.sportsId} • Base: {fmt(p.basePrice)}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ padding: '4px 12px', borderRadius: '6px', background: statusColor(p.status).bg, color: statusColor(p.status).text, fontSize: '11px', fontWeight: 700 }}>{p.status}</span>
                                                        {p.status === 'SOLD' && <span style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>{fmt(p.soldPrice || 0)}</span>}
                                                        {isOrganizer && p.status === 'PENDING' && (
                                                            <button onClick={() => handleApprovePlayer(p.id)} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>✓ Approve</button>
                                                        )}
                                                        {isOrganizer && p.status === 'APPROVED' && (
                                                            <button onClick={() => handleStartBidding(p.id)} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f0f1a', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>🔨 Start Bidding</button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ═══════ TEAM PURSE TAB ═══════ */}
                        {tab === 'purse' && (
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                {teamPurses.length === 0 ? (
                                    <div style={{ color: '#64748b', gridColumn: 'span 2', textAlign: 'center', padding: '40px', background: '#1a1a2e', borderRadius: '16px', border: '1px solid #2d2d44' }}>
                                        No teams registered for this tournament yet.
                                    </div>
                                ) : teamPurses.map((t: any, i: number) => {
                                    const pct = ((auction.teamBudget - t.remainingPurse) / auction.teamBudget) * 100;
                                    return (
                                        <div key={i} style={{ padding: '20px', borderRadius: '14px', background: '#1a1a2e', border: '1px solid #2d2d44' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #334155, #1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                                                        {t.logo || '🏟️'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{t.teamName}</div>
                                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{t.playersBought} players bought</div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' as const }}>
                                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80' }}>{fmt(t.remainingPurse)}</div>
                                                    <div style={{ fontSize: '10px', color: '#64748b' }}>remaining</div>
                                                </div>
                                            </div>
                                            <div style={{ height: '8px', borderRadius: '4px', background: '#0f0f1a', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: pct > 75 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e', transition: 'width 0.5s' }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                                                <span>Spent: {fmt(t.spent)}</span>
                                                <span>Total: {fmt(auction.teamBudget)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ═══════ SOLD PLAYERS TAB ═══════ */}
                        {tab === 'sold' && (
                            <div style={{ background: '#1a1a2e', borderRadius: '16px', border: '1px solid #2d2d44', overflow: 'hidden' }}>
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid #2d2d44' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>✅ Sold Players ({soldPlayers.length})</span>
                                </div>
                                {soldPlayers.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>No players sold yet.</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <div style={{ minWidth: '600px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 0.5fr', padding: '10px 20px', background: '#0f0f1a', fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' as const }}>
                                                <span>Player</span><span>Sold To</span><span>Price</span>
                                            </div>
                                            {soldPlayers.map((p: any, i: number) => {
                                                const team = teamPurses.find((t: any) => t.teamId === p.soldToTeamId);
                                                return (
                                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 0.5fr', padding: '14px 20px', borderTop: '1px solid #2d2d44', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>
                                                            {p.player?.user?.firstName} {p.player?.user?.lastName}
                                                        </span>
                                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                                            {team?.teamName || 'Unknown Team'}
                                                        </span>
                                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#4ade80' }}>
                                                            {fmt(p.soldPrice || 0)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Unsold Players */}
                                {unsoldPlayers.length > 0 && (
                                    <>
                                        <div style={{ padding: '16px 20px', borderTop: '2px solid #2d2d44', borderBottom: '1px solid #2d2d44', marginTop: '8px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>❌ Unsold ({unsoldPlayers.length})</span>
                                        </div>
                                        {unsoldPlayers.map((p: any, i: number) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #2d2d44' }}>
                                                <span style={{ fontWeight: 600, fontSize: '13px', color: '#94a3b8' }}>
                                                    {p.player?.user?.firstName} {p.player?.user?.lastName}
                                                </span>
                                                <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#fef2f2', color: '#991b1b', fontSize: '11px', fontWeight: 700 }}>UNSOLD</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Viewer info banner */}
                        {!isOrganizer && (
                            <div style={{ marginTop: '20px', padding: '16px 20px', borderRadius: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '24px' }}>📡</span>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>Live Auction Updates</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Auction data updates automatically every few seconds</div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons, sportConfig, defaultSportConfig } from '@/lib/utils';

/* ═══════ ROLE DETECTION ═══════ */

type RoleView = 'owner' | 'player';
function getAuctionRole(role: string): RoleView {
    if (['ORGANIZER', 'TEAM_MANAGER'].includes(role)) return 'owner';
    return 'player';
}

/* ═══════ PLAYER DATA ═══════ */

const MY_AUCTION_STATUS_CRICKET = {
    id: 'AUC-001',
    name: 'District Cricket Championship 2026 — Player Auction',
    status: 'SHORTLISTED',
    currentBid: 175000,
    basePrice: 50000,
    team: 'Thunder Warriors',
    logo: '⚡',
    sport: 'Cricket',
};

const MY_AUCTION_STATUS_FOOTBALL = {
    id: 'AUC-008',
    name: 'Mumbai Local Draft 2026 — Player Auction',
    status: 'IN_BIDDING',
    currentBid: 250000,
    basePrice: 100000,
    team: 'Kerala Blasters',
    logo: '🐘',
    sport: 'Football',
};

const OPEN_AUCTIONS = [
    { id: 'AUC-002', name: 'State Football League Draft', sport: 'Football', date: '2026-03-15', teams: 6, regDeadline: '2026-03-01', entryFee: 1000, status: 'OPEN' },
    { id: 'AUC-003', name: 'Inter-District Basketball Selection', sport: 'Basketball', date: '2026-03-20', teams: 8, regDeadline: '2026-03-10', entryFee: 500, status: 'OPEN' },
    { id: 'AUC-004', name: 'Kabaddi Premier League Auction', sport: 'Kabaddi', date: '2026-04-05', teams: 8, regDeadline: '2026-03-20', entryFee: 750, status: 'UPCOMING' },
];

const BID_NOTIFICATIONS = [
    { team: 'Thunder Warriors', amount: 175000, time: '10:25 AM', logo: '⚡', isLatest: true, sport: 'Cricket' },
    { team: 'Royal Strikers', amount: 150000, time: '10:24 AM', logo: '👑', isLatest: false, sport: 'Cricket' },
    { team: 'Blazing Eagles', amount: 125000, time: '10:23 AM', logo: '🦅', isLatest: false, sport: 'Football' },
    { team: 'Golden Lions', amount: 100000, time: '10:22 AM', logo: '🦁', isLatest: false, sport: 'Basketball' },
    { team: 'Phoenix Rising', amount: 75000, time: '10:21 AM', logo: '🔥', isLatest: false, sport: 'Kabaddi' },
    { team: 'Thunder Warriors', amount: 50000, time: '10:20 AM', logo: '⚡', isLatest: false, sport: 'Cricket' },
    { team: 'Mumbai Strikers', amount: 250000, time: '10:30 AM', logo: '🔥', isLatest: true, sport: 'Football' },
    { team: 'Kerala Blasters', amount: 200000, time: '10:28 AM', logo: '🐘', isLatest: false, sport: 'Football' },
];

const TEAMS_PURSE = [
    { name: 'Thunder Warriors', logo: '⚡', remaining: 3250000, spent: 1750000, players: 5, color: '#f59e0b', sport: 'Cricket' },
    { name: 'Royal Strikers', logo: '👑', remaining: 3800000, spent: 1200000, players: 4, color: '#6366f1', sport: 'Cricket' },
    { name: 'Blazing Eagles', logo: '🦅', remaining: 2900000, spent: 2100000, players: 6, color: '#dc2626', sport: 'Football' },
    { name: 'Mumbai Strikers', logo: '🔥', remaining: 4200000, spent: 800000, players: 3, color: '#16a34a', sport: 'Football' },
    { name: 'Golden Lions', logo: '🦁', remaining: 4200000, spent: 800000, players: 3, color: '#ca8a04', sport: 'Basketball' },
    { name: 'Storm Riders', logo: '🌊', remaining: 3500000, spent: 1500000, players: 5, color: '#0ea5e9', sport: 'Hockey' },
    { name: 'Iron Wolves', logo: '🐺', remaining: 4000000, spent: 1000000, players: 3, color: '#64748b', sport: 'Cricket' },
    { name: 'Phoenix Rising', logo: '🔥', remaining: 3000000, spent: 2000000, players: 6, color: '#dc2626', sport: 'Kabaddi' },
    { name: 'Silver Hawks', logo: '🦅', remaining: 3700000, spent: 1300000, players: 4, color: '#94a3b8', sport: 'Badminton' },
];

/* ═══════ OWNER DATA ═══════ */

const CURRENT_BIDDING_PLAYER = {
    name: 'Rajesh Sharma', position: 'All-Rounder', age: 24, matches: 45, runs: 1580,
    wickets: 38, rating: 87, basePrice: 50000, currentBid: 125000,
    highestBidder: 'Royal Strikers', highestBidLogo: '👑', timeLeft: '0:42',
    myLastBid: 100000, sport: 'Cricket'
};

const CURRENT_BIDDING_FOOTBALLER = {
    name: 'Sunil Chhetri', position: 'Striker', age: 38, matches: 130, runs: 85,
    wickets: 0, rating: 91, basePrice: 150000, currentBid: 325000,
    highestBidder: 'Mumbai Strikers', highestBidLogo: '🔥', timeLeft: '1:12',
    myLastBid: 250000, sport: 'Football'
};

const MY_PURCHASED_PLAYERS = [
    { name: 'Vikram Singh', position: 'Batsman', price: 350000, rating: 92, status: 'CONFIRMED', sport: 'Cricket' },
    { name: 'Kiran Desai', position: 'Fast Bowler', price: 280000, rating: 85, status: 'CONFIRMED', sport: 'Cricket' },
    { name: 'Arjun Patel', position: 'All-Rounder', price: 420000, rating: 88, status: 'PENDING_PAYMENT', sport: 'Cricket' },
    { name: 'Sanjay Verma', position: 'Spinner', price: 150000, rating: 80, status: 'CONFIRMED', sport: 'Cricket' },
    { name: 'Deepak Yadav', position: 'Batsman', price: 220000, rating: 86, status: 'CONFIRMED', sport: 'Cricket' },
    { name: 'Rahul Mehta', position: 'Midfielder', price: 450000, rating: 89, status: 'CONFIRMED', sport: 'Football' },
    { name: 'Amit Kumar', position: 'Goalkeeper', price: 300000, rating: 82, status: 'PENDING_PAYMENT', sport: 'Football' },
];

const OWNER_UPCOMING_AUCTIONS = [
    { id: 'AUC-001', name: 'District Cricket Championship 2026', date: '2026-02-25', status: 'REGISTERED', sport: 'Cricket', players: 48, teams: 8 },
    { id: 'AUC-005', name: 'State T20 League Auction', date: '2026-03-10', status: 'REGISTERED', sport: 'Cricket', players: 64, teams: 10 },
    { id: 'AUC-006', name: 'Corporate Cricket Series', date: '2026-04-01', status: 'NOT_REGISTERED', sport: 'Cricket', players: 32, teams: 6 },
];

/* ═══════ COMPONENT ═══════ */

export default function AuctionPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '🔨';
    const roleView = getAuctionRole(user?.role || 'PLAYER');

    const [playerTab, setPlayerTab] = useState<'status' | 'apply' | 'bids' | 'purse'>('status');
    const [ownerTab, setOwnerTab] = useState<'live' | 'purchases' | 'purse' | 'upcoming'>('live');

    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

    // Sport filtering
    const activeConfig = selectedSport ? (sportConfig[selectedSport.name] || defaultSportConfig) : defaultSportConfig;
    const activeMyStatus = selectedSport?.name === 'Football' ? MY_AUCTION_STATUS_FOOTBALL : MY_AUCTION_STATUS_CRICKET;
    const showMyAuctionStatus = !selectedSport || activeMyStatus.sport === selectedSport.name;

    const filteredOpenAuctions = selectedSport ? OPEN_AUCTIONS.filter(a => a.sport === selectedSport.name) : OPEN_AUCTIONS;
    const filteredOwnerAuctions = selectedSport ? OWNER_UPCOMING_AUCTIONS.filter(a => a.sport === selectedSport.name) : OWNER_UPCOMING_AUCTIONS;
    const filteredBidNotifications = selectedSport ? BID_NOTIFICATIONS.filter(b => b.sport === selectedSport.name) : BID_NOTIFICATIONS;
    const filteredTeamsPurse = selectedSport ? TEAMS_PURSE.filter(t => t.sport === selectedSport.name) : TEAMS_PURSE;
    const filteredPurchases = selectedSport ? MY_PURCHASED_PLAYERS.filter(p => p.sport === selectedSport.name) : MY_PURCHASED_PLAYERS;

    const ActiveBiddingPlayer = selectedSport?.name === 'Football' ? CURRENT_BIDDING_FOOTBALLER : CURRENT_BIDDING_PLAYER;
    const isLiveBiddingActive = !selectedSport || ActiveBiddingPlayer.sport === selectedSport.name;

    const getMyTeam = () => {
        if (!selectedSport) return TEAMS_PURSE.find(t => t.name === 'Thunder Warriors');
        return filteredTeamsPurse.length > 0 ? filteredTeamsPurse[0] : null;
    };
    const activeMyTeam = getMyTeam() || TEAMS_PURSE.find(t => t.name === 'Thunder Warriors');

    const statusColor = (s: string) => {
        switch (s) {
            case 'APPLIED': return { bg: '#fef3c7', text: '#92400e' };
            case 'SHORTLISTED': case 'REGISTERED': return { bg: '#dbeafe', text: '#1e40af' };
            case 'IN_BIDDING': return { bg: '#fce7f3', text: '#9d174d' };
            case 'SOLD': case 'CONFIRMED': return { bg: '#dcfce7', text: '#166534' };
            case 'UNSOLD': case 'NOT_REGISTERED': return { bg: '#fef2f2', text: '#991b1b' };
            case 'PENDING_PAYMENT': return { bg: '#fef3c7', text: '#92400e' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    /* ═══════ OWNER VIEW ═══════ */
    if (roleView === 'owner') {
        return (
            <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
                {/* Header */}
                <div style={{ background: '#1a1a2e', borderBottom: '1px solid #2d2d44', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href="/dashboard" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>← Dashboard</Link>
                        <span style={{ color: '#2d2d44' }}>|</span>
                        <span style={{ fontWeight: 800, fontSize: '18px', color: '#f59e0b' }}>{sportIcon} {selectedSport ? `${sportLabel} Auction Console` : '🔨 Auction Console'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {activeMyTeam && (
                            <div style={{ padding: '4px 14px', borderRadius: '8px', background: `${activeMyTeam.color}20`, border: `1px solid ${activeMyTeam.color}40` }}>
                                <span style={{ fontSize: '12px', color: activeMyTeam.color, fontWeight: 700 }}>{activeMyTeam.logo} {activeMyTeam.name}</span>
                            </div>
                        )}
                        <div style={{ padding: '4px 14px', borderRadius: '8px', background: '#16a34a20', border: '1px solid #16a34a40' }}>
                            <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 700 }}>💰 Purse: {fmt(activeMyTeam?.remaining || 0)}</span>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' }}>
                    {/* Owner Tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                        {[
                            { key: 'live' as const, label: '🔴 Live Bidding' },
                            { key: 'purchases' as const, label: '🛒 My Purchases', badge: filteredPurchases.length },
                            { key: 'purse' as const, label: '💰 Team Purse' },
                            { key: 'upcoming' as const, label: '📅 Upcoming' },
                        ].map((t) => (
                            <button key={t.key} onClick={() => setOwnerTab(t.key)} style={{
                                padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                border: ownerTab === t.key ? '2px solid #f59e0b' : '1px solid #2d2d44',
                                background: ownerTab === t.key ? '#f59e0b' : '#1a1a2e',
                                color: ownerTab === t.key ? '#0f0f1a' : '#f59e0b',
                                position: 'relative',
                            }}>
                                {t.label}
                                {t.badge && t.badge > 0 ? (
                                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#16a34a', color: 'white', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>
                                ) : null}
                            </button>
                        ))}
                    </div>

                    {/* Live Bidding */}
                    {ownerTab === 'live' && (
                        <div>
                            {isLiveBiddingActive ? (
                                <>
                                    {/* Current Player on Block */}
                                    <div style={{ padding: '28px', borderRadius: '16px', background: '#1a1a2e', border: '2px solid #f59e0b40', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                                                <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '13px' }}>LIVE BIDDING</span>
                                            </div>
                                            <div style={{ padding: '8px 20px', borderRadius: '10px', background: '#ef444420', border: '1px solid #ef444440' }}>
                                                <span style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444' }}>⏱ {ActiveBiddingPlayer.timeLeft}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            {/* Player Info */}
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                                                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{activeConfig.emoji}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '22px', color: 'white' }}>{ActiveBiddingPlayer.name}</div>
                                                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>{ActiveBiddingPlayer.position} • Age {ActiveBiddingPlayer.age}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                                    {[
                                                        { label: 'Matches', value: ActiveBiddingPlayer.matches },
                                                        { label: activeConfig.stat, value: ActiveBiddingPlayer.runs },
                                                        { label: activeConfig.secondaryStat, value: ActiveBiddingPlayer.wickets },
                                                        { label: 'Rating', value: ActiveBiddingPlayer.rating },
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
                                                <div style={{ textAlign: 'center' as const, marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>CURRENT BID</div>
                                                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#4ade80' }}>{fmt(ActiveBiddingPlayer.currentBid)}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                        by {ActiveBiddingPlayer.highestBidLogo} {ActiveBiddingPlayer.highestBidder}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#f59e0b', textAlign: 'center' as const, marginBottom: '12px' }}>
                                                    Your last bid: {fmt(ActiveBiddingPlayer.myLastBid)}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                                    {[10000, 25000, 50000].map((inc) => (
                                                        <button key={inc} style={{
                                                            padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                                            background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f0f1a',
                                                            fontWeight: 800, fontSize: '13px',
                                                        }}>
                                                            +{fmt(inc)}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button style={{
                                                    width: '100%', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                                    background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white',
                                                    fontWeight: 800, fontSize: '16px', marginTop: '10px',
                                                }}>
                                                    🔨 Place Bid: {fmt(ActiveBiddingPlayer.currentBid + 10000)}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bid History */}
                                    <div style={{ padding: '20px', borderRadius: '14px', background: '#1a1a2e', border: '1px solid #2d2d44' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '12px' }}>📜 BID HISTORY</div>
                                        {filteredBidNotifications.length === 0 && <div style={{ color: '#64748b', fontSize: '12px' }}>No recent bids for {sportLabel}.</div>}
                                        {filteredBidNotifications.map((b, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < filteredBidNotifications.length - 1 ? '1px solid #2d2d44' : 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '18px' }}>{b.logo}</span>
                                                    <span style={{ fontWeight: 600, fontSize: '13px', color: b.isLatest ? '#4ade80' : '#94a3b8' }}>{b.team}</span>
                                                    {b.isLatest && <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#16a34a20', color: '#4ade80', fontSize: '10px', fontWeight: 700 }}>HIGHEST</span>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{fmt(b.amount)}</span>
                                                    <span style={{ fontSize: '11px', color: '#64748b' }}>{b.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #2d2d44' }}>
                                    <div style={{ fontSize: '56px', marginBottom: '16px' }}>⏸️</div>
                                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>No Active Live Auction</div>
                                    <div style={{ color: '#64748b', fontSize: '14px' }}>There is no live {sportLabel} auction matching your criteria right now.</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* My Purchases */}
                    {ownerTab === 'purchases' && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                                {[
                                    { label: 'Players Acquired', value: filteredPurchases.length, icon: '👥', color: '#f59e0b' },
                                    { label: 'Total Spent', value: fmt(filteredPurchases.reduce((s, p) => s + p.price, 0)), icon: '💰', color: '#ef4444' },
                                    { label: 'Avg Price', value: fmt(filteredPurchases.length > 0 ? Math.round(filteredPurchases.reduce((s, p) => s + p.price, 0) / filteredPurchases.length) : 0), icon: '📊', color: '#7c3aed' },
                                ].map((s, i) => (
                                    <div key={i} style={{ padding: '18px', borderRadius: '14px', background: '#1a1a2e', border: '1px solid #2d2d44', textAlign: 'center' as const }}>
                                        <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
                                        <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: '#1a1a2e', borderRadius: '16px', border: '1px solid #2d2d44', overflow: 'hidden' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.7fr 0.7fr 0.5fr 0.7fr', padding: '14px 20px', background: '#0f0f1a', fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' as const }}>
                                    <span>Player</span><span>Position</span><span>Price</span><span>Rating</span><span>Status</span>
                                </div>
                                {filteredPurchases.length === 0 && <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No purchases for {sportLabel}.</div>}
                                {filteredPurchases.map((p, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.7fr 0.7fr 0.5fr 0.7fr', padding: '14px 20px', borderTop: '1px solid #2d2d44', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{p.name}</span>
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{p.position}</span>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>{fmt(p.price)}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>{p.rating}</span>
                                        <span style={{ padding: '4px 12px', borderRadius: '6px', background: statusColor(p.status).bg, color: statusColor(p.status).text, fontSize: '11px', fontWeight: 700 }}>{p.status.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team Purse */}
                    {ownerTab === 'purse' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            {filteredTeamsPurse.length === 0 && <div style={{ color: '#64748b', gridColumn: 'span 2', textAlign: 'center', padding: '20px' }}>No teams found for {sportLabel}.</div>}
                            {filteredTeamsPurse.map((t, i) => {
                                const total = t.remaining + t.spent;
                                const pct = (t.spent / total) * 100;
                                const isMyTeam = t.name === 'Thunder Warriors' || t.name === 'Mumbai Strikers';
                                return (
                                    <div key={i} style={{ padding: '18px', borderRadius: '14px', background: '#1a1a2e', border: isMyTeam ? `2px solid ${t.color}` : '1px solid #2d2d44' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '22px' }}>{t.logo}</span>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{t.name} {isMyTeam && '⭐'}</div>
                                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{t.players} players acquired</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' as const }}>
                                                <div style={{ fontSize: '16px', fontWeight: 800, color: '#4ade80' }}>{fmt(t.remaining)}</div>
                                                <div style={{ fontSize: '10px', color: '#64748b' }}>remaining</div>
                                            </div>
                                        </div>
                                        <div style={{ height: '8px', borderRadius: '4px', background: '#0f0f1a', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: t.color }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                                            <span>Spent: {fmt(t.spent)}</span>
                                            <span>Total: {fmt(total)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Upcoming Auctions */}
                    {ownerTab === 'upcoming' && (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {filteredOwnerAuctions.length === 0 && <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No upcoming auctions found for {sportLabel}.</div>}
                            {filteredOwnerAuctions.map((a, i) => (
                                <div key={i} style={{ padding: '20px', borderRadius: '14px', background: '#1a1a2e', border: '1px solid #2d2d44', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '16px', color: 'white', marginBottom: '4px' }}>{a.name}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            🏏 {a.sport} • 📅 {a.date} • 👥 {a.players} players • 🏆 {a.teams} teams
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '8px', background: statusColor(a.status).bg, color: statusColor(a.status).text, fontSize: '12px', fontWeight: 700 }}>
                                            {a.status.replace('_', ' ')}
                                        </span>
                                        {a.status === 'NOT_REGISTERED' && (
                                            <button style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#0f0f1a', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Register</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ═══════ PLAYER VIEW ═══════ */
    return (
        <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
            {/* Header */}
            <div style={{ background: '#1a1a2e', borderBottom: '1px solid #2d2d44', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/dashboard" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>← Dashboard</Link>
                    <span style={{ color: '#2d2d44' }}>|</span>
                    <span style={{ fontWeight: 800, fontSize: '18px', color: '#f59e0b' }}>{sportIcon} {selectedSport ? `${sportLabel} Player Auction` : '🔨 Player Auction'}</span>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' }}>
                {/* Player Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {[
                        { key: 'status' as const, label: '📊 My Status' },
                        { key: 'apply' as const, label: '📝 Apply for Auction' },
                        { key: 'bids' as const, label: '🔔 Bid Notifications' },
                        { key: 'purse' as const, label: '💰 Team Purse' },
                    ].map((t) => (
                        <button key={t.key} onClick={() => setPlayerTab(t.key)} style={{
                            padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                            border: playerTab === t.key ? '2px solid #f59e0b' : '1px solid #2d2d44',
                            background: playerTab === t.key ? '#f59e0b' : '#1a1a2e',
                            color: playerTab === t.key ? '#0f0f1a' : '#f59e0b',
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Player — My Status */}
                {playerTab === 'status' && (
                    <>
                        {!showMyAuctionStatus ? (
                            <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #2d2d44' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>No Auction Applications</div>
                                <div style={{ color: '#64748b', fontSize: '14px' }}>You haven't registered for any {sportLabel} auctions yet.</div>
                                <button onClick={() => setPlayerTab('apply')} style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '10px', background: '#f59e0b', color: '#0f0f1a', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '13px' }}>Browse Open Auctions</button>
                            </div>
                        ) : (
                            <div style={{ padding: '28px', borderRadius: '16px', background: '#1a1a2e', border: '1px solid #2d2d44' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>{activeMyStatus.name}</h3>
                                {/* Progress Bar */}
                                <div style={{ display: 'flex', gap: '0', marginBottom: '24px' }}>
                                    {['APPLIED', 'SHORTLISTED', 'IN_BIDDING', 'SOLD'].map((step, i) => {
                                        const steps = ['APPLIED', 'SHORTLISTED', 'IN_BIDDING', 'SOLD'];
                                        const currentIdx = steps.indexOf(activeMyStatus.status);
                                        const done = i <= currentIdx;
                                        return (
                                            <div key={step} style={{ flex: 1, textAlign: 'center' as const }}>
                                                <div style={{ height: '6px', background: done ? '#f59e0b' : '#2d2d44', borderRadius: i === 0 ? '3px 0 0 3px' : i === 3 ? '0 3px 3px 0' : '0' }} />
                                                <div style={{ fontSize: '11px', fontWeight: 700, color: done ? '#f59e0b' : '#64748b', marginTop: '6px' }}>{step.replace('_', ' ')}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                                    <div style={{ padding: '16px', borderRadius: '10px', background: '#0f0f1a', textAlign: 'center' as const }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Status</div>
                                        <span style={{ padding: '4px 12px', borderRadius: '6px', background: statusColor(activeMyStatus.status).bg, color: statusColor(activeMyStatus.status).text, fontSize: '13px', fontWeight: 700 }}>{activeMyStatus.status.replace('_', ' ')}</span>
                                    </div>
                                    <div style={{ padding: '16px', borderRadius: '10px', background: '#0f0f1a', textAlign: 'center' as const }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Current Bid</div>
                                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#4ade80' }}>{fmt(activeMyStatus.currentBid)}</div>
                                    </div>
                                    <div style={{ padding: '16px', borderRadius: '10px', background: '#0f0f1a', textAlign: 'center' as const }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Highest Bidder</div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{activeMyStatus.logo} {activeMyStatus.team}</div>
                                    </div>
                                </div>
                                <Link href="/payments" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px', borderRadius: '10px', background: '#f59e0b', color: '#0f0f1a', fontWeight: 700, textDecoration: 'none', fontSize: '13px' }}>
                                    💳 Pay ₹5,000 — Auction Selection Fee
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {/* Player — Apply */}
                {playerTab === 'apply' && (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {filteredOpenAuctions.map((a, i) => (
                            <div key={i} style={{ padding: '20px', borderRadius: '14px', background: '#1a1a2e', border: '1px solid #2d2d44', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '16px', color: 'white' }}>{a.name}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                        🏅 {a.sport} • 📅 {a.date} • 🏆 {a.teams} teams • 💰 Entry: {fmt(a.entryFee)}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Deadline: {a.regDeadline}</div>
                                </div>
                                <button style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: a.status === 'OPEN' ? '#f59e0b' : '#2d2d44', color: a.status === 'OPEN' ? '#0f0f1a' : '#64748b', fontWeight: 700, cursor: a.status === 'OPEN' ? 'pointer' : 'default', fontSize: '13px' }}>
                                    {a.status === 'OPEN' ? '📝 Apply' : '🔒 Coming Soon'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Player — Bid Notifications */}
                {playerTab === 'bids' && (
                    <div style={{ padding: '20px', borderRadius: '14px', background: '#1a1a2e', border: '1px solid #2d2d44' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '12px' }}>📜 LIVE BID FEED</div>
                        {filteredBidNotifications.length === 0 && <div style={{ color: '#64748b', fontSize: '12px' }}>No recent bids for {sportLabel}.</div>}
                        {filteredBidNotifications.map((b, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < filteredBidNotifications.length - 1 ? '1px solid #2d2d44' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '20px' }}>{b.logo}</span>
                                    <span style={{ fontWeight: 600, fontSize: '14px', color: b.isLatest ? '#4ade80' : '#94a3b8' }}>{b.team}</span>
                                    {b.isLatest && <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#16a34a20', color: '#4ade80', fontSize: '10px', fontWeight: 700 }}>HIGHEST</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '16px', color: 'white' }}>{fmt(b.amount)}</span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{b.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Player — Team Purse */}
                {playerTab === 'purse' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {filteredTeamsPurse.length === 0 && <div style={{ color: '#64748b', gridColumn: 'span 2', textAlign: 'center', padding: '20px' }}>No teams found for {sportLabel}.</div>}
                        {filteredTeamsPurse.map((t, i) => {
                            const total = t.remaining + t.spent;
                            const pct = (t.spent / total) * 100;
                            return (
                                <div key={i} style={{ padding: '18px', borderRadius: '14px', background: '#1a1a2e', border: '1px solid #2d2d44' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '22px' }}>{t.logo}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{t.name}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{t.players} players</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' as const }}>
                                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#4ade80' }}>{fmt(t.remaining)}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b' }}>remaining</div>
                                        </div>
                                    </div>
                                    <div style={{ height: '8px', borderRadius: '4px', background: '#0f0f1a', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: t.color }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                                        <span>Spent: {fmt(t.spent)}</span>
                                        <span>Total: {fmt(total)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

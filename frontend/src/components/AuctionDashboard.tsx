'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function AuctionDashboard({ tournamentId, isOrganizer }: { tournamentId: string, isOrganizer: boolean }) {
    const [auction, setAuction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState<string>('');
    const [newPlayerId, setNewPlayerId] = useState('');
    const [newPlayerBasePrice, setNewPlayerBasePrice] = useState('50000');
    const { user } = useAuthStore();
    const myTeamPurse = auction?.teamPurses?.find((tp: any) =>
        tp.team?.managerId === user?.id || tp.teamManagerId === user?.id // Try both common structures
    );

    const fetchAuction = () => {
        setLoading(true);
        api.getTournamentAuction(tournamentId).then(setAuction).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAuction();
    }, [tournamentId]);

    if (loading) return <div style={{ color: '#64748b', padding: '20px' }}>Loading auction room...</div>;

    if (!auction) {
        return (
            <div>
                <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '22px', marginBottom: '20px' }}>🔨 Player Auction</h2>
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</div>
                    <h3 style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No Auction Configured</h3>
                    <p style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5', marginBottom: '24px' }}>
                        Initialize an auction to allow teams to bid on players in real-time. You can set global team purse limits and base prices.
                    </p>
                    {isOrganizer && (
                        <button onClick={async () => {
                            const budget = prompt('Enter team budget limit (e.g. 5000000):', '5000000');
                            if (budget) {
                                await api.createAuction(tournamentId, Number(budget));
                                fetchAuction();
                            }
                        }} style={{ padding: '12px 24px', borderRadius: '10px', background: '#6366f1', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>
                            Initialize Auction Room
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '22px', margin: 0 }}>🔨 Player Auction</h2>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: auction.status === 'IN_PROGRESS' ? '#22c55e20' : '#f59e0b20', color: auction.status === 'IN_PROGRESS' ? '#22c55e' : '#f59e0b' }}>
                        {auction.status}
                    </span>
                </div>
                {isOrganizer && auction.status === 'DRAFT' && (
                    <button onClick={async () => {
                        if (confirm('Ready to start the live auction?')) {
                            await api.updateAuctionStatus(auction.id, 'IN_PROGRESS');
                            fetchAuction();
                        }
                    }} style={{ padding: '8px 16px', borderRadius: '10px', background: '#22c55e', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                        Start Live Auction
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }} className="responsive-grid">

                {/* Left Column: Auction Console & Pool */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Active Player on the Block */}
                    {auction.status === 'IN_PROGRESS' && (
                        <div style={{ padding: '24px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(30,27,75,0.4) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="live-pulse"></span>
                                    <span style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>Live Bidding</span>
                                </div>
                            </div>

                            {/* Find IN_BIDDING player */}
                            {auction.players?.find((p: any) => p.status === 'IN_BIDDING') ? (
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    {(() => {
                                        const activePlayer = auction.players.find((p: any) => p.status === 'IN_BIDDING');
                                        const highestBid = activePlayer.bids?.[0];
                                        return (
                                            <>
                                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#312e81', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '3px solid #6366f1' }}>
                                                    {activePlayer.player?.user?.avatar ? <img src={activePlayer.player.user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="avatar" /> : '👤'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>
                                                        {activePlayer.player?.user?.firstName} {activePlayer.player?.user?.lastName}
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', gap: '12px' }}>
                                                        <span>Base: <strong style={{ color: '#fff' }}>₹{activePlayer.basePrice}</strong></span>
                                                        {highestBid && <span>Highest Bid: <strong style={{ color: '#22c55e' }}>₹{highestBid.amount}</strong></span>}
                                                    </div>
                                                </div>

                                                {/* Bidding Controls for Teams */}
                                                {!isOrganizer && myTeamPurse && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <input
                                                                type="number"
                                                                placeholder={`Min: ₹${highestBid ? highestBid.amount + 500 : activePlayer.basePrice}`}
                                                                value={bidAmount}
                                                                onChange={(e) => setBidAmount(e.target.value)}
                                                                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '13px' }}
                                                            />
                                                            <button
                                                                onClick={async () => {
                                                                    const amount = Number(bidAmount);
                                                                    const minBid = highestBid ? highestBid.amount + 500 : activePlayer.basePrice;
                                                                    if (amount < minBid) return alert(`Minimum bid is ₹${minBid}`);
                                                                    if (amount > myTeamPurse.remainingPurse) return alert(`Exceeds remaining purse (₹${myTeamPurse.remainingPurse})`);

                                                                    try {
                                                                        await api.placeBid(activePlayer.id, myTeamPurse.teamId, amount);
                                                                        setBidAmount('');
                                                                        fetchAuction();
                                                                    } catch (err: any) {
                                                                        alert(err.response?.data?.message || 'Failed to place bid');
                                                                    }
                                                                }}
                                                                style={{ padding: '10px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                                                                Bid
                                                            </button>
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
                                                            Purse: <span style={{ color: '#fff' }}>₹{myTeamPurse.remainingPurse?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {isOrganizer && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <button onClick={() => {
                                                            if (highestBid) {
                                                                api.sellPlayer(activePlayer.id, highestBid.teamId, highestBid.amount).then(fetchAuction);
                                                            } else {
                                                                alert('No bids placed yet.');
                                                            }
                                                        }} style={{ padding: '10px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Sell Player</button>
                                                        <button onClick={() => api.markUnsold(activePlayer.id).then(fetchAuction)} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Mark Unsold</button>
                                                    </div>
                                                )}
                                            </>
                                        )
                                    })()}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                                    {isOrganizer ? "Select a player from the pool below to bring to the block." : "Waiting for organizer to bring a player to the block..."}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Player Pool List */}
                    <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '15px' }}>Player Pool Tracker</h3>
                        </div>

                        {/* Add Player (Organizer Only) */}
                        {isOrganizer && auction.status !== 'COMPLETED' && (
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Enter Player ID..."
                                    value={newPlayerId}
                                    onChange={(e) => setNewPlayerId(e.target.value)}
                                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', outline: 'none' }}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '0 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>₹</span>
                                    <input
                                        type="number"
                                        value={newPlayerBasePrice}
                                        onChange={(e) => setNewPlayerBasePrice(e.target.value)}
                                        style={{ width: '80px', padding: '10px 0', background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none' }}
                                    />
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!newPlayerId.trim() || !newPlayerBasePrice) return;
                                        try {
                                            await api.addAuctionPlayer(auction.id, newPlayerId.trim(), Number(newPlayerBasePrice));
                                            setNewPlayerId('');
                                            fetchAuction();
                                        } catch (err: any) {
                                            alert(err.response?.data?.message || 'Failed to add player to pool. Check ID.');
                                        }
                                    }}
                                    style={{ padding: '10px 20px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                                    Add Player to Pool
                                </button>
                            </div>
                        )}

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        {['Player', 'Status', 'Base Price', 'Sold For', isOrganizer ? 'Actions' : ''].map((h, i) => (
                                            <th key={i} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {auction.players?.length === 0 ? (
                                        <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No players added to auction pool yet.</td></tr>
                                    ) : auction.players?.map((p: any) => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '12px 20px', color: '#e2e8f0', fontWeight: 600, fontSize: '13px' }}>
                                                {p.player?.user?.firstName} {p.player?.user?.lastName}
                                            </td>
                                            <td style={{ padding: '12px 20px' }}>
                                                <span style={{
                                                    padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                                                    background: p.status === 'SOLD' ? '#22c55e15' : p.status === 'IN_BIDDING' ? '#6366f115' : p.status === 'UNSOLD' ? '#ef444415' : '#f59e0b15',
                                                    color: p.status === 'SOLD' ? '#22c55e' : p.status === 'IN_BIDDING' ? '#818cf8' : p.status === 'UNSOLD' ? '#ef4444' : '#f59e0b'
                                                }}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 20px', color: '#94a3b8', fontSize: '13px' }}>₹{p.basePrice?.toLocaleString()}</td>
                                            <td style={{ padding: '12px 20px', color: '#fff', fontSize: '13px', fontWeight: 700 }}>
                                                {p.status === 'SOLD' ? `₹${p.soldPrice?.toLocaleString()}` : '-'}
                                            </td>
                                            {isOrganizer && (
                                                <td style={{ padding: '12px 20px' }}>
                                                    {p.status === 'PENDING' && <button onClick={() => api.approvePlayer(p.id).then(fetchAuction)} style={{ padding: '4px 10px', background: '#334155', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Approve</button>}
                                                    {p.status === 'APPROVED' && auction.status === 'IN_PROGRESS' && !auction.players.find((ap: any) => ap.status === 'IN_BIDDING') && <button onClick={() => api.startBidding(p.id).then(fetchAuction)} style={{ padding: '4px 10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Bring to Block</button>}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Financial Tracking */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h3 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '15px', marginBottom: '16px' }}>Team Purses & Squads</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {auction.teamPurses?.length === 0 ? (
                                <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center' }}>No approved teams in the tournament yet.</div>
                            ) : auction.teamPurses?.map((tp: any) => (
                                <div key={tp.teamId} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{tp.teamName}</span>
                                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{tp.playersBought} players</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748b', fontSize: '11px' }}>Remaining Purse</span>
                                        <span style={{ color: '#22c55e', fontWeight: 800, fontSize: '14px' }}>₹{tp.remainingPurse?.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

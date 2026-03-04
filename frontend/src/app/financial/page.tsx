'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';

export default function FinancialPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<any>(null);
    const [financials, setFinancials] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'overview' | 'teams' | 'auction' | 'transactions'>('overview');

    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

    // Load organizer's tournaments
    useEffect(() => {
        const params: Record<string, string> = {};
        if (selectedSport) params.sportId = selectedSport.id;
        api.getTournaments(params).then((t) => {
            // Filter to only organizer's tournaments
            const mine = user ? t.filter((x: any) => x.organizerId === user.id) : t;
            setTournaments(mine);
            if (mine.length > 0 && !selectedTournament) {
                handleSelectTournament(mine[0]);
            } else {
                setLoading(false);
            }
        }).catch(() => setLoading(false));
    }, [selectedSport]);

    const handleSelectTournament = async (tournament: any) => {
        setSelectedTournament(tournament);
        setLoading(true);
        try {
            const data = await api.getTournamentFinancials(tournament.id);
            setFinancials(data);
        } catch {
            setFinancials(null);
        }
        setLoading(false);
    };

    const statusColor = (s: string) => {
        switch (s) {
            case 'COMPLETED': return { bg: '#dcfce7', text: '#166534' };
            case 'PENDING': return { bg: '#fef3c7', text: '#92400e' };
            case 'FAILED': return { bg: '#fef2f2', text: '#991b1b' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    const typeIcon = (type: string) => {
        switch (type) {
            case 'TEAM_FEE': return '🏟️';
            case 'AUCTION_FEE': return '🔨';
            case 'PAYMENT': return '💳';
            default: return '📄';
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: '12px' }}>
                <Link href="/home" style={{ fontSize: '20px', fontWeight: 800, color: '#a5b4fc', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select value={selectedTournament?.id || ''} onChange={(e) => {
                        const t = tournaments.find(x => x.id === e.target.value);
                        if (t) handleSelectTournament(t);
                    }} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>
                        <option value="">Select Tournament...</option>
                        {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <Link href="/dashboard" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
                </div>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>💰 Financial Dashboard</h1>
                <p style={{ color: '#a5b4fc', fontSize: '16px', marginBottom: '32px' }}>
                    {selectedTournament ? `Financials for "${selectedTournament.name}"` : 'Select a tournament to view financials'}
                </p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#a5b4fc' }}>⏳ Loading financial data...</div>
                ) : !selectedTournament ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📊</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>No Tournaments Found</div>
                        <div style={{ color: '#94a3b8', fontSize: '14px' }}>You don't have any tournaments yet. Create one from the dashboard.</div>
                    </div>
                ) : !financials ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Could not load financial data.</div>
                ) : (
                    <>
                        {/* Revenue cards */}
                        <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
                            {[
                                { label: 'Total Revenue', value: fmt(financials.totalRevenue), icon: '💰', gradient: 'linear-gradient(135deg, #22c55e, #15803d)' },
                                { label: 'Team Fees', value: fmt(financials.totalTeamFees), icon: '🏟️', gradient: 'linear-gradient(135deg, #6366f1, #4338ca)', sub: `${financials.approvedTeams} teams × ${fmt(financials.registrationFee)}` },
                                { label: 'Auction Fees', value: fmt(financials.totalAuctionRegistrationFees), icon: '🔨', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', sub: `${financials.auctionPlayerCount} players × ₹5,000` },
                                { label: 'Pending', value: `${financials.pendingPaymentsCount}`, icon: '⏳', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', sub: fmt(financials.pendingPaymentsAmount) },
                            ].map((s) => (
                                <div key={s.label} style={{ padding: '22px', borderRadius: '16px', background: s.gradient, color: '#fff' }}>
                                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                                    <div style={{ fontSize: '24px', fontWeight: 900 }}>{s.value}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{s.label}</div>
                                    {s.sub && <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{s.sub}</div>}
                                </div>
                            ))}
                        </div>

                        {/* Tabs */}
                        <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                            {[
                                { key: 'overview' as const, label: '📊 Overview' },
                                { key: 'teams' as const, label: `🏟️ Team Fees (${financials.approvedTeams})` },
                                { key: 'auction' as const, label: `🔨 Auction Registrations (${financials.auctionPlayerCount})` },
                                { key: 'transactions' as const, label: `🧾 All Transactions (${financials.allTransactions.length})` },
                            ].map((t) => (
                                <button key={t.key} onClick={() => setTab(t.key)} style={{
                                    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                    border: tab === t.key ? '2px solid #a5b4fc' : '1px solid rgba(255,255,255,0.1)',
                                    background: tab === t.key ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                    color: tab === t.key ? '#fff' : '#a5b4fc',
                                }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* ═══════ OVERVIEW TAB ═══════ */}
                        {tab === 'overview' && (
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {/* Revenue Breakdown */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>📈 Revenue Breakdown</h2>
                                    {(() => {
                                        const total = financials.totalRevenue || 1;
                                        const segments = [
                                            { label: 'Team Registration Fees', amount: financials.totalTeamFees, color: '#6366f1', detail: `${financials.approvedTeams} teams` },
                                            { label: 'Auction Player Fees', amount: financials.totalAuctionRegistrationFees, color: '#f59e0b', detail: `${financials.auctionPlayerCount} players` },
                                            { label: 'Other Payments', amount: financials.totalPaymentCollected, color: '#22c55e', detail: `${financials.totalRegistrations} registrations` },
                                        ];
                                        return segments.map(seg => (
                                            <div key={seg.label} style={{ marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#e2e8f0', fontWeight: 600, marginBottom: '6px' }}>
                                                    <span>{seg.label} <span style={{ fontSize: '10px', color: '#94a3b8' }}>({seg.detail})</span></span>
                                                    <span>{fmt(seg.amount)}</span>
                                                </div>
                                                <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                                                    <div style={{ height: '100%', borderRadius: '4px', background: seg.color, width: `${(seg.amount / total) * 100}%`, transition: 'width 0.5s' }} />
                                                </div>
                                            </div>
                                        ));
                                    })()}

                                    <div style={{ marginTop: '24px', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #22c55e, #15803d)', color: '#fff' }}>
                                        <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Total Collected</div>
                                        <div style={{ fontSize: '28px', fontWeight: 900 }}>{fmt(financials.totalRevenue)}</div>
                                    </div>
                                </div>

                                {/* Summary Stats */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>📋 Summary</h2>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {[
                                            { label: 'Total Teams Registered', value: financials.totalTeams, icon: '👥' },
                                            { label: 'Approved Teams', value: financials.approvedTeams, icon: '✅' },
                                            { label: 'Registration Fee per Team', value: fmt(financials.registrationFee), icon: '🏷️' },
                                            { label: 'Auction Players', value: financials.auctionPlayerCount, icon: '🔨' },
                                            { label: 'Auction Fee per Player', value: '₹5,000', icon: '💳' },
                                            { label: 'Pending Payments', value: financials.pendingPaymentsCount, icon: '⏳' },
                                        ].map((item) => (
                                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                                    <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>{item.label}</span>
                                                </div>
                                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#a5b4fc' }}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══════ TEAM FEES TAB ═══════ */}
                        {tab === 'teams' && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>🏟️ Team Registration Fees</span>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>Total: {fmt(financials.totalTeamFees)}</span>
                                </div>
                                {financials.teamFees.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>No approved teams yet.</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <div style={{ minWidth: '500px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr 0.5fr 0.5fr', padding: '10px 24px', background: 'rgba(255,255,255,0.03)', fontSize: '12px', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' as const }}>
                                                <span>Team</span><span>Status</span><span>Fee</span><span>Date</span>
                                            </div>
                                            {financials.teamFees.map((tf: any, i: number) => (
                                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr 0.5fr 0.5fr', padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '18px' }}>{tf.teamLogo || '🏟️'}</span>
                                                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{tf.teamName}</span>
                                                    </div>
                                                    <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 700, display: 'inline-block', width: 'fit-content' }}>PAID</span>
                                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#4ade80' }}>{fmt(tf.amount)}</span>
                                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(tf.registeredAt).toLocaleDateString('en-IN')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ═══════ AUCTION REGISTRATIONS TAB ═══════ */}
                        {tab === 'auction' && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>🔨 Auction Player Registrations</span>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{financials.auctionPlayerCount} players</span>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>Total: {fmt(financials.totalAuctionRegistrationFees)}</span>
                                    </div>
                                </div>
                                {!financials.hasAuction ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>No auction created for this tournament.</div>
                                ) : financials.auctionRegistrations.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>No players registered for auction yet.</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <div style={{ minWidth: '600px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr 0.5fr 0.5fr 0.5fr', padding: '10px 24px', background: 'rgba(255,255,255,0.03)', fontSize: '12px', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' as const }}>
                                                <span>Player</span><span>Reg Fee</span><span>Base Price</span><span>Sold Price</span><span>Status</span>
                                            </div>
                                            {financials.auctionRegistrations.map((ap: any, i: number) => (
                                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr 0.5fr 0.5fr 0.5fr', padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #4338ca, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                                                            {ap.playerAvatar || '🏏'}
                                                        </div>
                                                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{ap.playerName}</span>
                                                    </div>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#4ade80' }}>₹5,000</span>
                                                    <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{fmt(ap.basePrice)}</span>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: ap.soldPrice ? '#4ade80' : '#64748b' }}>{ap.soldPrice ? fmt(ap.soldPrice) : '—'}</span>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'inline-block', width: 'fit-content',
                                                        background: ap.status === 'SOLD' ? '#dcfce7' : ap.status === 'IN_BIDDING' ? '#fce7f3' : ap.status === 'APPROVED' ? '#dbeafe' : ap.status === 'UNSOLD' ? '#fef2f2' : '#fef3c7',
                                                        color: ap.status === 'SOLD' ? '#166534' : ap.status === 'IN_BIDDING' ? '#9d174d' : ap.status === 'APPROVED' ? '#1e40af' : ap.status === 'UNSOLD' ? '#991b1b' : '#92400e',
                                                    }}>{ap.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ═══════ ALL TRANSACTIONS TAB ═══════ */}
                        {tab === 'transactions' && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>🧾 All Transactions</span>
                                </div>
                                {financials.allTransactions.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>No transactions yet.</div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '0' }}>
                                        {financials.allTransactions.map((tx: any, i: number) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ fontSize: '20px' }}>{typeIcon(tx.type)}</span>
                                                    <div>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.desc}</div>
                                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: '6px', background: statusColor(tx.status).bg, color: statusColor(tx.status).text, fontSize: '10px', fontWeight: 700 }}>{tx.status}</span>
                                                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#4ade80' }}>+{fmt(tx.amount)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

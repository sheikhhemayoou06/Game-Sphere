'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSportStore } from '@/lib/store';

export default function FinancialPage() {
    const { selectedSport } = useSportStore();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getTournaments().catch(() => []),
            api.getTeams().catch(() => []),
        ]).then(([t, te]) => {
            setTournaments(t);
            setTeams(te);
        }).finally(() => setLoading(false));
    }, []);

    const filteredTournaments = selectedSport ? tournaments.filter((t: any) => t.sport?.name === selectedSport.name || t.sportId === selectedSport.id) : tournaments;
    const filteredTeams = selectedSport ? teams.filter((t: any) => t.sport?.name === selectedSport.name || t.sportId === selectedSport.id) : teams;

    const totalRevenue = filteredTournaments.length * 15000 + filteredTeams.length * 2500;
    const registrationFees = filteredTeams.length * 2500;
    const tournamentFees = filteredTournaments.length * 15000;
    const pendingPayments = Math.floor(filteredTeams.length * 0.3) * 2500;

    const monthlyData = [
        { month: 'Sep', amount: 45000 },
        { month: 'Oct', amount: 62000 },
        { month: 'Nov', amount: 78000 },
        { month: 'Dec', amount: 54000 },
        { month: 'Jan', amount: 91000 },
        { month: 'Feb', amount: totalRevenue },
    ];
    const maxAmount = Math.max(...monthlyData.map((d) => d.amount));

    const recentTransactions = [
        { id: 'TXN-001', desc: 'Tournament Registration — Cricket Premier League', amount: 15000, type: 'credit', date: '2026-02-20', sport: 'Cricket' },
        { id: 'TXN-002', desc: 'Team Registration Fee — Thunder Warriors', amount: 2500, type: 'credit', date: '2026-02-19', sport: 'Cricket' },
        { id: 'TXN-003', desc: 'Refund — Match Cancellation', amount: -5000, type: 'debit', date: '2026-02-18', sport: 'Football' },
        { id: 'TXN-004', desc: 'Sponsorship — District Level Kabaddi', amount: 25000, type: 'credit', date: '2026-02-17', sport: 'Kabaddi' },
        { id: 'TXN-005', desc: 'Official Fee — Match Referees', amount: -8000, type: 'debit', date: '2026-02-16', sport: 'Cricket' },
        { id: 'TXN-006', desc: 'Team Registration Fee — Blue Blazers', amount: 2500, type: 'credit', date: '2026-02-15', sport: 'Football' },
    ];

    const filteredTxns = selectedSport ? recentTransactions.filter(tx => tx.sport === selectedSport.name) : recentTransactions;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#a5b4fc', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>💰 Financial Dashboard</h1>
                <p style={{ color: '#a5b4fc', fontSize: '16px', marginBottom: '32px' }}>Revenue tracking, payments, and financial reporting</p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#a5b4fc' }}>⏳ Loading financial data...</div>
                ) : (
                    <>
                        {/* Revenue cards */}
                        <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '32px' }}>
                            {[
                                { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', gradient: 'linear-gradient(135deg, #22c55e, #15803d)' },
                                { label: 'Registration Fees', value: `₹${registrationFees.toLocaleString()}`, icon: '📝', gradient: 'linear-gradient(135deg, #6366f1, #4338ca)' },
                                { label: 'Tournament Fees', value: `₹${tournamentFees.toLocaleString()}`, icon: '🏆', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
                                { label: 'Pending Payments', value: `₹${pendingPayments.toLocaleString()}`, icon: '⏳', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
                            ].map((s) => (
                                <div key={s.label} style={{ padding: '22px', borderRadius: '16px', background: s.gradient, color: '#fff' }}>
                                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                                    <div style={{ fontSize: '24px', fontWeight: 900 }}>{s.value}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Revenue chart */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '28px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>📈 Revenue Trend</h2>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '180px' }}>
                                {monthlyData.map((d) => (
                                    <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>₹{(d.amount / 1000).toFixed(0)}K</div>
                                        <div style={{
                                            width: '100%', borderRadius: '8px 8px 0 0', transition: 'height 0.5s',
                                            height: `${(d.amount / maxAmount) * 140}px`,
                                            background: d.month === 'Feb' ? 'linear-gradient(to top, #22c55e, #4ade80)' : 'linear-gradient(to top, #4338ca, #6366f1)',
                                        }} />
                                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{d.month}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* Recent transactions */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>🧾 Recent Transactions</h2>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {filteredTxns.map((tx) => (
                                        <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.desc}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{tx.id} • {tx.date}</div>
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: '14px', color: tx.amount > 0 ? '#4ade80' : '#f87171', flexShrink: 0, marginLeft: '12px' }}>
                                                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment breakdown / wallet */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>💳 Payment Breakdown</h2>
                                {[
                                    { label: 'Registration Fees', pct: 40, color: '#6366f1' },
                                    { label: 'Tournament Fees', pct: 30, color: '#f59e0b' },
                                    { label: 'Sponsorships', pct: 20, color: '#22c55e' },
                                    { label: 'Other Income', pct: 10, color: '#a78bfa' },
                                ].map((item) => (
                                    <div key={item.label} style={{ marginBottom: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#e2e8f0', fontWeight: 600, marginBottom: '6px' }}>
                                            <span>{item.label}</span><span>{item.pct}%</span>
                                        </div>
                                        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                                            <div style={{ height: '100%', borderRadius: '4px', background: item.color, width: `${item.pct}%`, transition: 'width 0.5s' }} />
                                        </div>
                                    </div>
                                ))}

                                <div style={{ marginTop: '24px', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #22c55e, #15803d)', color: '#fff' }}>
                                    <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Wallet Balance</div>
                                    <div style={{ fontSize: '28px', fontWeight: 900 }}>₹{(totalRevenue * 0.7).toLocaleString()}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>Available for withdrawal</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

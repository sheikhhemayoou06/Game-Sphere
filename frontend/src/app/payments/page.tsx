'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';

/* ═══════ ROLE DETECTION ═══════ */
type RoleView = 'organizer' | 'team_manager' | 'player';
function getPaymentRole(role: string): RoleView {
    if (role === 'ORGANIZER') return 'organizer';
    if (role === 'TEAM_MANAGER') return 'team_manager';
    return 'player';
}

/* ═══════ MOCK DATA (empty by default) ═══════ */
const ALL_PAYMENTS: any[] = [];
const PAYMENT_METHODS: any[] = [];
const REVENUE_TRANSACTIONS: any[] = [];
const EXPENSE_TRANSACTIONS: any[] = [];
const INVOICE_TEMPLATES: any[] = [];
const OWNER_ROSTER_NAMES: string[] = [];

/* ═══════ COMPONENT ═══════ */
export default function PaymentsPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '💳';
    const roleView = getPaymentRole(user?.role || 'PLAYER');

    // Player state
    const [playerFilter, setPlayerFilter] = useState('all');
    const [showReceipt, setShowReceipt] = useState<string | null>(null);

    // Team Manager state
    const [ownerTab, setOwnerTab] = useState<'revenue' | 'expenses' | 'invoices'>('revenue');

    // Organizer / Tournament Financial state
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<any>(null);
    const [financials, setFinancials] = useState<any>(null);
    const [finLoading, setFinLoading] = useState(true);
    const [finTab, setFinTab] = useState<'overview' | 'teams' | 'auction' | 'transactions'>('overview');

    // Top-level section tab (for organizer + team_manager)
    const [section, setSection] = useState<'payments' | 'tournament-financials'>('payments');

    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

    const statusStyle = (s: string) => {
        switch (s) {
            case 'PAID': case 'RECEIVED': return { bg: '#052e16', color: '#4ade80' };
            case 'PENDING': return { bg: '#422006', color: '#fbbf24' };
            case 'OVERDUE': return { bg: '#450a0a', color: '#fca5a5' };
            case 'COMPLETED': return { bg: '#dcfce7', color: '#166534' };
            case 'FAILED': return { bg: '#fef2f2', color: '#991b1b' };
            default: return { bg: '#1e293b', color: '#94a3b8' };
        }
    };

    const typeIcon = (type: string) => {
        switch (type) { case 'TEAM_FEE': return '🏟️'; case 'AUCTION_FEE': return '🔨'; case 'PAYMENT': return '💳'; default: return '📄'; }
    };

    // Sport filtering for player payments
    const sportPayments = selectedSport ? ALL_PAYMENTS.filter(p => p.sport === selectedSport.name) : ALL_PAYMENTS;
    const filtered = playerFilter === 'all' ? sportPayments : sportPayments.filter(p => p.category === playerFilter);
    const sportRevenue = selectedSport ? REVENUE_TRANSACTIONS.filter(r => r.sport === selectedSport.name) : REVENUE_TRANSACTIONS;
    const sportExpenses = selectedSport ? EXPENSE_TRANSACTIONS.filter(e => e.sport === selectedSport.name) : EXPENSE_TRANSACTIONS;
    const receiptItem = showReceipt ? ALL_PAYMENTS.find(p => p.id === showReceipt) : null;

    // Load organizer's tournaments for financial tab
    useEffect(() => {
        if (roleView === 'organizer' || roleView === 'team_manager') {
            const params: Record<string, string> = {};
            if (selectedSport) params.sportId = selectedSport.id;
            api.getTournaments(params).then((t) => {
                const mine = user ? t.filter((x: any) => x.organizerId === user.id) : t;
                setTournaments(mine);
                if (mine.length > 0 && !selectedTournament) {
                    handleSelectTournament(mine[0]);
                } else { setFinLoading(false); }
            }).catch(() => setFinLoading(false));
        }
    }, [selectedSport]);

    const handleSelectTournament = async (tournament: any) => {
        setSelectedTournament(tournament);
        setFinLoading(true);
        try {
            const data = await api.getTournamentFinancials(tournament.id);
            setFinancials(data);
        } catch { setFinancials(null); }
        setFinLoading(false);
    };

    /* ═══════════════════════════════════════════════════════════════
       SHARED HEADER
       ═══════════════════════════════════════════════════════════════ */
    const renderHeader = () => (
        <div style={{ background: roleView === 'player' ? 'linear-gradient(135deg, #115e59, #14b8a6)' : 'linear-gradient(135deg, #4c1d95, #7c3aed)', padding: '14px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🌐</span>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '18px' }}>Game Sphere</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', margin: '0 4px' }}>|</span>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>💰 Payments & Finance</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {(roleView !== 'player') && (
                        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '3px' }}>
                            {[
                                { key: 'payments' as const, label: '💳 Payments' },
                                { key: 'tournament-financials' as const, label: '📊 Tournament Financials' },
                            ].map(t => (
                                <button key={t.key} onClick={() => setSection(t.key)} style={{
                                    padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, border: 'none',
                                    background: section === t.key ? 'white' : 'transparent',
                                    color: section === t.key ? '#4c1d95' : 'rgba(255,255,255,0.8)',
                                    transition: 'all 0.2s',
                                }}>{t.label}</button>
                            ))}
                        </div>
                    )}
                    {section === 'tournament-financials' && tournaments.length > 0 && (
                        <select value={selectedTournament?.id || ''} onChange={(e) => {
                            const t = tournaments.find(x => x.id === e.target.value);
                            if (t) handleSelectTournament(t);
                        }} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '12px', fontWeight: 600 }}>
                            <option value="">Select Tournament...</option>
                            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    )}
                    <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Dashboard</Link>
                </div>
            </div>
        </div>
    );

    /* ═══════════════════════════════════════════════════════════════
       PLAYER PAYMENT VIEW
       ═══════════════════════════════════════════════════════════════ */
    const renderPlayerPayments = () => (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e1b4b', marginBottom: '6px' }}>{selectedSport ? `${sportLabel} Payments & Transactions` : '💳 Payments & Transactions'}</h1>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>Track all payments, download receipts, and manage dues</p>
            <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
                {[
                    { label: 'Total Paid', value: fmt(sportPayments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)), icon: '✅', color: '#16a34a' },
                    { label: 'Pending', value: fmt(sportPayments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0)), icon: '⏳', color: '#f59e0b' },
                    { label: 'Overdue', value: fmt(sportPayments.filter(p => p.status === 'OVERDUE').reduce((s, p) => s + p.amount, 0)), icon: '🚨', color: '#ef4444' },
                    { label: 'Transactions', value: sportPayments.length, icon: '📊', color: '#7c3aed' },
                ].map((s, i) => (
                    <div key={i} style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9', textAlign: 'center' as const }}>
                        <div style={{ fontSize: '22px', marginBottom: '4px' }}>{s.icon}</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{s.label}</div>
                    </div>
                ))}
            </div>
            <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                {[{ key: 'all', label: 'All' }, { key: 'tournament', label: '🏆 Tournament' }, { key: 'team', label: '⚡ Team' }, { key: 'auction', label: '🔨 Auction' }].map(f => (
                    <button key={f.key} onClick={() => setPlayerFilter(f.key)} style={{
                        padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                        border: playerFilter === f.key ? '2px solid #14b8a6' : '1px solid #e2e8f0',
                        background: playerFilter === f.key ? '#14b8a6' : 'white', color: playerFilter === f.key ? 'white' : '#1e1b4b',
                    }}>{f.label}</button>
                ))}
            </div>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflowX: 'auto', marginBottom: '16px' }}>
                <div style={{ minWidth: '800px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '0.3fr 0.5fr 0.7fr 0.35fr 0.3fr 0.35fr 0.3fr', padding: '12px 18px', background: '#f8fafc', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const }}>
                        <span>ID</span><span>Type</span><span>Description</span><span>Amount</span><span>Status</span><span>Date</span><span>Action</span>
                    </div>
                    {filtered.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No payment transactions yet.</div>
                    ) : filtered.map((p, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.3fr 0.5fr 0.7fr 0.35fr 0.3fr 0.35fr 0.3fr', padding: '12px 18px', borderTop: '1px solid #f1f5f9', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{p.id}</span>
                            <span style={{ fontSize: '12px', color: '#1e1b4b', fontWeight: 600 }}>{p.type}</span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{p.desc}</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b' }}>{fmt(p.amount)}</span>
                            <span style={{ padding: '2px 8px', borderRadius: '5px', background: statusStyle(p.status).bg, color: statusStyle(p.status).color, fontSize: '10px', fontWeight: 700, textAlign: 'center' as const }}>{p.status}</span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{p.date}</span>
                            <div>{p.status === 'PAID' ? (
                                <button onClick={() => setShowReceipt(p.id)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#14b8a6', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>🧾 Receipt</button>
                            ) : (
                                <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: p.status === 'OVERDUE' ? '#ef4444' : '#f59e0b', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Pay Now</button>
                            )}</div>
                        </div>
                    ))}
                </div>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginBottom: '10px' }}>💳 Payment Methods</h3>
            <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '12px' }}>
                {PAYMENT_METHODS.length === 0 ? (
                    <div style={{ padding: '20px', color: '#94a3b8', fontSize: '14px' }}>No payment methods saved yet.</div>
                ) : PAYMENT_METHODS.map((m, i) => (
                    <div key={i} style={{ padding: '14px 18px', borderRadius: '12px', background: 'white', border: m.primary ? '2px solid #14b8a6' : '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '22px' }}>{m.icon}</span>
                        <div><div style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{m.name}</div><div style={{ fontSize: '11px', color: '#64748b' }}>{m.details}</div></div>
                        {m.primary && <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a', fontSize: '10px', fontWeight: 700 }}>PRIMARY</span>}
                    </div>
                ))}
            </div>
        </div>
    );

    /* ═══════════════════════════════════════════════════════════════
       OWNER PAYMENT VIEW (Team Manager revenue/expenses/invoices)
       ═══════════════════════════════════════════════════════════════ */
    const renderOwnerPayments = () => {
        const totalRevenue = sportRevenue.filter(r => r.status === 'RECEIVED').reduce((s, r) => s + r.amount, 0);
        const totalExpenses = sportExpenses.filter(e => e.status === 'PAID').reduce((s, e) => s + e.amount, 0);
        const pendingCollections = sportRevenue.filter(r => r.status !== 'RECEIVED').reduce((s, r) => s + r.amount, 0);
        const netBalance = totalRevenue - totalExpenses;
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' }}>
                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Revenue', value: fmt(totalRevenue), icon: '📈', color: '#16a34a' },
                        { label: 'Total Expenses', value: fmt(totalExpenses), icon: '📉', color: '#ef4444' },
                        { label: 'Net Balance', value: fmt(netBalance), icon: '💎', color: netBalance >= 0 ? '#7c3aed' : '#ef4444' },
                        { label: 'Pending Collections', value: fmt(pendingCollections), icon: '⏳', color: '#f59e0b' },
                    ].map((s, i) => (
                        <div key={i} style={{ padding: '20px', borderRadius: '14px', background: 'white', border: '1px solid #f3e8ff', textAlign: 'center' as const }}>
                            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    {[
                        { key: 'revenue' as const, label: '📈 Revenue', badge: sportRevenue.filter(r => r.status !== 'RECEIVED').length },
                        { key: 'expenses' as const, label: '📉 Expenses' },
                        { key: 'invoices' as const, label: '🧾 Invoices' },
                    ].map(t => (
                        <button key={t.key} onClick={() => setOwnerTab(t.key)} style={{
                            padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, position: 'relative',
                            border: ownerTab === t.key ? '2px solid #7c3aed' : '1px solid #e9d5ff',
                            background: ownerTab === t.key ? '#7c3aed' : 'white', color: ownerTab === t.key ? 'white' : '#6d28d9',
                        }}>
                            {t.label}
                            {t.badge && t.badge > 0 ? (<span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>) : null}
                        </button>
                    ))}
                </div>
                {ownerTab === 'revenue' && (
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', overflowX: 'auto' }}>
                        <div style={{ minWidth: '800px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '0.3fr 0.6fr 0.5fr 0.4fr 0.35fr 0.35fr', padding: '14px 20px', background: '#faf5ff', fontSize: '12px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' as const }}><span>ID</span><span>From</span><span>Type</span><span>Amount</span><span>Status</span><span>Date</span></div>
                            {sportRevenue.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No revenue transactions yet.</div> : sportRevenue.map((r, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.3fr 0.6fr 0.5fr 0.4fr 0.35fr 0.35fr', padding: '14px 20px', borderTop: '1px solid #f3e8ff', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{r.id}</span>
                                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{r.from}</span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{r.type}</span>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>+{fmt(r.amount)}</span>
                                    <span style={{ padding: '3px 10px', borderRadius: '6px', background: statusStyle(r.status).bg, color: statusStyle(r.status).color, fontSize: '11px', fontWeight: 700, textAlign: 'center' as const }}>{r.status}</span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{r.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {ownerTab === 'expenses' && (
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', overflowX: 'auto' }}>
                        <div style={{ minWidth: '800px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '0.3fr 0.6fr 0.5fr 0.4fr 0.35fr 0.35fr', padding: '14px 20px', background: '#faf5ff', fontSize: '12px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' as const }}><span>ID</span><span>To</span><span>Type</span><span>Amount</span><span>Status</span><span>Date</span></div>
                            {sportExpenses.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No expense transactions yet.</div> : sportExpenses.map((e, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.3fr 0.6fr 0.5fr 0.4fr 0.35fr 0.35fr', padding: '14px 20px', borderTop: '1px solid #f3e8ff', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{e.id}</span>
                                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{e.to}</span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{e.type}</span>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>-{fmt(e.amount)}</span>
                                    <span style={{ padding: '3px 10px', borderRadius: '6px', background: statusStyle(e.status).bg, color: statusStyle(e.status).color, fontSize: '11px', fontWeight: 700, textAlign: 'center' as const }}>{e.status}</span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{e.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {ownerTab === 'invoices' && (
                    <div>
                        <div style={{ padding: '24px', borderRadius: '16px', background: 'white', border: '1px solid #f3e8ff', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e1b4b', marginBottom: '16px' }}>🧾 Generate Invoice</h3>
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '6px', textTransform: 'uppercase' as const }}>Recipient</label>
                                    <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none' }}><option>Select player...</option>{OWNER_ROSTER_NAMES.map((n, i) => <option key={i}>{n}</option>)}<option>All Team Members</option></select>
                                </div>
                                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '6px', textTransform: 'uppercase' as const }}>Invoice Type</label>
                                    <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none' }}>{INVOICE_TEMPLATES.map((t, i) => <option key={i}>{t.label} — {fmt(t.amount)}</option>)}</select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '14px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '6px', textTransform: 'uppercase' as const }}>Due Date</label>
                                <input type="date" defaultValue="2026-03-01" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none' }} />
                            </div>
                            <button style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>📤 Send Invoice</button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /* ═══════════════════════════════════════════════════════════════
       TOURNAMENT FINANCIALS VIEW (from old /financial page)
       ═══════════════════════════════════════════════════════════════ */
    const renderTournamentFinancials = () => {
        if (finLoading) return <div style={{ textAlign: 'center', padding: '60px', color: '#a5b4fc' }}>⏳ Loading financial data...</div>;
        if (!selectedTournament) return (
            <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', margin: '32px' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>📊</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>No Tournaments Found</div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>Create a tournament first to see financials here.</div>
            </div>
        );
        if (!financials) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Could not load financial data.</div>;

        return (
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>📊 Tournament Financials</h2>
                <p style={{ color: '#a5b4fc', fontSize: '14px', marginBottom: '24px' }}>Financials for "{selectedTournament.name}"</p>
                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
                    {[
                        { label: 'Total Revenue', value: fmt(financials.totalRevenue), icon: '💰', gradient: 'linear-gradient(135deg, #22c55e, #15803d)' },
                        { label: 'Team Fees', value: fmt(financials.totalTeamFees), icon: '🏟️', gradient: 'linear-gradient(135deg, #6366f1, #4338ca)', sub: `${financials.approvedTeams} teams × ${fmt(financials.registrationFee)}` },
                        { label: 'Auction Fees', value: fmt(financials.totalAuctionRegistrationFees), icon: '🔨', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', sub: `${financials.auctionPlayerCount} players × ₹5,000` },
                        { label: 'Pending', value: `${financials.pendingPaymentsCount}`, icon: '⏳', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', sub: fmt(financials.pendingPaymentsAmount) },
                    ].map(s => (
                        <div key={s.label} style={{ padding: '22px', borderRadius: '16px', background: s.gradient, color: '#fff' }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                            <div style={{ fontSize: '24px', fontWeight: 900 }}>{s.value}</div>
                            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{s.label}</div>
                            {s.sub && <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{s.sub}</div>}
                        </div>
                    ))}
                </div>
                <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {[
                        { key: 'overview' as const, label: '📊 Overview' },
                        { key: 'teams' as const, label: `🏟️ Teams (${financials.approvedTeams})` },
                        { key: 'auction' as const, label: `🔨 Auction (${financials.auctionPlayerCount})` },
                        { key: 'transactions' as const, label: `🧾 Transactions (${financials.allTransactions.length})` },
                    ].map(t => (
                        <button key={t.key} onClick={() => setFinTab(t.key)} style={{
                            padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                            border: finTab === t.key ? '2px solid #a5b4fc' : '1px solid rgba(255,255,255,0.1)',
                            background: finTab === t.key ? '#6366f1' : 'rgba(255,255,255,0.05)', color: finTab === t.key ? '#fff' : '#a5b4fc',
                        }}>{t.label}</button>
                    ))}
                </div>
                {finTab === 'overview' && (
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>📈 Revenue Breakdown</h3>
                            {[
                                { label: 'Team Registration Fees', amount: financials.totalTeamFees, color: '#6366f1', detail: `${financials.approvedTeams} teams` },
                                { label: 'Auction Player Fees', amount: financials.totalAuctionRegistrationFees, color: '#f59e0b', detail: `${financials.auctionPlayerCount} players` },
                                { label: 'Other Payments', amount: financials.totalPaymentCollected, color: '#22c55e', detail: `${financials.totalRegistrations} registrations` },
                            ].map(seg => (
                                <div key={seg.label} style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#e2e8f0', fontWeight: 600, marginBottom: '6px' }}><span>{seg.label}</span><span>{fmt(seg.amount)}</span></div>
                                    <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}><div style={{ height: '100%', borderRadius: '4px', background: seg.color, width: `${(seg.amount / (financials.totalRevenue || 1)) * 100}%`, transition: 'width 0.5s' }} /></div>
                                </div>
                            ))}
                            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #22c55e, #15803d)', color: '#fff' }}>
                                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Total Collected</div>
                                <div style={{ fontSize: '28px', fontWeight: 900 }}>{fmt(financials.totalRevenue)}</div>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>📋 Summary</h3>
                            {[
                                { label: 'Total Teams', value: financials.totalTeams, icon: '👥' },
                                { label: 'Approved Teams', value: financials.approvedTeams, icon: '✅' },
                                { label: 'Fee per Team', value: fmt(financials.registrationFee), icon: '🏷️' },
                                { label: 'Auction Players', value: financials.auctionPlayerCount, icon: '🔨' },
                                { label: 'Pending Payments', value: financials.pendingPaymentsCount, icon: '⏳' },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '18px' }}>{item.icon}</span><span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>{item.label}</span></div>
                                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#a5b4fc' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {finTab === 'teams' && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>🏟️ Team Registration Fees</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>Total: {fmt(financials.totalTeamFees)}</span>
                        </div>
                        {financials.teamFees.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No approved teams yet.</div> : (
                            <div style={{ overflowX: 'auto' }}><div style={{ minWidth: '500px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr 0.5fr 0.5fr', padding: '10px 24px', background: 'rgba(255,255,255,0.03)', fontSize: '12px', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' as const }}><span>Team</span><span>Status</span><span>Fee</span><span>Date</span></div>
                                {financials.teamFees.map((tf: any, i: number) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr 0.5fr 0.5fr', padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{tf.teamName}</span>
                                        <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 700, display: 'inline-block', width: 'fit-content' }}>PAID</span>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#4ade80' }}>{fmt(tf.amount)}</span>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(tf.registeredAt).toLocaleDateString('en-IN')}</span>
                                    </div>
                                ))}
                            </div></div>
                        )}
                    </div>
                )}
                {finTab === 'auction' && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>🔨 Auction Registrations</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>Total: {fmt(financials.totalAuctionRegistrationFees)}</span>
                        </div>
                        {!financials.hasAuction ? <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No auction created.</div> : financials.auctionRegistrations.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No players registered.</div> : (
                            <div style={{ overflowX: 'auto' }}><div style={{ minWidth: '600px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr 0.5fr 0.5fr 0.5fr', padding: '10px 24px', background: 'rgba(255,255,255,0.03)', fontSize: '12px', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' as const }}><span>Player</span><span>Reg Fee</span><span>Base</span><span>Sold</span><span>Status</span></div>
                                {financials.auctionRegistrations.map((ap: any, i: number) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr 0.5fr 0.5fr 0.5fr', padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{ap.playerName}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#4ade80' }}>₹5,000</span>
                                        <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{fmt(ap.basePrice)}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: ap.soldPrice ? '#4ade80' : '#64748b' }}>{ap.soldPrice ? fmt(ap.soldPrice) : '—'}</span>
                                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: ap.status === 'SOLD' ? '#dcfce7' : '#fef3c7', color: ap.status === 'SOLD' ? '#166534' : '#92400e' }}>{ap.status}</span>
                                    </div>
                                ))}
                            </div></div>
                        )}
                    </div>
                )}
                {finTab === 'transactions' && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}><span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>🧾 All Transactions</span></div>
                        {financials.allTransactions.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No transactions yet.</div> : financials.allTransactions.map((tx: any, i: number) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '20px' }}>{typeIcon(tx.type)}</span>
                                    <div><div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{tx.desc}</div><div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(tx.date).toLocaleDateString('en-IN')}</div></div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ padding: '3px 10px', borderRadius: '6px', background: statusStyle(tx.status).bg, color: statusStyle(tx.status).color, fontSize: '10px', fontWeight: 700 }}>{tx.status}</span>
                                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#4ade80' }}>+{fmt(tx.amount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    /* ═══════════════════════════════════════════════════════════════
       RECEIPT MODAL
       ═══════════════════════════════════════════════════════════════ */
    const renderReceiptModal = () => showReceipt && receiptItem ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowReceipt(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: '420px', padding: '28px', borderRadius: '16px', background: 'white' }}>
                <div style={{ textAlign: 'center' as const, marginBottom: '16px' }}><div style={{ fontSize: '28px', marginBottom: '4px' }}>🌐</div><div style={{ fontWeight: 800, fontSize: '18px', color: '#1e1b4b' }}>Game Sphere</div><div style={{ fontSize: '11px', color: '#64748b' }}>Payment Receipt</div></div>
                <div style={{ borderTop: '2px dashed #e2e8f0', borderBottom: '2px dashed #e2e8f0', padding: '16px 0', marginBottom: '16px' }}>
                    {[{ label: 'Receipt ID', value: receiptItem.ref }, { label: 'Amount', value: fmt(receiptItem.amount) }, { label: 'Date', value: receiptItem.date }, { label: 'Status', value: receiptItem.status }].map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}><span style={{ color: '#64748b' }}>{r.label}</span><span style={{ fontWeight: 600, color: '#1e1b4b' }}>{r.value}</span></div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => window.print()} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#1e1b4b', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>🖨️ Print</button>
                    <button onClick={() => setShowReceipt(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#14b8a6', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Close</button>
                </div>
            </div>
        </div>
    ) : null;

    /* ═══════════════════════════════════════════════════════════════
       MAIN RENDER
       ═══════════════════════════════════════════════════════════════ */
    const isFinancialsView = (roleView !== 'player') && section === 'tournament-financials';
    const bgStyle = isFinancialsView
        ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
        : roleView === 'player' ? 'linear-gradient(180deg, #f0fdf4, #faf5ff, #f8fafc)' : '#faf5ff';

    return (
        <div style={{ minHeight: '100vh', background: bgStyle }}>
            {renderHeader()}
            {roleView === 'player' && renderPlayerPayments()}
            {roleView !== 'player' && section === 'payments' && renderOwnerPayments()}
            {roleView !== 'player' && section === 'tournament-financials' && renderTournamentFinancials()}
            {renderReceiptModal()}
        </div>
    );
}

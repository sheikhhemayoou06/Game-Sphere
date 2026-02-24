'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';

/* ═══════ ROLE DETECTION ═══════ */
type RoleView = 'owner' | 'player';
function getPaymentRole(role: string): RoleView {
    if (['ORGANIZER', 'TEAM_MANAGER'].includes(role)) return 'owner';
    return 'player';
}

/* ═══════ PLAYER DATA ═══════ */
const ALL_PAYMENTS = [
    { id: 'PAY-001', type: 'Tournament Fee', category: 'tournament', desc: 'District Cricket Championship 2026', amount: 2500, status: 'PAID', date: '2026-02-15', method: 'UPI', ref: 'TXN98342', sport: 'Cricket' },
    { id: 'PAY-002', type: 'Team Registration', category: 'team', desc: 'Thunder Warriors — Season Fee', amount: 5000, status: 'PAID', date: '2026-02-12', method: 'Card', ref: 'TXN87251', sport: 'Cricket' },
    { id: 'PAY-003', type: 'Tournament Fee', category: 'tournament', desc: 'State Football League 2026', amount: 3000, status: 'PAID', date: '2026-02-10', method: 'UPI', ref: 'TXN76150', sport: 'Football' },
    { id: 'PAY-004', type: 'Equipment Deposit', category: 'team', desc: 'Basketball Equipment Deposit', amount: 3000, status: 'PENDING', date: '2026-02-22', method: '—', ref: '—', sport: 'Basketball' },
    { id: 'PAY-005', type: 'Tournament Fee', category: 'tournament', desc: 'Inter-District Kabaddi Championship', amount: 2000, status: 'OVERDUE', date: '2026-02-05', method: '—', ref: '—', sport: 'Kabaddi' },
    { id: 'PAY-006', type: 'Training Fee', category: 'tournament', desc: 'Advanced Batting Coaching Course', amount: 1500, status: 'PAID', date: '2026-01-28', method: 'Bank', ref: 'TXN65049', sport: 'Cricket' },
    { id: 'PAY-007', type: 'Auction Fee', category: 'auction', desc: 'District Cricket Auction Registration', amount: 500, status: 'PAID', date: '2026-02-18', method: 'UPI', ref: 'TXN43298', sport: 'Cricket' },
    { id: 'PAY-008', type: 'Auction Selection Fee', category: 'auction', desc: 'Thunder Warriors Selection Payment', amount: 5000, status: 'PENDING', date: '2026-02-22', method: '—', ref: '—', sport: 'Cricket' },
    { id: 'PAY-009', type: 'Tournament Fee', category: 'tournament', desc: 'Hockey State League 2026', amount: 1800, status: 'PAID', date: '2026-02-08', method: 'UPI', ref: 'TXN54123', sport: 'Hockey' },
    { id: 'PAY-010', type: 'Training Fee', category: 'tournament', desc: 'Football Skills Academy', amount: 2000, status: 'PENDING', date: '2026-02-20', method: '—', ref: '—', sport: 'Football' },
    { id: 'PAY-011', type: 'Team Registration', category: 'team', desc: 'Storm FC — Season Fee', amount: 4000, status: 'PAID', date: '2026-02-11', method: 'Card', ref: 'TXN33210', sport: 'Football' },
];

const PAYMENT_METHODS = [
    { name: 'UPI', icon: '📱', details: 'arjun.patel@upi', primary: true },
    { name: 'Bank Account', icon: '🏦', details: 'HDFC ****4523', primary: false },
    { name: 'Credit Card', icon: '💳', details: 'Visa ****8891', primary: false },
];

/* ═══════ OWNER DATA ═══════ */
const REVENUE_TRANSACTIONS = [
    { id: 'REV-001', from: 'Arjun Patel', type: 'Registration Fee', amount: 5000, status: 'RECEIVED', date: '2026-02-15', sport: 'Cricket' },
    { id: 'REV-002', from: 'Vikram Singh', type: 'Registration Fee', amount: 5000, status: 'RECEIVED', date: '2026-02-14', sport: 'Cricket' },
    { id: 'REV-003', from: 'Kiran Desai', type: 'Registration Fee', amount: 5000, status: 'RECEIVED', date: '2026-02-13', sport: 'Cricket' },
    { id: 'REV-004', from: 'Rohit Joshi', type: 'Registration Fee', amount: 5000, status: 'PENDING', date: '2026-02-20', sport: 'Cricket' },
    { id: 'REV-005', from: 'Raj Thakur', type: 'Registration Fee', amount: 5000, status: 'PENDING', date: '2026-02-21', sport: 'Cricket' },
    { id: 'REV-006', from: 'Mohan Das', type: 'Registration Fee', amount: 5000, status: 'OVERDUE', date: '2026-02-10', sport: 'Cricket' },
    { id: 'REV-007', from: 'Sports India Co.', type: 'Sponsorship', amount: 200000, status: 'RECEIVED', date: '2026-02-01', sport: 'Cricket' },
    { id: 'REV-008', from: 'CrickBat Ltd', type: 'Sponsorship', amount: 150000, status: 'RECEIVED', date: '2026-01-25', sport: 'Cricket' },
    { id: 'REV-009', from: 'Carlos Mendes', type: 'Registration Fee', amount: 4000, status: 'RECEIVED', date: '2026-02-12', sport: 'Football' },
    { id: 'REV-010', from: 'Nike India', type: 'Sponsorship', amount: 100000, status: 'RECEIVED', date: '2026-02-05', sport: 'Football' },
];

const EXPENSE_TRANSACTIONS = [
    { id: 'EXP-001', to: 'Auction — Vikram Singh', type: 'Player Acquisition', amount: 350000, status: 'PAID', date: '2026-02-18', sport: 'Cricket' },
    { id: 'EXP-002', to: 'Auction — Arjun Patel', type: 'Player Acquisition', amount: 420000, status: 'PENDING', date: '2026-02-20', sport: 'Cricket' },
    { id: 'EXP-003', to: 'Wankhede Stadium', type: 'Venue Rental', amount: 25000, status: 'PAID', date: '2026-02-12', sport: 'Cricket' },
    { id: 'EXP-004', to: 'SG Sports Equipment', type: 'Equipment', amount: 45000, status: 'PAID', date: '2026-02-08', sport: 'Cricket' },
    { id: 'EXP-005', to: 'DY Patil Ground', type: 'Venue Rental', amount: 20000, status: 'PENDING', date: '2026-02-25', sport: 'Cricket' },
    { id: 'EXP-006', to: 'Tournament Entry — State T20', type: 'Registration', amount: 15000, status: 'PAID', date: '2026-02-05', sport: 'Cricket' },
    { id: 'EXP-007', to: 'Football Ground Rental', type: 'Venue Rental', amount: 15000, status: 'PAID', date: '2026-02-10', sport: 'Football' },
    { id: 'EXP-008', to: 'Nike Boots Purchase', type: 'Equipment', amount: 35000, status: 'PAID', date: '2026-02-07', sport: 'Football' },
];

const INVOICE_TEMPLATES = [
    { label: 'Registration Fee', amount: 5000, desc: 'Annual team registration fee for 2026 season' },
    { label: 'Equipment Contribution', amount: 3000, desc: 'Team equipment and jersey contribution' },
    { label: 'Training Fee', amount: 2000, desc: 'Monthly coaching and facility fee' },
];

/* ═══════ COMPONENT ═══════ */
export default function PaymentsPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '💳';
    const roleView = getPaymentRole(user?.role || 'PLAYER');

    const [playerFilter, setPlayerFilter] = useState('all');
    const [showReceipt, setShowReceipt] = useState<string | null>(null);
    const [ownerTab, setOwnerTab] = useState<'revenue' | 'expenses' | 'invoices'>('revenue');

    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

    const statusStyle = (s: string) => {
        switch (s) {
            case 'PAID': case 'RECEIVED': return { bg: '#052e16', color: '#4ade80' };
            case 'PENDING': return { bg: '#422006', color: '#fbbf24' };
            case 'OVERDUE': return { bg: '#450a0a', color: '#fca5a5' };
            default: return { bg: '#1e293b', color: '#94a3b8' };
        }
    };

    // Sport filtering
    const sportPayments = selectedSport ? ALL_PAYMENTS.filter(p => p.sport === selectedSport.name) : ALL_PAYMENTS;
    const filtered = playerFilter === 'all' ? sportPayments : sportPayments.filter(p => p.category === playerFilter);
    const sportRevenue = selectedSport ? REVENUE_TRANSACTIONS.filter(r => r.sport === selectedSport.name) : REVENUE_TRANSACTIONS;
    const sportExpenses = selectedSport ? EXPENSE_TRANSACTIONS.filter(e => e.sport === selectedSport.name) : EXPENSE_TRANSACTIONS;

    const receiptItem = showReceipt ? ALL_PAYMENTS.find(p => p.id === showReceipt) : null;

    /* ═══════ OWNER VIEW ═══════ */
    if (roleView === 'owner') {
        const totalRevenue = sportRevenue.filter(r => r.status === 'RECEIVED').reduce((s, r) => s + r.amount, 0);
        const totalExpenses = sportExpenses.filter(e => e.status === 'PAID').reduce((s, e) => s + e.amount, 0);
        const pendingCollections = sportRevenue.filter(r => r.status !== 'RECEIVED').reduce((s, r) => s + r.amount, 0);
        const netBalance = totalRevenue - totalExpenses;

        return (
            <div style={{ minHeight: '100vh', background: '#faf5ff' }}>
                {/* Header */}
                <div style={{ background: 'white', borderBottom: '1px solid #e9d5ff', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href="/dashboard" style={{ color: '#6d28d9', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>← Dashboard</Link>
                        <span style={{ color: '#d4d4d8' }}>|</span>
                        <span style={{ fontWeight: 800, fontSize: '18px', color: '#1e1b4b' }}>{sportIcon} {selectedSport ? `${sportLabel} Financial Dashboard` : '💰 Financial Dashboard'}</span>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '6px', background: '#ede9fe', color: '#6d28d9', fontSize: '12px', fontWeight: 700 }}>⚡ Thunder Warriors</span>
                </div>

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' }}>
                    {/* Stats */}
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

                    {/* Owner Tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        {[
                            { key: 'revenue' as const, label: '📈 Revenue', badge: sportRevenue.filter(r => r.status !== 'RECEIVED').length },
                            { key: 'expenses' as const, label: '📉 Expenses' },
                            { key: 'invoices' as const, label: '🧾 Invoices' },
                        ].map((t) => (
                            <button key={t.key} onClick={() => setOwnerTab(t.key)} style={{
                                padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                border: ownerTab === t.key ? '2px solid #7c3aed' : '1px solid #e9d5ff',
                                background: ownerTab === t.key ? '#7c3aed' : 'white',
                                color: ownerTab === t.key ? 'white' : '#6d28d9',
                                position: 'relative',
                            }}>
                                {t.label}
                                {t.badge && t.badge > 0 ? (
                                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>
                                ) : null}
                            </button>
                        ))}
                    </div>

                    {/* Revenue */}
                    {ownerTab === 'revenue' && (
                        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', overflowX: 'auto' }}>
                            <div style={{ minWidth: '800px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '0.3fr 0.6fr 0.5fr 0.4fr 0.35fr 0.35fr', padding: '14px 20px', background: '#faf5ff', fontSize: '12px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' as const }}>
                                    <span>ID</span><span>From</span><span>Type</span><span>Amount</span><span>Status</span><span>Date</span>
                                </div>
                                {sportRevenue.map((r, i) => (
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

                    {/* Expenses */}
                    {ownerTab === 'expenses' && (
                        <div>
                            {/* Category Breakdown */}
                            <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                                {[
                                    { label: 'Player Acquisition', value: fmt(770000), pct: '85%', color: '#ef4444' },
                                    { label: 'Venue Rental', value: fmt(45000), pct: '5%', color: '#7c3aed' },
                                    { label: 'Equipment', value: fmt(45000), pct: '5%', color: '#f59e0b' },
                                    { label: 'Registration', value: fmt(15000), pct: '2%', color: '#0ea5e9' },
                                ].map((c, i) => (
                                    <div key={i} style={{ padding: '14px', borderRadius: '12px', background: 'white', border: '1px solid #f3e8ff' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{c.label}</div>
                                        <div style={{ fontWeight: 800, fontSize: '18px', color: c.color }}>{c.value}</div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{c.pct} of total</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', overflowX: 'auto' }}>
                                <div style={{ minWidth: '800px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '0.3fr 0.6fr 0.5fr 0.4fr 0.35fr 0.35fr', padding: '14px 20px', background: '#faf5ff', fontSize: '12px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' as const }}>
                                        <span>ID</span><span>To</span><span>Type</span><span>Amount</span><span>Status</span><span>Date</span>
                                    </div>
                                    {sportExpenses.map((e, i) => (
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
                        </div>
                    )}

                    {/* Invoices */}
                    {ownerTab === 'invoices' && (
                        <div>
                            <div style={{ padding: '24px', borderRadius: '16px', background: 'white', border: '1px solid #f3e8ff', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e1b4b', marginBottom: '16px' }}>🧾 Generate Invoice</h3>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '6px', textTransform: 'uppercase' as const }}>Recipient</label>
                                        <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none' }}>
                                            <option>Select player...</option>
                                            {OWNER_ROSTER_NAMES.map((n, i) => <option key={i}>{n}</option>)}
                                            <option>All Team Members</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '6px', textTransform: 'uppercase' as const }}>Invoice Type</label>
                                        <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none' }}>
                                            {INVOICE_TEMPLATES.map((t, i) => <option key={i}>{t.label} — {fmt(t.amount)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '6px', textTransform: 'uppercase' as const }}>Due Date</label>
                                    <input type="date" defaultValue="2026-03-01" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none' }} />
                                </div>
                                <button style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>📤 Send Invoice</button>
                            </div>

                            {/* Invoice Templates */}
                            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#6d28d9', marginBottom: '10px' }}>📋 Quick Templates</h4>
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                {INVOICE_TEMPLATES.map((t, i) => (
                                    <div key={i} style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px solid #f3e8ff' }}>
                                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b', marginBottom: '4px' }}>{t.label}</div>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#7c3aed', marginBottom: '4px' }}>{fmt(t.amount)}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>{t.desc}</div>
                                        <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e9d5ff', background: 'white', color: '#6d28d9', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Use Template</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ═══════ PLAYER VIEW ═══════ */
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0fdf4, #faf5ff, #f8fafc)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #115e59, #14b8a6)', padding: '14px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>🌐</span>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: '18px' }}>Game Sphere</span>
                    </div>
                    <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Dashboard</Link>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e1b4b', marginBottom: '6px' }}>{sportIcon} {selectedSport ? `${sportLabel} Payments & Transactions` : '💳 Payments & Transactions'}</h1>
                <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>{selectedSport ? `${sportLabel} payments, receipts, and dues` : 'Track all payments, download receipts, and manage dues'}</p>

                {/* Stats */}
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

                {/* Filters */}
                <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'tournament', label: '🏆 Tournament' },
                        { key: 'team', label: '⚡ Team' },
                        { key: 'auction', label: '🔨 Auction' },
                    ].map((f) => (
                        <button key={f.key} onClick={() => setPlayerFilter(f.key)} style={{
                            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                            border: playerFilter === f.key ? '2px solid #14b8a6' : '1px solid #e2e8f0',
                            background: playerFilter === f.key ? '#14b8a6' : 'white',
                            color: playerFilter === f.key ? 'white' : '#1e1b4b',
                        }}>{f.label}</button>
                    ))}
                </div>

                {/* Table */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflowX: 'auto', marginBottom: '16px' }}>
                    <div style={{ minWidth: '800px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '0.3fr 0.5fr 0.7fr 0.35fr 0.3fr 0.35fr 0.3fr', padding: '12px 18px', background: '#f8fafc', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const }}>
                            <span>ID</span><span>Type</span><span>Description</span><span>Amount</span><span>Status</span><span>Date</span><span>Action</span>
                        </div>
                        {filtered.map((p, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.3fr 0.5fr 0.7fr 0.35fr 0.3fr 0.35fr 0.3fr', padding: '12px 18px', borderTop: '1px solid #f1f5f9', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{p.id}</span>
                                <span style={{ fontSize: '12px', color: '#1e1b4b', fontWeight: 600 }}>{p.type}</span>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>{p.desc}</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b' }}>{fmt(p.amount)}</span>
                                <span style={{ padding: '2px 8px', borderRadius: '5px', background: statusStyle(p.status).bg, color: statusStyle(p.status).color, fontSize: '10px', fontWeight: 700, textAlign: 'center' as const }}>{p.status}</span>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>{p.date}</span>
                                <div>
                                    {p.status === 'PAID' ? (
                                        <button onClick={() => setShowReceipt(p.id)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#14b8a6', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>🧾 Receipt</button>
                                    ) : (
                                        <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: p.status === 'OVERDUE' ? '#ef4444' : '#f59e0b', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Pay Now</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Methods */}
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b', marginBottom: '10px' }}>💳 Payment Methods</h3>
                <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '12px' }}>
                    {PAYMENT_METHODS.map((m, i) => (
                        <div key={i} style={{ padding: '14px 18px', borderRadius: '12px', background: 'white', border: m.primary ? '2px solid #14b8a6' : '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '22px' }}>{m.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{m.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{m.details}</div>
                            </div>
                            {m.primary && <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a', fontSize: '10px', fontWeight: 700 }}>PRIMARY</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Receipt Modal */}
            {showReceipt && receiptItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowReceipt(null)}>
                    <div onClick={(e) => e.stopPropagation()} style={{ width: '420px', padding: '28px', borderRadius: '16px', background: 'white' }}>
                        <div style={{ textAlign: 'center' as const, marginBottom: '16px' }}>
                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🌐</div>
                            <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e1b4b' }}>Game Sphere</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Payment Receipt</div>
                        </div>
                        <div style={{ borderTop: '2px dashed #e2e8f0', borderBottom: '2px dashed #e2e8f0', padding: '16px 0', marginBottom: '16px' }}>
                            {[
                                { label: 'Receipt ID', value: receiptItem.ref },
                                { label: 'Transaction', value: receiptItem.id },
                                { label: 'Type', value: receiptItem.type },
                                { label: 'Description', value: receiptItem.desc },
                                { label: 'Amount', value: fmt(receiptItem.amount) },
                                { label: 'Method', value: receiptItem.method },
                                { label: 'Date', value: receiptItem.date },
                                { label: 'Status', value: receiptItem.status },
                            ].map((r, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                                    <span style={{ color: '#64748b' }}>{r.label}</span>
                                    <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{r.value}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center' as const }}>
                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>✅</div>
                            <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>Digitally Verified</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <button onClick={() => window.print()} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#1e1b4b', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>🖨️ Print</button>
                            <button onClick={() => setShowReceipt(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#14b8a6', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const OWNER_ROSTER_NAMES = ['Vikram Singh', 'Arjun Patel', 'Kiran Desai', 'Rohit Joshi', 'Sanjay Verma', 'Deepak Yadav', 'Mohan Das', 'Anil Kapoor'];

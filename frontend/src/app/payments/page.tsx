'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import PageNavbar from '@/components/PageNavbar';

type Tab = 'team' | 'auction';

interface Payment {
    id: string;
    type: string;
    desc: string;
    amount: number;
    status: string;
    date: string;
    from?: string;
    to?: string;
    ref?: string;
    direction?: 'incoming' | 'outgoing';
}

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function PaymentsPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const [activeTab, setActiveTab] = useState<Tab>('team');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    /* Placeholder payments — will be replaced with API data */
    const TEAM_PAYMENTS: Payment[] = [];
    const AUCTION_PAYMENTS: Payment[] = [];

    const payments = activeTab === 'team' ? TEAM_PAYMENTS : AUCTION_PAYMENTS;

    const statusStyle = (s: string) => {
        switch (s) {
            case 'PAID': case 'RECEIVED': case 'COMPLETED': return { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' };
            case 'PENDING': return { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' };
            case 'OVERDUE': case 'FAILED': return { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' };
            default: return { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };
        }
    };

    const TABS: { key: Tab; label: string }[] = [
        { key: 'team', label: 'Team' },
        { key: 'auction', label: 'Auction' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Navbar — plain "Payments" */}
            <PageNavbar title="Payments" />

            {/* ── Tab Navigation Bar ── */}
            <div style={{
                background: 'white', borderBottom: '1px solid #e2e8f0',
                position: 'sticky', top: '52px', zIndex: 49,
            }}>
                <div style={{
                    maxWidth: '1100px', margin: '0 auto', padding: '0 32px',
                    display: 'flex', gap: '0', justifyContent: 'center',
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setExpandedId(null); }}
                            style={{
                                padding: '14px 24px', border: 'none', background: 'none',
                                cursor: 'pointer', fontSize: '14px', fontWeight: 700,
                                color: activeTab === tab.key ? '#4f46e5' : '#94a3b8',
                                borderBottom: activeTab === tab.key ? '3px solid #4f46e5' : '3px solid transparent',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 32px', paddingBottom: '80px' }}>
                {payments.length === 0 ? (
                    <div style={{
                        padding: '60px', borderRadius: '20px', background: 'white',
                        border: '1px solid #f1f5f9', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                            {activeTab === 'team' ? '🛡️' : '🔨'}
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>
                            {activeTab === 'team' ? 'No team payments' : 'No auction payments'}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
                            {activeTab === 'team'
                                ? 'Payments between you and your team (fees, dues, reimbursements) will appear here.'
                                : 'Payments related to auction registrations, bids, and settlements will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {payments.map(p => {
                            const ss = statusStyle(p.status);
                            const isExpanded = expandedId === p.id;
                            const isIncoming = p.direction === 'incoming';

                            return (
                                <div key={p.id}>
                                    {/* Payment Row */}
                                    <div
                                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                                        style={{
                                            padding: '18px 20px', borderRadius: isExpanded ? '14px 14px 0 0' : '14px',
                                            background: 'white', border: '1px solid #f1f5f9',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            gap: '16px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                                            <div style={{
                                                width: '42px', height: '42px', borderRadius: '12px',
                                                background: isIncoming ? '#f0fdf4' : '#fef2f2',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '18px',
                                            }}>
                                                {isIncoming ? '📥' : '📤'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b' }}>{p.desc}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                                    {p.from || p.to ? `${isIncoming ? 'From' : 'To'}: ${isIncoming ? p.from : p.to}` : p.type} • {p.date}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <span style={{
                                                fontSize: '16px', fontWeight: 800,
                                                color: isIncoming ? '#16a34a' : '#1e1b4b',
                                            }}>
                                                {isIncoming ? '+' : '-'}{fmt(p.amount)}
                                            </span>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '8px',
                                                background: ss.bg, color: ss.color,
                                                fontSize: '11px', fontWeight: 700,
                                            }}>
                                                {p.status}
                                            </span>
                                            <span style={{
                                                fontSize: '12px', color: '#94a3b8',
                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                                transition: 'transform 0.2s',
                                            }}>▼</span>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div style={{
                                            padding: '20px', borderRadius: '0 0 14px 14px',
                                            background: '#f8fafc', border: '1px solid #f1f5f9', borderTop: 'none',
                                        }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                                {[
                                                    { label: 'Transaction ID', value: p.id },
                                                    { label: 'Reference', value: p.ref || '—' },
                                                    { label: 'Type', value: p.type },
                                                    { label: 'Amount', value: fmt(p.amount) },
                                                    { label: 'Status', value: p.status },
                                                    { label: 'Date', value: p.date },
                                                    ...(p.from ? [{ label: 'From', value: p.from }] : []),
                                                    ...(p.to ? [{ label: 'To', value: p.to }] : []),
                                                ].map((detail, i) => (
                                                    <div key={i}>
                                                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>{detail.label}</div>
                                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e1b4b' }}>{detail.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {p.status === 'PAID' || p.status === 'COMPLETED' ? (
                                                    <button onClick={() => window.print()} style={{
                                                        padding: '8px 18px', borderRadius: '10px',
                                                        border: '1px solid #e2e8f0', background: 'white',
                                                        color: '#4f46e5', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                                                    }}>🧾 Download Receipt</button>
                                                ) : (
                                                    <button style={{
                                                        padding: '8px 18px', borderRadius: '10px',
                                                        border: 'none', background: '#4f46e5',
                                                        color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                                                    }}>💳 Pay Now</button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

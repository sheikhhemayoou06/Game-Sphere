'use client';

import { useState } from 'react';
import Link from 'next/link';

const ACTIVITIES = [
    { id: 1, action: 'Tournament Created', user: 'Admin (Ravi Kumar)', target: 'District Cricket Cup 2026', type: 'TOURNAMENT', time: '2 min ago', ip: '192.168.1.45', icon: '🏆' },
    { id: 2, action: 'Player Registered', user: 'System', target: 'Arjun Patel (USI-2026-MH-00421)', type: 'PLAYER', time: '5 min ago', ip: '—', icon: '👤' },
    { id: 3, action: 'Document Approved', user: 'Admin (Priya Sharma)', target: 'Medical Certificate — Kiran Das', type: 'DOCUMENT', time: '12 min ago', ip: '10.0.0.23', icon: '📄' },
    { id: 4, action: 'Match Score Updated', user: 'Scorer (Amit Verma)', target: 'Thunder Warriors vs Blue Blazers (185-142)', type: 'MATCH', time: '18 min ago', ip: '172.16.0.8', icon: '⚽' },
    { id: 5, action: 'Transfer Approved', user: 'Admin (Ravi Kumar)', target: 'Suresh M. — Mumbai XI → Thunder Warriors', type: 'TRANSFER', time: '25 min ago', ip: '192.168.1.45', icon: '🔄' },
    { id: 6, action: 'Certificate Generated', user: 'System', target: 'Winner Certificate — District Football Cup', type: 'CERTIFICATE', time: '32 min ago', ip: '—', icon: '🏅' },
    { id: 7, action: 'Settings Changed', user: 'Admin (Priya Sharma)', target: 'Platform language updated to Hindi', type: 'SETTINGS', time: '45 min ago', ip: '10.0.0.23', icon: '⚙️' },
    { id: 8, action: 'User Login', user: 'Arjun Patel', target: 'Login from Mumbai, MH (Chrome/Mac)', type: 'AUTH', time: '1 hr ago', ip: '49.207.52.118', icon: '🔐' },
    { id: 9, action: 'Team Created', user: 'Coach (Deepak Rao)', target: 'Golden Eagles — Football', type: 'TEAM', time: '1.5 hr ago', ip: '103.44.12.67', icon: '⚡' },
    { id: 10, action: 'Report Filed', user: 'Referee (Manoj T.)', target: 'Incident Report — Unsportsmanlike Conduct', type: 'REPORT', time: '2 hr ago', ip: '192.168.5.12', icon: '📋' },
    { id: 11, action: 'Venue Booked', user: 'Admin (Ravi Kumar)', target: 'Wankhede Stadium — Feb 25-27', type: 'VENUE', time: '3 hr ago', ip: '192.168.1.45', icon: '🏟️' },
    { id: 12, action: 'Sponsor Added', user: 'Admin (Priya Sharma)', target: 'SportsTech India — Title Sponsor (₹5L)', type: 'SPONSOR', time: '5 hr ago', ip: '10.0.0.23', icon: '💎' },
];

const TYPE_COLORS: Record<string, string> = {
    TOURNAMENT: '#6366f1', PLAYER: '#22c55e', DOCUMENT: '#a855f7', MATCH: '#ef4444',
    TRANSFER: '#f59e0b', CERTIFICATE: '#ec4899', SETTINGS: '#64748b', AUTH: '#3b82f6',
    TEAM: '#8b5cf6', REPORT: '#14b8a6', VENUE: '#16a34a', SPONSOR: '#d97706',
};

export default function AuditPage() {
    const [filter, setFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const filtered = ACTIVITIES
        .filter(a => !filter || a.action.toLowerCase().includes(filter.toLowerCase()) || a.user.toLowerCase().includes(filter.toLowerCase()) || a.target.toLowerCase().includes(filter.toLowerCase()))
        .filter(a => !typeFilter || a.type === typeFilter);

    const types = [...new Set(ACTIVITIES.map(a => a.type))];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: "inherit", textDecoration: 'none' }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto", objectFit: "contain" }} /> <span className="gradient-text">Game Sphere</span></div></Link>
                <Link href="/dashboard" style={{ color: "inherit", fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '950px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>📝 Audit Log</h1>
                <p style={{ color: "inherit", fontSize: '16px', marginBottom: '28px' }}>Complete activity trail — every action, every user, every timestamp</p>

                {/* Stats */}
                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Events', value: ACTIVITIES.length, icon: '📝', color: "inherit" },
                        { label: 'Admin Actions', value: ACTIVITIES.filter(a => a.user.includes('Admin')).length, icon: '🛡️', color: "inherit" },
                        { label: 'System Events', value: ACTIVITIES.filter(a => a.user === 'System').length, icon: '🤖', color: "inherit" },
                        { label: 'Unique Users', value: new Set(ACTIVITIES.map(a => a.user)).size, icon: '👥', color: "inherit" },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: "inherit" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="🔍 Search activities..."
                        style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #334155', background: '#1e293b', color: "inherit", fontSize: '14px' }} />
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                        style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #334155', background: '#1e293b', color: "inherit", fontSize: '13px', fontWeight: 600 }}>
                        <option value="">All Types</option>
                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {/* Activity feed */}
                <div style={{ display: 'grid', gap: '6px' }}>
                    {filtered.map(a => (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontSize: '24px', width: '36px', textAlign: 'center' }}>{a.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '14px', color: "inherit" }}>{a.action}</span>
                                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: `${TYPE_COLORS[a.type] || '#64748b'}20`, color: TYPE_COLORS[a.type] || '#64748b' }}>{a.type}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: "inherit" }}>{a.target}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: "inherit" }}>{a.user}</div>
                                <div style={{ fontSize: '11px', color: "inherit" }}>{a.time} · {a.ip}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

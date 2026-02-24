'use client';

import { useState } from 'react';
import Link from 'next/link';

const REPORT_TEMPLATES = [
    { id: '1', title: 'Tournament Summary Report', desc: 'Complete overview of tournament matches, results, and statistics', category: 'TOURNAMENT', format: 'PDF', icon: '🏆', lastGenerated: '2026-02-20' },
    { id: '2', title: 'Player Performance Analysis', desc: 'Individual player stats, match history, and performance trends', category: 'PLAYER', format: 'PDF', icon: '📊', lastGenerated: '2026-02-19' },
    { id: '3', title: 'Financial Statement', desc: 'Revenue, expenses, sponsorships, and payment reconciliation', category: 'FINANCIAL', format: 'XLSX', icon: '💰', lastGenerated: '2026-02-18' },
    { id: '4', title: 'Team Roster Export', desc: 'Complete team details with player info, positions, and contact data', category: 'TEAM', format: 'CSV', icon: '👥', lastGenerated: '2026-02-17' },
    { id: '5', title: 'Match Officials Report', desc: 'Referee assignments, scoring records, and incident reports', category: 'MATCH', format: 'PDF', icon: '📋', lastGenerated: '2026-02-16' },
    { id: '6', title: 'Attendance & Participation', desc: 'Event attendance data, participation rates, and demographics', category: 'ANALYTICS', format: 'XLSX', icon: '📈', lastGenerated: '2026-02-15' },
    { id: '7', title: 'Equipment Inventory Report', desc: 'Current stock levels, condition assessment, and procurement needs', category: 'INVENTORY', format: 'CSV', icon: '📦', lastGenerated: '2026-02-14' },
    { id: '8', title: 'Certificate Issuance Log', desc: 'All certificates generated with recipient details and verification codes', category: 'CERTIFICATE', format: 'PDF', icon: '🏅', lastGenerated: '2026-02-13' },
];

const RECENT_EXPORTS = [
    { name: 'district_cricket_cup_2026.pdf', size: '2.4 MB', date: '2026-02-20', status: 'COMPLETED', type: 'PDF' },
    { name: 'player_stats_february.xlsx', size: '1.8 MB', date: '2026-02-19', status: 'COMPLETED', type: 'XLSX' },
    { name: 'financial_q4_2025.pdf', size: '3.1 MB', date: '2026-02-18', status: 'COMPLETED', type: 'PDF' },
    { name: 'team_rosters_state_level.csv', size: '856 KB', date: '2026-02-17', status: 'COMPLETED', type: 'CSV' },
    { name: 'full_platform_audit.pdf', size: '5.2 MB', date: '2026-02-16', status: 'PROCESSING', type: 'PDF' },
];

const FORMAT_COLORS: Record<string, { bg: string; color: string }> = {
    PDF: { bg: '#fef2f2', color: '#dc2626' },
    XLSX: { bg: '#ecfdf5', color: '#22c55e' },
    CSV: { bg: '#eff6ff', color: '#3b82f6' },
};

export default function ExportsPage() {
    const [tab, setTab] = useState<'templates' | 'history'>('templates');
    const [catFilter, setCatFilter] = useState('');

    const categories = [...new Set(REPORT_TEMPLATES.map(r => r.category))];
    const filtered = REPORT_TEMPLATES.filter(r => !catFilter || r.category === catFilter);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#065f46', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#065f46', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#064e3b', marginBottom: '8px' }}>📤 Reports Center</h1>
                <p style={{ color: '#065f46', fontSize: '16px', marginBottom: '28px' }}>Generate reports, export data, and download platform insights</p>

                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Report Templates', value: REPORT_TEMPLATES.length, icon: '📄', color: '#065f46' },
                        { label: 'Recent Exports', value: RECENT_EXPORTS.length, icon: '📤', color: '#3b82f6' },
                        { label: 'Formats', value: '3', icon: '📁', color: '#f59e0b' },
                        { label: 'Total Data', value: '13.3 MB', icon: '💾', color: '#22c55e' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 12px rgba(6,95,70,0.06)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '4px', background: 'rgba(6,95,70,0.08)', borderRadius: '12px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
                    {(['templates', 'history'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: tab === t ? '#065f46' : 'transparent', color: tab === t ? '#fff' : '#065f46', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                            {t === 'templates' ? '📄 Templates' : '📥 Export History'}
                        </button>
                    ))}
                </div>

                {tab === 'templates' ? (
                    <>
                        <div style={{ marginBottom: '16px' }}>
                            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                                style={{ padding: '10px 16px', borderRadius: '10px', border: '2px solid #a7f3d0', fontSize: '13px', fontWeight: 600 }}>
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            {filtered.map(r => {
                                const fmt = FORMAT_COLORS[r.format] || FORMAT_COLORS.PDF;
                                return (
                                    <div key={r.id} style={{ background: '#fff', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 12px rgba(6,95,70,0.06)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '28px' }}>{r.icon}</span>
                                                <div>
                                                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#064e3b', marginBottom: '2px' }}>{r.title}</h3>
                                                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: fmt.bg, color: fmt.color }}>{r.format}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, marginBottom: '12px' }}>{r.desc}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Last: {r.lastGenerated}</span>
                                            <button style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#065f46', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Generate ↗</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div style={{ background: '#fff', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 4px 24px rgba(6,95,70,0.06)' }}>
                        <div style={{ minWidth: '800px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '14px 20px', background: '#065f46', color: '#fff', fontSize: '11px', fontWeight: 700, gap: '8px' }}>
                                <span>FILE</span><span>SIZE</span><span>DATE</span><span>STATUS</span><span></span>
                            </div>
                            {RECENT_EXPORTS.map((e, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '14px 20px', borderBottom: '1px solid #ecfdf5', background: i % 2 === 0 ? '#f0fdf4' : '#fff', fontSize: '13px', gap: '8px', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1e1b4b', fontSize: '13px' }}>{e.name}</div>
                                        <span style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 700, background: (FORMAT_COLORS[e.type] || FORMAT_COLORS.PDF).bg, color: (FORMAT_COLORS[e.type] || FORMAT_COLORS.PDF).color }}>{e.type}</span>
                                    </div>
                                    <span style={{ color: '#64748b' }}>{e.size}</span>
                                    <span style={{ color: '#64748b' }}>{e.date}</span>
                                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: e.status === 'COMPLETED' ? '#ecfdf5' : '#fffbeb', color: e.status === 'COMPLETED' ? '#22c55e' : '#f59e0b', width: 'fit-content' }}>{e.status === 'COMPLETED' ? '✅ Done' : '⏳ Processing'}</span>
                                    <button style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #a7f3d0', background: '#fff', color: '#065f46', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>↓</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

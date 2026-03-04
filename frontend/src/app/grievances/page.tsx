'use client';

import { useState } from 'react';
import Link from 'next/link';

const GRIEVANCES: any[] = [];

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
    CRITICAL: { bg: '#fef2f2', color: '#dc2626' },
    HIGH: { bg: '#fff7ed', color: '#ea580c' },
    MEDIUM: { bg: '#fffbeb', color: '#ca8a04' },
    LOW: { bg: '#f0fdf4', color: '#16a34a' },
};

const STATUS_COLORS: Record<string, { bg: string; color: string; icon: string }> = {
    ESCALATED: { bg: '#fef2f2', color: '#dc2626', icon: '🚨' },
    UNDER_REVIEW: { bg: '#eff6ff', color: '#2563eb', icon: '🔍' },
    IN_PROGRESS: { bg: '#fffbeb', color: '#ca8a04', icon: '⏳' },
    RESOLVED: { bg: '#f0fdf4', color: '#16a34a', icon: '✅' },
};

export default function GrievancePage() {
    const [statusFilter, setStatusFilter] = useState('');
    const [showFile, setShowFile] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);

    const filtered = GRIEVANCES.filter(g => !statusFilter || g.status === statusFilter);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/home" style={{ fontSize: '20px', fontWeight: 800, color: '#854d0e', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#854d0e', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#713f12', marginBottom: '8px' }}>⚖️ Grievance Resolution</h1>
                        <p style={{ color: '#854d0e', fontSize: '16px' }}>File complaints, track disputes, and ensure fair resolution</p>
                    </div>
                    <button onClick={() => setShowFile(!showFile)}
                        style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#854d0e', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                        📝 File Grievance
                    </button>
                </div>

                {/* Stats */}
                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Filed', value: GRIEVANCES.length, icon: '📝', color: '#854d0e' },
                        { label: 'Under Review', value: GRIEVANCES.filter(g => g.status === 'UNDER_REVIEW').length, icon: '🔍', color: '#2563eb' },
                        { label: 'Escalated', value: GRIEVANCES.filter(g => g.status === 'ESCALATED').length, icon: '🚨', color: '#dc2626' },
                        { label: 'Resolved', value: GRIEVANCES.filter(g => g.status === 'RESOLVED').length, icon: '✅', color: '#16a34a' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 12px rgba(133,77,14,0.06)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* File form */}
                {showFile && (
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 24px rgba(133,77,14,0.08)', border: '1px solid #fde68a' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#713f12', marginBottom: '14px' }}>File New Grievance</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <input placeholder="Subject / Title" style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #fde68a', fontSize: '14px' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <select style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #fde68a', fontSize: '14px', fontWeight: 600 }}>
                                    <option>Match Dispute</option><option>Eligibility</option><option>Infrastructure</option><option>Administrative</option><option>Selection</option><option>Financial</option>
                                </select>
                                <select style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #fde68a', fontSize: '14px', fontWeight: 600 }}>
                                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                                </select>
                            </div>
                            <textarea placeholder="Describe the grievance in detail..." style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #fde68a', fontSize: '14px', minHeight: '100px', resize: 'vertical' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowFile(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #fde68a', background: 'transparent', color: '#854d0e', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#854d0e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Submit</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {['', 'ESCALATED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fde68a', background: statusFilter === s ? '#854d0e' : '#fff', color: statusFilter === s ? '#fff' : '#854d0e', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                            {s ? (STATUS_COLORS[s]?.icon || '') + ' ' + s.replace('_', ' ') : 'All'}
                        </button>
                    ))}
                </div>

                {/* Grievance list */}
                <div style={{ display: 'grid', gap: '10px' }}>
                    {filtered.map(g => {
                        const pri = PRIORITY_COLORS[g.priority] || PRIORITY_COLORS.MEDIUM;
                        const st = STATUS_COLORS[g.status] || STATUS_COLORS.UNDER_REVIEW;
                        return (
                            <div key={g.id} style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 12px rgba(133,77,14,0.06)', borderLeft: `4px solid ${pri.color}`, cursor: 'pointer' }}
                                onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{g.id}</span>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: pri.bg, color: pri.color }}>{g.priority}</span>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: st.bg, color: st.color }}>{st.icon} {g.status.replace('_', ' ')}</span>
                                        </div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e1b4b' }}>{g.title}</h3>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>🏅 {g.sport}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Filed by {g.filedBy} • {g.date}</div>
                                {expanded === g.id && (
                                    <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: '#fefce8', fontSize: '13px', color: '#713f12', lineHeight: 1.6 }}>
                                        {g.description}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

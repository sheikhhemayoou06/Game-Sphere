'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSportStore } from '@/lib/store';

interface MatchReport {
    id: string;
    matchId: string;
    type: string;
    summary: string;
    status: string;
    filedBy: string;
    createdAt: string;
    match?: any;
}

export default function MatchReportsPage() {
    const { selectedSport } = useSportStore();
    const [matches, setMatches] = useState<any[]>([]);
    const [selectedMatch, setSelectedMatch] = useState('');
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<MatchReport[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ type: 'GENERAL', summary: '' });
    const [tab, setTab] = useState<'reports' | 'protests'>('reports');

    useEffect(() => {
        api.getMatches().then((m) => {
            setMatches(m);
            // Generate demo reports from completed matches
            const demoReports: MatchReport[] = m
                .filter((match: any) => match.status === 'COMPLETED')
                .slice(0, 5)
                .map((match: any, i: number) => ({
                    id: `rpt-${i}`,
                    matchId: match.id,
                    type: i % 3 === 0 ? 'PROTEST' : i % 2 === 0 ? 'INCIDENT' : 'GENERAL',
                    summary: i % 3 === 0 ? 'Team disputes umpire decision in final over' : i % 2 === 0 ? 'Player injury during play - substitution required' : 'Standard match completion report',
                    status: i === 0 ? 'PENDING' : 'RESOLVED',
                    filedBy: 'Match Official',
                    createdAt: match.scheduledAt || new Date().toISOString(),
                    match,
                }));
            setReports(demoReports);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const handleSubmit = () => {
        if (!form.summary.trim()) return;
        const newReport: MatchReport = {
            id: `rpt-${Date.now()}`, matchId: selectedMatch, type: form.type,
            summary: form.summary, status: 'PENDING', filedBy: 'You',
            createdAt: new Date().toISOString(),
            match: matches.find((m) => m.id === selectedMatch),
        };
        setReports([newReport, ...reports]);
        setShowForm(false);
        setForm({ type: 'GENERAL', summary: '' });
    };

    const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
        GENERAL: { icon: '📝', color: "inherit", bg: '#eef2ff' },
        INCIDENT: { icon: '⚠️', color: "inherit", bg: '#fffbeb' },
        PROTEST: { icon: '🚨', color: "inherit", bg: '#fef2f2' },
    };

    const filteredMatches = selectedSport ? matches.filter((m: any) => m.sport?.name === selectedSport.name || m.sportId === selectedSport.id) : matches;
    const filteredReports = selectedSport ? reports.filter((r) => r.match?.sport?.name === selectedSport.name || r.match?.sportId === selectedSport.id) : reports;

    const filtered = tab === 'protests' ? filteredReports.filter((r) => r.type === 'PROTEST') : filteredReports;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: "inherit", textDecoration: 'none' }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto", objectFit: "contain" }} /> <span className="gradient-text">Game Sphere</span></div></Link>
                <Link href="/dashboard" style={{ color: "inherit", fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: "inherit", marginBottom: '8px' }}>📋 Match Reports</h1>
                        <p style={{ color: "inherit", fontSize: '16px' }}>File reports, manage protests & track incidents</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#065f46', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                        + File Report
                    </button>
                </div>

                {/* Stats cards */}
                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Reports', value: filteredReports.length, icon: '📋', color: "inherit" },
                        { label: 'Pending Review', value: filteredReports.filter((r) => r.status === 'PENDING').length, icon: '⏳', color: "inherit" },
                        { label: 'Protests Filed', value: filteredReports.filter((r) => r.type === 'PROTEST').length, icon: '🚨', color: "inherit" },
                    ].map((s) => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 12px rgba(6,95,70,0.06)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: "inherit", fontWeight: 500 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {showForm && (
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 24px rgba(6,95,70,0.1)', border: '1px solid #d1fae5' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: "inherit", marginBottom: '16px' }}>File New Report</h3>
                        <div style={{ display: 'grid', gap: '14px' }}>
                            <select value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)}
                                style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #d1fae5', fontSize: '14px', fontWeight: 600 }}>
                                <option value="">Select Match...</option>
                                {filteredMatches.map((m) => <option key={m.id} value={m.id}>{m.homeTeam?.name || 'TBD'} vs {m.awayTeam?.name || 'TBD'}</option>)}
                            </select>
                            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #d1fae5', fontSize: '14px', fontWeight: 600 }}>
                                <option value="GENERAL">📝 General Report</option>
                                <option value="INCIDENT">⚠️ Incident Report</option>
                                <option value="PROTEST">🚨 Protest / Dispute</option>
                            </select>
                            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Detailed report summary..."
                                style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #d1fae5', fontSize: '14px', minHeight: '100px', resize: 'vertical' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #a7f3d0', background: 'transparent', color: "inherit", fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleSubmit} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#065f46', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Submit Report</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '4px', background: 'rgba(6,95,70,0.06)', borderRadius: '10px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
                    {(['reports', 'protests'] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: tab === t ? '#065f46' : 'transparent', color: tab === t ? '#fff' : '#065f46', fontWeight: 600, fontSize: '13px', cursor: 'pointer', textTransform: 'capitalize' }}>
                            {t === 'protests' ? '🚨 Protests' : '📋 All Reports'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: "inherit" }}>⏳ Loading reports...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 4px 24px rgba(6,95,70,0.08)' }}>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: "inherit", marginBottom: '8px' }}>No Reports</div>
                        <div style={{ color: "inherit", fontSize: '14px' }}>Match reports will appear here once filed</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {filtered.map((r) => {
                            const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.GENERAL;
                            return (
                                <div key={r.id} style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(6,95,70,0.06)', border: '1px solid #ecfdf5', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{cfg.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '14px', color: "inherit" }}>{r.type} Report</span>
                                            <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: r.status === 'PENDING' ? '#fffbeb' : '#ecfdf5', color: r.status === 'PENDING' ? '#f59e0b' : '#22c55e' }}>
                                                {r.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: "inherit", lineHeight: 1.5, marginBottom: '6px' }}>{r.summary}</div>
                                        <div style={{ fontSize: '11px', color: "inherit" }}>Filed by {r.filedBy} • {new Date(r.createdAt).toLocaleDateString()}</div>
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

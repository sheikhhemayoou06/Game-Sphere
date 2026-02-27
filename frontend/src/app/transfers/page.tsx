'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
    PENDING: { color: '#f59e0b', bg: '#fffbeb', icon: '⏳' },
    APPROVED: { color: '#22c55e', bg: '#ecfdf5', icon: '✅' },
    REJECTED: { color: '#ef4444', bg: '#fef2f2', icon: '❌' },
};

export default function TransfersPage() {
    const { selectedSport } = useSportStore();
    const [transfers, setTransfers] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<any[]>([]);

    useEffect(() => { api.getTeams().then(setTeams).catch(() => { }); }, []);
    useEffect(() => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (statusFilter) params.status = statusFilter;
        api.getTransfers(params).then(setTransfers).catch(() => setTransfers([])).finally(() => setLoading(false));
    }, [statusFilter]);

    const getTeamName = (id: string) => teams.find((t: any) => t.id === id)?.name || `Team ${id?.slice(0, 6)}...`;

    const filteredTransfers = selectedSport
        ? transfers.filter(t => {
            const fromTeam = teams.find(tm => tm.id === t.fromTeamId);
            const toTeam = teams.find(tm => tm.id === t.toTeamId);
            const matchesSport = (tm: any) => tm?.sport?.name === selectedSport.name || tm?.sportId === selectedSport.id;
            return matchesSport(fromTeam) || matchesSport(toTeam);
        })
        : transfers;

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            if (action === 'approve') await api.approveTransfer(id);
            else await api.rejectTransfer(id);
            const params: Record<string, string> = {};
            if (statusFilter) params.status = statusFilter;
            const updated = await api.getTransfers(params);
            setTransfers(updated);
        } catch (e: any) { alert(e.message); }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#166534', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#166534', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#14532d', marginBottom: '8px' }}>🔄 Transfers</h1>
                        <p style={{ color: '#166534', fontSize: '16px' }}>Player transfer requests and approvals</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(20,83,45,0.08)', borderRadius: '12px', padding: '4px' }}>
                        {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: statusFilter === s ? '#166534' : 'transparent', color: statusFilter === s ? '#fff' : '#166534', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                {s || 'All'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#166534' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>Loading transfers...
                    </div>
                ) : filteredTransfers.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 4px 24px rgba(20,83,45,0.08)' }}>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔄</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#14532d', marginBottom: '8px' }}>No Transfer Requests</div>
                        <div style={{ color: '#166534', fontSize: '14px' }}>Transfer requests will appear when players request team changes</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {filteredTransfers.map((t) => {
                            const config = STATUS_CONFIG[t.status] || STATUS_CONFIG.PENDING;
                            const fromTeam = teams.find(tm => tm.id === t.fromTeamId);
                            const toTeam = teams.find(tm => tm.id === t.toTeamId);
                            const sportIcon = fromTeam?.sport?.icon || toTeam?.sport?.icon || selectedSport?.icon || '';
                            return (
                                <div key={t.id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 16px rgba(20,83,45,0.06)', border: '1px solid rgba(20,83,45,0.08)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏃</div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '16px', color: '#1c1917' }}>Player Transfer</div>
                                                <div style={{ fontSize: '12px', color: '#78716c' }}>ID: {t.playerId?.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '6px 14px', borderRadius: '10px', background: config.bg, color: config.color, fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {config.icon} {t.status}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>FROM</div>
                                            <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '14px' }}>{t.fromTeamId ? getTeamName(t.fromTeamId) : 'Free Agent'}</div>
                                        </div>
                                        <div style={{ fontSize: '24px' }}>→</div>
                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>TO</div>
                                            <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '14px' }}>{getTeamName(t.toTeamId)}</div>
                                        </div>
                                        {t.transferFee > 0 && (
                                            <div style={{ textAlign: 'center', flex: 1 }}>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>FEE</div>
                                                <div style={{ fontWeight: 800, color: '#6366f1', fontSize: '16px' }}>₹{t.transferFee.toLocaleString()}</div>
                                            </div>
                                        )}
                                    </div>

                                    {t.reason && <div style={{ padding: '12px 16px', background: '#fffbeb', borderRadius: '10px', color: '#92400e', fontSize: '13px', marginBottom: '16px' }}>💬 {t.reason}</div>}

                                    {t.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleAction(t.id, 'reject')}
                                                style={{ padding: '10px 20px', borderRadius: '10px', border: '2px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                                                ❌ Reject
                                            </button>
                                            <button onClick={() => handleAction(t.id, 'approve')}
                                                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#22c55e', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                                                ✅ Approve
                                            </button>
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

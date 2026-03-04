'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';

const DOC_TYPES = [
    { value: '', label: 'All Types' },
    { value: 'CONSENT', label: '📋 Consent Forms' },
    { value: 'MEDICAL', label: '🏥 Medical Forms' },
    { value: 'ID_VERIFICATION', label: '🪪 ID Verification' },
    { value: 'ELIGIBILITY', label: '✅ Eligibility Certs' },
    { value: 'APPROVAL', label: '📝 Tournament Approvals' },
    { value: 'TRANSFER_CERT', label: '🔄 Transfer Certificates' },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
    PENDING: { color: '#f59e0b', bg: '#fffbeb', icon: '⏳' },
    APPROVED: { color: '#22c55e', bg: '#ecfdf5', icon: '✅' },
    REJECTED: { color: '#ef4444', bg: '#fef2f2', icon: '❌' },
};

export default function DocumentsPage() {
    const { selectedSport } = useSportStore();
    const [documents, setDocuments] = useState<any[]>([]);
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [form, setForm] = useState({ type: 'CONSENT', title: '', description: '' });

    const fetchDocs = () => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (typeFilter) params.type = typeFilter;
        if (statusFilter) params.status = statusFilter;
        if (selectedSport?.id) params.sportId = selectedSport.id;
        api.getDocuments(params).then(setDocuments).catch(() => setDocuments([])).finally(() => setLoading(false));
    };

    useEffect(() => { fetchDocs(); }, [typeFilter, statusFilter, selectedSport?.id]);

    const handleUpload = async () => {
        if (!form.title.trim()) return;
        try {
            await api.createDocument(form);
            setShowUpload(false);
            setForm({ type: 'CONSENT', title: '', description: '' });
            fetchDocs();
        } catch (e: any) { alert(e.message); }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            if (action === 'approve') await api.approveDocument(id);
            else await api.rejectDocument(id, 'Does not meet requirements');
            fetchDocs();
        } catch (e: any) { alert(e.message); }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/home" style={{ fontSize: '20px', fontWeight: 800, color: '#6d28d9', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#6d28d9', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#4c1d95', marginBottom: '8px' }}>📄 Documents</h1>
                        <p style={{ color: '#6d28d9', fontSize: '16px' }}>Paperless document management & verification queue</p>
                    </div>
                    <button onClick={() => setShowUpload(!showUpload)}
                        style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#6d28d9', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                        + Upload Document
                    </button>
                </div>

                {showUpload && (
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 24px rgba(109,40,217,0.1)', border: '1px solid #ede9fe' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#4c1d95', marginBottom: '16px' }}>Upload New Document</h3>
                        <div style={{ display: 'grid', gap: '14px' }}>
                            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #ede9fe', fontSize: '14px', fontWeight: 600 }}>
                                {DOC_TYPES.filter((d) => d.value).map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                            </select>
                            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Document title..."
                                style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #ede9fe', fontSize: '14px' }} />
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)..."
                                style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #ede9fe', fontSize: '14px', minHeight: '80px', resize: 'vertical' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowUpload(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #d8b4fe', background: 'transparent', color: '#6d28d9', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleUpload} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#6d28d9', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Submit</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                        style={{ padding: '10px 16px', borderRadius: '10px', border: '2px solid #ede9fe', fontSize: '13px', fontWeight: 600, background: '#fff' }}>
                        {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(109,40,217,0.06)', borderRadius: '10px', padding: '4px' }}>
                        {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: statusFilter === s ? '#6d28d9' : 'transparent', color: statusFilter === s ? '#fff' : '#6d28d9', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                                {s || 'All'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#6d28d9' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>Loading documents...
                    </div>
                ) : documents.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 4px 24px rgba(109,40,217,0.08)' }}>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📄</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#4c1d95', marginBottom: '8px' }}>No Documents</div>
                        <div style={{ color: '#6d28d9', fontSize: '14px' }}>Upload documents for verification and approval</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {documents.map((doc) => {
                            const config = STATUS_CONFIG[doc.status] || STATUS_CONFIG.PENDING;
                            const docType = DOC_TYPES.find((d) => d.value === doc.type);
                            return (
                                <div key={doc.id} style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(109,40,217,0.06)', border: '1px solid #f5f3ff', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>📄</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b', marginBottom: '2px' }}>{doc.title}</div>
                                        <div style={{ fontSize: '12px', color: '#7c7c9a' }}>{docType?.label || doc.type} • {new Date(doc.createdAt).toLocaleDateString()}</div>
                                        {doc.description && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{doc.description}</div>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ padding: '5px 12px', borderRadius: '8px', background: config.bg, color: config.color, fontSize: '11px', fontWeight: 700 }}>{config.icon} {doc.status}</span>
                                        {doc.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleAction(doc.id, 'approve')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#22c55e', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '11px' }}>✅</button>
                                                <button onClick={() => handleAction(doc.id, 'reject')} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '11px' }}>❌</button>
                                            </>
                                        )}
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

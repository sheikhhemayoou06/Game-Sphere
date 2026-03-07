'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';
import PageNavbar from '@/components/PageNavbar';
import { Handshake, MailOpen, FileEdit, Clock } from 'lucide-react';

export default function SponsorshipsPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                <PageNavbar title="Sponsorships" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            </div>
        }>
            <SponsorshipsContent />
        </Suspense>
    );
}

type TabKey = 'active' | 'requests' | 'apply' | 'previous';

function SponsorshipsContent() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'Cricket';

    const [activeTab, setActiveTab] = useState<TabKey>('active');

    // MOCK DATA structure (empty by default as requested to not show fake data unless interacting)
    // We will render strict empty states since they have no real data yet.
    const activeSponsorships: any[] = [];
    const pendingRequests: any[] = [];
    const previousSponsorships: any[] = [];

    const TABS: { key: TabKey; label: string; icon: any; highlight: string }[] = [
        { key: 'active', label: 'My Sponsorships', icon: <Handshake size={20} />, highlight: '#22c55e' },
        { key: 'requests', label: 'New Requests', icon: <MailOpen size={20} />, highlight: '#f59e0b' },
        { key: 'apply', label: 'Apply', icon: <FileEdit size={20} />, highlight: '#0ea5e9' },
        { key: 'previous', label: 'Previous', icon: <Clock size={20} />, highlight: '#64748b' },
    ];

    const currentTabDef = TABS.find(t => t.key === activeTab)!;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageNavbar title="Sponsorships" />

            {/* ── Icon-Only Tab Bar (Flush directly under Navbar) ── */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '45px', zIndex: 49 }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            title={tab.label}
                            style={{
                                flex: 1, padding: '16px 0', border: 'none', background: 'none',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '8px',
                                color: activeTab === tab.key ? tab.highlight : '#94a3b8',
                                borderBottom: activeTab === tab.key ? `3px solid ${tab.highlight}` : '3px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab.icon}
                            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px 80px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', marginBottom: '4px' }}>
                    {currentTabDef.label}
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                    {activeTab === 'active' && `Manage your active ${sportLabel} sponsorships.`}
                    {activeTab === 'requests' && `Review incoming ${sportLabel} sponsorship offers.`}
                    {activeTab === 'apply' && `Submit a new proposal to potential sponsors.`}
                    {activeTab === 'previous' && `History of your expired ${sportLabel} sponsorships.`}
                </p>

                {/* ACTIVE TAB */}
                {activeTab === 'active' && (
                    activeSponsorships.length === 0 ? (
                        <div style={{ padding: '60px 20px', borderRadius: '16px', background: 'white', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                                <Handshake size={48} strokeWidth={1.5} />
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#334155' }}>No Active Sponsors</div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', maxWidth: '300px', margin: '8px auto 0' }}>
                                You currently have no active {sportLabel} sponsorship deals. Apply to secure funding.
                            </div>
                            <button
                                onClick={() => setActiveTab('apply')}
                                style={{ marginTop: '24px', padding: '10px 24px', borderRadius: '10px', background: '#0ea5e9', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                            >
                                Apply Now
                            </button>
                        </div>
                    ) : null
                )}

                {/* REQUESTS TAB */}
                {activeTab === 'requests' && (
                    pendingRequests.length === 0 ? (
                        <div style={{ padding: '60px 20px', borderRadius: '16px', background: 'white', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                                <MailOpen size={48} strokeWidth={1.5} />
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#334155' }}>No New Requests</div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', maxWidth: '300px', margin: '8px auto 0' }}>
                                You have no pending {sportLabel} offers to review at this time.
                            </div>
                        </div>
                    ) : null
                )}

                {/* APPLY TAB */}
                {activeTab === 'apply' && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proposal Title *</label>
                                <input
                                    placeholder="e.g. Title Sponsor for Regional Team..."
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '10px',
                                        border: '1px solid #cbd5e1', background: '#f8fafc',
                                        fontSize: '14px', color: '#334155', boxSizing: 'border-box', outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requested Amount *</label>
                                <input
                                    type="number"
                                    placeholder="₹ Amount in Rupees"
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '10px',
                                        border: '1px solid #cbd5e1', background: '#f8fafc',
                                        fontSize: '14px', color: '#334155', boxSizing: 'border-box', outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pitch / Description</label>
                                <textarea
                                    placeholder="Explain why a brand should sponsor you..."
                                    rows={4}
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '10px',
                                        border: '1px solid #cbd5e1', background: '#f8fafc',
                                        fontSize: '14px', color: '#334155', resize: 'vertical',
                                        boxSizing: 'border-box', outline: 'none'
                                    }}
                                />
                            </div>
                            <button
                                style={{
                                    width: '100%', padding: '14px 24px', borderRadius: '10px', border: 'none',
                                    background: '#0ea5e9', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '15px'
                                }}
                            >
                                Submit Proposal
                            </button>
                        </div>
                    </div>
                )}

                {/* PREVIOUS TAB */}
                {activeTab === 'previous' && (
                    previousSponsorships.length === 0 ? (
                        <div style={{ padding: '60px 20px', borderRadius: '16px', background: 'white', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                                <Clock size={48} strokeWidth={1.5} />
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#334155' }}>No History Found</div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', maxWidth: '300px', margin: '8px auto 0' }}>
                                You don't have any past {sportLabel} sponsorships recorded.
                            </div>
                        </div>
                    ) : null
                )}
            </div>
        </div>
    );
}

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
    const [selectedSponsorForApp, setSelectedSponsorForApp] = useState<any>(null);

    // MOCK DATA structure (empty by default as requested to not show fake data unless interacting)
    // We will render strict empty states since they have no real data yet.
    const activeSponsorships: any[] = [];
    const pendingRequests: any[] = [];
    const previousSponsorships: any[] = [];

    // MOCK DATA for Available Sponsors
    const AVAILABLE_SPONSORS = [
        { id: 's1', name: 'Spartan Sports Co.', type: 'Equipment Sponsor', range: 'Kits & Gear', logo: '🏏' },
        { id: 's2', name: 'Red Bull', type: 'Energy & Media', range: '₹50,000/yr', logo: '🐂' },
        { id: 's3', name: 'Local Auto Dealership', type: 'Financial Support', range: '₹10,000/mo', logo: '🚗' },
    ];

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
                            onClick={() => {
                                setActiveTab(tab.key);
                                if (tab.key !== 'apply') {
                                    setSelectedSponsorForApp(null);
                                }
                            }}
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
                    !selectedSponsorForApp ? (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Available {sportLabel} Sponsors</h3>
                            {AVAILABLE_SPONSORS.map(sp => (
                                <div key={sp.id} style={{
                                    background: 'white', borderRadius: '16px', padding: '20px',
                                    border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                    display: 'flex', alignItems: 'center', gap: '16px'
                                }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                                        {sp.logo}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{sp.name}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600 }}>{sp.type}</span>
                                            <span style={{ opacity: 0.3 }}>•</span>
                                            <span style={{ color: '#0ea5e9', fontWeight: 700 }}>Offers: {sp.range}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSponsorForApp(sp)}
                                        style={{ padding: '10px 20px', borderRadius: '10px', background: '#f0f9ff', color: '#0ea5e9', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                        Apply
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                            <button
                                onClick={() => setSelectedSponsorForApp(null)}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                ← Back to Sponsors
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '32px' }}>{selectedSponsorForApp.logo}</div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Application For</div>
                                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b' }}>{selectedSponsorForApp.name}</div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proposal Title *</label>
                                    <input
                                        placeholder={`e.g. Partnership Request for ${selectedSponsorForApp.name}`}
                                        style={{
                                            width: '100%', padding: '12px 14px', borderRadius: '10px',
                                            border: '1px solid #cbd5e1', background: '#f8fafc',
                                            fontSize: '14px', color: '#334155', boxSizing: 'border-box', outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requested Amount / Gear *</label>
                                    <input
                                        placeholder={`e.g. ${selectedSponsorForApp.range}`}
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
                                        placeholder={`Explain why ${selectedSponsorForApp.name} should sponsor you...`}
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
                                    onClick={() => {
                                        alert('Proposal Submitted successfully!');
                                        setSelectedSponsorForApp(null);
                                        setActiveTab('requests');
                                    }}
                                    style={{
                                        width: '100%', padding: '14px 24px', borderRadius: '10px', border: 'none',
                                        background: '#0ea5e9', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '15px'
                                    }}
                                >
                                    Submit Proposal
                                </button>
                            </div>
                        </div>
                    )
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

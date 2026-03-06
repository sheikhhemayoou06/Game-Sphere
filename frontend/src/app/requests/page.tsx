'use client';

import { useState } from 'react';
import PageNavbar from '@/components/PageNavbar';

type Tab = 'join-requests' | 'my-applications';

export default function RequestsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('join-requests');

    const TABS: { key: Tab; label: string }[] = [
        { key: 'join-requests', label: 'Join Requests' },
        { key: 'my-applications', label: 'My Applications' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Navbar — plain "Requests" */}
            <PageNavbar title="Requests" />

            {/* ── Tab Navigation Bar ── */}
            <div style={{
                background: 'white', borderBottom: '1px solid #e2e8f0',
                position: 'sticky', top: '52px', zIndex: 49,
            }}>
                <div style={{
                    maxWidth: '1100px', margin: '0 auto', padding: '0 32px',
                    display: 'flex', gap: '0',
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
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
                {activeTab === 'join-requests' && (
                    <div>
                        {/* Empty state */}
                        <div style={{
                            padding: '60px', borderRadius: '20px', background: 'white',
                            border: '1px solid #f1f5f9', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤝</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>No join requests</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
                                When teams invite you to join, their requests will appear here.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'my-applications' && (
                    <div>
                        {/* Empty state */}
                        <div style={{
                            padding: '60px', borderRadius: '20px', background: 'white',
                            border: '1px solid #f1f5f9', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>No applications yet</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
                                When you apply to join teams or tournaments, your applications will be tracked here.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

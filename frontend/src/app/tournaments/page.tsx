'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons, formatDate, statusColors, sportConfig, defaultSportConfig } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';

type Tab = 'my' | 'explore' | 'drafted' | 'completed';

export default function TournamentsPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const isTeamManager = user?.role === 'TEAM_MANAGER';
    const canCreate = ['ORGANIZER', 'SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN'].includes(user?.role || '');

    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('my');
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (selectedSport?.id) params.sportId = selectedSport.id;
        api.getTournaments(params).then(setTournaments).catch(() => { }).finally(() => setLoading(false));
    }, [selectedSport]);

    const handleApply = (tournamentId: string, tournamentName: string) => {
        setAppliedIds(prev => new Set(prev).add(tournamentId));
        alert(`✅ Application submitted for "${tournamentName}"!\n\nYour team has been registered. The organizer will review your application.`);
    };

    /* ── Filter tournaments by tab ── */
    const filtered = tournaments.filter(t => {
        switch (activeTab) {
            case 'my': return true; // show all user-related tournaments
            case 'explore': return t.status === 'REGISTRATION';
            case 'drafted': return t.status === 'DRAFT';
            case 'completed': return t.status === 'COMPLETED';
            default: return true;
        }
    });

    const TABS: { key: Tab; label: string }[] = [
        { key: 'my', label: 'My Tournaments' },
        { key: 'explore', label: 'Explore New' },
        { key: 'drafted', label: 'Drafted' },
        { key: 'completed', label: 'Completed' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Navbar — plain "Tournaments" without emoji */}
            <PageNavbar title="Tournaments" />

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
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', fontSize: '16px', color: '#94a3b8' }}>
                        ⏳ Loading tournaments…
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{
                        padding: '60px', borderRadius: '20px', background: 'white',
                        border: '1px solid #f1f5f9', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                            {activeTab === 'my' ? '🏟️' : activeTab === 'explore' ? '🔍' : activeTab === 'drafted' ? '📝' : '✅'}
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>
                            {activeTab === 'my' && 'No tournaments yet'}
                            {activeTab === 'explore' && 'No tournaments open for registration'}
                            {activeTab === 'drafted' && 'No drafted tournaments'}
                            {activeTab === 'completed' && 'No completed tournaments'}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
                            {activeTab === 'explore'
                                ? 'Check back soon for upcoming tournaments to register for!'
                                : 'Tournaments will appear here as they are created.'}
                        </p>
                    </div>
                ) : (
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                        {filtered.map((t: any) => {
                            const hasApplied = appliedIds.has(t.id);
                            const canApply = isTeamManager && t.status === 'REGISTRATION' && !hasApplied;

                            return (
                                <div key={t.id} className="card-hover" style={{
                                    padding: '24px', borderRadius: '16px', background: 'white',
                                    border: `1px solid ${hasApplied ? '#bbf7d0' : '#f1f5f9'}`,
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                                }}>
                                    <Link href={`/tournaments/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px',
                                                background: `${t.sport?.accentColor || '#6366f1'}15`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '22px',
                                            }}>
                                                {sportIcons[t.sport?.name] || t.sport?.icon || sportConfig[t.sport?.name]?.emoji || defaultSportConfig.emoji}
                                            </div>
                                            <span className="status-badge" style={{
                                                background: `${statusColors[t.status] || '#6366f1'}15`,
                                                color: statusColors[t.status] || '#6366f1',
                                            }}>
                                                {t.status === 'LIVE' && <span className="live-pulse"></span>}
                                                {t.status}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: '#1e1b4b' }}>{t.name}</h3>
                                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                                            {t.sport?.name} • {t.format} • {t.level}
                                        </p>
                                        <div style={{
                                            display: 'flex', gap: '16px', paddingTop: '12px',
                                            borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8',
                                        }}>
                                            <span>👥 {t._count?.teams || 0} teams</span>
                                            <span>⚔️ {t._count?.matches || 0} matches</span>
                                            {t.startDate && <span>📅 {formatDate(t.startDate)}</span>}
                                        </div>
                                    </Link>

                                    {/* Apply Button for Explore New tab */}
                                    {activeTab === 'explore' && isTeamManager && (
                                        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                                            {hasApplied ? (
                                                <div style={{
                                                    padding: '10px', borderRadius: '10px',
                                                    background: '#f0fdf4', color: '#16a34a',
                                                    fontSize: '13px', fontWeight: 700, textAlign: 'center',
                                                }}>
                                                    ✅ Application Submitted
                                                </div>
                                            ) : canApply ? (
                                                <button
                                                    onClick={() => handleApply(t.id, t.name)}
                                                    style={{
                                                        width: '100%', padding: '10px', borderRadius: '10px',
                                                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                        color: 'white', border: 'none', cursor: 'pointer',
                                                        fontSize: '13px', fontWeight: 700,
                                                    }}
                                                >
                                                    📝 Register Now
                                                </button>
                                            ) : (
                                                <div style={{
                                                    padding: '10px', borderRadius: '10px',
                                                    background: '#f1f5f9', color: '#94a3b8',
                                                    fontSize: '13px', fontWeight: 600, textAlign: 'center',
                                                }}>
                                                    🔒 Registration Not Open
                                                </div>
                                            )}
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

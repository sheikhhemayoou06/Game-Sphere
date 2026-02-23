'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons, formatDate, statusColors, sportConfig, defaultSportConfig } from '@/lib/utils';

export default function TournamentsPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const isTeamManager = user?.role === 'TEAM_MANAGER';
    const canCreate = ['ORGANIZER', 'SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN'].includes(user?.role || '');

    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || sportConfig[selectedSport.name]?.emoji || defaultSportConfig.emoji) : '🏆';

    const [tournaments, setTournaments] = useState<any[]>([]);
    const [sports, setSports] = useState<any[]>([]);
    const [filter, setFilter] = useState({ sportId: selectedSport?.id || '', status: '' });
    const [loading, setLoading] = useState(true);
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        api.getSports().then(setSports).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (filter.sportId) params.sportId = filter.sportId;
        if (filter.status) params.status = filter.status;
        api.getTournaments(params).then(setTournaments).catch(() => { }).finally(() => setLoading(false));
    }, [filter]);

    const handleApply = (tournamentId: string, tournamentName: string) => {
        setAppliedIds(prev => new Set(prev).add(tournamentId));
        alert(`✅ Application submitted for "${tournamentName}"!\n\nYour team "Thunder Warriors" has been registered. The organizer will review your application.`);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <nav style={{
                padding: '16px 32px', background: 'white',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <span style={{ fontSize: '24px' }}>🌐</span>
                    <span className="gradient-text" style={{ fontSize: '20px', fontWeight: 800 }}>Game Sphere</span>
                </Link>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link href="/dashboard" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
                    {canCreate && (
                        <Link href="/tournaments/create" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                            + Create Tournament
                        </Link>
                    )}
                    {!user && <Link href="/login" style={{ fontSize: '14px', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Login</Link>}
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.5px' }}>{sportIcon} {selectedSport ? `${sportLabel} Tournaments` : 'Tournaments'}</h1>
                    <p style={{ color: '#64748b', fontSize: '15px', marginTop: '4px' }}>
                        {isTeamManager
                            ? `Browse ${selectedSport ? sportLabel + ' ' : ''}tournaments and apply with your team`
                            : `Browse and discover ${selectedSport ? sportLabel + ' ' : ''}sports tournaments across India`}
                    </p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <select
                        value={filter.sportId}
                        onChange={(e) => setFilter({ ...filter, sportId: e.target.value })}
                        className="input-field"
                        style={{ width: '200px', padding: '10px 14px', color: '#1e1b4b' }}
                    >
                        <option value="">All Sports</option>
                        {sports.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                        ))}
                    </select>
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        className="input-field"
                        style={{ width: '200px', padding: '10px 14px', color: '#1e1b4b' }}
                    >
                        <option value="">All Status</option>
                        {['DRAFT', 'REGISTRATION', 'FIXTURES', 'LIVE', 'COMPLETED'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Tournament grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', fontSize: '20px' }}>⏳ Loading tournaments...</div>
                ) : tournaments.length === 0 ? (
                    <div style={{
                        padding: '60px', borderRadius: '20px', background: 'white',
                        border: '1px solid #f1f5f9', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏟️</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>No tournaments found</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
                            {isTeamManager
                                ? 'No tournaments available to apply for yet. Check back soon!'
                                : 'Try adjusting your filters or create a new tournament'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                        {tournaments.map((t: any) => {
                            const hasApplied = appliedIds.has(t.id);
                            const canApply = isTeamManager && t.status === 'REGISTRATION' && !hasApplied;

                            return (
                                <div key={t.id} className="card-hover" style={{
                                    padding: '28px', borderRadius: '18px', background: 'white',
                                    border: `1px solid ${hasApplied ? '#bbf7d0' : '#f1f5f9'}`, color: 'inherit',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                                }}>
                                    <Link href={`/tournaments/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '14px',
                                                background: `${t.sport?.accentColor || '#6366f1'}15`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '24px',
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
                                        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px', color: '#1e1b4b' }}>{t.name}</h3>
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

                                    {/* Team Manager: Apply button */}
                                    {isTeamManager && (
                                        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                                            {hasApplied ? (
                                                <div style={{
                                                    padding: '10px 16px', borderRadius: '10px',
                                                    background: '#f0fdf4', color: '#16a34a',
                                                    fontSize: '13px', fontWeight: 700, textAlign: 'center',
                                                }}>
                                                    ✅ Application Submitted
                                                </div>
                                            ) : canApply ? (
                                                <button
                                                    onClick={() => handleApply(t.id, t.name)}
                                                    style={{
                                                        width: '100%', padding: '10px 16px', borderRadius: '10px',
                                                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                                        color: 'white', border: 'none', cursor: 'pointer',
                                                        fontSize: '13px', fontWeight: 700,
                                                    }}
                                                >
                                                    📝 Apply with Team
                                                </button>
                                            ) : (
                                                <div style={{
                                                    padding: '10px 16px', borderRadius: '10px',
                                                    background: '#f1f5f9', color: '#94a3b8',
                                                    fontSize: '13px', fontWeight: 600, textAlign: 'center',
                                                }}>
                                                    {t.status === 'COMPLETED' ? '🏁 Tournament Ended' :
                                                        t.status === 'LIVE' ? '🔴 In Progress' :
                                                            '🔒 Registration Not Open'}
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

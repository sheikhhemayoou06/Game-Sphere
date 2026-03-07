'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { sportIcons, defaultSportConfig, sportConfig, statusColors, formatDate } from '@/lib/utils';
import SportIcon from '@/components/SportIcon';

export default function TournamentProfile() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [tournament, setTournament] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const isOrganizer = user?.id === tournament?.organizerId;
    const config = tournament?.sport?.name ? (sportConfig[tournament.sport.name] || defaultSportConfig) : defaultSportConfig;
    const sportEmoji = <SportIcon sport={tournament?.sport?.name || 'Athletics'} size={24} color="currentColor" />;

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        Promise.all([
            api.getTournament(id as string),
            api.getTournamentStats(id as string)
        ]).then(([t, s]) => {
            setTournament(t);
            setStats(s);
        }).finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 2s infinite' }}>🏆</div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading profile...</div>
            </div>
        </div>
    );

    if (!tournament) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <div style={{ textAlign: 'center', color: '#e2e8f0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
                <h2>Tournament not found</h2>
                <Link href="/tournaments" style={{ color: '#6366f1', marginTop: '12px', display: 'inline-block' }}>← Back to tournaments</Link>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #0f172a 100%)' }}>
            {/* Header */}
            <nav style={{ padding: '14px 32px', background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(16px)' }}>
                <Link href={`/tournaments/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#e2e8f0', fontSize: '14px' }}>
                    ← Back to Dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{sportEmoji}</span>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>{tournament.name}</span>
                    <span className="status-badge" style={{ background: `${statusColors[tournament.status] || '#6366f1'}20`, color: statusColors[tournament.status] || '#6366f1', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                        {tournament.status}
                    </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Profile details</div>
            </nav>

            <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>Tournament Profile</h1>
                        <p style={{ color: '#94a3b8', fontSize: '15px' }}>Official contact and event information</p>
                    </div>
                </div>

                {/* Profile Overview Stats */}
                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: 'Teams', value: stats?.totalTeams || 0, icon: '👥', color: '#6366f1' },
                        { label: 'Approved', value: stats?.approvedTeams || 0, icon: '✅', color: '#22c55e' },
                        { label: 'Matches', value: stats?.totalMatches || 0, icon: '📅', color: '#f59e0b' },
                        { label: 'Live', value: stats?.liveMatches || 0, icon: '🔴', color: '#ef4444' },
                    ].map(card => (
                        <div key={card.label} style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{card.icon}</div>
                            <div style={{ fontSize: '32px', fontWeight: 900, color: card.color }}>{card.value}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{card.label}</div>
                        </div>
                    ))}
                </div>

                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                    {/* Event Information */}
                    <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h3 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>📋</span> Event Information
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                ['Tournament ID', tournament.id, '#6366f1'],
                                ['Sport', `${sportEmoji} ${tournament.sport?.name}`, '#fff'],
                                ['Format', tournament.format, '#fff'],
                                ['Level', tournament.level, '#fff'],
                                ['Status', tournament.status, statusColors[tournament.status] || '#fff'],
                                ['Venue', tournament.venue || 'TBD', '#fff'],
                                ['Start Date', tournament.startDate ? formatDate(tournament.startDate) : 'Not set', '#fff'],
                                ['End Date', tournament.endDate ? formatDate(tournament.endDate) : 'Not set', '#fff'],
                            ].map(([label, val, color]) => (
                                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>{label}</span>
                                    <span style={{ color: color as string, fontSize: '14px', fontWeight: 700, fontFamily: label === 'Tournament ID' ? 'monospace' : 'inherit' }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Organizer Contact Details */}
                        <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <h3 style={{ color: '#a5b4fc', fontWeight: 800, fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '20px' }}>👤</span> Contact Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>Organizer</span>
                                    <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 700 }}>
                                        {tournament.organizer?.firstName} {tournament.organizer?.lastName}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>Email Address</span>
                                    <a href={`mailto:${tournament.organizer?.email}`} style={{ color: '#818cf8', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                                        {tournament.organizer?.email}
                                    </a>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>Phone Number</span>
                                    {tournament.organizer?.phone ? (
                                        <a href={`tel:${tournament.organizer?.phone}`} style={{ color: '#818cf8', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                                            {tournament.organizer.phone}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>Not provided</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Financial Information */}
                        <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '20px' }}>💰</span> Finances & Limits
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Registration Fee</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>₹{tournament.registrationFee}</div>
                                </div>
                                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Prize Pool</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>₹{tournament.prizePool || 0}</div>
                                </div>
                                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Max Teams</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0' }}>{tournament.maxTeams}</div>
                                </div>
                                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Squad Size</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0' }}>{tournament.squadSize || 15}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

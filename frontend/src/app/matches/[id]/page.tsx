'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { sportIcons, statusColors } from '@/lib/utils';

export default function MatchDetailPage() {
    const { id } = useParams();
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            api.getMatch(id as string).then(setMatch).catch(() => { }).finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '24px' }}>⏳ Loading match...</div>
        </div>
    );

    if (!match) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>Match not found</div>
        </div>
    );

    let score: any = null;
    try {
        score = match.scoreData ? JSON.parse(match.scoreData) : null;
    } catch { /* ignore */ }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <nav style={{
                padding: '16px 32px', background: 'white', borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <span style={{ fontSize: '24px' }}>🌐</span>
                    <span className="gradient-text" style={{ fontSize: '20px', fontWeight: 800 }}>Game Sphere</span>
                </Link>
                <Link href={`/tournaments/${match.tournamentId}`} style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none' }}>
                    ← Back to Tournament
                </Link>
            </nav>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
                {/* Status banner */}
                {match.status === 'LIVE' && (
                    <div style={{
                        padding: '12px 20px', borderRadius: '12px', marginBottom: '24px',
                        background: '#fef2f2', border: '1px solid #fecaca',
                        display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                        <span className="live-pulse"></span>
                        <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '14px' }}>MATCH IS LIVE</span>
                    </div>
                )}

                {/* Scoreboard */}
                <div style={{
                    padding: '48px 40px', borderRadius: '24px', marginBottom: '24px',
                    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                    color: 'white', textAlign: 'center', position: 'relative',
                }}>
                    <div style={{ position: 'absolute', top: '16px', left: '20px', fontSize: '12px', opacity: 0.6 }}>
                        {match.round}
                    </div>
                    <div style={{ position: 'absolute', top: '16px', right: '20px' }}>
                        <span className="status-badge" style={{
                            background: `${statusColors[match.status] || '#6366f1'}30`,
                            color: match.status === 'LIVE' ? '#fca5a5' : 'rgba(255,255,255,0.8)',
                        }}>
                            {match.status === 'LIVE' && <span className="live-pulse"></span>}
                            {match.status}
                        </span>
                    </div>

                    <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>
                        {sportIcons[match.sport?.name] || '🏅'} {match.sport?.name} — {match.tournament?.name}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
                        {/* Home */}
                        <div style={{ flex: '1', textAlign: 'center' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '20px',
                                background: 'rgba(255,255,255,0.1)', margin: '0 auto 12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '32px',
                            }}>
                                {match.homeTeam?.logo || '🏠'}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>{match.homeTeam?.name || 'TBD'}</div>
                        </div>

                        {/* Score */}
                        <div>
                            {score ? (
                                <div style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '4px' }}>
                                    {score.home ?? '-'} : {score.away ?? '-'}
                                </div>
                            ) : (
                                <div style={{ fontSize: '36px', fontWeight: 700, opacity: 0.5 }}>VS</div>
                            )}
                        </div>

                        {/* Away */}
                        <div style={{ flex: '1', textAlign: 'center' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '20px',
                                background: 'rgba(255,255,255,0.1)', margin: '0 auto 12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '32px',
                            }}>
                                {match.awayTeam?.logo || '✈️'}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>{match.awayTeam?.name || 'TBD'}</div>
                        </div>
                    </div>

                    {match.winnerTeam && (
                        <div style={{
                            marginTop: '24px', padding: '10px 20px', borderRadius: '10px',
                            background: 'rgba(16, 185, 129, 0.2)', display: 'inline-block',
                        }}>
                            🏆 Winner: <strong>{match.winnerTeam.name}</strong>
                        </div>
                    )}
                </div>

                {/* Match info */}
                <div style={{
                    padding: '24px', borderRadius: '16px', background: 'white',
                    border: '1px solid #f1f5f9', marginBottom: '24px',
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1e1b4b' }}>Match Info</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '14px' }}>
                        <div>
                            <span style={{ color: '#94a3b8' }}>Sport: </span>
                            <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{match.sport?.name}</span>
                        </div>
                        <div>
                            <span style={{ color: '#94a3b8' }}>Round: </span>
                            <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{match.round || '-'}</span>
                        </div>
                        <div>
                            <span style={{ color: '#94a3b8' }}>Venue: </span>
                            <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{match.venue || '-'}</span>
                        </div>
                        <div>
                            <span style={{ color: '#94a3b8' }}>Scheduled: </span>
                            <span style={{ fontWeight: 600, color: '#1e1b4b' }}>
                                {match.scheduledAt ? new Date(match.scheduledAt).toLocaleString() : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Player stats */}
                {match.playerStats?.length > 0 && (
                    <div style={{
                        padding: '24px', borderRadius: '16px', background: 'white',
                        border: '1px solid #f1f5f9',
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1e1b4b' }}>Player Statistics</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {match.playerStats.map((ps: any) => {
                                let stats: any = {};
                                try { stats = ps.statsData ? JSON.parse(ps.statsData) : {}; } catch { /* ignore */ }
                                return (
                                    <div key={ps.id} style={{
                                        padding: '12px 16px', borderRadius: '10px', background: '#f8fafc',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e1b4b' }}>
                                            {ps.player?.user?.firstName} {ps.player?.user?.lastName}
                                        </span>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                                            {Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

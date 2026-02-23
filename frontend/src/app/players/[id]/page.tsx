'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { sportIcons, formatDate } from '@/lib/utils';

export default function PlayerProfilePage() {
    const { id } = useParams();
    const [player, setPlayer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/profile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
                .then((r) => r.json())
                .then((data) => setPlayer(data))
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '24px' }}>⏳ Loading profile...</div>
        </div>
    );

    const user = player || {};
    const profile = user.player || {};

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
                <Link href="/dashboard" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
                {/* Profile Card */}
                <div style={{
                    padding: '40px', borderRadius: '24px', marginBottom: '28px',
                    background: 'linear-gradient(135deg, #1e1b4b, #4338ca)',
                    color: 'white', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', right: '30px', top: '30px', fontSize: '80px', opacity: 0.1 }}>🏅</div>

                    {/* Avatar */}
                    <div style={{
                        width: '90px', height: '90px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '36px', marginBottom: '20px',
                    }}>
                        {user.firstName?.[0] || '?'}{user.lastName?.[0] || ''}
                    </div>

                    <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px' }}>
                        {user.firstName || 'Player'} {user.lastName || ''}
                    </h1>
                    <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '4px' }}>{user.email}</p>

                    {/* Sports ID Badge */}
                    {profile.sportsId && (
                        <div style={{
                            marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                        }}>
                            <span style={{ fontSize: '16px' }}>🆔</span>
                            <div>
                                <div style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>Universal Sports ID</div>
                                <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '1px' }}>{profile.sportsId}</div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '24px', marginTop: '20px', fontSize: '14px', opacity: 0.8 }}>
                        <span>📍 {profile.city || 'N/A'}, {profile.state || 'N/A'}</span>
                        <span>🏳️ {profile.country || 'India'}</span>
                        <span>🎮 {profile.primarySport || 'Multi-sport'}</span>
                    </div>
                </div>

                {/* Career Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {[
                        { label: 'Total Matches', value: profile.totalMatches || 0, icon: '⚔️', color: '#6366f1' },
                        { label: 'Total Wins', value: profile.totalWins || 0, icon: '🏆', color: '#10b981' },
                        { label: 'Win Rate', value: profile.totalMatches > 0 ? `${Math.round((profile.totalWins / profile.totalMatches) * 100)}%` : '0%', icon: '📊', color: '#f59e0b' },
                    ].map((stat) => (
                        <div key={stat.label} className="card-hover" style={{
                            padding: '28px', borderRadius: '18px', background: 'white',
                            border: '1px solid #f1f5f9', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Bio */}
                {profile.bio && (
                    <div style={{
                        padding: '24px', borderRadius: '16px', background: 'white',
                        border: '1px solid #f1f5f9', marginBottom: '28px',
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#1e1b4b' }}>About</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>{profile.bio}</p>
                    </div>
                )}

                {/* Team memberships */}
                <div style={{
                    padding: '24px', borderRadius: '16px', background: 'white',
                    border: '1px solid #f1f5f9',
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1e1b4b' }}>Team Memberships</h3>
                    {(profile.teamPlayers?.length || 0) === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '40px', marginBottom: '8px' }}>👤</div>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Not part of any team yet</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {profile.teamPlayers?.map((tp: any) => (
                                <div key={tp.id} style={{
                                    padding: '14px 18px', borderRadius: '12px', background: '#f8fafc',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e1b4b' }}>{tp.team?.name}</span>
                                        {tp.role && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b' }}>({tp.role})</span>}
                                    </div>
                                    {tp.jersey && <span style={{ fontSize: '13px', fontWeight: 700, color: '#6366f1' }}>#{tp.jersey}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { sportIcons, statusColors, formatDate } from '@/lib/utils';

export default function AdminPanel() {
    const { user, isAuthenticated, loadFromStorage, logout } = useAuthStore();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [sports, setSports] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [liveMatches, setLiveMatches] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [tab, setTab] = useState('overview');
    const [seeding, setSeeding] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadFromStorage();
        setLoaded(true);
    }, [loadFromStorage]);

    useEffect(() => {
        if (loaded && !isAuthenticated) {
            router.push('/login');
            return;
        }
        if (isAuthenticated) {
            api.getTournaments().then(setTournaments).catch(() => { });
            api.getSports().then(setSports).catch(() => { });
            api.getTeams().then(setTeams).catch(() => { });
            api.getLiveMatches().then(setLiveMatches).catch(() => { });
        }
    }, [loaded, isAuthenticated, router]);

    const handleSeedSports = async () => {
        setSeeding(true);
        try {
            await api.seedSports();
            const updated = await api.getSports();
            setSports(updated);
        } catch (err) {
            console.error('Seed error:', err);
        } finally {
            setSeeding(false);
        }
    };

    if (!loaded || !isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '24px' }}>⏳ Loading...</div>
            </div>
        );
    }

    const tabs = ['overview', 'tournaments', 'sports', 'teams'];

    const liveTournaments = tournaments.filter((t) => t.status === 'LIVE').length;
    const completedTournaments = tournaments.filter((t) => t.status === 'COMPLETED').length;
    const totalRevenue = tournaments.reduce((sum, t) => sum + (t.registrationFee || 0) * (t._count?.teams || 0), 0);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Nav */}
            <nav style={{
                padding: '16px 32px', background: 'white', borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <span style={{ fontSize: '24px' }}>🌐</span>
                    <span className="gradient-text" style={{ fontSize: '20px', fontWeight: 800 }}>Game Sphere</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/dashboard" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none' }}>Dashboard</Link>
                    <span style={{
                        padding: '4px 12px', borderRadius: '8px', background: '#fef3c7',
                        fontSize: '12px', fontWeight: 700, color: '#d97706',
                    }}>ADMIN</span>
                    <button onClick={() => { logout(); router.push('/'); }} style={{
                        padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        background: 'white', cursor: 'pointer', fontSize: '13px',
                    }}>Logout</button>
                </div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e1b4b', marginBottom: '24px', letterSpacing: '-0.5px' }}>
                    ⚡ Admin Panel
                </h1>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'white', borderRadius: '12px', padding: '4px', border: '1px solid #f1f5f9' }}>
                    {tabs.map((t) => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                            background: tab === t ? '#1e1b4b' : 'transparent',
                            color: tab === t ? 'white' : '#64748b',
                            fontWeight: 600, fontSize: '14px', cursor: 'pointer', textTransform: 'capitalize',
                            transition: 'all 0.2s ease',
                        }}>{t}</button>
                    ))}
                </div>

                {/* Overview */}
                {tab === 'overview' && (
                    <>
                        <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                            {[
                                { label: 'Total Tournaments', value: tournaments.length, icon: '🏆', color: '#6366f1' },
                                { label: 'Live Now', value: liveMatches.length, icon: '🔴', color: '#ef4444' },
                                { label: 'Total Teams', value: teams.length, icon: '👥', color: '#10b981' },
                                { label: 'Est. Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: '#f59e0b' },
                            ].map((stat) => (
                                <div key={stat.label} className="card-hover" style={{
                                    padding: '24px', borderRadius: '16px', background: 'white',
                                    border: '1px solid #f1f5f9',
                                }}>
                                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Quick chart placeholder */}
                        <div className="responsive-grid" style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px',
                        }}>
                            <div style={{
                                padding: '28px', borderRadius: '18px', background: 'white',
                                border: '1px solid #f1f5f9',
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1e1b4b' }}>Tournament Status</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {['DRAFT', 'REGISTRATION', 'LIVE', 'COMPLETED'].map((status) => {
                                        const count = tournaments.filter((t) => t.status === status).length;
                                        const pct = tournaments.length > 0 ? (count / tournaments.length) * 100 : 0;
                                        return (
                                            <div key={status}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: 600, color: statusColors[status] || '#64748b' }}>{status}</span>
                                                    <span style={{ color: '#94a3b8' }}>{count}</span>
                                                </div>
                                                <div style={{ height: '8px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden' }}>
                                                    <div style={{
                                                        height: '100%', borderRadius: '4px',
                                                        background: statusColors[status] || '#6366f1',
                                                        width: `${pct}%`, transition: 'width 0.5s ease',
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{
                                padding: '28px', borderRadius: '18px', background: 'white',
                                border: '1px solid #f1f5f9',
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1e1b4b' }}>Sports Distribution</h3>
                                {sports.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>No sports configured yet</p>
                                        <button onClick={handleSeedSports} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }} disabled={seeding}>
                                            {seeding ? '⏳ Seeding...' : '🌱 Seed Sports Data'}
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {sports.map((s: any) => (
                                            <div key={s.id} style={{
                                                padding: '8px 14px', borderRadius: '10px',
                                                background: `${s.accentColor || '#6366f1'}12`,
                                                border: `1px solid ${s.accentColor || '#6366f1'}25`,
                                                fontSize: '13px', fontWeight: 600,
                                                color: s.accentColor || '#6366f1',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                            }}>
                                                <span>{s.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Live matches */}
                        {liveMatches.length > 0 && (
                            <div style={{ marginBottom: '28px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e1b4b' }}>
                                    <span className="live-pulse"></span> Live Right Now
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                    {liveMatches.map((m: any) => (
                                        <Link href={`/matches/${m.id}`} key={m.id} className="card-hover" style={{
                                            padding: '16px', borderRadius: '12px', background: 'white',
                                            border: '2px solid #fecaca', textDecoration: 'none', color: 'inherit',
                                        }}>
                                            <div style={{ fontWeight: 700, fontSize: '14px' }}>{m.homeTeam?.name || 'TBD'} vs {m.awayTeam?.name || 'TBD'}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{m.tournament?.name}</div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Tournaments tab */}
                {tab === 'tournaments' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>All Tournaments</h3>
                            <Link href="/tournaments/create" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                                + Create Tournament
                            </Link>
                        </div>
                        {tournaments.length === 0 ? (
                            <div style={{ padding: '48px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏟️</div>
                                <p style={{ color: '#64748b' }}>No tournaments yet</p>
                            </div>
                        ) : (
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflowX: 'auto' }}>
                                <div style={{ minWidth: '800px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                                <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Tournament</th>
                                                <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Sport</th>
                                                <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Status</th>
                                                <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Teams</th>
                                                <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tournaments.map((t: any) => (
                                                <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}
                                                    onClick={() => router.push(`/tournaments/${t.id}`)}>
                                                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e1b4b' }}>{t.name}</td>
                                                    <td style={{ padding: '14px 18px' }}>
                                                        <span>{sportIcons[t.sport?.name] || '🏅'} {t.sport?.name}</span>
                                                    </td>
                                                    <td style={{ padding: '14px 18px' }}>
                                                        <span className="status-badge" style={{
                                                            background: `${statusColors[t.status] || '#6366f1'}15`,
                                                            color: statusColors[t.status] || '#6366f1',
                                                        }}>{t.status}</span>
                                                    </td>
                                                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{t._count?.teams || 0}</td>
                                                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{t.startDate ? formatDate(t.startDate) : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Sports tab */}
                {tab === 'sports' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>Sports Configuration</h3>
                            <button onClick={handleSeedSports} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }} disabled={seeding}>
                                {seeding ? '⏳ Seeding...' : '🌱 Seed 25 Sports'}
                            </button>
                        </div>
                        {sports.length === 0 ? (
                            <div style={{ padding: '48px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚙️</div>
                                <p style={{ color: '#64748b' }}>No sports configured. Click &quot;Seed Sports&quot; to add 25 sports.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                {sports.map((s: any) => (
                                    <div key={s.id} className="card-hover" style={{
                                        padding: '24px', borderRadius: '16px', background: 'white',
                                        border: `1px solid ${s.accentColor || '#6366f1'}20`,
                                        borderTop: `3px solid ${s.accentColor || '#6366f1'}`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '28px' }}>{s.icon || sportIcons[s.name] || '🏅'}</span>
                                            <h4 style={{ fontSize: '16px', fontWeight: 700, color: s.accentColor || '#1e1b4b' }}>{s.name}</h4>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                                            <div><span style={{ color: '#94a3b8' }}>Team Size:</span> <strong>{s.teamSize}</strong></div>
                                            <div><span style={{ color: '#94a3b8' }}>Max Players:</span> <strong>{s.maxPlayers}</strong></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Teams tab */}
                {tab === 'teams' && (
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b', marginBottom: '20px' }}>All Teams</h3>
                        {teams.length === 0 ? (
                            <div style={{ padding: '48px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
                                <p style={{ color: '#64748b' }}>No teams registered yet</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                {teams.map((t: any) => (
                                    <div key={t.id} className="card-hover" style={{
                                        padding: '24px', borderRadius: '16px', background: 'white',
                                        border: '1px solid #f1f5f9',
                                    }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e1b4b', marginBottom: '8px' }}>{t.name}</h4>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                                            <p>Manager: {t.manager?.firstName} {t.manager?.lastName}</p>
                                            <p style={{ marginTop: '4px' }}>Players: {t._count?.players || 0} • Tournaments: {t._count?.tournaments || 0}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

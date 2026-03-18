'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { sportIcons } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';
import {
    MapPin, Trophy, UserPlus, MessageSquare, BadgeCheck,
    Info, Users, Calendar, BarChart3, Image as ImageIcon,
    Phone, Mail, MessageCircle
} from 'lucide-react';

type TabKey = 'overview' | 'stats' | 'teams';

export default function PlayerProfilePage() {
    const { id } = useParams();
    const [player, setPlayer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [showContactMenu, setShowContactMenu] = useState(false);

    useEffect(() => {
        if (id) {
            const apiUrl = process.env.NODE_ENV === 'development' && typeof window !== 'undefined'
                ? `http://${window.location.hostname}:4000/api` : (process.env.NEXT_PUBLIC_API_URL || '/api');

            fetch(`${apiUrl}/auth/profile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
                .then((r) => r.json())
                .then((data) => setPlayer(data))
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const user = player || {};
    const profile = user.player || {};
    const sportName = profile.primarySport || 'Multi-sport';
    const sportColor = '#1e3a8a';

    const TAB_CONFIG: { key: TabKey; label: string; icon: any }[] = [
        { key: 'overview', label: 'Overview', icon: Info },
        { key: 'stats', label: 'Stats', icon: BarChart3 },
        { key: 'teams', label: 'Teams', icon: Users },
    ];

    const totalMatches = profile.totalMatches || 0;
    const totalWins = profile.totalWins || 0;
    const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
            {/* Header / Navbar */}
            <PageNavbar title="Player Profile" />

            {/* ── Cricbuzz-Style Hero Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                padding: '30px 20px', color: 'white'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            fontSize: '36px', fontWeight: 900, color: 'white',
                            border: '4px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                            {user.firstName?.[0] || '?'}{user.lastName?.[0] || ''}
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                                        {user.firstName || 'Player'} {user.lastName || ''}
                                    </h2>
                                    {user.isVerified && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                                            <BadgeCheck size={12} /> Verified
                                        </div>
                                    )}
                                </div>
                                {profile.sportsId && (
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>
                                        UID: {profile.sportsId}
                                    </div>
                                )}
                                <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 12px 0', maxWidth: '400px', lineHeight: 1.4 }}>
                                    {profile.bio || `${sportName} player. Passionate about sports and always ready for a challenge.`}
                                </p>
                            </div>

                            {/* Interaction buttons */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <UserPlus size={14} /> Follow
                                </button>
                                <div style={{ position: 'relative' }}>
                                    <button onClick={() => setShowContactMenu(!showContactMenu)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MessageSquare size={14} /> Contact
                                    </button>
                                    {showContactMenu && (
                                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#334155', fontWeight: 600, fontSize: '13px', textAlign: 'left', width: '100%' }} className="hover-bg-slate">
                                                <Phone size={14} color="#64748b" /> Phone
                                            </button>
                                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#334155', fontWeight: 600, fontSize: '13px', textAlign: 'left', width: '100%' }} className="hover-bg-slate">
                                                <MessageCircle size={14} color="#64748b" /> Message
                                            </button>
                                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#334155', fontWeight: 600, fontSize: '13px', textAlign: 'left', width: '100%' }} className="hover-bg-slate">
                                                <Mail size={14} color="#64748b" /> Email
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px 24px', fontSize: '13px', color: '#cbd5e1', marginTop: '16px' }}>
                            <div><span style={{ color: '#94a3b8' }}>Sport:</span> <strong style={{ color: 'white' }}>{sportName}</strong></div>
                            <div><span style={{ color: '#94a3b8' }}>Location:</span> <strong style={{ color: 'white' }}>{profile.city || 'N/A'}, {profile.country || 'India'}</strong></div>
                            <div><span style={{ color: '#94a3b8' }}>Email:</span> <strong style={{ color: 'white' }}>{user.email || '—'}</strong></div>
                            <div><span style={{ color: '#94a3b8' }}>Details:</span> <strong style={{ color: 'white' }}>{profile.gender || '—'} • {profile.heightCm ? `${profile.heightCm} cm` : '—'}</strong></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '53px', zIndex: 90, overflowX: 'auto' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'center', minWidth: 'max-content', gap: '4px' }}>
                    {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            style={{
                                padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
                                fontSize: '13px', fontWeight: activeTab === key ? 800 : 600,
                                color: activeTab === key ? sportColor : '#64748b',
                                borderBottom: activeTab === key ? `3px solid ${sportColor}` : '3px solid transparent',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px',
                            }}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div style={{ maxWidth: '1000px', margin: '20px auto 0', padding: '0 20px' }}>

                {/* ═══════ OVERVIEW TAB ═══════ */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                        {/* Summary Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'Matches', val: totalMatches },
                                { label: 'Won', val: totalWins, color: sportColor },
                                { label: 'Win Rate', val: `${winRate}%`, color: sportColor },
                            ].map((stat, i) => (
                                <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', fontWeight: 900, color: stat.color || '#0f172a', lineHeight: 1 }}>{stat.val}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '6px' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Personal Info */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Personal Info</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {[
                                    { icon: <Phone size={14} />, label: 'Phone', value: user.phone ? `+${user.countryCode || '91'} ${user.phone}` : '—' },
                                    { icon: <Mail size={14} />, label: 'Email', value: user.email || '—' },
                                    { icon: <MapPin size={14} />, label: 'Location', value: `${profile.district || '—'}, ${profile.state || '—'}, ${profile.country || 'India'}` },
                                    { icon: <Trophy size={14} />, label: 'Primary Sport', value: sportName },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                                        <span style={{ color: '#94a3b8' }}>{item.icon}</span>
                                        <span style={{ fontSize: '13px', color: '#94a3b8', width: '100px' }}>{item.label}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Matches */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Recent Matches</h3>
                            <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No recent matches.</p>
                        </div>
                    </div>
                )}

                {/* ═══════ STATS TAB ═══════ */}
                {activeTab === 'stats' && (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Career Statistics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                                {[
                                    { label: 'Total Matches', val: totalMatches },
                                    { label: 'Total Wins', val: totalWins },
                                    { label: 'Win Rate', val: `${winRate}%` },
                                ].map((s, i) => (
                                    <div key={i} style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '28px', fontWeight: 900, color: sportColor }}>{s.val}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════ TEAMS TAB ═══════ */}
                {activeTab === 'teams' && (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Team Memberships</h3>
                        {(profile.teamPlayers?.length || 0) === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <Users size={40} color="#cbd5e1" />
                                <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '12px' }}>Not part of any team yet</p>
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
                                        {tp.jersey && <span style={{ fontSize: '13px', fontWeight: 700, color: sportColor }}>#{tp.jersey}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .hover-bg-slate:hover { background-color: #f8fafc !important; }
                @media (max-width: 768px) { .responsive-grid { grid-template-columns: 1fr !important; } }
            `}</style>
        </div>
    );
}

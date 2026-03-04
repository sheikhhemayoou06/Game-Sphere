'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import SmartSearch from '@/components/SmartSearch';

export default function ExplorePage() {
    const [sports, setSports] = useState<any[]>([]);
    const [activeSportId, setActiveSportId] = useState<string>('ALL');
    const [activeTab, setActiveTab] = useState<'LIVE_MATCHES' | 'TOURNAMENTS' | 'FIXTURES' | 'AUCTIONS' | 'PLAYERS'>('LIVE_MATCHES');

    const [tournaments, setTournaments] = useState<any[]>([]);
    const [liveMatches, setLiveMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const fetchedSports = await api.getSports();
                setSports([{ id: 'ALL', name: 'All Sports', icon: '🌐' }, ...fetchedSports]);

                const [tourns, matches] = await Promise.all([
                    api.getTournaments(),
                    api.getLiveMatches()
                ]);
                setTournaments(tourns);
                setLiveMatches(matches);
            } catch (err) {
                console.error("Failed to load explore data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const filteredTournaments = activeSportId === 'ALL'
        ? tournaments
        : tournaments.filter(t => t.sportId === activeSportId);

    const filteredLiveMatches = activeSportId === 'ALL'
        ? liveMatches
        : liveMatches.filter(m => m.tournament?.sportId === activeSportId);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
            {/* Header */}
            <div style={{ background: '#1e1b4b', padding: '24px 40px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <Link href="/home" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none', fontSize: '14px', marginBottom: '8px', display: 'inline-block' }}>
                            ← Back to Home
                        </Link>
                        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Global Fan Portal</h1>
                        <p style={{ color: '#94a3b8', marginTop: '4px' }}>Explore live scores, tournaments, auctions and player stats across India.</p>
                    </div>

                    {/* Universal Search Bar */}
                    <div style={{ position: 'relative', minWidth: '350px', flex: '1', maxWidth: '500px' }}>
                        <SmartSearch activeSportId={activeSportId} />
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', marginTop: '32px' }}>
                {/* Global Sport Filter */}
                <div style={{ overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', minWidth: 'min-content' }}>
                        {sports.map((sport) => (
                            <button
                                key={sport.id}
                                onClick={() => setActiveSportId(sport.id)}
                                style={{
                                    padding: '12px 20px', borderRadius: '16px', whiteSpace: 'nowrap',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    fontWeight: activeSportId === sport.id ? 700 : 500,
                                    fontSize: '15px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                    background: activeSportId === sport.id ? '#4f46e5' : 'white',
                                    color: activeSportId === sport.id ? 'white' : '#64748b',
                                    boxShadow: activeSportId === sport.id ? '0 8px 16px rgba(79,70,229,0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{sport.icon || '🏆'}</span>
                                {sport.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Tabs */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '32px', overflowX: 'auto' }}>
                    {[
                        { id: 'LIVE_MATCHES', label: '🔴 Live Matches' },
                        { id: 'TOURNAMENTS', label: '🏆 Active Tournaments' },
                        { id: 'FIXTURES', label: '📅 Upcoming Fixtures' },
                        { id: 'AUCTIONS', label: '🔨 Auction Hub' },
                        { id: 'PLAYERS', label: '⭐ Player Stats' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer',
                                fontSize: '15px', fontWeight: 600, whiteSpace: 'nowrap',
                                color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                                borderBottom: activeTab === tab.id ? '3px solid #4f46e5' : '3px solid transparent',
                                marginBottom: '-2px'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading portal data...</div>
                ) : (
                    <div>
                        {activeTab === 'LIVE_MATCHES' && (
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e1b4b', marginBottom: '24px' }}>Live Matches in Progress</h2>
                                {filteredLiveMatches.length === 0 ? (
                                    <div style={{ background: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏟️</div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e1b4b' }}>No live matches right now</h3>
                                        <p style={{ color: '#64748b', marginTop: '8px' }}>Check back later or view upcoming fixtures.</p>
                                    </div>
                                ) : (
                                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                        {filteredLiveMatches.map(match => (
                                            <div key={match.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span className="live-pulse"></span> LIVE
                                                    </span>
                                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{match.tournament?.name}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>
                                                    <div>{match.homeTeam?.name}</div>
                                                    <div style={{ color: '#64748b' }}>vs</div>
                                                    <div>{match.awayTeam?.name}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'TOURNAMENTS' && (
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e1b4b', marginBottom: '24px' }}>Active & Upcoming Tournaments</h2>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                    {filteredTournaments.map(tournament => (
                                        <div key={tournament.id} className="card-hover" style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <span style={{ fontSize: '24px' }}>{sports.find(s => s.id === tournament.sportId)?.icon || '🏆'}</span>
                                                <span className="status-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{tournament.status}</span>
                                            </div>
                                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b', marginBottom: '8px' }}>{tournament.name}</h3>
                                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>{tournament.level} • {tournament.format}</p>

                                            <Link href={`/tournaments/${tournament.id}`} style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '10px', color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                                                View Details
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'FIXTURES' && (
                            <div style={{ background: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📅</div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e1b4b' }}>Upcoming Fixtures List</h3>
                                <p style={{ color: '#64748b', marginTop: '8px' }}>All upcoming matches across select sports will appear here.</p>
                            </div>
                        )}

                        {activeTab === 'AUCTIONS' && (
                            <div style={{ background: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔨</div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e1b4b' }}>Public Auction Hub</h3>
                                <p style={{ color: '#64748b', marginTop: '8px' }}>Watch live bidding wars and see top-sold players across tournaments.</p>
                            </div>
                        )}

                        {activeTab === 'PLAYERS' && (
                            <div style={{ background: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: '40px', marginBottom: '16px' }}>⭐</div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e1b4b' }}>Global Player Statistics</h3>
                                <p style={{ color: '#64748b', marginTop: '8px' }}>Search and explore career stats for every verified player on the platform.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

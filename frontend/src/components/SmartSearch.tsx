'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function SmartSearch({ activeSportId = 'ALL', placeholder = "Search for matches, players, teams...", dark = false }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce search effect
    useEffect(() => {
        const fetchSearch = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults(null);
                return;
            }
            setIsSearching(true);
            try {
                const results = await api.globalSearch(searchQuery, activeSportId);
                
                // Fetch external CricAPI live matches explicitly and filter
                if (activeSportId === 'ALL' || activeSportId === '1') {
                    try {
                        const extRes = await fetch('/api/cricket?endpoint=currentMatches');
                        const extJson = await extRes.json();
                        if (extJson.status === 'success' && extJson.data) {
                            const queryLower = searchQuery.toLowerCase();
                            const matchedExt = extJson.data.filter((m: any) => 
                                m.name?.toLowerCase().includes(queryLower) ||
                                m.teamInfo?.some((t: any) => 
                                    t.name?.toLowerCase().includes(queryLower) || 
                                    t.shortname?.toLowerCase().includes(queryLower)
                                ) ||
                                m.teams?.some((t: string) => t.toLowerCase().includes(queryLower))
                            );
                            
                            if (matchedExt.length > 0) {
                                const mapToInternal = (m: any) => ({
                                    id: m.id,
                                    isExternal: true,
                                    tournament: { name: m.matchType?.toUpperCase() || 'Cricket Match', id: m.id },
                                    sport: { name: 'Cricket', icon: '🏏' },
                                    homeTeam: { name: m.teamInfo?.[0]?.name || m.teams?.[0] || 'Team 1' },
                                    awayTeam: { name: m.teamInfo?.[1]?.name || m.teams?.[1] || 'Team 2' },
                                });
                                
                                const extLive = matchedExt.filter((m: any) => m.matchStarted && !m.matchEnded).map(mapToInternal);
                                const extCompleted = matchedExt.filter((m: any) => m.matchEnded).map(mapToInternal);
                                
                                results.liveMatches = [...extLive, ...(results.liveMatches || [])];
                                results.completedMatches = [...extCompleted, ...(results.completedMatches || [])];
                            }
                        }
                    } catch (e) {
                        console.error('External fetch failed for search:', e);
                    }
                }

                setSearchResults(results);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, activeSportId]);

    return (
        <div style={{ position: 'relative', width: '100%', minWidth: '300px' }}>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', opacity: 0.5 }}>🔍</span>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%', padding: '16px 20px 16px 48px', borderRadius: '12px',
                        border: dark ? '1px solid #e2e8f0' : '1px solid white',
                        background: dark ? '#f1f5f9' : 'white',
                        color: dark ? '#0f172a' : '#0f172a',
                        fontSize: '15px', outline: 'none',
                        transition: 'all 0.2s',
                        boxShadow: dark ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    onFocus={(e) => e.target.style.background = dark ? '#e2e8f0' : 'white'}
                    onBlur={(e) => e.target.style.background = dark ? '#f1f5f9' : 'white'}
                />
                {isSearching && (
                    <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#818cf8' }}>
                        Searching...
                    </span>
                )}
            </div>

            {/* Search Suggestions Dropdown */}
            {searchQuery.trim().length >= 2 && searchResults && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', zIndex: 50,
                    background: 'white', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    border: '1px solid #e2e8f0', color: '#0f172a', maxHeight: '500px', overflowY: 'auto',
                    textAlign: 'left'
                }}>
                    {/* Live Matches Priority */}
                    {searchResults.liveMatches?.length > 0 && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="live-pulse"></span> Live Matches
                            </div>
                            {searchResults.liveMatches.map((m: any) => (
                                <Link key={m.id} 
                                    href={m.isExternal ? `/live-scores?matchId=${m.id}` : `/tournaments/${m.tournament?.id || ''}`} 
                                    onClick={() => { setSearchQuery(''); setSearchResults(null); }} 
                                    style={{ padding: '8px', borderRadius: '8px', background: '#f8fafc', marginBottom: '8px', display: 'block', textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{m.tournament?.name} ({m.sport?.name})</div>
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{m.homeTeam?.name} vs {m.awayTeam?.name}</div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Tournaments */}
                    {searchResults.tournaments?.length > 0 && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Tournaments
                            </div>
                            {searchResults.tournaments.map((t: any) => (
                                <Link key={t.id} href={`/tournaments/${t.id}`} onClick={() => { setSearchQuery(''); setSearchResults(null); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }} className="hover-bg-slate">
                                    <span style={{ fontSize: '20px' }}>{t.sport?.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{t.sport?.name}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Teams */}
                    {searchResults.teams?.length > 0 && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Teams
                            </div>
                            {searchResults.teams.map((t: any) => (
                                <Link key={t.id} href={`/teams/${t.id}`} onClick={() => { setSearchQuery(''); setSearchResults(null); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} className="hover-bg-slate">
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🛡️</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{t.sport?.name}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Players */}
                    {searchResults.players?.length > 0 && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Players
                            </div>
                            {searchResults.players.map((p: any) => (
                                <Link key={p.id} href={`/players/${p.id}`} onClick={() => { setSearchQuery(''); setSearchResults(null); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} className="hover-bg-slate">
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                                        {p.user?.firstName?.[0]}{p.user?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.user?.firstName} {p.user?.lastName}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{p.primarySport}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Completed Matches */}
                    {searchResults.completedMatches?.length > 0 && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Completed Matches
                            </div>
                            {searchResults.completedMatches.map((m: any) => (
                                <Link key={m.id} 
                                    href={m.isExternal ? `/live-scores?matchId=${m.id}` : `/tournaments/${m.tournament?.id || ''}`} 
                                    onClick={() => { setSearchQuery(''); setSearchResults(null); }} 
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }} className="hover-bg-slate">
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>{m.tournament?.name}</div>
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{m.homeTeam?.name} vs {m.awayTeam?.name}</div>
                                    </div>
                                    <div style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>Completed</div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isSearching && searchResults &&
                        searchResults.liveMatches?.length === 0 &&
                        searchResults.tournaments?.length === 0 &&
                        searchResults.teams?.length === 0 &&
                        searchResults.players?.length === 0 &&
                        searchResults.completedMatches?.length === 0 && (
                            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                                No results found for "{searchQuery}"
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}

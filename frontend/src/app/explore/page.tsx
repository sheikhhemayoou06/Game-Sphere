'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';

/* ── Helper: sport icons fallback ── */
const sportIcons: Record<string, string> = {
    Cricket: '🏏', Football: '⚽', Basketball: '🏀', Tennis: '🎾',
    Badminton: '🏸', Hockey: '🏑', Volleyball: '🏐', Baseball: '⚾',
    Swimming: '🏊', Athletics: '🏃', Rugby: '🏉', Golf: '⛳',
    Boxing: '🥊', Wrestling: '🤼', Kabaddi: '🤾',
};

export default function ExplorePage() {
    const { user, isAuthenticated, loadFromStorage } = useAuthStore();
    const { mySportIds, loadMySportIds } = useSportStore();
    const [sports, setSports] = useState<any[]>([]);
    const [activeSportId, setActiveSportId] = useState<string>('ALL');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Expand/collapse states for result sections
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        liveMatches: true, completedMatches: true, tournaments: true, teams: true, players: true,
    });

    useEffect(() => {
        loadFromStorage();
        loadMySportIds();
        setLoaded(true);
    }, []);

    useEffect(() => {
        api.getSports().then((allSports) => {
            setSports([{ id: 'ALL', name: 'All Sports', icon: '🌐' }, ...allSports]);
        }).catch(console.error);
    }, []);

    // Debounce search
    useEffect(() => {
        if (searchQuery.trim().length < 2) { setSearchResults(null); return; }
        const t = setTimeout(async () => {
            setIsSearching(true);
            try {
                const r = await api.globalSearch(searchQuery, activeSportId);
                setSearchResults(r);
            } catch { /* noop */ } finally { setIsSearching(false); }
        }, 350);
        return () => clearTimeout(t);
    }, [searchQuery, activeSportId]);

    const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

    const hasResults = searchResults && (
        (searchResults.liveMatches?.length || 0) +
        (searchResults.completedMatches?.length || 0) +
        (searchResults.tournaments?.length || 0) +
        (searchResults.teams?.length || 0) +
        (searchResults.players?.length || 0)
    ) > 0;

    /** Whether the current player has enrolled for a particular sport */
    const isEnrolled = (sportId: string) => mySportIds.includes(sportId);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* ── Header with Search ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
                padding: '32px 40px 40px', color: 'white',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Link href="/dashboard" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none', fontSize: '14px', marginBottom: '16px', display: 'inline-block' }}>
                        ← Back to Dashboard
                    </Link>
                    <h1 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '6px' }}>🔍 Search Everything</h1>
                    <p style={{ color: '#c7d2fe', fontSize: '15px', marginBottom: '28px' }}>
                        Find live matches, scorecards, teams, players, tournaments &amp; more across every sport.
                    </p>

                    {/* Search Input */}
                    <div style={{ position: 'relative', maxWidth: '720px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search for a match, team, player, or tournament…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%', padding: '18px 50px 18px 52px', borderRadius: '16px',
                                border: '2px solid rgba(165, 180, 252, 0.3)',
                                background: 'rgba(255,255,255,0.08)', color: 'white',
                                fontSize: '16px', fontWeight: 600, outline: 'none',
                                transition: 'all 0.25s',
                                backdropFilter: 'blur(8px)',
                            }}
                            onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.14)'; e.target.style.borderColor = '#818cf8'; }}
                            onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(165, 180, 252, 0.3)'; }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        )}
                        {isSearching && (
                            <span style={{ position: 'absolute', right: searchQuery ? '44px' : '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#a5b4fc', fontWeight: 600 }}>
                                Searching…
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Sport Filter Bar ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
                <div style={{ overflowX: 'auto', padding: '20px 0 8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', minWidth: 'min-content' }}>
                        {sports.map(sport => (
                            <button
                                key={sport.id}
                                onClick={() => setActiveSportId(sport.id)}
                                style={{
                                    padding: '10px 18px', borderRadius: '14px', whiteSpace: 'nowrap',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    fontWeight: activeSportId === sport.id ? 700 : 500,
                                    fontSize: '14px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                    background: activeSportId === sport.id ? '#4f46e5' : 'white',
                                    color: activeSportId === sport.id ? 'white' : '#64748b',
                                    boxShadow: activeSportId === sport.id ? '0 6px 14px rgba(79,70,229,0.3)' : '0 2px 6px rgba(0,0,0,0.05)',
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{sport.icon || sportIcons[sport.name] || '🏅'}</span>
                                {sport.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Results Area ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', paddingBottom: '80px' }}>
                {/* Empty / Idle State */}
                {searchQuery.trim().length < 2 && (
                    <div style={{
                        textAlign: 'center', padding: '80px 20px',
                        background: 'white', borderRadius: '20px', marginTop: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
                    }}>
                        <div style={{ fontSize: '56px', marginBottom: '20px' }}>🌐</div>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e1b4b', marginBottom: '8px' }}>Search the Game Sphere Universe</h2>
                        <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
                            Type at least 2 characters to find live games, scorecards, commentary, any team and its squad, any player and their records, or any tournament with its teams, matches and points.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '32px' }}>
                            {['🔴 Live Matches', '🏆 Tournaments', '🛡️ Teams & Squads', '⭐ Player Records', '📊 Scorecards'].map(tag => (
                                <span key={tag} style={{ padding: '8px 16px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', fontSize: '13px', fontWeight: 600 }}>{tag}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {searchQuery.trim().length >= 2 && !isSearching && searchResults && !hasResults && (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        background: 'white', borderRadius: '20px', marginTop: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>No results for &ldquo;{searchQuery}&rdquo;</h3>
                        <p style={{ color: '#64748b', marginTop: '8px' }}>Try a different keyword or broaden your sport filter.</p>
                    </div>
                )}

                {/* Results Sections */}
                {hasResults && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>

                        {/* ── Live Matches ── */}
                        {searchResults.liveMatches?.length > 0 && (
                            <ResultSection
                                title="🔴 Live Matches" count={searchResults.liveMatches.length}
                                expanded={expandedSections.liveMatches} toggle={() => toggleSection('liveMatches')}
                                accent="#ef4444" accentBg="#fef2f2"
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                    {searchResults.liveMatches.map((m: any) => (
                                        <Link key={m.id} href={`/scoring/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div className="card-hover" style={{
                                                background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: '14px',
                                                padding: '20px', color: 'white', position: 'relative', overflow: 'hidden',
                                            }}>
                                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(239,68,68,0.15)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.15)', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span className="live-pulse"></span> LIVE
                                                    </span>
                                                    <span style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 600 }}>{m.sport?.name}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '16px' }}>
                                                    <span>{m.homeTeam?.name}</span>
                                                    <span style={{ color: '#818cf8', fontSize: '13px' }}>vs</span>
                                                    <span>{m.awayTeam?.name}</span>
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#c7d2fe', marginTop: '10px' }}>{m.tournament?.name}</div>
                                                <div style={{ marginTop: '12px', fontSize: '12px', color: '#a5b4fc', fontWeight: 600 }}>Tap for scorecard & commentary →</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </ResultSection>
                        )}

                        {/* ── Tournaments ── */}
                        {searchResults.tournaments?.length > 0 && (
                            <ResultSection
                                title="🏆 Tournaments" count={searchResults.tournaments.length}
                                expanded={expandedSections.tournaments} toggle={() => toggleSection('tournaments')}
                                accent="#4f46e5" accentBg="#eef2ff"
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                    {searchResults.tournaments.map((t: any) => {
                                        const sportMatch = sports.find(s => s.id === t.sportId);
                                        const enrolled = isEnrolled(t.sportId);
                                        return (
                                            <div key={t.id} className="card-hover" style={{
                                                background: 'white', borderRadius: '14px', padding: '20px',
                                                border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <span style={{ fontSize: '22px' }}>{sportMatch?.icon || sportIcons[t.sport?.name] || '🏆'}</span>
                                                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>{t.status}</span>
                                                </div>
                                                <h3 style={{ fontWeight: 700, fontSize: '16px', color: '#1e1b4b', marginBottom: '4px' }}>{t.name}</h3>
                                                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{t.level} • {t.format} • {t.sport?.name}</p>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <Link href={`/tournaments/${t.id}`} style={{
                                                        flex: 1, textAlign: 'center', padding: '10px', borderRadius: '10px',
                                                        background: '#f1f5f9', color: '#4f46e5', fontWeight: 700, fontSize: '13px',
                                                        textDecoration: 'none',
                                                    }}>
                                                        View Details
                                                    </Link>
                                                    {enrolled && (
                                                        <Link href={`/tournaments/${t.id}/apply`} style={{
                                                            flex: 1, textAlign: 'center', padding: '10px', borderRadius: '10px',
                                                            background: '#4f46e5', color: 'white', fontWeight: 700, fontSize: '13px',
                                                            textDecoration: 'none',
                                                        }}>
                                                            Apply
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ResultSection>
                        )}

                        {/* ── Teams ── */}
                        {searchResults.teams?.length > 0 && (
                            <ResultSection
                                title="🛡️ Teams" count={searchResults.teams.length}
                                expanded={expandedSections.teams} toggle={() => toggleSection('teams')}
                                accent="#0ea5e9" accentBg="#f0f9ff"
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                    {searchResults.teams.map((t: any) => {
                                        const enrolled = isEnrolled(t.sportId);
                                        return (
                                            <div key={t.id} className="card-hover" style={{
                                                background: 'white', borderRadius: '14px', padding: '20px',
                                                border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                                                display: 'flex', flexDirection: 'column', gap: '12px',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <div style={{
                                                        width: '44px', height: '44px', borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '20px', color: 'white', fontWeight: 800,
                                                    }}>
                                                        🛡️
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b' }}>{t.name}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{t.sport?.name}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <Link href={`/teams/${t.id}`} style={{
                                                        flex: 1, textAlign: 'center', padding: '10px', borderRadius: '10px',
                                                        background: '#f0f9ff', color: '#0284c7', fontWeight: 700, fontSize: '13px',
                                                        textDecoration: 'none',
                                                    }}>
                                                        View Squad
                                                    </Link>
                                                    {enrolled && (
                                                        <Link href={`/teams/${t.id}/trials`} style={{
                                                            flex: 1, textAlign: 'center', padding: '10px', borderRadius: '10px',
                                                            background: '#0ea5e9', color: 'white', fontWeight: 700, fontSize: '13px',
                                                            textDecoration: 'none',
                                                        }}>
                                                            Scout / Apply
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ResultSection>
                        )}

                        {/* ── Players ── */}
                        {searchResults.players?.length > 0 && (
                            <ResultSection
                                title="⭐ Players" count={searchResults.players.length}
                                expanded={expandedSections.players} toggle={() => toggleSection('players')}
                                accent="#a855f7" accentBg="#faf5ff"
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                    {searchResults.players.map((p: any) => (
                                        <Link key={p.id} href={`/players/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div className="card-hover" style={{
                                                background: 'white', borderRadius: '14px', padding: '20px',
                                                border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                                                display: 'flex', alignItems: 'center', gap: '14px',
                                            }}>
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: 800, fontSize: '16px',
                                                }}>
                                                    {(p.user?.firstName?.[0] || '')}{(p.user?.lastName?.[0] || '')}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b' }}>
                                                        {p.user?.firstName} {p.user?.lastName}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{p.primarySport || 'Multi-Sport'}</div>
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#a855f7', background: '#faf5ff', padding: '6px 12px', borderRadius: '8px' }}>
                                                    View Records →
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </ResultSection>
                        )}

                        {/* ── Completed Matches ── */}
                        {searchResults.completedMatches?.length > 0 && (
                            <ResultSection
                                title="✅ Completed Matches" count={searchResults.completedMatches.length}
                                expanded={expandedSections.completedMatches} toggle={() => toggleSection('completedMatches')}
                                accent="#22c55e" accentBg="#f0fdf4"
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                    {searchResults.completedMatches.map((m: any) => (
                                        <Link key={m.id} href={`/scoring/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div className="card-hover" style={{
                                                background: 'white', borderRadius: '14px', padding: '20px',
                                                border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{m.tournament?.name}</span>
                                                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', padding: '4px 8px', borderRadius: '6px' }}>Completed</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '16px', color: '#1e1b4b' }}>
                                                    <span>{m.homeTeam?.name}</span>
                                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>vs</span>
                                                    <span>{m.awayTeam?.name}</span>
                                                </div>
                                                <div style={{ marginTop: '12px', fontSize: '12px', color: '#4f46e5', fontWeight: 600 }}>View Scorecard →</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </ResultSection>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Reusable Section Wrapper ── */
function ResultSection({ title, count, expanded, toggle, accent, accentBg, children }: {
    title: string; count: number; expanded: boolean; toggle: () => void;
    accent: string; accentBg: string; children: React.ReactNode;
}) {
    return (
        <div style={{
            background: 'white', borderRadius: '16px',
            border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            overflow: 'hidden',
        }}>
            <button onClick={toggle} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 24px', border: 'none', background: 'transparent', cursor: 'pointer',
                textAlign: 'left',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#1e1b4b' }}>{title}</span>
                    <span style={{
                        fontSize: '12px', fontWeight: 800, padding: '3px 10px', borderRadius: '10px',
                        background: accentBg, color: accent,
                    }}>{count}</span>
                </div>
                {expanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
            </button>
            {expanded && (
                <div style={{ padding: '0 24px 24px' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { Search, X, Play, Heart, MessageCircle, Image, Newspaper, Film, ChevronDown, ChevronUp } from 'lucide-react';

/* ── Sport icon map ── */
const sportIcons: Record<string, string> = {
    Cricket: '🏏', Football: '⚽', Basketball: '🏀', Tennis: '🎾',
    Badminton: '🏸', Hockey: '🏑', Volleyball: '🏐', Baseball: '⚾',
    Swimming: '🏊', Athletics: '🏃', Rugby: '🏉', Golf: '⛳',
    Boxing: '🥊', Wrestling: '🤼', Kabaddi: '🤾',
};

/* ── Explore Feed Mock Data (photos, news, videos) ── */
const FEED_ITEMS = [
    { id: 1, type: 'photo', category: 'Cricket', caption: 'Thrilling knock by Virat – 87* off 49!', likes: 2340, comments: 142, img: '🏏', gradient: 'linear-gradient(135deg, #1e3a5f, #0f172a)', accent: '#3b82f6' },
    { id: 2, type: 'video', category: 'Football', caption: 'Top 10 Goals of the Premier League 2026', likes: 8921, comments: 573, img: '⚽', gradient: 'linear-gradient(135deg, #064e3b, #022c22)', accent: '#10b981' },
    { id: 3, type: 'news', category: 'Basketball', caption: 'India qualifies for FIBA Asia Cup – historic win!', likes: 5610, comments: 398, img: '🏀', gradient: 'linear-gradient(135deg, #7c2d12, #431407)', accent: '#f97316' },
    { id: 4, type: 'photo', category: 'Tennis', caption: 'Sania\'s farewell match – packed stadium', likes: 4200, comments: 287, img: '🎾', gradient: 'linear-gradient(135deg, #713f12, #451a03)', accent: '#eab308' },
    { id: 5, type: 'video', category: 'Cricket', caption: 'IPL 2026 Auction Highlights – Record Bids!', likes: 12000, comments: 890, img: '🏏', gradient: 'linear-gradient(135deg, #4c1d95, #2e1065)', accent: '#a855f7' },
    { id: 6, type: 'news', category: 'Hockey', caption: 'India wins 3rd consecutive Hockey Gold at Asian Games', likes: 6750, comments: 412, img: '🏑', gradient: 'linear-gradient(135deg, #1e40af, #1e3a8a)', accent: '#3b82f6' },
    { id: 7, type: 'photo', category: 'Kabaddi', caption: 'Pro Kabaddi League – Most Electrifying Raid', likes: 3100, comments: 201, img: '🤼', gradient: 'linear-gradient(135deg, #831843, #500724)', accent: '#ec4899' },
    { id: 8, type: 'video', category: 'Football', caption: 'Best Saves Compilation – ISL Season 12', likes: 4580, comments: 267, img: '⚽', gradient: 'linear-gradient(135deg, #14532d, #052e16)', accent: '#22c55e' },
    { id: 9, type: 'news', category: 'Athletics', caption: 'Neeraj Chopra sets new national javelin record!', likes: 9100, comments: 654, img: '🏃', gradient: 'linear-gradient(135deg, #78350f, #451a03)', accent: '#f59e0b' },
    { id: 10, type: 'photo', category: 'Badminton', caption: 'PV Sindhu dominates BWF World Tour Finals', likes: 5430, comments: 321, img: '🏸', gradient: 'linear-gradient(135deg, #881337, #4c0519)', accent: '#f43f5e' },
    { id: 11, type: 'video', category: 'Cricket', caption: 'Behind the Scenes – Team India Dressing Room', likes: 15600, comments: 1230, img: '🏏', gradient: 'linear-gradient(135deg, #0c4a6e, #082f49)', accent: '#0ea5e9' },
    { id: 12, type: 'news', category: 'Boxing', caption: 'Mary Kom Academy announces national scholarship', likes: 7200, comments: 489, img: '🥊', gradient: 'linear-gradient(135deg, #3b0764, #1e1b4b)', accent: '#c084fc' },
    { id: 13, type: 'photo', category: 'Swimming', caption: 'National Aquatics Championship – Opening Ceremony', likes: 2800, comments: 156, img: '🏊', gradient: 'linear-gradient(135deg, #164e63, #083344)', accent: '#06b6d4' },
    { id: 14, type: 'video', category: 'Basketball', caption: 'Slam Dunk Contest Highlights – BFI League', likes: 3900, comments: 230, img: '🏀', gradient: 'linear-gradient(135deg, #9a3412, #7c2d12)', accent: '#fb923c' },
    { id: 15, type: 'news', category: 'Wrestling', caption: 'India wins 5 medals at U-23 World Championships', likes: 6100, comments: 378, img: '🤼', gradient: 'linear-gradient(135deg, #365314, #1a2e05)', accent: '#84cc16' },
];

const TYPE_ICON: Record<string, any> = {
    photo: Image,
    video: Film,
    news: Newspaper,
};

const formatCount = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);

export default function ExplorePage() {
    const { user, loadFromStorage } = useAuthStore();
    const { mySportIds, loadMySportIds } = useSportStore();
    const [sports, setSports] = useState<any[]>([]);
    const [activeSportId, setActiveSportId] = useState<string>('ALL');
    const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'video' | 'news'>('all');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        loadFromStorage();
        loadMySportIds();
    }, []);

    useEffect(() => {
        api.getSports().then((allSports) => {
            setSports([{ id: 'ALL', name: 'All Sports', icon: '🌐' }, ...allSports]);
        }).catch(console.error);
    }, []);

    // Debounced search
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

    const hasResults = searchResults && (
        (searchResults.liveMatches?.length || 0) +
        (searchResults.completedMatches?.length || 0) +
        (searchResults.tournaments?.length || 0) +
        (searchResults.teams?.length || 0) +
        (searchResults.players?.length || 0)
    ) > 0;

    const isEnrolled = (sportId: string) => mySportIds.includes(sportId);

    /* Filter feed by sport + type */
    const filteredFeed = FEED_ITEMS.filter(item => {
        const sportMatch = activeSportId === 'ALL' || item.category === sports.find(s => s.id === activeSportId)?.name;
        const typeMatch = activeFilter === 'all' || item.type === activeFilter;
        return sportMatch && typeMatch;
    });

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa' }}>
            {/* ── Top Bar ── */}
            <div style={{
                background: 'white', borderBottom: '1px solid #e2e8f0',
                padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 50,
            }}>
                <Link href="/dashboard" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
                    ← Dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px' }}>🌐</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg, #4f46e5, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>
                        Explore
                    </span>
                </div>
                <div style={{ width: '80px' }}></div>
            </div>

            {/* ── Centered Search Bar ── */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '36px 20px 20px',
                background: 'linear-gradient(180deg, #f8fafc 0%, #fafafa 100%)',
            }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '560px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search matches, players, teams, tournaments…"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                        onFocus={() => setSearchOpen(true)}
                        style={{
                            width: '100%', padding: '15px 44px 15px 46px', borderRadius: '14px',
                            border: '1.5px solid #e2e8f0', background: '#f1f5f9',
                            fontSize: '15px', fontWeight: 600, color: '#0f172a', outline: 'none',
                            transition: 'all 0.25s',
                        }}
                    />
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setSearchOpen(false); }} style={{
                            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                            background: '#e2e8f0', border: 'none', borderRadius: '50%',
                            width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                        }}>
                            <X size={14} color="#64748b" />
                        </button>
                    )}
                    {isSearching && (
                        <span style={{ position: 'absolute', right: searchQuery ? '46px' : '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#818cf8', fontWeight: 700 }}>
                            Searching…
                        </span>
                    )}

                    {/* ── Search Results Dropdown ── */}
                    {searchOpen && searchQuery.trim().length >= 2 && searchResults && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 60,
                            background: 'white', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                            border: '1px solid #e2e8f0', maxHeight: '420px', overflowY: 'auto',
                        }}>
                            {/* Live Matches */}
                            {searchResults.liveMatches?.length > 0 && (
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="live-pulse"></span> Live Matches
                                    </div>
                                    {searchResults.liveMatches.map((m: any) => (
                                        <Link key={m.id} href={`/scoring/${m.id}`} onClick={() => setSearchOpen(false)} style={{ display: 'block', padding: '10px 8px', borderRadius: '10px', textDecoration: 'none', color: 'inherit' }} className="hover-bg-slate">
                                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>{m.tournament?.name} • {m.sport?.name}</div>
                                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b' }}>{m.homeTeam?.name} vs {m.awayTeam?.name}</div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {/* Tournaments */}
                            {searchResults.tournaments?.length > 0 && (
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', marginBottom: '8px' }}>Tournaments</div>
                                    {searchResults.tournaments.map((t: any) => (
                                        <Link key={t.id} href={`/tournaments/${t.id}`} onClick={() => setSearchOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px', borderRadius: '10px', textDecoration: 'none', color: 'inherit' }} className="hover-bg-slate">
                                            <span style={{ fontSize: '18px' }}>{t.sport?.icon || '🏆'}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b' }}>{t.name}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{t.sport?.name} • {t.status}</div>
                                            </div>
                                            {isEnrolled(t.sportId) && (
                                                <Link href={`/tournaments/${t.id}/apply`} onClick={(e) => e.stopPropagation()} style={{
                                                    marginLeft: 'auto', padding: '6px 14px', borderRadius: '8px',
                                                    background: '#4f46e5', color: 'white', fontWeight: 700, fontSize: '12px',
                                                    textDecoration: 'none',
                                                }}>Apply</Link>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {/* Teams */}
                            {searchResults.teams?.length > 0 && (
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', marginBottom: '8px' }}>Teams</div>
                                    {searchResults.teams.map((t: any) => (
                                        <Link key={t.id} href={`/teams/${t.id}`} onClick={() => setSearchOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px', borderRadius: '10px', textDecoration: 'none', color: 'inherit' }} className="hover-bg-slate">
                                            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🛡️</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b' }}>{t.name}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{t.sport?.name}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {/* Players */}
                            {searchResults.players?.length > 0 && (
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', marginBottom: '8px' }}>Players</div>
                                    {searchResults.players.map((p: any) => (
                                        <Link key={p.id} href={`/players/${p.id}`} onClick={() => setSearchOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px', borderRadius: '10px', textDecoration: 'none', color: 'inherit' }} className="hover-bg-slate">
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                                                {(p.user?.firstName?.[0] || '')}{(p.user?.lastName?.[0] || '')}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b' }}>{p.user?.firstName} {p.user?.lastName}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{p.primarySport || 'Multi-Sport'}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {/* Completed */}
                            {searchResults.completedMatches?.length > 0 && (
                                <div style={{ padding: '12px 16px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', marginBottom: '8px' }}>Completed Matches</div>
                                    {searchResults.completedMatches.map((m: any) => (
                                        <Link key={m.id} href={`/scoring/${m.id}`} onClick={() => setSearchOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', borderRadius: '10px', textDecoration: 'none', color: 'inherit' }} className="hover-bg-slate">
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{m.tournament?.name}</div>
                                                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{m.homeTeam?.name} vs {m.awayTeam?.name}</div>
                                            </div>
                                            <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>Done</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {/* No results */}
                            {!isSearching && !hasResults && (
                                <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                    No results for "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Click-away overlay for search results */}
                {searchOpen && searchQuery.trim().length >= 2 && searchResults && (
                    <div onClick={() => setSearchOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 55 }}></div>
                )}
            </div>



            {/* ── Type Filters (Photo / Video / News) ── */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '8px 20px 20px' }}>
                {([
                    { key: 'all', label: 'All', icon: '✨' },
                    { key: 'photo', label: 'Photos', icon: '📸' },
                    { key: 'video', label: 'Videos', icon: '🎬' },
                    { key: 'news', label: 'News', icon: '📰' },
                ] as const).map(f => (
                    <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{
                        padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                        fontWeight: activeFilter === f.key ? 700 : 500, fontSize: '13px',
                        background: activeFilter === f.key ? '#4f46e5' : 'white',
                        color: activeFilter === f.key ? 'white' : '#64748b',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        <span>{f.icon}</span> {f.label}
                    </button>
                ))}
            </div>

            {/* ── Instagram-Style Grid ── */}
            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px 80px' }}>
                {filteredFeed.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                        <p style={{ fontWeight: 600 }}>No content for this filter yet.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '4px',
                    }}>
                        {filteredFeed.map(item => {
                            const TypeIcon = TYPE_ICON[item.type];
                            return (
                                <div key={item.id} style={{
                                    position: 'relative', aspectRatio: '1', borderRadius: '4px',
                                    overflow: 'hidden', cursor: 'pointer',
                                    background: item.gradient,
                                }} className="card-hover">
                                    {/* Content */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        justifyContent: 'center', padding: '16px', textAlign: 'center',
                                    }}>
                                        <span style={{ fontSize: '42px', marginBottom: '10px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{item.img}</span>
                                        <p style={{
                                            color: 'white', fontSize: '13px', fontWeight: 700,
                                            lineHeight: 1.4, maxWidth: '90%',
                                            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                        }}>
                                            {item.caption}
                                        </p>
                                    </div>

                                    {/* Type Badge */}
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                                        borderRadius: '6px', padding: '4px 8px',
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                    }}>
                                        {item.type === 'video' && <Play size={12} color="white" fill="white" />}
                                        {item.type === 'photo' && <Image size={12} color="white" />}
                                        {item.type === 'news' && <Newspaper size={12} color="white" />}
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'white', textTransform: 'uppercase' }}>{item.type}</span>
                                    </div>

                                    {/* Sport Tag */}
                                    <div style={{
                                        position: 'absolute', top: '10px', left: '10px',
                                        background: item.accent, borderRadius: '6px', padding: '3px 8px',
                                        fontSize: '10px', fontWeight: 800, color: 'white', textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>
                                        {item.category}
                                    </div>

                                    {/* Hover Overlay */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'rgba(0,0,0,0.45)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
                                        opacity: 0, transition: 'opacity 0.2s',
                                    }} className="grid-hover-overlay">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white', fontWeight: 700, fontSize: '14px' }}>
                                            <Heart size={18} fill="white" /> {formatCount(item.likes)}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white', fontWeight: 700, fontSize: '14px' }}>
                                            <MessageCircle size={18} fill="white" /> {formatCount(item.comments)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CSS for hover overlay */}
            <style jsx global>{`
                .card-hover:hover .grid-hover-overlay {
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { sportIcons } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import PageNavbar from '@/components/PageNavbar';
import { 
    Users, Trophy, History, MapPin, Shield, Calendar, ArrowLeft, 
    Info, Search, Play, Image as ImageIcon, Newspaper, ChevronRight,
    Settings, Camera, Edit3, UserPlus, MessageSquare, BarChart3,
    Phone, Mail, MessageCircle, X
} from 'lucide-react';

type TabKey = 'overview' | 'squad' | 'matches' | 'stats' | 'media';

export default function PublicTeamProfilePage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.id as string;
    
    // Auth to determine ownership
    const { user, loadFromStorage } = useAuthStore();

    const [team, setTeam] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showContactMenu, setShowContactMenu] = useState(false);
    const [editForm, setEditForm] = useState({ description: '', coachName: '', captainName: '' });

    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);

    useEffect(() => {
        if (!teamId) return;

        const fetchData = async () => {
            try {
                // 1. Fetch team details
                const teamData = await api.getTeam(teamId);
                setTeam(teamData);

                // 2. Fetch matches involving this team
                const allMatches = await api.getMatches?.().catch(() => []) || [];
                const teamMatches = allMatches.filter((m: any) => 
                    m.homeTeamId === teamId || m.awayTeamId === teamId
                ).sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
                setMatches(teamMatches);

                // 3. Fetch tournaments this team is in
                setTournaments(teamData.tournaments || []);
            } catch (err) {
                console.error("Error fetching team profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [teamId]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!team) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
                <PageNavbar title="Team Profile" />
                <div style={{ textAlign: 'center', padding: '60px', marginTop: '40px', background: 'white', borderRadius: '16px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b' }}>Team Not Found</h2>
                    <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '24px' }}>The team you're looking for doesn't exist or was removed.</p>
                    <button onClick={() => router.back()} style={{
                        padding: '10px 20px', background: '#eef2ff', color: '#4f46e5', 
                        border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer'
                    }}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const roster = team.players || team.roster || [];

    // Ownership Logic: Match user ID with team owner, or check if they are Captain/Admin in the roster
    const isOwner = user && (
        team.managerId === user.id ||
        team.createdById === user.id || 
        team.ownerId === user.id || 
        user.role === 'ADMIN' ||
        roster.some((p: any) => p.userId === user.id && ['CAPTAIN', 'OWNER', 'MANAGER', 'ADMIN'].includes(p.role?.toUpperCase()))
    );

    const sportName = team.sport?.name || 'Cricket'; 
    const sportColor = team.sport?.accentColor || '#1e3a8a'; 
    
    // Categorize Roster
    const categorizedRoster = roster.reduce((acc: any, p: any) => {
        const pos = (p.position || p.role || '').toLowerCase();
        let cat = 'Other';
        if (pos.includes('bat')) cat = 'Batsmen';
        else if (pos.includes('bowl')) cat = 'Bowlers';
        else if (pos.includes('all') || pos.includes('round')) cat = 'All-Rounders';
        else if (pos.includes('keep') || pos.includes('wk') || pos.includes('wicket')) cat = 'Wicket-Keepers';
        // Football fallback
        else if (pos.includes('forward') || pos.includes('strik')) cat = 'Forwards';
        else if (pos.includes('mid')) cat = 'Midfielders';
        else if (pos.includes('def') || pos.includes('back')) cat = 'Defenders';
        else if (pos.includes('goal') || pos.includes('gk')) cat = 'Goalkeepers';

        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    // Derived Stats
    const completedMatches = matches.filter(m => m.winnerTeamId || m.status === 'COMPLETED');
    const upcomingMatches = matches.filter(m => !m.winnerTeamId && m.status !== 'COMPLETED');
    const wins = completedMatches.filter(m => m.winnerTeamId === team.id).length;
    const losses = completedMatches.filter(m => m.winnerTeamId && m.winnerTeamId !== team.id).length;
    
    const recentForm = completedMatches.slice(0, 5).map(m => {
        if (m.winnerTeamId === team.id) return 'W';
        if (m.winnerTeamId) return 'L';
        return 'D';
    });

    const coachStr = team.coach || 'Not Assigned';
    const captainObj = roster.find((p: any) => (p.position || p.role || '').toLowerCase().includes('captain'));
    const captainName = captainObj ? (captainObj.user ? `${captainObj.user.firstName} ${captainObj.user.lastName}` : captainObj.name) : 'Not Assigned';
    const homeGround = team.city || team.district ? `${team.city || team.district} Stadium` : 'Unknown Ground';
    const foundingYear = new Date(team.createdAt || Date.now()).getFullYear();
    const titlesCount = tournaments.filter(t => t.winnerId === team.id).length || 0; 

    // Tabs logic - Settings only visible if isOwner
    const TAB_CONFIG: { key: TabKey; label: string; icon: any }[] = [
        { key: 'overview', label: 'Overview', icon: Info },
        { key: 'squad', label: 'Squad', icon: Users },
        { key: 'matches', label: 'Matches', icon: Calendar },
        { key: 'stats', label: 'Stats', icon: BarChart3 },
        { key: 'media', label: 'Media', icon: ImageIcon },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
            {/* Header / Navbar */}
            <PageNavbar 
                title={isOwner ? "My Profile" : "Team Profile"} 
                rightContent={isOwner && (
                    <button onClick={() => {
                        setEditForm({ description: team.description || '', coachName: coachStr !== 'Not Assigned' ? coachStr : '', captainName: captainName !== 'Not Assigned' ? captainName : '' });
                        setIsEditingProfile(true);
                    }} style={{ background: 'none', color: '#4f46e5', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                        <Settings size={16} /> <span>Settings</span>
                    </button>
                )}
            />

            {/* ── Cricbuzz-Style Hero Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                padding: '30px 20px', color: 'white'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Logo */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '16px', background: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            fontSize: '36px', fontWeight: 900, color: sportColor,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                            {team.logo && team.logo.startsWith('http') ? (
                                <img src={team.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                            ) : (team.sport?.icon || sportIcons[sportName] || team.name.charAt(0))}
                        </div>
                        {isOwner && (
                            <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: '#3b82f6', borderRadius: '50%', padding: '6px', cursor: 'pointer', border: '2px solid #0f172a' }} title="Change Team Logo">
                                <Camera size={14} color="white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>{team.name}</h2>
                                {team.teamCode && (
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>
                                        UID: {team.teamCode}
                                    </div>
                                )}
                                <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 12px 0', maxWidth: '400px', lineHeight: 1.4 }}>
                                    {team.description || `The official profile of ${team.name}. Competing fiercely to bring glory home.`}
                                </p>
                            </div>
                            
                            {/* Interaction buttons */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {!isOwner && (
                                    <>
                                        <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <UserPlus size={14} /> Follow
                                        </button>
                                        <div style={{ position: 'relative' }}>
                                            <button onClick={() => setShowContactMenu(!showContactMenu)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MessageSquare size={14} /> Contact Us
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
                                    </>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px 24px', fontSize: '13px', color: '#cbd5e1', marginTop: '16px' }}>
                            <div><span style={{ color: '#94a3b8' }}>Sport:</span> <strong style={{ color: 'white' }}>{sportName}</strong></div>
                            <div><span style={{ color: '#94a3b8' }}>Captain:</span> <strong style={{ color: 'white' }}>{captainName}</strong></div>
                            <div><span style={{ color: '#94a3b8' }}>Coach:</span> <strong style={{ color: 'white' }}>{coachStr}</strong></div>
                            <div><span style={{ color: '#94a3b8' }}>Details:</span> <strong style={{ color: 'white' }}>Est. {foundingYear} • {homeGround}</strong></div>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'Matches', val: completedMatches.length },
                                { label: 'Won', val: wins, color: sportColor },
                                { label: 'Lost', val: losses, color: sportColor },
                                { label: 'Titles', val: titlesCount, color: sportColor },
                            ].map((stat, i) => (
                                <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', fontWeight: 900, color: stat.color || '#0f172a', lineHeight: 1 }}>{stat.val}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '6px' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Form */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Recent Form</h3>
                            {recentForm.length > 0 ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {recentForm.map((result, i) => (
                                        <div key={i} style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: result === 'W' ? '#16a34a' : result === 'L' ? '#dc2626' : '#94a3b8',
                                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: '13px'
                                        }}>
                                            {result}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ fontSize: '13px', color: '#64748b' }}>No recent matches played.</div>
                            )}
                        </div>

                        {/* About Section */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>About {team.name}</h3>
                            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                                Founded and based out of {homeGround}, {team.name} is a competitive force in the {sportName} circuit. 
                                Guided by coach {coachStr} and led by captain {captainName}, they strive for excellence and sportsmanship 
                                in every tournament they enter. They have built a robust roster of {roster.length} talented players.
                            </p>
                            
                            {/* Achievement timeline mock */}
                            <div style={{ marginTop: '20px', borderLeft: '2px solid #e2e8f0', paddingLeft: '20px' }}>
                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                    <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#d97706', border: '2px solid white' }}></div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>City Champions {foundingYear + 1}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Lifted their very first trophy.</div>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: sportColor, border: '2px solid white' }}></div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Club Established</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{foundingYear}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════ SQUAD TAB ═══════ */}
                {activeTab === 'squad' && (
                    <div>
                        {roster.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <Users size={40} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>No players yet</div>
                                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>This team is currently building its roster.</div>
                            </div>
                        ) : (
                            Object.keys(categorizedRoster).sort().map(category => (
                                <div key={category} style={{ marginBottom: '24px' }}>
                                    <h3 style={{ 
                                        fontSize: '15px', fontWeight: 800, color: sportColor, 
                                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px',
                                        borderBottom: '2px solid #e2e8f0', paddingBottom: '8px'
                                    }}>
                                        {category}
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                        {categorizedRoster[category].map((p: any, i: number) => {
                                            const name = p.user ? `${p.user.firstName} ${p.user.lastName}` : (p.name || 'Unknown');
                                            const isCaptain = (p.position || p.role || '').toLowerCase().includes('captain');
                                            const playerProfileLink = p.userId ? `/players/${p.userId}` : '#';
                                            
                                            return (
                                                <Link href={playerProfileLink} key={i} style={{
                                                    background: 'white', borderRadius: '10px', border: isCaptain ? '1px solid #fde68a' : '1px solid #e2e8f0',
                                                    padding: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)', textDecoration: 'none'
                                                }} className={`card-hover ${isCaptain ? "bg-amber-50" : ""}`}>
                                                    <div style={{
                                                        width: '50px', height: '50px', borderRadius: '50%', background: '#f1f5f9',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', overflow: 'hidden'
                                                    }}>
                                                        👤
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            {name} {isCaptain && <span style={{ fontSize: '10px', background: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>C</span>}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{p.position || category.slice(0, -1)}</div>
                                                    </div>
                                                    <ChevronRight size={16} color="#cbd5e1" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ═══════ MATCHES TAB ═══════ */}
                {activeTab === 'matches' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Upcoming Matches */}
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Upcoming Fixtures</h3>
                            {upcomingMatches.length === 0 ? (
                                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#64748b' }}>No upcoming matches scheduled.</div>
                            ) : (
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {upcomingMatches.map((m, i) => (
                                        <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>{m.tournament?.name || 'Friendly'} • {new Date(m.scheduledAt || Date.now()).toLocaleDateString()}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                                                    <span style={{ fontSize: '15px', fontWeight: m.homeTeamId === team.id ? 800 : 600 }}>{m.homeTeam?.name || 'TBD'}</span>
                                                    <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 800, color: '#64748b' }}>VS</span>
                                                    <span style={{ fontSize: '15px', fontWeight: m.awayTeamId === team.id ? 800 : 600 }}>{m.awayTeam?.name || 'TBD'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Results */}
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Recent Results</h3>
                            {completedMatches.length === 0 ? (
                                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#64748b' }}>No match results available.</div>
                            ) : (
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {completedMatches.map((m, i) => {
                                        const isWin = m.winnerTeamId === team.id;
                                        const isDraw = !m.winnerTeamId;
                                        return (
                                            <Link href={`/scoring/${m.id}`} key={i} style={{ textDecoration: 'none', color: 'inherit', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }} className="hover-bg-slate">
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
                                                        {m.tournament?.name || 'Friendly'} • {new Date(m.scheduledAt || Date.now()).toLocaleDateString()}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <span style={{ fontSize: '15px', fontWeight: m.homeTeamId === team.id ? 800 : 600, color: m.winnerTeamId === m.homeTeamId ? '#16a34a' : '#0f172a' }}>{m.homeTeam?.name}</span>
                                                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8' }}>{m.scoreData || 'v'}</span>
                                                        <span style={{ fontSize: '15px', fontWeight: m.awayTeamId === team.id ? 800 : 600, color: m.winnerTeamId === m.awayTeamId ? '#16a34a' : '#0f172a' }}>{m.awayTeam?.name}</span>
                                                    </div>
                                                    <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '8px', color: isWin ? '#16a34a' : isDraw ? '#64748b' : '#dc2626' }}>
                                                        {isWin ? `${team.name} won` : isDraw ? 'Match Drawn' : `${m.winnerTeamId === m.homeTeamId ? m.homeTeam?.name : m.awayTeam?.name} won`}
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} color="#cbd5e1" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════ STATS TAB ═══════ */}
                {activeTab === 'stats' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {[
                            { title: 'Leading Run Scorers', unit: 'Runs', data: [{ n: 'V. Kohli', v: 432 }, { n: 'R. Sharma', v: 389 }, { n: 'S. Gill', v: 310 }] },
                            { title: 'Leading Wicket Takers', unit: 'Wkts', data: [{ n: 'J. Bumrah', v: 18 }, { n: 'M. Shami', v: 15 }, { n: 'K. Yadav', v: 12 }] },
                            { title: 'Highest Strike Rate', unit: 'SR', data: [{ n: 'S. Yadav', v: '185.4' }, { n: 'H. Pandya', v: '162.1' }] }
                        ].map((board, i) => (
                            <div key={i} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ background: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{board.title}</div>
                                <div>
                                    {board.data.map((row, j) => (
                                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: j < board.data.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: '14px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <span style={{ color: '#94a3b8', fontWeight: 700, width: '16px' }}>{j + 1}</span>
                                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{row.n}</span>
                                            </div>
                                            <div style={{ fontWeight: 800, color: sportColor }}>{row.v} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{board.unit}</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ═══════ MEDIA TAB ═══════ */}
                {activeTab === 'media' && (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {/* Highlights Grid Mock */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            {[1, 2].map(i => (
                                <div key={i} className="card-hover" style={{
                                    height: '120px', borderRadius: '12px', 
                                    background: `linear-gradient(135deg, ${sportColor}, #0f172a)`,
                                    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}>
                                    <Play size={28} color="white" fill="white" style={{ opacity: 0.8 }} />
                                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '10px', color: 'white', fontWeight: 700, background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>Highlights</span>
                                        <span style={{ fontSize: '10px', color: 'white', fontWeight: 700, background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>2:14</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Posts / News Feed */}
                        {[
                            { title: `${team.name} announces new coaching staff for the upcoming season`, time: '2 hours ago' },
                            { title: `Captain ${captainName} speaks on the preparation ahead of the big tournament`, time: '1 day ago' },
                            { title: `Victory Parade photos posted`, time: '3 days ago' },
                        ].map((news, i) => (
                            <div key={i} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', gap: '16px', cursor: 'pointer' }} className="card-hover">
                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <ImageIcon size={24} color="#94a3b8" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.4 }}>{news.title}</h4>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{news.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* ── Edit Profile Modal ── */}
            {isEditingProfile && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setIsEditingProfile(false)}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Settings</h3>
                            <button onClick={() => setIsEditingProfile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Coach Name</label>
                                <input value={editForm.coachName} onChange={e => setEditForm({ ...editForm, coachName: e.target.value })} type="text" placeholder="e.g. John Doe" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Captain Name</label>
                                <input value={editForm.captainName} onChange={e => setEditForm({ ...editForm, captainName: e.target.value })} type="text" placeholder="e.g. Jane Smith" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Bio / Description</label>
                                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={4} placeholder="Write a short bio for the team..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}></textarea>
                            </div>
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
                            <button onClick={() => setIsEditingProfile(false)} style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={async () => {
                                // Update team
                                try {
                                    // Normally you'd submit coachName/captainName here. We update description.
                                    await api.updateTeam(teamId, { description: editForm.description });
                                    setTeam({ ...team, description: editForm.description });
                                    setIsEditingProfile(false);
                                } catch (e) { console.error('Failed to update team'); }
                            }} style={{ background: sportColor, color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx global>{`
                .hover-bg-slate:hover { background-color: #f8fafc !important; }
                .card-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.2s; }
            `}</style>
        </div>
    );
}

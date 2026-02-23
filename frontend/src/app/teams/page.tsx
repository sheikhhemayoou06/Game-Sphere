'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore, useSportStore } from '@/lib/store';
import { api } from '@/lib/api';
import { sportIcons, sportColors, sportConfig, defaultSportConfig } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════
   ROLE DETECTION
   ═══════════════════════════════════════════════════════════════ */

type RoleView = 'organizer' | 'owner' | 'player';

function getTeamRole(role: string): RoleView {
    if (role === 'ORGANIZER') return 'organizer';
    if (role === 'TEAM_MANAGER') return 'owner';
    return 'player';
}

/* ═══════════════════════════════════════════════════════════════
   SHARED MOCK DATA
   ═══════════════════════════════════════════════════════════════ */

const MY_TEAMS = [
    {
        name: 'Thunder Warriors', sport: 'Cricket', sportIcon: '🏏', logo: '⚡', color: '#f59e0b',
        captain: 'Vikram Singh', coach: 'Raj Malhotra', wins: 12, losses: 3,
        roster: [
            { name: 'Arjun Patel', role: 'All-Rounder', online: true },
            { name: 'Vikram Singh', role: 'Captain / Batsman', online: true },
            { name: 'Kiran Desai', role: 'Fast Bowler', online: false },
            { name: 'Rohit Joshi', role: 'Wicket-Keeper', online: true },
            { name: 'Sanjay Verma', role: 'Spinner', online: false },
            { name: 'Deepak Yadav', role: 'Batsman', online: true },
            { name: 'Mohan Das', role: 'Fast Bowler', online: false },
            { name: 'Anil Kapoor', role: 'All-Rounder', online: true },
        ],
        upcomingMatches: [
            { opponent: 'Royal Strikers', date: '2026-02-25', venue: 'Wankhede Stadium', time: '2:00 PM' },
            { opponent: 'Blazing Eagles', date: '2026-03-02', venue: 'DY Patil Ground', time: '10:00 AM' },
        ],
    },
    {
        name: 'Mumbai Strikers', sport: 'Football', sportIcon: '⚽', logo: '🔥', color: '#16a34a',
        captain: 'Rahul Mehta', coach: 'Fernando Silva', wins: 8, losses: 5,
        roster: [
            { name: 'Rahul Mehta', role: 'Captain / Striker', online: true },
            { name: 'Sunil Chhetri', role: 'Forward', online: true },
            { name: 'Aniket Thapa', role: 'Midfielder', online: false },
            { name: 'Sandesh Jhingan', role: 'Centre-Back', online: true },
            { name: 'Gurpreet Sandhu', role: 'Goalkeeper', online: true },
            { name: 'Ashique KP', role: 'Left Winger', online: false },
            { name: 'Brandon Fernandes', role: 'Attacking Mid', online: false },
        ],
        upcomingMatches: [
            { opponent: 'Delhi Dynamos', date: '2026-02-28', venue: 'Jawaharlal Nehru Stadium', time: '6:00 PM' },
            { opponent: 'Kerala Blasters', date: '2026-03-05', venue: 'Salt Lake Stadium', time: '7:30 PM' },
        ],
    },
];

/* ═══════════════════════════════════════════════════════════════
   PLAYER-SPECIFIC DATA
   ═══════════════════════════════════════════════════════════════ */

const BROWSE_TEAMS = [
    { id: 't1', name: 'Royal Strikers', sport: 'Cricket', logo: '👑', color: '#6366f1', openSlots: 3, members: 9, location: 'Mumbai', rating: 4.5 },
    { id: 't2', name: 'Blazing Eagles', sport: 'Football', logo: '🦅', color: '#dc2626', openSlots: 5, members: 11, location: 'Pune', rating: 4.2 },
    { id: 't3', name: 'Golden Lions', sport: 'Cricket', logo: '🦁', color: '#ca8a04', openSlots: 2, members: 10, location: 'Delhi', rating: 4.8 },
    { id: 't4', name: 'Storm Riders', sport: 'Football', logo: '🌊', color: '#0ea5e9', openSlots: 4, members: 8, location: 'Bangalore', rating: 3.9 },
    { id: 't5', name: 'Iron Wolves', sport: 'Kabaddi', logo: '🐺', color: '#64748b', openSlots: 6, members: 7, location: 'Jaipur', rating: 4.1 },
    { id: 't6', name: 'Phoenix Rising', sport: 'Basketball', logo: '🔥', color: '#dc2626', openSlots: 3, members: 10, location: 'Chennai', rating: 4.6 },
];

const MY_APPLICATIONS = [
    { team: 'Golden Lions', sport: 'Cricket', status: 'PENDING', date: '2026-02-20', logo: '🦁', color: '#ca8a04' },
    { team: 'Royal Strikers', sport: 'Cricket', status: 'APPROVED', date: '2026-02-15', logo: '👑', color: '#6366f1' },
    { team: 'Storm Riders', sport: 'Football', status: 'REJECTED', date: '2026-02-10', logo: '🌊', color: '#0ea5e9' },
];

const JOIN_REQUESTS = [
    { team: 'Phoenix Rising', sport: 'Basketball', owner: 'Rahul Mehta', message: 'We are looking for an athletic all-rounder. Your profile impressed us!', logo: '🔥', color: '#dc2626', date: '2026-02-21' },
    { team: 'Iron Wolves', sport: 'Kabaddi', owner: 'Suraj Yadav', message: 'Join us for the upcoming state championship. We need your skills!', logo: '🐺', color: '#64748b', date: '2026-02-19' },
];

/* ═══════════════════════════════════════════════════════════════
   OWNER-SPECIFIC DATA
   ═══════════════════════════════════════════════════════════════ */



const OWNER_ROSTER_CRICKET = [
    { name: 'Vikram Singh', role: 'Captain', position: 'Batsman', matches: 45, runs: 1820, avg: 42.3, rating: 92, online: true, fee: 'PAID' },
    { name: 'Arjun Patel', role: 'Vice-Captain', position: 'All-Rounder', matches: 38, runs: 1240, avg: 36.5, rating: 88, online: true, fee: 'PAID' },
    { name: 'Kiran Desai', role: 'Player', position: 'Fast Bowler', matches: 30, runs: 320, avg: 14.5, rating: 85, online: false, fee: 'PAID' },
    { name: 'Rohit Joshi', role: 'Player', position: 'Wicket-Keeper', matches: 42, runs: 980, avg: 28.8, rating: 83, online: true, fee: 'PENDING' },
    { name: 'Sanjay Verma', role: 'Player', position: 'Spinner', matches: 25, runs: 180, avg: 12.0, rating: 80, online: false, fee: 'PAID' },
    { name: 'Deepak Yadav', role: 'Player', position: 'Batsman', matches: 28, runs: 1100, avg: 39.3, rating: 86, online: true, fee: 'PAID' },
    { name: 'Mohan Das', role: 'Player', position: 'Fast Bowler', matches: 22, runs: 150, avg: 10.7, rating: 78, online: false, fee: 'PENDING' },
    { name: 'Anil Kapoor', role: 'Player', position: 'All-Rounder', matches: 34, runs: 890, avg: 29.7, rating: 82, online: true, fee: 'PAID' },
    { name: 'Sanjay Mishra', role: 'Player', position: 'Spinner', matches: 18, runs: 120, avg: 10.0, rating: 75, online: false, fee: 'PAID' },
    { name: 'Raj Thakur', role: 'Player', position: 'Batsman', matches: 20, runs: 780, avg: 34.8, rating: 81, online: false, fee: 'PENDING' },
    { name: 'Nikhil Sharma', role: 'Player', position: 'Fast Bowler', matches: 15, runs: 90, avg: 9.0, rating: 76, online: true, fee: 'PAID' },
];

const OWNER_ROSTER_FOOTBALL = [
    { name: 'Rahul Mehta', role: 'Captain', position: 'Striker', matches: 52, runs: 38, avg: 0, rating: 91, online: true, fee: 'PAID' },
    { name: 'Sunil Chhetri', role: 'Vice-Captain', position: 'Forward', matches: 48, runs: 32, avg: 0, rating: 89, online: true, fee: 'PAID' },
    { name: 'Aniket Thapa', role: 'Player', position: 'Midfielder', matches: 40, runs: 12, avg: 0, rating: 86, online: false, fee: 'PAID' },
    { name: 'Sandesh Jhingan', role: 'Player', position: 'Centre-Back', matches: 44, runs: 3, avg: 0, rating: 87, online: true, fee: 'PAID' },
    { name: 'Gurpreet Sandhu', role: 'Player', position: 'Goalkeeper', matches: 50, runs: 0, avg: 0, rating: 90, online: true, fee: 'PAID' },
    { name: 'Ashique KP', role: 'Player', position: 'Left Winger', matches: 30, runs: 15, avg: 0, rating: 83, online: false, fee: 'PENDING' },
    { name: 'Lallianzuala', role: 'Player', position: 'Right Back', matches: 35, runs: 4, avg: 0, rating: 82, online: true, fee: 'PAID' },
    { name: 'Brandon Fernandes', role: 'Player', position: 'Attacking Mid', matches: 38, runs: 18, avg: 0, rating: 85, online: false, fee: 'PAID' },
    { name: 'Manvir Singh', role: 'Player', position: 'Striker', matches: 28, runs: 20, avg: 0, rating: 81, online: true, fee: 'PAID' },
    { name: 'Udanta Singh', role: 'Player', position: 'Right Winger', matches: 25, runs: 10, avg: 0, rating: 79, online: false, fee: 'PENDING' },
    { name: 'Sahal Samad', role: 'Player', position: 'Midfielder', matches: 22, runs: 8, avg: 0, rating: 80, online: true, fee: 'PAID' },
];

const SPORT_ROSTERS: Record<string, typeof OWNER_ROSTER_CRICKET> = {
    Cricket: OWNER_ROSTER_CRICKET,
    Football: OWNER_ROSTER_FOOTBALL,
};

const DEFAULT_ROSTER = OWNER_ROSTER_CRICKET;

const INCOMING_APPLICATIONS = [
    { name: 'Ravi Kumar', position: 'Fast Bowler', experience: '3 years', rating: 81, matches: 22, basePrice: 50000, date: '2026-02-21', status: 'NEW', sport: 'Cricket' },
    { name: 'Suresh Menon', position: 'Batsman', experience: '5 years', rating: 87, matches: 40, basePrice: 75000, date: '2026-02-20', status: 'NEW', sport: 'Cricket' },
    { name: 'Prateek Jain', position: 'Spinner', experience: '2 years', rating: 74, matches: 12, basePrice: 30000, date: '2026-02-19', status: 'REVIEWING', sport: 'Cricket' },
    { name: 'Harsh Pandey', position: 'Wicket-Keeper', experience: '4 years', rating: 83, matches: 31, basePrice: 60000, date: '2026-02-18', status: 'NEW', sport: 'Cricket' },
    { name: 'Vikash Singh', position: 'Midfielder', experience: '3 years', rating: 79, matches: 15, basePrice: 35000, date: '2026-02-22', status: 'NEW', sport: 'Football' },
];

const SCOUT_PLAYERS = [
    { name: 'Ajay Rathore', position: 'Batsman', sport: 'Cricket', rating: 89, matches: 52, runs: 2100, location: 'Mumbai', available: true },
    { name: 'Vishal Gupta', position: 'Fast Bowler', sport: 'Cricket', rating: 86, matches: 35, runs: 210, location: 'Delhi', available: true },
    { name: 'Manish Rao', position: 'All-Rounder', sport: 'Cricket', rating: 84, matches: 28, runs: 890, location: 'Pune', available: true },
    { name: 'Tanmay Shah', position: 'Spinner', sport: 'Cricket', rating: 82, matches: 24, runs: 160, location: 'Ahmedabad', available: false },
    { name: 'Gaurav Singh', position: 'Wicket-Keeper', sport: 'Cricket', rating: 80, matches: 20, runs: 580, location: 'Jaipur', available: true },
    { name: 'Rohit Mehra', position: 'Batsman', sport: 'Cricket', rating: 91, matches: 60, runs: 2800, location: 'Bangalore', available: true },
    // Football Scouts
    { name: 'Vikash Singh', position: 'Forward', sport: 'Football', rating: 85, matches: 45, runs: 28, location: 'Kolkata', available: true },
    { name: 'Arjun Das', position: 'Midfielder', sport: 'Football', rating: 82, matches: 30, runs: 12, location: 'Goa', available: true },
    { name: 'Samir Sheikh', position: 'Defender', sport: 'Football', rating: 88, matches: 60, runs: 5, location: 'Kerala', available: true },
    { name: 'Rahul Bose', position: 'Goalkeeper', sport: 'Football', rating: 90, matches: 55, runs: 0, location: 'Mumbai', available: false },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function TeamsPage() {
    const { user } = useAuthStore();
    const { selectedSport, availableSports, setSelectedSport, setAvailableSports, loadSelectedSport } = useSportStore();
    const roleView = getTeamRole(user?.role || 'PLAYER');

    // Player tabs
    const [playerTab, setPlayerTab] = useState<'my' | 'browse' | 'apps' | 'requests'>('my');
    const [search, setSearch] = useState('');
    const [playerTeamIdx, setPlayerTeamIdx] = useState(0);

    const filteredMyTeams = selectedSport ? MY_TEAMS.filter(t => t.sport === selectedSport.name) : MY_TEAMS;
    const filteredBrowseTeams = selectedSport ? BROWSE_TEAMS.filter(t => t.sport === selectedSport.name) : BROWSE_TEAMS;
    const filteredMyApps = selectedSport ? MY_APPLICATIONS.filter(a => a.sport === selectedSport.name) : MY_APPLICATIONS;
    const filteredRequests = selectedSport ? JOIN_REQUESTS.filter(r => r.sport === selectedSport.name) : JOIN_REQUESTS;
    const filteredApps = selectedSport ? INCOMING_APPLICATIONS.filter(a => a.sport === selectedSport.name) : INCOMING_APPLICATIONS;

    const activePlayerTeam = filteredMyTeams[playerTeamIdx] || filteredMyTeams[0];

    // Owner tabs
    const [ownerTab, setOwnerTab] = useState<'roster' | 'applications' | 'scout' | 'settings'>('roster');
    const [scoutSearch, setScoutSearch] = useState('');
    const [posFilter, setPosFilter] = useState('All');
    const [myTeams, setMyTeams] = useState<any[]>([]);
    const activeRoster = SPORT_ROSTERS[selectedSport?.name || ''] || DEFAULT_ROSTER;
    const activeConfig = selectedSport ? (sportConfig[selectedSport.name] || defaultSportConfig) : defaultSportConfig;
    const statCol = activeConfig.stat;

    // Create team form
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [allSports, setAllSports] = useState<any[]>([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamSportId, setNewTeamSportId] = useState('');
    const [newTeamCity, setNewTeamCity] = useState('');
    const [creating, setCreating] = useState(false);

    // Load all sports for team creation dropdown
    useEffect(() => {
        api.getSports().then(setAllSports).catch(() => { });
    }, []);

    // Load MY sports for owner
    const refreshMySports = () => {
        api.getMySports().then((sports) => {
            setAvailableSports(sports);
            if (sports.length > 0) {
                const savedId = loadSelectedSport();
                const saved = sports.find((s: any) => s.id === savedId);
                if (!selectedSport || !sports.find((s: any) => s.id === selectedSport.id)) {
                    setSelectedSport(saved || sports[0]);
                }
            }
        }).catch(() => { });
    };

    useEffect(() => {
        if (roleView === 'owner' || roleView === 'organizer') {
            refreshMySports();
        }
    }, [roleView]);

    // Create team handler
    const handleCreateTeam = async () => {
        if (!newTeamName.trim() || !newTeamSportId) return;
        setCreating(true);
        try {
            await api.createTeam({ name: newTeamName.trim(), sportId: newTeamSportId, city: newTeamCity.trim() || undefined });
            setNewTeamName('');
            setNewTeamSportId('');
            setNewTeamCity('');
            setShowCreateForm(false);
            // Refresh sports and teams
            refreshMySports();
            if (selectedSport?.id) {
                api.getMyTeams(selectedSport.id).then(setMyTeams).catch(() => { });
            }
        } catch (err: any) {
            alert(err.message || 'Failed to create team');
        } finally {
            setCreating(false);
        }
    };

    // Load teams when sport changes
    useEffect(() => {
        if (roleView === 'owner' && selectedSport?.id) {
            api.getMyTeams(selectedSport.id).then(setMyTeams).catch(() => setMyTeams([]));
        }
    }, [selectedSport?.id, roleView]);

    const statusStyle = (s: string) => {
        switch (s) {
            case 'PENDING': case 'NEW': case 'REVIEWING': return { bg: '#422006', color: '#fbbf24' };
            case 'APPROVED': case 'PAID': return { bg: '#052e16', color: '#4ade80' };
            case 'REJECTED': return { bg: '#450a0a', color: '#fca5a5' };
            default: return { bg: '#1e293b', color: '#94a3b8' };
        }
    };

    const filteredScout = SCOUT_PLAYERS.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(scoutSearch.toLowerCase()) || p.location.toLowerCase().includes(scoutSearch.toLowerCase());
        const matchPos = posFilter === 'All' || p.position === posFilter;
        const matchSport = !selectedSport || p.sport === selectedSport.name;
        return matchSearch && matchPos && matchSport;
    });

    /* ═══════════════════════════════════════════════
       ORGANIZER VIEW
       ═══════════════════════════════════════════════ */
    if (roleView === 'organizer') {
        return (
            <div style={{ minHeight: '100vh', background: '#faf5ff' }}>
                <div style={{ background: 'white', borderBottom: '1px solid #e9d5ff', padding: '16px 32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Link href="/dashboard" style={{ color: '#6d28d9', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>← Dashboard</Link>
                            <span style={{ color: '#d4d4d8' }}>|</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, #7c3aed, #7c3aed88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏟️</div>
                                <div>
                                    <span style={{ fontWeight: 800, fontSize: '18px', color: '#1e1b4b' }}>Organiser Hub</span>
                                    <span style={{ fontSize: '12px', color: '#6d28d9', marginLeft: '8px' }}>Manage Registrations</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', padding: '64px', borderRadius: '24px', background: 'white', border: '1px solid #f3e8ff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏟️</div>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1e1b4b', marginBottom: '12px' }}>Team Management for Organisers</h2>
                        <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '500px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
                            As a Tournament Organiser, your team management tools (approvals, squads, transfers) are located within each specific Tournament Dashboard to ensure data isolation.
                        </p>
                        <Link href="/tournaments" style={{
                            padding: '14px 28px', borderRadius: '12px', background: '#7c3aed', color: 'white',
                            fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'inline-block',
                            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                        }}>
                            Go to My Tournaments →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════
       OWNER VIEW (TEAM MANAGER)
       ═══════════════════════════════════════════════ */
    if (roleView === 'owner') {
        return (
            <div style={{ minHeight: '100vh', background: '#faf5ff' }}>
                {/* Header */}
                <div style={{ background: 'white', borderBottom: '1px solid #e9d5ff', padding: '16px 32px' }}>
                    <div className="flex-wrap-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: availableSports.length > 1 ? '12px' : '0', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Link href="/dashboard" style={{ color: '#6d28d9', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>← Dashboard</Link>
                            <span style={{ color: '#d4d4d8' }}>|</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${selectedSport?.accentColor || sportColors[selectedSport?.name || ''] || '#7c3aed'}, ${selectedSport?.accentColor || '#7c3aed'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{selectedSport?.icon || sportIcons[selectedSport?.name || ''] || '🏅'}</div>
                                <div>
                                    <span style={{ fontWeight: 800, fontSize: '18px', color: '#1e1b4b' }}>{myTeams.length > 0 ? myTeams[0].name : 'My Teams'}</span>
                                    <span style={{ fontSize: '12px', color: selectedSport?.accentColor || '#6d28d9', marginLeft: '8px' }}>{selectedSport?.icon || sportIcons[selectedSport?.name || '']} {selectedSport?.name || 'All Sports'}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => setShowCreateForm(!showCreateForm)} style={{
                                padding: '8px 16px', borderRadius: '8px', border: 'none',
                                background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px',
                            }}>+ Create Team</button>
                            <span style={{ padding: '4px 12px', borderRadius: '6px', background: '#ede9fe', color: '#6d28d9', fontSize: '12px', fontWeight: 700 }}>👑 Team Owner</span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{myTeams.length} Team{myTeams.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    {/* Sport Selector Tabs */}
                    {availableSports.length > 1 && (
                        <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '8px' }}>
                            {availableSports.map((sp: any) => {
                                const isActive = selectedSport?.id === sp.id;
                                const accent = sp.accentColor || sportColors[sp.name] || '#7c3aed';
                                return (
                                    <button key={sp.id} onClick={() => setSelectedSport(sp)} style={{
                                        padding: '6px 16px', borderRadius: '8px', cursor: 'pointer',
                                        fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px',
                                        border: isActive ? `2px solid ${accent}` : '1px solid #e9d5ff',
                                        background: isActive ? accent : 'white',
                                        color: isActive ? 'white' : '#1e1b4b',
                                        transition: 'all 0.2s',
                                    }}>
                                        <span>{sp.icon || sportIcons[sp.name] || '🏅'}</span>
                                        {sp.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ─── Create Team Form ─── */}
                {showCreateForm && (
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px 0' }}>
                        <div style={{ padding: '28px', borderRadius: '16px', background: 'white', border: '2px solid #e9d5ff', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px' }}>🏅 Create New Team</h3>
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '6px', textTransform: 'uppercase' as const }}>Team Name *</label>
                                    <input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="e.g. Thunder Warriors"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '6px', textTransform: 'uppercase' as const }}>Sport *</label>
                                    <select value={newTeamSportId} onChange={(e) => setNewTeamSportId(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' as const }}>
                                        <option value="">Select a sport...</option>
                                        {allSports.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '6px', textTransform: 'uppercase' as const }}>City</label>
                                    <input value={newTeamCity} onChange={(e) => setNewTeamCity(e.target.value)} placeholder="e.g. Mumbai"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={handleCreateTeam} disabled={creating || !newTeamName.trim() || !newTeamSportId} style={{
                                    padding: '10px 24px', borderRadius: '10px', border: 'none',
                                    background: (!newTeamName.trim() || !newTeamSportId) ? '#d4d4d8' : '#7c3aed',
                                    color: 'white', fontWeight: 700, cursor: (!newTeamName.trim() || !newTeamSportId) ? 'not-allowed' : 'pointer', fontSize: '14px',
                                }}>{creating ? '⏳ Creating...' : '🚀 Create Team'}</button>
                                <button onClick={() => setShowCreateForm(false)} style={{
                                    padding: '10px 24px', borderRadius: '10px', border: '1px solid #e9d5ff',
                                    background: 'white', color: '#6d28d9', fontWeight: 700, cursor: 'pointer', fontSize: '14px',
                                }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── No Teams Prompt ─── */}
                {myTeams.length === 0 && availableSports.length === 0 && !showCreateForm && (
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' }}>
                        <div style={{ padding: '48px', borderRadius: '16px', background: 'white', border: '1px solid #f3e8ff', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏅</div>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '8px' }}>No teams yet</h2>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Create your first team to get started with multi-sport management!</p>
                            <button onClick={() => setShowCreateForm(true)} style={{
                                padding: '12px 28px', borderRadius: '10px', border: 'none',
                                background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '15px',
                            }}>+ Create Your First Team</button>
                        </div>
                    </div>
                )}

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' }}>
                    {/* Owner Tabs */}
                    <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                        {[
                            { key: 'roster' as const, label: '📋 Roster', badge: activeRoster.length },
                            { key: 'applications' as const, label: '📨 Applications', badge: filteredApps.length },
                            { key: 'scout' as const, label: '🔍 Scout Players', badge: 0 },
                            { key: 'settings' as const, label: '⚙️ Settings', badge: 0 },
                        ].map((t) => (
                            <button key={t.key} onClick={() => setOwnerTab(t.key)} style={{
                                padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                border: ownerTab === t.key ? '2px solid #7c3aed' : '1px solid #e9d5ff',
                                background: ownerTab === t.key ? '#7c3aed' : 'white',
                                color: ownerTab === t.key ? 'white' : '#6d28d9',
                                position: 'relative',
                            }}>
                                {t.label}
                                {t.badge > 0 && (
                                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ─── Roster Tab ─── */}
                    {ownerTab === 'roster' && (
                        <div>
                            {/* Stats Bar */}
                            <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
                                {[
                                    { label: 'Total Players', value: activeRoster.length, icon: '👥', color: '#7c3aed' },
                                    { label: 'Max Roster', value: 16, icon: '📋', color: '#64748b' },
                                    { label: 'Open Slots', value: 16 - activeRoster.length, icon: '🔓', color: '#16a34a' },
                                    { label: 'Fees Paid', value: `${activeRoster.filter(p => p.fee === 'PAID').length}/${activeRoster.length}`, icon: '💳', color: '#f59e0b' },
                                    { label: 'Online Now', value: activeRoster.filter(p => p.online).length, icon: '🟢', color: '#10b981' },
                                ].map((s, i) => (
                                    <div key={i} style={{ padding: '14px', borderRadius: '12px', background: 'white', border: '1px solid #f3e8ff', textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Roster Table */}
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', overflowX: 'auto' }}>
                                <div style={{ minWidth: '800px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 0.5fr 0.5fr 0.4fr 0.4fr 0.35fr 0.4fr 0.5fr', padding: '14px 20px', background: '#faf5ff', fontWeight: 700, fontSize: '12px', color: '#6d28d9', textTransform: 'uppercase' as const }}>
                                        <span>Player</span><span>Position</span><span>Role</span><span>Matches</span><span>{statCol}</span><span>Rating</span><span>Fee</span><span>Actions</span>
                                    </div>
                                    {activeRoster.map((p, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.6fr 0.5fr 0.5fr 0.4fr 0.4fr 0.35fr 0.4fr 0.5fr', padding: '14px 20px', borderTop: '1px solid #f3e8ff', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.online ? '#22c55e' : '#d4d4d8' }} />
                                                <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{p.name}</span>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{p.position}</span>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: p.role === 'Captain' ? '#f59e0b' : p.role === 'Vice-Captain' ? '#7c3aed' : '#64748b' }}>{p.role === 'Captain' ? '👑 ' : p.role === 'Vice-Captain' ? '⭐ ' : ''}{p.role}</span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{p.matches}</span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b' }}>{p.runs}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <div style={{ width: `${p.rating}%`, height: '6px', borderRadius: '3px', background: p.rating >= 85 ? '#22c55e' : p.rating >= 75 ? '#f59e0b' : '#ef4444', maxWidth: '40px' }} />
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>{p.rating}</span>
                                            </div>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', background: statusStyle(p.fee).bg, color: statusStyle(p.fee).color, fontSize: '10px', fontWeight: 700, textAlign: 'center' as const }}>{p.fee}</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {p.role === 'Player' && (
                                                    <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e9d5ff', background: 'white', color: '#6d28d9', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Make Captain</button>
                                                )}
                                                <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Release</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── Applications Tab ─── */}
                    {ownerTab === 'applications' && (
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                                {filteredApps.length} player applications pending review
                            </div>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {filteredApps.map((app, i) => (
                                    <div key={i} className="flex-wrap-mobile" style={{ padding: '20px', borderRadius: '14px', background: 'white', border: '1px solid #f3e8ff', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '16px' }}>{app.name.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '16px', color: '#1e1b4b' }}>{app.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{app.position} • {app.experience} experience</div>
                                                </div>
                                                <span style={{ padding: '3px 10px', borderRadius: '6px', background: statusStyle(app.status).bg, color: statusStyle(app.status).color, fontSize: '11px', fontWeight: 700 }}>{app.status}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                                                <span>🏏 {app.matches} matches</span>
                                                <span>⭐ Rating: {app.rating}</span>
                                                <span>💰 Base: ₹{(app.basePrice / 1000).toFixed(0)}K</span>
                                                <span>📅 Applied: {app.date}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>✓ Accept</button>
                                            <button style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #fecaca', background: 'white', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>✕ Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── Scout Players Tab ─── */}
                    {ownerTab === 'scout' && (
                        <div>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                <input
                                    value={scoutSearch} onChange={(e) => setScoutSearch(e.target.value)}
                                    placeholder="🔍 Search by name or location..."
                                    style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none', background: 'white' }}
                                />
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {activeConfig.positions.map((pos) => (
                                        <button key={pos} onClick={() => setPosFilter(pos)} style={{
                                            padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                            border: posFilter === pos ? '2px solid #7c3aed' : '1px solid #e9d5ff',
                                            background: posFilter === pos ? '#7c3aed' : 'white',
                                            color: posFilter === pos ? 'white' : '#6d28d9',
                                        }}>{pos}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                {filteredScout.map((p, i) => (
                                    <div key={i} style={{ padding: '20px', borderRadius: '14px', background: 'white', border: '1px solid #f3e8ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '15px' }}>{p.name.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b' }}>{p.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{p.position} • {p.location}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                <span>⭐ {p.rating}</span>
                                                <span>{activeConfig.emoji} {p.matches} matches</span>
                                                <span>🏃 {p.runs} {activeConfig.stat.toLowerCase()}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '6px' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: '6px', background: p.available ? '#f0fdf4' : '#fef2f2', color: p.available ? '#16a34a' : '#ef4444', fontSize: '11px', fontWeight: 700 }}>
                                                {p.available ? '✅ Available' : '🔒 Contracted'}
                                            </span>
                                            {p.available && (
                                                <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>📩 Send Invite</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── Settings Tab ─── */}
                    {ownerTab === 'settings' && (
                        <div style={{ maxWidth: '700px' }}>
                            <div style={{ padding: '28px', borderRadius: '16px', background: 'white', border: '1px solid #f3e8ff' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px' }}>⚙️ Team Settings</h3>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {[
                                        { label: 'Team Name', value: myTeams.length > 0 ? myTeams[0].name : 'My Team', type: 'text' },
                                        { label: 'Sport', value: selectedSport?.name || 'All Sports', type: 'select' },
                                        { label: 'Max Roster Size', value: '16', type: 'number' },
                                        { label: 'Registration Fee (₹)', value: '5000', type: 'number' },
                                        { label: 'Home Ground', value: 'Main Stadium', type: 'text' },
                                        { label: 'Team Bio', value: `Premier ${selectedSport?.name?.toLowerCase() || 'sports'} team competing in state-level tournaments.`, type: 'textarea' },
                                    ].map((f, i) => (
                                        <div key={i}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '6px', textTransform: 'uppercase' as const }}>{f.label}</label>
                                            {f.type === 'textarea' ? (
                                                <textarea defaultValue={f.value} rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit' }} />
                                            ) : (
                                                <input type={f.type} defaultValue={f.value} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>💾 Save Changes</button>
                                    <button style={{ padding: '12px 28px', borderRadius: '10px', border: '1px solid #e9d5ff', background: 'white', color: '#6d28d9', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════
       PLAYER VIEW (existing)
       ═══════════════════════════════════════════════ */
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #ede9fe, #f3e8ff, #faf5ff)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', padding: '14px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <span style={{ fontSize: '20px' }}>🌐</span>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: '18px' }}>Game Sphere</span>
                    </Link>
                    <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Dashboard</Link>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 900, background: 'linear-gradient(135deg, #6d28d9, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '6px' }}>⚡ Teams</h1>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Manage your team, apply to new teams, and handle join requests</p>

                {/* Player Tabs */}
                <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {[
                        { key: 'my' as const, label: '🏠 My Team' },
                        { key: 'browse' as const, label: '🔍 Browse Teams' },
                        { key: 'apps' as const, label: '🚀 My Applications', badge: filteredMyApps.filter(a => a.status === 'PENDING').length },
                        { key: 'requests' as const, label: '🤝 Join Requests', badge: filteredRequests.length },
                    ].map((t) => (
                        <button key={t.key} onClick={() => setPlayerTab(t.key)} style={{
                            padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                            border: playerTab === t.key ? '2px solid #7c3aed' : '1px solid #e9d5ff',
                            background: playerTab === t.key ? '#7c3aed' : 'white',
                            color: playerTab === t.key ? 'white' : '#6d28d9',
                            position: 'relative',
                        }}>
                            {t.label}
                            {t.badge && t.badge > 0 ? (
                                <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>
                            ) : null}
                        </button>
                    ))}
                </div>

                {/* Player — My Team */}
                {playerTab === 'my' && (
                    <div>
                        {/* ─── Multi-Sport Team Selector ─── */}
                        {filteredMyTeams.length > 1 && (
                            <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                {filteredMyTeams.map((t, idx) => {
                                    const isActive = playerTeamIdx === idx;
                                    return (
                                        <button key={idx} onClick={() => setPlayerTeamIdx(idx)} style={{
                                            padding: '8px 18px', borderRadius: '10px', cursor: 'pointer',
                                            fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
                                            border: isActive ? `2px solid ${t.color}` : '1px solid #e9d5ff',
                                            background: isActive ? t.color : 'white',
                                            color: isActive ? 'white' : '#1e1b4b',
                                            transition: 'all 0.2s',
                                        }}>
                                            <span>{t.sportIcon}</span>
                                            {t.name}
                                        </button>
                                    );
                                })}
                                <div style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: '10px', background: '#f3e8ff', color: '#6d28d9', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    🏅 Playing {filteredMyTeams.length} Teams
                                </div>
                            </div>
                        )}

                        {activePlayerTeam ? (
                            <>
                                <div style={{ padding: '24px', borderRadius: '16px', background: 'white', border: `2px solid ${activePlayerTeam.color}30`, marginBottom: '20px' }}>
                                    <div className="flex-wrap-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${activePlayerTeam.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{activePlayerTeam.logo}</div>
                                            <div>
                                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e1b4b' }}>{activePlayerTeam.name}</h2>
                                                <div style={{ fontSize: '13px', color: '#64748b' }}>{activePlayerTeam.sportIcon} {activePlayerTeam.sport} • Captain: {activePlayerTeam.captain} • Coach: {activePlayerTeam.coach}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', textAlign: 'center' as const }}>
                                            <div><div style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a' }}>{activePlayerTeam.wins}</div><div style={{ fontSize: '11px', color: '#64748b' }}>Wins</div></div>
                                            <div><div style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444' }}>{activePlayerTeam.losses}</div><div style={{ fontSize: '11px', color: '#64748b' }}>Losses</div></div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#6d28d9', marginBottom: '10px' }}>ROSTER ({activePlayerTeam.roster.length} Players)</div>
                                    <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                        {activePlayerTeam.roster.map((p: any, i: number) => (
                                            <div key={i} style={{ padding: '10px 14px', borderRadius: '10px', background: '#faf5ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.online ? '#22c55e' : '#d4d4d8' }} />
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{p.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{p.role}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#6d28d9', marginBottom: '10px' }}>🗓️ UPCOMING {activePlayerTeam.sport.toUpperCase()} MATCHES</div>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                    {activePlayerTeam.upcomingMatches.map((m: any, i: number) => (
                                        <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'white', border: '1px solid #f3e8ff' }}>
                                            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b' }}>vs {m.opponent}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{activePlayerTeam.sportIcon} {m.date} • ⏰ {m.time}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>🏟️ {m.venue}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                No teams found for {selectedSport?.name || 'this sport'}.
                            </div>
                        )}
                    </div>
                )}

                {/* Player — Browse Teams */}
                {playerTab === 'browse' && (
                    <div>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search teams by name or sport..."
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e9d5ff', fontSize: '14px', marginBottom: '16px', outline: 'none' }} />
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            {filteredBrowseTeams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.sport.toLowerCase().includes(search.toLowerCase())).map((t) => (
                                <div key={t.id} style={{ padding: '20px', borderRadius: '14px', background: 'white', border: `2px solid ${t.color}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${t.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{t.logo}</div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '16px', color: '#1e1b4b' }}>{t.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{t.sport} • {t.location} • ⭐ {t.rating}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>👥 {t.members} members  🟢 {t.openSlots} open slots</div>
                                        </div>
                                    </div>
                                    <button style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Apply to Join</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Player — My Applications */}
                {playerTab === 'apps' && (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {filteredMyApps.map((a, i) => (
                            <div key={i} style={{ padding: '18px', borderRadius: '14px', background: 'white', border: `2px solid ${a.color}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{a.logo}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b' }}>{a.team}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{a.sport} • Applied {a.date}</div>
                                    </div>
                                </div>
                                <span style={{ padding: '6px 16px', borderRadius: '8px', background: statusStyle(a.status).bg, color: statusStyle(a.status).color, fontSize: '12px', fontWeight: 700 }}>{a.status}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Player — Join Requests */}
                {playerTab === 'requests' && (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {filteredRequests.map((r, i) => (
                            <div key={i} style={{ padding: '20px', borderRadius: '14px', background: 'white', border: '1px solid #f3e8ff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{r.logo}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b' }}>{r.team}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{r.sport} • From: {r.owner} • {r.date}</div>
                                    </div>
                                </div>
                                <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#faf5ff', fontSize: '13px', color: '#64748b', marginBottom: '12px', fontStyle: 'italic' }}>"{r.message}"</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>✓ Accept</button>
                                    <button style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #fecaca', background: 'white', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>✕ Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

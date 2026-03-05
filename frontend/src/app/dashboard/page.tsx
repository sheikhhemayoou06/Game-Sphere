'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useSportStore } from '@/lib/store';
import { api } from '@/lib/api';
import { roleLabels, sportIcons, sportColors, formatDate } from '@/lib/utils';
import { Fingerprint, Radio, Users, Shield, ClipboardList, Gamepad2, Scale, Trophy, Medal, IdCard, Siren, Dumbbell, Calendar, MessageSquare, Gavel, CreditCard, Bell, HelpCircle, LayoutGrid, BarChart3, Settings, ShieldCheck, FileText, DollarSign, Upload, Package, Gem, Landmark, Award, ArrowLeftRight, FileCheck, CircleDot, Zap, Pen, Camera, Search as SearchIcon, Menu, X, LogOut, Trash2 } from 'lucide-react';
import SportIcon from '@/components/SportIcon';
import RunningAthleteLoader from '@/components/RunningAthleteLoader';

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA HAS BEEN REMOVED FOR PRODUCTION
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   ROLE DETECTION HELPERS
   ═══════════════════════════════════════════════════════════════ */

type RoleGroup = 'admin' | 'organizer' | 'team_manager' | 'official' | 'player';

function getRoleGroup(role: string): RoleGroup {
    if (['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN'].includes(role)) return 'admin';
    if (role === 'ORGANIZER') return 'organizer';
    if (role === 'TEAM_MANAGER') return 'team_manager';
    if (role === 'OFFICIAL') return 'official';
    return 'player';
}

/* ═══════════════════════════════════════════════════════════════
   ROLE-SPECIFIC CARD SETS
   ═══════════════════════════════════════════════════════════════ */

// ─── PLAYER: Sports-focused, personal experience ───
const PLAYER_CARDS = [
    { href: '/tournaments', label: 'Tournaments', desc: 'Browse & join events', icon: <Trophy size={20} />, gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    { href: '/training', label: 'Training', desc: 'Coaching programs', icon: <Dumbbell size={20} />, gradient: 'linear-gradient(135deg, #115e59, #14b8a6)' },
    { href: '/teams', label: 'My Team', desc: 'Roster & teammates', icon: <Users size={20} />, gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
    { href: '/auction', label: 'Auction', desc: 'Player bidding & drafts', icon: <Gavel size={20} />, gradient: 'linear-gradient(135deg, #92400e, #f59e0b)' },
    { href: '/payments', label: 'Payments', desc: 'Fees & transactions', icon: <CreditCard size={20} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' },
];

// ─── TEAM MANAGER: Team operations, apply for tournaments (no creation) ───
const TEAM_MANAGER_CARDS = [
    { href: '/tournaments', label: 'Tournaments', desc: 'Browse & apply for events', icon: <Trophy size={20} />, gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    { href: '/teams', label: 'My Team', desc: 'Manage roster & squad', icon: <Users size={20} />, gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
    { href: '/auction', label: 'Auction', desc: 'Player bidding & drafts', icon: <Gavel size={20} />, gradient: 'linear-gradient(135deg, #92400e, #f59e0b)' },
    { href: '/transfers', label: 'Transfers', desc: 'Player movement hub', icon: <ArrowLeftRight size={20} />, gradient: 'linear-gradient(135deg, #14532d, #166534)' },
    { href: '/messages', label: 'Messages', desc: 'Communication hub', icon: <MessageSquare size={20} />, gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)' },
    { href: '/payments', label: 'Payments', desc: 'Finance & transactions', icon: <CreditCard size={20} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' },
];

// ─── ORGANIZER: Event management & tournament creation ───
const ORGANIZER_CARDS = [
    { href: '/tournaments', label: 'My Tournaments', desc: 'Create & manage events', icon: <Trophy size={20} />, gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    { href: '/fixtures', label: 'Fixtures', desc: 'Brackets & scheduling', icon: <ClipboardList size={20} />, gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { href: '/scoring', label: 'Live Scoring', desc: 'Score ongoing matches', icon: <Siren size={20} />, gradient: 'linear-gradient(135deg, #991b1b, #dc2626)' },
    { href: '/teams', label: 'Teams', desc: 'Manage all rosters', icon: <Users size={20} />, gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
    { href: '/venues', label: 'Venues', desc: 'Stadiums & facilities', icon: <Landmark size={20} />, gradient: 'linear-gradient(135deg, #166534, #22c55e)' },
    { href: '/sponsorships', label: 'Sponsorships', desc: 'Sponsors & ad revenue', icon: <Gem size={20} />, gradient: 'linear-gradient(135deg, #854d0e, #ca8a04)' },
    { href: '/certificates', label: 'Certificates', desc: 'Award certificates', icon: <Award size={20} />, gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
    { href: '/transfers', label: 'Transfers', desc: 'Player movement hub', icon: <ArrowLeftRight size={20} />, gradient: 'linear-gradient(135deg, #14532d, #166534)' },
    { href: '/leaderboard', label: 'Leaderboard', desc: 'Player rankings', icon: <Medal size={20} />, gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
    { href: '/calendar', label: 'Calendar', desc: 'Event schedule', icon: <Calendar size={20} />, gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' },
    { href: '/messages', label: 'Messages', desc: 'Communication hub', icon: <MessageSquare size={20} />, gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)' },
    { href: '/reports', label: 'Match Reports', desc: 'Reports & protests', icon: <FileText size={20} />, gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { href: '/auction', label: 'Player Auction', desc: 'Run & manage auctions', icon: <Gavel size={20} />, gradient: 'linear-gradient(135deg, #92400e, #f59e0b)' },
    { href: '/payments', label: 'Payments', desc: 'Revenue & payouts', icon: <CreditCard size={20} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' },
    { href: '/notifications', label: 'Notifications', desc: 'Activity alerts', icon: <Bell size={20} />, gradient: 'linear-gradient(135deg, #9f1239, #be123c)' },
    { href: '/help', label: 'Help', desc: 'Support & FAQ', icon: <HelpCircle size={20} />, gradient: 'linear-gradient(135deg, #854d0e, #d97706)' },
];

// ─── OFFICIAL / REFEREE: Match management & rules ───
const OFFICIAL_CARDS = [
    { href: '/scoring', label: 'Live Scoring', desc: 'Score & officiate matches', icon: <Siren size={20} />, gradient: 'linear-gradient(135deg, #991b1b, #dc2626)' },
    { href: '/fixtures', label: 'Fixtures', desc: 'Match assignments', icon: <ClipboardList size={20} />, gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { href: '/tournaments', label: 'Tournaments', desc: 'Assigned events', icon: <Trophy size={20} />, gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    { href: '/reports', label: 'Match Reports', desc: 'File reports & decisions', icon: <Pen size={20} />, gradient: 'linear-gradient(135deg, #0f172a, #334155)' },
    { href: '/grievances', label: 'Grievances', desc: 'Dispute resolution', icon: <Scale size={20} />, gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
    { href: '/teams', label: 'Teams', desc: 'View team rosters', icon: <Users size={20} />, gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
    { href: '/venues', label: 'Venues', desc: 'Match locations', icon: <Landmark size={20} />, gradient: 'linear-gradient(135deg, #166534, #22c55e)' },
    { href: '/calendar', label: 'Match Schedule', desc: 'Your assignments', icon: <Calendar size={20} />, gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' },
    { href: '/leaderboard', label: 'Leaderboard', desc: 'Rankings overview', icon: <Medal size={20} />, gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
    { href: '/profile', label: 'My Profile', desc: 'Official profile', icon: <IdCard size={20} />, gradient: 'linear-gradient(135deg, #3730a3, #4f46e5)' },
    { href: '/payments', label: 'Payments', desc: 'Match fees & payouts', icon: <CreditCard size={20} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' },
    { href: '/messages', label: 'Messages', desc: 'Communication', icon: <MessageSquare size={20} />, gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)' },
    { href: '/notifications', label: 'Notifications', desc: 'Alerts & updates', icon: <Bell size={20} />, gradient: 'linear-gradient(135deg, #9f1239, #be123c)' },
];

// ─── ADMIN: Full platform management ───
const ADMIN_CARDS = [
    { href: '/analytics', label: 'Analytics', desc: 'Platform insights & metrics', icon: <BarChart3 size={20} />, gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)' },
    { href: '/admin', label: 'Admin Panel', desc: 'System management', icon: <Settings size={20} />, gradient: 'linear-gradient(135deg, #0f172a, #1e293b)' },
    { href: '/roles', label: 'Roles & Permissions', desc: 'Access control', icon: <ShieldCheck size={20} />, gradient: 'linear-gradient(135deg, #1e293b, #475569)' },
    { href: '/tournaments', label: 'Tournaments', desc: 'Manage all events', icon: <Trophy size={20} />, gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    { href: '/audit', label: 'Audit Log', desc: 'Activity tracking', icon: <FileText size={20} />, gradient: 'linear-gradient(135deg, #0f172a, #334155)' },
    { href: '/financial', label: 'Financial', desc: 'Revenue & payments', icon: <DollarSign size={20} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)' },
    { href: '/exports', label: 'Reports Center', desc: 'Data export & reports', icon: <Upload size={20} />, gradient: 'linear-gradient(135deg, #065f46, #22c55e)' },
    { href: '/inventory', label: 'Inventory', desc: 'Equipment management', icon: <Package size={20} />, gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
    { href: '/sponsorships', label: 'Sponsorships', desc: 'Sponsors & revenue', icon: <Gem size={20} />, gradient: 'linear-gradient(135deg, #854d0e, #ca8a04)' },
    { href: '/venues', label: 'Venues', desc: 'Stadiums & facilities', icon: <Landmark size={20} />, gradient: 'linear-gradient(135deg, #166534, #22c55e)' },
    { href: '/fixtures', label: 'Fixtures', desc: 'Bracket generation', icon: <ClipboardList size={20} />, gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { href: '/certificates', label: 'Certificates', desc: 'QR-verifiable certs', icon: <Award size={20} />, gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
    { href: '/transfers', label: 'Transfers', desc: 'Player movement', icon: <ArrowLeftRight size={20} />, gradient: 'linear-gradient(135deg, #14532d, #166534)' },
    { href: '/documents', label: 'Documents', desc: 'Paperless verification', icon: <FileCheck size={20} />, gradient: 'linear-gradient(135deg, #581c87, #7e22ce)' },
    { href: '/grievances', label: 'Grievances', desc: 'Dispute resolution', icon: <Scale size={20} />, gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
    { href: '/scoring', label: 'Live Scoring', desc: 'Real-time scoring', icon: <Siren size={20} />, gradient: 'linear-gradient(135deg, #991b1b, #dc2626)' },
    { href: '/leaderboard', label: 'Leaderboard', desc: 'Player rankings', icon: <Medal size={20} />, gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
    { href: '/teams', label: 'All Teams', desc: 'Manage rosters', icon: <Users size={20} />, gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
    { href: '/training', label: 'Training', desc: 'Coaching programs', icon: <Dumbbell size={20} />, gradient: 'linear-gradient(135deg, #115e59, #14b8a6)' },
    { href: '/messages', label: 'Messages', desc: 'Internal chat', icon: <MessageSquare size={20} />, gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)' },
    { href: '/reports', label: 'Match Reports', desc: 'Reports & protests', icon: <FileText size={20} />, gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { href: '/notifications', label: 'Notifications', desc: 'System alerts', icon: <Bell size={20} />, gradient: 'linear-gradient(135deg, #9f1239, #be123c)' },
    { href: '/calendar', label: 'Calendar', desc: 'All events', icon: <Calendar size={20} />, gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' },
    { href: '/media', label: 'Media', desc: 'Photos & videos', icon: <Camera size={20} />, gradient: 'linear-gradient(135deg, #9d174d, #ec4899)' },
    { href: '/auction', label: 'Player Auction', desc: 'Manage all auctions', icon: <Gavel size={20} />, gradient: 'linear-gradient(135deg, #92400e, #f59e0b)' },
    { href: '/payments', label: 'Payments', desc: 'All transactions', icon: <CreditCard size={20} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' },
    { href: '/profile', label: 'Player Profiles', desc: 'View any profile', icon: <IdCard size={20} />, gradient: 'linear-gradient(135deg, #3730a3, #4f46e5)' },
    { href: '/help', label: 'Help', desc: 'Support & FAQ', icon: <HelpCircle size={20} />, gradient: 'linear-gradient(135deg, #854d0e, #d97706)' },
];

import { SPORT_FORMS, FormField } from '@/lib/sportForms';

/* ═══════════════════════════════════════════════════════════════
   ROLE-SPECIFIC THEME CONFIG
   ═══════════════════════════════════════════════════════════════ */

const ROLE_THEMES: Record<RoleGroup, {
    bg: string; navBg: string; navBorder: string; textPrimary: string; textSecondary: string;
    cardBg: string; cardBorder: string; bannerGradient: string; emoji: string;
    sectionTitle: string; quickAccessTitle: string;
    navLinks: { href: string; label: string }[];
    badgeBg: string; badgeText: string;
}> = {
    admin: {
        bg: '#0f172a', navBg: '#1e293b', navBorder: '#334155', textPrimary: '#e2e8f0', textSecondary: '#94a3b8',
        cardBg: '#1e293b', cardBorder: '#334155', bannerGradient: 'linear-gradient(135deg, #0f172a, #1e40af)',
        emoji: '🛡️', sectionTitle: '⚙️ Management Console', quickAccessTitle: 'Platform Administration',
        navLinks: [
            { href: '/analytics', label: 'Analytics' },
            { href: '/admin', label: 'Admin Panel' },
            { href: '/roles', label: 'Roles' },
            { href: '/financial', label: 'Financial' },
            { href: '/audit', label: 'Audit' },
        ],
        badgeBg: '#fef2f2', badgeText: '#dc2626',
    },
    organizer: {
        bg: '#faf5ff', navBg: 'white', navBorder: '#e9d5ff', textPrimary: '#1e1b4b', textSecondary: '#6b21a8',
        cardBg: 'white', cardBorder: '#f3e8ff', bannerGradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
        emoji: '🏟️', sectionTitle: '🏆 Tournament Management', quickAccessTitle: 'Event Operations',
        navLinks: [
            { href: '/tournaments', label: 'Tournaments' },
            { href: '/fixtures', label: 'Fixtures' },
            { href: '/teams', label: 'Teams' },
            { href: '/venues', label: 'Venues' },
            { href: '/financial', label: 'Revenue' },
        ],
        badgeBg: '#ede9fe', badgeText: '#6d28d9',
    },
    team_manager: {
        bg: '#faf5ff', navBg: 'white', navBorder: '#e9d5ff', textPrimary: '#1e1b4b', textSecondary: '#6b21a8',
        cardBg: 'white', cardBorder: '#f3e8ff', bannerGradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        emoji: '⚡', sectionTitle: 'Team Management', quickAccessTitle: 'Team Operations',
        navLinks: [
            { href: '/tournaments', label: 'Tournaments' },
            { href: '/fixtures', label: 'Fixtures' },
            { href: '/teams', label: 'Teams' },
            { href: '/financial', label: 'Revenue' },
        ],
        badgeBg: '#ede9fe', badgeText: '#6d28d9',
    },
    official: {
        bg: '#f0fdf4', navBg: 'white', navBorder: '#bbf7d0', textPrimary: '#14532d', textSecondary: '#166534',
        cardBg: 'white', cardBorder: '#dcfce7', bannerGradient: 'linear-gradient(135deg, #14532d, #16a34a)',
        emoji: '⚖️', sectionTitle: '🏏 Match Operations', quickAccessTitle: 'Officiating Dashboard',
        navLinks: [
            { href: '/scoring', label: 'Live Scoring' },
            { href: '/fixtures', label: 'My Matches' },
            { href: '/reports', label: 'Reports' },
            { href: '/grievances', label: 'Grievances' },
        ],
        badgeBg: '#dcfce7', badgeText: '#15803d',
    },
    player: {
        bg: '#f8fafc', navBg: 'white', navBorder: '#e2e8f0', textPrimary: '#1e1b4b', textSecondary: '#64748b',
        cardBg: 'white', cardBorder: '#f1f5f9', bannerGradient: 'linear-gradient(135deg, #1e1b4b, #4338ca)',
        emoji: '👋', sectionTitle: 'Quick Access', quickAccessTitle: 'Your Sports Hub',
        navLinks: [],
        badgeBg: '#eef2ff', badgeText: '#4338ca',
    },
};

const ROLE_CARDS: Record<RoleGroup, typeof PLAYER_CARDS> = {
    admin: ADMIN_CARDS,
    organizer: ORGANIZER_CARDS,
    team_manager: TEAM_MANAGER_CARDS,
    official: OFFICIAL_CARDS,
    player: PLAYER_CARDS,
};

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
    const { user, isAuthenticated, loadFromStorage, logout } = useAuthStore();
    const { selectedSport, availableSports, setSelectedSport, setAvailableSports, loadSelectedSport, addMySport, loadMySportIds, mySportIds, activeTournament, loadActiveTournament } = useSportStore();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [liveMatches, setLiveMatches] = useState<any[]>([]);
    const [sports, setSports] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [hydratingSports, setHydratingSports] = useState(true);
    const [ownerDashData, setOwnerDashData] = useState<any>(null);
    const [sportLoading, setSportLoading] = useState(false);
    const [showAddSport, setShowAddSport] = useState(false);

    // Dynamic Sport Onboarding Modal State
    const [onboardingSport, setOnboardingSport] = useState<any>(null);
    const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, string>>({});
    const [isSavingSport, setIsSavingSport] = useState(false);
    const [showOrgProfileDetails, setShowOrgProfileDetails] = useState(false);

    // Player Hamburger Menu State
    const [playerMenuOpen, setPlayerMenuOpen] = useState(false);

    const router = useRouter();

    const handleSelectNewSport = (sp: any) => {
        let formFields = SPORT_FORMS[sp.name];

        // If user is a team manager, we override with the team creation form.
        if (user?.role === 'TEAM_MANAGER') {
            formFields = SPORT_FORMS.TEAM_MANAGER;
        }

        if (formFields && formFields.length > 0) {
            // Sport requires specific information, open modal
            const defaults: Record<string, string> = {};
            formFields.forEach(f => {
                if (f.type === 'select' && f.options && f.options.length > 0) {
                    defaults[f.id] = f.options[0];
                } else {
                    defaults[f.id] = '';
                }
            });
            setOnboardingAnswers(defaults);
            setOnboardingSport(sp);
        } else {
            // No specific metadata needed, add instantly
            executeAddSport(sp, {});
        }
    };

    const executeAddSport = async (sp: any, metadata: any) => {
        setIsSavingSport(true);
        try {
            // 1. Send add sport request cleanly using api client
            const sportRes = await api.addMySport(sp.id, metadata).catch((e) => {
                throw new Error(e.message);
            });

            // If the request didn't throw, it was successful.
            // Fallback for context update
            addMySport(sp.id);

            // If the user is a team manager, we also quickly provision their team
            if (user?.role === 'TEAM_MANAGER' && metadata.teamName) {
                console.log("SENDING TEAM SETUP TO BACKEND:", { name: metadata.teamName, sportId: sp.id });
                try {
                    await api.createTeam({
                        name: metadata.teamName,
                        sportId: sp.id,
                        logo: metadata.logo || '',
                    });
                    console.log("Team creation successful");
                } catch (teamErr: any) {
                    console.error("CRITICAL FETCH ERROR ON TEAM CREATION:", teamErr);
                    alert(`Failed to save team: ${teamErr.message}`);
                }
            }

            setSelectedSport(sp);
            setShowAddSport(false);
            setOnboardingSport(null);

            // Refresh the user session in local storage to hydrate the newly added sport metadata
            try {
                const updatedUser = await api.getProfile();
                const token = localStorage.getItem('token');
                if (updatedUser && token) {
                    useAuthStore.getState().setAuth(updatedUser, token);
                }
            } catch (authErr) {
                console.error("Failed to refresh profile", authErr);
            }
        } catch (err: any) {
            console.error('🔥 Full onboarding error:', err);
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                alert('Network Error (Failed to fetch). The payload might still be too large or the API proxy crashed. Please check the browser console.');
            } else {
                alert('Failed to add sport: ' + err.message);
            }
        } finally {
            setIsSavingSport(false);
        }
    };

    const role = user?.role || 'PLAYER';
    const roleGroup = getRoleGroup(role);
    const theme = ROLE_THEMES[roleGroup];
    const quickCards = ROLE_CARDS[roleGroup];
    const isOwnerRole = roleGroup === 'team_manager' || roleGroup === 'organizer';

    useEffect(() => {
        loadFromStorage();
        setLoaded(true);
    }, [loadFromStorage]);

    // Background sync to ensure profile metadata (like ID) is fresh
    useEffect(() => {
        if (loaded && isAuthenticated) {
            api.getProfile().then((userData) => {
                const currentToken = localStorage.getItem('token');
                if (userData && currentToken) {
                    useAuthStore.getState().setAuth(userData, currentToken);
                }
            }).catch(console.error);
        }
    }, [loaded, isAuthenticated]);

    useEffect(() => {
        if (loaded && !isAuthenticated) {
            router.push('/login');
            return;
        }
        if (isAuthenticated) {
            api.getTournaments().then(setTournaments).catch(() => { });
            api.getLiveMatches().then(setLiveMatches).catch(() => { });
            const savedMyIds = loadMySportIds();
            api.getSports().then((allSports) => {
                setSports(allSports);
                setAvailableSports(allSports);

                let myIds = savedMyIds;

                // Hydrate from user profile if local storage is empty (keeps from prompting on fresh logins)
                if (myIds.length === 0 && user?.player?.playerSports) {
                    myIds = user.player.playerSports.map((ps: any) => ps.sportId);
                    if (myIds.length > 0) {
                        myIds.forEach((id: string) => addMySport(id));
                    }
                }

                if (myIds.length > 0) {
                    // User already has chosen sports — restore selection
                    const savedId = loadSelectedSport();
                    const saved = allSports.find((s: any) => s.id === savedId);
                    if (saved) setSelectedSport(saved);
                    else {
                        const firstMy = allSports.find((s: any) => myIds.includes(s.id));
                        if (firstMy) setSelectedSport(firstMy);
                    }
                    setHydratingSports(false);
                } else if (isOwnerRole) {
                    // Try hydrating from owner's governed sports
                    api.getMySports().then((ownerSports) => {
                        if (ownerSports && ownerSports.length > 0) {
                            const newIds = ownerSports.map((s: any) => s.id);
                            newIds.forEach((id: string) => addMySport(id));
                            const firstMy = allSports.find((s: any) => newIds.includes(s.id));
                            if (firstMy) setSelectedSport(firstMy);
                        }
                    }).catch(() => { })
                        .finally(() => setHydratingSports(false));
                } else {
                    setHydratingSports(false);
                }
            }).catch(() => {
                setHydratingSports(false);
            });
        }
    }, [loaded, isAuthenticated, router]);

    // Fetch sport-specific dashboard data when selected sport changes
    useEffect(() => {
        if (isOwnerRole && selectedSport?.id) {
            setSportLoading(true);
            const savedTournament = loadActiveTournament();

            // Check if saved tournament belongs to the selected sport, if not, clear it
            if (savedTournament && savedTournament.sport?.id !== selectedSport.id) {
                useSportStore.getState().clearActiveTournament();
            }

            api.getOwnerDashboard(selectedSport.id)
                .then(setOwnerDashData)
                .catch(() => setOwnerDashData(null))
                .finally(() => setSportLoading(false));
        }
    }, [selectedSport?.id, isOwnerRole]);

    // Show sport picker overlay when user hasn't chosen any sports yet
    // Skip this overlay completely for Admin and Organizer roles
    const showSportPicker = availableSports.length > 0 && mySportIds.length === 0 && roleGroup !== 'organizer' && roleGroup !== 'admin';

    // User's chosen sports (filtered from all available)
    const mySports = availableSports.filter((s: any) => mySportIds.includes(s.id));
    // Sports not yet added by the user
    const remainingSports = availableSports.filter((s: any) => !mySportIds.includes(s.id));

    // Do not block dashboard rendering on sports hydration for users who don't need to pick a sport
    if (!loaded || !isAuthenticated || (hydratingSports && roleGroup !== 'organizer' && roleGroup !== 'admin')) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <RunningAthleteLoader />
            </div>
        );
    }

    /* ─── Full-Screen Sport Picker Overlay ─── */
    if (showSportPicker) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
                display: 'flex', flexDirection: 'column' as const,
                alignItems: 'center', justifyContent: 'center',
                padding: '40px',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        🌐
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>Choose Your Sport</h1>
                    <p style={{ fontSize: '16px', color: "inherit", maxWidth: '500px' }}>
                        Select a sport to view your personalized dashboard. You can switch anytime.
                    </p>
                </div>
                <div className="grid-cols-2-mobile" style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.min(availableSports.length, 4)}, 1fr)`,
                    gap: '20px', maxWidth: '900px', width: '100%',
                }}>
                    {availableSports.map((sp: any) => {
                        const accent = sp.accentColor || sportColors[sp.name] || '#7c3aed';
                        return (
                            <button key={sp.id} onClick={() => { handleSelectNewSport(sp); }} style={{
                                padding: '36px 24px', borderRadius: '20px', cursor: 'pointer',
                                border: '2px solid rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex', flexDirection: 'column' as const,
                                alignItems: 'center', gap: '16px',
                                transition: 'all 0.3s ease',
                                color: 'white',
                            }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = accent;
                                    (e.currentTarget as HTMLElement).style.border = `2px solid ${accent}`;
                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px) scale(1.02)';
                                    (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px ${accent}40`;
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                                    (e.currentTarget as HTMLElement).style.border = '2px solid rgba(255,255,255,0.15)';
                                    (e.currentTarget as HTMLElement).style.transform = 'none';
                                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                }}>
                                <SportIcon sport={sp.name} size={52} color={accent} />
                                <span style={{ fontSize: '20px', fontWeight: 800 }}>{sp.name}</span>
                            </button>
                        );
                    })}
                </div>
                <p style={{ fontSize: '13px', color: "inherit", marginTop: '32px' }}>
                    🔄 You can switch sports anytime from the dashboard
                </p>
                {/* ─── DYNAMIC SPORT ONBOARDING MODAL ─── */}
                {onboardingSport && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{
                            background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px',
                            overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}>
                            <div style={{ padding: '24px 32px', background: onboardingSport.accentColor || '#6366f1', color: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ fontSize: '36px' }}>
                                    <SportIcon sport={onboardingSport.name} size={42} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Welcome to {onboardingSport.name}!</h2>
                                    <p style={{ fontSize: '14px', opacity: 0.9 }}>Let's set up your sport profile.</p>
                                </div>
                            </div>
                            <div style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {(user?.role === 'TEAM_MANAGER' ? SPORT_FORMS.TEAM_MANAGER : SPORT_FORMS[onboardingSport.name])?.map((field) => (
                                        <div key={field.id}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: "inherit", marginBottom: '8px' }}>
                                                {field.label}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    value={onboardingAnswers[field.id] || ''}
                                                    onChange={(e) => setOnboardingAnswers({ ...onboardingAnswers, [field.id]: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '15px', color: "inherit", background: '#f8fafc', outline: 'none', transition: 'border 0.2s', cursor: 'pointer' }}
                                                    onFocus={(e) => e.target.style.borderColor = onboardingSport.accentColor || '#6366f1'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                >
                                                    <option value="" disabled>Select an option...</option>
                                                    {field.options?.map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : field.type === 'file' ? (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setOnboardingAnswers({ ...onboardingAnswers, [field.id]: reader.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px dashed #e2e8f0', fontSize: '15px', color: '#64748b', background: onboardingAnswers[field.id] ? '#f0fdf4' : 'transparent', cursor: 'pointer', outline: 'none', transition: 'border 0.2s' }}
                                                    onFocus={(e) => e.target.style.borderColor = onboardingSport.accentColor || '#6366f1'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    placeholder={field.placeholder || ''}
                                                    value={onboardingAnswers[field.id] || ''}
                                                    onChange={(e) => setOnboardingAnswers({ ...onboardingAnswers, [field.id]: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '15px', color: "inherit", background: '#f8fafc', outline: 'none', transition: 'border 0.2s' }}
                                                    onFocus={(e) => e.target.style.borderColor = onboardingSport.accentColor || '#6366f1'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setOnboardingSport(null)} disabled={isSavingSport} style={{ padding: '12px 24px', borderRadius: '12px', background: '#f1f5f9', color: "inherit", fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
                                        Cancel
                                    </button>
                                    <button onClick={() => executeAddSport(onboardingSport, onboardingAnswers)} disabled={isSavingSport} style={{ padding: '12px 32px', borderRadius: '12px', background: onboardingSport.accentColor || '#6366f1', color: 'white', fontWeight: 800, fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px ${(onboardingSport.accentColor || '#6366f1')}60`, transition: 'all 0.2s', transform: isSavingSport ? 'scale(0.98)' : 'scale(1)', opacity: isSavingSport ? 0.7 : 1 }}>
                                        {isSavingSport ? 'Saving...' : 'Complete Setup'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    /* ─── Role-specific stats ─── */
    const statsMap: Record<RoleGroup, { label: string; value: any; icon: any; color: string }[]> = {
        admin: [
            { label: 'Admin ID', value: user?.id?.substring(0, 8) || 'N/A', icon: <Fingerprint size={20} />, color: "inherit" },
            { label: 'Live Matches', value: liveMatches.length, icon: <Radio size={20} />, color: "inherit" },
            { label: 'Platform Users', value: 12450, icon: <Users size={20} />, color: "inherit" },
            { label: 'Admin Level', value: roleLabels[role] || role, icon: <Shield size={20} />, color: "inherit" },
        ],
        organizer: [
            { label: 'Organizer ID', value: user?.id?.substring(0, 8) || 'N/A', icon: <Fingerprint size={20} />, color: "inherit" },
            { label: 'Live Scoring', value: liveMatches.length > 0 ? 'Active' : 'None', icon: <Radio size={20} />, color: "inherit" },
            { label: 'Active Teams', value: ownerDashData?.teams?.length || 0, icon: <Users size={20} />, color: "inherit" },
            { label: 'Role', value: roleLabels[role] || role, icon: <Shield size={20} />, color: "inherit" },
        ],
        team_manager: [
            { label: 'Manager ID', value: user?.id?.substring(0, 8) || 'N/A', icon: <Fingerprint size={20} />, color: "inherit" },
            { label: 'Live Scoring', value: liveMatches.length > 0 ? 'Active' : 'None', icon: <Radio size={20} />, color: "inherit" },
            { label: 'My Teams', value: ownerDashData?.teams?.length || 0, icon: <Users size={20} />, color: "inherit" },
            { label: 'Role', value: roleLabels[role] || role, icon: <Shield size={20} />, color: "inherit" },
        ],
        official: [
            { label: 'Official ID', value: user?.id?.substring(0, 8) || 'N/A', icon: <Fingerprint size={20} />, color: "inherit" },
            { label: 'Live Matches', value: liveMatches.length, icon: <Radio size={20} />, color: "inherit" },
            { label: 'Matches Reffed', value: 34, icon: <ClipboardList size={20} />, color: "inherit" },
            { label: 'Role', value: roleLabels[role] || role, icon: <Scale size={20} />, color: "inherit" },
        ],
        player: [
            {
                label: 'Sports ID', value: (() => {
                    const ps = user?.player?.playerSports;
                    if (ps && selectedSport) {
                        const match = ps.find((s: any) => s.sportId === selectedSport.id);
                        if (match) return match.sportCode;
                    }
                    return user?.player?.sportsId ? user.player.sportsId : 'Not Registered';
                })(), icon: <Fingerprint size={20} />, color: "inherit"
            },
            { label: 'Live Matches', value: liveMatches.length, icon: <Radio size={20} />, color: "inherit" },
            { label: 'Connected Teams', value: 2, icon: <Users size={20} />, color: "inherit" },
            { label: 'My Role', value: roleLabels[role] || role, icon: <Gamepad2 size={20} />, color: "inherit" },
        ],
    };

    const stats = statsMap[roleGroup];

    /* ─── Banner subtitle ─── */
    const sportLabel = selectedSport?.name || 'Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '🏅';
    const currentSportData = {
        matches: [],
        requests: [],
        notifications: [],
        payments: [],
        profileBadge: 'New Sport',
        piScore: 0,
        winRate: '0%',
        teamName: 'Free Agent',
    };

    const bannerSubtitles: Record<RoleGroup, string> = {
        admin: `Platform Administrator Dashboard — ${sportLabel} Management`,
        organizer: `${sportIcon} ${sportLabel} Tournament Management`,
        team_manager: `${sportIcon} ${sportLabel} Team Management Dashboard`,
        official: `${sportIcon} ${sportLabel} Match Official Dashboard`,
        player: `Your Dashboard`,
    };

    return (
        <div style={{ minHeight: '100vh', background: theme.bg }}>
            {/* ─── Top Navigation ─── */}
            <nav style={{
                padding: '16px 32px', background: theme.navBg,
                borderBottom: `1px solid ${theme.navBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Hamburger Menu - Left Side Drawer (Player & Team Manager) */}
                    {(roleGroup === 'player' || roleGroup === 'team_manager') && (
                        <>
                            <button
                                onClick={() => setPlayerMenuOpen(true)}
                                style={{
                                    padding: '8px', borderRadius: '8px', cursor: 'pointer',
                                    background: 'transparent',
                                    color: theme.textPrimary,
                                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s',
                                }}
                                className="hover-bg-slate"
                            >
                                <Menu size={24} />
                            </button>

                            {/* Full Screen Overlay */}
                            {playerMenuOpen && (
                                <div
                                    onClick={() => setPlayerMenuOpen(false)}
                                    style={{
                                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                                        backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 998,
                                        backdropFilter: 'blur(4px)',
                                    }}
                                />
                            )}

                            {/* Sliding Left Drawer — Redesigned */}
                            <div style={{
                                position: 'fixed', top: 0, left: 0, height: '100vh', width: '300px',
                                backgroundColor: '#ffffff', zIndex: 999,
                                transform: playerMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: playerMenuOpen ? '6px 0 32px rgba(0,0,0,0.12)' : 'none',
                                display: 'flex', flexDirection: 'column',
                                overflowY: 'auto',
                                borderRight: '1px solid #f1f5f9',
                            }}>
                                {/* ── Profile Header ── */}
                                <div style={{
                                    padding: '32px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    borderBottom: '1px solid #f1f5f9', position: 'relative',
                                }}>
                                    <button
                                        onClick={() => setPlayerMenuOpen(false)}
                                        style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', display: 'flex', borderRadius: '8px', transition: 'color 0.2s' }}
                                    >
                                        <X size={18} />
                                    </button>
                                    {/* Avatar Circle */}
                                    <div style={{
                                        width: '72px', height: '72px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '28px', color: 'white', fontWeight: 800,
                                        marginBottom: '14px',
                                        border: '3px solid #e0e7ff',
                                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
                                    }}>
                                        {(user?.firstName?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '17px', color: '#1e1b4b', textAlign: 'center' }}>
                                        {user?.firstName || 'User'} {user?.lastName || ''}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px', textAlign: 'center' }}>
                                        {user?.email || ''}
                                    </div>
                                    <div style={{
                                        marginTop: '10px', padding: '4px 14px', borderRadius: '20px',
                                        background: theme.badgeBg, color: theme.badgeText,
                                        fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                                    }}>
                                        {roleGroup === 'team_manager' ? '⚡ Team Manager' : '🏅 Player'}
                                    </div>
                                </div>

                                {/* ── Menu Group 1: Account ── */}
                                <div style={{ padding: '12px 14px 4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <Link href="/profile" onClick={() => setPlayerMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} className="hover-bg-slate">
                                        <IdCard size={18} color="#64748b" /> {roleGroup === 'team_manager' ? 'Team Profile' : 'My Profile'}
                                    </Link>
                                    <Link href="/settings/security" onClick={() => setPlayerMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} className="hover-bg-slate">
                                        <ShieldCheck size={18} color="#64748b" /> Security & Passwords
                                    </Link>
                                    <Link href="/certificates" onClick={() => setPlayerMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} className="hover-bg-slate">
                                        <Award size={18} color="#64748b" /> Certificates & Awards
                                    </Link>
                                    <Link href="/leaderboard" onClick={() => setPlayerMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} className="hover-bg-slate">
                                        <Medal size={18} color="#64748b" /> Leaderboard
                                    </Link>
                                </div>

                                {/* ── Divider ── */}
                                <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 20px' }} />

                                {/* ── Menu Group 2: Features ── */}
                                <div style={{ padding: '4px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <Link href="/scoring" onClick={() => setPlayerMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} className="hover-bg-slate">
                                        <Siren size={18} color="#dc2626" /> Live Scores
                                    </Link>
                                    <Link href="/calendar" onClick={() => setPlayerMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} className="hover-bg-slate">
                                        <Calendar size={18} color="#64748b" /> Calendar
                                    </Link>
                                    {roleGroup === 'team_manager' && (
                                        <Link href="/fixtures" onClick={() => setPlayerMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} className="hover-bg-slate">
                                            <ClipboardList size={18} color="#64748b" /> Fixtures
                                        </Link>
                                    )}
                                    <Link href="/media" onClick={() => setPlayerMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} className="hover-bg-slate">
                                        <Camera size={18} color="#64748b" /> Media
                                    </Link>
                                    <Link href="/settings" onClick={() => setPlayerMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} className="hover-bg-slate">
                                        <Settings size={18} color="#64748b" /> Settings
                                    </Link>
                                </div>

                                {/* ── Divider ── */}
                                <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 20px' }} />

                                {/* ── Menu Group 3: Support ── */}
                                <div style={{ padding: '4px 14px 12px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                    <Link href="/help" onClick={() => setPlayerMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} className="hover-bg-slate">
                                        <HelpCircle size={18} color="#64748b" /> Help & Support
                                    </Link>
                                    <Link href="/about" onClick={() => setPlayerMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} className="hover-bg-slate">
                                        <IdCard size={18} color="#64748b" /> About the App
                                    </Link>
                                </div>

                                {/* ── Logout Footer ── */}
                                <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button onClick={() => { setPlayerMenuOpen(false); logout(); router.push('/'); }} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        padding: '12px', borderRadius: '12px', width: '100%',
                                        background: '#f8fafc', color: '#475569',
                                        fontSize: '14px', fontWeight: 700, border: '1px solid #e2e8f0',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }} className="hover-bg-slate">
                                        <LogOut size={16} /> Logout
                                    </button>
                                    <button onClick={() => { setPlayerMenuOpen(false); alert("To delete your account, please contact support and verify your identity."); }} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        padding: '10px', borderRadius: '10px', width: '100%',
                                        background: 'transparent', color: '#dc2626',
                                        fontSize: '12px', fontWeight: 600, border: 'none',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }}>
                                        <Trash2 size={14} /> Delete Account
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginLeft: (roleGroup === 'player' || roleGroup === 'team_manager') ? '4px' : '0' }}>
                        <span style={{ fontSize: '24px' }}>🌐</span>
                        <span style={{
                            fontSize: '20px', fontWeight: 800,
                            background: 'linear-gradient(135deg, #4f46e5, #ec4899, #f43f5e)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}>Game Sphere</span>
                    </Link>
                </div>

                <div className="flex-wrap-mobile" style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-start' }}>
                    {theme.navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="hide-mobile" style={{
                            fontSize: '14px', fontWeight: 500, color: theme.textSecondary, textDecoration: 'none',
                        }}>
                            {link.label}
                        </Link>
                    ))}
                    <button onClick={() => router.push('/notifications')} style={{
                        padding: '8px', borderRadius: '8px', cursor: 'pointer',
                        background: 'transparent', color: theme.textPrimary,
                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s', position: 'relative'
                    }} className="hover-bg-slate">
                        <Bell size={20} />
                        <span style={{
                            position: 'absolute', top: '6px', right: '8px',
                            width: '8px', height: '8px', backgroundColor: '#ef4444',
                            borderRadius: '50%', border: '2px solid white'
                        }}></span>
                    </button>
                    <button onClick={() => router.push('/messages')} style={{
                        padding: '8px', borderRadius: '8px', cursor: 'pointer',
                        background: 'transparent', color: theme.textPrimary,
                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s', position: 'relative'
                    }} className="hover-bg-slate">
                        <MessageSquare size={20} />
                        <span style={{
                            position: 'absolute', top: '4px', right: '4px',
                            width: '8px', height: '8px', backgroundColor: '#ef4444',
                            borderRadius: '50%', border: '2px solid white'
                        }}></span>
                    </button>
                </div>
            </nav>

            <div className="mobile-padding" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
                {/* ─── Welcome Banner ─── */}
                <div style={{
                    padding: '32px', borderRadius: '20px', marginBottom: '32px',
                    background: theme.bannerGradient, color: 'white',
                }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
                        {(() => {
                            const hr = new Date().getHours();
                            if (hr < 12) return 'Good morning';
                            if (hr < 18) return 'Good afternoon';
                            return 'Good evening';
                        })()}, {user?.firstName || 'User'}! {theme.emoji}
                    </h1>
                    <p style={{ fontSize: '15px', opacity: 0.85 }}>
                        {bannerSubtitles[roleGroup]}
                    </p>
                </div>

                {/* ─── Sport Selector Bar (Always visible to allow adding sports) ─── */}
                {roleGroup !== 'organizer' && roleGroup !== 'admin' && (
                    <div className="flex-wrap-mobile" style={{
                        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px',
                        padding: '12px 16px', borderRadius: '14px',
                        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, justifyContent: 'flex-start'
                    }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: theme.textSecondary, marginRight: '4px' }}>🏅 Sport:</span>

                        {mySports.length > 0 ? mySports.map((sp: any) => {
                            const isActive = selectedSport?.id === sp.id;
                            const accent = sp.accentColor || sportColors[sp.name] || '#7c3aed';
                            return (
                                <button key={sp.id} onClick={() => setSelectedSport(sp)} style={{
                                    padding: '8px 18px', borderRadius: '10px', cursor: 'pointer',
                                    fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
                                    border: isActive ? `2px solid ${accent}` : `1px solid ${theme.cardBorder}`,
                                    background: isActive ? accent : theme.cardBg,
                                    color: isActive ? 'white' : theme.textPrimary,
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                }}>
                                    <SportIcon sport={sp.name} size={18} color={isActive ? 'white' : accent} />
                                    {sp.name}
                                </button>
                            );
                        }) : (
                            <span style={{ fontSize: '14px', color: theme.textSecondary, fontStyle: 'italic' }}>No sports selected yet.</span>
                        )}

                        {/* Add Sport Button */}
                        {remainingSports.length > 0 && (
                            <div style={{ position: 'relative', marginLeft: 'auto' }}>
                                <button onClick={() => setShowAddSport(!showAddSport)} style={{
                                    padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
                                    fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
                                    border: `1px dashed ${theme.cardBorder}`,
                                    background: theme.cardBg, color: theme.textSecondary,
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                }}>
                                    ➕ Add Sport
                                </button>
                                {showAddSport && (
                                    <div style={{
                                        position: 'absolute', top: '44px', right: 0, zIndex: 50,
                                        background: 'white', borderRadius: '12px', border: '1px solid #e9d5ff',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)', padding: '8px', minWidth: '200px',
                                    }}>
                                        {remainingSports.map((sp: any) => {
                                            const accent = sp.accentColor || sportColors[sp.name] || '#7c3aed';
                                            return (
                                                <button key={sp.id} onClick={() => {
                                                    setShowAddSport(false);
                                                    handleSelectNewSport(sp);
                                                }} style={{
                                                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                                                    cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                                    border: 'none', background: 'transparent',
                                                    color: "inherit", display: 'flex', alignItems: 'center', gap: '8px',
                                                    transition: 'background 0.2s'
                                                }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <SportIcon sport={sp.name} size={18} color={accent} />
                                                    {sp.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Sport Loading Indicator ─── */}
                {roleGroup !== 'organizer' && roleGroup !== 'admin' && isOwnerRole && sportLoading && (
                    <div style={{ textAlign: 'center', padding: '32px', color: theme.textSecondary }}>
                        ⏳ Loading {selectedSport?.name} dashboard...
                    </div>
                )}





                {/* ─── Player Dashboard Widgets (Sport-Filtered) ─── */}
                {roleGroup === 'player' && selectedSport && currentSportData && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>

                        {/* Profile Summary */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `1px solid ${selectedSport.accentColor || '#6366f1'}20` }}>
                            <Link href="/profile" style={{ textDecoration: 'none', color: "inherit" }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `linear-gradient(135deg, ${selectedSport.accentColor || '#6366f1'}, ${selectedSport.accentColor || '#6366f1'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{sportIcon}</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '16px' }}>{user?.firstName} {user?.lastName}</div>
                                        <div style={{ fontSize: '12px', color: selectedSport.accentColor || '#6366f1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Fingerprint size={14} />
                                            {(() => {
                                                const ps = user?.player?.playerSports;
                                                if (ps && selectedSport) {
                                                    const m = ps.find((s: any) => s.sportId === selectedSport.id);
                                                    if (m) return m.sportCode;
                                                }
                                                return user?.player?.sportsId || 'Not Registered';
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Upcoming Matches */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `1px solid ${selectedSport.accentColor || '#6366f1'}20` }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#64748b', marginBottom: '10px' }}>{sportIcon} UPCOMING {sportLabel.toUpperCase()} MATCHES</div>
                            <div style={{ fontSize: '12px', color: "inherit", padding: '12px 0' }}>No upcoming {sportLabel} matches</div>
                        </div>

                        {/* Pending Requests */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `1px solid ${selectedSport.accentColor || '#6366f1'}20` }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#64748b', marginBottom: '10px' }}>📨 {sportLabel.toUpperCase()} REQUESTS</div>
                            <div style={{ fontSize: '12px', color: "inherit", padding: '12px 0' }}>No pending {sportLabel} requests</div>
                            <Link href="/teams" style={{ fontSize: '12px', color: selectedSport.accentColor || '#6366f1', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: '8px' }}>View all →</Link>
                        </div>

                        {/* Notifications */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `1px solid ${selectedSport.accentColor || '#6366f1'}20` }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#64748b', marginBottom: '10px' }}>🔔 {sportLabel.toUpperCase()} NOTIFICATIONS</div>
                            <div style={{ fontSize: '12px', color: "inherit", padding: '12px 0' }}>No new {sportLabel} notifications</div>
                        </div>

                        {/* Payment Dues */}
                        {/* Empty until live API data is connected */}
                    </div>
                )}

                {/* ─── ORGANIZER Dashboard Widgets (Tournament-Focused) ─── */}
                {
                    roleGroup === 'organizer' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>

                            {/* Organizer Profile Summary Bar */}
                            <div style={{ borderRadius: '20px', background: 'white', border: `1px solid #e9d5ff`, boxShadow: '0 4px 15px rgba(233, 213, 255, 0.5)', overflow: 'hidden' }}>
                                <div onClick={() => setShowOrgProfileDetails(!showOrgProfileDetails)} style={{ cursor: 'pointer', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }} className="flex-wrap-mobile">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '50%',
                                            background: `linear-gradient(135deg, #7c3aed, #4c1d95)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: '24px', fontWeight: 800
                                        }}>
                                            {user?.firstName?.charAt(0) || 'O'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e1b4b', marginBottom: '2px' }}>
                                                {user?.firstName} {user?.lastName}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontWeight: 700 }}>ID:</span>
                                                {user?.player?.sportsId || 'Pending Allocation'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hide-mobile" style={{ padding: '8px 16px', borderRadius: '20px', background: showOrgProfileDetails ? '#f3e8ff' : '#faf5ff', color: '#6d28d9', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s' }}>
                                        {showOrgProfileDetails ? 'Hide Details ↑' : 'View Full Details ↓'}
                                    </div>
                                </div>

                                {showOrgProfileDetails && (
                                    <div style={{ borderTop: '1px solid #e9d5ff', padding: '20px', background: '#faf5ff', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#4c1d95', marginBottom: '4px' }}>CONTACT INFO</div>
                                            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                <span>📧</span> {user?.email || 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                <span>📞</span> {user?.phone || 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                <span>📅</span> Joined {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : '2026'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#4c1d95', marginBottom: '4px' }}>ORGANIZER INSIGHTS</div>
                                            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                <span>⭐</span> 4.8 / 5.0 (Community Rating)
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                <span>🏆</span> {tournaments.length} Tournaments Organized
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                <span>👥</span> {tournaments.reduce((s: number, t: any) => s + (t._count?.teams || 0), 0) * 11} Players Managed
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Prominent Primary CTA: Create Tournament */}
                            <Link href="/tournaments/create" style={{
                                padding: '24px', borderRadius: '20px', textDecoration: 'none',
                                background: `linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)`,
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)', transition: 'transform 0.2s',
                            }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>Create New Tournament</div>
                                    <div style={{ fontSize: '14px', opacity: 0.9 }}>Setup brackets, teams, and live scoring in minutes.</div>
                                </div>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                    ➕
                                </div>
                            </Link>

                            {/* My Tournaments List */}
                            <div style={{ padding: '24px', borderRadius: '16px', background: 'white', border: `1px solid #e9d5ff` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#4c1d95' }}>🏆 MY TOURNAMENTS</div>
                                </div>
                                {tournaments.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏟️</div>
                                        <div style={{ fontSize: '16px', fontWeight: 600 }}>No tournaments yet</div>
                                        <div style={{ fontSize: '14px', marginTop: '4px' }}>Click the banner above to get started!</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {tournaments.map((t: any) => (
                                            <Link key={t.id} href={`/tournaments/${t.id}`} style={{
                                                display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px',
                                                border: '1px solid #f3e8ff', textDecoration: 'none', background: '#faf5ff',
                                                transition: 'all 0.2s'
                                            }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f3e8ff'; e.currentTarget.style.borderColor = '#d8b4fe'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = '#faf5ff'; e.currentTarget.style.borderColor = '#f3e8ff'; }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e1b4b', marginBottom: '4px' }}>{t.name}</div>
                                                    <div style={{ fontSize: '13px', color: '#6d28d9', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 600 }}>{t.sport?.name || 'Tournament'}</span>
                                                        <span>•</span>
                                                        <span>{t.format?.replace(/_/g, ' ') || 'STANDARD'}</span>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                                                    background: t.status === 'LIVE' ? '#fee2e2' : t.status === 'COMPLETED' ? '#f1f5f9' : '#e0e7ff',
                                                    color: t.status === 'LIVE' ? '#dc2626' : t.status === 'COMPLETED' ? '#475569' : '#4338ca'
                                                }}>
                                                    {t.status === 'LIVE' ? '🔴 LIVE' : t.status || 'DRAFT'}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>


                        </div>
                    )
                }

                {/* ─── TEAM MANAGER Dashboard Widgets (Team-Focused) ─── */}
                {
                    roleGroup === 'team_manager' && !sportLoading && selectedSport && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            {/* Team Overview — from API data */}
                            {ownerDashData?.teams?.map((team: any) => (
                                <div key={team.id} style={{ padding: '24px', borderRadius: '20px', background: 'linear-gradient(145deg, #ffffff, #faf5ff)', border: `1px solid ${selectedSport.accentColor || '#e9d5ff'}`, boxShadow: '0 8px 24px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden', marginBottom: '16px' }}>

                                    {/* Decorative background circle */}
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: `radial-gradient(circle, ${selectedSport.accentColor || '#7c3aed'}15 0%, transparent 70%)`, transform: 'translate(30%, -30%)', borderRadius: '50%' }}></div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }} className="flex-wrap-mobile">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `linear-gradient(135deg, ${selectedSport.accentColor || '#7c3aed'}, ${selectedSport.accentColor || '#7c3aed'}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'white', boxShadow: `0 4px 12px ${selectedSport.accentColor || '#7c3aed'}40` }}>
                                                {selectedSport.icon || sportIcons[selectedSport.name] || '🏅'}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                    <h3 style={{ fontWeight: 900, fontSize: '22px', color: '#1e1b4b', margin: 0 }}>{team.name}</h3>
                                                    <span style={{ padding: '4px 10px', borderRadius: '20px', background: `${selectedSport.accentColor || '#7c3aed'}15`, color: selectedSport.accentColor || '#7c3aed', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        {selectedSport.name}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                                                    <Fingerprint size={14} color={selectedSport.accentColor || '#7c3aed'} />
                                                    <span style={{ fontWeight: 600 }}>Team ID:</span>
                                                    <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#1e293b', fontWeight: 700, letterSpacing: '1px' }}>
                                                        {team.teamCode || team.id.substring(0, 8).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}


                            {/* Upcoming Fixtures — from API data */}
                            <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `2px solid ${selectedSport.accentColor || '#e9d5ff'}30` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#6d28d9' }}>🏟️ {selectedSport.name?.toUpperCase()} FIXTURES</div>
                                    <Link href="/fixtures" style={{ fontSize: '12px', fontWeight: 600, color: selectedSport.accentColor || '#7c3aed', textDecoration: 'none' }}>All fixtures →</Link>
                                </div>
                                {(ownerDashData?.upcomingFixtures || []).length === 0 && (ownerDashData?.matchHistory || []).length === 0 ? (
                                    <div style={{ fontSize: '12px', color: "inherit", padding: '16px 0', textAlign: 'center' }}>No {selectedSport.name} fixtures yet</div>
                                ) : (
                                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        {(ownerDashData?.upcomingFixtures || []).slice(0, 3).map((m: any, i: number) => (
                                            <div key={i} style={{ padding: '14px', borderRadius: '10px', background: '#faf5ff', border: `1px solid ${selectedSport.accentColor || '#e9d5ff'}30` }}>
                                                <div style={{ fontWeight: 800, fontSize: '14px', color: "inherit", marginBottom: '4px' }}>
                                                    {m.homeTeam?.name || 'TBD'} vs {m.awayTeam?.name || 'TBD'}
                                                </div>
                                                <div style={{ fontSize: '11px', color: selectedSport.accentColor || '#6d28d9', fontWeight: 600, marginBottom: '4px' }}>
                                                    📅 {m.scheduledAt ? formatDate(m.scheduledAt) : 'TBD'}
                                                </div>
                                                <div style={{ fontSize: '11px', color: "inherit" }}>🏟️ {m.venue || 'TBD'}</div>
                                                <span style={{ fontSize: '10px', marginTop: '6px', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: `${selectedSport.accentColor || '#6d28d9'}15`, color: selectedSport.accentColor || '#6d28d9', fontWeight: 700 }}>{m.round || m.status}</span>
                                            </div>
                                        ))}
                                        {(ownerDashData?.matchHistory || []).slice(0, 3 - (ownerDashData?.upcomingFixtures || []).length).map((m: any, i: number) => (
                                            <div key={`h${i}`} style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontWeight: 800, fontSize: '14px', color: "inherit", marginBottom: '4px' }}>
                                                    {m.homeTeam?.name || 'TBD'} vs {m.awayTeam?.name || 'TBD'}
                                                </div>
                                                <div style={{ fontSize: '11px', color: "inherit" }}>🏆 {m.tournament?.name}</div>
                                                <span style={{ fontSize: '10px', marginTop: '6px', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: m.status === 'COMPLETED' ? '#f0fdf4' : '#fef2f2', color: m.status === 'COMPLETED' ? '#16a34a' : '#ef4444', fontWeight: 700 }}>{m.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* ─── No Sports Prompt ─── */}
                {
                    roleGroup === 'organizer' && !sportLoading && availableSports.length === 0 && (
                        <div style={{ padding: '48px', borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
                            <p style={{ color: theme.textSecondary, fontSize: '15px', marginBottom: '16px' }}>No sports available yet. Add a sport to start creating tournaments!</p>
                            <Link href="/tournaments/create" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>+ Create Tournament</Link>
                        </div>
                    )
                }
                {
                    roleGroup === 'team_manager' && !sportLoading && availableSports.length === 0 && (
                        <div style={{ padding: '48px', borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏅</div>
                            <p style={{ color: theme.textSecondary, fontSize: '15px', marginBottom: '16px' }}>You don't have any teams yet. Create a team to get started!</p>
                            <Link href="/teams" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>+ Create Team</Link>
                        </div>
                    )
                }

                {/* ─── Organiser Strict Context Lock Navigation ─── */}
                {
                    roleGroup === 'organizer' && (
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                </div>
                                {activeTournament && (
                                    <button onClick={() => useSportStore.getState().clearActiveTournament()} style={{
                                        padding: '8px 16px', borderRadius: '8px', background: 'white', border: `1px solid ${theme.cardBorder}`,
                                        color: "inherit", fontWeight: 600, fontSize: '12px', cursor: 'pointer'
                                    }}>
                                        ✖ Clear Context
                                    </button>
                                )}
                            </div>

                            {!selectedSport ? (
                                <div style={{ padding: '32px', borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: theme.textPrimary, marginBottom: '8px' }}>Select a Sport</h3>
                                    <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>Please select a sport from the banner above to load your tournament tools.</p>
                                </div>
                            ) : !activeTournament ? (
                                <div style={{ padding: '32px', borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏟️</div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: theme.textPrimary, marginBottom: '8px' }}>Select an Active Tournament</h3>
                                        <p style={{ fontSize: '14px', color: theme.textSecondary }}>Choose a tournament to load scoped data and tools.</p>
                                    </div>
                                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                        {tournaments.filter(t => t.sport?.id === selectedSport.id).map(t => (
                                            <button key={t.id} onClick={() => useSportStore.getState().setActiveTournament(t)} style={{
                                                padding: '16px', borderRadius: '12px', background: '#faf5ff', border: `2px solid ${selectedSport.accentColor || '#e9d5ff'}40`,
                                                textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px',
                                                transition: 'all 0.2s'
                                            }} className="hover:border-purple-500 hover:shadow-md">
                                                <div style={{ fontWeight: 800, fontSize: '16px', color: "inherit" }}>{t.name}</div>
                                                <div style={{ fontSize: '12px', color: "inherit", fontWeight: 600 }}>{t.format}</div>
                                                <span style={{
                                                    fontSize: '10px', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, alignSelf: 'flex-start',
                                                    background: t.status === 'LIVE' ? '#fef2f2' : t.status === 'COMPLETED' ? '#f0fdf4' : `${selectedSport.accentColor || '#6d28d9'}15`,
                                                    color: t.status === 'LIVE' ? '#ef4444' : t.status === 'COMPLETED' ? '#16a34a' : selectedSport.accentColor || '#6d28d9',
                                                }}>{t.status}</span>
                                            </button>
                                        ))}
                                        <Link href={`/tournaments/create?sport=${selectedSport.id}`} style={{
                                            padding: '16px', borderRadius: '12px', background: 'white', border: `2px dashed ${selectedSport.accentColor || '#e9d5ff'}`,
                                            textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px',
                                            textDecoration: 'none'
                                        }}>
                                            <div style={{ fontSize: '24px', color: selectedSport.accentColor || '#7c3aed' }}>+</div>
                                            <div style={{ fontWeight: 700, fontSize: '14px', color: selectedSport.accentColor || '#7c3aed' }}>Create Tournament</div>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex-wrap-mobile" style={{ padding: '16px', borderRadius: '12px', background: `${selectedSport.accentColor || '#7c3aed'}10`, border: `1px solid ${selectedSport.accentColor || '#7c3aed'}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ fontSize: '24px' }}>🔒</div>
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: selectedSport.accentColor || '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Context Lock</div>
                                                <div style={{ fontSize: '16px', fontWeight: 800, color: "inherit" }}>{activeTournament.name}</div>
                                            </div>
                                        </div>
                                        <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'white', fontSize: '12px', fontWeight: 700, color: selectedSport.accentColor || '#7c3aed', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                            {sportLabel} • {activeTournament.format}
                                        </span>
                                    </div>
                                    <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                        {[
                                            { href: `/tournaments/${activeTournament.id}?tab=overview`, label: 'Overview', desc: 'Stats & Activity', icon: '🏆', gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
                                            { href: `/tournaments/${activeTournament.id}?tab=teams`, label: 'Teams', desc: 'Registrations & Squads', icon: '📝', gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
                                            { href: `/tournaments/${activeTournament.id}?tab=fixtures`, label: 'Fixtures', desc: 'Schedule & Results', icon: '📅', gradient: 'linear-gradient(135deg, #991b1b, #dc2626)' },
                                            { href: `/tournaments/${activeTournament.id}?tab=scoring`, label: 'Live Scoring', desc: 'Score Matches', icon: '🔴', gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
                                            { href: `/tournaments/${activeTournament.id}?tab=auction`, label: 'Auction', desc: 'Live Bidding', icon: '🔨', gradient: 'linear-gradient(135deg, #166534, #22c55e)' },
                                            { href: `/tournaments/${activeTournament.id}?tab=transfers`, label: 'Transfers', desc: 'Player Movement', icon: '🔄', gradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)' },
                                            { href: `/tournaments/${activeTournament.id}?tab=financials`, label: 'Financials', desc: 'Fees & Payouts', icon: '💰', gradient: 'linear-gradient(135deg, #854d0e, #ca8a04)' },
                                            { href: `/tournaments/${activeTournament.id}?tab=leaderboard`, label: 'Leaderboard', desc: 'Points & Rankings', icon: '🥇', gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
                                            { href: `/tournaments/${activeTournament.id}?tab=chat`, label: 'Chat', desc: 'Team & Admin Comm', icon: '💬', gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
                                            { href: `/tournaments/${activeTournament.id}?tab=media`, label: 'Media', desc: 'Photos & Videos', icon: '📸', gradient: 'linear-gradient(135deg, #9d174d, #ec4899)' },
                                            { href: `/tournaments/${activeTournament.id}?tab=settings`, label: 'Settings', desc: 'Configure Tournament', icon: '⚙️', gradient: 'linear-gradient(135deg, #1e293b, #334155)' },
                                        ].map((item) => (
                                            <Link key={item.label} href={item.href} className="card-hover" style={{
                                                display: 'block', padding: '24px', borderRadius: '16px', background: item.gradient,
                                                textDecoration: 'none', color: 'white', position: 'relative', overflow: 'hidden'
                                            }}>
                                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                                                <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{item.label}</div>
                                                <div style={{ fontSize: '12px', opacity: 0.85 }}>{item.desc}</div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* ─── Team Manager & Other Roles Quick Access Cards ─── */}
                {
                    roleGroup !== 'organizer' && (
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: theme.textPrimary }}>
                                {theme.sectionTitle}
                            </h2>
                            <p style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '16px' }}>
                                {theme.quickAccessTitle}
                            </p>
                            <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                                {quickCards.map((item) => (
                                    <Link key={item.href} href={`${item.href}${selectedSport ? `?sport=${selectedSport.id}` : ''}`} className="card-hover" style={{
                                        padding: '24px', borderRadius: '16px', background: item.gradient,
                                        textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s',
                                    }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>{item.icon}</div>
                                        <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>{item.label}</div>
                                        <div style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.4 }}>{item.desc}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* ─── Live Matches (filtered by selected sport) ─── */}
                {
                    (() => {
                        const filteredLive = selectedSport
                            ? liveMatches.filter((m: any) => m.sport?.name === selectedSport.name || m.sport?.id === selectedSport.id)
                            : liveMatches;
                        return filteredLive.length > 0 ? (
                            <div style={{ marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="live-pulse"></span> Live {sportLabel} Matches
                                </h2>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                    {filteredLive.map((match: any) => (
                                        <Link href={`/matches/${match.id}`} key={match.id} className="card-hover" style={{
                                            padding: '20px', borderRadius: '14px',
                                            background: theme.cardBg, border: '2px solid #fecaca',
                                            textDecoration: 'none', color: theme.textPrimary,
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '20px' }}>{sportIcons[match.sport?.name] || sportIcon}</span>
                                                <span className="status-badge" style={{ background: '#fef2f2', color: "inherit" }}>
                                                    <span className="live-pulse"></span> LIVE
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '15px', fontWeight: 700 }}>
                                                {match.homeTeam?.name || 'TBD'} vs {match.awayTeam?.name || 'TBD'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: "inherit", marginTop: '4px' }}>{match.tournament?.name}</div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : null;
                    })()
                }

            </div >

            {/* ─── DYNAMIC SPORT ONBOARDING MODAL ─── */}
            {
                onboardingSport && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{
                            background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px',
                            overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}>
                            <div style={{ padding: '24px 32px', background: onboardingSport.accentColor || '#6366f1', color: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ fontSize: '36px' }}>
                                    <SportIcon sport={onboardingSport.name} size={42} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Welcome to {onboardingSport.name}!</h2>
                                    <p style={{ fontSize: '14px', opacity: 0.9 }}>Let's set up your sport profile.</p>
                                </div>
                            </div>
                            <div style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {(user?.role === 'TEAM_MANAGER' ? SPORT_FORMS.TEAM_MANAGER : SPORT_FORMS[onboardingSport.name])?.map((field) => (
                                        <div key={field.id}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: "inherit", marginBottom: '8px' }}>
                                                {field.label}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    value={onboardingAnswers[field.id] || ''}
                                                    onChange={(e) => setOnboardingAnswers({ ...onboardingAnswers, [field.id]: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '15px', color: "inherit", background: '#f8fafc', outline: 'none', transition: 'border 0.2s', cursor: 'pointer' }}
                                                    onFocus={(e) => e.target.style.borderColor = onboardingSport.accentColor || '#6366f1'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                >
                                                    <option value="" disabled>Select an option...</option>
                                                    {field.options?.map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : field.type === 'file' ? (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setOnboardingAnswers({ ...onboardingAnswers, [field.id]: reader.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px dashed #e2e8f0', fontSize: '15px', color: '#64748b', background: onboardingAnswers[field.id] ? '#f0fdf4' : 'transparent', cursor: 'pointer', outline: 'none', transition: 'border 0.2s' }}
                                                    onFocus={(e) => e.target.style.borderColor = onboardingSport.accentColor || '#6366f1'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    placeholder={field.placeholder || ''}
                                                    value={onboardingAnswers[field.id] || ''}
                                                    onChange={(e) => setOnboardingAnswers({ ...onboardingAnswers, [field.id]: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '15px', color: "inherit", background: '#f8fafc', outline: 'none', transition: 'border 0.2s' }}
                                                    onFocus={(e) => e.target.style.borderColor = onboardingSport.accentColor || '#6366f1'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setOnboardingSport(null)} disabled={isSavingSport} style={{ padding: '12px 24px', borderRadius: '12px', background: '#f1f5f9', color: "inherit", fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
                                        Cancel
                                    </button>
                                    <button onClick={() => executeAddSport(onboardingSport, onboardingAnswers)} disabled={isSavingSport} style={{ padding: '12px 32px', borderRadius: '12px', background: onboardingSport.accentColor || '#6366f1', color: 'white', fontWeight: 800, fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px ${(onboardingSport.accentColor || '#6366f1')}60`, transition: 'all 0.2s', transform: isSavingSport ? 'scale(0.98)' : 'scale(1)', opacity: isSavingSport ? 0.7 : 1 }}>
                                        {isSavingSport ? 'Saving...' : 'Complete Setup'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

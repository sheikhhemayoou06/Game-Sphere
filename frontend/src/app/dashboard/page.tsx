'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useSportStore } from '@/lib/store';
import { api } from '@/lib/api';
import { roleLabels, sportIcons, sportColors, formatDate } from '@/lib/utils';
import { Fingerprint, Radio, Users, Shield, ClipboardList, Gamepad2, Scale, Trophy, Medal, IdCard, Siren, Dumbbell, Calendar, MessageSquare, Gavel, CreditCard, Bell, HelpCircle, LayoutGrid, BarChart3, Settings, ShieldCheck, FileText, DollarSign, Upload, Package, Gem, Landmark, Award, ArrowLeftRight, FileCheck, CircleDot, Zap, Pen, Camera, Search as SearchIcon } from 'lucide-react';
import SportIcon from '@/components/SportIcon';

/* ═══════════════════════════════════════════════════════════════
   SPORT-SPECIFIC MOCK DATA
   ═══════════════════════════════════════════════════════════════ */

const SPORT_DATA: Record<string, {
    matches: { opp: string; date: string; venue: string }[];
    requests: { text: string; status: string; icon: string; color: string }[];
    notifications: { text: string; time: string; unread: boolean }[];
    payments: { desc: string; amount: string; status: string; due: string }[];
    profileBadge: string;
    piScore: number;
    winRate: string;
    teamName: string;
}> = {
    Cricket: {
        matches: [
            { opp: 'vs Royal Strikers', date: '25 Feb, 2:00 PM', venue: 'Wankhede Stadium' },
            { opp: 'vs Blazing Eagles', date: '02 Mar, 10:00 AM', venue: 'DY Patil Ground' },
            { opp: 'vs Iron Wolves', date: '08 Mar, 4:00 PM', venue: 'Brabourne Stadium' },
        ],
        requests: [
            { text: 'Application to Golden Lions CC', status: 'PENDING', icon: '📤', color: '#f59e0b' },
            { text: 'Join invite — Phoenix Rising CC', status: 'NEW', icon: '📥', color: '#6366f1' },
            { text: 'Join invite — Iron Wolves CC', status: 'NEW', icon: '📥', color: '#6366f1' },
        ],
        notifications: [
            { text: 'Auction bid placed on you — ₹1,75,000', time: '2h ago', unread: true },
            { text: 'Cricket practice session tomorrow at 6 AM', time: '3h ago', unread: true },
            { text: 'State Cricket Championship registration confirmed', time: '1d ago', unread: false },
            { text: 'Payment received — Cricket Tournament fee ₹2,500', time: '2d ago', unread: false },
            { text: 'Your cricket profile was viewed 12 times', time: '3d ago', unread: false },
        ],
        payments: [
            { desc: 'Cricket Equipment Deposit', amount: '₹3,000', status: 'PENDING', due: '22 Feb' },
            { desc: 'State Cricket League Fee', amount: '₹2,000', status: 'OVERDUE', due: '05 Feb' },
            { desc: 'Cricket Auction Selection Fee', amount: '₹5,000', status: 'PENDING', due: '28 Feb' },
        ],
        profileBadge: '🏏 Cricket', piScore: 82, winRate: '71%', teamName: 'Thunder Warriors',
    },
    Football: {
        matches: [
            { opp: 'vs Delhi Dynamos', date: '26 Feb, 5:00 PM', venue: 'Nehru Stadium' },
            { opp: 'vs Kerala Blasters', date: '04 Mar, 7:30 PM', venue: 'Salt Lake Stadium' },
            { opp: 'vs Goa United', date: '10 Mar, 3:00 PM', venue: 'Fatorda Stadium' },
        ],
        requests: [
            { text: 'Application to Mumbai FC', status: 'PENDING', icon: '📤', color: '#f59e0b' },
            { text: 'Trial invite — Bengaluru FC', status: 'NEW', icon: '📥', color: '#6366f1' },
        ],
        notifications: [
            { text: 'Football training rescheduled to 5 PM', time: '1h ago', unread: true },
            { text: 'ISL scout viewed your profile', time: '4h ago', unread: true },
            { text: 'District Football League starts next week', time: '1d ago', unread: false },
            { text: 'Match fee payment confirmed — ₹1,500', time: '2d ago', unread: false },
        ],
        payments: [
            { desc: 'Football Kit & Boots', amount: '₹4,500', status: 'PENDING', due: '25 Feb' },
            { desc: 'Football League Registration', amount: '₹1,500', status: 'PENDING', due: '01 Mar' },
        ],
        profileBadge: '⚽ Football', piScore: 75, winRate: '62%', teamName: 'Mumbai Strikers',
    },
    Basketball: {
        matches: [
            { opp: 'vs Chennai Snipers', date: '27 Feb, 6:00 PM', venue: 'Kanteerava Arena' },
            { opp: 'vs Punjab Panthers', date: '05 Mar, 4:00 PM', venue: 'Thyagraj Stadium' },
        ],
        requests: [
            { text: 'Application to Delhi Dunksters', status: 'PENDING', icon: '📤', color: '#f59e0b' },
        ],
        notifications: [
            { text: '3x3 Basketball tournament announced', time: '2h ago', unread: true },
            { text: 'Basketball gym session today at 4 PM', time: '5h ago', unread: true },
            { text: 'State Basketball selections next month', time: '1d ago', unread: false },
        ],
        payments: [
            { desc: 'Basketball Equipment', amount: '₹3,000', status: 'PENDING', due: '22 Feb' },
            { desc: 'Court Booking Fee', amount: '₹800', status: 'PENDING', due: '26 Feb' },
        ],
        profileBadge: '🏀 Basketball', piScore: 68, winRate: '58%', teamName: 'Mumbai Mavericks',
    },
    Hockey: {
        matches: [
            { opp: 'vs Punjab Warriors', date: '28 Feb, 3:00 PM', venue: 'Major Dhyan Chand Stadium' },
            { opp: 'vs Odisha Tigers', date: '06 Mar, 5:00 PM', venue: 'Kalinga Stadium' },
        ],
        requests: [
            { text: 'Join invite — Mumbai Magicians HC', status: 'NEW', icon: '📥', color: '#6366f1' },
        ],
        notifications: [
            { text: 'Hockey India League registration open', time: '3h ago', unread: true },
            { text: 'Turf practice booked for Saturday', time: '6h ago', unread: false },
        ],
        payments: [
            { desc: 'Hockey Stick & Gear', amount: '₹4,000', status: 'PENDING', due: '28 Feb' },
        ],
        profileBadge: '🏑 Hockey', piScore: 70, winRate: '60%', teamName: 'Mumbai Magicians',
    },
    Tennis: {
        matches: [
            { opp: 'vs Ravi Kumar', date: '01 Mar, 10:00 AM', venue: 'MSLTA Complex' },
            { opp: 'vs Arjun Desai', date: '07 Mar, 2:00 PM', venue: 'CCI Courts' },
        ],
        requests: [],
        notifications: [
            { text: 'Tennis coaching session confirmed', time: '1h ago', unread: true },
            { text: 'State Ranking updated — #45', time: '1d ago', unread: false },
        ],
        payments: [
            { desc: 'Court Membership Fee', amount: '₹6,000', status: 'PENDING', due: '01 Mar' },
        ],
        profileBadge: '🎾 Tennis', piScore: 73, winRate: '65%', teamName: 'Solo',
    },
    Badminton: {
        matches: [
            { opp: 'vs Priya Sharma', date: '02 Mar, 11:00 AM', venue: 'Gopichand Academy' },
        ],
        requests: [
            { text: 'Doubles pairing request — Smash Kings', status: 'NEW', icon: '📥', color: '#6366f1' },
        ],
        notifications: [
            { text: 'Badminton league draw announced', time: '4h ago', unread: true },
            { text: 'Badminton shuttlecock order delivered', time: '1d ago', unread: false },
        ],
        payments: [
            { desc: 'Racquet Restringing', amount: '₹1,200', status: 'PENDING', due: '24 Feb' },
        ],
        profileBadge: '🏸 Badminton', piScore: 65, winRate: '55%', teamName: 'Smash Kings',
    },
    Athletics: {
        matches: [
            { opp: '100m Sprint — State Meet', date: '03 Mar, 9:00 AM', venue: 'Shiv Chhatrapati Complex' },
            { opp: '4x400m Relay — District', date: '09 Mar, 11:00 AM', venue: 'SAI Complex' },
        ],
        requests: [],
        notifications: [
            { text: 'Athletics trials date announced — March 15', time: '2h ago', unread: true },
            { text: 'Track practice tomorrow at 5:30 AM', time: '8h ago', unread: false },
        ],
        payments: [
            { desc: 'Running Shoes & Spikes', amount: '₹5,500', status: 'PENDING', due: '25 Feb' },
        ],
        profileBadge: '🏃 Athletics', piScore: 78, winRate: '72%', teamName: 'Sprint Squad',
    },
    Kabaddi: {
        matches: [
            { opp: 'vs Patna Pirates', date: '04 Mar, 8:00 PM', venue: 'Tau Devi Lal Stadium' },
            { opp: 'vs Bengal Warriors', date: '11 Mar, 8:00 PM', venue: 'NSCI Dome' },
        ],
        requests: [
            { text: 'Trial invite — U Mumba', status: 'NEW', icon: '📥', color: '#6366f1' },
        ],
        notifications: [
            { text: 'Kabaddi camp registration opens tomorrow', time: '1h ago', unread: true },
            { text: 'Mat practice rescheduled to 6 PM', time: '5h ago', unread: false },
        ],
        payments: [
            { desc: 'Inter-District Kabaddi Fee', amount: '₹2,000', status: 'OVERDUE', due: '05 Feb' },
            { desc: 'Kabaddi Mat Booking', amount: '₹1,500', status: 'PENDING', due: '28 Feb' },
        ],
        profileBadge: '🤼 Kabaddi', piScore: 80, winRate: '68%', teamName: 'Mumbai Raiders',
    },
};

// Fallback for any sport not in the map
const DEFAULT_SPORT_DATA = {
    matches: [{ opp: 'vs Opponent TBD', date: 'TBD', venue: 'TBD' }],
    requests: [],
    notifications: [{ text: 'Welcome to this sport!', time: 'now', unread: true }],
    payments: [],
    profileBadge: '🏅 Sport', piScore: 50, winRate: '50%', teamName: 'My Team',
};

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
    { href: '/tournaments', label: 'Tournaments', desc: 'Browse & join events', icon: <Trophy size={28} />, gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    { href: '/leaderboard', label: 'Leaderboard', desc: 'Your rankings', icon: <Medal size={28} />, gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
    { href: '/profile', label: 'My Profile', desc: 'Universal Sports ID', icon: <IdCard size={28} />, gradient: 'linear-gradient(135deg, #3730a3, #4f46e5)' },
    { href: '/scoring', label: 'Live Scores', desc: 'Real-time match updates', icon: <Siren size={28} />, gradient: 'linear-gradient(135deg, #991b1b, #dc2626)' },
    { href: '/training', label: 'Training', desc: 'Coaching programs', icon: <Dumbbell size={28} />, gradient: 'linear-gradient(135deg, #115e59, #14b8a6)' },
    { href: '/certificates', label: 'Certificates', desc: 'Your achievements', icon: <Award size={28} />, gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
    { href: '/teams', label: 'My Team', desc: 'Roster & teammates', icon: <Users size={28} />, gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
    { href: '/calendar', label: 'Calendar', desc: 'Upcoming events', icon: <Calendar size={28} />, gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' },
    { href: '/messages', label: 'Messages', desc: 'Chat with team', icon: <MessageSquare size={28} />, gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)' },
    { href: '/auction', label: 'Auction', desc: 'Player bidding & drafts', icon: <Gavel size={28} />, gradient: 'linear-gradient(135deg, #92400e, #f59e0b)' },
    { href: '/payments', label: 'Payments', desc: 'Fees & transactions', icon: <CreditCard size={28} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' },
    { href: '/notifications', label: 'Notifications', desc: 'Activity alerts', icon: <Bell size={28} />, gradient: 'linear-gradient(135deg, #9f1239, #be123c)' },
    { href: '/help', label: 'Help & Support', desc: 'FAQ & contact', icon: <HelpCircle size={28} />, gradient: 'linear-gradient(135deg, #854d0e, #d97706)' },
];

// ─── TEAM MANAGER: Team operations, apply for tournaments (no creation) ───
const TEAM_MANAGER_CARDS = [
    { href: '/tournaments', label: 'Tournaments', desc: 'Browse & apply for events', icon: <Trophy size={28} />, gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    { href: '/teams', label: 'My Team', desc: 'Manage roster & squad', icon: <Users size={28} />, gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
    { href: '/fixtures', label: 'Fixtures', desc: 'Upcoming matches', icon: <ClipboardList size={28} />, gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { href: '/scoring', label: 'Live Scores', desc: 'Real-time match updates', icon: <Siren size={28} />, gradient: 'linear-gradient(135deg, #991b1b, #dc2626)' },
    { href: '/auction', label: 'Auction', desc: 'Player bidding & drafts', icon: <Gavel size={28} />, gradient: 'linear-gradient(135deg, #92400e, #f59e0b)' },
    { href: '/financial', label: 'Financial', desc: 'Revenue & payments', icon: <DollarSign size={28} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)' },
    { href: '/transfers', label: 'Transfers', desc: 'Player movement hub', icon: <ArrowLeftRight size={28} />, gradient: 'linear-gradient(135deg, #14532d, #166534)' },
    { href: '/leaderboard', label: 'Leaderboard', desc: 'Player rankings', icon: <Medal size={28} />, gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
    { href: '/calendar', label: 'Calendar', desc: 'Event schedule', icon: <Calendar size={28} />, gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' },
    { href: '/messages', label: 'Messages', desc: 'Communication hub', icon: <MessageSquare size={28} />, gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)' },
    { href: '/payments', label: 'Payments', desc: 'Fees & transactions', icon: <CreditCard size={28} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' },
    { href: '/help', label: 'Help & Support', desc: 'FAQ & contact', icon: <HelpCircle size={28} />, gradient: 'linear-gradient(135deg, #854d0e, #d97706)' },
];

// ─── ORGANIZER: Event management & tournament creation ───
const ORGANIZER_CARDS = [
    { href: '/tournaments', label: 'My Tournaments', desc: 'Create & manage events', icon: <Trophy size={28} />, gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    { href: '/fixtures', label: 'Fixtures', desc: 'Brackets & scheduling', icon: <ClipboardList size={28} />, gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { href: '/scoring', label: 'Live Scoring', desc: 'Score ongoing matches', icon: <Siren size={28} />, gradient: 'linear-gradient(135deg, #991b1b, #dc2626)' },
    { href: '/teams', label: 'Teams', desc: 'Manage all rosters', icon: <Users size={28} />, gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
    { href: '/venues', label: 'Venues', desc: 'Stadiums & facilities', icon: <Landmark size={28} />, gradient: 'linear-gradient(135deg, #166534, #22c55e)' },
    { href: '/financial', label: 'Financial', desc: 'Revenue & payments', icon: <DollarSign size={28} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)' },
    { href: '/sponsorships', label: 'Sponsorships', desc: 'Sponsors & ad revenue', icon: <Gem size={28} />, gradient: 'linear-gradient(135deg, #854d0e, #ca8a04)' },
    { href: '/certificates', label: 'Certificates', desc: 'Award certificates', icon: <Award size={28} />, gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
    { href: '/transfers', label: 'Transfers', desc: 'Player movement hub', icon: <ArrowLeftRight size={28} />, gradient: 'linear-gradient(135deg, #14532d, #166534)' },
    { href: '/leaderboard', label: 'Leaderboard', desc: 'Player rankings', icon: <Medal size={28} />, gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
    { href: '/calendar', label: 'Calendar', desc: 'Event schedule', icon: <Calendar size={28} />, gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' },
    { href: '/messages', label: 'Messages', desc: 'Communication hub', icon: <MessageSquare size={28} />, gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)' },
    { href: '/reports', label: 'Match Reports', desc: 'Reports & protests', icon: <FileText size={28} />, gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { href: '/auction', label: 'Player Auction', desc: 'Run & manage auctions', icon: <Gavel size={28} />, gradient: 'linear-gradient(135deg, #92400e, #f59e0b)' },
    { href: '/payments', label: 'Payments', desc: 'Revenue & payouts', icon: <CreditCard size={28} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' },
    { href: '/notifications', label: 'Notifications', desc: 'Activity alerts', icon: <Bell size={28} />, gradient: 'linear-gradient(135deg, #9f1239, #be123c)' },
    { href: '/help', label: 'Help', desc: 'Support & FAQ', icon: <HelpCircle size={28} />, gradient: 'linear-gradient(135deg, #854d0e, #d97706)' },
];

// ─── OFFICIAL / REFEREE: Match management & rules ───
const OFFICIAL_CARDS = [
    { href: '/scoring', label: 'Live Scoring', desc: 'Score & officiate matches', icon: <Siren size={28} />, gradient: 'linear-gradient(135deg, #991b1b, #dc2626)' },
    { href: '/fixtures', label: 'Fixtures', desc: 'Match assignments', icon: <ClipboardList size={28} />, gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { href: '/tournaments', label: 'Tournaments', desc: 'Assigned events', icon: <Trophy size={28} />, gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    { href: '/reports', label: 'Match Reports', desc: 'File reports & decisions', icon: <Pen size={28} />, gradient: 'linear-gradient(135deg, #0f172a, #334155)' },
    { href: '/grievances', label: 'Grievances', desc: 'Dispute resolution', icon: <Scale size={28} />, gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
    { href: '/teams', label: 'Teams', desc: 'View team rosters', icon: <Users size={28} />, gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
    { href: '/venues', label: 'Venues', desc: 'Match locations', icon: <Landmark size={28} />, gradient: 'linear-gradient(135deg, #166534, #22c55e)' },
    { href: '/calendar', label: 'Match Schedule', desc: 'Your assignments', icon: <Calendar size={28} />, gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' },
    { href: '/leaderboard', label: 'Leaderboard', desc: 'Rankings overview', icon: <Medal size={28} />, gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
    { href: '/profile', label: 'My Profile', desc: 'Official profile', icon: <IdCard size={28} />, gradient: 'linear-gradient(135deg, #3730a3, #4f46e5)' },
    { href: '/payments', label: 'Payments', desc: 'Match fees & payouts', icon: <CreditCard size={28} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' },
    { href: '/messages', label: 'Messages', desc: 'Communication', icon: <MessageSquare size={28} />, gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)' },
    { href: '/notifications', label: 'Notifications', desc: 'Alerts & updates', icon: <Bell size={28} />, gradient: 'linear-gradient(135deg, #9f1239, #be123c)' },
];

// ─── ADMIN: Full platform management ───
const ADMIN_CARDS = [
    { href: '/analytics', label: 'Analytics', desc: 'Platform insights & metrics', icon: <BarChart3 size={28} />, gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)' },
    { href: '/admin', label: 'Admin Panel', desc: 'System management', icon: <Settings size={28} />, gradient: 'linear-gradient(135deg, #0f172a, #1e293b)' },
    { href: '/roles', label: 'Roles & Permissions', desc: 'Access control', icon: <ShieldCheck size={28} />, gradient: 'linear-gradient(135deg, #1e293b, #475569)' },
    { href: '/tournaments', label: 'Tournaments', desc: 'Manage all events', icon: <Trophy size={28} />, gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    { href: '/audit', label: 'Audit Log', desc: 'Activity tracking', icon: <FileText size={28} />, gradient: 'linear-gradient(135deg, #0f172a, #334155)' },
    { href: '/financial', label: 'Financial', desc: 'Revenue & payments', icon: <DollarSign size={28} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)' },
    { href: '/exports', label: 'Reports Center', desc: 'Data export & reports', icon: <Upload size={28} />, gradient: 'linear-gradient(135deg, #065f46, #22c55e)' },
    { href: '/inventory', label: 'Inventory', desc: 'Equipment management', icon: <Package size={28} />, gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
    { href: '/sponsorships', label: 'Sponsorships', desc: 'Sponsors & revenue', icon: <Gem size={28} />, gradient: 'linear-gradient(135deg, #854d0e, #ca8a04)' },
    { href: '/venues', label: 'Venues', desc: 'Stadiums & facilities', icon: <Landmark size={28} />, gradient: 'linear-gradient(135deg, #166534, #22c55e)' },
    { href: '/fixtures', label: 'Fixtures', desc: 'Bracket generation', icon: <ClipboardList size={28} />, gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { href: '/certificates', label: 'Certificates', desc: 'QR-verifiable certs', icon: <Award size={28} />, gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
    { href: '/transfers', label: 'Transfers', desc: 'Player movement', icon: <ArrowLeftRight size={28} />, gradient: 'linear-gradient(135deg, #14532d, #166534)' },
    { href: '/documents', label: 'Documents', desc: 'Paperless verification', icon: <FileCheck size={28} />, gradient: 'linear-gradient(135deg, #581c87, #7e22ce)' },
    { href: '/grievances', label: 'Grievances', desc: 'Dispute resolution', icon: <Scale size={28} />, gradient: 'linear-gradient(135deg, #78350f, #b45309)' },
    { href: '/scoring', label: 'Live Scoring', desc: 'Real-time scoring', icon: <Siren size={28} />, gradient: 'linear-gradient(135deg, #991b1b, #dc2626)' },
    { href: '/leaderboard', label: 'Leaderboard', desc: 'Player rankings', icon: <Medal size={28} />, gradient: 'linear-gradient(135deg, #92400e, #d97706)' },
    { href: '/teams', label: 'All Teams', desc: 'Manage rosters', icon: <Users size={28} />, gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
    { href: '/training', label: 'Training', desc: 'Coaching programs', icon: <Dumbbell size={28} />, gradient: 'linear-gradient(135deg, #115e59, #14b8a6)' },
    { href: '/messages', label: 'Messages', desc: 'Internal chat', icon: <MessageSquare size={28} />, gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)' },
    { href: '/reports', label: 'Match Reports', desc: 'Reports & protests', icon: <FileText size={28} />, gradient: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { href: '/notifications', label: 'Notifications', desc: 'System alerts', icon: <Bell size={28} />, gradient: 'linear-gradient(135deg, #9f1239, #be123c)' },
    { href: '/calendar', label: 'Calendar', desc: 'All events', icon: <Calendar size={28} />, gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' },
    { href: '/media', label: 'Media', desc: 'Photos & videos', icon: <Camera size={28} />, gradient: 'linear-gradient(135deg, #9d174d, #ec4899)' },
    { href: '/auction', label: 'Player Auction', desc: 'Manage all auctions', icon: <Gavel size={28} />, gradient: 'linear-gradient(135deg, #92400e, #f59e0b)' },
    { href: '/payments', label: 'Payments', desc: 'All transactions', icon: <CreditCard size={28} />, gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' },
    { href: '/profile', label: 'Player Profiles', desc: 'View any profile', icon: <IdCard size={28} />, gradient: 'linear-gradient(135deg, #3730a3, #4f46e5)' },
    { href: '/help', label: 'Help', desc: 'Support & FAQ', icon: <HelpCircle size={28} />, gradient: 'linear-gradient(135deg, #854d0e, #d97706)' },
];

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
        emoji: '⚡', sectionTitle: '⚡ Team Management', quickAccessTitle: 'Team Operations',
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
        emoji: '👋', sectionTitle: '⚡ Quick Access', quickAccessTitle: 'Your Sports Hub',
        navLinks: [
            { href: '/tournaments', label: 'Tournaments' },
            { href: '/leaderboard', label: 'Leaderboard' },
            { href: '/training', label: 'Training' },
            { href: '/profile', label: 'My Profile' },
        ],
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
    const [ownerDashData, setOwnerDashData] = useState<any>(null);
    const [sportLoading, setSportLoading] = useState(false);
    const [showAddSport, setShowAddSport] = useState(false);
    const router = useRouter();

    const role = user?.role || 'PLAYER';
    const roleGroup = getRoleGroup(role);
    const theme = ROLE_THEMES[roleGroup];
    const quickCards = ROLE_CARDS[roleGroup];
    const isOwnerRole = roleGroup === 'team_manager' || roleGroup === 'organizer';

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
            api.getLiveMatches().then(setLiveMatches).catch(() => { });
            const savedMyIds = loadMySportIds();
            api.getSports().then((allSports) => {
                setSports(allSports);
                setAvailableSports(allSports);
                if (savedMyIds.length > 0) {
                    // User already has chosen sports — restore selection
                    const savedId = loadSelectedSport();
                    const saved = allSports.find((s: any) => s.id === savedId);
                    if (saved) setSelectedSport(saved);
                    else {
                        const firstMy = allSports.find((s: any) => savedMyIds.includes(s.id));
                        if (firstMy) setSelectedSport(firstMy);
                    }
                }
                // else: no saved sports → picker overlay will show
            }).catch(() => { });
            if (isOwnerRole) {
                api.getMySports().catch(() => { });
            }
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
    const showSportPicker = availableSports.length > 0 && mySportIds.length === 0;

    // User's chosen sports (filtered from all available)
    const mySports = availableSports.filter((s: any) => mySportIds.includes(s.id));
    // Sports not yet added by the user
    const remainingSports = availableSports.filter((s: any) => !mySportIds.includes(s.id));

    if (!loaded || !isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '24px' }}>⏳ Loading...</div>
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
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌐</div>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>Choose Your Sport</h1>
                    <p style={{ fontSize: '16px', color: '#c4b5fd', maxWidth: '500px' }}>
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
                            <button key={sp.id} onClick={() => { addMySport(sp.id); setSelectedSport(sp); }} style={{
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
                <p style={{ fontSize: '13px', color: '#a78bfa', marginTop: '32px' }}>
                    🔄 You can switch sports anytime from the dashboard
                </p>
            </div>
        );
    }

    /* ─── Role-specific stats ─── */
    const statsMap: Record<RoleGroup, { label: string; value: any; icon: any; color: string }[]> = {
        admin: [
            { label: 'Admin ID', value: user?.id?.substring(0, 8) || 'N/A', icon: <Fingerprint size={28} />, color: '#6366f1' },
            { label: 'Live Matches', value: liveMatches.length, icon: <Radio size={28} />, color: '#ef4444' },
            { label: 'Platform Users', value: 12450, icon: <Users size={28} />, color: '#10b981' },
            { label: 'Admin Level', value: roleLabels[role] || role, icon: <Shield size={28} />, color: '#f59e0b' },
        ],
        organizer: [
            { label: 'Organizer ID', value: user?.id?.substring(0, 8) || 'N/A', icon: <Fingerprint size={28} />, color: '#7c3aed' },
            { label: 'Live Scoring', value: liveMatches.length > 0 ? 'Active' : 'None', icon: <Radio size={28} />, color: '#ef4444' },
            { label: 'Active Teams', value: ownerDashData?.teams?.length || 0, icon: <Users size={28} />, color: '#10b981' },
            { label: 'Role', value: roleLabels[role] || role, icon: <Shield size={28} />, color: '#6d28d9' },
        ],
        team_manager: [
            { label: 'Manager ID', value: user?.id?.substring(0, 8) || 'N/A', icon: <Fingerprint size={28} />, color: '#7c3aed' },
            { label: 'Live Scoring', value: liveMatches.length > 0 ? 'Active' : 'None', icon: <Radio size={28} />, color: '#ef4444' },
            { label: 'My Teams', value: ownerDashData?.teams?.length || 0, icon: <Users size={28} />, color: '#10b981' },
            { label: 'Role', value: roleLabels[role] || role, icon: <Shield size={28} />, color: '#a855f7' },
        ],
        official: [
            { label: 'Official ID', value: user?.id?.substring(0, 8) || 'N/A', icon: <Fingerprint size={28} />, color: '#16a34a' },
            { label: 'Live Matches', value: liveMatches.length, icon: <Radio size={28} />, color: '#ef4444' },
            { label: 'Matches Reffed', value: 34, icon: <ClipboardList size={28} />, color: '#0d9488' },
            { label: 'Role', value: roleLabels[role] || role, icon: <Scale size={28} />, color: '#15803d' },
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
                })(), icon: <Fingerprint size={28} />, color: '#6366f1'
            },
            { label: 'Live Matches', value: liveMatches.length, icon: <Radio size={28} />, color: '#ef4444' },
            { label: 'Connected Teams', value: 2, icon: <Users size={28} />, color: '#10b981' },
            { label: 'My Role', value: roleLabels[role] || role, icon: <Gamepad2 size={28} />, color: '#f59e0b' },
        ],
    };

    const stats = statsMap[roleGroup];

    /* ─── Banner subtitle ─── */
    const sportLabel = selectedSport?.name || 'Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '🏅';
    const currentSportData = selectedSport ? (SPORT_DATA[selectedSport.name] || DEFAULT_SPORT_DATA) : DEFAULT_SPORT_DATA;

    const bannerSubtitles: Record<RoleGroup, string> = {
        admin: `Platform Administrator Dashboard — ${sportLabel} Management`,
        organizer: `${sportIcon} ${sportLabel} Tournament Management`,
        team_manager: `${sportIcon} ${sportLabel} Team Management Dashboard`,
        official: `${sportIcon} ${sportLabel} Match Official Dashboard`,
        player: `${sportIcon} Your ${sportLabel} Dashboard`,
    };

    return (
        <div style={{ minHeight: '100vh', background: theme.bg }}>
            {/* ─── Top Navigation ─── */}
            <nav style={{
                padding: '16px 32px', background: theme.navBg,
                borderBottom: `1px solid ${theme.navBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <span style={{ fontSize: '24px' }}>🌐</span>
                    <span className="gradient-text" style={{ fontSize: '20px', fontWeight: 800 }}>Game Sphere</span>
                </Link>
                <div className="flex-wrap-mobile" style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-start' }}>
                    {theme.navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="hide-mobile" style={{
                            fontSize: '14px', fontWeight: 500, color: theme.textSecondary, textDecoration: 'none',
                        }}>
                            {link.label}
                        </Link>
                    ))}
                    <div style={{
                        padding: '6px 14px', borderRadius: '8px',
                        background: theme.badgeBg, fontSize: '13px', fontWeight: 600, color: theme.badgeText,
                    }}>
                        {roleLabels[role] || role}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: theme.textPrimary }}>
                        {user?.firstName} {user?.lastName}
                    </div>
                    <button onClick={() => { logout(); router.push('/'); }} style={{
                        padding: '8px 16px', borderRadius: '8px',
                        border: `1px solid ${theme.navBorder}`,
                        background: roleGroup === 'admin' ? '#334155' : 'white',
                        color: theme.textPrimary, cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                    }}>
                        Logout
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

                {/* ─── Sport Selector Bar (only user's chosen sports) ─── */}
                {mySports.length > 0 && selectedSport && (
                    <div className="flex-wrap-mobile" style={{
                        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px',
                        padding: '12px 16px', borderRadius: '14px',
                        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, justifyContent: 'flex-start'
                    }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: theme.textSecondary, marginRight: '4px' }}>🏅 Sport:</span>
                        {mySports.map((sp: any) => {
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
                        })}
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
                                                    addMySport(sp.id);
                                                    setSelectedSport(sp);
                                                    setShowAddSport(false);
                                                }} style={{
                                                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                                                    cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                                    border: 'none', background: 'transparent',
                                                    color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '8px',
                                                    textAlign: 'left', transition: 'background 0.15s',
                                                }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = `${accent}15`)}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                                    <SportIcon sport={sp.name} size={20} color={accent} />
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
                {isOwnerRole && sportLoading && (
                    <div style={{ textAlign: 'center', padding: '32px', color: theme.textSecondary }}>
                        ⏳ Loading {selectedSport?.name} dashboard...
                    </div>
                )}





                {/* ─── Player Dashboard Widgets (Sport-Filtered) ─── */}
                {roleGroup === 'player' && selectedSport && currentSportData && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>

                        {/* Profile Summary */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `1px solid ${selectedSport.accentColor || '#6366f1'}20` }}>
                            <Link href="/profile" style={{ textDecoration: 'none', color: '#1e1b4b' }}>
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
                                <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                    <span style={{ padding: '3px 10px', borderRadius: '6px', background: `${selectedSport.accentColor || '#4338ca'}15`, color: selectedSport.accentColor || '#4338ca', fontWeight: 600 }}>{currentSportData.profileBadge}</span>
                                    <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#f0fdf4', color: '#16a34a', fontWeight: 600 }}>⚡ PI: {currentSportData.piScore}</span>
                                    <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#fefce8', color: '#ca8a04', fontWeight: 600 }}>{currentSportData.winRate} Win</span>
                                </div>
                            </Link>
                        </div>

                        {/* Upcoming Matches */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `1px solid ${selectedSport.accentColor || '#6366f1'}20` }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#64748b', marginBottom: '10px' }}>{sportIcon} UPCOMING {sportLabel.toUpperCase()} MATCHES</div>
                            {currentSportData.matches.map((m, i) => (
                                <div key={i} style={{ padding: '6px 0', borderBottom: i < currentSportData.matches.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{m.opp}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{m.date} • {m.venue}</div>
                                </div>
                            ))}
                        </div>

                        {/* Pending Requests */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `1px solid ${selectedSport.accentColor || '#6366f1'}20` }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#64748b', marginBottom: '10px' }}>📨 {sportLabel.toUpperCase()} REQUESTS</div>
                            {currentSportData.requests.length === 0 ? (
                                <div style={{ fontSize: '12px', color: '#94a3b8', padding: '12px 0' }}>No pending {sportLabel} requests</div>
                            ) : currentSportData.requests.map((r, i) => (
                                <div key={i} style={{ padding: '6px 0', borderBottom: i < currentSportData.requests.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span>{r.icon}</span>
                                        <span style={{ fontWeight: 600, fontSize: '12px', color: '#1e1b4b' }}>{r.text}</span>
                                    </div>
                                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: `${r.color}15`, color: r.color, fontSize: '10px', fontWeight: 700 }}>{r.status}</span>
                                </div>
                            ))}
                            <Link href="/teams" style={{ fontSize: '12px', color: selectedSport.accentColor || '#6366f1', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: '8px' }}>View all →</Link>
                        </div>

                        {/* Notifications */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `1px solid ${selectedSport.accentColor || '#6366f1'}20` }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#64748b', marginBottom: '10px' }}>🔔 {sportLabel.toUpperCase()} NOTIFICATIONS</div>
                            {currentSportData.notifications.map((n, i) => (
                                <div key={i} style={{ padding: '5px 0', borderBottom: i < currentSportData.notifications.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {n.unread && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedSport.accentColor || '#6366f1', flexShrink: 0 }} />}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: n.unread ? 700 : 500, fontSize: '12px', color: n.unread ? '#1e1b4b' : '#64748b' }}>{n.text}</div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{n.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Payment Dues */}
                        {currentSportData.payments.length > 0 && (
                            <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '2px solid #fecaca' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>💳 {sportLabel.toUpperCase()} PAYMENT DUES</div>
                                    <Link href="/payments" style={{ fontSize: '12px', fontWeight: 600, color: selectedSport.accentColor || '#6366f1', textDecoration: 'none' }}>Manage →</Link>
                                </div>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(currentSportData.payments.length, 3)}, 1fr)`, gap: '12px' }}>
                                    {currentSportData.payments.map((p, i) => (
                                        <div key={i} style={{ padding: '12px', borderRadius: '10px', background: p.status === 'OVERDUE' ? '#fef2f2' : '#fffbeb' }}>
                                            <div style={{ fontWeight: 700, fontSize: '15px', color: p.status === 'OVERDUE' ? '#ef4444' : '#f59e0b', marginBottom: '4px' }}>{p.amount}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{p.desc}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Due: {p.due}</span>
                                                <span style={{ padding: '2px 8px', borderRadius: '4px', background: p.status === 'OVERDUE' ? '#7f1d1d' : '#422006', color: p.status === 'OVERDUE' ? '#fca5a5' : '#fbbf24', fontSize: '10px', fontWeight: 700 }}>{p.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── ORGANIZER Dashboard Widgets (Tournament-Focused) ─── */}
                {roleGroup === 'organizer' && !sportLoading && selectedSport && activeTournament && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>

                        {/* Tournament Stats Summary */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `2px solid ${selectedSport.accentColor || '#e9d5ff'}30` }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#6d28d9', marginBottom: '12px' }}>🏆 TOURNAMENT OVERVIEW</div>
                            <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {[
                                    { label: 'My Tournaments', value: tournaments.filter((t: any) => t.sport?.id === selectedSport.id).length, icon: '🏆' },
                                    { label: 'Live Now', value: liveMatches.filter((m: any) => m.sport?.id === selectedSport.id).length, icon: '🔴' },
                                    { label: 'Active', value: tournaments.filter((t: any) => t.sport?.id === selectedSport.id && ['REGISTRATION', 'LIVE', 'FIXTURES'].includes(t.status)).length, icon: '✅' },
                                    { label: 'Completed', value: tournaments.filter((t: any) => t.sport?.id === selectedSport.id && t.status === 'COMPLETED').length, icon: '🏁' },
                                ].map((s, i) => (
                                    <div key={i} style={{ padding: '10px', borderRadius: '8px', background: '#faf5ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '18px' }}>{s.icon}</span>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e1b4b' }}>{s.value}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b' }}>{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Registration & Revenue */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f3e8ff' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#6d28d9', marginBottom: '12px' }}>💰 REVENUE & REGISTRATIONS</div>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {[
                                    { label: 'Total Registrations', value: tournaments.filter((t: any) => t.sport?.id === selectedSport.id).reduce((s: number, t: any) => s + (t._count?.teams || 0), 0), color: '#7c3aed' },
                                    { label: 'Registration Fees', value: `₹${tournaments.filter((t: any) => t.sport?.id === selectedSport.id).reduce((s: number, t: any) => s + ((t._count?.teams || 0) * (t.registrationFee || 0)), 0).toLocaleString()}`, color: '#22c55e' },
                                    { label: 'Prize Pools', value: `₹${tournaments.filter((t: any) => t.sport?.id === selectedSport.id).reduce((s: number, t: any) => s + (t.prizePool || 0), 0).toLocaleString()}`, color: '#f59e0b' },
                                ].map((s, i) => (
                                    <div key={i} style={{ padding: '10px', borderRadius: '8px', background: '#faf5ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</span>
                                        <span style={{ fontSize: '15px', fontWeight: 800, color: s.color }}>{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f3e8ff' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#6d28d9', marginBottom: '12px' }}>⚡ ORGANISER ACTIONS</div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <Link href={`/tournaments/create?sport=${selectedSport.id}`} style={{
                                    padding: '12px 16px', borderRadius: '10px', textDecoration: 'none',
                                    background: `linear-gradient(135deg, ${selectedSport.accentColor || '#7c3aed'}, ${selectedSport.accentColor || '#7c3aed'}88)`,
                                    color: 'white', fontWeight: 700, fontSize: '13px', display: 'block', textAlign: 'center',
                                }}>
                                    + Create {selectedSport.name} Tournament
                                </Link>
                                <Link href="/scoring" style={{
                                    padding: '10px 16px', borderRadius: '10px', textDecoration: 'none',
                                    background: '#fef2f2', color: '#ef4444', fontWeight: 600, fontSize: '12px', display: 'block', textAlign: 'center',
                                }}>
                                    🔴 Live Scoring Dashboard
                                </Link>
                                <Link href="/transfers" style={{
                                    padding: '10px 16px', borderRadius: '10px', textDecoration: 'none',
                                    background: '#f0fdf4', color: '#16a34a', fontWeight: 600, fontSize: '12px', display: 'block', textAlign: 'center',
                                }}>
                                    🔄 Transfer Approvals
                                </Link>
                                <Link href="/certificates" style={{
                                    padding: '10px 16px', borderRadius: '10px', textDecoration: 'none',
                                    background: '#fffbeb', color: '#f59e0b', fontWeight: 600, fontSize: '12px', display: 'block', textAlign: 'center',
                                }}>
                                    🏅 Issue Certificates
                                </Link>
                            </div>
                        </div>


                    </div>
                )}

                {/* ─── TEAM MANAGER Dashboard Widgets (Team-Focused) ─── */}
                {roleGroup === 'team_manager' && !sportLoading && selectedSport && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                        {/* Team Overview — from API data */}
                        {ownerDashData?.teams?.map((team: any) => (
                            <div key={team.id} style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `2px solid ${selectedSport.accentColor || '#e9d5ff'}30` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `linear-gradient(135deg, ${selectedSport.accentColor || '#7c3aed'}, ${selectedSport.accentColor || '#7c3aed'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{selectedSport.icon || sportIcons[selectedSport.name] || '🏅'}</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '16px', color: '#1e1b4b' }}>{team.name}</div>
                                        <div style={{ fontSize: '12px', color: selectedSport.accentColor || '#6d28d9' }}>{selectedSport.icon || sportIcons[selectedSport.name]} {selectedSport.name}</div>
                                    </div>
                                </div>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    {[
                                        { label: 'Record', value: `${ownerDashData.stats?.wins || 0}W-${ownerDashData.stats?.losses || 0}L`, color: '#16a34a' },
                                        { label: 'Players', value: team.playerCount, color: selectedSport.accentColor || '#7c3aed' },
                                        { label: 'Tournaments', value: team.tournamentCount, color: '#f59e0b' },
                                    ].map((s: any, i: number) => (
                                        <div key={i} style={{ textAlign: 'center', padding: '8px', borderRadius: '8px', background: '#faf5ff' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 800, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Roster Management — from API data */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f3e8ff' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#6d28d9', marginBottom: '12px' }}>👥 {selectedSport.name?.toUpperCase()} ROSTER</div>
                            <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                {[
                                    { label: 'Active Players', value: ownerDashData?.stats?.totalPlayers || 0, icon: '🟢' },
                                    { label: 'Total Matches', value: ownerDashData?.stats?.totalMatches || 0, icon: '🏏' },
                                    { label: 'Upcoming', value: ownerDashData?.stats?.upcomingCount || 0, icon: '📅' },
                                    { label: 'Live Now', value: ownerDashData?.stats?.liveCount || 0, icon: '🔴' },
                                ].map((s, i) => (
                                    <div key={i} style={{ padding: '8px', borderRadius: '8px', background: '#faf5ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{s.icon}</span>
                                        <div>
                                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e1b4b' }}>{s.value}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b' }}>{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href="/teams" style={{ fontSize: '12px', color: selectedSport.accentColor || '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>Manage roster →</Link>
                        </div>

                        {/* Player List (from roster) */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f3e8ff' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#6d28d9', marginBottom: '10px' }}>📋 PLAYERS ({ownerDashData?.roster?.length || 0})</div>
                            {(ownerDashData?.roster || []).slice(0, 6).map((p: any, i: number) => (
                                <div key={i} style={{ padding: '5px 0', borderBottom: i < 5 ? '1px solid #f3e8ff' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `linear-gradient(135deg, ${selectedSport.accentColor || '#6366f1'}, ${selectedSport.accentColor || '#6366f1'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '11px' }}>{p.name?.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e1b4b' }}>{p.name}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b' }}>{p.role || 'Player'} • #{p.jersey || '–'}</div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#64748b' }}>{p.sportMatchCount || 0} matches</span>
                                </div>
                            ))}
                            {(ownerDashData?.roster?.length || 0) > 6 && (
                                <Link href="/teams" style={{ fontSize: '11px', color: selectedSport.accentColor || '#7c3aed', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: '6px' }}>View all {ownerDashData.roster.length} players →</Link>
                            )}
                        </div>

                        {/* Tournaments for this sport */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #f3e8ff' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#6d28d9', marginBottom: '10px' }}>🏆 {selectedSport.name?.toUpperCase()} TOURNAMENTS</div>
                            {(ownerDashData?.tournaments || []).length === 0 ? (
                                <div style={{ fontSize: '12px', color: '#94a3b8', padding: '12px 0' }}>No {selectedSport.name} tournaments yet</div>
                            ) : (ownerDashData?.tournaments || []).slice(0, 5).map((t: any, i: number) => (
                                <div key={i} style={{ padding: '5px 0', borderBottom: i < 4 ? '1px solid #f3e8ff' : 'none' }}>
                                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e1b4b' }}>{t.name}</div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>{t.format} • {t.status} • Team: {t.teamName}</div>
                                </div>
                            ))}
                        </div>

                        {/* Upcoming Fixtures — from API data */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: `2px solid ${selectedSport.accentColor || '#e9d5ff'}30` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: selectedSport.accentColor || '#6d28d9' }}>🏟️ {selectedSport.name?.toUpperCase()} FIXTURES</div>
                                <Link href="/fixtures" style={{ fontSize: '12px', fontWeight: 600, color: selectedSport.accentColor || '#7c3aed', textDecoration: 'none' }}>All fixtures →</Link>
                            </div>
                            {(ownerDashData?.upcomingFixtures || []).length === 0 && (ownerDashData?.matchHistory || []).length === 0 ? (
                                <div style={{ fontSize: '12px', color: '#94a3b8', padding: '16px 0', textAlign: 'center' }}>No {selectedSport.name} fixtures yet</div>
                            ) : (
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    {(ownerDashData?.upcomingFixtures || []).slice(0, 3).map((m: any, i: number) => (
                                        <div key={i} style={{ padding: '14px', borderRadius: '10px', background: '#faf5ff', border: `1px solid ${selectedSport.accentColor || '#e9d5ff'}30` }}>
                                            <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e1b4b', marginBottom: '4px' }}>
                                                {m.homeTeam?.name || 'TBD'} vs {m.awayTeam?.name || 'TBD'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: selectedSport.accentColor || '#6d28d9', fontWeight: 600, marginBottom: '4px' }}>
                                                📅 {m.scheduledAt ? formatDate(m.scheduledAt) : 'TBD'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>🏟️ {m.venue || 'TBD'}</div>
                                            <span style={{ fontSize: '10px', marginTop: '6px', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: `${selectedSport.accentColor || '#6d28d9'}15`, color: selectedSport.accentColor || '#6d28d9', fontWeight: 700 }}>{m.round || m.status}</span>
                                        </div>
                                    ))}
                                    {(ownerDashData?.matchHistory || []).slice(0, 3 - (ownerDashData?.upcomingFixtures || []).length).map((m: any, i: number) => (
                                        <div key={`h${i}`} style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e1b4b', marginBottom: '4px' }}>
                                                {m.homeTeam?.name || 'TBD'} vs {m.awayTeam?.name || 'TBD'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>🏆 {m.tournament?.name}</div>
                                            <span style={{ fontSize: '10px', marginTop: '6px', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: m.status === 'COMPLETED' ? '#f0fdf4' : '#fef2f2', color: m.status === 'COMPLETED' ? '#16a34a' : '#ef4444', fontWeight: 700 }}>{m.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── No Sports Prompt ─── */}
                {roleGroup === 'organizer' && !sportLoading && availableSports.length === 0 && (
                    <div style={{ padding: '48px', borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
                        <p style={{ color: theme.textSecondary, fontSize: '15px', marginBottom: '16px' }}>No sports available yet. Add a sport to start creating tournaments!</p>
                        <Link href="/tournaments/create" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>+ Create Tournament</Link>
                    </div>
                )}
                {roleGroup === 'team_manager' && !sportLoading && availableSports.length === 0 && (
                    <div style={{ padding: '48px', borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏅</div>
                        <p style={{ color: theme.textSecondary, fontSize: '15px', marginBottom: '16px' }}>You don't have any teams yet. Create a team to get started!</p>
                        <Link href="/teams" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>+ Create Team</Link>
                    </div>
                )}

                {/* ─── Organiser Strict Context Lock Navigation ─── */}
                {roleGroup === 'organizer' && (
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: theme.textPrimary }}>
                                    {selectedSport ? `${sportIcon} ${sportLabel} — ${theme.sectionTitle}` : theme.sectionTitle}
                                </h2>
                                <p style={{ fontSize: '13px', color: theme.textSecondary }}> {selectedSport ? `${sportLabel} Organizer Tools` : `Select a sport to continue`} </p>
                            </div>
                            {activeTournament && (
                                <button onClick={() => useSportStore.getState().clearActiveTournament()} style={{
                                    padding: '8px 16px', borderRadius: '8px', background: 'white', border: `1px solid ${theme.cardBorder}`,
                                    color: '#ef4444', fontWeight: 600, fontSize: '12px', cursor: 'pointer'
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
                                            <div style={{ fontWeight: 800, fontSize: '16px', color: '#1e1b4b' }}>{t.name}</div>
                                            <div style={{ fontSize: '12px', color: '#6d28d9', fontWeight: 600 }}>{t.format}</div>
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
                                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e1b4b' }}>{activeTournament.name}</div>
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
                )}

                {/* ─── Team Manager & Other Roles Quick Access Cards ─── */}
                {roleGroup !== 'organizer' && (
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: theme.textPrimary }}>
                            {selectedSport ? `${sportIcon} ${sportLabel} — ${theme.sectionTitle}` : theme.sectionTitle}
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
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>{item.icon}</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>{item.label}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.4 }}>{item.desc}</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── Live Matches (filtered by selected sport) ─── */}
                {(() => {
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
                                            <span className="status-badge" style={{ background: '#fef2f2', color: '#ef4444' }}>
                                                <span className="live-pulse"></span> LIVE
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '15px', fontWeight: 700 }}>
                                            {match.homeTeam?.name || 'TBD'} vs {match.awayTeam?.name || 'TBD'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{match.tournament?.name}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : null;
                })()}

            </div>
        </div>
    );
}

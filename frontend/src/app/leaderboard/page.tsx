'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSportStore } from '@/lib/store';
import PageNavbar from '@/components/PageNavbar';
import { Search as SearchIcon, ChevronDown, Trophy, Medal, Crown, Star, TrendingUp, Target, Zap, Award, Sparkles, Shield } from 'lucide-react';

export default function LeaderboardPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                <PageNavbar title="Leaderboard" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            </div>
        }>
            <LeaderboardContent />
        </Suspense>
    );
}

function LeaderboardContent() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'Cricket';
    const normalizedSport = sportLabel.trim().toLowerCase();

    // Data state
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loadingTournaments, setLoadingTournaments] = useState(true);

    // Selection state
    const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Leaderboard state
    const [playerData, setPlayerData] = useState<any>(null);
    const [loadingBoard, setLoadingBoard] = useState(false);

    // Initial load: fetch tournaments strictly for the selected sport
    useEffect(() => {
        setLoadingTournaments(true);
        api.getTournaments().then(res => {
            const t = res || [];
            // Strictly filter by sport context
            const filtered = selectedSport ? t.filter((x: any) => !x.sport || x.sport.name === selectedSport.name || x.sportName === selectedSport.name) : t;
            setTournaments(filtered);
            if (filtered.length > 0) {
                setSelectedTournamentId(filtered[0].id);
            }
        }).catch(() => {
            setTournaments([]);
        }).finally(() => {
            setLoadingTournaments(false);
        });
    }, [selectedSport]);

    // Fetch leaderboard data when a tournament is selected
    useEffect(() => {
        if (!selectedTournamentId) return;
        setLoadingBoard(true);
        api.getPlayerLeaderboard(selectedTournamentId)
            .then(data => {
                setPlayerData(data);
            })
            .catch(() => {
                setPlayerData(null);
            })
            .finally(() => {
                setLoadingBoard(false);
            });
    }, [selectedTournamentId]);

    const activeTournament = tournaments.find(t => t.id === selectedTournamentId);

    const getSportSpecificTabs = () => {
        const defaultTabs = [
            { key: 'mvp', label: 'MVP', icon: <Award size={20} />, propKey: 'mvp', statLabel: 'Points', valueIcon: <Award size={16} strokeWidth={3} />, watermarkIcon: <Award size={140} />, highlight: '#8b5cf6' },
            { key: 'emerging', label: 'Emerging', icon: <Sparkles size={20} />, propKey: 'emergingPlayer', statLabel: 'Points', valueIcon: <Sparkles size={16} strokeWidth={3} />, watermarkIcon: <Sparkles size={140} />, highlight: '#22c55e' },
            { key: 'pot', label: 'Player of Tourney', icon: <Trophy size={20} />, propKey: 'playerOfTournament', statLabel: 'Points', valueIcon: <Trophy size={16} strokeWidth={3} />, watermarkIcon: <Trophy size={140} />, highlight: '#fbbf24' },
        ];

        switch (normalizedSport) {
            case 'football':
                return [
                    { key: 'striker', label: 'Best Striker', icon: <Target size={20} />, propKey: 'bestStriker', statLabel: 'Points', valueIcon: <Target size={16} strokeWidth={3} />, watermarkIcon: <Target size={140} />, highlight: '#ef4444' },
                    { key: 'midfielder', label: 'Best Midfielder', icon: <TrendingUp size={20} />, propKey: 'bestMidfielder', statLabel: 'Points', valueIcon: <TrendingUp size={16} strokeWidth={3} />, watermarkIcon: <TrendingUp size={140} />, highlight: '#0ea5e9' },
                    { key: 'defender', label: 'Best Defender', icon: <Shield size={20} />, propKey: 'bestDefender', statLabel: 'Points', valueIcon: <Shield size={16} strokeWidth={3} />, watermarkIcon: <Shield size={140} />, highlight: '#14b8a6' },
                    { key: 'goalkeeper', label: 'Best Goalkeeper', icon: <Star size={20} />, propKey: 'bestGoalkeeper', statLabel: 'Points', valueIcon: <Star size={16} strokeWidth={3} />, watermarkIcon: <Star size={140} />, highlight: '#f59e0b' },
                    ...defaultTabs
                ];
            case 'basketball':
                return [
                    { key: 'pg', label: 'Best Point Guard', icon: <Zap size={20} />, propKey: 'bestPointGuard', statLabel: 'Points', valueIcon: <Zap size={16} strokeWidth={3} />, watermarkIcon: <Zap size={140} />, highlight: '#f59e0b' },
                    { key: 'sg', label: 'Best Shooting Guard', icon: <Target size={20} />, propKey: 'bestShootingGuard', statLabel: 'Points', valueIcon: <Target size={16} strokeWidth={3} />, watermarkIcon: <Target size={140} />, highlight: '#ef4444' },
                    { key: 'forward', label: 'Best Forward', icon: <TrendingUp size={20} />, propKey: 'bestForward', statLabel: 'Points', valueIcon: <TrendingUp size={16} strokeWidth={3} />, watermarkIcon: <TrendingUp size={140} />, highlight: '#0ea5e9' },
                    { key: 'center', label: 'Best Center', icon: <Shield size={20} />, propKey: 'bestCenter', statLabel: 'Points', valueIcon: <Shield size={16} strokeWidth={3} />, watermarkIcon: <Shield size={140} />, highlight: '#10b981' },
                    ...defaultTabs
                ];
            case 'tennis':
            case 'badminton':
            case 'table tennis':
                return [
                    { key: 'server', label: 'Best Server', icon: <Zap size={20} />, propKey: 'bestServer', statLabel: 'Aces', valueIcon: <Zap size={16} strokeWidth={3} />, watermarkIcon: <Zap size={140} />, highlight: '#f59e0b' },
                    { key: 'attacker', label: 'Best Attacker', icon: <Target size={20} />, propKey: 'bestAttacker', statLabel: 'Winners', valueIcon: <Target size={16} strokeWidth={3} />, watermarkIcon: <Target size={140} />, highlight: '#0ea5e9' },
                    { key: 'defender', label: 'Best Defender', icon: <Shield size={20} />, propKey: 'bestDefender', statLabel: 'Returns', valueIcon: <Shield size={16} strokeWidth={3} />, watermarkIcon: <Shield size={140} />, highlight: '#10b981' },
                    ...defaultTabs
                ];
            case 'volleyball':
                return [
                    { key: 'spiker', label: 'Best Spiker', icon: <Target size={20} />, propKey: 'bestSpiker', statLabel: 'Kills', valueIcon: <Target size={16} strokeWidth={3} />, watermarkIcon: <Target size={140} />, highlight: '#ef4444' },
                    { key: 'blocker', label: 'Best Blocker', icon: <Shield size={20} />, propKey: 'bestBlocker', statLabel: 'Blocks', valueIcon: <Shield size={16} strokeWidth={3} />, watermarkIcon: <Shield size={140} />, highlight: '#14b8a6' },
                    { key: 'server', label: 'Best Server', icon: <Zap size={20} />, propKey: 'bestServer', statLabel: 'Aces', valueIcon: <Zap size={16} strokeWidth={3} />, watermarkIcon: <Zap size={140} />, highlight: '#f59e0b' },
                    { key: 'libero', label: 'Best Libero', icon: <Star size={20} />, propKey: 'bestLibero', statLabel: 'Digs', valueIcon: <Star size={16} strokeWidth={3} />, watermarkIcon: <Star size={140} />, highlight: '#0ea5e9' },
                    ...defaultTabs
                ];
            case 'hockey':
                return [
                    { key: 'target', label: 'Top Scorer', icon: <Target size={20} />, propKey: 'topScorer', statLabel: 'Goals', valueIcon: <Target size={16} strokeWidth={3} />, watermarkIcon: <Target size={140} />, highlight: '#ef4444' },
                    { key: 'playmaker', label: 'Best Playmaker', icon: <TrendingUp size={20} />, propKey: 'bestPlaymaker', statLabel: 'Assists', valueIcon: <TrendingUp size={16} strokeWidth={3} />, watermarkIcon: <TrendingUp size={140} />, highlight: '#0ea5e9' },
                    { key: 'goalkeeper', label: 'Best Goalkeeper', icon: <Star size={20} />, propKey: 'bestGoalkeeper', statLabel: 'Points', valueIcon: <Star size={16} strokeWidth={3} />, watermarkIcon: <Star size={140} />, highlight: '#f59e0b' },
                    ...defaultTabs
                ];
            case 'baseball':
                return [
                    { key: 'hitter', label: 'Best Hitter', icon: <Target size={20} />, propKey: 'bestHitter', statLabel: 'AVG', valueIcon: <Target size={16} strokeWidth={3} />, watermarkIcon: <Target size={140} />, highlight: '#ef4444' },
                    { key: 'pitcher', label: 'Best Pitcher', icon: <Zap size={20} />, propKey: 'bestPitcher', statLabel: 'ERA', valueIcon: <Zap size={16} strokeWidth={3} />, watermarkIcon: <Zap size={140} />, highlight: '#0ea5e9' },
                    { key: 'slugger', label: 'Most Home Runs', icon: <Star size={20} />, propKey: 'mostHomeRuns', statLabel: 'HRs', valueIcon: <Star size={16} strokeWidth={3} />, watermarkIcon: <Star size={140} />, highlight: '#f59e0b' },
                    ...defaultTabs
                ];
            case 'rugby':
                return [
                    { key: 'tryscorer', label: 'Most Tries', icon: <Target size={20} />, propKey: 'mostTries', statLabel: 'Tries', valueIcon: <Target size={16} strokeWidth={3} />, watermarkIcon: <Target size={140} />, highlight: '#ef4444' },
                    { key: 'kicker', label: 'Best Kicker', icon: <Zap size={20} />, propKey: 'bestKicker', statLabel: 'Points', valueIcon: <Zap size={16} strokeWidth={3} />, watermarkIcon: <Zap size={140} />, highlight: '#0ea5e9' },
                    { key: 'defender', label: 'Best Defender', icon: <Shield size={20} />, propKey: 'bestDefender', statLabel: 'Tackles', valueIcon: <Shield size={16} strokeWidth={3} />, watermarkIcon: <Shield size={140} />, highlight: '#14b8a6' },
                    ...defaultTabs
                ];
            default:
                // Default to Cricket
                return [
                    { key: 'runs', label: 'Most Runs', icon: <TrendingUp size={20} />, propKey: 'mostRuns', statLabel: 'Runs', valueIcon: <TrendingUp size={16} strokeWidth={3} />, watermarkIcon: <TrendingUp size={140} />, highlight: '#f59e0b' },
                    { key: 'wickets', label: 'Most Wickets', icon: <Target size={20} />, propKey: 'mostWickets', statLabel: 'Wickets', valueIcon: <Target size={16} strokeWidth={3} />, watermarkIcon: <Target size={140} />, highlight: '#ef4444' },
                    { key: 'allRounder', label: 'Best All Rounder', icon: <Zap size={20} />, propKey: 'bestAllRounder', statLabel: 'Points', valueIcon: <Zap size={16} strokeWidth={3} />, watermarkIcon: <Zap size={140} />, highlight: '#0ea5e9' },
                    ...defaultTabs
                ];
        }
    };

    const TABS = getSportSpecificTabs();
    const [activeTab, setActiveTab] = useState<string>(TABS[0].key);

    // Auto-select first tab if sport changes
    useEffect(() => {
        if (!TABS.find(t => t.key === activeTab)) {
            setActiveTab(TABS[0].key);
        }
    }, [normalizedSport, TABS, activeTab]);

    const currentTabDef = TABS.find(t => t.key === activeTab) || TABS[0];
    const currentFeed = playerData?.[currentTabDef.propKey] || [];

    const getRankBadge = (rank: number) => {
        if (rank === 1) return { emoji: '🥇', bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
        if (rank === 2) return { emoji: '🥈', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
        if (rank === 3) return { emoji: '🥉', bg: '#ffedd5', color: '#ea580c', border: '#fed7aa' };
        return { emoji: `#${rank}`, bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageNavbar title="Leaderboard" />

            {/* ── TOURNAMENT SELECTION DROPDOWN ── */}
            <div style={{ background: 'white', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', position: 'relative', zIndex: 60 }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Select Tournament
                    </label>
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 16px', background: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px',
                                fontSize: '15px', fontWeight: 700, color: '#1e293b', cursor: 'pointer',
                                transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🏆 {activeTournament ? activeTournament.name : loadingTournaments ? 'Loading tournaments...' : `No Tournaments Found`}
                            </span>
                            <ChevronDown size={18} color="#64748b" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>

                        {isDropdownOpen && tournaments.length > 0 && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
                                background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 61
                            }}>
                                {tournaments.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setSelectedTournamentId(t.id); setIsDropdownOpen(false); }}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', padding: '14px 16px',
                                            border: 'none', background: t.id === selectedTournamentId ? '#f0fdf4' : 'white',
                                            borderBottom: '1px solid #f1f5f9', cursor: 'pointer', textAlign: 'left',
                                            color: t.id === selectedTournamentId ? '#15803d' : '#334155', fontWeight: t.id === selectedTournamentId ? 800 : 600,
                                            fontSize: '14px', transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = t.id === selectedTournamentId ? '#f0fdf4' : '#f8fafc')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = t.id === selectedTournamentId ? '#f0fdf4' : 'white')}
                                    >
                                        🏆 {t.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── CONDITIONAL RENDER: NO TOURNAMENTS ── */}
            {tournaments.length === 0 && !loadingTournaments && (
                <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🏆</div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>No Tournaments Found</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
                        There are currently no active tournaments to show stats for right now.
                    </p>
                    <Link href="/explore" style={{
                        display: 'inline-block', padding: '10px 24px', borderRadius: '10px',
                        background: '#0ea5e9', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '14px',
                    }}>
                        Explore Tournaments
                    </Link>
                </div>
            )}

            {/* ── TOURNAMENT PREPARED: TABS & CONTENT ── */}
            {selectedTournamentId && (
                <>
                    {/* ── Icon-Only Tab Bar (Flush) ── */}
                    <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '45px', zIndex: 49 }}>
                        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    title={tab.label}
                                    style={{
                                        flex: 1, padding: '16px 0', border: 'none', background: 'none',
                                        cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', gap: '8px',
                                        color: activeTab === tab.key ? tab.highlight : '#94a3b8',
                                        borderBottom: activeTab === tab.key ? `3px solid ${tab.highlight}` : '3px solid transparent',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {tab.icon}
                                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {tab.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Tab Content ── */}
                    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px 80px' }}>
                        {loadingBoard ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: currentTabDef.highlight, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Syncing Statistics...</div>
                            </div>
                        ) : currentFeed.length === 0 ? (
                            <div style={{ padding: '60px 20px', borderRadius: '16px', background: 'white', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#334155' }}>No Records Yet</div>
                                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                                    Match data is still being processed for {currentTabDef.label} in this tournament.
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {currentFeed.map((entry: any, i: number) => {
                                    const rank = entry.rank || (i + 1);
                                    const badge = getRankBadge(rank);
                                    const isTop3 = rank <= 3;

                                    return (
                                        <div key={entry.playerId || i} style={{
                                            background: isTop3 ? 'white' : 'linear-gradient(to right, #ffffff, #f8fafc)',
                                            borderRadius: '16px', padding: '16px',
                                            border: `1px solid ${isTop3 ? badge.border : '#e2e8f0'}`,
                                            boxShadow: isTop3 ? '0 4px 12px rgba(0,0,0,0.03)' : 'none',
                                            display: 'flex', alignItems: 'center', gap: '16px',
                                            position: 'relative', overflow: 'hidden'
                                        }}>
                                            {/* Rank Badge */}
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px',
                                                background: badge.bg, color: badge.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: isTop3 ? '22px' : '15px', fontWeight: 900, flexShrink: 0,
                                                border: `1px solid ${badge.border}`
                                            }}>
                                                {isTop3 ? badge.emoji : rank}
                                            </div>

                                            {/* Profile Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                                                    {entry.playerName || 'Unknown Player'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 700, color: '#475569' }}>{entry.teamName || 'Independent'}</span>
                                                    <span style={{ opacity: 0.4 }}>•</span>
                                                    <span>{entry.matches || 0} Matches Played</span>
                                                </div>
                                            </div>

                                            {/* Stat Value */}
                                            <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontSize: '16px' }}>{currentTabDef.valueIcon}</span>
                                                    <span style={{ fontSize: '24px', fontWeight: 900, color: currentTabDef.highlight, lineHeight: 1 }}>
                                                        {entry.value || entry.runs || entry.wickets || 0}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>
                                                    {currentTabDef.statLabel}
                                                </div>
                                            </div>

                                            {/* Decorative watermark for #1 */}
                                            {rank === 1 && (
                                                <div style={{ position: 'absolute', right: '60px', top: '50%', transform: 'translateY(-50%)', opacity: 0.03, zIndex: 0, pointerEvents: 'none', color: '#000' }}>
                                                    {currentTabDef.watermarkIcon}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

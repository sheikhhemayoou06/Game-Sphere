'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { sportIcons, defaultSportConfig, sportConfig, statusColors } from '@/lib/utils';
import SportIcon from '@/components/SportIcon';
import {
    Calendar, Ban, FileDown, Settings, Zap, CalendarClock, Handshake, Clock,
    ArrowLeft, Loader2, ChevronRight, AlertTriangle, RotateCcw
} from 'lucide-react';

export default function TournamentFixtures() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [tournament, setTournament] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
    const [newFormat, setNewFormat] = useState('KNOCKOUT');

    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);

    const isOrganizer = user?.id === tournament?.organizerId;
    const config = tournament?.sport?.name ? (sportConfig[tournament.sport.name] || defaultSportConfig) : defaultSportConfig;
    const sportEmoji = <SportIcon sport={tournament?.sport?.name || 'Athletics'} size={24} color="currentColor" />;

    useEffect(() => {
        if (!id) return;
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [t, ts] = await Promise.all([
                api.getTournament(id as string),
                api.getTournamentTeams(id as string)
            ]);
            setTournament(t);
            setMatches(t.matches || []);
            setTeams(ts);
            if (t.format) setNewFormat(t.format);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            await api.generateFixtures(id as string);
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to generate fixtures. Ensure there are at least 2 approved teams.');
        }
    };

    const handleRegenerate = async () => {
        try {
            await api.regenerateFixtures(id as string, { format: newFormat });
            setRegenerateModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to regenerate fixtures.');
        }
    };

    const handleMatchAction = async (status: string, winnerTeamId?: string) => {
        if (!selectedMatch) return;
        try {
            await api.updateMatchStatus(id as string, selectedMatch.id, {
                status,
                winnerTeamId
            });
            setActionModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to update match status.');
        }
    };

    const handleExportPDF = () => {
        window.print();
    };

    const getTeamName = (teamId: string) => {
        const team = teams.find(t => t.teamId === teamId);
        return team ? team.team.name : 'TBD';
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Loader2 size={28} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading fixtures...</div>
            </div>
            <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!tournament) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <div style={{ textAlign: 'center', color: '#e2e8f0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Ban size={28} color="#f87171" />
                </div>
                <h2>Tournament not found</h2>
                <Link href="/tournaments" style={{ color: '#6366f1', marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowLeft size={14} /> Back to tournaments
                </Link>
            </div>
        </div>
    );

    const hasFixtures = matches.length > 0;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #0f172a 100%)' }}>
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        color: black !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    * {
                        color: #000 !important;
                        box-shadow: none !important;
                        border-color: #ddd !important;
                    }
                }
            `}</style>

            {/* Header */}
            <nav className="no-print" style={{ padding: '14px 32px', background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(16px)' }}>
                <Link href={`/tournaments/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#e2e8f0', fontSize: '14px' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{sportEmoji}</span>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>{tournament.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} color="#818cf8" />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Fixtures & Schedule</span>
                </div>
            </nav>

            <div className="printable-area" style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>Tournament Fixtures</h1>
                        <p style={{ color: '#94a3b8', fontSize: '15px' }}>Format: {tournament.format?.replace('_', ' ') || 'Not Set'} • {matches.length} Matches</p>
                    </div>
                    {isOrganizer && hasFixtures && (
                        <div className="no-print" style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={handleExportPDF} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileDown size={16} /> Export PDF
                            </button>
                            <button onClick={() => setRegenerateModalOpen(true)} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: '#fff', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
                                <Settings size={16} /> Format & Regenerate
                            </button>
                        </div>
                    )}
                </div>

                {!hasFixtures ? (
                    <div style={{ textAlign: 'center', padding: '64px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Calendar size={28} color="#818cf8" />
                        </div>
                        <h3 style={{ color: '#f8fafc', fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0' }}>No Fixtures Yet</h3>
                        <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '24px' }}>Wait for teams to register, then generate the schedule.</p>
                        {isOrganizer && (
                            <button onClick={handleGenerate} style={{ padding: '12px 24px', background: '#eab308', color: '#422006', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={16} /> Generate Initial Fixtures
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {matches.map((match: any) => (
                            <div key={match.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 700 }}>MATCH {match.matchNumber}</span>
                                        <span style={{ color: '#6366f1', fontSize: '12px', fontWeight: 700, padding: '2px 8px', background: 'rgba(99,102,241,0.1)', borderRadius: '6px' }}>{match.round}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ color: statusColors[match.status] || '#94a3b8', fontSize: '12px', fontWeight: 800 }}>{match.status}</span>
                                        {isOrganizer && match.status !== 'COMPLETED' && (
                                            <button className="no-print" onClick={() => { setSelectedMatch(match); setActionModalOpen(true); }} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                Manage
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                                    <div style={{ flex: 1, textAlign: 'right', fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                                        {getTeamName(match.homeTeamId)}
                                    </div>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 800 }}>
                                        VS
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left', fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                                        {getTeamName(match.awayTeamId)}
                                    </div>
                                </div>
                                {match.status === 'POSTPONED' && (
                                    <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', fontSize: '13px', fontWeight: 600, borderTop: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                        This match has been postponed and needs to be rescheduled.
                                    </div>
                                )}
                                {match.status === 'ABANDONED' && match.winnerTeamId === 'DRAW' && (
                                    <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontSize: '13px', fontWeight: 600, borderTop: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        Match abandoned. 1 Point awarded to each team.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Regenerate Modal */}
            {regenerateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ width: '400px', background: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Settings size={18} color="#818cf8" /> Regenerate Fixtures
                            </h3>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                <strong>Warning:</strong> Regenerating fixtures will delete all currently <strong>SCHEDULED</strong> and <strong>POSTPONED</strong> matches. Completed/playing matches will be preserved.
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Tournament Format</label>
                                <select value={newFormat} onChange={(e) => setNewFormat(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px', outline: 'none' }}>
                                    <option value="KNOCKOUT">Knockout</option>
                                    <option value="ROUND_ROBIN">Round Robin</option>
                                    <option value="LEAGUE">League</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setRegenerateModalOpen(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleRegenerate} style={{ padding: '10px 16px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Confirm & Regenerate</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {actionModalOpen && selectedMatch && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ width: '400px', background: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px', fontWeight: 800 }}>Manage Match</h3>
                            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{getTeamName(selectedMatch.homeTeamId)} vs {getTeamName(selectedMatch.awayTeamId)}</div>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button onClick={() => handleMatchAction('POSTPONED')} style={{ padding: '12px', width: '100%', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarClock size={16} /> Postpone Match</span>
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(251, 191, 36, 0.7)' }}>Keep the match but delay it to later.</span>
                                </button>

                                <button onClick={() => handleMatchAction('ABANDONED', 'DRAW')} style={{ padding: '12px', width: '100%', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}><Handshake size={16} /> Abandon - 1 Point Each</span>
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(129, 140, 248, 0.7)' }}>End match as DNF, give teams 1 point each.</span>
                                </button>

                                <button onClick={() => handleMatchAction('SCHEDULED')} style={{ padding: '12px', width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Reset to Scheduled</span>
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>Clear statuses and mark as scheduled.</span>
                                </button>
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setActionModalOpen(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

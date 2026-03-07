'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';
import { ClipboardList, CalendarDays, Users, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

type TrainingTab = 'programs' | 'schedule' | 'attendance' | 'venues';

const LEVEL_COLORS: Record<string, { bg: string; color: string }> = {
    BEGINNER: { bg: '#ecfdf5', color: '#22c55e' },
    INTERMEDIATE: { bg: '#eff6ff', color: '#3b82f6' },
    ADVANCED: { bg: '#fef2f2', color: '#ef4444' },
    'ALL LEVELS': { bg: '#f5f3ff', color: '#8b5cf6' },
    'LOCAL': { bg: '#ecfdf5', color: '#22c55e' },
    'DISTRICT': { bg: '#eff6ff', color: '#3b82f6' },
    'STATE': { bg: '#fffbeb', color: '#f59e0b' },
    'NATIONAL': { bg: '#fef2f2', color: '#ef4444' },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    ACTIVE: { bg: '#ecfdf5', color: '#22c55e' },
    UPCOMING: { bg: '#fffbeb', color: '#f59e0b' },
    FULL: { bg: '#fef2f2', color: '#ef4444' },
};

export default function TrainingPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';

    // Tab state
    const [activeTab, setActiveTab] = useState<TrainingTab>('programs');
    const [teams, setTeams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await api.getMyTeams();
                if (Array.isArray(data)) {
                    setTeams(data);
                }
            } catch (err) {
                console.error("Failed to load teams", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeams();
    }, []);

    // Filter teams by selected sport
    const filteredTeams = selectedSport ? teams.filter(t => t.sport?.name?.toLowerCase() === selectedSport.name.toLowerCase()) : teams;

    // Generate dynamic sessions based on the user's teams
    const generatedSessions = filteredTeams.map((t, i) => {
        const enrolledCount = t._count?.players || Math.floor(Math.random() * 10) + 10; // Fallback math random if missing
        return {
            id: t.id || String(i),
            title: t.name ? `${t.name} Training` : 'Team Practice',
            coach: t.contactName ? `Coach ${t.contactName.split(' ')[0]}` : 'Head Coach',
            sport: t.sport?.name || 'Sport',
            level: t.level || 'ALL LEVELS',
            duration: 'Ongoing',
            sessions: 4, // Fixed 4 sessions a week for mock
            enrolled: enrolledCount,
            maxCapacity: enrolledCount + Math.floor(Math.random() * 5),
            icon: sportIcons[t.sport?.name] || '🏆',
            status: 'ACTIVE'
        };
    });

    // Generate weekly schedule based on user's teams
    const generatedSchedule = filteredTeams.flatMap((t, i) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const times = ['6:00 AM', '7:00 AM', '4:00 PM', '5:00 PM'];
        return [
            { day: days[i % days.length], time: times[i % times.length], program: `${t.name} Practice`, venue: `${t.city || 'District'} Training Ground` },
            { day: days[(i + 2) % days.length], time: times[(i + 2) % times.length], program: `${t.name} Tactical Session`, venue: `${t.city || 'District'} Indoor Complex` }
        ];
    });

    // Generate mock attendance based on teams
    const generatedAttendance = filteredTeams.map((t, i) => {
        const expected = t._count?.players || 15;
        const absent = Math.floor(Math.random() * 3);
        const present = expected - absent;
        return {
            date: i === 0 ? 'Today, Oct 12' : i === 1 ? 'Yesterday, Oct 11' : 'Oct 10',
            session: `${t.name} Training`,
            expected,
            present,
            absent
        };
    });

    // Generate mock venues based on teams' location
    const generatedVenues = filteredTeams.map((t, i) => ({
        id: String(i),
        name: `${t.city || 'Central'} Sports Complex`,
        sport: t.sport?.name || 'Multiple',
        capacity: 150,
        location: t.city || 'City Center',
        status: i % 3 === 1 ? 'OCCUPIED' : 'AVAILABLE',
        facilities: ['Floodlights', 'Dressing Rooms', 'Medical Room', 'Equipment Room']
    }));

    // Deduplicate venues by name to avoid repeating identical mocked locations
    const uniqueVenues = Array.from(new Map(generatedVenues.map(item => [item.name, item])).values());

    // Derived stats for header
    const totalEnrolled = generatedSessions.reduce((a, p) => a + p.enrolled, 0);
    const totalSessionsWeekly = generatedSchedule.length;

    const TABS: { key: TrainingTab; icon: any; label: string }[] = [
        { key: 'programs', icon: <ClipboardList size={20} />, label: 'Team Sessions' },
        { key: 'schedule', icon: <CalendarDays size={20} />, label: 'Schedule' },
        { key: 'attendance', icon: <Users size={20} />, label: 'Attendance' },
        { key: 'venues', icon: <MapPin size={20} />, label: 'Venues' },
    ];

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                <PageNavbar title="Training" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#0f766e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageNavbar title="Training" />

            {/* ── Hero Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a, #1e293b, #0f766e)',
                padding: '28px 16px 48px', position: 'relative',
            }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Icon avatar */}
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px', border: '3px solid rgba(255,255,255,0.2)',
                    }}>
                        🏋️
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>Team Training</h1>
                            <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(20,184,166,0.2)', color: '#5eead4', fontSize: '10px', fontWeight: 700 }}>Live View</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '6px' }}>
                            {sportLabel} • Squad Preparation
                        </div>
                        {/* Quick stats row */}
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div key="teams">
                                <div style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>{filteredTeams.length}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Teams</div>
                            </div>
                            <div key="athletes">
                                <div style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>{totalEnrolled}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Teammates</div>
                            </div>
                            <div key="sessions">
                                <div style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>{totalSessionsWeekly}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Sessions/Wk</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Icon-Only Tab Bar ── */}
            <div style={{
                background: 'white', borderBottom: '1px solid #e2e8f0',
                position: 'sticky', top: '45px', zIndex: 49,
                marginTop: '-24px', borderRadius: '16px 16px 0 0',
            }}>
                <div style={{
                    maxWidth: '700px', margin: '0 auto',
                    display: 'flex', justifyContent: 'center',
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            title={tab.label}
                            style={{
                                flex: 1, padding: '14px 0', border: 'none', background: 'none',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '6px',
                                color: activeTab === tab.key ? '#0d9488' : '#94a3b8',
                                borderBottom: activeTab === tab.key ? '3px solid #0d9488' : '3px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab.icon}
                            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px 16px 80px' }}>

                {/* ═══════ TEAM SESSIONS TAB ═══════ */}
                {activeTab === 'programs' && (
                    <div style={{ display: 'grid', gap: '14px' }}>
                        {generatedSessions.length === 0 ? (
                            <div style={{ padding: '40px 20px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b' }}>No Team Sessions</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                                    You are not currently part of any {sportLabel !== 'All Sports' ? sportLabel : ''} teams. Join a team to see their training schedules.
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <Link href="/teams" style={{ display: 'inline-block', padding: '10px 20px', background: '#0d9488', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                                        Browse Teams
                                    </Link>
                                </div>
                            </div>
                        ) : generatedSessions.map(p => {
                            const lvl = LEVEL_COLORS[p.level] || LEVEL_COLORS.BEGINNER;
                            const st = STATUS_COLORS[p.status] || STATUS_COLORS.ACTIVE;
                            const pct = Math.round((p.enrolled / p.maxCapacity) * 100);
                            return (
                                <div key={p.id} style={{
                                    padding: '16px', borderRadius: '14px', background: 'white',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                                            }}>
                                                {p.icon}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1e1b4b', marginBottom: '2px' }}>{p.title}</h3>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.coach} • {p.sport}</div>
                                            </div>
                                        </div>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: st.bg, color: st.color }}>{p.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, background: lvl.bg, color: lvl.color }}>{p.level}</span>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, background: '#f8fafc', color: '#64748b' }}>⏱ {p.duration}</span>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, background: '#f8fafc', color: '#64748b' }}>📝 {p.sessions} sessions/wk</span>
                                    </div>
                                    <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                                        <span>👥 Squad Size: {p.enrolled}</span>
                                        <span style={{ fontWeight: 700 }}>{p.enrolled}/{p.maxCapacity}</span>
                                    </div>
                                    <div style={{ height: '4px', borderRadius: '2px', background: '#f1f5f9', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '2px', background: pct >= 100 ? '#ef4444' : '#14b8a6' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ═══════ SCHEDULE TAB ═══════ */}
                {activeTab === 'schedule' && (
                    <div style={{ display: 'grid', gap: '14px' }}>
                        {generatedSchedule.length === 0 ? (
                            <div style={{ padding: '40px 20px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b' }}>No Schedule Found</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Your teams do not have any upcoming practices.</div>
                            </div>
                        ) : (
                            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                                {generatedSchedule.map((s, i) => (
                                    <div key={i} style={{
                                        display: 'flex', padding: '14px 16px',
                                        borderBottom: i < generatedSchedule.length - 1 ? '1px solid #f8fafc' : 'none',
                                    }}>
                                        <div style={{ width: '80px', flexShrink: 0 }}>
                                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f766e' }}>{s.day.slice(0, 3)}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{s.time}</div>
                                        </div>
                                        <div style={{ flex: 1, borderLeft: '2px solid #f1f5f9', paddingLeft: '14px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b' }}>{s.program}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>📍 {s.venue}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ ATTENDANCE TAB ═══════ */}
                {activeTab === 'attendance' && (
                    <div style={{ display: 'grid', gap: '14px' }}>
                        {/* Summary Overview */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            <div style={{ padding: '16px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#10b981' }}>
                                    {generatedAttendance.length > 0 ? Math.round((generatedAttendance.reduce((acc, curr) => acc + curr.present, 0) / generatedAttendance.reduce((acc, curr) => acc + curr.expected, 0)) * 100) : 0}%
                                </div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Presence Rate</div>
                            </div>
                            <div style={{ padding: '16px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e1b4b' }}>{filteredTeams.length}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Active Squads</div>
                            </div>
                        </div>

                        {generatedAttendance.length === 0 ? (
                            <div style={{ padding: '40px 20px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b' }}>No Attendance Data</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Join a team training session to see records here.</div>
                            </div>
                        ) : generatedAttendance.map((a, i) => {
                            const attendanceRate = Math.round((a.present / a.expected) * 100);
                            return (
                                <div key={i} style={{ padding: '16px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e1b4b' }}>{a.session}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{a.date}</div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Present</div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{a.present}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Absent</div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>{a.absent}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Squad Size</div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b' }}>{a.expected}</div>
                                        </div>
                                    </div>

                                    <div style={{ height: '6px', borderRadius: '3px', background: '#f1f5f9', overflow: 'hidden', display: 'flex' }}>
                                        <div style={{ width: `${attendanceRate}%`, height: '100%', background: '#10b981' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ═══════ VENUES TAB ═══════ */}
                {activeTab === 'venues' && (
                    <div style={{ display: 'grid', gap: '14px' }}>
                        {uniqueVenues.length === 0 ? (
                            <div style={{ padding: '40px 20px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b' }}>No Venues Found</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Your teams do not have assigned facilities.</div>
                            </div>
                        ) : uniqueVenues.map(v => {
                            const statusCol = v.status === 'AVAILABLE' ? '#10b981' : v.status === 'OCCUPIED' ? '#f59e0b' : '#ef4444';
                            const statusBg = v.status === 'AVAILABLE' ? '#ecfdf5' : v.status === 'OCCUPIED' ? '#fffbeb' : '#fef2f2';

                            return (
                                <div key={v.id} style={{ padding: '16px', borderRadius: '14px', background: 'white', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1e1b4b', marginBottom: '2px' }}>{v.name}</h3>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {v.location} • {v.sport}</div>
                                        </div>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 800, background: statusBg, color: statusCol }}>{v.status}</span>
                                    </div>

                                    <div style={{ margin: '12px 0', borderTop: '1px dashed #e2e8f0' }}></div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Maximum Capacity:</span>
                                            <span style={{ fontWeight: 700, color: '#1e1b4b' }}>{v.capacity} persons</span>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Facilities:</div>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {v.facilities.map((fac, i) => (
                                                    <span key={i} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '10px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                                                        {fac}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

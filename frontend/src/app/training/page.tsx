'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';

const PROGRAMS = [
    { id: '1', title: 'Cricket Batting Masterclass', coach: 'Coach Rajesh Chauhan', sport: 'Cricket', level: 'INTERMEDIATE', duration: '6 weeks', sessions: 18, enrolled: 24, maxCapacity: 30, icon: '🏏', status: 'ACTIVE' },
    {
        id: '2', title: 'Football Fitness Bootcamp', coach: 'Coach Maria D\'Souza', sport: 'Football', level: 'BEGINNER', duration: '4 weeks', sessions: 12, enrolled: 15, maxCapacity: 20, icon: '⚽', status: 'ACTIVE'
    },
    { id: '3', title: 'Kabaddi Raiding Techniques', coach: 'Coach Pardeep Narwal', sport: 'Kabaddi', level: 'ADVANCED', duration: '8 weeks', sessions: 24, enrolled: 12, maxCapacity: 15, icon: '🤼', status: 'ACTIVE' },
    { id: '4', title: 'Athletics Sprint Training', coach: 'Coach Neeraj Kumar', sport: 'Athletics', level: 'ALL LEVELS', duration: '10 weeks', sessions: 30, enrolled: 18, maxCapacity: 25, icon: '🏃', status: 'UPCOMING' },
    { id: '5', title: 'Basketball Shooting Clinic', coach: 'Coach Satnam Singh', sport: 'Basketball', level: 'INTERMEDIATE', duration: '5 weeks', sessions: 15, enrolled: 20, maxCapacity: 20, icon: '🏀', status: 'FULL' },
    { id: '6', title: 'Swimming Endurance Program', coach: 'Coach Virdhawal Khade', sport: 'Swimming', level: 'BEGINNER', duration: '8 weeks', sessions: 24, enrolled: 8, maxCapacity: 12, icon: '🏊', status: 'ACTIVE' },
];

const SCHEDULE = [
    { day: 'Monday', time: '6:00 AM', program: 'Athletics Sprint Training', venue: 'SAI Ground' },
    { day: 'Monday', time: '4:00 PM', program: 'Cricket Batting Masterclass', venue: 'Indoor Nets' },
    { day: 'Tuesday', time: '7:00 AM', program: 'Swimming Endurance', venue: 'Aquatic Centre' },
    { day: 'Tuesday', time: '5:00 PM', program: 'Football Fitness Bootcamp', venue: 'Main Field' },
    { day: 'Wednesday', time: '6:00 AM', program: 'Kabaddi Raiding Techniques', venue: 'Mat Hall' },
    { day: 'Thursday', time: '4:00 PM', program: 'Basketball Shooting Clinic', venue: 'Indoor Court' },
];

const LEVEL_COLORS: Record<string, { bg: string; color: string }> = {
    BEGINNER: { bg: '#ecfdf5', color: '#22c55e' },
    INTERMEDIATE: { bg: '#eff6ff', color: '#3b82f6' },
    ADVANCED: { bg: '#fef2f2', color: '#ef4444' },
    'ALL LEVELS': { bg: '#f5f3ff', color: '#8b5cf6' },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    ACTIVE: { bg: '#ecfdf5', color: '#22c55e' },
    UPCOMING: { bg: '#fffbeb', color: '#f59e0b' },
    FULL: { bg: '#fef2f2', color: '#ef4444' },
};

export default function TrainingPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '🏋️';
    const [tab, setTab] = useState<'programs' | 'schedule'>('programs');

    const filteredPrograms = selectedSport ? PROGRAMS.filter(p => p.sport === selectedSport.name) : PROGRAMS;
    const filteredSchedule = selectedSport ? SCHEDULE.filter(s => filteredPrograms.some(p => s.program.includes(p.title.split(' ').slice(0, 2).join(' ')))) : SCHEDULE;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #99f6e4 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#115e59', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#115e59', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#134e4a', marginBottom: '8px' }}>{selectedSport ? `${sportLabel} Training & Coaching` : 'Training & Coaching'}</h1>
                <p style={{ color: '#115e59', fontSize: '16px', marginBottom: '28px' }}>{selectedSport ? `${sportLabel} training programs, coaching sessions, and schedule` : 'Training programs, coaching sessions, and weekly schedule'}</p>

                {/* Stats */}
                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Programs', value: filteredPrograms.length, icon: '📋', color: '#14b8a6' },
                        { label: 'Total Enrolled', value: filteredPrograms.reduce((a, p) => a + p.enrolled, 0), icon: '👥', color: '#22c55e' },
                        { label: 'Active Coaches', value: new Set(filteredPrograms.map(p => p.coach)).size, icon: '🧑‍🏫', color: '#6366f1' },
                        { label: 'Sports Covered', value: new Set(filteredPrograms.map(p => p.sport)).size, icon: '🏅', color: '#f59e0b' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 12px rgba(20,184,166,0.06)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(20,184,166,0.1)', borderRadius: '12px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
                    {(['programs', 'schedule'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: tab === t ? '#115e59' : 'transparent', color: tab === t ? '#fff' : '#115e59', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textTransform: 'capitalize' }}>
                            {t === 'programs' ? '📋 Programs' : '📅 Weekly Schedule'}
                        </button>
                    ))}
                </div>

                {tab === 'programs' ? (
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {filteredPrograms.length === 0 ? (
                            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '16px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{sportIcon}</div>
                                <p style={{ color: '#64748b' }}>No {sportLabel} training programs available yet</p>
                            </div>
                        ) : filteredPrograms.map(p => {
                            const lvl = LEVEL_COLORS[p.level] || LEVEL_COLORS.BEGINNER;
                            const st = STATUS_COLORS[p.status] || STATUS_COLORS.ACTIVE;
                            const pct = Math.round((p.enrolled / p.maxCapacity) * 100);
                            return (
                                <div key={p.id} style={{ background: '#fff', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 12px rgba(20,184,166,0.06)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{p.icon}</div>
                                            <div>
                                                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#134e4a', marginBottom: '2px' }}>{p.title}</h3>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{p.coach}</div>
                                            </div>
                                        </div>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: st.bg, color: st.color }}>{p.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: lvl.bg, color: lvl.color }}>{p.level}</span>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#f8fafc', color: '#64748b' }}>⏱ {p.duration}</span>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#f8fafc', color: '#64748b' }}>📝 {p.sessions} sessions</span>
                                    </div>
                                    <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                                        <span>👥 {p.enrolled}/{p.maxCapacity} enrolled</span>
                                        <span style={{ fontWeight: 700 }}>{pct}%</span>
                                    </div>
                                    <div style={{ height: '6px', borderRadius: '3px', background: '#f0fdfa', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', background: pct >= 100 ? '#ef4444' : '#14b8a6' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ background: '#fff', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 4px 24px rgba(20,184,166,0.06)' }}>
                        <div style={{ minWidth: '600px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 2fr', padding: '14px 24px', background: '#115e59', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                                <span>Day</span><span>Time</span><span>Program</span><span>Venue</span>
                            </div>
                            {filteredSchedule.map((s, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 2fr', padding: '14px 24px', borderBottom: '1px solid #f0fdfa', background: i % 2 === 0 ? '#f0fdfa' : '#fff', fontSize: '13px' }}>
                                    <span style={{ fontWeight: 700, color: '#134e4a' }}>{s.day}</span>
                                    <span style={{ color: '#14b8a6', fontWeight: 600 }}>{s.time}</span>
                                    <span style={{ color: '#1e1b4b', fontWeight: 600 }}>{s.program}</span>
                                    <span style={{ color: '#64748b' }}>📍 {s.venue}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

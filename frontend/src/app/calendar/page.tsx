'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';
import { Calendar as CalendarIcon, Pin } from 'lucide-react';
import SportIcon from '@/components/SportIcon';

type DashboardTab = 'calendar' | 'dates';

export default function CalendarPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? <SportIcon sport={selectedSport.name} size={24} color="currentColor" /> : <SportIcon sport="Athletics" size={24} color="currentColor" />;

    // --- State ---
    const [dashboardTab, setDashboardTab] = useState<DashboardTab>('calendar');
    const [matches, setMatches] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        Promise.all([
            api.getMatches().catch(() => []),
            api.getTournaments().catch(() => []),
        ]).then(([m, t]) => { setMatches(m); setTournaments(t); }).finally(() => setLoading(false));
    }, []);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    // Events — empty by default, populated from API data
    const allEvents: Record<number, { type: string; title: string; color: string; sport: string }[]> = {};

    // Map fetched matches and tournaments here if needed (omitted exact logic since it was mocked out mostly in previous logic)
    // For demonstration of the dashboard, we rely on the `allEvents` mapping structure currently in place or added later.

    // Filter events by selected sport
    const events: Record<number, { type: string; title: string; color: string; sport: string }[]> = {};
    Object.entries(allEvents).forEach(([day, evts]) => {
        const filtered = selectedSport ? evts.filter(e => e.sport === selectedSport.name) : evts;
        if (filtered.length > 0) events[Number(day)] = filtered;
    });

    const today = new Date();
    const isToday = (day: number) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

    const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else setCurrentMonth(currentMonth - 1); };
    const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else setCurrentMonth(currentMonth + 1); };

    const upcomingEvents = Object.entries(events).sort(([a], [b]) => Number(a) - Number(b)).flatMap(([day, evts]) =>
        evts.map(e => ({ ...e, day: Number(day), date: `${monthNames[currentMonth]} ${day}, ${currentYear}` }))
    );

    const TABS: { key: DashboardTab; icon: any; label: string }[] = [
        { key: 'calendar', icon: <CalendarIcon size={20} />, label: 'Calendar' },
        { key: 'dates', icon: <Pin size={20} />, label: 'Important Dates' },
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                <PageNavbar title="Calendar" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#0f766e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageNavbar title="Calendar & Events" />

            {/* ── Icon-Only Tab Bar ── */}
            <div style={{
                background: 'white', borderBottom: '1px solid #e2e8f0',
                position: 'sticky', top: '45px', zIndex: 49,
            }}>
                <div style={{
                    maxWidth: '900px', margin: '0 auto',
                    display: 'flex', justifyContent: 'center',
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setDashboardTab(tab.key)}
                            title={tab.label}
                            style={{
                                flex: 1, padding: '14px 0', border: 'none', background: 'none',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '6px',
                                color: dashboardTab === tab.key ? '#0d9488' : '#94a3b8',
                                borderBottom: dashboardTab === tab.key ? '3px solid #0d9488' : '3px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab.icon}
                            <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px 80px' }}>

                {/* ======================= CALENDAR TAB ======================= */}
                {dashboardTab === 'calendar' && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <button onClick={prevMonth} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 800, fontSize: '14px', color: '#475569' }}>←</button>
                            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', margin: 0 }}>{monthNames[currentMonth]} {currentYear}</h2>
                            <button onClick={nextMonth} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 800, fontSize: '14px', color: '#475569' }}>→</button>
                        </div>

                        {/* ─── DESKTOP VIEW: 7-Day Grid ─── */}
                        <div className="hide-mobile" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minWidth: '700px' }}>
                                {dayNames.map(d => (
                                    <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 0' }}>{d}</div>
                                ))}
                                {calendarDays.map((day, i) => (
                                    <div key={i} style={{
                                        minHeight: '80px', borderRadius: '12px', padding: '8px', fontSize: '14px',
                                        background: day && isToday(day) ? '#0f766e' : day ? '#f8fafc' : 'transparent',
                                        color: day && isToday(day) ? 'white' : '#1e293b',
                                        border: day && events[day] ? '2px solid #0d9488' : '1px solid transparent',
                                        boxShadow: day ? '0 1px 2px rgba(0,0,0,0.02)' : 'none'
                                    }}>
                                        {day && (
                                            <>
                                                <div style={{ fontWeight: 800, marginBottom: '6px' }}>{day}</div>
                                                {events[day]?.map((e, j) => (
                                                    <div key={j} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: `${e.color}15`, color: e.color, fontWeight: 700, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {e.title}
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ─── MOBILE VIEW: Vertical Agenda List ─── */}
                        <div className="show-mobile-block">
                            {upcomingEvents.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {Object.entries(events).sort(([a], [b]) => Number(a) - Number(b)).map(([dayStr, evts]) => {
                                        const day = Number(dayStr);
                                        return (
                                            <div key={day} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                                                {/* Date Block */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
                                                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        {monthNames[currentMonth].substring(0, 3)}
                                                    </div>
                                                    <div style={{ fontSize: '28px', fontWeight: 900, color: isToday(day) ? '#0f766e' : '#1e293b', lineHeight: '1', marginTop: '4px' }}>
                                                        {day}
                                                    </div>
                                                    {isToday(day) && <div style={{ fontSize: '9px', color: '#0f766e', fontWeight: 800, marginTop: '4px', background: '#ccfbf1', padding: '2px 6px', borderRadius: '4px' }}>TODAY</div>}
                                                </div>

                                                {/* Events List for this Day */}
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {evts.map((e, idx) => (
                                                        <div key={idx} style={{ padding: '12px 14px', borderRadius: '10px', background: `${e.color}08`, borderLeft: `4px solid ${e.color}` }}>
                                                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{e.title}</div>
                                                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', textTransform: 'capitalize', fontWeight: 600 }}>
                                                                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: e.color, marginRight: '6px' }}></span>
                                                                {e.type} • {e.sport}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>📅</div>
                                    <div style={{ fontWeight: 800, color: '#334155' }}>No events scheduled</div>
                                    <div style={{ marginTop: '4px' }}>Your agenda is clear for {monthNames[currentMonth]}.</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* ======================= IMPORTANT DATES TAB ======================= */}
                {dashboardTab === 'dates' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {upcomingEvents.length > 0 ? upcomingEvents.map((ev, i) => (
                            <div key={i} style={{
                                padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0',
                                borderLeft: `4px solid ${ev.color}`, display: 'flex', alignItems: 'center', gap: '16px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                    {ev.type === 'match' ? '⚔️' : ev.type === 'tournament' ? '🏆' : '📌'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#1e293b' }}>{ev.title}</div>
                                        <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, background: `${ev.color}15`, color: ev.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{ev.type}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{ev.date} • {ev.sport}</div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '60px 20px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>📌</div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: '#334155' }}>No Important Dates</div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>You have no major upcoming events or matches on your timeline.</div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';

export default function CalendarPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '📅';
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

    // Demo events on specific days — each tagged with sport
    const allEvents: Record<number, { type: string; title: string; color: string; sport: string }[]> = {
        3: [{ type: 'match', title: 'Cricket Semi-Final', color: "inherit", sport: 'Cricket' }],
        5: [{ type: 'match', title: 'Football League Match', color: "inherit", sport: 'Football' }],
        7: [{ type: 'tournament', title: 'District Football Cup', color: "inherit", sport: 'Football' }],
        8: [{ type: 'training', title: 'Cricket Net Practice', color: "inherit", sport: 'Cricket' }],
        10: [{ type: 'match', title: 'Kabaddi Quarter-Final', color: "inherit", sport: 'Kabaddi' }],
        12: [{ type: 'match', title: 'Basketball Pool Stage', color: "inherit", sport: 'Basketball' }],
        14: [{ type: 'deadline', title: 'Cricket Registration Closes', color: "inherit", sport: 'Cricket' }, { type: 'deadline', title: 'Football Registration Closes', color: "inherit", sport: 'Football' }],
        16: [{ type: 'training', title: 'Football Training Camp', color: "inherit", sport: 'Football' }],
        18: [{ type: 'match', title: 'Basketball Finals', color: "inherit", sport: 'Basketball' }, { type: 'training', title: 'Cricket Team Practice', color: "inherit", sport: 'Cricket' }],
        20: [{ type: 'match', title: 'Hockey Quarter-Final', color: "inherit", sport: 'Hockey' }],
        21: [{ type: 'tournament', title: 'State Athletics Meet', color: "inherit", sport: 'Athletics' }],
        22: [{ type: 'match', title: 'Cricket T20 Final', color: "inherit", sport: 'Cricket' }],
        24: [{ type: 'tournament', title: 'Tennis Open', color: "inherit", sport: 'Tennis' }],
        25: [{ type: 'match', title: 'Hockey League Day 1', color: "inherit", sport: 'Hockey' }],
        27: [{ type: 'match', title: 'Badminton Doubles Final', color: "inherit", sport: 'Badminton' }],
        28: [{ type: 'ceremony', title: 'Cricket Award Ceremony', color: "inherit", sport: 'Cricket' }, { type: 'ceremony', title: 'Football Award Night', color: "inherit", sport: 'Football' }],
    };

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

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: "inherit", textDecoration: 'none' }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto", objectFit: "contain" }} /> <span className="gradient-text">Game Sphere</span></div></Link>
                <Link href="/dashboard" style={{ color: "inherit", fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: "inherit", marginBottom: '8px' }}>{sportIcon} {selectedSport ? `${sportLabel} Calendar` : 'Calendar'}</h1>
                <p style={{ color: "inherit", fontSize: '16px', marginBottom: '28px' }}>{selectedSport ? `${sportLabel} match schedules, tournament dates, and events` : 'Match schedules, tournament dates, and event timeline'}</p>

                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    {/* Calendar grid */}
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 24px rgba(30,64,175,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <button onClick={prevMonth} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '16px', color: "inherit" }}>←</button>
                            <h2 style={{ fontSize: '20px', fontWeight: 900, color: "inherit" }}>{monthNames[currentMonth]} {currentYear}</h2>
                            <button onClick={nextMonth} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '16px', color: "inherit" }}>→</button>
                        </div>

                        {/* ─── DESKTOP VIEW: 7-Day Grid ─── */}
                        <div className="hide-mobile" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', minWidth: '700px' }}>
                                {dayNames.map(d => (
                                    <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: "inherit", padding: '8px 0' }}>{d}</div>
                                ))}
                                {calendarDays.map((day, i) => (
                                    <div key={i} style={{
                                        minHeight: '72px', borderRadius: '10px', padding: '6px', fontSize: '13px',
                                        background: day && isToday(day) ? '#1e40af' : day ? '#f8fafc' : 'transparent',
                                        color: day && isToday(day) ? '#fff' : '#1e1b4b',
                                        border: day && events[day] ? '2px solid #6366f1' : '1px solid transparent',
                                    }}>
                                        {day && (
                                            <>
                                                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{day}</div>
                                                {events[day]?.map((e, j) => (
                                                    <div key={j} style={{ fontSize: '9px', padding: '2px 4px', borderRadius: '4px', background: `${e.color}20`, color: e.color, fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {Object.entries(events).sort(([a], [b]) => Number(a) - Number(b)).map(([dayStr, evts]) => {
                                        const day = Number(dayStr);
                                        return (
                                            <div key={day} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                                                {/* Date Block */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
                                                    <div style={{ fontSize: '10px', fontWeight: 700, color: "inherit", textTransform: 'uppercase' }}>
                                                        {monthNames[currentMonth].substring(0, 3)}
                                                    </div>
                                                    <div style={{ fontSize: '24px', fontWeight: 900, color: isToday(day) ? '#3b82f6' : '#1e293b', lineHeight: '1' }}>
                                                        {day}
                                                    </div>
                                                    {isToday(day) && <div style={{ fontSize: '9px', color: "inherit", fontWeight: 700, marginTop: '2px' }}>TODAY</div>}
                                                </div>

                                                {/* Events List for this Day */}
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {evts.map((e, idx) => (
                                                        <div key={idx} style={{ padding: '10px 12px', borderRadius: '8px', background: `${e.color}10`, borderLeft: `4px solid ${e.color}` }}>
                                                            <div style={{ fontSize: '14px', fontWeight: 700, color: "inherit" }}>{e.title}</div>
                                                            <div style={{ fontSize: '11px', color: "inherit", marginTop: '4px', textTransform: 'capitalize' }}>
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
                                <div style={{ padding: '32px', textAlign: 'center', color: "inherit", fontSize: '14px', background: '#f8fafc', borderRadius: '12px' }}>
                                    No events scheduled for this month.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming events sidebar */}
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 24px rgba(30,64,175,0.06)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: "inherit", marginBottom: '16px' }}>📋 Upcoming Events</h3>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {upcomingEvents.map((ev, i) => (
                                <div key={i} style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', borderLeft: `3px solid ${ev.color}` }}>
                                    <div style={{ fontWeight: 700, fontSize: '13px', color: "inherit", marginBottom: '2px' }}>{ev.title}</div>
                                    <div style={{ fontSize: '11px', color: "inherit" }}>{ev.date}</div>
                                    <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: `${ev.color}15`, color: ev.color, textTransform: 'capitalize' }}>{ev.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

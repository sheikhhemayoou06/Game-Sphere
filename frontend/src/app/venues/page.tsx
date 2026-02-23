'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';

const VENUES = [
    { id: '1', name: 'Wankhede Stadium', city: 'Mumbai', state: 'Maharashtra', type: 'STADIUM', capacity: 33108, surface: 'Natural Grass', indoor: false, rating: 4.8, sports: ['Cricket'], facilities: ['Floodlights', 'Scoreboard', 'VIP Lounge', 'Media Box', 'Parking'], image: '🏟️', status: 'AVAILABLE' },
    { id: '2', name: 'Jawaharlal Nehru Indoor Arena', city: 'Delhi', state: 'Delhi', type: 'INDOOR', capacity: 5000, surface: 'Hardwood', indoor: true, rating: 4.5, sports: ['Badminton', 'Basketball', 'Volleyball'], facilities: ['AC', 'Scoreboard', 'Changing Rooms', 'Parking'], image: '🏢', status: 'AVAILABLE' },
    { id: '3', name: 'SAI Training Centre', city: 'Bengaluru', state: 'Karnataka', type: 'TRAINING', capacity: 500, surface: 'Synthetic', indoor: false, rating: 4.3, sports: ['Athletics', 'Football', 'Hockey'], facilities: ['Track', 'Gym', 'Medical Room', 'Hostel'], image: '🏋️', status: 'MAINTENANCE' },
    { id: '4', name: 'Gachibowli Athletic Stadium', city: 'Hyderabad', state: 'Telangana', type: 'STADIUM', capacity: 25000, surface: 'Natural Grass', indoor: false, rating: 4.6, sports: ['Football', 'Athletics'], facilities: ['Floodlights', 'Running Track', 'Parking', 'Scoreboard'], image: '🏟️', status: 'BOOKED' },
    { id: '5', name: 'Tau Devi Lal Complex', city: 'Panchkula', state: 'Haryana', type: 'COMPLEX', capacity: 8000, surface: 'Multiple', indoor: false, rating: 4.1, sports: ['Cricket', 'Football', 'Kabaddi', 'Wrestling'], facilities: ['Swimming Pool', 'Courts', 'Canteen', 'Parking'], image: '🏟️', status: 'AVAILABLE' },
    { id: '6', name: 'Patliputra Sports Complex', city: 'Patna', state: 'Bihar', type: 'COMPLEX', capacity: 3000, surface: 'Clay/Grass', indoor: false, rating: 3.9, sports: ['Cricket', 'Football', 'Hockey'], facilities: ['Changing Rooms', 'Practice Nets', 'Canteen'], image: '🏗️', status: 'AVAILABLE' },
];

export default function VenuesPage() {
    const { selectedSport } = useSportStore();
    const [filter, setFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
        AVAILABLE: { bg: '#ecfdf5', color: '#22c55e', label: '✓ Available' },
        BOOKED: { bg: '#eff6ff', color: '#3b82f6', label: '📅 Booked' },
        MAINTENANCE: { bg: '#fffbeb', color: '#f59e0b', label: '🔧 Maintenance' },
    };

    const filtered = VENUES
        .filter(v => !filter || v.city.toLowerCase().includes(filter.toLowerCase()) || v.name.toLowerCase().includes(filter.toLowerCase()))
        .filter(v => !typeFilter || v.type === typeFilter)
        .filter(v => !selectedSport || selectedSport.name === 'All Sports' || v.sports.includes(selectedSport.name));

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#166534', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#166534', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#14532d', marginBottom: '8px' }}>🏟️ Venues & Facilities</h1>
                <p style={{ color: '#166534', fontSize: '16px', marginBottom: '28px' }}>Discover stadiums, arenas, and training centres across India</p>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Venues', value: filtered.length, icon: '🏟️', color: '#166534' },
                        { label: 'Available', value: filtered.filter(v => v.status === 'AVAILABLE').length, icon: '✅', color: '#22c55e' },
                        { label: 'Total Capacity', value: `${(filtered.reduce((a, v) => a + v.capacity, 0) / 1000).toFixed(1)}K`, icon: '👥', color: '#3b82f6' },
                        { label: 'States Covered', value: new Set(filtered.map(v => v.state)).size, icon: '🗺️', color: '#f59e0b' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 12px rgba(22,101,52,0.06)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="🔍 Search venues..."
                        style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '2px solid #bbf7d0', fontSize: '14px' }} />
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                        style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #bbf7d0', fontSize: '14px', fontWeight: 600 }}>
                        <option value="">All Types</option>
                        <option value="STADIUM">🏟️ Stadium</option>
                        <option value="INDOOR">🏢 Indoor</option>
                        <option value="TRAINING">🏋️ Training</option>
                        <option value="COMPLEX">🏗️ Complex</option>
                    </select>
                </div>

                {/* Venue cards */}
                <div style={{ display: 'grid', gap: '14px' }}>
                    {filtered.length === 0 && <div style={{ color: '#166534', textAlign: 'center', padding: '20px' }}>No venues found for this sport.</div>}
                    {filtered.map(v => {
                        const statusCfg = STATUS_CONFIG[v.status] || STATUS_CONFIG.AVAILABLE;
                        return (
                            <div key={v.id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(22,101,52,0.06)', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', flexShrink: 0 }}>{v.image}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#14532d', marginBottom: '2px' }}>{v.name}</h3>
                                            <div style={{ fontSize: '13px', color: '#166534' }}>📍 {v.city}, {v.state} • {v.type} • {'⭐'.repeat(Math.round(v.rating))} {v.rating}</div>
                                        </div>
                                        <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: statusCfg.bg, color: statusCfg.color, whiteSpace: 'nowrap' }}>{statusCfg.label}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                        <span>👥 Capacity: {v.capacity.toLocaleString()}</span>
                                        <span>🏷️ {v.surface}</span>
                                        <span>{v.indoor ? '🏠 Indoor' : '☀️ Outdoor'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                        {v.sports.map(s => <span key={s} style={{ padding: '3px 8px', borderRadius: '6px', background: '#f0fdf4', color: '#166534', fontSize: '11px', fontWeight: 600 }}>{s}</span>)}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {v.facilities.map(f => <span key={f} style={{ padding: '2px 6px', borderRadius: '4px', background: '#f8fafc', color: '#94a3b8', fontSize: '10px' }}>{f}</span>)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

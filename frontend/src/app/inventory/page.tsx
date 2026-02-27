'use client';

import { useState } from 'react';
import Link from 'next/link';

const EQUIPMENT = [
    { id: '1', name: 'SG Cricket Bats', category: 'CRICKET', quantity: 48, available: 32, condition: 'GOOD', location: 'Store Room A', lastChecked: '2026-02-18', unitCost: 3500, icon: '🏏' },
    { id: '2', name: 'Adidas Footballs (FIFA Pro)', category: 'FOOTBALL', quantity: 30, available: 24, condition: 'EXCELLENT', location: 'Store Room B', lastChecked: '2026-02-20', unitCost: 4200, icon: '' },
    { id: '3', name: 'Yonex Badminton Rackets', category: 'BADMINTON', quantity: 24, available: 18, condition: 'GOOD', location: 'Indoor Hall', lastChecked: '2026-02-15', unitCost: 6800, icon: '🏸' },
    { id: '4', name: 'Nivia Basketballs', category: 'BASKETBALL', quantity: 20, available: 14, condition: 'FAIR', location: 'Court Storage', lastChecked: '2026-02-12', unitCost: 2500, icon: '🏀' },
    { id: '5', name: 'Kabaddi Mats (Standard)', category: 'KABADDI', quantity: 6, available: 4, condition: 'GOOD', location: 'Mat Hall', lastChecked: '2026-02-19', unitCost: 45000, icon: '🤼' },
    { id: '6', name: 'Speedo Swim Goggles', category: 'SWIMMING', quantity: 40, available: 35, condition: 'EXCELLENT', location: 'Pool Deck', lastChecked: '2026-02-21', unitCost: 1200, icon: '🏊' },
    { id: '7', name: 'Hockey Sticks (Composite)', category: 'HOCKEY', quantity: 36, available: 28, condition: 'GOOD', location: 'Store Room A', lastChecked: '2026-02-17', unitCost: 5500, icon: '🏑' },
    { id: '8', name: 'Athletics Javelins', category: 'ATHLETICS', quantity: 12, available: 10, condition: 'EXCELLENT', location: 'Field Storage', lastChecked: '2026-02-20', unitCost: 8000, icon: '🎯' },
    { id: '9', name: 'First Aid Kits', category: 'MEDICAL', quantity: 15, available: 15, condition: 'GOOD', location: 'Medical Room', lastChecked: '2026-02-21', unitCost: 3000, icon: '🩺' },
    { id: '10', name: 'Training Cones (Set of 50)', category: 'GENERAL', quantity: 10, available: 8, condition: 'FAIR', location: 'Store Room B', lastChecked: '2026-02-16', unitCost: 1500, icon: '🔶' },
];

const CONDITION_COLORS: Record<string, { bg: string; color: string }> = {
    EXCELLENT: { bg: '#ecfdf5', color: '#22c55e' },
    GOOD: { bg: '#eff6ff', color: '#3b82f6' },
    FAIR: { bg: '#fffbeb', color: '#f59e0b' },
    POOR: { bg: '#fef2f2', color: '#ef4444' },
};

export default function InventoryPage() {
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');

    const categories = [...new Set(EQUIPMENT.map(e => e.category))];
    const filtered = EQUIPMENT
        .filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()))
        .filter(e => !catFilter || e.category === catFilter);

    const totalValue = EQUIPMENT.reduce((a, e) => a + e.quantity * e.unitCost, 0);
    const totalItems = EQUIPMENT.reduce((a, e) => a + e.quantity, 0);
    const totalAvailable = EQUIPMENT.reduce((a, e) => a + e.available, 0);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#92400e', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#92400e', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#78350f', marginBottom: '8px' }}>📦 Inventory & Equipment</h1>
                <p style={{ color: '#92400e', fontSize: '16px', marginBottom: '28px' }}>Track sports equipment, supplies, and facility assets</p>

                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Item Types', value: EQUIPMENT.length, icon: '📦', color: '#92400e' },
                        { label: 'Total Stock', value: totalItems, icon: '📊', color: '#3b82f6' },
                        { label: 'Available', value: totalAvailable, icon: '✅', color: '#22c55e' },
                        { label: 'Total Value', value: `₹${(totalValue / 100000).toFixed(1)}L`, icon: '💰', color: '#f59e0b' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 12px rgba(146,64,14,0.06)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search equipment..."
                        style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '2px solid #fde68a', fontSize: '14px' }} />
                    <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                        style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #fde68a', fontSize: '13px', fontWeight: 600 }}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 4px 24px rgba(146,64,14,0.06)' }}>
                    <div style={{ minWidth: '800px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '48px 2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', background: '#92400e', color: '#fff', fontSize: '11px', fontWeight: 700, gap: '8px' }}>
                            <span></span><span>ITEM</span><span>QTY</span><span>AVAILABLE</span><span>CONDITION</span><span>VALUE</span>
                        </div>
                        {filtered.map((e, i) => {
                            const cond = CONDITION_COLORS[e.condition] || CONDITION_COLORS.GOOD;
                            return (
                                <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '48px 2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid #fef3c7', background: i % 2 === 0 ? '#fffbeb' : '#fff', fontSize: '13px', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '24px' }}>{e.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1e1b4b' }}>{e.name}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {e.location} · {e.category}</div>
                                    </div>
                                    <span style={{ fontWeight: 700, color: '#1e1b4b' }}>{e.quantity}</span>
                                    <span style={{ fontWeight: 700, color: e.available < e.quantity * 0.5 ? '#ef4444' : '#22c55e' }}>{e.available}</span>
                                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: cond.bg, color: cond.color, width: 'fit-content' }}>{e.condition}</span>
                                    <span style={{ fontWeight: 600, color: '#64748b' }}>₹{(e.quantity * e.unitCost / 1000).toFixed(0)}K</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

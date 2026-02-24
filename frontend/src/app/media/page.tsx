'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';

const ALBUMS = [
    {
        id: '1', title: 'District Cricket Cup 2025', sport: 'Cricket', date: '2025-12-15', coverEmoji: '🏏',
        items: [
            { type: 'photo', desc: 'Opening ceremony', emoji: '🎭' },
            { type: 'photo', desc: 'Semi-final match action', emoji: '⚡' },
            { type: 'video', desc: 'Final highlights', emoji: '🎬' },
            { type: 'photo', desc: 'Winner celebration', emoji: '🎉' },
            { type: 'photo', desc: 'Award ceremony', emoji: '🏆' },
            { type: 'photo', desc: 'Team photo', emoji: '📸' },
        ],
    },
    {
        id: '2', title: 'State Football League 2026', sport: 'Football', date: '2026-01-20', coverEmoji: '⚽',
        items: [
            { type: 'photo', desc: 'Kick-off', emoji: '🥅' },
            { type: 'video', desc: 'Goal compilation', emoji: '🎬' },
            { type: 'photo', desc: 'Training camp', emoji: '🏋️' },
            { type: 'photo', desc: 'Fan zone', emoji: '🎪' },
        ],
    },
    {
        id: '3', title: 'Kabaddi Championship', sport: 'Kabaddi', date: '2026-02-05', coverEmoji: '🤼',
        items: [
            { type: 'photo', desc: 'Opening raid', emoji: '💪' },
            { type: 'video', desc: 'Best tackles', emoji: '🎬' },
            { type: 'photo', desc: 'Super raid moment', emoji: '🔥' },
        ],
    },
    {
        id: '4', title: 'Athletics State Meet', sport: 'Athletics', date: '2026-02-12', coverEmoji: '🏃',
        items: [
            { type: 'photo', desc: '100m sprint start', emoji: '⚡' },
            { type: 'photo', desc: 'Long jump', emoji: '🦘' },
            { type: 'video', desc: 'Relay race', emoji: '🎬' },
            { type: 'photo', desc: 'Medal ceremony', emoji: '🥇' },
            { type: 'photo', desc: 'Javelin throw', emoji: '🎯' },
        ],
    },
];

export default function MediaPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '📸';
    const [selectedAlbum, setSelectedAlbum] = useState<typeof ALBUMS[0] | null>(null);
    const [view, setView] = useState<'grid' | 'list'>('grid');

    const filteredAlbums = selectedSport ? ALBUMS.filter(a => a.sport === selectedSport.name) : ALBUMS;
    const totalPhotos = filteredAlbums.reduce((a, al) => a + al.items.filter(i => i.type === 'photo').length, 0);
    const totalVideos = filteredAlbums.reduce((a, al) => a + al.items.filter(i => i.type === 'video').length, 0);

    const GRADIENT_COLORS = ['#ec4899', '#6366f1', '#22c55e', '#f59e0b'];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: "inherit", textDecoration: 'none' }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto", objectFit: "contain" }} /> <span className="gradient-text">Game Sphere</span></div></Link>
                <Link href="/dashboard" style={{ color: "inherit", fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: "inherit", marginBottom: '8px' }}>{sportIcon} {selectedSport ? `${sportLabel} Media Gallery` : 'Media Gallery'}</h1>
                <p style={{ color: "inherit", fontSize: '16px', marginBottom: '28px' }}>{selectedSport ? `${sportLabel} photos and videos` : 'Photos and videos from tournaments, matches, and events'}</p>

                {/* Stats */}
                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Albums', value: filteredAlbums.length, icon: '📁', color: "inherit" },
                        { label: 'Photos', value: totalPhotos, icon: '📷', color: "inherit" },
                        { label: 'Videos', value: totalVideos, icon: '🎬', color: "inherit" },
                        { label: 'Total Media', value: totalPhotos + totalVideos, icon: '📊', color: "inherit" },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 12px rgba(157,23,77,0.06)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: "inherit" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {!selectedAlbum ? (
                    /* Albums grid */
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {filteredAlbums.length === 0 ? (
                            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '16px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{sportIcon}</div>
                                <p style={{ color: "inherit" }}>No {sportLabel} media albums available yet</p>
                            </div>
                        ) : filteredAlbums.map((album, i) => (
                            <div key={album.id} onClick={() => setSelectedAlbum(album)}
                                style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(157,23,77,0.08)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                                <div style={{ height: '140px', background: `linear-gradient(135deg, ${GRADIENT_COLORS[i % 4]}, ${GRADIENT_COLORS[(i + 1) % 4]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' }}>
                                    {album.coverEmoji}
                                </div>
                                <div style={{ padding: '18px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: "inherit", marginBottom: '4px' }}>{album.title}</h3>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: "inherit" }}>
                                        <span>🏅 {album.sport}</span>
                                        <span>📅 {album.date}</span>
                                        <span>📷 {album.items.length} items</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Album detail view */
                    <div>
                        <button onClick={() => setSelectedAlbum(null)}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fce7f3', background: '#fff', color: "inherit", fontWeight: 700, cursor: 'pointer', fontSize: '13px', marginBottom: '16px' }}>
                            ← Back to Albums
                        </button>
                        <h2 style={{ fontSize: '22px', fontWeight: 900, color: "inherit", marginBottom: '4px' }}>{selectedAlbum.title}</h2>
                        <div style={{ fontSize: '13px', color: "inherit", marginBottom: '20px' }}>{selectedAlbum.sport} • {selectedAlbum.date} • {selectedAlbum.items.length} items</div>
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {selectedAlbum.items.map((item, i) => (
                                <div key={i} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(157,23,77,0.06)' }}>
                                    <div style={{ height: '120px', background: `linear-gradient(135deg, ${GRADIENT_COLORS[i % 4]}40, ${GRADIENT_COLORS[(i + 2) % 4]}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', position: 'relative' }}>
                                        {item.emoji}
                                        {item.type === 'video' && <span style={{ position: 'absolute', bottom: '8px', right: '8px', padding: '2px 8px', borderRadius: '4px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 700 }}>▶ VIDEO</span>}
                                    </div>
                                    <div style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '13px', color: "inherit" }}>{item.desc}</div>
                                        <div style={{ fontSize: '11px', color: "inherit", marginTop: '2px' }}>{item.type === 'video' ? '🎬 Video' : '📷 Photo'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

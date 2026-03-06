'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';

export default function MediaPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)' }}>
            <PageNavbar title="Media" emoji="📸" />
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
                    <div style={{ color: '#9d174d', fontSize: '14px' }}>Loading media...</div>
                </div>
            </div>
        }>
            <MediaContent />
        </Suspense>
    );
}

const TYPE_ICONS: Record<string, string> = { PHOTO: '📷', VIDEO: '🎬', ANNOUNCEMENT: '📢' };
const GRADIENT_COLORS = ['#ec4899', '#6366f1', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];

function MediaContent() {
    const searchParams = useSearchParams();
    const tournamentId = searchParams.get('tournamentId');
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';

    const [tournament, setTournament] = useState<any>(null);
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOrganizer, setIsOrganizer] = useState(false);

    // Upload form state
    const [showUpload, setShowUpload] = useState(false);
    const [uploadForm, setUploadForm] = useState({ type: 'PHOTO', title: '', description: '', url: '' });
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState('');

    useEffect(() => {
        if (!tournamentId) { setLoading(false); return; }
        setLoading(true);
        Promise.all([
            api.getTournament(tournamentId),
            api.getTournamentMedia(tournamentId),
        ]).then(([t, m]) => {
            setTournament(t);
            setMedia(m);
            // Check organizer: try store user first, fallback to localStorage
            let currentUserId = user?.id;
            if (!currentUserId) {
                try {
                    const stored = localStorage.getItem('user');
                    if (stored) currentUserId = JSON.parse(stored).id;
                } catch { }
            }
            setIsOrganizer(!!currentUserId && currentUserId === t.organizerId);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [tournamentId, user]);

    const handleUpload = async () => {
        if (!tournamentId || !uploadForm.title || !uploadForm.url) return;
        setUploading(true);
        try {
            const newMedia = await api.addTournamentMedia(tournamentId, uploadForm);
            setMedia(prev => [newMedia, ...prev]);
            setUploadForm({ type: 'PHOTO', title: '', description: '', url: '' });
            setShowUpload(false);
            setUploadSuccess('Media added successfully!');
            setTimeout(() => setUploadSuccess(''), 3000);
        } catch (e: any) {
            alert(e.message || 'Failed to upload');
        } finally {
            setUploading(false);
        }
    };

    // ═══════ No Tournament Context ═══════
    if (!tournamentId) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📸</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#831843', marginBottom: '12px' }}>Media Gallery</h1>
                    <p style={{ color: '#9d174d', fontSize: '15px', marginBottom: '28px' }}>
                        Select a tournament from your dashboard to view and manage its media gallery.
                    </p>
                    <Link href="/dashboard" style={{
                        display: 'inline-block', padding: '12px 28px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ec4899, #9d174d)', color: '#fff',
                        fontWeight: 700, textDecoration: 'none', fontSize: '14px',
                    }}>
                        Go to Dashboard →
                    </Link>
                </div>
            </div>
        );
    }

    // ═══════ Tournament Media Gallery ═══════
    const photos = media.filter(m => m.type === 'PHOTO');
    const videos = media.filter(m => m.type === 'VIDEO');
    const announcements = media.filter(m => m.type === 'ANNOUNCEMENT');

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)' }}>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                {/* Header */}
                <div className="flex-wrap-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9d174d', marginBottom: '4px' }}>
                            {tournament?.name || 'Tournament'} — Media
                        </div>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#831843', marginBottom: '4px' }}>📸 Media Gallery</h1>
                        <p style={{ color: '#9d174d', fontSize: '15px' }}>
                            {tournament?.sport?.name} tournament photos, videos & announcements
                        </p>
                    </div>

                    {/* Organizer Upload Button */}
                    {isOrganizer && (
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            style={{
                                padding: '12px 24px', borderRadius: '14px', border: 'none',
                                background: showUpload ? '#f43f5e' : 'linear-gradient(135deg, #ec4899, #9d174d)',
                                color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '14px',
                                boxShadow: '0 4px 16px rgba(236,72,153,0.3)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {showUpload ? '✕ Cancel' : '＋ Upload Media'}
                        </button>
                    )}
                </div>

                {/* Success Message */}
                {uploadSuccess && (
                    <div style={{
                        padding: '14px 20px', borderRadius: '12px', marginBottom: '20px',
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                        color: '#15803d', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        ✅ {uploadSuccess}
                    </div>
                )}

                {/* Upload Form — Organizer Only */}
                {isOrganizer && showUpload && (
                    <div style={{
                        background: '#fff', borderRadius: '20px', padding: '28px',
                        boxShadow: '0 8px 32px rgba(157,23,77,0.1)', marginBottom: '28px',
                        border: '2px solid rgba(236,72,153,0.2)',
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#831843', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📤 Upload New Media
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {/* Type */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
                                <select
                                    value={uploadForm.type}
                                    onChange={(e) => setUploadForm(f => ({ ...f, type: e.target.value }))}
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '12px',
                                        border: '2px solid #fce7f3', background: '#fdf2f8',
                                        fontSize: '14px', fontWeight: 600, color: '#831843',
                                    }}
                                >
                                    <option value="PHOTO">📷 Photo</option>
                                    <option value="VIDEO">🎬 Video</option>
                                    <option value="ANNOUNCEMENT">📢 Announcement</option>
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title *</label>
                                <input
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. Opening Ceremony Highlights"
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '12px',
                                        border: '2px solid #fce7f3', background: '#fdf2f8',
                                        fontSize: '14px', color: '#831843', boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            {/* URL */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>URL *</label>
                                <input
                                    value={uploadForm.url}
                                    onChange={(e) => setUploadForm(f => ({ ...f, url: e.target.value }))}
                                    placeholder="https://example.com/image.jpg or video URL"
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '12px',
                                        border: '2px solid #fce7f3', background: '#fdf2f8',
                                        fontSize: '14px', color: '#831843', boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            {/* Description */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description (optional)</label>
                                <textarea
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Add a description..."
                                    rows={2}
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '12px',
                                        border: '2px solid #fce7f3', background: '#fdf2f8',
                                        fontSize: '14px', color: '#831843', resize: 'vertical',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '12px' }}>
                            <button onClick={() => setShowUpload(false)} style={{
                                padding: '10px 20px', borderRadius: '10px', border: '2px solid #fce7f3',
                                background: 'transparent', color: '#9d174d', fontWeight: 700, cursor: 'pointer', fontSize: '13px',
                            }}>Cancel</button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !uploadForm.title || !uploadForm.url}
                                style={{
                                    padding: '10px 28px', borderRadius: '10px', border: 'none',
                                    background: (!uploadForm.title || !uploadForm.url) ? '#e5e7eb' : 'linear-gradient(135deg, #ec4899, #9d174d)',
                                    color: (!uploadForm.title || !uploadForm.url) ? '#9ca3af' : '#fff',
                                    fontWeight: 800, cursor: (!uploadForm.title || !uploadForm.url) ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                {uploading ? '⏳ Uploading...' : '📤 Upload'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Media', value: media.length, icon: '📊', color: '#ec4899' },
                        { label: 'Photos', value: photos.length, icon: '📷', color: '#6366f1' },
                        { label: 'Videos', value: videos.length, icon: '🎬', color: '#22c55e' },
                        { label: 'Announcements', value: announcements.length, icon: '📢', color: '#f59e0b' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 12px rgba(157,23,77,0.06)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Media Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#9d174d' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
                        Loading media...
                    </div>
                ) : media.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 4px 16px rgba(157,23,77,0.06)' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📸</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#831843', marginBottom: '8px' }}>No Media Yet</div>
                        <div style={{ color: '#9d174d', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                            {isOrganizer
                                ? 'Click "＋ Upload Media" above to add photos, videos, or announcements for this tournament.'
                                : 'The organizer hasn\'t uploaded any media yet. Check back later!'}
                        </div>
                    </div>
                ) : (
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {media.map((item, i) => (
                            <div key={item.id} style={{
                                background: '#fff', borderRadius: '20px', overflow: 'hidden',
                                boxShadow: '0 4px 16px rgba(157,23,77,0.06)', transition: 'transform 0.2s',
                            }}>
                                {/* Preview */}
                                {item.type === 'PHOTO' && item.url ? (
                                    <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={item.url}
                                            alt={item.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement!.style.background = `linear-gradient(135deg, ${GRADIENT_COLORS[i % 6]}40, ${GRADIENT_COLORS[(i + 2) % 6]}40)`;
                                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:48px">📷</div>';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{
                                        height: '140px',
                                        background: `linear-gradient(135deg, ${GRADIENT_COLORS[i % 6]}40, ${GRADIENT_COLORS[(i + 2) % 6]}40)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '48px', position: 'relative',
                                    }}>
                                        {TYPE_ICONS[item.type] || '📝'}
                                        {item.type === 'VIDEO' && (
                                            <span style={{
                                                position: 'absolute', bottom: '8px', right: '8px',
                                                padding: '3px 10px', borderRadius: '6px',
                                                background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800,
                                            }}>▶ VIDEO</span>
                                        )}
                                    </div>
                                )}

                                {/* Info */}
                                <div style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e1b4b', marginBottom: '4px' }}>{item.title}</div>
                                    {item.description && (
                                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', lineHeight: 1.4 }}>{item.description}</div>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#94a3b8', alignItems: 'center' }}>
                                        <span>{TYPE_ICONS[item.type] || '📝'} {item.type}</span>
                                        <span style={{ opacity: 0.4 }}>•</span>
                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {item.type !== 'ANNOUNCEMENT' && item.url && (
                                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-block', marginTop: '10px', padding: '6px 14px',
                                                borderRadius: '8px', background: 'rgba(236,72,153,0.08)',
                                                color: '#9d174d', fontSize: '12px', fontWeight: 700, textDecoration: 'none',
                                            }}>
                                            {item.type === 'VIDEO' ? '▶ Watch' : '🔗 View Full'}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Link href={`/tournaments/${tournamentId}`} style={{ color: '#9d174d', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                        ← Back to Tournament
                    </Link>
                </div>
            </div>
        </div>
    );
}

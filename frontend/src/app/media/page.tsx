'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';
import { Camera, Video, Megaphone } from 'lucide-react';

export default function MediaPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                <PageNavbar title="Media" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            </div>
        }>
            <MediaContent />
        </Suspense>
    );
}

type DashboardTab = 'photos' | 'videos' | 'announcements';
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
    const [dashboardTab, setDashboardTab] = useState<DashboardTab>('photos');

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
            api.getTournamentMedia(tournamentId).catch(() => []),
        ]).then(([t, m]) => {
            setTournament(t);
            setMedia(m || []);
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

    const TABS: { key: DashboardTab; icon: any; label: string }[] = [
        { key: 'photos', icon: <Camera size={20} />, label: 'Photos' },
        { key: 'videos', icon: <Video size={20} />, label: 'Videos' },
        { key: 'announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
    ];

    // ═══════ No Tournament Context ═══════
    if (!tournamentId) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <PageNavbar title="Media Gallery" />
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📸</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', marginBottom: '12px' }}>Media Gallery Explorer</h1>
                    <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '28px' }}>
                        Select a tournament from your dashboard or explore page to view and manage its explicit media gallery.
                    </p>
                    <Link href="/dashboard" style={{
                        display: 'inline-block', padding: '12px 28px', borderRadius: '12px',
                        background: '#0d9488', color: '#fff',
                        fontWeight: 700, textDecoration: 'none', fontSize: '14px',
                    }}>
                        Go to Dashboard →
                    </Link>
                </div>
            </div>
        );
    }

    const photos = media.filter(m => m.type === 'PHOTO');
    const videos = media.filter(m => m.type === 'VIDEO');
    const announcements = media.filter(m => m.type === 'ANNOUNCEMENT');

    let activeMedia = photos;
    if (dashboardTab === 'videos') activeMedia = videos;
    if (dashboardTab === 'announcements') activeMedia = announcements;

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                <PageNavbar title="Media" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageNavbar title={`${tournament?.name || 'Tournament'} Media`} />

            {/* ── Icon-Only Tab Bar (Flush Top) ── */}
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
                            onClick={() => {
                                setDashboardTab(tab.key);
                                // Set specific enum for default upload option based on tab
                                setUploadForm(f => ({ ...f, type: tab.key === 'photos' ? 'PHOTO' : tab.key === 'videos' ? 'VIDEO' : 'ANNOUNCEMENT' }));
                            }}
                            title={tab.label}
                            style={{
                                flex: 1, padding: '16px 0', border: 'none', background: 'none',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '8px',
                                color: dashboardTab === tab.key ? '#ec4899' : '#94a3b8',
                                borderBottom: dashboardTab === tab.key ? '3px solid #ec4899' : '3px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab.icon}
                            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px 80px' }}>

                {/* Section Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {dashboardTab === 'photos' && 'Tournament Photos'}
                            {dashboardTab === 'videos' && 'Tournament Videos'}
                            {dashboardTab === 'announcements' && 'Official Announcements'}
                            <span style={{ fontSize: '13px', background: '#e2e8f0', color: '#64748b', padding: '2px 8px', borderRadius: '8px' }}>{activeMedia.length}</span>
                        </h1>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
                            {tournament?.sport?.name || sportLabel} media gallery for {tournament?.name}
                        </p>
                    </div>

                    {/* Organizer Upload Button */}
                    {isOrganizer && (
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            style={{
                                padding: '10px 18px', borderRadius: '12px', border: 'none',
                                background: showUpload ? '#e2e8f0' : '#1e293b',
                                color: showUpload ? '#64748b' : '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '13px',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            {showUpload ? '✕ Cancel' : '＋ Add Media'}
                        </button>
                    )}
                </div>

                {/* Success Message */}
                {uploadSuccess && (
                    <div style={{
                        padding: '14px 20px', borderRadius: '12px', marginBottom: '24px',
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        color: '#16a34a', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        ✅ {uploadSuccess}
                    </div>
                )}

                {/* Upload Form — Organizer Only */}
                {isOrganizer && showUpload && (
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '32px',
                        border: '1px solid #e2e8f0',
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>
                            Upload {dashboardTab === 'photos' ? 'Photo' : dashboardTab === 'videos' ? 'Video' : 'Announcement'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {/* Title */}
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title *</label>
                                <input
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="Enter a descriptive title..."
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '10px',
                                        border: '1px solid #cbd5e1', background: '#f8fafc',
                                        fontSize: '14px', color: '#334155', boxSizing: 'border-box', outline: 'none'
                                    }}
                                />
                            </div>

                            {/* URL */}
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>URL *</label>
                                <input
                                    value={uploadForm.url}
                                    onChange={(e) => setUploadForm(f => ({ ...f, url: e.target.value }))}
                                    placeholder="https:// URL of file..."
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '10px',
                                        border: '1px solid #cbd5e1', background: '#f8fafc',
                                        fontSize: '14px', color: '#334155', boxSizing: 'border-box', outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Description */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                                <textarea
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Add any extra details..."
                                    rows={2}
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '10px',
                                        border: '1px solid #cbd5e1', background: '#f8fafc',
                                        fontSize: '14px', color: '#334155', resize: 'vertical',
                                        boxSizing: 'border-box', outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '12px' }}>
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !uploadForm.title || !uploadForm.url}
                                style={{
                                    padding: '10px 24px', borderRadius: '10px', border: 'none',
                                    background: (!uploadForm.title || !uploadForm.url) ? '#e2e8f0' : '#ec4899',
                                    color: (!uploadForm.title || !uploadForm.url) ? '#94a3b8' : '#fff',
                                    fontWeight: 800, cursor: (!uploadForm.title || !uploadForm.url) ? 'not-allowed' : 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                {uploading ? '⏳ Uploading...' : 'Upload Now'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Active Feed */}
                {activeMedia.length === 0 ? (
                    <div style={{ padding: '60px 20px', borderRadius: '16px', background: 'white', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>
                            {dashboardTab === 'photos' ? '📷' : dashboardTab === 'videos' ? '🎬' : '📢'}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#334155' }}>
                            No {dashboardTab === 'photos' ? 'Photos' : dashboardTab === 'videos' ? 'Videos' : 'Announcements'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                            {isOrganizer ? `Click 'Add Media' above to upload ${dashboardTab} for your tournament.` : `There are no ${dashboardTab} posted for this tournament yet.`}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: dashboardTab === 'announcements' ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                        {activeMedia.map((item, i) => (
                            <div key={item.id} style={{
                                background: 'white', borderRadius: '16px', overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column'
                            }}>
                                {/* Preview Block */}
                                {dashboardTab === 'photos' && item.url ? (
                                    <div style={{ height: '180px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div style="font-size:32px; color:#cbd5e1;">📷</div>';
                                        }} />
                                    </div>
                                ) : dashboardTab === 'videos' ? (
                                    <div style={{ height: '160px', background: '#1e293b', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <Video size={24} fill="white" />
                                        </div>
                                    </div>
                                ) : null}

                                {/* Info Block */}
                                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0', lineHeight: 1.3 }}>{item.title}</h3>
                                    {item.description && (
                                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.5, flex: 1 }}>{item.description}</p>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                                        {item.url && dashboardTab !== 'announcements' && (
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 800, color: '#ec4899', textDecoration: 'none' }}>
                                                {dashboardTab === 'videos' ? 'Watch' : 'View'} →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                    <Link href={`/tournaments/${tournamentId}`} style={{ color: '#0d9488', fontSize: '14px', fontWeight: 700, textDecoration: 'none', background: '#f0fdf4', padding: '10px 20px', borderRadius: '12px' }}>
                        ← Back to Tournament Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

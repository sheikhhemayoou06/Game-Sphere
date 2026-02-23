'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';

const TYPE_ICONS: Record<string, string> = {
    TRANSFER: '🔄',
    MATCH: '⚽',
    TOURNAMENT: '🏆',
    DOCUMENT: '📄',
    CERTIFICATE: '🏅',
    SYSTEM: '🔔',
};

export default function NotificationsPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '🔔';
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const fetchNotifications = () => {
        setLoading(true);
        api.getNotifications(filter === 'unread').then(setNotifications).catch(() => setNotifications([])).finally(() => setLoading(false));
    };

    useEffect(() => { fetchNotifications(); }, [filter]);

    const handleMarkRead = async (id: string) => {
        await api.markNotificationRead(id);
        fetchNotifications();
    };

    const handleMarkAllRead = async () => {
        await api.markAllNotificationsRead();
        fetchNotifications();
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 50%, #ffe4e6 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#be123c', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#be123c', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
                <div className="flex-wrap-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#9f1239', marginBottom: '8px' }}>
                            🔔 Notifications
                            {unreadCount > 0 && (
                                <span style={{ fontSize: '16px', marginLeft: '12px', padding: '4px 12px', borderRadius: '20px', background: '#ef4444', color: '#fff', fontWeight: 700, verticalAlign: 'middle' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </h1>
                        <p style={{ color: '#be123c', fontSize: '16px' }}>{selectedSport ? `${sportLabel} activity updates` : 'Stay updated on platform activity'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', background: 'rgba(159,18,57,0.06)', borderRadius: '10px', padding: '4px' }}>
                            {(['all', 'unread'] as const).map((f) => (
                                <button key={f} onClick={() => setFilter(f)}
                                    style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: filter === f ? '#9f1239' : 'transparent', color: filter === f ? '#fff' : '#9f1239', fontWeight: 600, fontSize: '13px', cursor: 'pointer', textTransform: 'capitalize' }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead}
                                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fda4af', background: 'transparent', color: '#9f1239', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                                ✓ Read All
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#be123c' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 4px 24px rgba(159,18,57,0.08)' }}>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔔</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#9f1239', marginBottom: '8px' }}>
                            {filter === 'unread' ? 'All Caught Up!' : 'No Notifications Yet'}
                        </div>
                        <div style={{ color: '#be123c', fontSize: '14px' }}>
                            {filter === 'unread' ? 'You have read all notifications' : 'Notifications will appear as events occur'}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {notifications.map((n) => (
                            <div key={n.id}
                                onClick={() => !n.read && handleMarkRead(n.id)}
                                style={{
                                    background: n.read ? '#fff' : '#fff5f5', borderRadius: '14px', padding: '18px 20px',
                                    boxShadow: n.read ? '0 1px 6px rgba(0,0,0,0.04)' : '0 2px 12px rgba(159,18,57,0.08)',
                                    border: `1px solid ${n.read ? '#fecdd3' : '#fda4af'}`,
                                    cursor: n.read ? 'default' : 'pointer', display: 'flex', gap: '14px', alignItems: 'flex-start',
                                    transition: 'all 0.2s',
                                }}>
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '12px',
                                    background: n.read ? '#f1f5f9' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                                }}>
                                    {TYPE_ICONS[n.type] || '🔔'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: n.read ? 600 : 800, fontSize: '14px', color: '#1e1b4b' }}>{n.title}</span>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{n.message}</div>
                                    {n.link && (
                                        <Link href={n.link} style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, textDecoration: 'none', marginTop: '6px', display: 'inline-block' }}>
                                            View Details →
                                        </Link>
                                    )}
                                </div>
                                {!n.read && (
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: '6px' }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

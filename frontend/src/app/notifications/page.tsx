'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import PageNavbar from '@/components/PageNavbar';

type Tab = 'all' | 'unread';

const CATEGORY_META: Record<string, { icon: string; label: string; color: string }> = {
    APP: { icon: '📱', label: 'App', color: '#4f46e5' },
    TEAM: { icon: '🛡️', label: 'Team', color: '#7c3aed' },
    TOURNAMENT: { icon: '🏆', label: 'Tournament', color: '#d97706' },
    MATCH: { icon: '⚔️', label: 'Match', color: '#dc2626' },
    PAYMENT: { icon: '💳', label: 'Payment', color: '#0891b2' },
    AUCTION: { icon: '🔨', label: 'Auction', color: '#ca8a04' },
    DOCUMENT: { icon: '📄', label: 'Document', color: '#64748b' },
    CERTIFICATE: { icon: '🏅', label: 'Certificate', color: '#b45309' },
    SYSTEM: { icon: '⚙️', label: 'System', color: '#475569' },
    UPDATE: { icon: '🔄', label: 'Update', color: '#059669' },
    TRANSFER: { icon: '🔁', label: 'Transfer', color: '#166534' },
    SPONSORSHIP: { icon: '💎', label: 'Sponsorship', color: '#854d0e' },
    SCORING: { icon: '📊', label: 'Scoring', color: '#be123c' },
    TRAINING: { icon: '🏋️', label: 'Training', color: '#9333ea' },
    MEDIA: { icon: '📸', label: 'Media', color: '#0284c7' },
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('all');

    const fetchNotifications = () => {
        setLoading(true);
        api.getNotifications(activeTab === 'unread')
            .then(setNotifications)
            .catch(() => setNotifications([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchNotifications(); }, [activeTab]);

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

    const unreadCount = notifications.filter(n => !n.read).length;

    const TABS: { key: Tab; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'unread', label: 'Unread' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Navbar */}
            <PageNavbar title="Notifications" />

            {/* Tab Navigation Bar */}
            <div style={{
                background: 'white', borderBottom: '1px solid #e2e8f0',
                position: 'sticky', top: '52px', zIndex: 49,
                overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any,
            }}>
                <div style={{
                    maxWidth: '700px', margin: '0 auto', padding: '0 16px',
                    display: 'flex', gap: '0', justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '12px 24px', border: 'none', background: 'none',
                                cursor: 'pointer', fontSize: '14px', fontWeight: 700,
                                color: activeTab === tab.key ? '#4f46e5' : '#94a3b8',
                                borderBottom: activeTab === tab.key ? '3px solid #4f46e5' : '3px solid transparent',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}
                        >
                            {tab.label}
                            {tab.key === 'unread' && unreadCount > 0 && (
                                <span style={{
                                    width: '20px', height: '20px', borderRadius: '50%',
                                    background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 700,
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                }}>{unreadCount}</span>
                            )}
                        </button>
                    ))}

                    {/* Mark all read button */}
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            style={{
                                marginLeft: 'auto', padding: '6px 14px', borderRadius: '8px',
                                border: '1px solid #e2e8f0', background: 'white',
                                color: '#4f46e5', fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            ✓ Read All
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px 16px 80px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '15px' }}>
                        ⏳ Loading notifications…
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{
                        padding: '60px 20px', borderRadius: '20px', background: 'white',
                        border: '1px solid #f1f5f9', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>
                            {activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
                            {activeTab === 'unread'
                                ? 'You have read all your notifications.'
                                : 'Notifications from App, Team, Tournaments, Payments, and more will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {notifications.map(n => {
                            const cat = CATEGORY_META[n.type] || CATEGORY_META.APP;
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => !n.read && handleMarkRead(n.id)}
                                    style={{
                                        padding: '16px', borderRadius: '14px',
                                        background: n.read ? 'white' : '#f8f7ff',
                                        border: `1px solid ${n.read ? '#f1f5f9' : '#e0e7ff'}`,
                                        cursor: n.read ? 'default' : 'pointer',
                                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: n.read ? '#f1f5f9' : `${cat.color}12`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '18px', flexShrink: 0,
                                    }}>
                                        {cat.icon}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                <span style={{
                                                    fontWeight: n.read ? 600 : 700, fontSize: '14px', color: '#1e1b4b',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>{n.title}</span>
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                                        </div>
                                        {/* Category badge */}
                                        <span style={{
                                            display: 'inline-block', padding: '1px 8px', borderRadius: '6px',
                                            background: `${cat.color}10`, color: cat.color,
                                            fontSize: '10px', fontWeight: 700, marginBottom: '4px',
                                            textTransform: 'uppercase', letterSpacing: '0.3px',
                                        }}>{cat.label}</span>
                                        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{n.message}</div>
                                        {n.link && (
                                            <Link href={n.link} style={{
                                                fontSize: '12px', color: '#4f46e5', fontWeight: 600,
                                                textDecoration: 'none', marginTop: '6px', display: 'inline-block',
                                            }}>
                                                View Details →
                                            </Link>
                                        )}
                                    </div>

                                    {/* Unread dot */}
                                    {!n.read && (
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            background: '#4f46e5', flexShrink: 0, marginTop: '6px',
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

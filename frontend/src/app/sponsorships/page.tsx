'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSportStore } from '@/lib/store';

export default function SponsorshipsPage() {
    const { selectedSport } = useSportStore();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getTournaments().then(setTournaments).catch(() => []).finally(() => setLoading(false));
    }, []);

    const sponsors: any[] = [];

    const filteredSponsors = selectedSport
        ? sponsors.filter((s: any) => s.sport === selectedSport.name || s.sport === 'All Sports')
        : sponsors;

    const activeSponsorships = filteredSponsors.filter((s: any) => s.status === 'ACTIVE').length;
    const totalSponsorship = filteredSponsors.reduce((acc: number, curr: any) => {
        const val = parseInt(curr.amount.replace(/[^0-9]/g, ''), 10);
        return acc + val;
    }, 0);

    const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
        ACTIVE: { bg: '#ecfdf5', color: '#22c55e' },
        PENDING: { bg: '#fffbeb', color: '#f59e0b' },
        EXPIRED: { bg: '#fef2f2', color: '#ef4444' },
    };

    const adPlacements: any[] = [];

    const filteredAds = selectedSport
        ? adPlacements.filter(ad => ad.sport === selectedSport.name || ad.sport === 'All Sports')
        : adPlacements;

    const adRevenue = filteredAds.reduce((acc, ad) => acc + parseInt(ad.revenue.replace(/[^0-9]/g, ''), 10), 0);
    const adImpressionsNum = filteredAds.reduce((acc, ad) => acc + parseFloat(ad.impressions.replace('K', '')) * 1000, 0);
    const adImpressions = adImpressionsNum >= 1000 ? `${(adImpressionsNum / 1000).toFixed(1)}K` : adImpressionsNum.toString();

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/home" style={{ fontSize: '20px', fontWeight: 800, color: '#92400e', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#92400e', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#78350f', marginBottom: '8px' }}>💎 Sponsorships & Ads</h1>
                <p style={{ color: '#92400e', fontSize: '16px', marginBottom: '28px' }}>Manage sponsors, ad placements, and monetization</p>

                {/* Stats */}
                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
                    {[
                        { label: 'Total Sponsorship', value: `₹${totalSponsorship.toLocaleString()}`, icon: '💰', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
                        { label: 'Active Sponsors', value: activeSponsorships, icon: '🤝', bg: 'linear-gradient(135deg, #22c55e, #15803d)' },
                        { label: 'Ad Impressions', value: adImpressions, icon: '👁️', bg: 'linear-gradient(135deg, #6366f1, #4338ca)' },
                        { label: 'Ad Revenue', value: `₹${adRevenue.toLocaleString()}`, icon: '📈', bg: 'linear-gradient(135deg, #ec4899, #be185d)' },
                    ].map(s => (
                        <div key={s.label} style={{ padding: '22px', borderRadius: '16px', background: s.bg, color: '#fff' }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                            <div style={{ fontSize: '22px', fontWeight: 900 }}>{s.value}</div>
                            <div style={{ fontSize: '12px', opacity: 0.85 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Sponsors list */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 24px rgba(120,53,15,0.06)', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#78350f', marginBottom: '16px' }}>🤝 Sponsors</h2>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {filteredSponsors.length === 0 && <div style={{ color: '#92400e', textAlign: 'center', padding: '20px' }}>No sponsors found for this sport.</div>}
                        {filteredSponsors.map((sp, i) => {
                            const statusCfg = STATUS_CONFIG[sp.status] || STATUS_CONFIG.PENDING;
                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fde68a', gap: '14px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{sp.logo}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '15px', color: '#1e1b4b' }}>{sp.name}</span>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: `${sp.color}22`, color: sp.color }}>{sp.tier}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{sp.sport} • {sp.placement}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#78350f' }}>{sp.amount}</div>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: statusCfg.bg, color: statusCfg.color }}>{sp.status}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Ad placements */}
                <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(120,53,15,0.06)' }}>
                    <div style={{ padding: '20px 24px', background: '#92400e', color: '#fff' }}>
                        <h2 style={{ fontWeight: 800, fontSize: '16px' }}>📊 Ad Placement Performance</h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ minWidth: '600px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 24px', background: '#fef3c7', fontSize: '11px', fontWeight: 700, color: '#92400e' }}>
                                <span>Placement</span><span>Impressions</span><span>Clicks</span><span>CTR</span><span>Revenue</span>
                            </div>
                            {filteredAds.length === 0 && <div style={{ color: '#92400e', textAlign: 'center', padding: '20px' }}>No ad placements found for this sport.</div>}
                            {filteredAds.map((ad, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 24px', borderBottom: '1px solid #fef3c7', fontSize: '13px', background: i % 2 === 0 ? '#fffbeb' : '#fff' }}>
                                    <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{ad.location}</span>
                                    <span style={{ color: '#64748b' }}>{ad.impressions}</span>
                                    <span style={{ color: '#64748b' }}>{ad.clicks}</span>
                                    <span style={{ fontWeight: 700, color: '#22c55e' }}>{ad.ctr}</span>
                                    <span style={{ fontWeight: 700, color: '#78350f' }}>{ad.revenue}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

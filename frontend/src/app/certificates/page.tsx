'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSportStore } from '@/lib/store';
import { sportIcons, sportConfig, defaultSportConfig } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';
import { Award, ScrollText, CheckCircle2 } from 'lucide-react';

type DashboardTab = 'certificates' | 'awards';

export default function CertificatesPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'Cricket';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || sportConfig[selectedSport.name]?.emoji || defaultSportConfig.emoji) : '🏏';

    // --- State ---
    const [dashboardTab, setDashboardTab] = useState<DashboardTab>('certificates');
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getCertificates().then(setCertificates).catch(() => setCertificates([])).finally(() => setLoading(false));
    }, []);

    const TABS: { key: DashboardTab; icon: any; label: string }[] = [
        { key: 'certificates', icon: <ScrollText size={20} />, label: 'Certificates' },
        { key: 'awards', icon: <Award size={20} />, label: 'Awards' },
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                <PageNavbar title="Certificates & Awards" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#0f766e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            </div>
        );
    }

    const filteredCertificates = selectedSport ? certificates.filter(c => !c.sportName || c.sportName === selectedSport.name) : certificates;

    // --- Mock Data ---
    const hasCerts = filteredCertificates.length > 0;

    // Grouping strictly for UI demonstration
    const mockCerts = hasCerts ? filteredCertificates : [
        { id: 'c-1', level: 'National', title: 'National Championship Runner Up', sportName: sportLabel, date: 'Oct 2026', code: 'N1X92D' },
        { id: 'c-2', level: 'State', title: 'State Finals Qualifier', sportName: sportLabel, date: 'Aug 2026', code: 'S3B71L' },
        { id: 'c-3', level: 'District', title: 'District MVP Certificate', sportName: sportLabel, date: 'May 2026', code: 'D9A44M' },
        { id: 'c-4', level: 'Local', title: 'Summer League Participant', sportName: sportLabel, date: 'Mar 2026', code: 'L2C88X' },
    ];

    const mockAwards = [
        { id: 'a-1', type: 'POT', title: 'Player of the Tournament', subtitle: `Global ${sportLabel} Championship 2026`, color: '#ca8a04', bg: '#fefce8' },
        { id: 'a-2', type: 'POM', title: 'Player of the Match', subtitle: 'Finals vs Mumbai Indians', color: '#0284c7', bg: '#f0f9ff' },
        { id: 'a-3', type: 'RANKING', title: 'Game Sphere #1 Ranked', subtitle: sportLabel === 'Cricket' ? 'No. 1 Batsman' : `Top Ranked ${sportLabel} Player`, color: '#16a34a', bg: '#f0fdf4' },
    ];

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'national': return { text: '#b91c1c', bg: '#fef2f2', border: '#f87171' };
            case 'state': return { text: '#c2410c', bg: '#fff7ed', border: '#fb923c' };
            case 'district': return { text: '#4338ca', bg: '#eef2ff', border: '#818cf8' };
            default: return { text: '#0369a1', bg: '#f0f9ff', border: '#7dd3fc' };
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageNavbar title="Certificates & Awards" />

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
                            onClick={() => setDashboardTab(tab.key)}
                            title={tab.label}
                            style={{
                                flex: 1, padding: '16px 0', border: 'none', background: 'none',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '8px',
                                color: dashboardTab === tab.key ? '#0d9488' : '#94a3b8',
                                borderBottom: dashboardTab === tab.key ? '3px solid #0d9488' : '3px solid transparent',
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

                {/* ======================= CERTIFICATES TAB ======================= */}
                {dashboardTab === 'certificates' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Section Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', margin: 0 }}>Official Certificates</h1>
                            </div>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                📜
                            </div>
                        </div>

                        {/* Certificates List */}
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {mockCerts.map((cert) => {
                                const level = cert.level || 'Local';
                                const theme = getLevelColor(level);
                                return (
                                    <div key={cert.id} style={{
                                        background: 'white', borderRadius: '16px', padding: '24px',
                                        border: '1px solid #e2e8f0', borderLeft: `6px solid ${theme.border}`,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '16px',
                                        transition: 'transform 0.2s'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: theme.text, background: theme.bg, padding: '6px 14px', borderRadius: '8px' }}>
                                                    {level} Level
                                                </div>
                                            </div>
                                            {/* Verified Badge */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                                <CheckCircle2 size={16} strokeWidth={3} />
                                                <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', marginBottom: '4px' }}>{cert.title || cert.recipientName || 'Certificate of Achievement'}</div>
                                            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{cert.sportName || sportLabel} • Issued {cert.date || '2026'}</div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '16px', marginTop: '4px' }}>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}>
                                                ID: {cert.code || cert.verificationCode?.slice(0, 8) || 'VERIFIED-DOC'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}


                {/* ======================= AWARDS TAB ======================= */}
                {dashboardTab === 'awards' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Section Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', margin: 0 }}>Prestigious Awards</h1>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Your top tier accolades across all matches.</p>
                            </div>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fefce8', border: '1px solid #fef08a', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                🏆
                            </div>
                        </div>

                        {/* Awards Feed */}
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {mockAwards.map((award) => (
                                <div key={award.id} style={{
                                    background: award.bg, borderRadius: '20px', padding: '24px',
                                    border: `1px solid ${award.color}30`, display: 'flex', alignItems: 'center', gap: '24px',
                                    position: 'relative', overflow: 'hidden'
                                }}>
                                    {/* Icon */}
                                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${award.color}40`, flexShrink: 0, boxShadow: `0 8px 16px ${award.color}15`, zIndex: 2 }}>
                                        {award.type === 'POT' ? <Trophy size={32} color={award.color} /> : award.type === 'POM' ? <Medal size={32} color={award.color} /> : <Crown size={32} color={award.color} />}
                                    </div>

                                    <div style={{ flex: 1, zIndex: 2 }}>
                                        <div style={{ fontSize: '11px', fontWeight: 900, color: award.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                            {award.type === 'POT' ? 'Tournament MVP' : award.type === 'POM' ? 'Match MVP' : 'Global Ranking'}
                                        </div>
                                        <div style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b', marginBottom: '4px', lineHeight: 1.2 }}>{award.title}</div>
                                        <div style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>{award.subtitle}</div>
                                    </div>

                                    {/* Decorative watermark */}
                                    <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.05, fontSize: '120px', zIndex: 1, pointerEvents: 'none' }}>
                                        {award.type === 'POT' ? '🏆' : award.type === 'POM' ? '🏅' : '👑'}
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

// Inline fallback icons for awards without importing extra deps
const Trophy = ({ size, color }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>;
const Medal = ({ size, color }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" /><path d="M11 12 5.12 2.2" /><path d="M13 12l5.88-9.8" /><path d="M8 7h8" /><circle cx="12" cy="17" r="5" /><polyline points="12 18 12 15 14 16" /></svg>;
const Crown = ({ size, color }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>;

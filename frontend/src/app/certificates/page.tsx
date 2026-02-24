'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';
import { sportIcons, sportConfig, defaultSportConfig } from '@/lib/utils';

export default function CertificatesPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || sportConfig[selectedSport.name]?.emoji || defaultSportConfig.emoji) : '🏅';
    const [certificates, setCertificates] = useState<any[]>([]);
    const [verifyCode, setVerifyCode] = useState('');
    const [verifyResult, setVerifyResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'browse' | 'verify'>('browse');

    useEffect(() => {
        api.getCertificates().then(setCertificates).catch(() => setCertificates([])).finally(() => setLoading(false));
    }, []);

    const filteredCertificates = selectedSport ? certificates.filter(c => !c.sportName || c.sportName === selectedSport.name) : certificates;

    const handleVerify = async () => {
        if (!verifyCode.trim()) return;
        try {
            const result = await api.verifyCertificate(verifyCode.trim());
            setVerifyResult(result);
        } catch { setVerifyResult({ valid: false }); }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'WINNER': return { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: "inherit", icon: '🏆' };
            case 'ACHIEVEMENT': return { bg: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: '#fff', icon: '⭐' };
            default: return { bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', icon: '📜' };
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)' }}>
            {/* Header */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: "inherit", textDecoration: 'none' }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto", objectFit: "contain" }} /> <span className="gradient-text">Game Sphere</span></div></Link>
                <Link href="/dashboard" style={{ color: "inherit", fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: "inherit", marginBottom: '8px' }}>{sportIcon} {selectedSport ? `${sportLabel} Certificates` : 'Certificates'}</h1>
                <p style={{ color: "inherit", fontSize: '16px', marginBottom: '28px' }}>{selectedSport ? `${sportLabel} QR-verifiable digital certificates` : 'QR-verifiable digital certificates for participation and achievements'}</p>

                {/* Tabs */}
                <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '4px', background: 'rgba(120,53,15,0.08)', borderRadius: '14px', padding: '4px', marginBottom: '28px', width: 'fit-content' }}>
                    {(['browse', 'verify'] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: tab === t ? '#78350f' : 'transparent', color: tab === t ? '#fff' : '#92400e', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                            {t === 'browse' ? '📋 Browse' : '🔍 Verify'}
                        </button>
                    ))}
                </div>

                {tab === 'verify' && (
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 24px rgba(120,53,15,0.1)', marginBottom: '28px', border: '2px solid rgba(120,53,15,0.1)' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: "inherit", marginBottom: '16px' }}>Verify Certificate</h2>
                        <p style={{ color: "inherit", fontSize: '14px', marginBottom: '20px' }}>Enter the verification code or scan QR to verify authenticity</p>
                        <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '12px' }}>
                            <input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="Enter verification code..."
                                style={{ flex: 1, padding: '14px 18px', borderRadius: '12px', border: '2px solid #fbbf24', fontSize: '15px', fontWeight: 600, outline: 'none', fontFamily: 'monospace', background: '#fffbeb' }}
                                onKeyDown={(e) => e.key === 'Enter' && handleVerify()} />
                            <button onClick={handleVerify}
                                style={{ padding: '14px 28px', borderRadius: '12px', border: 'none', background: '#78350f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                                Verify
                            </button>
                        </div>
                        {verifyResult && (
                            <div style={{ marginTop: '20px', padding: '20px', borderRadius: '14px', background: verifyResult.valid ? '#ecfdf5' : '#fef2f2', border: `2px solid ${verifyResult.valid ? '#22c55e' : '#ef4444'}` }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{verifyResult.valid ? '✅' : '❌'}</div>
                                <div style={{ fontWeight: 800, fontSize: '18px', color: verifyResult.valid ? '#166534' : '#991b1b', marginBottom: '4px' }}>
                                    {verifyResult.valid ? 'Certificate is Valid!' : 'Certificate Not Found'}
                                </div>
                                {verifyResult.valid && verifyResult.certificate && (
                                    <div style={{ color: "inherit", fontSize: '14px' }}>
                                        <strong>{verifyResult.certificate.recipientName}</strong> — {verifyResult.certificate.type} · {verifyResult.certificate.tournamentName || 'N/A'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'browse' && (
                    loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: "inherit" }}>
                            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>Loading certificates...
                        </div>
                    ) : filteredCertificates.length === 0 ? (
                        <div style={{ background: '#fff', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 4px 24px rgba(120,53,15,0.1)' }}>
                            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📜</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: "inherit", marginBottom: '8px' }}>No Certificates Yet</div>
                            <div style={{ color: "inherit", fontSize: '14px' }}>Certificates are generated when tournaments are completed</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {filteredCertificates.map((cert) => {
                                const badge = getTypeBadge(cert.type);
                                return (
                                    <div key={cert.id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 16px rgba(120,53,15,0.08)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(120,53,15,0.08)', transition: 'transform 0.2s' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>{badge.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: '17px', color: "inherit", marginBottom: '4px' }}>{cert.recipientName}</div>
                                            <div style={{ fontSize: '13px', color: "inherit" }}>{cert.tournamentName || 'Tournament'} · {cert.sportName || 'Sport'}</div>
                                            {cert.position && <div style={{ fontSize: '13px', color: "inherit", fontWeight: 700, marginTop: '2px' }}>🏅 {cert.position}</div>}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '8px', background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>{cert.type}</div>
                                            <div style={{ fontSize: '11px', color: "inherit", marginTop: '6px', fontFamily: 'monospace' }}>{cert.verificationCode?.slice(0, 8)}...</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

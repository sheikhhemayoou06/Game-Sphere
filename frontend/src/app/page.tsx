'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import RunningAthleteLoader from '@/components/RunningAthleteLoader';

export default function WelcomeGatewayPage() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isChecking, setIsChecking] = useState(true);

    const router = useRouter();
    const { user, setAuth } = useAuthStore();

    useEffect(() => {
        // Only run on the client
        if (typeof window !== 'undefined') {
            const checkSessionAndSkip = () => {
                // If logged in, send them straight to the dashboard
                if (user && user.id) {
                    router.replace('/dashboard');
                    return;
                }

                // If they previously skipped this gateway, send them straight to the new homepage
                const hasSkipped = localStorage.getItem('hasSkippedGateway');
                if (hasSkipped === 'true') {
                    router.replace('/home');
                    return;
                }

                // Otherwise, show the gateway
                setIsChecking(false);
            };

            // Slight timeout to ensure Zustand store hydration
            setTimeout(checkSessionAndSkip, 150); // Increased timeout slightly for reliable hydration
        }
    }, [user, router]);

    const handleSkip = () => {
        localStorage.setItem('hasSkippedGateway', 'true');
        router.push('/home');
    };

    const clearTestState = () => {
        localStorage.removeItem('hasSkippedGateway');
        window.location.reload();
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (!isOtpSent) {
                await api.sendOtp({ phone });
                setIsOtpSent(true);
                setMessage(`OTP sent to ${phone}`);
            } else {
                const res = await api.verifyOtp({ phone, otp });
                setAuth(res.user, res.accessToken);
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (isChecking) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            }}>
                {/* Empty matching background while checking redirection logic */}
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: '20px',
        }}>
            <div style={{
                position: 'relative', width: '100%', maxWidth: '420px', minHeight: '350px',
                background: 'rgba(255, 255, 255, 0.95)', padding: '40px 32px',
                borderRadius: '24px', backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.2)', textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.4)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center'
            }}>
                {loading ? (
                    <RunningAthleteLoader />
                ) : (
                    <>
                        {/* Logo & Header */}
                        <div style={{ marginBottom: '32px' }}>
                            <span style={{ fontSize: '48px' }}>🌐</span>
                            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e1b4b', marginTop: '16px', letterSpacing: '-0.5px' }}>
                                Welcome to Game Sphere
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px' }}>
                                Enter your phone number to get personalized live updates for your favorite teams.
                            </p>
                        </div>

                        {error && <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 500 }}>{error}</div>}
                        {message && <div style={{ padding: '12px', background: '#f0fdf4', color: '#16a34a', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 500 }}>{message}</div>}

                        <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                            {!isOtpSent ? (
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Phone Number</label>
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91 98765 43210" className="input-field" style={{ color: '#1e1b4b', padding: '14px' }} />
                                </div>
                            ) : (
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Enter 6-Digit OTP</label>
                                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} placeholder="123456" className="input-field" style={{ color: '#1e1b4b', padding: '14px', letterSpacing: '8px', textAlign: 'center', fontSize: '24px', fontWeight: 800 }} />
                                </div>
                            )}

                            <button type="submit" className="btn-primary" style={{ padding: '16px', width: '100%', justifyContent: 'center', fontSize: '16px', marginTop: '8px' }}>
                                {!isOtpSent ? '📱 Request OTP' : '✅ Verify & Enter'}
                            </button>

                            {isOtpSent && (
                                <button type="button" onClick={() => { setIsOtpSent(false); setOtp(''); setMessage(''); setError(''); }} style={{
                                    background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '-4px'
                                }}>
                                    ← Change Phone Number
                                </button>
                            )}
                        </form>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
                            <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>OR</span>
                            <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                        </div>

                        <button onClick={handleSkip} style={{
                            background: 'transparent', border: '2px solid #e2e8f0', color: '#64748b',
                            padding: '14px', width: '100%', borderRadius: '12px', fontWeight: 600,
                            fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                        >
                            Continue as Guest
                        </button>
                        <div style={{ marginTop: '24px' }}>
                            <Link href="/login" style={{ fontSize: '13px', color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                                Staff Member, Team Manager, or Official? Sign in here
                            </Link>
                        </div>
                    </>
                )}

                {/* DEBUG HELPER */}
                <div style={{ marginTop: '32px' }}>
                    <button onClick={clearTestState} style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>
                        Developer: Clear Skip Session
                    </button>
                </div>
            </div>
        </div>
    );
}

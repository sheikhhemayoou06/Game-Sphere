'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (loginMethod === 'email') {
                // 1. Authenticate with Supabase
                const { error: sbError } = await supabase.auth.signInWithPassword({ email, password });

                // If Supabase fails but it's an "Invalid login credentials", we should still try the backend 
                // in case the user exists on the old backend but hasn't been migrated to Supabase yet.
                // However, for consistency, we throw if Supabase fails.
                if (sbError && sbError.message !== 'Invalid login credentials') {
                    throw sbError;
                }

                // 2. Authenticate with Backend to get the custom JWT session
                const res = await api.login({ email, password });
                setAuth(res.user, res.accessToken);
                router.push('/dashboard');
            } else {
                if (!isOtpSent) {
                    await api.sendOtp({ phone });
                    setIsOtpSent(true);
                    setMessage(`OTP sent to ${phone}. Enter to continue.`);
                } else {
                    const res = await api.verifyOtp({ phone, otp });
                    setAuth(res.user, res.accessToken);
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: '20px',
        }}>
            <div style={{
                width: '100%', maxWidth: '440px', padding: '48px 40px',
                borderRadius: '24px', background: 'white',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <span style={{ fontSize: '40px' }}>🌐</span>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '12px', color: '#1e1b4b', letterSpacing: '-0.5px' }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>
                        Sign in to Game Sphere
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
                        background: '#fef2f2', color: '#dc2626', fontSize: '14px', fontWeight: 500,
                        border: '1px solid #fecaca',
                    }}>
                        {error}
                    </div>
                )}
                {message && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
                        background: '#f0fdf4', color: '#16a34a', fontSize: '14px', fontWeight: 500,
                        border: '1px solid #bbf7d0',
                    }}>
                        {message}
                    </div>
                )}

                {/* Login Method Toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', padding: '6px', borderRadius: '14px' }}>
                    <button onClick={() => { setLoginMethod('email'); setIsOtpSent(false); setError(''); setMessage(''); }}
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: loginMethod === 'email' ? 'white' : 'transparent', color: loginMethod === 'email' ? '#1e1b4b' : '#64748b', boxShadow: loginMethod === 'email' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
                        Email & Password
                    </button>
                    <button onClick={() => { setLoginMethod('phone'); setError(''); setMessage(''); }}
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: loginMethod === 'phone' ? 'white' : 'transparent', color: loginMethod === 'phone' ? '#1e1b4b' : '#64748b', boxShadow: loginMethod === 'phone' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
                        Phone OTP (Fans)
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {loginMethod === 'email' ? (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                                    Email
                                </label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="input-field" placeholder="you@example.com" required style={{ color: '#1e1b4b' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                                    Password
                                </label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="input-field" placeholder="••••••••" required style={{ color: '#1e1b4b' }} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                                    Phone Number
                                </label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isOtpSent}
                                    className="input-field" placeholder="+91 98765 43210" required style={{ color: '#1e1b4b' }} />
                            </div>
                            {isOtpSent && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                                        Enter 6-digit OTP
                                    </label>
                                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                                        className="input-field" placeholder="123456" required style={{ color: '#1e1b4b', letterSpacing: '4px', textAlign: 'center', fontSize: '20px', fontWeight: 700 }} maxLength={6} />
                                </div>
                            )}
                        </>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading} style={{
                        width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px',
                        opacity: loading ? 0.7 : 1,
                    }}>
                        {loading ? '⏳ Please wait...' : (loginMethod === 'email' ? '🔐 Sign In' : (isOtpSent ? '✅ Verify Origin' : '📩 Get OTP'))}
                    </button>

                    {loginMethod === 'phone' && isOtpSent && (
                        <button type="button" onClick={() => { setIsOtpSent(false); setOtp(''); setMessage(''); setError(''); }} style={{
                            background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '-4px'
                        }}>
                            ← Change Phone Number
                        </button>
                    )}
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import RunningAthleteLoader from '@/components/RunningAthleteLoader';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [tempUserId, setTempUserId] = useState('');
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
            // Execute Supabase and Backend logins concurrently to save time
            const [sbAuth, backendAuth] = await Promise.allSettled([
                supabase.auth.signInWithPassword({ email, password }),
                api.login({ email, password, rememberMe })
            ]);

            const sbError = sbAuth.status === 'fulfilled' ? sbAuth.value.error : sbAuth.reason;

            if (sbError && sbError.message !== 'Invalid login credentials') {
                throw sbError;
            }

            if (backendAuth.status === 'rejected') {
                throw backendAuth.reason;
            }

            const res = backendAuth.value;

            if (res.requires2FA) {
                setRequires2FA(true);
                setTempUserId(res.userId);
                setMessage(res.message);
                return;
            }

            setAuth(res.user, res.accessToken);
            router.push('/dashboard');
        } catch (err: any) {
            const currentApiUrl = process.env.NODE_ENV === 'development' && typeof window !== 'undefined'
                ? `http://${window.location.hostname}:4000/api` : 'production or unresolved';
            console.error(`[DEBUG] Error: ${err.message}\nSupabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\nAPI URL: ${currentApiUrl}`);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await api.verifyTwoFactorLogin({
                userId: tempUserId,
                token: twoFactorToken,
                rememberMe,
            });
            setAuth(res.user, res.accessToken);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Verification failed');
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
                width: '100%', maxWidth: '440px', minHeight: '400px', padding: '48px 40px',
                borderRadius: '24px', background: 'white',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center'
            }}>
                {loading ? (
                    <RunningAthleteLoader />
                ) : (
                    <>
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

                        {requires2FA ? (
                            <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                                        6-Digit Authenticator Code
                                    </label>
                                    <input type="text" value={twoFactorToken} onChange={(e) => setTwoFactorToken(e.target.value)}
                                        className="input-field" placeholder="123456" maxLength={6} required style={{ color: '#1e1b4b', textAlign: 'center', letterSpacing: '4px', fontSize: '20px' }} />
                                </div>
                                <button type="submit" className="btn-primary" style={{
                                    width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px'
                                }}>
                                    ✅ Verify Code
                                </button>
                                <button type="button" onClick={() => { setRequires2FA(false); setTempUserId(''); setTwoFactorToken(''); }} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '14px', cursor: 'pointer', fontWeight: 600, marginTop: '8px' }}>
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                                        Email
                                    </label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="input-field" placeholder="you@example.com" required style={{ color: '#1e1b4b' }} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                                            Password
                                        </label>
                                        <Link href="/forgot-password" style={{ fontSize: '13px', fontWeight: 600, color: '#6366f1', textDecoration: 'none', marginBottom: '6px' }}>
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="input-field" placeholder="••••••••" required style={{ color: '#1e1b4b' }} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ cursor: 'pointer' }} />
                                    <label htmlFor="rememberMe" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>Remember me</label>
                                </div>

                                <button type="submit" className="btn-primary" style={{
                                    width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px'
                                }}>
                                    🔐 Sign In
                                </button>
                            </form>
                        )}

                        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
                            Don&apos;t have an account?{' '}
                            <Link href="/register" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                                Register
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

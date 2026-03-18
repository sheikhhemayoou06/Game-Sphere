'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import RunningAthleteLoader from '@/components/RunningAthleteLoader';
import {
    Globe, LogIn, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight,
    AlertCircle, CheckCircle, X
} from 'lucide-react';

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
    const [showPassword, setShowPassword] = useState(false);
    const [focusField, setFocusField] = useState('');
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const [sbAuth, backendAuth] = await Promise.allSettled([
                supabase.auth.signInWithPassword({ email, password }),
                api.login({ email, password, rememberMe })
            ]);

            const sbError = sbAuth.status === 'fulfilled' ? sbAuth.value.error : sbAuth.reason;
            if (sbError && sbError.message !== 'Invalid login credentials') throw sbError;
            if (backendAuth.status === 'rejected') throw backendAuth.reason;

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
            padding: '20px', position: 'relative', overflow: 'hidden',
        }}>
            {/* Animated background orbs */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    top: '-150px', right: '-100px', animation: 'float1 8s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', width: '350px', height: '350px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
                    bottom: '-80px', left: '-80px', animation: 'float2 10s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
                    top: '50%', left: '30%', animation: 'float3 12s ease-in-out infinite',
                }} />
            </div>

            <div style={{
                width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1,
                borderRadius: '28px', background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.3), 0 0 60px rgba(99,102,241,0.15)',
                overflow: 'hidden',
            }}>
                {/* Top accent bar */}
                <div style={{
                    height: '4px',
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)',
                }} />

                <div style={{ padding: '40px 40px 44px' }}>
                    {loading ? (
                        <div style={{ padding: '60px 0' }}>
                            <RunningAthleteLoader />
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '18px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                                }}>
                                    <Globe size={28} color="white" />
                                </div>
                                <h1 style={{
                                    fontSize: '26px', fontWeight: 800, color: '#0f172a',
                                    letterSpacing: '-0.5px', margin: '0 0 4px',
                                }}>
                                    Welcome Back
                                </h1>
                                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                                    Sign in to Game Sphere
                                </p>
                            </div>

                            {/* Alerts */}
                            {error && (
                                <div style={{
                                    padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
                                    background: '#fef2f2', color: '#dc2626', fontSize: '14px', fontWeight: 500,
                                    border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px',
                                }}>
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}
                            {message && (
                                <div style={{
                                    padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
                                    background: '#f0fdf4', color: '#16a34a', fontSize: '14px', fontWeight: 500,
                                    border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px',
                                }}>
                                    <CheckCircle size={16} /> {message}
                                </div>
                            )}

                            {requires2FA ? (
                                <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151',
                                        }}>
                                            <ShieldCheck size={14} color="#6366f1" />
                                            6-Digit Authenticator Code
                                        </label>
                                        <input type="text" value={twoFactorToken} onChange={(e) => setTwoFactorToken(e.target.value)}
                                            placeholder="123456" maxLength={6} required
                                            style={{
                                                width: '100%', padding: '14px 16px', borderRadius: '12px',
                                                border: '2px solid #e2e8f0', background: '#f8fafc',
                                                textAlign: 'center', letterSpacing: '6px', fontSize: '22px',
                                                fontWeight: 800, color: '#0f172a', outline: 'none',
                                                transition: 'all 0.25s', boxSizing: 'border-box',
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                    <button type="submit" style={{
                                        width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white',
                                        fontWeight: 700, fontSize: '15px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                                    }}>
                                        <CheckCircle size={16} /> Verify Code
                                    </button>
                                    <button type="button" onClick={() => { setRequires2FA(false); setTempUserId(''); setTwoFactorToken(''); }}
                                        style={{
                                            background: 'none', border: 'none', color: '#6366f1', fontSize: '14px',
                                            cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '6px',
                                        }}>
                                        <X size={14} /> Cancel
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    {/* Email */}
                                    <div>
                                        <label style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151',
                                        }}>
                                            <Mail size={14} color="#6366f1" /> Email
                                        </label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com" required
                                            style={{
                                                width: '100%', padding: '14px 16px', borderRadius: '12px',
                                                border: `2px solid ${focusField === 'email' ? '#6366f1' : '#e2e8f0'}`,
                                                background: '#fafafa', fontSize: '15px', fontWeight: 500,
                                                color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                                                boxShadow: focusField === 'email' ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none',
                                                transition: 'all 0.25s',
                                            }}
                                            onFocus={() => setFocusField('email')} onBlur={() => setFocusField('')}
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontSize: '13px', fontWeight: 600, color: '#374151',
                                            }}>
                                                <Lock size={14} color="#6366f1" /> Password
                                            </label>
                                            <Link href="/forgot-password" style={{
                                                fontSize: '13px', fontWeight: 600, color: '#6366f1', textDecoration: 'none',
                                            }}>
                                                Forgot Password?
                                            </Link>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••" required
                                                style={{
                                                    width: '100%', padding: '14px 48px 14px 16px', borderRadius: '12px',
                                                    border: `2px solid ${focusField === 'password' ? '#6366f1' : '#e2e8f0'}`,
                                                    background: '#fafafa', fontSize: '15px', fontWeight: 500,
                                                    color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                                                    boxShadow: focusField === 'password' ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none',
                                                    transition: 'all 0.25s',
                                                }}
                                                onFocus={() => setFocusField('password')} onBlur={() => setFocusField('')}
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                                color: '#94a3b8', display: 'flex',
                                            }}>
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember me */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                                            style={{ cursor: 'pointer', accentColor: '#6366f1', width: '16px', height: '16px' }} />
                                        <label htmlFor="rememberMe" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
                                            Remember me
                                        </label>
                                    </div>

                                    <button type="submit" style={{
                                        width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white',
                                        fontWeight: 700, fontSize: '15px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                                        transition: 'all 0.25s',
                                    }}>
                                        <LogIn size={16} /> Sign In
                                    </button>
                                </form>
                            )}

                            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
                                Don&apos;t have an account?{' '}
                                <Link href="/register" style={{
                                    color: '#6366f1', fontWeight: 600, textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                }}>
                                    Register <ArrowRight size={14} />
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes float1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-30px, 20px) scale(1.1); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(20px, -30px) scale(1.05); }
                }
                @keyframes float3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-15px, -20px) scale(1.08); }
                }
            `}</style>
        </div>
    );
}

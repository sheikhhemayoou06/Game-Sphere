'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { KeyRound, CheckCircle, Mail, ArrowLeft, Send, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await api.forgotPassword({ email });
            setMessage(res.message || 'If an account exists, a reset link was sent.');
        } catch (err: any) {
            setError(err.message || 'Failed to process request');
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
                    position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                    top: '-100px', right: '-80px', animation: 'float1 8s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                    bottom: '-50px', left: '-50px', animation: 'float2 10s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
                    top: '40%', left: '20%', animation: 'float3 12s ease-in-out infinite',
                }} />
            </div>

            <div style={{
                width: '100%', maxWidth: '440px', padding: '48px 40px',
                borderRadius: '24px',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                position: 'relative', zIndex: 1,
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                    }}>
                        <KeyRound size={32} color="white" strokeWidth={2} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                        Forgot Password
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px', lineHeight: 1.5 }}>
                        Enter your email to receive a secure reset link.
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
                        background: '#fef2f2', color: '#dc2626', fontSize: '14px',
                        border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
                        {error}
                    </div>
                )}
                {message && (
                    <div style={{
                        padding: '16px', borderRadius: '12px', marginBottom: '20px',
                        background: '#f0fdf4', color: '#16a34a', fontSize: '14px',
                        border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                        <CheckCircle size={20} color="#16a34a" />
                        {message}
                    </div>
                )}

                {!message && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151',
                            }}>
                                <Mail size={14} color="#6366f1" />
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                                    placeholder="you@example.com" required
                                    style={{
                                        width: '100%', padding: '14px 16px', borderRadius: '12px',
                                        border: `2px solid ${focused ? '#6366f1' : '#e2e8f0'}`,
                                        background: '#f8fafc', fontSize: '15px', fontWeight: 500,
                                        color: '#1e1b4b', outline: 'none',
                                        boxShadow: focused ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none',
                                        transition: 'all 0.25s ease', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                            background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            color: 'white', fontWeight: 700, fontSize: '15px', cursor: loading ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
                            transition: 'all 0.25s ease',
                        }}>
                            {loading ? (
                                <>
                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                    Sending…
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Send Reset Link
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '28px' }}>
                    <Link href="/login" style={{
                        color: '#6366f1', fontSize: '14px', textDecoration: 'none', fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        transition: 'opacity 0.2s',
                    }}>
                        <ArrowLeft size={15} />
                        Back to Login
                    </Link>
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
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

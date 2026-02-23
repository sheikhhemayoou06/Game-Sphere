'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.login({ email, password });
            setAuth(res.user, res.accessToken);
            router.push('/dashboard');
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="you@example.com"
                            required
                            style={{ color: '#1e1b4b' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                            style={{ color: '#1e1b4b' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{
                        width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px',
                        opacity: loading ? 0.7 : 1,
                    }}>
                        {loading ? '⏳ Signing in...' : '🔐 Sign In'}
                    </button>
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

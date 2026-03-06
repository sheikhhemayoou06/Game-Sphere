'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            padding: '20px',
        }}>
            <div style={{
                width: '100%', maxWidth: '440px', padding: '48px 40px',
                borderRadius: '24px', background: 'white',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <span style={{ fontSize: '40px' }}>🔑</span>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '12px', color: '#1e1b4b' }}>
                        Forgot Password
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>
                        Enter your email to receive a secure reset link.
                    </p>
                </div>

                {error && (
                    <div style={{ padding: '12px', borderRadius: '10px', marginBottom: '20px', background: '#fef2f2', color: '#dc2626', fontSize: '14px', border: '1px solid #fecaca' }}>
                        {error}
                    </div>
                )}
                {message && (
                    <div style={{ padding: '12px', borderRadius: '10px', marginBottom: '20px', background: '#f0fdf4', color: '#16a34a', fontSize: '14px', border: '1px solid #bbf7d0' }}>
                        ✅ {message}
                    </div>
                )}

                {!message && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="input-field" placeholder="you@example.com" required style={{ color: '#1e1b4b' }} />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{
                            width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px', opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Link href="/login" style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

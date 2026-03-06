'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError('Missing password reset token. Please request a new link.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            const res = await api.resetPassword({ token, newPassword: password });
            setMessage(res.message || 'Password successfully reset.');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            width: '100%', maxWidth: '440px', padding: '48px 40px',
            borderRadius: '24px', background: 'white',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span style={{ fontSize: '40px' }}>🔐</span>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '12px', color: '#1e1b4b' }}>
                    Set New Password
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>
                    Enter a new strong password for your account.
                </p>
            </div>

            {error && (
                <div style={{ padding: '12px', borderRadius: '10px', marginBottom: '20px', background: '#fef2f2', color: '#dc2626', fontSize: '14px', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}
            {message && (
                <div style={{ padding: '12px', borderRadius: '10px', marginBottom: '20px', background: '#f0fdf4', color: '#16a34a', fontSize: '14px', border: '1px solid #bbf7d0' }}>
                    ✅ {message} <br /> Redirecting to login...
                </div>
            )}

            {!message && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>New Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="input-field" placeholder="••••••••" required style={{ color: '#1e1b4b' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field" placeholder="••••••••" required style={{ color: '#1e1b4b' }} />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{
                        width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px', opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Saving...' : 'Reset Password'}
                    </button>
                </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Link href="/login" style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
                    Cancel
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: '20px',
        }}>
            <Suspense fallback={<div style={{ color: 'white' }}>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}

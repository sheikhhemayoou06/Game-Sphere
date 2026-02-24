'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { roleLabels } from '@/lib/utils';

const roles = ['PLAYER', 'TEAM_MANAGER', 'ORGANIZER', 'OFFICIAL'];

export default function RegisterPage() {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '', role: 'PLAYER'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Force wipe any leftover local storage from previous test accounts
            localStorage.removeItem('selectedSportId');
            localStorage.removeItem('mySportIds');
            localStorage.removeItem('activeTournament');

            const res = await api.register(form);
            setAuth(res.user, res.accessToken);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const update = (field: string, value: string) => setForm({ ...form, [field]: value });

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: '20px',
        }}>
            <div style={{
                width: '100%', maxWidth: '480px', padding: '44px 40px',
                borderRadius: '24px', background: 'white',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <img src="/logo.png" alt="Game Sphere Logo" style={{ width: "100px", height: "auto", objectFit: "contain" }} />
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '12px', color: "inherit", letterSpacing: '-0.5px' }}>
                        Join Game Sphere
                    </h1>
                    <p style={{ color: "inherit", fontSize: '14px', marginTop: '6px' }}>
                        Create your Universal Sports Identity
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
                        background: '#fef2f2', color: "inherit", fontSize: '14px', fontWeight: 500,
                        border: '1px solid #fecaca',
                    }}>
                        {error}
                    </div>
                )}

                {/* Fan Notice */}
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>📱</span>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: "inherit" }}>Just here to follow the action?</div>
                        <div style={{ fontSize: '12px', color: "inherit", marginTop: '2px' }}>
                            Fans don't need to register. <Link href="/login" style={{ color: "inherit", fontWeight: 600, textDecoration: 'none' }}>Use Phone Login →</Link>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: "inherit" }}>
                                First Name
                            </label>
                            <input type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="input-field" placeholder="John" required style={{ color: "inherit" }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: "inherit" }}>
                                Last Name
                            </label>
                            <input type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="input-field" placeholder="Doe" required style={{ color: "inherit" }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: "inherit" }}>Email</label>
                        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field" placeholder="you@example.com" required style={{ color: "inherit" }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: "inherit" }}>Password</label>
                        <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="input-field" placeholder="Min 6 characters" required style={{ color: "inherit" }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: "inherit" }}>Role</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {roles.map((r) => (
                                <button type="button" key={r} onClick={() => update('role', r)} style={{
                                    padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                                    border: `2px solid ${form.role === r ? '#6366f1' : '#e2e8f0'}`,
                                    background: form.role === r ? '#eef2ff' : 'white',
                                    color: form.role === r ? '#4338ca' : '#64748b',
                                    cursor: 'pointer', transition: 'all 0.2s ease',
                                }}>
                                    {roleLabels[r] || r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{
                        width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px',
                        opacity: loading ? 0.7 : 1,
                    }}>
                        {loading ? '⏳ Creating account...' : '🚀 Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: "inherit" }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: "inherit", fontWeight: 600, textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

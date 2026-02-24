'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { roleLabels } from '@/lib/utils';

export default function SettingsPage() {
    const { user, isAuthenticated, loadFromStorage, logout } = useAuthStore();
    const [loaded, setLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [saved, setSaved] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const router = useRouter();

    useEffect(() => { loadFromStorage(); setLoaded(true); }, [loadFromStorage]);
    useEffect(() => {
        if (loaded && !isAuthenticated) { router.push('/login'); return; }
        if (user) setForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: '' });
    }, [loaded, isAuthenticated, user, router]);

    if (!loaded || !isAuthenticated) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏳ Loading...</div>
    );

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    const tabs = [
        { id: 'profile' as const, label: '👤 Profile', desc: 'Manage your personal info' },
        { id: 'security' as const, label: '🔒 Security', desc: 'Password & authentication' },
        { id: 'preferences' as const, label: '⚙️ Preferences', desc: 'App settings & notifications' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: "inherit", textDecoration: 'none' }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto", objectFit: "contain" }} /> <span className="gradient-text">Game Sphere</span></div></Link>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link href="/dashboard" style={{ color: "inherit", fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
                    <button onClick={() => { logout(); router.push('/'); }} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>Logout</button>
                </div>
            </nav>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 900, color: "inherit", marginBottom: '8px' }}>⚙️ Settings</h1>
                <p style={{ color: "inherit", fontSize: '15px', marginBottom: '32px' }}>Manage your account, security, and preferences</p>

                {/* User card */}
                <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4338ca)', borderRadius: '20px', padding: '28px', color: '#fff', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 800 }}>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                        <div style={{ fontSize: '22px', fontWeight: 800 }}>{user?.firstName} {user?.lastName}</div>
                        <div style={{ fontSize: '14px', opacity: 0.8 }}>{user?.email}</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.15)', fontWeight: 600 }}>{roleLabels[user?.role || ''] || user?.role}</span>
                            {user?.player?.sportsId && <span style={{ marginLeft: '10px', opacity: 0.7 }}>USI: {user.player.sportsId}</span>}
                        </div>
                    </div>
                </div>

                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px' }}>
                    {/* Sidebar tabs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {tabs.map((t) => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                                padding: '14px 16px', borderRadius: '12px', border: 'none', textAlign: 'left', cursor: 'pointer',
                                background: activeTab === t.id ? '#4338ca' : '#fff', color: activeTab === t.id ? '#fff' : '#1e1b4b',
                                fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                            }}>
                                <div>{t.label}</div>
                                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{t.desc}</div>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                        {activeTab === 'profile' && (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: "inherit", marginBottom: '20px' }}>Personal Information</h2>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {[
                                        { label: 'First Name', key: 'firstName' as const },
                                        { label: 'Last Name', key: 'lastName' as const },
                                        { label: 'Email Address', key: 'email' as const },
                                        { label: 'Phone Number', key: 'phone' as const },
                                    ].map((field) => (
                                        <div key={field.key}>
                                            <label style={{ fontSize: '13px', fontWeight: 600, color: "inherit", display: 'block', marginBottom: '6px' }}>{field.label}</label>
                                            <input value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleSave} style={{
                                    marginTop: '20px', padding: '12px 28px', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer',
                                    background: saved ? '#22c55e' : '#4338ca', color: '#fff', fontSize: '14px', transition: 'background 0.3s',
                                }}>
                                    {saved ? '✓ Saved!' : 'Save Changes'}
                                </button>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: "inherit", marginBottom: '20px' }}>Security Settings</h2>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                                        <div key={label}>
                                            <label style={{ fontSize: '13px', fontWeight: 600, color: "inherit", display: 'block', marginBottom: '6px' }}>{label}</label>
                                            <input type="password" placeholder="••••••••"
                                                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleSave} style={{ marginTop: '20px', padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#4338ca', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                                    Update Password
                                </button>
                                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: "inherit", marginBottom: '12px' }}>Two-Factor Authentication</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: '#f8fafc' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>Enable 2FA</div>
                                            <div style={{ fontSize: '12px', color: "inherit" }}>Add an extra layer of security to your account</div>
                                        </div>
                                        <div style={{ width: '48px', height: '26px', borderRadius: '13px', background: '#e2e8f0', cursor: 'pointer', position: 'relative' }}>
                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: "inherit", marginBottom: '20px' }}>Preferences</h2>
                                {[
                                    { label: 'Dark Mode', desc: 'Switch to dark theme', value: darkMode, toggle: () => setDarkMode(!darkMode) },
                                    { label: 'Email Notifications', desc: 'Receive email updates for matches and tournaments', value: emailNotifs, toggle: () => setEmailNotifs(!emailNotifs) },
                                    { label: 'Push Notifications', desc: 'Get real-time alerts on your device', value: pushNotifs, toggle: () => setPushNotifs(!pushNotifs) },
                                ].map((pref) => (
                                    <div key={pref.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: '#f8fafc', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{pref.label}</div>
                                            <div style={{ fontSize: '12px', color: "inherit" }}>{pref.desc}</div>
                                        </div>
                                        <div onClick={pref.toggle} style={{
                                            width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
                                            background: pref.value ? '#4338ca' : '#e2e8f0',
                                        }}>
                                            <div style={{
                                                width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', transition: 'left 0.3s',
                                                left: pref.value ? '24px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                            }} />
                                        </div>
                                    </div>
                                ))}
                                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: "inherit", marginBottom: '12px' }}>Language</h3>
                                    <select style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', fontWeight: 600, width: '200px' }}>
                                        <option>English</option>
                                        <option>हिन्दी (Hindi)</option>
                                        <option>தமிழ் (Tamil)</option>
                                        <option>తెలుగు (Telugu)</option>
                                        <option>ಕನ್ನಡ (Kannada)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { roleLabels } from '@/lib/utils';
import RunningAthleteLoader from '@/components/RunningAthleteLoader';

export default function SettingsPage() {
    const { user, isAuthenticated, loadFromStorage, logout } = useAuthStore();
    const router = useRouter();
    const [loaded, setLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'sports' | 'security' | 'preferences'>('profile');
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        district: '', state: '', country: 'India',
        heightCm: '', weight: '', gender: ''
    });
    const [userSports, setUserSports] = useState<any[]>([]);
    const [userTeams, setUserTeams] = useState<any[]>([]);
    const [saved, setSaved] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [pauseNotifs, setPauseNotifs] = useState(false);
    const [sleepMode, setSleepMode] = useState(false);
    const [themePreference, setThemePreference] = useState<'system' | 'light' | 'dark'>('system');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);

    useEffect(() => { loadFromStorage(); setLoaded(true); }, [loadFromStorage]);

    useEffect(() => {
        if (loaded && !isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, loaded, router]);

    useEffect(() => {
        if (loaded && isAuthenticated && user) {
            setForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                district: user.player?.district || '',
                state: user.player?.state || '',
                country: user.player?.country || 'India',
                heightCm: user.player?.heightCm?.toString() || '',
                weight: user.player?.weight || '',
                gender: user.player?.gender || ''
            });

            if (user.player) {
                // Map player's registered sports
                const s = user.player.playerSports || [];
                setUserSports(s.map((ps: any) => ({
                    id: ps.sportId,
                    name: ps.sport?.name || 'Unknown',
                    code: ps.sportCode,
                    meta: ps.metadata ? (typeof ps.metadata === 'string' ? JSON.parse(ps.metadata) : ps.metadata) : {}
                })));

                // Fetch teams this player belongs to
                api.getMyTeams().then((teams: any[]) => {
                    setUserTeams(teams || []);
                }).catch(() => { });
            }
        }
    }, [loaded, isAuthenticated, user]);

    if (!loaded || !isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <RunningAthleteLoader />
            </div>
        );
    }

    const handleSave = async () => {
        try {
            const updatedUser = await api.updateProfile(form);
            const token = localStorage.getItem('token');
            if (updatedUser && token) {
                useAuthStore.getState().setAuth(updatedUser, token);
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save profile settings', error);
            alert('Failed to save profile. Please try again.');
        }
    };

    const handleDeleteSport = async (sportId: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this sport profile?")) return;
        try {
            await api.removePlayerSport(sportId);
            setUserSports(prev => prev.filter(s => s.id !== sportId));
            alert("Sport profile deleted successfully.");
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to delete sport.");
        }
    };

    const handleExitTeam = async (teamId: string) => {
        if (!user || (!user.id && !user.player?.id)) return;
        if (!window.confirm("Are you sure you want to exit this team?")) return;
        try {
            await api.leaveTeam(teamId, user.id);
            setUserTeams(prev => prev.filter(t => t.id !== teamId));
            alert("You have exited the team.");
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to exit team.");
        }
    };

    const tabs = [
        { id: 'profile' as const, label: '👤 Profile', desc: 'Manage your personal info' },
        { id: 'sports' as const, label: '🏅 Sports & Teams', desc: 'Manage sports & roster spots' },
        { id: 'security' as const, label: '🔒 Security', desc: 'Password & authentication' },
        { id: 'preferences' as const, label: '⚙️ Preferences', desc: 'App settings & notifications' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <Link href="/home" style={{ fontSize: '20px', fontWeight: 800, color: '#4338ca', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link href="/dashboard" style={{ color: '#4338ca', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
                    <button onClick={() => { logout(); router.push('/'); }} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>Logout</button>
                </div>
            </nav>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1e1b4b', marginBottom: '8px' }}>⚙️ Settings</h1>
                <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px' }}>Manage your account, security, and preferences</p>

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
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px' }}>Personal Information</h2>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {[
                                        { label: 'First Name', key: 'firstName' as const, type: 'text' },
                                        { label: 'Last Name', key: 'lastName' as const, type: 'text' },
                                        { label: 'Email Address', key: 'email' as const, type: 'email' },
                                        { label: 'Phone Number', key: 'phone' as const, type: 'tel' },
                                        { label: 'District', key: 'district' as const, type: 'text' },
                                        { label: 'State', key: 'state' as const, type: 'text' },
                                        { label: 'Country', key: 'country' as const, type: 'text' },
                                        { label: 'Height (cm)', key: 'heightCm' as const, type: 'number' },
                                        { label: 'Weight', key: 'weight' as const, type: 'text' },
                                        { label: 'Gender', key: 'gender' as const, type: 'select', options: ['Male', 'Female', 'Not Specified'] },
                                    ].map((field) => (
                                        <div key={field.key}>
                                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>{field.label}</label>
                                            {field.type === 'select' ? (
                                                <select
                                                    value={form[field.key]}
                                                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', background: '#fff' }}
                                                >
                                                    <option value="">Select</option>
                                                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    value={form[field.key]}
                                                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                                                />
                                            )}
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

                        {activeTab === 'sports' && (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px' }}>Registered Sports</h2>
                                {userSports.length === 0 ? (
                                    <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', marginBottom: '32px' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏏</div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Not registered for any sports yet.</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                                        {userSports.map((sport, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <div>
                                                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b' }}>{sport.name} <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#e0e7ff', color: '#4338ca', fontSize: '11px', marginLeft: '8px' }}>{sport.code || 'Pending'}</span></div>
                                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Role: {sport.meta?.role || 'Player'} {sport.meta?.jerseyNo ? `• #${sport.meta.jerseyNo}` : ''}</div>
                                                </div>
                                                <button onClick={() => handleDeleteSport(sport.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#fef2f2', color: '#ef4444', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(239, 68, 68, 0.1)' }}>
                                                    Delete Profile
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>My Teams</h2>
                                {userTeams.length === 0 ? (
                                    <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>You haven't joined any teams.</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {userTeams.map((team, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                        {team.logo && team.logo.startsWith('http') ? <img src={team.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : '⚡'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b' }}>{team.name}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{team.sport?.name || 'Sport'} • {team.city || 'Location'}</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleExitTeam(team.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#fff', borderBlock: '1px solid #e2e8f0', color: '#ef4444', fontWeight: 700, fontSize: '12px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                    Exit Team
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px' }}>Security Settings</h2>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                                        <div key={label}>
                                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>{label}</label>
                                            <input type="password" placeholder="••••••••"
                                                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleSave} style={{ marginTop: '20px', padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#4338ca', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                                    Update Password
                                </button>
                                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>Two-Factor Authentication</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: '#f8fafc' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>Enable 2FA</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Add an extra layer of security to your account</div>
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
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px' }}>Preferences</h2>
                                {[
                                    { label: 'Dark Mode', desc: 'Switch to dark theme', value: darkMode, toggle: () => setDarkMode(!darkMode) },
                                    { label: 'Email Notifications', desc: 'Receive email updates for matches and tournaments', value: emailNotifs, toggle: () => setEmailNotifs(!emailNotifs) },
                                    { label: 'Push Notifications', desc: 'Get real-time alerts on your device', value: pushNotifs, toggle: () => setPushNotifs(!pushNotifs) },
                                    { label: 'Pause Notifications (1 Hour)', desc: 'Temporarily mute all incoming app alerts', value: pauseNotifs, toggle: () => setPauseNotifs(!pauseNotifs) },
                                    { label: 'Sleep Mode (10PM - 8AM)', desc: 'Automatically silence notifications overnight', value: sleepMode, toggle: () => setSleepMode(!sleepMode) },
                                ].map((pref) => (
                                    <div key={pref.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: '#f8fafc', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{pref.label}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{pref.desc}</div>
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
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>Language</h3>
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

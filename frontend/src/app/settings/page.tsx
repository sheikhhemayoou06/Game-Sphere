'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { roleLabels } from '@/lib/utils';
import RunningAthleteLoader from '@/components/RunningAthleteLoader';
import PageNavbar from '@/components/PageNavbar';

import { User as UserIcon, Lock, Bell, Smartphone, Accessibility, Globe, Trash2, Settings, ArrowRight } from 'lucide-react';

export default function SettingsPage() {
    const { user, isAuthenticated, loadFromStorage, logout } = useAuthStore();
    const router = useRouter();
    const [loaded, setLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'device' | 'accessibility' | 'language' | 'delete'>('profile');
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        district: '', state: '', country: 'India',
        heightCm: '', weight: '', gender: ''
    });
    const [saved, setSaved] = useState(false);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [pauseNotifs, setPauseNotifs] = useState(false);
    const [sleepMode, setSleepMode] = useState(false);
    
    const [highContrast, setHighContrast] = useState(false);
    const [textSizing, setTextSizing] = useState('normal');
    const [language, setLanguage] = useState('English');

    const [cameraPerm, setCameraPerm] = useState(false);
    const [locationPerm, setLocationPerm] = useState(false);
    const [micPerm, setMicPerm] = useState(false);

    // Load preferences from local storage on mount
    useEffect(() => {
        const prefs = JSON.parse(localStorage.getItem('gameSpherePreferences') || '{}');
        if (prefs.emailNotifs !== undefined) setEmailNotifs(prefs.emailNotifs);
        if (prefs.pushNotifs !== undefined) setPushNotifs(prefs.pushNotifs);
        if (prefs.pauseNotifs !== undefined) setPauseNotifs(prefs.pauseNotifs);
        if (prefs.sleepMode !== undefined) setSleepMode(prefs.sleepMode);
        if (prefs.highContrast !== undefined) setHighContrast(prefs.highContrast);
        if (prefs.textSizing !== undefined) setTextSizing(prefs.textSizing);
        if (prefs.language !== undefined) setLanguage(prefs.language);
        if (prefs.cameraPerm !== undefined) setCameraPerm(prefs.cameraPerm);
        if (prefs.locationPerm !== undefined) setLocationPerm(prefs.locationPerm);
        if (prefs.micPerm !== undefined) setMicPerm(prefs.micPerm);
    }, []);

    // Save preferences to local storage on change
    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem('gameSpherePreferences', JSON.stringify({
            emailNotifs, pushNotifs, pauseNotifs, sleepMode, highContrast, textSizing, language, cameraPerm, locationPerm, micPerm
        }));
        
        // Apply accessibility settings
        if (typeof window !== 'undefined') {
            const scale = textSizing === 'large' ? '1.1' : textSizing === 'small' ? '0.9' : '1';
            // Use zoom for a quick robust scaling effect across the app if using px
            (document.body.style as any).zoom = scale;
            
            if (highContrast) {
                document.documentElement.style.filter = 'contrast(1.2) saturate(1.2)';
            } else {
                document.documentElement.style.filter = 'none';
            }
        }
    }, [emailNotifs, pushNotifs, pauseNotifs, sleepMode, highContrast, textSizing, language, cameraPerm, locationPerm, micPerm, loaded]);

    // 2FA State
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [twoFactorError, setTwoFactorError] = useState('');
    const [settingUp2FA, setSettingUp2FA] = useState(false);

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
        }
    }, [loaded, isAuthenticated, user]);

    if (!loaded || !isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <PageNavbar title="Settings" emoji="⚙️" />
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

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return alert('Please fill in all password fields.');
        }
        if (newPassword !== confirmPassword) {
            return alert('New passwords do not match.');
        }
        setIsUpdatingPassword(true);
        try {
            await api.updatePassword({ currentPassword, newPassword });
            
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
                await supabase.auth.updateUser({ password: newPassword });
            }

            alert('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            alert(err.message || 'Failed to update password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
            setIsDeleting(true);
            try {
                await api.deleteAccount();
                alert('Your account has been deleted.');
                logout();
                router.push('/');
            } catch (err: any) {
                alert(err.message || 'Failed to delete account');
                setIsDeleting(false);
            }
        }
    };

    const handleGenerate2FA = async () => {
        if (user?.isTwoFactorEnabled) {
            alert('2FA is already enabled on your account. To disable it, contact support.');
            return;
        }
        setSettingUp2FA(true);
        try {
            const res = await api.generateTwoFactorAuth();
            setQrCode(res.qrCode);
            setTwoFactorSecret(res.secret);
            setShow2FAModal(true);
            setTwoFactorError('');
            setTwoFactorCode('');
        } catch (err: any) {
            alert(err.message || 'Failed to initialize 2FA setup');
        } finally {
            setSettingUp2FA(false);
        }
    };

    const handleVerify2FA = async () => {
        setTwoFactorError('');
        try {
            await api.turnOnTwoFactorAuth({ token: twoFactorCode });
            setShow2FAModal(false);
            const token = localStorage.getItem('token');
            const updatedProfile = await api.getProfile();
            if (token) {
                useAuthStore.getState().setAuth(updatedProfile, token);
            }
            alert('✅ 2FA Enabled Successfully!');
        } catch (err: any) {
            setTwoFactorError(err.message || 'Invalid code');
        }
    };

    const tabs = [
        { id: 'profile' as const, label: 'My Profile', icon: UserIcon, desc: 'Manage your personal info' },
        { id: 'security' as const, label: 'Security and Password', icon: Lock, desc: 'Password & authentication' },
        { id: 'notifications' as const, label: 'Notification', icon: Bell, desc: 'Email & push alerts' },
        { id: 'device' as const, label: 'Device Permission', icon: Smartphone, desc: 'Camera, location, etc.' },
        { id: 'accessibility' as const, label: 'Accessibility', icon: Accessibility, desc: 'Display & sizing text' },
        { id: 'language' as const, label: 'Language', icon: Globe, desc: 'App language settings' },
        { id: 'delete' as const, label: 'Delete Account', icon: Trash2, desc: 'Permanently remove account' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1e1b4b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Settings size={32} /> Settings
                </h1>
                <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px' }}>Manage your account, security, and preferences</p>

                {/* User card */}
                <Link href="/profile" target="_blank" style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4338ca)', borderRadius: '20px', padding: '28px', color: '#fff', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'pointer' }}
                         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
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
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8, fontSize: '14px', fontWeight: 600 }}>
                            View Profile <ArrowRight size={16} />
                        </div>
                    </div>
                </Link>

                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px' }}>
                    {/* Sidebar tabs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {tabs.map((t) => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                                padding: '14px 16px', borderRadius: '12px', border: 'none', textAlign: 'left', cursor: 'pointer',
                                background: activeTab === t.id ? '#4338ca' : '#fff', color: activeTab === t.id ? '#fff' : '#1e1b4b',
                                fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <t.icon size={16} />
                                    <span>{t.label}</span>
                                </div>
                                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px', paddingLeft: '24px' }}>{t.desc}</div>
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

                        {activeTab === 'security' && (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px' }}>Security and Password</h2>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Current Password</label>
                                        <input type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>New Password</label>
                                        <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
                                        <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <button onClick={handleUpdatePassword} disabled={isUpdatingPassword} style={{ marginTop: '20px', padding: '12px 28px', borderRadius: '10px', border: 'none', background: isUpdatingPassword ? '#9ca3af' : '#4338ca', color: '#fff', fontWeight: 700, cursor: isUpdatingPassword ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>Two-Factor Authentication</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: '#f8fafc' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>Enable 2FA</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Add an extra layer of security to your account.</div>
                                            {user?.isTwoFactorEnabled && (
                                                <div style={{ marginTop: '4px', display: 'inline-block', fontSize: '11px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                                                    ACTIVE
                                                </div>
                                            )}
                                        </div>
                                        <div onClick={handleGenerate2FA} style={{ width: '48px', height: '26px', borderRadius: '13px', background: user?.isTwoFactorEnabled ? '#4338ca' : '#e2e8f0', cursor: user?.isTwoFactorEnabled || settingUp2FA ? 'not-allowed' : 'pointer', position: 'relative', opacity: settingUp2FA ? 0.6 : 1, transition: '0.3s' }}>
                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: user?.isTwoFactorEnabled ? '24px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: '0.3s' }} />
                                        </div>
                                    </div>

                                    {show2FAModal && (
                                        <div style={{ marginTop: '16px', padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>Scan QR Code</h4>
                                                <button onClick={() => setShow2FAModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
                                                Use Google Authenticator or a similar app to scan the QR code below. Or enter the secret manually: <strong>{twoFactorSecret}</strong>
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                                <img src={qrCode} alt="2FA QR Code" style={{ width: '180px', height: '180px', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '8px' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Enter the 6-digit code</label>
                                                <input type="text" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} placeholder="000000" maxLength={6}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '18px', letterSpacing: '8px', textAlign: 'center', boxSizing: 'border-box' }} />
                                            </div>
                                            {twoFactorError && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', fontWeight: 500 }}>{twoFactorError}</div>}
                                            <button onClick={handleVerify2FA} style={{ width: '100%', marginTop: '16px', padding: '14px', borderRadius: '10px', background: '#4338ca', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>
                                                Verify & Enable
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px' }}>Notification</h2>
                                {[
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
                            </div>
                        )}

                        {activeTab === 'device' && (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px' }}>Device Permission</h2>
                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                                    Manage app access to your device features. These settings sync locally and adjust browser prompts.
                                </p>
                                {[
                                    { label: 'Camera Access', desc: 'Allow app to use camera for scanning QR codes and uploading avatars', value: cameraPerm, toggle: () => setCameraPerm(!cameraPerm) },
                                    { label: 'Location Services', desc: 'Allow app to recommend nearby local tournaments', value: locationPerm, toggle: () => setLocationPerm(!locationPerm) },
                                    { label: 'Microphone', desc: 'Allow voice search and audio features', value: micPerm, toggle: () => setMicPerm(!micPerm) },
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
                            </div>
                        )}

                        {activeTab === 'accessibility' && (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px' }}>Accessibility</h2>
                                
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: '#f8fafc', marginBottom: '10px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>High Contrast Mode</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Increase contrast for better readability across the app</div>
                                    </div>
                                    <div onClick={() => setHighContrast(!highContrast)} style={{ width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', background: highContrast ? '#4338ca' : '#e2e8f0' }}>
                                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', transition: 'left 0.3s', left: highContrast ? '24px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                    </div>
                                </div>

                                <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', marginBottom: '10px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Text Sizing</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Adjust the zoom level of the app for easier reading</div>
                                    <select value={textSizing} onChange={e => setTextSizing(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', width: '100%', maxWidth: '200px' }}>
                                        <option value="small">Small (90%)</option>
                                        <option value="normal">Normal (100%)</option>
                                        <option value="large">Large (110%)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'language' && (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px' }}>Language</h2>
                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>Select your preferred language. Changing this will reload the app to apply translations.</p>
                                <select value={language} onChange={e => {
                                    setLanguage(e.target.value);
                                    setTimeout(() => window.location.reload(), 300);
                                }} style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', fontWeight: 600, width: '100%', maxWidth: '300px', cursor: 'pointer' }}>
                                    <option value="English">English</option>
                                    <option value="Hindi">हिन्दी (Hindi)</option>
                                    <option value="Tamil">தமிழ் (Tamil)</option>
                                    <option value="Telugu">తెలుగు (Telugu)</option>
                                    <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                                </select>
                            </div>
                        )}

                        {activeTab === 'delete' && (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626', marginBottom: '20px' }}>Delete Account</h2>
                                <div style={{ color: '#64748b', fontSize: '14px', background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                    <p style={{ margin: '0 0 12px 0' }}>Once you delete your account, there is no going back. Please be certain.</p>
                                    <button disabled={isDeleting} onClick={handleDeleteAccount} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: isDeleting ? '#fca5a5' : '#dc2626', color: '#fff', fontWeight: 700, cursor: isDeleting ? 'not-allowed' : 'pointer' }}>
                                        {isDeleting ? 'Deleting...' : 'Delete My Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

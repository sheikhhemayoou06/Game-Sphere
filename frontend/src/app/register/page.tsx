'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { roleLabels } from '@/lib/utils';
import { Country, State, City } from 'country-state-city';

const roles = ['PLAYER', 'TEAM_MANAGER', 'ORGANIZER', 'OFFICIAL'];

export default function RegisterWizard() {
    const [step, setStep] = useState(1);

    // Core Identity
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '', role: 'PLAYER'
    });

    // Phone
    const [phoneData, setPhoneData] = useState({ countryCode: '+91', phone: '' });

    // Location
    const [location, setLocation] = useState({ countryIso: 'IN', stateIso: '', districtName: '' });

    // Email OTP
    const [emailOtp, setEmailOtp] = useState('');

    // Demographics
    const [demographics, setDemographics] = useState({ gender: '', heightCm: '', avatar: '' });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { setAuth } = useAuthStore();

    // Cascading Dropdown Data
    const countries = Country.getAllCountries();
    const states = State.getStatesOfCountry(location.countryIso);
    const cities = City.getCitiesOfState(location.countryIso, location.stateIso);


    const handleNextStep1 = () => {
        if (!form.firstName || !form.lastName || !form.email || !form.password) {
            return setError("Please fill all core identity fields.");
        }
        if (!phoneData.phone) {
            return setError("Please enter your phone number to continue.");
        }
        setError('');
        setStep(2);
    };

    const handleNextStep2 = () => {
        if (!location.stateIso || !location.districtName) {
            return setError("Please select your State and District.");
        }
        setError('');
        setStep(3);
    };

    const handleSignupInit = async () => {
        if (form.role === 'PLAYER' && !demographics.avatar) {
            return setError("A profile photo is mandatory for players.");
        }

        setError('');
        setLoading(true);
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        first_name: form.firstName,
                        last_name: form.lastName,
                        role: form.role,
                    }
                }
            });

            if (signUpError) throw signUpError;

            // Success - transition to OTP stage
            setStep(4);
        } catch (err: any) {
            setError(err.message || 'Supabase Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        if (!emailOtp || emailOtp.length !== 6) return setError("Enter the 6-digit OTP sent to your email.");

        setError('');
        setLoading(true);
        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email: form.email,
                token: emailOtp,
                type: 'signup'
            });

            if (verifyError) throw verifyError;

            // Verified successfully, now register on our backend
            const finalPayload = {
                ...form,
                phone: `${phoneData.countryCode}${phoneData.phone}`,
                countryCode: phoneData.countryCode,
                country: Country.getCountryByCode(location.countryIso)?.name || '',
                state: State.getStateByCodeAndCountry(location.stateIso, location.countryIso)?.name || '',
                district: location.districtName,
                gender: demographics.gender,
                heightCm: demographics.heightCm ? parseInt(demographics.heightCm) : undefined,
                avatar: demographics.avatar || undefined,
            };

            const res = await api.register(finalPayload) as any;
            setAuth(res.user, res.accessToken);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const updateCore = (field: string, value: string) => setForm({ ...form, [field]: value });
    const updatePhone = (field: string, value: string) => setPhoneData({ ...phoneData, [field]: value });
    const updateLoc = (field: string, value: string) => setLocation({ ...location, [field]: value });
    const updateDemo = (field: string, value: string) => setDemographics({ ...demographics, [field]: value });

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Ideally this pushes to S3/Supabase and returns a URL. Emulating local object URL for now.
            const objUrl = URL.createObjectURL(file);
            updateDemo('avatar', objUrl);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: '20px',
        }}>
            <div style={{
                width: '100%', maxWidth: '520px', padding: '40px',
                borderRadius: '24px', background: 'white',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e1b4b' }}>
                        {step === 1 && "Start Your Journey"}
                        {step === 2 && "Where are you based?"}
                        {step === 3 && "Complete Your Profile"}
                        {step === 4 && "Verify Your Email"}
                    </h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} style={{
                                width: '32px', height: '6px', borderRadius: '4px',
                                background: step >= s ? '#6366f1' : '#e2e8f0',
                                transition: 'all 0.3s'
                            }} />
                        ))}
                    </div>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
                        background: '#fef2f2', color: '#dc2626', fontSize: '13px', fontWeight: 600,
                        border: '1px solid #fecaca',
                    }}>
                        {error}
                    </div>
                )}

                {/* ───────────────── STEP 1: IDENTITY & OTP ───────────────── */}
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="form-label">First Name</label>
                                <input type="text" value={form.firstName} onChange={(e) => updateCore('firstName', e.target.value)} className="input-field" placeholder="John" required />
                            </div>
                            <div>
                                <label className="form-label">Last Name</label>
                                <input type="text" value={form.lastName} onChange={(e) => updateCore('lastName', e.target.value)} className="input-field" placeholder="Doe" required />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Email</label>
                            <input type="email" value={form.email} onChange={(e) => updateCore('email', e.target.value)} className="input-field" placeholder="you@example.com" />
                            <small style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>Email verification link will be sent after registration.</small>
                        </div>

                        <div>
                            <label className="form-label">Password</label>
                            <input type="password" value={form.password} onChange={(e) => updateCore('password', e.target.value)} className="input-field" placeholder="Min 6 characters" />
                        </div>

                        <div>
                            <label className="form-label">Account Role</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {roles.map((r) => (
                                    <button type="button" key={r} onClick={() => updateCore('role', r)} style={{
                                        padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                                        border: `2px solid ${form.role === r ? '#6366f1' : '#e2e8f0'}`,
                                        background: form.role === r ? '#eef2ff' : 'white',
                                        color: form.role === r ? '#4338ca' : '#64748b',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }}>
                                        {roleLabels[r] || r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Phone Section */}
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label className="form-label">Phone Number</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <select
                                    value={phoneData.countryCode}
                                    onChange={(e) => updatePhone('countryCode', e.target.value)}
                                    className="input-field" style={{ width: '90px', padding: '0 8px' }}
                                >
                                    <option value="+91">+91 (IN)</option>
                                    <option value="+1">+1 (US)</option>
                                    <option value="+44">+44 (UK)</option>
                                    <option value="+61">+61 (AU)</option>
                                </select>
                                <input
                                    type="tel" value={phoneData.phone} onChange={(e) => updatePhone('phone', e.target.value)}
                                    className="input-field" placeholder="Phone Number" style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <button type="button" onClick={handleNextStep1} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px' }}>
                            Next Step →
                        </button>
                    </div>
                )}

                {/* ───────────────── STEP 2: LOCATION ───────────────── */}
                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label className="form-label">Country</label>
                            <select value={location.countryIso} onChange={(e) => {
                                updateLoc('countryIso', e.target.value);
                                setLocation((prev) => ({ ...prev, stateIso: '', districtName: '' })); // Reset State & District securely
                            }} className="input-field">
                                {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="form-label">State / Province</label>
                            <select value={location.stateIso} onChange={(e) => {
                                updateLoc('stateIso', e.target.value);
                                setLocation((prev) => ({ ...prev, districtName: '' })); // Reset District securely
                            }} className="input-field">
                                <option value="">-- Select State --</option>
                                {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="form-label">City / District</label>
                            <select value={location.districtName} onChange={(e) => updateLoc('districtName', e.target.value)} className="input-field" disabled={!location.stateIso}>
                                <option value="">-- Select District --</option>
                                {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button type="button" onClick={() => setStep(1)} style={{
                                flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', fontWeight: 600, border: 'none', cursor: 'pointer'
                            }}>
                                ← Back
                            </button>
                            <button type="button" onClick={handleNextStep2} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
                                Next Step →
                            </button>
                        </div>
                    </div>
                )}

                {/* ───────────────── STEP 3: DEMOGRAPHICS ───────────────── */}
                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label className="form-label">Gender</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => (
                                    <button type="button" key={g} onClick={() => updateDemo('gender', g)} style={{
                                        padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                                        border: `1px solid ${demographics.gender === g ? '#6366f1' : '#cbd5e1'}`,
                                        background: demographics.gender === g ? '#eef2ff' : 'white',
                                        color: demographics.gender === g ? '#4338ca' : '#475569',
                                        cursor: 'pointer'
                                    }}>
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Height (cm) <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Optional)</span></label>
                            <input type="number" value={demographics.heightCm} onChange={(e) => updateDemo('heightCm', e.target.value)} className="input-field" placeholder="175" />
                        </div>

                        <div>
                            <label className="form-label">
                                Profile Photo
                                {form.role === 'PLAYER' && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
                            </label>
                            <div style={{
                                border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px', textAlign: 'center', background: '#f8fafc',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                            }}>
                                {demographics.avatar ? (
                                    <div style={{ width: '80px', height: '80px', borderRadius: '40px', overflow: 'hidden', border: '3px solid #6366f1' }}>
                                        <img src={demographics.avatar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '32px' }}>📸</span>
                                )}
                                <div>
                                    <label style={{ display: 'inline-block', background: '#e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                                        Upload Image
                                        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                    </label>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Max 2MB. Jpeg, Png.</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button type="button" onClick={() => setStep(2)} style={{
                                flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', fontWeight: 600, border: 'none', cursor: 'pointer'
                            }}>
                                ← Back
                            </button>
                            <button type="button" onClick={handleSignupInit} className="btn-primary" disabled={loading} style={{
                                flex: 2, justifyContent: 'center', padding: '14px', opacity: loading ? 0.7 : 1
                            }}>
                                {loading ? '⏳ Sending OTP...' : '✨ Next: Verify Email'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ───────────────── STEP 4: EMAIL OTP VERIFICATION ───────────────── */}
                {step === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>✉️</div>
                        <h3 style={{ fontSize: '18px', color: '#1e293b', fontWeight: 600 }}>We sent you a code</h3>
                        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px' }}>
                            Please check <strong style={{ color: '#1e1b4b' }}>{form.email}</strong> for a 6-digit verification code from Supabase.
                        </p>

                        <div>
                            <input
                                type="text"
                                value={emailOtp}
                                onChange={(e) => setEmailOtp(e.target.value)}
                                className="input-field"
                                placeholder="Enter 6-digit OTP"
                                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                                maxLength={6}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button type="button" onClick={handleVerifyEmailOtp} className="btn-primary" disabled={loading} style={{
                                width: '100%', justifyContent: 'center', padding: '14px', opacity: loading ? 0.7 : 1
                            }}>
                                {loading ? '⏳ Verifying...' : '✅ Verify & Enter Dashboard'}
                            </button>
                        </div>
                    </div>
                )}

                <style jsx>{`
                    .form-label {
                        display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; color: #1e293b;
                    }
                    .input-field {
                        width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid #cbd5e1;
                        background: white; color: #0f172a; font-size: 14px; font-weight: 500;
                        transition: all 0.2s; outline: none;
                    }
                    .input-field:focus {
                        border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
                    }
                    .input-field:disabled {
                        background: #f1f5f9; color: #94a3b8; cursor: not-allowed;
                    }
                `}</style>
            </div>
        </div>
    );
}

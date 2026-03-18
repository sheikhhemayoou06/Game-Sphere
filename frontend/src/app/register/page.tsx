'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useSportStore } from '@/lib/store';
import { roleLabels } from '@/lib/utils';
import { Country, State, City } from 'country-state-city';
import RunningAthleteLoader from '@/components/RunningAthleteLoader';
import {
    Gamepad2, Shield, Building, Scale, User, Mail as MailIcon, Lock, Phone,
    Globe, MapPin, Building2, Ruler, Camera, Eye, EyeOff, AlertTriangle,
    ArrowRight, ArrowLeft, Check, Sparkles, MailCheck, CheckCircle, Activity
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ROLE CONFIGURATION — Themes, icons, taglines per role
   ═══════════════════════════════════════════════════════════════ */

const ROLE_ICONS: Record<string, any> = {
    PLAYER: Gamepad2, TEAM: Shield, ORGANIZER: Building, OFFICIAL: Scale,
};

const ROLE_CONFIG: Record<string, {
    tagline: string; description: string;
    gradient: string; accentFrom: string; accentTo: string; accent: string;
    bgGradient: string; glowColor: string;
}> = {
    PLAYER: {
        tagline: 'Step onto the field', description: 'Join as an athlete, showcase skills & compete',
        gradient: 'linear-gradient(135deg, #4338ca, #6366f1)', accentFrom: '#4338ca', accentTo: '#6366f1', accent: '#6366f1',
        bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #3730a3 100%)', glowColor: 'rgba(99,102,241,0.35)',
    },
    TEAM: {
        tagline: 'Build your dynasty', description: 'Register your team, manage rosters & compete',
        gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', accentFrom: '#7c3aed', accentTo: '#a855f7', accent: '#8b5cf6',
        bgGradient: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 40%, #6d28d9 100%)', glowColor: 'rgba(139,92,246,0.35)',
    },
    ORGANIZER: {
        tagline: 'Create the arena', description: 'Host tournaments, manage events & fixtures',
        gradient: 'linear-gradient(135deg, #059669, #10b981)', accentFrom: '#059669', accentTo: '#10b981', accent: '#10b981',
        bgGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #065f46 100%)', glowColor: 'rgba(16,185,129,0.35)',
    },
    OFFICIAL: {
        tagline: 'Enforce fair play', description: 'Officiate matches, score games & uphold rules',
        gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', accentFrom: '#d97706', accentTo: '#f59e0b', accent: '#f59e0b',
        bgGradient: 'linear-gradient(135deg, #451a03 0%, #78350f 40%, #92400e 100%)', glowColor: 'rgba(245,158,11,0.35)',
    },
};

const roles = ['PLAYER', 'TEAM', 'ORGANIZER', 'OFFICIAL'];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function RegisterWizard() {
    const [step, setStep] = useState(1);
    const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');

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
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Demographics
    const [demographics, setDemographics] = useState({ gender: '', heightCm: '', avatar: '' });

    // Sports (New Step)
    const [sports, setSports] = useState<any[]>([]);
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [loadingSports, setLoadingSports] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const { setAuth } = useAuthStore();

    useEffect(() => {
        const fetchSports = async () => {
            setLoadingSports(true);
            try {
                const res = await api.getSports();
                setSports(res);
            } catch (err) {
                console.error("Failed to fetch sports:", err);
            } finally {
                setLoadingSports(false);
            }
        };
        fetchSports();
    }, []);

    // Cascading Dropdown Data
    const countries = Country.getAllCountries();
    const states = State.getStatesOfCountry(location.countryIso);
    const cities = City.getCitiesOfState(location.countryIso, location.stateIso);

    const rc = ROLE_CONFIG[form.role];

    /* ─── Navigation ─── */
    const goForward = (target: number) => { setAnimDir('forward'); setStep(target); };
    const goBack = (target: number) => { setAnimDir('back'); setStep(target); };

    /* ─── Validation & Step Handlers ─── */
    const handleNextStep1 = () => {
        if (!form.firstName || !form.email || !form.password) {
            return setError("Please fill all required fields.");
        }
        if (form.role !== 'ORGANIZER' && form.role !== 'TEAM' && !form.lastName) {
            return setError("Please fill in your Last Name.");
        }
        if (!phoneData.phone) {
            return setError("Please enter your phone number.");
        }
        setError('');
        goForward(2);
    };

    const handleNextStep2 = () => {
        if (!location.stateIso || !location.districtName) {
            return setError("Please select your State and District.");
        }
        setError('');
        goForward(3);
    };

    const handleSignupInit = async () => {
        if (form.role === 'PLAYER' && !demographics.avatar) {
            return setError("A profile photo is mandatory for players.");
        }
        setError('');
        setLoading(true);
        try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        first_name: form.firstName,
                        last_name: (form.role === 'ORGANIZER' || form.role === 'TEAM') ? '' : form.lastName,
                        role: form.role,
                    }
                }
            });
            if (signUpError) throw signUpError;
            if (signUpData.session) {
                const finalPayload = {
                    ...form,
                    lastName: (form.role === 'ORGANIZER' || form.role === 'TEAM') ? '' : form.lastName,
                    phone: `${phoneData.countryCode}${phoneData.phone}`,
                    countryCode: phoneData.countryCode,
                    country: Country.getCountryByCode(location.countryIso)?.name || '',
                    state: State.getStateByCodeAndCountry(location.stateIso, location.countryIso)?.name || '',
                    district: location.districtName,
                    gender: form.role === 'PLAYER' ? demographics.gender : undefined,
                    heightCm: form.role === 'PLAYER' && demographics.heightCm ? parseInt(demographics.heightCm) : undefined,
                    avatar: demographics.avatar || undefined,
                };
                const res = await api.register(finalPayload) as any;
                
                // Add token exactly as it's returned to ensure api calls work seamlessly right away
                localStorage.setItem('token', res.accessToken); 
                localStorage.setItem('user', JSON.stringify(res.user));
                setAuth(res.user, res.accessToken);
                
                // Add Selected Sports
                if (selectedSports.length > 0) {
                     for (const sportId of selectedSports) {
                         try {
                             await api.addMySport(sportId);
                             useSportStore.getState().addMySport(sportId); // Update local state so Dashboard knows
                         } catch (err) {
                             console.error("Failed to add sport", sportId, err);
                         }
                     }
                }
                
                router.push('/dashboard');
            } else {
                goForward(totalSteps); // Proceed to OTP verification step
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        const otp = emailOtp;
        if (!otp || otp.length !== 6) return setError("Enter the 6-digit OTP sent to your email.");
        setError('');
        setLoading(true);
        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email: form.email,
                token: otp,
                type: 'signup'
            });
            if (verifyError) throw verifyError;
            const finalPayload = {
                ...form,
                lastName: (form.role === 'ORGANIZER' || form.role === 'TEAM') ? '' : form.lastName,
                phone: `${phoneData.countryCode}${phoneData.phone}`,
                countryCode: phoneData.countryCode,
                country: Country.getCountryByCode(location.countryIso)?.name || '',
                state: State.getStateByCodeAndCountry(location.stateIso, location.countryIso)?.name || '',
                district: location.districtName,
                gender: form.role === 'PLAYER' ? demographics.gender : undefined,
                heightCm: form.role === 'PLAYER' && demographics.heightCm ? parseInt(demographics.heightCm) : undefined,
                avatar: demographics.avatar || undefined,
            };
            const res = await api.register(finalPayload) as any;
            
            // Temporary token placement here as well to be certain addMySport passes through
            localStorage.setItem('token', res.accessToken); 
            localStorage.setItem('user', JSON.stringify(res.user));
            setAuth(res.user, res.accessToken);
            
            // Add Selected Sports
            if (selectedSports.length > 0) {
                 for (const sportId of selectedSports) {
                     try {
                         await api.addMySport(sportId);
                         useSportStore.getState().addMySport(sportId); // Update local state so Dashboard knows
                     } catch (err) {
                         console.error("Failed to add sport", sportId, err);
                     }
                 }
            }

            if (res.user.role === 'ORGANIZER') {
                router.push('/tournaments/create');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };
    
    // Step 3 (or 4)
    const handleNextStepSports = () => {
        if (selectedSports.length < 1 || selectedSports.length > 3) {
             return setError("Please select between 1 and 3 sports.");
        }
        setError('');
        handleSignupInit();
    };

    /* ─── Updaters ─── */
    const updateCore = (field: string, value: string) => setForm({ ...form, [field]: value });
    const updatePhone = (field: string, value: string) => setPhoneData({ ...phoneData, [field]: value });
    const updateLoc = (field: string, value: string) => setLocation({ ...location, [field]: value });
    const updateDemo = (field: string, value: string) => setDemographics({ ...demographics, [field]: value });

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objUrl = URL.createObjectURL(file);
            updateDemo('avatar', objUrl);
        }
    };

    /* ─── OTP digit handling ─── */
    const handleOtpDigit = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        const digits = emailOtp.padEnd(6, ' ').split('');
        digits[index] = value;
        const newOtp = digits.join('').replace(/ /g, '');
        setEmailOtp(newOtp);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    /* ─── Determine total steps for this role ─── */
    const skipDemographics = form.role === 'ORGANIZER' || form.role === 'OFFICIAL';
    // Base steps + Choose Sports (+1) + Email OTP (+1)
    const totalSteps = skipDemographics ? 4 : 5;
    const displayStep = step > totalSteps ? totalSteps : step;

    /* ─── Step Titles ─── */
    const stepTitles: Record<number, { title: string; subtitle: string }> = {
        1: { title: 'Create Your Account', subtitle: rc.tagline },
        2: { title: 'Your Location', subtitle: 'Where are you based?' },
        3: skipDemographics
            ? { title: 'Choose Your Sports', subtitle: 'Select up to 3 sports you are involved in' }
            : { title: 'Complete Profile', subtitle: 'Almost there — add your details' },
        4: skipDemographics 
            ? { title: 'Verify Email', subtitle: `We sent a code to ${form.email}` }
            : { title: 'Choose Your Sports', subtitle: 'Select up to 3 sports you are involved in' },
        5: { title: 'Verify Email', subtitle: `We sent a code to ${form.email}` },
    };
    const currentStep = stepTitles[step] || stepTitles[1];

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: rc.bgGradient,
            transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '20px', position: 'relative', overflow: 'hidden',
        }}>
            <style>{`
                @keyframes slideUpFade {
                    0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
            {/* ─── Animated Background Orbs ─── */}
            <div style={{
                position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
                background: `radial-gradient(circle, ${rc.glowColor} 0%, transparent 70%)`,
                top: '-200px', right: '-150px', transition: 'background 0.6s ease',
                animation: 'float 8s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                background: `radial-gradient(circle, ${rc.glowColor} 0%, transparent 70%)`,
                bottom: '-100px', left: '-100px', transition: 'background 0.6s ease',
                animation: 'float 6s ease-in-out infinite reverse',
            }} />

            {/* ─── Main Card ─── */}
            <div style={{
                width: '100%', maxWidth: '540px', position: 'relative', zIndex: 1,
            }}>
                {/* ─── Card ─── */}
                <div style={{
                    borderRadius: '28px',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 30px 80px rgba(0,0,0,0.25), 0 0 60px ${rc.glowColor}`,
                    transition: 'box-shadow 0.6s ease',
                    overflow: 'hidden',
                }}>
                    {/* ─── Top Accent Bar ─── */}
                    <div style={{
                        height: '5px', background: rc.gradient,
                        transition: 'background 0.4s ease',
                    }} />

                    <div style={{ padding: '36px 40px 40px' }}>
                        {loading ? (
                            <div style={{ padding: '60px 0' }}>
                                <RunningAthleteLoader />
                            </div>
                        ) : (
                            <>
                                {/* ─── Header ─── */}
                                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        width: '56px', height: '56px', borderRadius: '16px',
                                        background: rc.gradient,
                                        boxShadow: `0 8px 24px ${rc.glowColor}`,
                                        transition: 'all 0.4s ease',
                                        marginBottom: '16px',
                                    }}>
                                        {(() => { const RoleIcon = ROLE_ICONS[form.role]; return <RoleIcon size={26} color="white" />; })()}
                                    </div>
                                    <h1 style={{
                                        fontSize: '26px', fontWeight: 800, color: '#0f172a',
                                        letterSpacing: '-0.5px', marginBottom: '4px',
                                    }}>
                                        {currentStep.title}
                                    </h1>
                                    <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
                                        {currentStep.subtitle}
                                    </p>

                                    {/* ─── Progress Indicator ─── */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '0', marginTop: '24px',
                                    }}>
                                        {Array.from({ length: totalSteps }, (_, i) => {
                                            const s = i + 1;
                                            const isActive = displayStep === s;
                                            const isCompleted = displayStep > s;
                                            return (
                                                <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: isActive ? '36px' : '28px',
                                                        height: isActive ? '36px' : '28px',
                                                        borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: isActive ? '14px' : '12px',
                                                        fontWeight: 800,
                                                        color: isActive || isCompleted ? 'white' : '#94a3b8',
                                                        background: isActive ? rc.gradient
                                                            : isCompleted ? rc.accent : '#f1f5f9',
                                                        border: isActive ? 'none' : isCompleted ? 'none' : '2px solid #e2e8f0',
                                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        boxShadow: isActive ? `0 4px 16px ${rc.glowColor}` : 'none',
                                                    }}>
                                                        {isCompleted ? '✓' : s}
                                                    </div>
                                                    {s < totalSteps && (
                                                        <div style={{
                                                            width: '40px', height: '3px',
                                                            background: isCompleted ? rc.accent : '#e2e8f0',
                                                            borderRadius: '2px',
                                                            transition: 'background 0.4s ease',
                                                        }} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ─── Error ─── */}
                                {error && (
                                    <div style={{
                                        padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
                                        background: '#fef2f2', color: '#dc2626', fontSize: '13px', fontWeight: 600,
                                        border: '1px solid #fecaca',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}>
                                        <AlertTriangle size={16} /> {error}
                                    </div>
                                )}

                                {/* ════════════════ STEP 1: IDENTITY ════════════════ */}
                                {step === 1 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                        {/* Role Selector Cards */}
                                        <div>
                                            <label style={labelStyle}>I want to join as</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                {roles.map((r) => {
                                                    const cfg = ROLE_CONFIG[r];
                                                    const isSelected = form.role === r;
                                                    return (
                                                        <button type="button" key={r} onClick={() => updateCore('role', r)} style={{
                                                            padding: '16px 14px', borderRadius: '14px',
                                                            border: `2px solid ${isSelected ? cfg.accent : '#e2e8f0'}`,
                                                            background: isSelected ? `${cfg.accent}08` : 'white',
                                                            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px',
                                                            position: 'relative', overflow: 'hidden',
                                                            boxShadow: isSelected ? `0 4px 20px ${cfg.glowColor}` : '0 1px 3px rgba(0,0,0,0.04)',
                                                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                                        }}>
                                                            {isSelected && (
                                                                <div style={{
                                                                    position: 'absolute', top: '8px', right: '8px',
                                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                                    background: cfg.gradient, display: 'flex',
                                                                    alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: '11px', color: 'white',
                                                                }}>✓</div>
                                                            )}
                                                            {(() => { const RIcon = ROLE_ICONS[r]; return <RIcon size={22} color={isSelected ? cfg.accent : '#64748b'} />; })()}
                                                            <span style={{
                                                                fontSize: '14px', fontWeight: 700,
                                                                color: isSelected ? cfg.accent : '#1e293b',
                                                            }}>
                                                                {roleLabels[r] || r}
                                                            </span>
                                                            <span style={{
                                                                fontSize: '11px', color: '#94a3b8', lineHeight: '1.3',
                                                                textAlign: 'left',
                                                            }}>
                                                                {cfg.description}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Name Fields */}
                                        {form.role === 'ORGANIZER' ? (
                                            <InputGroup label="Organization / Full Name" icon={<Building size={14} color={rc.accent} />}>
                                                <input type="text" value={form.firstName} onChange={(e) => updateCore('firstName', e.target.value)}
                                                    style={inputStyle(rc.accent)} placeholder="e.g. Delhi Sports Association" required />
                                                <input type="hidden" value="..." onChange={(e) => updateCore('lastName', e.target.value)} />
                                            </InputGroup>
                                        ) : form.role === 'TEAM' ? (
                                            <InputGroup label="Team Name" icon={<Shield size={14} color={rc.accent} />}>
                                                <input type="text" value={form.firstName} onChange={(e) => updateCore('firstName', e.target.value)}
                                                    style={inputStyle(rc.accent)} placeholder="e.g. Mumbai Strikers" required />
                                                <input type="hidden" value="..." onChange={(e) => updateCore('lastName', e.target.value)} />
                                            </InputGroup>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <InputGroup label="First Name" icon={<User size={14} color={rc.accent} />}>
                                                    <input type="text" value={form.firstName} onChange={(e) => updateCore('firstName', e.target.value)}
                                                        style={inputStyle(rc.accent)} placeholder="John" required />
                                                </InputGroup>
                                                <InputGroup label="Last Name" icon={<User size={14} color={rc.accent} />}>
                                                    <input type="text" value={form.lastName} onChange={(e) => updateCore('lastName', e.target.value)}
                                                        style={inputStyle(rc.accent)} placeholder="Doe" required />
                                                </InputGroup>
                                            </div>
                                        )}

                                        {/* Email */}
                                        <InputGroup label="Email Address" icon={<MailIcon size={14} color={rc.accent} />}>
                                            <input type="email" value={form.email} onChange={(e) => updateCore('email', e.target.value)}
                                                style={inputStyle(rc.accent)} placeholder="you@example.com" />
                                        </InputGroup>

                                        {/* Password */}
                                        <InputGroup label="Password" icon={<Lock size={14} color={rc.accent} />}>
                                            <div style={{ position: 'relative' }}>
                                                <input type={showPassword ? 'text' : 'password'} value={form.password}
                                                    onChange={(e) => updateCore('password', e.target.value)}
                                                    style={inputStyle(rc.accent)} placeholder="Min 6 characters" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px',
                                                    color: '#94a3b8', padding: '4px',
                                                }}>
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </InputGroup>

                                        {/* Phone */}
                                        <InputGroup label="Phone Number" icon={<Phone size={14} color={rc.accent} />}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <select value={phoneData.countryCode}
                                                    onChange={(e) => updatePhone('countryCode', e.target.value)}
                                                    style={{ ...inputStyle(rc.accent), width: '100px', padding: '12px 8px' }}>
                                                    <option value="+91">🇮🇳 +91</option>
                                                    <option value="+1">🇺🇸 +1</option>
                                                    <option value="+44">🇬🇧 +44</option>
                                                    <option value="+61">🇦🇺 +61</option>
                                                </select>
                                                <input type="tel" value={phoneData.phone}
                                                    onChange={(e) => updatePhone('phone', e.target.value)}
                                                    style={{ ...inputStyle(rc.accent), flex: 1 }} placeholder="98765 43210" />
                                            </div>
                                        </InputGroup>

                                        <PrimaryButton accent={rc.accent} gradient={rc.gradient} glow={rc.glowColor} onClick={handleNextStep1}>
                                            Continue <ArrowRight size={16} />
                                        </PrimaryButton>
                                    </div>
                                )}

                                {/* ════════════════ STEP 2: LOCATION ════════════════ */}
                                {step === 2 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                        <InputGroup label="Country" icon={<Globe size={14} color={rc.accent} />}>
                                            <select value={location.countryIso} onChange={(e) => {
                                                updateLoc('countryIso', e.target.value);
                                                setLocation((prev) => ({ ...prev, stateIso: '', districtName: '' }));
                                            }} style={inputStyle(rc.accent)}>
                                                {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                                            </select>
                                        </InputGroup>

                                        <InputGroup label="State / Province" icon={<MapPin size={14} color={rc.accent} />}>
                                            <select value={location.stateIso} onChange={(e) => {
                                                updateLoc('stateIso', e.target.value);
                                                setLocation((prev) => ({ ...prev, districtName: '' }));
                                            }} style={inputStyle(rc.accent)}>
                                                <option value="">— Select State —</option>
                                                {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                                            </select>
                                        </InputGroup>

                                        <InputGroup label="City / District" icon={<Building2 size={14} color={rc.accent} />}>
                                            <select value={location.districtName} onChange={(e) => updateLoc('districtName', e.target.value)}
                                                style={{ ...inputStyle(rc.accent), opacity: location.stateIso ? 1 : 0.5 }} disabled={!location.stateIso}>
                                                <option value="">— Select City —</option>
                                                {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </InputGroup>

                                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                            <BackButton onClick={() => goBack(1)} />
                                            <PrimaryButton accent={rc.accent} gradient={rc.gradient} glow={rc.glowColor}
                                                onClick={handleNextStep2} style={{ flex: 2 }}>
                                                Continue <ArrowRight size={16} />
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                )}

                                {/* ════════════════ STEP 3: DEMOGRAPHICS ════════════════ */}
                                {step === 3 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                        {form.role === 'PLAYER' && (
                                            <>
                                                {/* Gender */}
                                                <div>
                                                    <label style={labelStyle}>Gender</label>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                        {[
                                                            { v: 'Male', icon: 'M' },
                                                            { v: 'Female', icon: 'F' },
                                                            { v: 'Other', icon: 'O' },
                                                            { v: 'Prefer not to say', icon: '—' },
                                                        ].map(g => (
                                                            <button type="button" key={g.v} onClick={() => updateDemo('gender', g.v)} style={{
                                                                padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                                                                border: `2px solid ${demographics.gender === g.v ? rc.accent : '#e2e8f0'}`,
                                                                background: demographics.gender === g.v ? `${rc.accent}10` : 'white',
                                                                color: demographics.gender === g.v ? rc.accent : '#64748b',
                                                                cursor: 'pointer', transition: 'all 0.25s',
                                                                display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
                                                            }}>
                                                                <span style={{ fontSize: '14px', fontWeight: 800, width: '22px', height: '22px', borderRadius: '6px', background: demographics.gender === g.v ? `${rc.accent}20` : '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{g.icon}</span> {g.v}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Height */}
                                                <InputGroup label="Height (cm)" icon={<Ruler size={14} color={rc.accent} />} optional>
                                                    <input type="number" value={demographics.heightCm}
                                                        onChange={(e) => updateDemo('heightCm', e.target.value)}
                                                        style={inputStyle(rc.accent)} placeholder="e.g. 175" />
                                                </InputGroup>
                                            </>
                                        )}

                                        {/* Photo Upload */}
                                        <div>
                                            <label style={labelStyle}>
                                                Profile Photo
                                                {form.role === 'PLAYER' && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                                            </label>
                                            <div style={{
                                                border: `2px dashed ${demographics.avatar ? rc.accent : '#d1d5db'}`,
                                                borderRadius: '16px', padding: '28px', textAlign: 'center',
                                                background: demographics.avatar ? `${rc.accent}05` : '#fafafa',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer',
                                            }} onClick={() => document.getElementById('photo-upload')?.click()}>
                                                {demographics.avatar ? (
                                                    <div style={{
                                                        width: '88px', height: '88px', borderRadius: '50%', overflow: 'hidden',
                                                        border: `3px solid ${rc.accent}`,
                                                        boxShadow: `0 4px 16px ${rc.glowColor}`,
                                                    }}>
                                                        <img src={demographics.avatar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        width: '72px', height: '72px', borderRadius: '50%',
                                                        background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '28px',
                                                    }}><Camera size={28} color="#94a3b8" /></div>
                                                )}
                                                <div>
                                                    <span style={{
                                                        display: 'inline-block', padding: '8px 20px', borderRadius: '10px',
                                                        fontSize: '13px', fontWeight: 600, color: rc.accent,
                                                        background: `${rc.accent}12`, transition: 'all 0.2s',
                                                    }}>
                                                        {demographics.avatar ? 'Change Photo' : 'Upload Photo'}
                                                    </span>
                                                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>JPG, PNG — Max 2MB</p>
                                                </div>
                                                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                            <BackButton onClick={() => goBack(2)} />
                                            <PrimaryButton accent={rc.accent} gradient={rc.gradient} glow={rc.glowColor}
                                                onClick={() => goForward(4)} style={{ flex: 2 }}>
                                                Continue <ArrowRight size={16} />
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                )}
                                
                                {/* ════════════════ STEP: CHOOSE SPORTS ════════════════ */}
                                {(skipDemographics ? step === 3 : step === 4) && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                            <label style={{ ...labelStyle, fontSize: '15px', color: '#0f172a' }}>
                                                Select Your Sports
                                            </label>
                                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '-4px' }}>
                                                Choose up to 3 sports you are involved in.
                                            </p>
                                        </div>
                                        
                                        {loadingSports ? (
                                            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
                                                Loading sports...
                                            </div>
                                        ) : (
                                            <div style={{
                                                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px',
                                                maxHeight: '380px', overflowY: 'auto', padding: '4px 8px 16px 4px',
                                                margin: '0 -4px', // To align with the padding
                                                scrollbarWidth: 'thin',
                                                scrollbarColor: '#cbd5e1 transparent'
                                            }}>
                                                {sports.map((sport, index) => {
                                                    const isSelected = selectedSports.includes(sport.id);
                                                    const isDisabled = !isSelected && selectedSports.length >= 3;
                                                    
                                                    return (
                                                        <div
                                                            key={sport.id}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setSelectedSports(prev => prev.filter(id => id !== sport.id));
                                                                } else {
                                                                    if (selectedSports.length < 3) {
                                                                        setSelectedSports(prev => [...prev, sport.id]);
                                                                    }
                                                                }
                                                            }}
                                                            style={{
                                                                padding: '16px 12px', borderRadius: '16px',
                                                                border: `2px solid ${isSelected ? (sport.accentColor || rc.accent) : 'transparent'}`,
                                                                background: isSelected ? `${sport.accentColor || rc.accent}10` : '#f8fafc',
                                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                                opacity: isDisabled ? 0.6 : 1,
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                                                                textAlign: 'center', position: 'relative',
                                                                boxShadow: isSelected ? `0 8px 20px ${(sport.accentColor || rc.accent)}30` : '0 2px 8px rgba(0,0,0,0.02)',
                                                                transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                                                                animation: `slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s both`,
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!isDisabled && !isSelected) {
                                                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                                                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                                                                    (e.currentTarget as HTMLElement).style.background = 'white';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!isDisabled && !isSelected) {
                                                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                                                                    (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                                                                }
                                                            }}
                                                        >
                                                            {isSelected && (
                                                                <div style={{
                                                                    position: 'absolute', top: '10px', right: '10px',
                                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                                    background: `linear-gradient(135deg, ${sport.accentColor || rc.accent}, ${rc.accentTo || rc.accent})`, color: 'white',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    boxShadow: `0 2px 8px ${(sport.accentColor || rc.accent)}60`,
                                                                    animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                                                                }}>
                                                                    <Check size={12} strokeWidth={3.5} />
                                                                </div>
                                                            )}
                                                            <div style={{
                                                                fontSize: '28px', width: '56px', height: '56px', borderRadius: '50%',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                background: isSelected ? 'white' : 'white',
                                                                boxShadow: isSelected ? `0 4px 12px ${(sport.accentColor || rc.accent)}20` : '0 2px 6px rgba(0,0,0,0.04)',
                                                                transition: 'all 0.3s ease',
                                                            }}>
                                                                {sport.icon ? (
                                                                    <span style={{ fontSize: '26px', filter: isSelected ? 'none' : 'grayscale(0.4)', transition: 'all 0.3s' }}>
                                                                        {sport.icon}
                                                                    </span>
                                                                ) : (
                                                                    <Activity size={24} color={isSelected ? (sport.accentColor || rc.accent) : '#94a3b8'} />
                                                                )}
                                                            </div>
                                                            <span style={{
                                                                fontSize: '14px', fontWeight: 700,
                                                                color: isSelected ? (sport.accentColor || rc.accent) : '#475569',
                                                                transition: 'color 0.3s'
                                                            }}>{sport.name}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                            <BackButton onClick={() => goBack(skipDemographics ? 2 : 3)} />
                                            <PrimaryButton accent={rc.accent} gradient={rc.gradient} glow={rc.glowColor}
                                                onClick={handleNextStepSports} style={{ flex: 2 }}>
                                                <Sparkles size={16} /> Create Account
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                )}

                                {/* ════════════════ STEP: EMAIL OTP ════════════════ */}
                                {step === totalSteps && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
                                        <div style={{
                                            width: '80px', height: '80px', margin: '0 auto', borderRadius: '50%',
                                            background: `${rc.accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <MailCheck size={36} color={rc.accent} />
                                        </div>
                                        <p style={{ color: '#64748b', fontSize: '14px' }}>
                                            Enter the 6-digit code sent to{' '}
                                            <strong style={{ color: '#0f172a' }}>{form.email}</strong>
                                        </p>

                                        {/* Split OTP Input */}
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            {[0, 1, 2, 3, 4, 5].map(i => (
                                                <input key={i}
                                                    ref={el => { otpRefs.current[i] = el; }}
                                                    type="text" maxLength={1} inputMode="numeric"
                                                    value={emailOtp[i] || ''}
                                                    onChange={(e) => handleOtpDigit(i, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                    style={{
                                                        width: '52px', height: '60px', borderRadius: '14px',
                                                        border: `2px solid ${emailOtp[i] ? rc.accent : '#e2e8f0'}`,
                                                        background: emailOtp[i] ? `${rc.accent}08` : '#fafafa',
                                                        textAlign: 'center', fontSize: '24px', fontWeight: 800,
                                                        color: '#0f172a', outline: 'none',
                                                        transition: 'all 0.25s ease',
                                                        boxShadow: emailOtp[i] ? `0 2px 12px ${rc.glowColor}` : 'none',
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = rc.accent;
                                                        e.target.style.boxShadow = `0 0 0 3px ${rc.glowColor}`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = emailOtp[i] ? rc.accent : '#e2e8f0';
                                                        e.target.style.boxShadow = emailOtp[i] ? `0 2px 12px ${rc.glowColor}` : 'none';
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        <PrimaryButton accent={rc.accent} gradient={rc.gradient} glow={rc.glowColor} onClick={handleVerifyEmailOtp}>
                                            <CheckCircle size={16} /> Verify & Enter
                                        </PrimaryButton>
                                    </div>
                                )}

                                {/* ─── Footer ─── */}
                                <p style={{
                                    textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b',
                                }}>
                                    Already have an account?{' '}
                                    <Link href="/login" style={{
                                        color: rc.accent, fontWeight: 700, textDecoration: 'none',
                                        transition: 'color 0.2s',
                                    }}>
                                        Sign In
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                input::placeholder, select::placeholder {
                    color: #94a3b8;
                }
                input:focus {
                    border-color: ${rc.accent} !important;
                    box-shadow: 0 0 0 3px ${rc.glowColor} !important;
                }
                select:focus {
                    border-color: ${rc.accent} !important;
                    box-shadow: 0 0 0 3px ${rc.glowColor} !important;
                }
            `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px',
    color: '#374151', letterSpacing: '0.01em',
};

function inputStyle(accent: string): React.CSSProperties {
    return {
        width: '100%', padding: '12px 14px', borderRadius: '12px',
        border: '2px solid #e2e8f0', background: '#fafafa',
        color: '#0f172a', fontSize: '14px', fontWeight: 500,
        transition: 'all 0.25s ease', outline: 'none',
        fontFamily: "'Inter', sans-serif",
    };
}

function InputGroup({ label, icon, children, optional }: {
    label: string; icon: React.ReactNode; children: React.ReactNode; optional?: boolean;
}) {
    return (
        <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {icon}
                {label}
                {optional && <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: '6px' }}>(Optional)</span>}
            </label>
            {children}
        </div>
    );
}

function PrimaryButton({ children, accent, gradient, glow, onClick, style }: {
    children: React.ReactNode; accent: string; gradient: string; glow: string;
    onClick: () => void; style?: React.CSSProperties;
}) {
    return (
        <button type="button" onClick={onClick} style={{
            width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
            background: gradient, color: 'white',
            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
            boxShadow: `0 6px 24px ${glow}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            letterSpacing: '0.01em',
            ...style,
        }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 32px ${glow}`;
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 24px ${glow}`;
            }}
        >
            {children}
        </button>
    );
}

function BackButton({ onClick }: { onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} style={{
            flex: 1, padding: '14px', borderRadius: '14px',
            background: '#f1f5f9', color: '#475569', fontWeight: 600,
            border: 'none', cursor: 'pointer', fontSize: '14px',
            transition: 'all 0.25s ease',
        }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
            }}
        >
            <ArrowLeft size={14} style={{ marginRight: '4px' }} /> Back
        </button>
    );
}

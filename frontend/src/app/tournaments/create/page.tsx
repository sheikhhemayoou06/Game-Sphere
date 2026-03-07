'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';
import SportIcon from '@/components/SportIcon';

export default function CreateTournamentPage() {
    const { user, isAuthenticated, loadFromStorage } = useAuthStore();
    const { selectedSport } = useSportStore();
    const [sports, setSports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const [form, setForm] = useState({
        name: '',
        sportId: '',
        description: '',
        level: 'DISTRICT',
        format: 'KNOCKOUT',
        maxTeams: 16,
        squadSize: 15,
        registrationFee: 0,
        isRegistrationOpen: false,
        registrationEnd: '',
        approvalMode: 'MANUAL',
        maxPurse: 0,
        startDate: '',
        endDate: '',
        venue: '',
        rules: '',
    });

    useEffect(() => {
        loadFromStorage();
        setLoaded(true);
    }, [loadFromStorage]);

    useEffect(() => {
        if (loaded && !isAuthenticated) {
            router.push('/login');
            return;
        }
        api.getSports().then((allSports) => {
            setSports(allSports);
            if (selectedSport && form.sportId !== selectedSport.id) {
                setForm(prev => ({ ...prev, sportId: selectedSport.id }));
            }
        }).catch(() => { });
    }, [loaded, isAuthenticated, router, selectedSport, form.sportId]);

    const update = (field: string, value: any) => setForm({ ...form, [field]: value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data: any = {
                ...form,
                maxTeams: Number(form.maxTeams),
                squadSize: Number(form.squadSize),
                registrationFee: Number(form.registrationFee),
                maxPurse: Number(form.maxPurse),
            };
            if (data.startDate) data.startDate = new Date(data.startDate).toISOString();
            if (data.endDate) data.endDate = new Date(data.endDate).toISOString();
            if (data.registrationEnd) data.registrationEnd = new Date(data.registrationEnd).toISOString();
            if (!data.startDate) delete data.startDate;
            if (!data.endDate) delete data.endDate;
            if (!data.registrationEnd) delete data.registrationEnd;
            if (!data.rules) delete data.rules;

            const tournament = await api.createTournament(data);
            router.push(`/tournaments/${tournament.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create tournament');
        } finally {
            setLoading(false);
        }
    };

    if (!loaded) return null;

    const levels = ['SCHOOL', 'COLLEGE', 'DISTRICT', 'STATE', 'NATIONAL', 'INTERNATIONAL'];
    const formats = ['KNOCKOUT', 'LEAGUE', 'ROUND_ROBIN', 'GROUP_KNOCKOUT'];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <nav style={{
                padding: '16px 32px', background: 'white', borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <span style={{ fontSize: '24px' }}>🌐</span>
                    <span className="gradient-text" style={{ fontSize: '20px', fontWeight: 800 }}>Game Sphere</span>
                </Link>
                <Link href="/dashboard" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e1b4b', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                    🏆 Create Tournament
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
                    Set up a new tournament — configure format, rules, and schedule
                </p>

                {error && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
                        background: '#fef2f2', color: '#dc2626', fontSize: '14px', fontWeight: 500,
                        border: '1px solid #fecaca',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{
                    padding: '36px', borderRadius: '20px', background: 'white',
                    border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                    display: 'flex', flexDirection: 'column', gap: '20px',
                }}>
                    {/* Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                            Tournament Name *
                        </label>
                        <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                            className="input-field" placeholder="e.g., District Cricket Championship 2026" required style={{ color: '#1e1b4b' }} />
                    </div>

                    {/* Sport */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Sport *</label>
                            {selectedSport && <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 700, background: '#e0e7ff', padding: '2px 8px', borderRadius: '10px' }}>Locked to Workspace</span>}
                        </div>
                        {sports.length === 0 ? (
                            <div style={{ padding: '14px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fde68a', fontSize: '14px', color: '#92400e' }}>
                                ⚠️ No sports configured. Go to <Link href="/admin" style={{ color: '#6366f1', fontWeight: 600 }}>Admin Panel</Link> and seed sports first.
                            </div>
                        ) : selectedSport ? (
                            <div style={{ padding: '16px', borderRadius: '12px', background: `${selectedSport.accentColor || '#6366f1'}15`, border: `2px solid ${selectedSport.accentColor || '#6366f1'}40`, display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ fontSize: '32px' }}><SportIcon sport={selectedSport.name} size={24} color="currentColor" /></div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e1b4b' }}>{selectedSport.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Creating tournament in current workspace</div>
                                </div>
                            </div>
                        ) : (
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {sports.map((s: any) => (
                                    <button type="button" key={s.id} onClick={() => update('sportId', s.id)} style={{
                                        padding: '12px', borderRadius: '10px', border: `2px solid ${form.sportId === s.id ? (s.accentColor || '#6366f1') : '#e2e8f0'}`,
                                        background: form.sportId === s.id ? `${s.accentColor || '#6366f1'}10` : 'white',
                                        cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center',
                                    }}>
                                        <div style={{ fontSize: '24px' }}><SportIcon sport={s.name} size={24} color="currentColor" /></div>
                                        <div style={{
                                            fontSize: '12px', fontWeight: 600, marginTop: '4px',
                                            color: form.sportId === s.id ? (s.accentColor || '#6366f1') : '#64748b',
                                        }}>{s.name}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Level + Format */}
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Level</label>
                            <select value={form.level} onChange={(e) => update('level', e.target.value)}
                                className="input-field" style={{ color: '#1e1b4b' }}>
                                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Format</label>
                            <select value={form.format} onChange={(e) => update('format', e.target.value)}
                                className="input-field" style={{ color: '#1e1b4b' }}>
                                {formats.map((f) => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Max Teams, Squad Size, Fee */}
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Max Teams</label>
                            <input type="number" value={form.maxTeams} onChange={(e) => update('maxTeams', e.target.value)}
                                className="input-field" min="2" max="128" style={{ color: '#1e1b4b' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Squad Size (per team)</label>
                            <input type="number" value={form.squadSize} onChange={(e) => update('squadSize', e.target.value)}
                                className="input-field" min="5" max="50" style={{ color: '#1e1b4b' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Registration Fee (₹)</label>
                            <input type="number" value={form.registrationFee} onChange={(e) => update('registrationFee', e.target.value)}
                                className="input-field" min="0" style={{ color: '#1e1b4b' }} />
                        </div>
                    </div>

                    {/* Registration Controls */}
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1e1b4b', marginBottom: '16px' }}>📝 Registration Settings</h3>
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Approval Mode</label>
                                <select value={form.approvalMode} onChange={(e) => update('approvalMode', e.target.value)}
                                    className="input-field" style={{ color: '#1e1b4b' }}>
                                    <option value="MANUAL">Manual Approval</option>
                                    <option value="AUTOMATIC">Automatic Approval</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Registration Deadline</label>
                                <input type="date" value={form.registrationEnd} onChange={(e) => update('registrationEnd', e.target.value)}
                                    className="input-field" style={{ color: '#1e1b4b' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
                                    <input type="checkbox" checked={form.isRegistrationOpen} onChange={(e) => update('isRegistrationOpen', e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: form.isRegistrationOpen ? '#22c55e' : '#64748b' }}>
                                        {form.isRegistrationOpen ? 'Registration is OPEN' : 'Registration is CLOSED'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Auction Settings */}
                    {['AUCTION'].includes(form.format) ? (
                        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1e1b4b', marginBottom: '16px' }}>🔨 Auction Settings</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Team Max Purse (₹)</label>
                                    <input type="number" value={form.maxPurse} onChange={(e) => update('maxPurse', e.target.value)}
                                        className="input-field" min="0" placeholder="e.g., 10000000" style={{ color: '#1e1b4b' }} />
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Start Date</label>
                            <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)}
                                className="input-field" style={{ color: '#1e1b4b' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>End Date</label>
                            <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)}
                                className="input-field" style={{ color: '#1e1b4b' }} />
                        </div>
                    </div>

                    {/* Venue */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Venue</label>
                        <input type="text" value={form.venue} onChange={(e) => update('venue', e.target.value)}
                            className="input-field" placeholder="e.g., Jawaharlal Nehru Stadium, Delhi" style={{ color: '#1e1b4b' }} />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Description</label>
                        <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
                            className="input-field" rows={3} placeholder="Brief description of the tournament..." style={{ color: '#1e1b4b', resize: 'vertical' }} />
                    </div>

                    {/* Submit */}
                    <button type="submit" className="btn-primary" disabled={loading || !form.name || !form.sportId} style={{
                        width: '100%', justifyContent: 'center', padding: '16px', marginTop: '8px',
                        opacity: (loading || !form.name || !form.sportId) ? 0.6 : 1,
                    }}>
                        {loading ? '⏳ Creating...' : '🚀 Create Tournament'}
                    </button>
                </form>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';

const FAQ_ITEMS = [
    { q: 'How do I create a tournament?', a: 'Navigate to Dashboard → Tournaments → Create Tournament. Fill in the tournament name, select a sport, set dates, choose the format (knockout/round-robin/league), and submit. You can then manage fixtures, teams, and matches from the tournament detail page.' },
    { q: 'How does the Universal Sports ID (USI) work?', a: 'Every registered player receives a unique USI that tracks their career across all sports, tournaments, and organizations. The USI includes performance stats, achievements, certificates, transfer history, and injury records — all in one portable digital identity.' },
    { q: 'How do I verify documents?', a: 'Go to the Documents page. Upload required documents (consent forms, ID proof, medical certificates). Admins can approve or reject documents from the admin panel. Approved documents are marked with a verified badge.' },
    { q: 'Can I manage multiple sports?', a: 'Yes! Game Sphere is sport-agnostic. You can manage Cricket, Football, Basketball, Kabaddi, Athletics, Hockey, Badminton, Swimming, and more — all from the same platform. Each sport has configurable rules and scoring systems.' },
    { q: 'How do player transfers work?', a: 'Navigate to Transfers → Request Transfer. Select the player, source team, destination team, and transfer type (permanent/loan). The transfer goes through an approval workflow before being finalized.' },
    { q: 'How do I generate certificates?', a: 'Certificates are automatically generated for tournament participants and winners. Go to the Certificates page to view, verify (via QR code), and download digital certificates. They are linked to the player\'s USI.' },
    { q: 'Is the platform available in regional languages?', a: 'Yes! Game Sphere supports English, Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), and Kannada (ಕನ್ನಡ). You can change your language preference in Settings → Preferences.' },
    { q: 'How does live scoring work?', a: 'Go to Live Scoring, select an active match, and use the real-time scoring interface. You can start/pause the timer, add goals with one click, record yellow/red cards, substitutions, injuries, and other events that appear on the live timeline.' },
];

const GUIDES = [
    { title: 'Getting Started Guide', desc: 'Set up your account, create your first tournament, and add teams', icon: '🚀', color: '#22c55e' },
    { title: 'Tournament Management', desc: 'Configure formats, generate fixtures, manage matches and results', icon: '🏆', color: '#6366f1' },
    { title: 'Player Registration', desc: 'Register players, assign USIs, and manage player profiles', icon: '👤', color: '#f59e0b' },
    { title: 'Financial Management', desc: 'Track revenue, manage payments, and generate financial reports', icon: '💰', color: '#ec4899' },
    { title: 'Admin & Governance', desc: 'Set up hierarchical governance, roles, and permissions', icon: '🛡️', color: '#8b5cf6' },
    { title: 'API Documentation', desc: 'RESTful API reference for third-party integrations', icon: '🔗', color: '#14b8a6' },
];

export default function HelpPage() {
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '🤝';
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'faq' | 'guides' | 'contact'>('faq');

    const filteredFaq = FAQ_ITEMS.filter(item => !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#854d0e', textDecoration: 'none' }}>🌐 Game Sphere</Link>
                <Link href="/dashboard" style={{ color: '#854d0e', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#713f12', marginBottom: '8px' }}>{sportIcon} {selectedSport ? `${sportLabel} Help & Support` : 'Help & Support'}</h1>
                    <p style={{ color: '#854d0e', fontSize: '16px', marginBottom: '20px' }}>{selectedSport ? `${sportLabel} help, guides, and support` : 'Find answers, explore guides, or reach out to our team'}</p>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search for help..."
                        style={{ width: '100%', maxWidth: '480px', padding: '14px 20px', borderRadius: '14px', border: '2px solid #fde68a', fontSize: '15px', boxSizing: 'border-box' }} />
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(133,77,14,0.08)', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content', margin: '0 auto 24px' }}>
                    {(['faq', 'guides', 'contact'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: tab === t ? '#854d0e' : 'transparent', color: tab === t ? '#fff' : '#854d0e', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textTransform: 'capitalize' }}>
                            {t === 'faq' ? '❓ FAQ' : t === 'guides' ? '📚 Guides' : '📧 Contact'}
                        </button>
                    ))}
                </div>

                {tab === 'faq' && (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {filteredFaq.map((item, i) => (
                            <div key={i} style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(133,77,14,0.06)' }}>
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    style={{ width: '100%', padding: '18px 20px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b' }}>{item.q}</span>
                                    <span style={{ fontSize: '18px', color: '#854d0e', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                                </button>
                                {openFaq === i && (
                                    <div style={{ padding: '0 20px 18px', fontSize: '14px', color: '#475569', lineHeight: 1.6, borderTop: '1px solid #fef3c7' }}>
                                        <div style={{ paddingTop: '14px' }}>{item.a}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'guides' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        {GUIDES.map((g, i) => (
                            <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 12px rgba(133,77,14,0.06)', cursor: 'pointer', transition: 'transform 0.2s', borderLeft: `4px solid ${g.color}` }}>
                                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{g.icon}</div>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e1b4b', marginBottom: '4px' }}>{g.title}</h3>
                                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{g.desc}</p>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'contact' && (
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(133,77,14,0.08)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#713f12', marginBottom: '20px' }}>📧 Get in Touch</h2>
                        <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
                            {[
                                { label: 'Name', placeholder: 'Your full name' },
                                { label: 'Email', placeholder: 'your@email.com' },
                            ].map(f => (
                                <div key={f.label}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#713f12', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                                    <input placeholder={f.placeholder} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #fde68a', fontSize: '14px', boxSizing: 'border-box' }} />
                                </div>
                            ))}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#713f12', display: 'block', marginBottom: '6px' }}>Category</label>
                                <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #fde68a', fontSize: '14px', fontWeight: 600 }}>
                                    <option>General Inquiry</option>
                                    <option>Bug Report</option>
                                    <option>Feature Request</option>
                                    <option>Account Issue</option>
                                    <option>Sponsorship</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#713f12', display: 'block', marginBottom: '6px' }}>Message</label>
                                <textarea placeholder="Describe your issue or question..." style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #fde68a', fontSize: '14px', minHeight: '120px', resize: 'vertical', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        <button style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#854d0e', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>Send Message</button>

                        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #fef3c7', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            {[
                                { icon: '📧', label: 'Email', value: 'support@gamesphere.in' },
                                { icon: '📞', label: 'Phone', value: '+91 1800-SPORT-00' },
                                { icon: '🏢', label: 'Office', value: 'New Delhi, India' },
                            ].map(c => (
                                <div key={c.label} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{c.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#713f12' }}>{c.label}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{c.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

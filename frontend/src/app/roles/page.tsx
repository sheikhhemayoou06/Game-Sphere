'use client';

import { useState } from 'react';
import Link from 'next/link';

const ROLES = [
    { id: '1', name: 'Super Admin', level: 'SYSTEM', users: 2, permissions: 48, color: "inherit", icon: '👑', desc: 'Full platform access — all modules, settings, and user management' },
    { id: '2', name: 'State Admin', level: 'STATE', users: 12, permissions: 36, color: "inherit", icon: '🏛️', desc: 'Manage tournaments, teams, and players within assigned state' },
    { id: '3', name: 'District Admin', level: 'DISTRICT', users: 45, permissions: 24, color: "inherit", icon: '🏢', desc: 'Organize district-level tournaments and manage local facilities' },
    { id: '4', name: 'Tournament Director', level: 'TOURNAMENT', users: 28, permissions: 18, color: "inherit", icon: '🏆', desc: 'Full control over assigned tournaments — fixtures, scoring, results' },
    { id: '5', name: 'Coach', level: 'TEAM', users: 65, permissions: 12, color: "inherit", icon: '🧑‍🏫', desc: 'Manage team roster, training schedule, and player performance' },
    { id: '6', name: 'Scorer / Referee', level: 'MATCH', users: 40, permissions: 8, color: "inherit", icon: '📋', desc: 'Record match scores, events, and submit match reports' },
    { id: '7', name: 'Player', level: 'PLAYER', users: 1250, permissions: 5, color: "inherit", icon: '🏃', desc: 'View own profile, stats, certificates, and tournament schedules' },
    { id: '8', name: 'Viewer', level: 'PUBLIC', users: 3500, permissions: 2, color: "inherit", icon: '👁️', desc: 'Read-only access to public tournaments and leaderboards' },
];

const PERMISSIONS_GRID = [
    { module: 'Users', super: true, state: true, district: true, tournament: false, coach: false, scorer: false, player: false, viewer: false },
    { module: 'Tournaments', super: true, state: true, district: true, tournament: true, coach: false, scorer: false, player: false, viewer: false },
    { module: 'Matches', super: true, state: true, district: true, tournament: true, coach: false, scorer: true, player: false, viewer: false },
    { module: 'Players', super: true, state: true, district: true, tournament: true, coach: true, scorer: false, player: false, viewer: false },
    { module: 'Teams', super: true, state: true, district: true, tournament: true, coach: true, scorer: false, player: false, viewer: false },
    { module: 'Documents', super: true, state: true, district: true, tournament: false, coach: false, scorer: false, player: true, viewer: false },
    { module: 'Finance', super: true, state: true, district: false, tournament: false, coach: false, scorer: false, player: false, viewer: false },
    { module: 'Analytics', super: true, state: true, district: true, tournament: true, coach: true, scorer: false, player: false, viewer: false },
];

export default function RolesPage() {
    const [tab, setTab] = useState<'roles' | 'matrix'>('roles');

    const totalUsers = ROLES.reduce((a, r) => a + r.users, 0);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: "inherit", textDecoration: 'none' }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto", objectFit: "contain" }} /> <span className="gradient-text">Game Sphere</span></div></Link>
                <Link href="/dashboard" style={{ color: "inherit", fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>🛡️ Roles & Permissions</h1>
                <p style={{ color: "inherit", fontSize: '16px', marginBottom: '28px' }}>Hierarchical governance — from National to Grassroots level</p>

                <div className="grid-cols-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Roles', value: ROLES.length, icon: '🛡️', color: "inherit" },
                        { label: 'Total Users', value: totalUsers.toLocaleString(), icon: '👥', color: "inherit" },
                        { label: 'Permission Sets', value: 48, icon: '🔐', color: "inherit" },
                        { label: 'Hierarchy Levels', value: 8, icon: '📊', color: "inherit" },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: "inherit" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
                    {(['roles', 'matrix'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: tab === t ? '#7c3aed' : 'transparent', color: tab === t ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                            {t === 'roles' ? '🛡️ Roles' : '📋 Permission Matrix'}
                        </button>
                    ))}
                </div>

                {tab === 'roles' ? (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {ROLES.map(r => (
                            <div key={r.id} className="flex-wrap-mobile" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', borderLeft: `4px solid ${r.color}` }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{r.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '15px', color: "inherit" }}>{r.name}</span>
                                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: `${r.color}20`, color: r.color }}>{r.level}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: "inherit" }}>{r.desc}</div>
                                </div>
                                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: r.color }}>{r.users}</div>
                                    <div style={{ fontSize: '10px', color: "inherit" }}>users</div>
                                </div>
                                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: "inherit" }}>{r.permissions}</div>
                                    <div style={{ fontSize: '10px', color: "inherit" }}>perms</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ minWidth: '800px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(8, 1fr)', padding: '12px 14px', background: 'rgba(124,58,237,0.15)', fontSize: '10px', fontWeight: 700, color: "inherit", gap: '4px' }}>
                                <span>Module</span>
                                {ROLES.map(r => <span key={r.id} style={{ textAlign: 'center' }}>{r.icon}</span>)}
                            </div>
                            {PERMISSIONS_GRID.map((p, i) => (
                                <div key={p.module} style={{ display: 'grid', gridTemplateColumns: '120px repeat(8, 1fr)', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', fontSize: '12px', gap: '4px', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, color: "inherit" }}>{p.module}</span>
                                    {[p.super, p.state, p.district, p.tournament, p.coach, p.scorer, p.player, p.viewer].map((v, j) => (
                                        <span key={j} style={{ textAlign: 'center', fontSize: '14px' }}>{v ? '✅' : '—'}</span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

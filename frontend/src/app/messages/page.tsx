'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore, useSportStore } from '@/lib/store';
import { sportIcons } from '@/lib/utils';
import PageNavbar from '@/components/PageNavbar';

/* ═══════ ROLE DETECTION ═══════ */
type RoleView = 'owner' | 'player';
function getMsgRole(role: string): RoleView {
    if (['ORGANIZER', 'TEAM_MANAGER'].includes(role)) return 'owner';
    return 'player';
}

/* ═══════ DATA — All empty by default ═══════ */
const TEAM_MESSAGES: Record<string, { sender: string; text: string; time: string; isOwner: boolean }[]> = {};

const TEAM_MEMBERS: Record<string, { name: string; role: string; online: boolean }[]> = {};

const DEFAULT_TEAM_MESSAGES: typeof TEAM_MESSAGES[string] = [];
const DEFAULT_TEAM_MEMBERS: typeof TEAM_MEMBERS[string] = [];

/* ═══════ OWNER-SPECIFIC DATA ═══════ */
const ANNOUNCEMENTS: Record<string, { text: string; date: string; pinned: boolean }[]> = {};

const DM_CONVERSATIONS: Record<string, { player: string; role: string; lastMsg: string; time: string; unread: number; online: boolean }[]> = {};

const STAFF_MEMBERS: Record<string, { name: string; role: string; online: boolean }[]> = {};

const STAFF_MESSAGES: Record<string, { sender: string; text: string; time: string }[]> = {};

/* ═══════ PLAYER-SPECIFIC DATA ═══════ */
const PLAYER_CONVERSATIONS: Record<string, { name: string; lastMsg: string; time: string; unread: number; isTeam: boolean; icon: string }[]> = {};

/* ═══════ COMPONENT ═══════ */
export default function MessagesPage() {
    const { user } = useAuthStore();
    const { selectedSport } = useSportStore();
    const sportLabel = selectedSport?.name || 'All Sports';
    const sportIcon = selectedSport ? (sportIcons[selectedSport.name] || selectedSport.icon || '🏅') : '💬';
    const roleView = getMsgRole(user?.role || 'PLAYER');

    const activeSport = selectedSport?.name || 'Cricket';
    const teamMessages = TEAM_MESSAGES[activeSport] || [];
    const teamMembers = TEAM_MEMBERS[activeSport] || [];
    const announcements = ANNOUNCEMENTS[activeSport] || [];
    const dmConversations = DM_CONVERSATIONS[activeSport] || [];
    const staffMembers = STAFF_MEMBERS[activeSport] || [];
    const staffMessages = STAFF_MESSAGES[activeSport] || [];
    const playerConversations = PLAYER_CONVERSATIONS[activeSport] || [];

    const [ownerTab, setOwnerTab] = useState<'team' | 'announcements' | 'dms' | 'staff'>('team');
    const [playerChat, setPlayerChat] = useState(0);
    const [msgInput, setMsgInput] = useState('');
    const [announcementInput, setAnnouncementInput] = useState('');
    const [broadcastInput, setBroadcastInput] = useState('');
    const [dmInput, setDmInput] = useState('');
    const [staffInput, setStaffInput] = useState('');
    const [selectedDm, setSelectedDm] = useState(0);

    /* ═══════ OWNER VIEW ═══════ */
    if (roleView === 'owner') {
        return (
            <div style={{ minHeight: '100vh', background: '#faf5ff' }}>
            <PageNavbar title="Messages" emoji="💬" />
                {/* Header */}
                <div style={{ background: 'white', borderBottom: '1px solid #e9d5ff', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href="/dashboard" style={{ color: '#6d28d9', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>← Dashboard</Link>
                        <span style={{ color: '#d4d4d8' }}>|</span>
                        <span style={{ fontWeight: 800, fontSize: '18px', color: '#1e1b4b' }}>{selectedSport ? `${sportLabel} Communication Hub` : '💬 Communication Hub'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '6px', background: '#ede9fe', color: '#6d28d9', fontSize: '12px', fontWeight: 700 }}>⚡ My Team</span>
                        <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>🟢 {teamMembers.filter(m => m.online).length} online</span>
                    </div>
                </div>

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                        {[
                            { key: 'team' as const, label: '👥 Team Chat', badge: 0 },
                            { key: 'announcements' as const, label: '📢 Announcements', badge: 0 },
                            { key: 'dms' as const, label: '✉️ Player DMs', badge: dmConversations.reduce((s, d) => s + d.unread, 0) },
                            { key: 'staff' as const, label: '🏢 Staff Chat', badge: 0 },
                        ].map((t) => (
                            <button key={t.key} onClick={() => setOwnerTab(t.key)} style={{
                                padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                border: ownerTab === t.key ? '2px solid #7c3aed' : '1px solid #e9d5ff',
                                background: ownerTab === t.key ? '#7c3aed' : 'white',
                                color: ownerTab === t.key ? 'white' : '#6d28d9',
                                position: 'relative',
                            }}>
                                {t.label}
                                {t.badge > 0 && (
                                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Team Chat */}
                    {ownerTab === 'team' && (
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px' }}>
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, height: '520px' }}>
                                {/* Chat Header */}
                                <div style={{ padding: '14px 20px', background: '#faf5ff', borderBottom: '1px solid #f3e8ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '22px' }}>⚡</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b' }}>My Team — Team Chat</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{teamMembers.length} members • {teamMembers.filter(m => m.online).length} online</div>
                                    </div>
                                </div>
                                {/* Messages */}
                                <div style={{ flex: 1, overflowY: 'auto' as const, padding: '16px 20px' }}>
                                    {teamMessages.map((m, i) => (
                                        <div key={i} style={{ marginBottom: '12px', display: 'flex', flexDirection: m.isOwner ? 'row-reverse' as const : 'row' as const, gap: '8px' }}>
                                            <div style={{
                                                maxWidth: '70%', padding: '10px 14px', borderRadius: '12px',
                                                background: m.isOwner ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#f3e8ff',
                                                color: m.isOwner ? 'white' : '#1e1b4b',
                                            }}>
                                                <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '2px', opacity: 0.8 }}>{m.sender}</div>
                                                <div style={{ fontSize: '13px' }}>{m.text}</div>
                                                <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px', textAlign: 'right' as const }}>{m.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Input */}
                                <div style={{ padding: '12px 16px', borderTop: '1px solid #f3e8ff', display: 'flex', gap: '8px' }}>
                                    <input value={msgInput} onChange={(e) => setMsgInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '13px', outline: 'none' }} />
                                    <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Send</button>
                                </div>
                            </div>

                            {/* Members Panel */}
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', padding: '16px', height: '520px', overflowY: 'auto' as const }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '12px' }}>MEMBERS ({teamMembers.length})</div>
                                {teamMembers.sort((a, b) => Number(b.online) - Number(a.online)).map((m, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: i < teamMembers.length - 1 ? '1px solid #f3e8ff' : 'none' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.online ? '#22c55e' : '#d4d4d8' }} />
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e1b4b' }}>{m.name}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b' }}>{m.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Announcements */}
                    {ownerTab === 'announcements' && (
                        <div>
                            {/* Post Announcement */}
                            <div style={{ padding: '20px', borderRadius: '14px', background: 'white', border: '2px solid #e9d5ff', marginBottom: '16px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#6d28d9', marginBottom: '10px' }}>📢 POST ANNOUNCEMENT</div>
                                <textarea value={announcementInput} onChange={(e) => setAnnouncementInput(e.target.value)} placeholder="Write an announcement for the team..." rows={3}
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit', marginBottom: '10px' }} />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>📌 Post & Pin</button>
                                    <button style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #e9d5ff', background: 'white', color: '#6d28d9', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Post</button>
                                </div>
                            </div>

                            {/* Broadcast */}
                            <div style={{ padding: '20px', borderRadius: '14px', background: 'white', border: '1px solid #f3e8ff', marginBottom: '16px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '10px' }}>📡 BROADCAST MESSAGE</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input value={broadcastInput} onChange={(e) => setBroadcastInput(e.target.value)} placeholder="Send message to all team members..." style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '14px', outline: 'none' }} />
                                    <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#0f0f1a', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>📤 Broadcast</button>
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>This will send a notification to all {teamMembers.length} team members</div>
                            </div>

                            {/* Existing Announcements */}
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#6d28d9', marginBottom: '10px' }}>📋 PREVIOUS ANNOUNCEMENTS</div>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {announcements.map((a, i) => (
                                    <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'white', border: a.pinned ? '2px solid #e9d5ff' : '1px solid #f3e8ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {a.pinned && <span style={{ fontSize: '14px' }}>📌</span>}
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e1b4b' }}>{a.text}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{a.date}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e9d5ff', background: 'white', color: '#6d28d9', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>{a.pinned ? 'Unpin' : 'Pin'}</button>
                                            <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Player DMs */}
                    {ownerTab === 'dms' && (
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
                            {/* Conversation List */}
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', overflow: 'hidden', height: '520px', overflowY: 'auto' as const }}>
                                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3e8ff', fontSize: '13px', fontWeight: 700, color: '#6d28d9' }}>✉️ DIRECT MESSAGES</div>
                                {dmConversations.map((d, i) => (
                                    <div key={i} onClick={() => setSelectedDm(i)} style={{
                                        padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f3e8ff',
                                        background: selectedDm === i ? '#faf5ff' : 'white',
                                        borderLeft: selectedDm === i ? '3px solid #7c3aed' : '3px solid transparent',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: d.online ? '#22c55e' : '#d4d4d8' }} />
                                                <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{d.player}</span>
                                            </div>
                                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>{d.time}</span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{d.role}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                            <span style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '180px' }}>{d.lastMsg}</span>
                                            {d.unread > 0 && <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#7c3aed', color: 'white', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d.unread}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chat Area */}
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', height: '520px', display: 'flex', flexDirection: 'column' as const }}>
                                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3e8ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dmConversations[selectedDm]?.online ? '#22c55e' : '#d4d4d8' }} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b' }}>{dmConversations[selectedDm]?.player}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{dmConversations[selectedDm]?.role}</div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ textAlign: 'center' as const, color: '#94a3b8' }}>
                                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                                        <div style={{ fontSize: '13px' }}>Start a conversation with {dmConversations[selectedDm]?.player}</div>
                                    </div>
                                </div>
                                <div style={{ padding: '12px 16px', borderTop: '1px solid #f3e8ff', display: 'flex', gap: '8px' }}>
                                    <input value={dmInput} onChange={(e) => setDmInput(e.target.value)} placeholder={`Message ${dmConversations[selectedDm]?.player || 'Player'}...`} style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '13px', outline: 'none' }} />
                                    <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Send</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Staff Chat */}
                    {ownerTab === 'staff' && (
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '16px' }}>
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, height: '520px' }}>
                                <div style={{ padding: '14px 20px', background: '#faf5ff', borderBottom: '1px solid #f3e8ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '18px' }}>🏢</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b' }}>Staff Channel</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>Coach, Physio, Analyst, Trainer</div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto' as const, padding: '16px 20px' }}>
                                    {staffMessages.map((m, i) => (
                                        <div key={i} style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                                            <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: '12px', background: '#faf5ff' }}>
                                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', marginBottom: '2px' }}>{m.sender}</div>
                                                <div style={{ fontSize: '13px', color: '#1e1b4b' }}>{m.text}</div>
                                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{m.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '12px 16px', borderTop: '1px solid #f3e8ff', display: 'flex', gap: '8px' }}>
                                    <input value={staffInput} onChange={(e) => setStaffInput(e.target.value)} placeholder="Message staff..." style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '13px', outline: 'none' }} />
                                    <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Send</button>
                                </div>
                            </div>

                            {/* Staff Members */}
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', padding: '16px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '12px' }}>STAFF ({staffMembers.length})</div>
                                {staffMembers.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: i < staffMembers.length - 1 ? '1px solid #f3e8ff' : 'none' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.online ? '#22c55e' : '#d4d4d8' }} />
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e1b4b' }}>{s.name}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b' }}>{s.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ═══════ PLAYER VIEW ═══════ */
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #ede9fe, #faf5ff, #f8fafc)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', padding: '14px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>🌐</span>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: '18px' }}>Game Sphere</span>
                    </div>
                    <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Dashboard</Link>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e1b4b', marginBottom: '20px' }}>{selectedSport ? `${sportLabel} Messages` : '💬 Messages'}</h1>

                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px' }}>
                    {/* Sidebar */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3e8ff', fontSize: '13px', fontWeight: 700, color: '#6d28d9' }}>CONVERSATIONS</div>
                        {playerConversations.map((c, i) => (
                            <div key={i} onClick={() => setPlayerChat(i)} style={{
                                padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #f3e8ff',
                                background: playerChat === i ? '#faf5ff' : 'white',
                                borderLeft: playerChat === i ? '3px solid #7c3aed' : '3px solid transparent',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '18px' }}>{c.icon}</span>
                                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b' }}>{c.name}</span>
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{c.time}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '220px' }}>{c.lastMsg}</span>
                                    {c.unread > 0 && <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#7c3aed', color: 'white', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unread}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Area */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3e8ff', display: 'flex', flexDirection: 'column' as const, height: '480px' }}>
                        {/* Header */}
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3e8ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '22px' }}>{playerConversations[playerChat]?.icon}</span>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b' }}>{playerConversations[playerChat]?.name}</div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto' as const, padding: '16px 20px' }}>
                            {playerChat === 0 ? (
                                teamMessages.map((m, i) => (
                                    <div key={i} style={{ marginBottom: '12px' }}>
                                        <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: '12px', background: '#faf5ff' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', marginBottom: '2px' }}>{m.sender}</div>
                                            <div style={{ fontSize: '13px', color: '#1e1b4b' }}>{m.text}</div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{m.time}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <div style={{ textAlign: 'center' as const, color: '#94a3b8' }}>
                                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                                        <div style={{ fontSize: '13px' }}>Start chatting with {playerConversations[playerChat]?.name}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3e8ff', display: 'flex', gap: '8px' }}>
                            <input value={msgInput} onChange={(e) => setMsgInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '13px', outline: 'none' }} />
                            <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

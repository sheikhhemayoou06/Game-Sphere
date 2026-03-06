'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import PageNavbar from '@/components/PageNavbar';
import { Search, X, Send, ArrowLeft } from 'lucide-react';

interface Conversation {
    id: string;
    name: string;
    avatar: string;
    role: 'player' | 'team' | 'organizer';
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
}

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'them';
    time: string;
}

export default function MessagesPage() {
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [msgInput, setMsgInput] = useState('');

    /* Placeholder conversations — will be populated from API */
    const conversations: Conversation[] = [];

    const filtered = conversations.filter(c => {
        if (!search.trim()) return true;
        return c.name.toLowerCase().includes(search.toLowerCase());
    });

    /* Placeholder messages for active chat */
    const messages: Message[] = [];

    const activeConv = conversations.find(c => c.id === activeChat);
    const isOrganizer = activeConv?.role === 'organizer';

    const roleLabel = (role: string) => {
        switch (role) {
            case 'player': return 'Player';
            case 'team': return 'Team';
            case 'organizer': return 'Organiser';
            default: return '';
        }
    };

    const roleBadgeColor = (role: string) => {
        switch (role) {
            case 'player': return { bg: '#ede9fe', color: '#6d28d9' };
            case 'team': return { bg: '#dbeafe', color: '#2563eb' };
            case 'organizer': return { bg: '#fef3c7', color: '#92400e' };
            default: return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    /* ── Chat View (when a conversation is selected) ── */
    if (activeChat && activeConv) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <div style={{
                    background: 'white', borderBottom: '1px solid #e2e8f0',
                    padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '14px',
                    position: 'sticky', top: 0, zIndex: 50,
                }}>
                    <button onClick={() => setActiveChat(null)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                        display: 'flex', alignItems: 'center',
                    }}>
                        <ArrowLeft size={20} color="#4f46e5" />
                    </button>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 800, fontSize: '16px',
                        }}>
                            {activeConv.avatar}
                        </div>
                        <div style={{
                            position: 'absolute', bottom: 0, right: 0,
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: activeConv.online ? '#22c55e' : '#d4d4d8',
                            border: '2px solid white',
                        }}></div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b' }}>{activeConv.name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {activeConv.online ? 'Active now' : 'Offline'}
                            {isOrganizer && ' • Organiser (view only)'}
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {messages.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                                <div style={{ fontSize: '15px', fontWeight: 600 }}>No messages yet</div>
                                <div style={{ fontSize: '13px', marginTop: '4px' }}>
                                    {isOrganizer
                                        ? 'Messages from the organiser will appear here. You cannot reply.'
                                        : `Send a message to start chatting with ${activeConv.name}`}
                                </div>
                            </div>
                        </div>
                    ) : (
                        messages.map(m => (
                            <div key={m.id} style={{
                                display: 'flex',
                                justifyContent: m.sender === 'me' ? 'flex-end' : 'flex-start',
                            }}>
                                <div style={{
                                    maxWidth: '70%', padding: '10px 14px', borderRadius: '18px',
                                    borderBottomRightRadius: m.sender === 'me' ? '4px' : '18px',
                                    borderBottomLeftRadius: m.sender === 'them' ? '4px' : '18px',
                                    background: m.sender === 'me'
                                        ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                                        : '#f1f5f9',
                                    color: m.sender === 'me' ? 'white' : '#1e1b4b',
                                }}>
                                    <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{m.text}</div>
                                    <div style={{
                                        fontSize: '10px', marginTop: '4px',
                                        textAlign: 'right',
                                        opacity: 0.6,
                                    }}>{m.time}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Message Input — hidden for organiser chats */}
                {!isOrganizer ? (
                    <div style={{
                        padding: '12px 20px', background: 'white',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        position: 'sticky', bottom: 0,
                    }}>
                        <input
                            type="text"
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            placeholder="Message…"
                            onKeyDown={(e) => e.key === 'Enter' && msgInput.trim() && setMsgInput('')}
                            style={{
                                flex: 1, padding: '12px 16px', borderRadius: '24px',
                                border: '1px solid #e2e8f0', background: '#f8fafc',
                                fontSize: '14px', outline: 'none',
                            }}
                        />
                        <button
                            disabled={!msgInput.trim()}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: msgInput.trim() ? '#4f46e5' : '#e2e8f0',
                                border: 'none', cursor: msgInput.trim() ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.2s',
                            }}
                        >
                            <Send size={16} color={msgInput.trim() ? 'white' : '#94a3b8'} />
                        </button>
                    </div>
                ) : (
                    <div style={{
                        padding: '14px 20px', background: '#fffbeb',
                        borderTop: '1px solid #fde68a', textAlign: 'center',
                        fontSize: '13px', color: '#92400e', fontWeight: 600,
                    }}>
                        🔒 You can only receive messages from organisers
                    </div>
                )}
            </div>
        );
    }

    /* ── Conversation List View ── */
    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageNavbar title="Messages" />

            {/* Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 20px 12px' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '560px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search players, teams, organisers…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '14px 44px 14px 46px', borderRadius: '14px',
                            border: '1.5px solid #e2e8f0', background: '#f1f5f9',
                            fontSize: '15px', fontWeight: 600, color: '#0f172a', outline: 'none',
                        }}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{
                            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                            background: '#e2e8f0', border: 'none', borderRadius: '50%',
                            width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                        }}>
                            <X size={14} color="#64748b" />
                        </button>
                    )}
                </div>
            </div>

            {/* Conversations */}
            <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 20px', paddingBottom: '80px' }}>
                {filtered.length === 0 ? (
                    <div style={{
                        padding: '60px 20px', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b' }}>
                            {search ? 'No chats found' : 'No conversations yet'}
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
                            {search
                                ? `No results for "${search}"`
                                : 'When you connect with players, teams, or receive messages from organisers, they'll appear here.'}
                        </p>
                    </div>
                ) : (
                    filtered.map(conv => {
                        const badge = roleBadgeColor(conv.role);
                        return (
                            <div
                                key={conv.id}
                                onClick={() => setActiveChat(conv.id)}
                                style={{
                                    padding: '14px 16px', borderBottom: '1px solid #f1f5f9',
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    cursor: 'pointer', transition: 'background 0.15s',
                                    background: 'white',
                                }}
                            >
                                {/* Avatar */}
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <div style={{
                                        width: '52px', height: '52px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 800, fontSize: '18px',
                                    }}>
                                        {conv.avatar}
                                    </div>
                                    <div style={{
                                        position: 'absolute', bottom: '1px', right: '1px',
                                        width: '12px', height: '12px', borderRadius: '50%',
                                        background: conv.online ? '#22c55e' : '#d4d4d8',
                                        border: '2px solid white',
                                    }}></div>
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b' }}>{conv.name}</span>
                                        <span style={{
                                            padding: '1px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                                            background: badge.bg, color: badge.color,
                                        }}>{roleLabel(conv.role)}</span>
                                    </div>
                                    <div style={{
                                        fontSize: '13px', color: '#94a3b8',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {conv.lastMessage}
                                    </div>
                                </div>

                                {/* Time & Unread */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{conv.time}</span>
                                    {conv.unread > 0 && (
                                        <span style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            background: '#4f46e5', color: 'white',
                                            fontSize: '11px', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>{conv.unread}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

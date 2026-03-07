import React from 'react';

export default function ProfessionalLoader() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            gap: '24px'
        }}>
            <style>{`
                @keyframes pro-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pro-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.95); }
                }
            `}</style>

            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                {/* Clean background track */}
                <div style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: '3px solid #f1f5f9'
                }} />

                {/* Premium rotating gradient indicator */}
                <div style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: '#0ea5e9',
                    borderRightColor: '#6366f1',
                    animation: 'pro-spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite'
                }} />

                {/* Minimalist central anchor processing dot */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'pro-pulse 2s ease-in-out infinite'
                }}>
                    <div style={{
                        width: '12px', height: '12px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                    }} />
                </div>
            </div>

            <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#64748b',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                animation: 'pro-pulse 2s ease-in-out infinite'
            }}>
                Processing
            </div>
        </div>
    );
}

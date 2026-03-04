import React from 'react';

export default function RunningAthleteLoader() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '40px'
        }}>
            <style>{`
        @keyframes custom-run {
          0% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(10deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-8px) rotate(-10deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .athlete-run-anim {
          animation: custom-run 0.6s ease-in-out infinite;
          color: #4f46e5;
          filter: drop-shadow(0px 4px 6px rgba(79, 70, 229, 0.4));
        }
      `}</style>

            <div className="athlete-run-anim">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="16" cy="5" r="2" />
                    <path d="M14.5 7 L12 12" />
                    <path d="M12 12 L8 9 L6 10" />
                    <path d="M12 12 L15 15 L19 14" />
                    <path d="M12 12 L11 17 L15 21" />
                    <path d="M11 17 L7 16 L5 18" />
                    <path d="M2 13 L5 13" strokeDasharray="2 2" strokeOpacity="0.5" />
                    <path d="M3 17 L6 17" strokeDasharray="1 2" strokeOpacity="0.5" />
                    <path d="M4 9 L6 9" strokeDasharray="2 3" strokeOpacity="0.5" />
                </svg>
            </div>

            <div style={{
                fontSize: '16px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '1px'
            }}>
                LOADING...
            </div>
        </div>
    );
}

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
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
                    {/* Speed lines */}
                    <path d="M 30 22 L 20 22" />
                    <path d="M 32 36 L 8 36" />
                    <path d="M 36 50 L 20 50" />

                    {/* Head */}
                    <circle cx="78" cy="18" r="9" fill="currentColor" stroke="none" />

                    {/* Back Arm (L-shape pointing left-down) */}
                    <path d="M 64 30 L 42 30 L 50 48" />

                    {/* Torso & Front Leg */}
                    <path d="M 64 30 L 46 56 L 72 76 L 42 84" />

                    {/* Front Arm (L-shape pointing down-right) */}
                    <path d="M 64 30 L 68 54 L 88 52" />

                    {/* Back Leg (straight down-left) */}
                    <path d="M 46 56 L 12 88" />
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

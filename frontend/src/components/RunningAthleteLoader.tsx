import React from 'react';
import { PersonStanding } from 'lucide-react';

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
        }
      `}</style>

            <div className="athlete-run-anim">
                <PersonStanding size={48} />
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

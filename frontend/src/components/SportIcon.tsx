'use client';

import React from 'react';

const sportSvgs: Record<string, (size: number, color: string) => React.ReactNode> = {
    Cricket: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cricket bat */}
            <rect x="18" y="8" width="8" height="32" rx="3" transform="rotate(15 22 24)" fill={c} opacity="0.85" />
            <rect x="20" y="36" width="5" height="12" rx="2" transform="rotate(15 22 42)" fill={c} opacity="0.6" />
            {/* Cricket ball */}
            <circle cx="42" cy="42" r="10" fill={c} opacity="0.9" />
            <path d="M36 36 C39 42, 45 42, 48 48" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M34 40 C37 44, 40 44, 44 50" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="2 2" />
        </svg>
    ),
    Football: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="22" stroke={c} strokeWidth="3" fill="none" />
            {/* Pentagon pattern */}
            <polygon points="32,16 40,24 37,34 27,34 24,24" fill={c} opacity="0.8" />
            <line x1="32" y1="16" x2="32" y2="10" stroke={c} strokeWidth="2" />
            <line x1="40" y1="24" x2="48" y2="20" stroke={c} strokeWidth="2" />
            <line x1="37" y1="34" x2="46" y2="40" stroke={c} strokeWidth="2" />
            <line x1="27" y1="34" x2="18" y2="40" stroke={c} strokeWidth="2" />
            <line x1="24" y1="24" x2="16" y2="20" stroke={c} strokeWidth="2" />
        </svg>
    ),
    Basketball: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="22" stroke={c} strokeWidth="3" fill="none" />
            <line x1="10" y1="32" x2="54" y2="32" stroke={c} strokeWidth="2" />
            <line x1="32" y1="10" x2="32" y2="54" stroke={c} strokeWidth="2" />
            <path d="M16 14 C28 22, 28 42, 16 50" stroke={c} strokeWidth="2" fill="none" />
            <path d="M48 14 C36 22, 36 42, 48 50" stroke={c} strokeWidth="2" fill="none" />
        </svg>
    ),
    Kabaddi: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Dynamic player figure */}
            <circle cx="28" cy="14" r="6" fill={c} opacity="0.9" />
            <path d="M28 20 L28 34" stroke={c} strokeWidth="3" strokeLinecap="round" />
            <path d="M28 24 L18 30" stroke={c} strokeWidth="3" strokeLinecap="round" />
            <path d="M28 24 L40 18" stroke={c} strokeWidth="3" strokeLinecap="round" />
            <path d="M28 34 L20 48" stroke={c} strokeWidth="3" strokeLinecap="round" />
            <path d="M28 34 L38 46" stroke={c} strokeWidth="3" strokeLinecap="round" />
            {/* Second player */}
            <circle cx="46" cy="20" r="5" fill={c} opacity="0.5" />
            <path d="M46 25 L46 36" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
            <path d="M46 36 L40 48" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
            <path d="M46 36 L52 48" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        </svg>
    ),
    Volleyball: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="22" stroke={c} strokeWidth="3" fill="none" />
            <path d="M32 10 C26 22, 22 32, 32 54" stroke={c} strokeWidth="2" fill="none" />
            <path d="M14 20 C26 26, 38 26, 50 20" stroke={c} strokeWidth="2" fill="none" />
            <path d="M14 44 C26 38, 38 38, 50 44" stroke={c} strokeWidth="2" fill="none" />
        </svg>
    ),
    Badminton: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Racket */}
            <ellipse cx="26" cy="20" rx="12" ry="16" stroke={c} strokeWidth="2.5" fill="none" transform="rotate(-20 26 20)" />
            <line x1="26" y1="34" x2="30" y2="54" stroke={c} strokeWidth="3" strokeLinecap="round" />
            {/* Grid lines */}
            <line x1="20" y1="12" x2="32" y2="12" stroke={c} strokeWidth="1" opacity="0.4" />
            <line x1="18" y1="18" x2="34" y2="18" stroke={c} strokeWidth="1" opacity="0.4" />
            <line x1="18" y1="24" x2="34" y2="24" stroke={c} strokeWidth="1" opacity="0.4" />
            {/* Shuttlecock */}
            <circle cx="46" cy="16" r="4" fill={c} opacity="0.8" />
            <path d="M46 20 L42 28" stroke={c} strokeWidth="1.5" opacity="0.6" />
            <path d="M46 20 L46 28" stroke={c} strokeWidth="1.5" opacity="0.6" />
            <path d="M46 20 L50 28" stroke={c} strokeWidth="1.5" opacity="0.6" />
        </svg>
    ),
    Hockey: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Hockey stick */}
            <path d="M16 10 L36 46" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M36 46 L48 50" stroke={c} strokeWidth="4" strokeLinecap="round" />
            {/* Ball */}
            <circle cx="44" cy="38" r="6" fill={c} opacity="0.7" />
        </svg>
    ),
    Tennis: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Racket head */}
            <ellipse cx="28" cy="22" rx="14" ry="18" stroke={c} strokeWidth="2.5" fill="none" />
            {/* Handle */}
            <line x1="28" y1="38" x2="32" y2="56" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
            {/* Cross strings */}
            <line x1="18" y1="16" x2="38" y2="16" stroke={c} strokeWidth="1" opacity="0.35" />
            <line x1="16" y1="22" x2="40" y2="22" stroke={c} strokeWidth="1" opacity="0.35" />
            <line x1="18" y1="28" x2="38" y2="28" stroke={c} strokeWidth="1" opacity="0.35" />
            <line x1="24" y1="6" x2="24" y2="38" stroke={c} strokeWidth="1" opacity="0.35" />
            <line x1="32" y1="6" x2="32" y2="38" stroke={c} strokeWidth="1" opacity="0.35" />
            {/* Ball */}
            <circle cx="48" cy="14" r="6" fill={c} opacity="0.75" />
            <path d="M44 10 C46 14, 50 14, 52 10" stroke="white" strokeWidth="1.2" fill="none" />
        </svg>
    ),
    Athletics: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Running figure */}
            <circle cx="34" cy="12" r="6" fill={c} opacity="0.9" />
            <path d="M34 18 L32 32" stroke={c} strokeWidth="3" strokeLinecap="round" />
            <path d="M32 26 L22 20" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 26 L44 22" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 32 L22 46" stroke={c} strokeWidth="3" strokeLinecap="round" />
            <path d="M32 32 L44 42" stroke={c} strokeWidth="3" strokeLinecap="round" />
            <path d="M22 46 L16 50" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M44 42 L50 50" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
            {/* Track line */}
            <path d="M10 54 L54 54" stroke={c} strokeWidth="2" opacity="0.3" strokeDasharray="4 3" />
        </svg>
    ),
};

interface SportIconProps {
    sport: string;
    size?: number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function SportIcon({ sport, size = 32, color = 'currentColor', className, style }: SportIconProps) {
    const renderer = sportSvgs[sport];
    if (!renderer) {
        return <span style={{ fontSize: size * 0.75, lineHeight: 1, display: 'inline-flex', ...style }} className={className}>🏅</span>;
    }
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, ...style }} className={className}>
            {renderer(size, color)}
        </span>
    );
}

/** String-based icon lookup (kept for backward compatibility in text-only contexts) */
export const sportEmojis: Record<string, string> = {
    Cricket: '',
    Football: '',
    Basketball: '',
    Tennis: '',
    Kabaddi: '',
    Badminton: '',
    Hockey: '',
    Athletics: '',
    Volleyball: '',
    TableTennis: '',
    Swimming: '',
    eSports: '',
};

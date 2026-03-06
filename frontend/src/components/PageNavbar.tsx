'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface PageNavbarProps {
    title: string;
    emoji?: string;
    backHref?: string;
}

export default function PageNavbar({ title, emoji, backHref }: PageNavbarProps) {
    const router = useRouter();

    return (
        <div style={{
            background: 'white', borderBottom: '1px solid #e2e8f0',
            padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 50,
        }}>
            {backHref ? (
                <Link href={backHref} style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowLeft size={16} /> Back
                </Link>
            ) : (
                <button onClick={() => router.back()} style={{ color: '#4f46e5', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={16} /> Back
                </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {emoji && <span style={{ fontSize: '22px' }}>{emoji}</span>}
                <span style={{ fontSize: '17px', fontWeight: 800, background: 'linear-gradient(135deg, #4f46e5, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>
                    {title}
                </span>
            </div>
            <div style={{ width: '60px' }}></div>
        </div>
    );
}

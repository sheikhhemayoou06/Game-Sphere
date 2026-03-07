'use client';

import { Suspense, useState } from 'react';
import { useSportStore } from '@/lib/store';
import PageNavbar from '@/components/PageNavbar';
import { Check, ShieldCheck, Zap, Crown, CheckCircle2, TrendingUp, Lock } from 'lucide-react';

export default function SubscriptionPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                <PageNavbar title="Subscription & Billing" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            </div>
        }>
            <SubscriptionContent />
        </Suspense>
    );
}

const PRICING_PLANS = [
    {
        id: 'base',
        name: 'Base Access',
        price: '₹50',
        period: '/month',
        description: 'Required access for Players, Organizers, Teams, and Sponsors.',
        features: [
            '1 Month Free Trial Included',
            'Full Platform Access',
            'Dashboard & Statistics',
            'Basic Support',
        ],
        icon: <CheckCircle2 size={24} />,
        color: '#3b82f6', // Blue
        primary: false
    },
    {
        id: 'pro',
        name: 'Pro Mode',
        price: '₹150',
        period: '/month',
        description: 'Advanced features for serious athletes and growing teams.',
        features: [
            'Everything in Base',
            'Advanced Performance Analytics',
            'Priority Registration in Tournaments',
            'Custom Team Logos & Banners',
        ],
        icon: <Zap size={24} />,
        color: '#8b5cf6', // Violet
        primary: true,
        badge: 'MOST POPULAR'
    },
    {
        id: 'elite',
        name: 'Elite Mode',
        price: '₹500',
        period: '/month',
        description: 'The ultimate package for academy owners & global sponsors.',
        features: [
            'Everything in Pro',
            'Global Scout Exposure',
            '1-on-1 Dedicated Support Manager',
            'Zero Platform Transaction Fees',
        ],
        icon: <Crown size={24} />,
        color: '#1e293b', // Slate
        primary: false
    }
];

function SubscriptionContent() {
    const { selectedSport } = useSportStore();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    // UI Theme extracted from sport
    const accentColor = selectedSport?.accentColor || '#3b82f6';

    const handleSubscribe = (planId: string) => {
        setIsProcessing(planId);
        setTimeout(() => {
            alert(`Subscription to ${planId.toUpperCase()} Mode confirmed!`);
            setIsProcessing(null);
        }, 1500);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '80px', fontFamily: 'inherit' }}>
            <PageNavbar title="Subscription & Billing" />

            {/* Hero Section */}
            <div style={{ background: `linear-gradient(135deg, ${accentColor}, #0f172a)`, padding: '40px 20px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>Unlock Your Potential</h1>
                    <p style={{ fontSize: '15px', opacity: 0.9, maxWidth: '400px', margin: '0 auto', marginBottom: '24px', lineHeight: 1.5 }}>
                        Join thousands of athletes and organizers. Start your journey with a <strong style={{ color: '#fcd34d' }}>1-Month Free Trial</strong> across our platform.
                    </p>

                    {/* Billing Toggle */}
                    <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.1)', borderRadius: '30px', padding: '4px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            style={{
                                padding: '8px 24px', borderRadius: '26px', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                background: billingCycle === 'monthly' ? 'white' : 'transparent',
                                color: billingCycle === 'monthly' ? '#0f172a' : 'white'
                            }}>
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            style={{
                                padding: '8px 24px', borderRadius: '26px', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                background: billingCycle === 'yearly' ? 'white' : 'transparent',
                                color: billingCycle === 'yearly' ? '#0f172a' : 'white'
                            }}>
                            Yearly (-20%)
                        </button>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div style={{ padding: '32px 16px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Responsive CSS Grid for Plans */}
                <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'flex-start' }}>
                    {PRICING_PLANS.map((plan) => (
                        <div key={plan.id} style={{
                            background: 'white', borderRadius: '24px', padding: '32px', position: 'relative',
                            border: `2px solid ${plan.primary ? plan.color : '#e2e8f0'}`,
                            boxShadow: plan.primary ? `0 20px 40px ${plan.color}20` : '0 10px 25px rgba(0,0,0,0.05)',
                            transform: plan.primary ? 'translateY(-10px)' : 'none',
                            transition: 'transform 0.3s, box-shadow 0.3s'
                        }}>
                            {plan.badge && (
                                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 900, letterSpacing: '1px' }}>
                                    {plan.badge}
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ color: plan.color, background: `${plan.color}15`, padding: '10px', borderRadius: '12px' }}>
                                    {plan.icon}
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>{plan.name}</h3>
                            </div>

                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
                                {plan.description}
                            </p>

                            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '36px', fontWeight: 900, color: '#1e293b', letterSpacing: '-1px' }}>
                                    {billingCycle === 'yearly' && plan.id === 'base' ? '₹480' :
                                        billingCycle === 'yearly' && plan.id === 'pro' ? '₹1440' :
                                            billingCycle === 'yearly' && plan.id === 'elite' ? '₹4800' : plan.price}
                                </span>
                                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                                    {billingCycle === 'yearly' ? '/year' : plan.period}
                                </span>
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={isProcessing !== null}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                                    background: plan.primary ? plan.color : '#f1f5f9',
                                    color: plan.primary ? 'white' : '#334155',
                                    fontWeight: 800, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s',
                                    marginBottom: '32px'
                                }}>
                                {isProcessing === plan.id ? 'Processing...' : plan.id === 'base' ? 'Start Free Trial' : 'Upgrade Plan'}
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {plan.features.map((feature, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <Check size={18} color={plan.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <hr style={{ border: 'none', height: '1px', background: '#e2e8f0', margin: '16px 0' }} />

                {/* Verified Profile Add-on Block */}
                <div style={{ background: 'linear-gradient(135deg, white, #f8fafc)', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                        <ShieldCheck size={200} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <ShieldCheck size={24} color="#0ea5e9" fill="rgba(14, 165, 233, 0.2)" />
                                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>Verified Add-on</h3>
                            </div>
                            <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '500px', lineHeight: 1.6 }}>
                                Stand out from the crowd. Get the official verified blue tick displayed permanently next to your name and profile globally.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckCircle2 color="#10b981" size={16} /><span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Trust factor</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckCircle2 color="#10b981" size={16} /><span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Profile Priority</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', minWidth: '220px', textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Annual Pass</div>
                            <div style={{ fontSize: '36px', fontWeight: 900, color: '#0ea5e9', marginBottom: '16px', letterSpacing: '-1px' }}>₹100<span style={{ fontSize: '16px', color: '#94a3b8' }}>/yr</span></div>
                            <button
                                onClick={() => handleSubscribe('verified-badge')}
                                disabled={isProcessing !== null}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#0ea5e9', color: 'white',
                                    fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)', transition: 'transform 0.2s'
                                }}>
                                {isProcessing === 'verified-badge' ? 'Processing...' : 'Get Verified'}
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '24px', color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Lock size={14} /> Secure end-to-end 256-bit AES encryption
                </div>

            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .pricing-grid > div:nth-child(2) {
                        transform: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

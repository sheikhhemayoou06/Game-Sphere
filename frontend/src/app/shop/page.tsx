'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useSportStore } from '@/lib/store';
import PageNavbar from '@/components/PageNavbar';
import SportIcon from '@/components/SportIcon';
import { Search, ShoppingCart, Star, Filter, Heart, ChevronRight, Tags, Zap, Shield, TrendingUp } from 'lucide-react';
import RunningAthleteLoader from '@/components/RunningAthleteLoader';

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                <PageNavbar title="Shop" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RunningAthleteLoader />
                </div>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}

// Extended sport color palette for ecommerce gradients
const getSportTheme = (sportName: string) => {
    const defaultColor = '#0ea5e9';
    switch (sportName.toLowerCase()) {
        case 'cricket': return '#10b981';
        case 'football': return '#ef4444';
        case 'basketball': return '#f59e0b';
        case 'tennis': return '#84cc16';
        case 'hockey': return '#3b82f6';
        default: return defaultColor;
    }
};

const CATEGORIES = ['All', 'Equipment', 'Apparel', 'Footwear', 'Nutrition', 'Services', 'Memorabilia'];

interface Product {
    id: string;
    title: string;
    brand: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    imageIcon: React.ReactNode;
    sport: string;
    category: string;
    tags?: string[];
}

const generateMockProducts = (sportName: string): Product[] => {
    const isCricket = sportName.toLowerCase() === 'cricket';
    const isFootball = sportName.toLowerCase() === 'football';
    const isBasketball = sportName.toLowerCase() === 'basketball';

    return [
        {
            id: 'p1',
            title: isCricket ? 'Pro Series English Willow Bat' : isFootball ? 'Elite Match Ball 2026' : isBasketball ? 'GripMax Indoor Basketball' : 'Pro Competition Gear',
            brand: 'GameSphere Elite',
            price: 12999,
            originalPrice: 15499,
            rating: 4.8,
            reviews: 1240,
            imageIcon: <Zap size={48} color="white" />,
            sport: sportName,
            category: 'Equipment',
            tags: ['Best Seller', 'Pro']
        },
        {
            id: 'p2',
            title: isCricket ? 'National Team Jersey 2026' : isFootball ? 'Home Kit Replica' : isBasketball ? 'Slam Dunk Performance Jersey' : 'Official Team Jersey',
            brand: 'AeroKnit',
            price: 2499,
            rating: 4.6,
            reviews: 890,
            imageIcon: <Tags size={48} color="white" />,
            sport: sportName,
            category: 'Apparel',
        },
        {
            id: 'p3',
            title: 'UltraSpike Match Cleats',
            brand: 'Velocity',
            price: 5999,
            originalPrice: 7500,
            rating: 4.9,
            reviews: 350,
            imageIcon: <TrendingUp size={48} color="white" />,
            sport: sportName,
            category: 'Footwear',
            tags: ['New']
        },
        {
            id: 'p4',
            title: 'Hydration+ Isotonic Powder 1kg',
            brand: 'NutriSport',
            price: 1200,
            rating: 4.5,
            reviews: 4200,
            imageIcon: <Heart size={48} color="white" />,
            sport: 'All',
            category: 'Nutrition',
        },
        {
            id: 'p5',
            title: 'Premium Protective Gear Set',
            brand: 'ShieldMax',
            price: 3500,
            rating: 4.7,
            reviews: 620,
            imageIcon: <Shield size={48} color="white" />,
            sport: sportName,
            category: 'Equipment',
        },
        {
            id: 'p6',
            title: '1-on-1 Virtual Coaching Session',
            brand: 'GameSphere Mentors',
            price: 1500,
            rating: 5.0,
            reviews: 120,
            imageIcon: <Star size={48} color="white" />,
            sport: sportName,
            category: 'Services',
        }
    ];
};

function ShopContent() {
    const { selectedSport } = useSportStore();
    const sportName = selectedSport?.name || 'All Sports';
    const themeColor = getSportTheme(sportName);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [cartCount, setCartCount] = useState(0);

    const allProducts = useMemo(() => generateMockProducts(sportName), [sportName]);

    // Filtering
    const filteredProducts = useMemo(() => {
        let items = allProducts;
        if (activeCategory !== 'All') {
            items = items.filter(p => p.category === activeCategory);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter(p => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        }
        return items;
    }, [allProducts, activeCategory, searchQuery]);

    const addToCart = () => setCartCount(c => c + 1);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '90px' }}>
            {/* Custom Navbar Injection for Shop (Overriding right content area for Cart) */}
            <div style={{ position: 'sticky', top: 0, zIndex: 60, background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: themeColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShoppingCart size={22} fill={themeColor} color={themeColor} /> GameSphere Market
                        </span>
                    </div>

                    <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#334155' }}>
                        <ShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute', top: '0', right: '0', background: themeColor, color: 'white',
                                fontSize: '11px', fontWeight: 800, width: '18px', height: '18px', borderRadius: '9px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white'
                            }}>
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Hero Deal Banner */}
            <div style={{ background: `linear-gradient(135deg, ${themeColor}, #0f172a)`, padding: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px', display: 'inline-block' }}>
                        {sportName} Special
                    </span>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }}>Up to 40% Off<br />Pro Gear!</h1>
                    <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px', maxWidth: '280px' }}>Equip yourself like a champion. Verified quality directly from top global brands.</p>
                    <button style={{ background: 'white', color: themeColor, border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                        Shop the Sale
                    </button>
                </div>
                {/* Background decoration */}
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.2, transform: 'rotate(-15deg)' }}>
                    <SportIcon sport={sportName} size={150} color="white" />
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div style={{ padding: '16px', background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '56px', zIndex: 50 }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search equipment, jerseys..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1px solid #cbd5e1',
                                fontSize: '15px', outline: 'none', background: '#f8fafc', fontWeight: 500
                            }}
                        />
                    </div>
                    <button style={{ padding: '0 16px', border: '1px solid #cbd5e1', borderRadius: '12px', background: 'white', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Filter size={20} />
                    </button>
                </div>

                {/* Categories */}
                <div className="hide-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '8px 16px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
                                fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                background: activeCategory === cat ? themeColor : '#f1f5f9',
                                color: activeCategory === cat ? 'white' : '#64748b',
                                boxShadow: activeCategory === cat ? `0 4px 10px ${themeColor}40` : 'none'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div style={{ padding: '20px 16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>
                    {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'All' ? 'Recommended for You' : `${activeCategory}`}
                </h2>

                {filteredProducts.length === 0 ? (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
                        <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>No products found</h3>
                        <p style={{ fontSize: '14px' }}>Try exploring other categories or clearing your search.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                        {filteredProducts.map(product => (
                            <div key={product.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                                {/* Image Placeholder Area */}
                                <div style={{ height: '140px', background: `linear-gradient(135deg, ${themeColor}20, #f8fafc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

                                    {/* Action Top Bar */}
                                    <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {product.tags?.map(tag => (
                                                <span key={tag} style={{ background: tag === 'Best Seller' ? '#f59e0b' : themeColor, color: 'white', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <button style={{ background: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                            <Heart size={14} color="#94a3b8" />
                                        </button>
                                    </div>

                                    {/* MOCK IMAGE via generic icon */}
                                    <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 16px ${themeColor}40` }}>
                                        {product.imageIcon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{product.brand}</span>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', lineHeight: 1.3, flex: 1 }}>{product.title}</h3>

                                    {/* Rating */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{product.rating}</span>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>({product.reviews})</span>
                                    </div>

                                    {/* Price & Add */}
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                        <div>
                                            {product.originalPrice && (
                                                <div style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>₹{product.originalPrice.toLocaleString()}</div>
                                            )}
                                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>₹{product.price.toLocaleString()}</div>
                                        </div>
                                        <button onClick={addToCart} style={{ background: '#f1f5f9', border: 'border: 1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeColor, cursor: 'pointer', transition: 'background 0.2s' }} className="hover-active">
                                            <ShoppingCart size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hover-active:active {
                    transform: scale(0.95);
                    background: #e2e8f0 !important;
                }
            `}</style>
        </div>
    );
}

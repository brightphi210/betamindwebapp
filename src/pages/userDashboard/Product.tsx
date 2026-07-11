import React, { useState } from 'react';
import {
    FiArrowLeft,
    FiBookOpen,
    FiCheckCircle,
    FiDollarSign,
    FiLayers,
    FiPlayCircle,
    FiStar
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import Button from '../../component/ui/Button';
import { PRODUCTS, type DigitalProduct } from './Explore';

// ─── Not found state ─────────────────────────────────────────────────────────
const ProductNotFound: React.FC = () => (
    <div
        className="w-full min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{
            background:
                'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
        }}
    >
        <h1 className="text-white text-2xl font-black mb-2">Product Not Found</h1>
        <p className="text-white/40 text-sm mb-8">
            We couldn't find the item you're looking for.
        </p>
        <Link
            to="/dashboard/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-transform hover:scale-[1.02]"
            style={{ background: '#a6ff00' }}
        >
            <FiArrowLeft size={16} />
            Back to Explore
        </Link>
    </div>
);

// ─── Stat pill (mirrors "Pricing" / "Content" boxes) ────────────────────────
const StatPill: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
    icon,
    label,
    value,
}) => (
    <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(166,255,0,0.1)', color: '#a6ff00' }}
        >
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{value}</p>
            <p className="text-white/40 text-xs">{label}</p>
        </div>
    </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────
const Product: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const product: DigitalProduct | undefined = PRODUCTS.find((p) => p.id === id);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [hasDiscount, setHasDiscount] = useState(false);
    const [discountCode, setDiscountCode] = useState('');

    if (!product) return <ProductNotFound />;

    const handleSubmit = () => {
        // Hook this up to your payment flow
        console.log('Purchasing', product.title, { name, email, discountCode });
    };

    return (
        <div
            className="w-full min-h-screen"
            style={{
                background:
                    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
            }}
        >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                {/* Back link */}
                <Link
                    to="/dashboard/explore"
                    className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm font-semibold mb-6 transition-colors"
                >
                    <FiArrowLeft size={14} />
                    Explore
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
                    {/* ── Left: product image + info ── */}
                    <div>
                        <div
                            className="rounded-2xl overflow-hidden mb-6"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="w-full aspect-square object-cover"
                            />
                        </div>

                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                            style={{ background: 'rgba(166,255,0,0.1)', color: '#a6ff00' }}
                        >
                            {product.type === 'Course' ? <FiPlayCircle size={12} /> : <FiBookOpen size={12} />}
                            Digital Product
                        </span>

                        <h1 className="text-white text-2xl sm:text-3xl font-black mb-2">{product.title}</h1>
                        <p className="text-white/50 text-sm sm:text-base mb-1">by {product.author}</p>

                        <div className="flex items-center gap-1.5 text-white/50 text-sm mb-6">
                            <FiStar size={14} className="text-amber-400 fill-amber-400" />
                            {product.rating} rating
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <StatPill icon={<FiDollarSign size={16} />} label="Pricing" value={product.price} />
                            <StatPill
                                icon={<FiLayers size={16} />}
                                label="Content"
                                value={product.type === 'Course' ? 'Full Course' : '1 eBook'}
                            />
                        </div>
                    </div>

                    {/* ── Right: purchase panel ── */}
                    <div
                        className="rounded-2xl p-6 sm:p-8"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <h2 className="text-white text-lg sm:text-xl font-bold mb-1">
                            Purchase {product.title}
                        </h2>
                        <p className="text-white/40 text-sm mb-6">Complete the quick form below to proceed</p>

                        <div className="flex flex-col gap-3 mb-6">
                            <input
                                type="text"
                                placeholder="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#a6ff00]/50 transition-colors"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#a6ff00]/50 transition-colors"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        </div>

                        <p className="text-white font-bold text-sm mb-3">Summary</p>

                        <label className="flex items-center gap-2.5 mb-4 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={hasDiscount}
                                onChange={(e) => setHasDiscount(e.target.checked)}
                                className="w-4 h-4 rounded accent-[#a6ff00] cursor-pointer"
                            />
                            <span className="text-white/60 text-sm">I have a discount code</span>
                        </label>

                        {hasDiscount && (
                            <input
                                type="text"
                                placeholder="Enter discount code"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#a6ff00]/50 transition-colors mb-4"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        )}

                        <div
                            className="rounded-xl overflow-hidden mb-6"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <div className="flex items-center justify-between px-4 py-3.5">
                                <span className="text-white/70 text-sm">{product.title}</span>
                                <span className="text-white text-sm font-semibold">{product.price}</span>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                            <div className="flex items-center justify-between px-4 py-3.5">
                                <span className="text-white font-bold text-sm">Total</span>
                                <span className="font-bold text-sm" style={{ color: '#a6ff00' }}>
                                    {product.price}
                                </span>
                            </div>
                        </div>

                        <Button variant="green" className="w-full py-3 text-sm" onClick={handleSubmit}>
                            Continue to payment
                        </Button>

                        <p className="flex items-center justify-center gap-1.5 text-white/30 text-xs mt-4">
                            <FiCheckCircle size={12} />
                            Secure checkout, instant access after payment
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Product;
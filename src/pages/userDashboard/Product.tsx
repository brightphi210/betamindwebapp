import React, { useEffect, useState } from 'react';
import {
    FiArrowLeft,
    FiBookOpen,
    FiCheckCircle,
    FiDollarSign,
    FiExternalLink,
    FiLayers,
    FiPlayCircle,
    FiX,
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import LoadingOverlay from '../../component/LoadingOverlay';
import Button from '../../component/ui/Button';
import { useGetSingleDigitalProduct } from '../../hooks/queries/allQueriess';

// ─── Types (matches the digital-product API response) ───────────────────────
type ApiCourseModule = {
    title: string;
    description: string; // plain text
};

type ApiProduct = {
    id: string;
    mentor: string;
    user_name: string;
    link: string;
    product_type: 'course' | 'book';
    title: string;
    description: string; // plain text
    course_content: ApiCourseModule[] | null;
    cover_image: string | null;
    price: string;
    is_published: boolean;
    video: string | null;
    summary: string | null;
    created_at: string;
};

const formatPrice = (price: string) => {
    const numeric = parseFloat(price);
    if (!numeric || numeric <= 0) return 'Free';
    const trimmed = numeric % 1 === 0 ? numeric.toString() : numeric.toFixed(2);
    return `$${trimmed}`;
};

// Read-only render of the mentor's plain-text content (description, module
// descriptions, book summary). Preserves line breaks the mentor typed.
// break-words/overflow-wrap prevents long unbroken strings (e.g. pasted
// links) from pushing past the column and overlapping the sticky purchase
// panel on the right.
const RichText: React.FC<{ html: string }> = ({ html }) => (
    <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
        {html}
    </p>
);

// ─── Not found / error state ─────────────────────────────────────────────────
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

// ─── Video modal — opens automatically when the page loads if the product
// has a preview video, autoplays, and can be reopened from the page. ───────
const VideoModal: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => (
    <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#0a0d09', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white text-sm font-semibold">Preview</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                >
                    <FiX size={18} />
                </button>
            </div>
            <video src={src} controls autoPlay playsInline className="w-full aspect-video bg-black" />
        </div>
    </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────
const Product: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { product: response, isLoading, isError } = useGetSingleDigitalProduct(id);
    const product: ApiProduct | undefined = response?.data;
    console.log('This is Product', product)

    const [showVideoModal, setShowVideoModal] = useState(false);

    // Auto-open the preview video 3 seconds after this product's data loads.
    useEffect(() => {
        if (!product?.video) return;

        const timer = setTimeout(() => setShowVideoModal(true), 3000);
        return () => clearTimeout(timer);
    }, [product?.id, product?.video]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [hasDiscount, setHasDiscount] = useState(false);
    const [discountCode, setDiscountCode] = useState('');

    if (isLoading) {
        return (
            <div
                className="w-full min-h-screen relative"
                style={{
                    background:
                        'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
                }}
            >
                <LoadingOverlay visible />
            </div>
        );
    }

    if (isError || !product) return <ProductNotFound />;

    const isCourse = product.product_type === 'course';
    const price = formatPrice(product.price);
    const viewLabel = isCourse ? 'View Course' : 'View eBook';

    const handleSubmit = () => {
        // Hook this up to your payment flow
        console.log('Purchasing', product.title, { name, email, discountCode, redirectTo: product.link });
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

                {/* min-w-0 on both grid children stops long text (description,
                    course content) from forcing the left column wider than its
                    track, which is what was pushing it over the sticky purchase
                    panel on the right. */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
                    {/* ── Left: product image + info ── */}
                    <div className="min-w-0">
                        <div
                            className="rounded-2xl overflow-hidden mb-6"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            {product.cover_image ? (
                                <img
                                    src={product.cover_image}
                                    alt={product.title}
                                    className="w-full aspect-square object-cover"
                                />
                            ) : (
                                <div className="w-full aspect-square flex items-center justify-center">
                                    {isCourse ? (
                                        <FiPlayCircle size={40} className="text-white/15" />
                                    ) : (
                                        <FiBookOpen size={40} className="text-white/15" />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ background: 'rgba(166,255,0,0.1)', color: '#a6ff00' }}
                            >
                                {isCourse ? <FiPlayCircle size={12} /> : <FiBookOpen size={12} />}
                                Digital Product
                            </span>

                            {product.video && (
                                <button
                                    type="button"
                                    onClick={() => setShowVideoModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors hover:bg-white/10"
                                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}
                                >
                                    <FiPlayCircle size={12} />
                                    Watch preview
                                </button>
                            )}

                            {product.link && (
                                <a
                                    href={product.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors hover:bg-white/10"
                                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}
                                >
                                    <FiExternalLink size={12} />
                                    {viewLabel}
                                </a>
                            )}
                        </div>

                        <h1 className="text-white text-2xl sm:text-3xl font-black mb-2 break-words">{product.title}</h1>
                        <p className="text-white/50 text-sm sm:text-base mb-6">by {product.user_name}</p>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <StatPill icon={<FiDollarSign size={16} />} label="Pricing" value={price} />
                            <StatPill
                                icon={<FiLayers size={16} />}
                                label="Content"
                                value={
                                    isCourse
                                        ? `${product.course_content?.length ?? 0} module${product.course_content?.length === 1 ? '' : 's'}`
                                        : '1 eBook'
                                }
                            />
                        </div>

                        <div className="mb-8">
                            <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">Description</h3>
                            <RichText html={product.description} />
                        </div>

                        {isCourse ? (
                            <div>
                                <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                                    Course Content
                                    {product.course_content?.length ? ` · ${product.course_content.length} module${product.course_content.length === 1 ? '' : 's'}` : ''}
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {(product.course_content ?? []).map((m, i) => (
                                        <div
                                            key={`${m.title}-${i}`}
                                            className="rounded-xl p-4 min-w-0"
                                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                                        >
                                            <div className="flex items-center gap-2.5 mb-2 min-w-0">
                                                <span
                                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                                                    style={{ background: '#a6ff00' }}
                                                >
                                                    {i + 1}
                                                </span>
                                                <p className="text-white text-sm font-semibold truncate min-w-0">{m.title || `Module ${i + 1}`}</p>
                                            </div>
                                            <RichText html={m.description} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            product.summary && (
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">Overview</h3>
                                    <div
                                        className="rounded-xl p-4 min-w-0"
                                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        <RichText html={product.summary} />
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* ── Right: purchase panel ── */}
                    <div
                        className="rounded-2xl p-6 sm:p-8 lg:sticky lg:top-8 min-w-0"
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
                                <span className="text-white/70 text-sm truncate">{product.title}</span>
                                <span className="text-white text-sm font-semibold shrink-0">{price}</span>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                            <div className="flex items-center justify-between px-4 py-3.5">
                                <span className="text-white font-bold text-sm">Total</span>
                                <span className="font-bold text-sm" style={{ color: '#a6ff00' }}>
                                    {price}
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

            {showVideoModal && product.video && (
                <VideoModal src={product.video} onClose={() => setShowVideoModal(false)} />
            )}
        </div>
    );
};

export default Product;
import React, { useState } from 'react';
import { BsFillCheckCircleFill } from 'react-icons/bs';
import { FaFacebookF, FaLinkedinIn, FaRedditAlien, FaWhatsapp } from 'react-icons/fa';
import {
    FiArrowLeft,
    FiAward,
    FiBookOpen,
    FiBriefcase,
    FiCalendar,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiCopy,
    FiGlobe,
    FiLinkedin,
    FiMail,
    FiMapPin,
    FiPlayCircle,
    FiShare2,
    FiStar,
    FiTag,
    FiTwitter,
    FiUsers,
    FiX
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Button from '../../component/ui/Button';
import { useGetMentorProfile } from '../../hooks/queries/allQueriess';

type MentorReview = {
    id: string | number;
    reviewer_name: string;
    reviewer_avatar?: string;
    rating: number;
    comment: string;
    created_at: string;
};

type MentorProduct = {
    id: string | number;
    type: 'Course' | 'Book';
    title: string;
    thumbnail: string | null;
    price: string;
};

// ─── Dummy data ───────────────────────────────────────────────────────────
const DUMMY_INTRO_VIDEO = 'https://youtu.be/BD8fDugktAE';
const getYouTubeEmbedUrl = (url: string): string | null => {
    const patterns = [
        /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
};

const DUMMY_SESSIONS_COMPLETED = 48;
const DUMMY_RATING = 5;

const DUMMY_REVIEWS: MentorReview[] = [
    {
        id: 1,
        reviewer_name: 'Sarah K.',
        rating: 5,
        created_at: 'Jul 23, 2026',
        comment:
            'Really helped me organize my thoughts and communicate more clearly. Sessions are practical and easy to follow, and always tailored to what I actually needed that week.',
    },
    {
        id: 2,
        reviewer_name: 'Daniel O.',
        rating: 5,
        created_at: 'Jul 18, 2026',
        comment: 'Patient, encouraging, and always prepared. I noticed real improvement after just a few sessions.',
    },
    {
        id: 3,
        reviewer_name: 'Amara N.',
        rating: 5,
        created_at: 'Jul 11, 2026',
        comment: 'Great mentor, gives honest feedback and genuinely wants you to improve.',
    },
    {
        id: 4,
        reviewer_name: 'James T.',
        rating: 4,
        created_at: 'Jul 5, 2026',
        comment: 'Solid sessions overall, learned a lot about presenting my work with more confidence.',
    },
];

type MentorPublicSession = {
    id: string;
    type: 'one-on-one' | 'group';
    title: string;
    description: string;
    note?: string;
    price: number;
    startDate: string;
    endDate: string;
    dailyTime: string;
    image: string;
    capacity: number;
    spotsLeft: number;
    status: string;
    durationLabel: string;
    durationMinutes?: number;
    daysDuration?: number;
    availability?: 'weekdays' | 'weekends';
    responseTime?: 'immediate' | number;
    mentorAvatar?: string;
    meetingLink?: string;
    booking?: {
        id: string;
        menteeName: string;
        menteeAvatar: string;
        meetingLink: string;
        status: 'pending_confirmation' | 'confirmed';
        bookedFor: string;
    } | null;
};

const mapGroupSessionToPublicSession = (session: any, fallbackImage?: string): MentorPublicSession => ({
    id: String(session?.id ?? `${Date.now()}-group`),
    type: 'group',
    title: session?.name || 'Group Session',
    description: session?.description || 'A group mentorship session.',
    price: Number(session?.price_per_participant) || 0,
    startDate: session?.start_date || '',
    endDate: session?.end_date || session?.start_date || '',
    dailyTime: session?.daily_time || '',
    image: session?.banner || session?.banner_url || fallbackImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    capacity: Number(session?.max_participants) || 1,
    spotsLeft: Number(session?.spots_left ?? session?.max_participants ?? 1) || 0,
    status: session?.status || 'open',
    durationLabel: session?.duration_minutes ? `${session.duration_minutes} mins` : '60 mins',
});

const mapIndividualSessionToPublicSession = (session: any, fallbackImage?: string): MentorPublicSession => ({
    id: String(session?.id ?? `${Date.now()}-individual`),
    type: 'one-on-one',
    title: '1:1 Mentorship',
    description: session?.notes || 'Private mentorship tailored to your goals.',
    note: session?.notes || 'Private mentorship tailored to your goals.',
    price: Number(session?.price) || 0,
    startDate: '',
    endDate: '',
    dailyTime: session?.availability || 'Flexible',
    image: fallbackImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    capacity: 1,
    spotsLeft: 1,
    status: session?.status || 'open',
    durationLabel: session?.duration_minutes ? `${session.duration_minutes} mins` : `${session?.duration_days || 1} day`,
    durationMinutes: Number(session?.duration_minutes) || 45,
    daysDuration: Number(session?.duration_days) || 7,
    availability: session?.availability || 'weekdays',
    responseTime: session?.response_time === 'immediate' ? 'immediate' : Number(session?.response_time) || 2,
    mentorAvatar: fallbackImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    meetingLink: session?.meeting_link || '',
    booking: session?.mentee
        ? {
            id: String(session.id),
            menteeName: session?.mentee_name || 'Mentee',
            menteeAvatar: `https://i.pravatar.cc/150?u=${session.mentee}`,
            meetingLink: session?.meeting_link || '',
            status: session?.status === 'confirmed' ? 'confirmed' : 'pending_confirmation',
            bookedFor: session?.created_at
                ? new Date(session.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                })
                : 'Recently booked',
        }
        : null,
});

const formatCurrency = (value: number) => `₦${value.toLocaleString()}`;
const formatDayDate = (value: string) => {
    if (!value) return 'TBD';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};
const formatTimeDisplay = (value: string) => {
    if (!value) return 'TBD';
    const [hoursStr, minutesStr] = value.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr ?? 0);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const normalizedHour = hours % 12 || 12;
    return `${normalizedHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

// ─── Map a raw digital_products entry from the API into the shape this page renders ──
const mapDigitalProduct = (dp: any): MentorProduct => {
    const rawType = (dp?.product_type ?? '').toString().toLowerCase();
    const priceNum = Number(dp?.price);
    const hasPrice = !Number.isNaN(priceNum) && priceNum > 0;

    return {
        id: dp?.id,
        type: rawType === 'book' ? 'Book' : 'Course',
        title: dp?.title ?? 'Untitled product',
        thumbnail: dp?.cover_image ?? null,
        price: hasPrice ? `$${priceNum}` : 'Free',
    };
};

type SocialLink = {
    linkedin?: string;
    twitter?: string;
    website?: string;
};

const SOCIAL_ICON_MAP: Record<keyof SocialLink, React.ReactNode> = {
    linkedin: <FiLinkedin size={16} />,
    twitter: <FiTwitter size={16} />,
    website: <FiGlobe size={16} />,
};

const SOCIAL_LABEL_MAP: Record<keyof SocialLink, string> = {
    linkedin: 'LinkedIn',
    twitter: 'X (Twitter)',
    website: 'Website',
};

// ─── Shared skeleton primitive ───────────────────────────────────────────────
const Bone: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
    <div
        className={`animate-pulse rounded-md ${className}`}
        style={{ background: 'rgba(255,255,255,0.06)', ...style }}
    />
);

// ─── Small empty-state line, used inline wherever a single field is missing ──
const FieldPlaceholder: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <div className="flex items-center gap-1.5 text-white/25 text-sm italic">
        {icon}
        {label}
    </div>
);

// ─── Empty-state block, used for whole sections (socials / tags) ────────────
const SectionPlaceholder: React.FC<{ text: string }> = ({ text }) => (
    <div
        className="flex items-center justify-center text-center py-6 px-4 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
    >
        <p className="text-white/25 text-xs italic">{text}</p>
    </div>
);

// ─── Reusable panel wrapper for content sections ─────────────────────────────
const Panel: React.FC<{ icon?: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }> = ({ icon, title, subtitle, children }) => (
    <div
        className="rounded-xl p-4 sm:p-4 mb-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div className="flex items-center gap-2 text-white/90 font-bold text-xs uppercase tracking-wider mb-1">
            {icon}
            {title}
        </div>
        {subtitle && <p className="text-white/35 text-xs mb-4">{subtitle}</p>}
        {!subtitle && <div className="mb-4" />}
        {children}
    </div>
);

const StarRow: React.FC<{ rating: number; size?: number }> = ({ rating, size = 13 }) => {
    const rounded = Math.round(rating);
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                    key={i}
                    size={size}
                    style={{
                        color: i < rounded ? 'black/20' : 'rgba(255,255,255,0.15)',
                        fill: i < rounded ? '#a6ff00' : 'none',
                    }}
                />
            ))}
        </div>
    );
};

const ReviewAvatar: React.FC<{ name: string; avatar?: string }> = ({ name, avatar }) => {
    const initials = name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return avatar ? (
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />
    ) : (
        <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
        >
            {initials || '?'}
        </div>
    );
};

// ─── Single review card, with truncation + "Show more" for long comments ────
const ReviewCard: React.FC<{ review: MentorReview }> = ({ review }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = review.comment.length > 160;
    const displayText = expanded || !isLong ? review.comment : `${review.comment.slice(0, 160).trim()}…`;

    return (
        <div>
            <div className="flex items-center gap-3 mb-3">
                <ReviewAvatar name={review.reviewer_name} avatar={review.reviewer_avatar} />
                <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{review.reviewer_name}</p>
                    <p className="text-white/35 text-xs">{review.created_at}</p>
                </div>
            </div>
            <StarRow rating={review.rating} />
            <p className="text-white text-sm leading-relaxed mt-2">
                {displayText}
                {isLong && (
                    <button
                        onClick={() => setExpanded((prev) => !prev)}
                        className="block text-xs font-semibold mt-1 hover:underline"
                        style={{ color: '#a6ff00' }}
                    >
                        {expanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </p>
        </div>
    );
};

const MentorSessionCard: React.FC<{ session: MentorPublicSession; onSelect: (session: MentorPublicSession) => void }> = ({ session, onSelect }) => {
    if (session.type === 'one-on-one') {
        return (
            <div className="rounded-2xl bg-white/5 p-3 sm:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16">
                        <img src={session.mentorAvatar || session.image} alt="Mentor" className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="line-clamp-1 text-base font-bold text-white">SESSION IS LIVE</h3>
                                <p className="line-clamp-2 text-xs leading-relaxed text-white/55">{session.note || session.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/60">
                        <span className="flex items-center gap-1.5">
                            <FiClock size={13} />
                            {session.durationMinutes ? `${session.durationMinutes} mins` : session.durationLabel}
                        </span>
                        <span className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold capitalize text-black">
                            1-1 Session
                        </span>
                        <span className="text-white/40">· {session.daysDuration ?? 7} days</span>
                        {session.meetingLink && (
                            <a href={session.meetingLink} target="_blank" rel="noreferrer" className="text-white/40 underline decoration-dotted underline-offset-2 hover:text-white/70">
                                Meeting link
                            </a>
                        )}
                    </div>
                    <p className="text-base font-bold text-white sm:text-lg">{formatCurrency(session.price)}</p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                    <span className="text-[11px] text-white/40">
                        {!session.booking && 'No mentee has booked this slot yet'}
                        {session.booking?.status === 'pending_confirmation' && `${session.booking.menteeName} requested a booking`}
                        {session.booking?.status === 'confirmed' && `Confirmed with ${session.booking.menteeName}`}
                    </span>
                    <button
                        type="button"
                        onClick={() => onSelect(session)}
                        className="rounded-md bg-white px-4 py-2 text-[11px] font-bold text-black"
                    >
                        View Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl p-3 sm:p-4 bg-white/5">
            <div className="flex gap-3 sm:gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md sm:h-16 sm:w-16">
                    <img src={session.image} alt={session.title} className="h-full w-full object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="text-base font-bold text-white line-clamp-1">{session.title}</h3>
                            <p className="text-xs leading-relaxed text-white/55 line-clamp-2">{session.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/55">
                <span className="flex items-center gap-1.5">
                    <FiClock size={13} />
                    {session.dailyTime ? formatTimeDisplay(session.dailyTime) : 'Flexible'}
                </span>
                <span className="text-white/40">{formatDayDate(session.startDate)} – {formatDayDate(session.endDate)}</span>
                <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold capitalize text-black">
                    Group Session
                </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/40">
                        {`${session.capacity} total · ${session.spotsLeft} left`}
                    </span>
                </div>
                <p className="text-base font-bold text-white sm:text-lg">{formatCurrency(session.price)}</p>
            </div>

            <button
                type="button"
                onClick={() => onSelect(session)}
                className="mt-2 w-full bg-white rounded-md px-4 py-2.5 text-xs font-bold text-black"
            >
                Book Session
            </button>
        </div>
    );
};

const SessionDetailsModal: React.FC<{ session: MentorPublicSession; onClose: () => void; onBook: () => void }> = ({ session, onClose, onBook }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-5 shadow-2xl"
            style={{
                background: 'rgba(10,13,9,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Session Details</h3>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                    <FiX size={16} />
                </button>
            </div>

            <div className="mb-4 overflow-hidden rounded-xl">
                <img src={session.image} alt={session.title} className="h-44 w-full object-cover" />
            </div>

            <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-xl font-bold text-white">{session.title}</h4>
                <span className="rounded bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                    {session.type === 'one-on-one' ? '1-1 Session' : 'Group Session'}
                </span>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-white/65">{session.description}</p>

            <div className="grid grid-cols-2 gap-3 text-xs text-white/75">
                <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-white/40">Date</p>
                    <p className="mt-1 font-semibold text-white">{formatDayDate(session.startDate)} – {formatDayDate(session.endDate)}</p>
                </div>
                <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-white/40">Time</p>
                    <p className="mt-1 font-semibold text-white">{formatTimeDisplay(session.dailyTime)}</p>
                </div>
                <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-white/40">Duration</p>
                    <p className="mt-1 font-semibold text-white">{session.durationLabel}</p>
                </div>
                <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-white/40">Availability</p>
                    <p className="mt-1 font-semibold text-white">{session.spotsLeft > 0 ? `${session.spotsLeft} spots left` : 'Sold out'}</p>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg px-3 py-3" style={{ background: 'rgba(166,255,0,0.08)', border: '1px solid rgba(166,255,0,0.18)' }}>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Price</span>
                <span className="text-lg font-black text-white">{formatCurrency(session.price)}</span>
            </div>

            <div className="mt-5 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white/80" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    Close
                </button>
                <button type="button" onClick={onBook} className="flex-1 rounded-lg py-2.5 text-sm font-bold text-black" style={{ background: '#fff' }}>
                    Book Session
                </button>
            </div>
        </div>
    </div>
);

const MentorProductCard: React.FC<{ product: MentorProduct }> = ({ product }) => (
    <Link
        to={`/dashboard/products/${product.id}`}
        className="rounded-md overflow-hidden flex flex-col transition-colors hover:bg-white/3 cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div className="relative">
            {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.title} className="w-full h-32 sm:h-36 object-cover" />
            ) : (
                <div className="w-full h-32 sm:h-36 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {product.type === 'Course' ? (
                        <FiPlayCircle size={24} className="text-white/15" />
                    ) : (
                        <FiBookOpen size={24} className="text-white/15" />
                    )}
                </div>
            )}
            <span
                className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold"
                style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}
            >
                {product.type === 'Course' ? <FiPlayCircle size={12} /> : <FiBookOpen size={12} />}
                {product.type}
            </span>
        </div>
        <div className="p-3.5 flex flex-col flex-1">
            <h4 className="text-white font-semibold text-sm mb-1 wrap-break-word line-clamp-2">{product.title}</h4>
            <span className="text-white font-bold text-sm mt-auto pt-1">{product.price}</span>
        </div>

        <div className="p-2 pt-0">
            <button
                className=" cursor-pointer w-full text-center tems-center bg-white gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-black transition-transform hover:scale-[1.02]"
            >
                View Product
            </button>
        </div>
    </Link>
);

// ─── Share profile modal ─────────────────────────────────────────────────────
const ShareModal: React.FC<{
    mentorName: string;
    mentorAvatar?: string;
    rating: number | null;
    reviewCount: number;
    isApproved?: boolean;
    onClose: () => void;
}> = ({ mentorName, mentorAvatar, rating, reviewCount, isApproved, onClose }) => {
    const [copied, setCopied] = useState(false);
    const shareUrl = window.location.href;
    const shareTitle = mentorName ? `${mentorName} on Betamind` : 'Mentor profile';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard blocked, no-op
        }
    };

    const shareLinks = [
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            icon: <FaWhatsapp size={16} />,
            href: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
        },
        {
            id: 'reddit',
            label: 'Reddit',
            icon: <FaRedditAlien size={16} />,
            href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
        },
        {
            id: 'facebook',
            label: 'Facebook',
            icon: <FaFacebookF size={16} />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        },
        {
            id: 'email',
            label: 'Email',
            icon: <FiMail size={16} />,
            href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`,
        },
        {
            id: 'linkedin',
            label: 'LinkedIn',
            icon: <FaLinkedinIn size={16} />,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        },
        {
            id: 'x',
            label: 'X (Twitter)',
            icon: <FiTwitter size={16} />,
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md overflow-y-auto rounded-2xl p-6 shadow-2xl"
                style={{
                    background: 'rgba(10,13,9,0.55)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">Share this mentor</h3>
                        <p className="text-xs text-white/40 mt-0.5">{mentorName}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:text-white shrink-0"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Mentor summary */}
                <div className="flex items-center gap-3 mb-6">
                    <img
                        src={mentorAvatar}
                        alt={mentorName}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <div className="min-w-0">
                        <p className="text-white font-bold text-base truncate">{mentorName}</p>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                            {rating !== null && (
                                <span className="flex items-center gap-1 text-white/60 text-xs">
                                    <FiStar size={12} style={{ color: '#a6ff00', fill: '#a6ff00' }} />
                                    {rating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? '' : 's'})
                                </span>
                            )}
                            {isApproved && (
                                <span className="flex items-center gap-1 text-white/60 text-xs">
                                    <FiCheckCircle size={12} className="text-neutral-600" />
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Copy link */}
                <div className="mb-6">
                    <label className="mb-2 block text-sm font-semibold text-white">Profile link</label>
                    <div
                        className="flex items-center gap-3"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem' }}
                    >
                        <input
                            readOnly
                            value={shareUrl}
                            onFocus={(e) => e.currentTarget.select()}
                            className="w-full rounded-xl px-4 py-3 text-sm text-white/70 bg-transparent outline-none truncate"
                        />
                        <button
                            onClick={handleCopy}
                            className="cursor-pointer shrink-0 mr-1.5 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-transform hover:scale-[1.02]"
                            style={{ background: '#a6ff00', color: '#000' }}
                        >
                            {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Social share buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                    {shareLinks.map((link) => (
                        <a
                            key={link.id}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white/80 hover:text-white transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            {link.icon}
                            {link.label}
                        </a>
                    ))}
                </div>

                <Button variant="white" className="w-full mt-6 py-3.5 text-xs" onClick={onClose}>
                    Done
                </Button>
            </div>
        </div>
    );
};

const MentorSkeleton: React.FC = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="inline-flex items-center gap-1.5 mb-6">
            <FiArrowLeft size={14} className="text-white/20" />
            <Bone className="h-4 w-16" />
        </div>

        <div className="relative mb-16 sm:mb-20">
            <Bone className="w-full h-32 lg:h-40 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <Bone
                className="absolute -bottom-12 left-6 w-24 h-24 rounded-2xl z-10"
                style={{ border: '4px solid #05080e', boxShadow: '0 0 0 1px rgba(205,220,57,.1)' }}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10 items-start">
            {/* Main column skeleton */}
            <div>
                <Bone className="h-7 w-56 mb-2" />
                <Bone className="h-4 w-28 mb-4" />
                <Bone className="h-8 w-40 rounded-md mb-4" />
                <div className="flex gap-4 mb-5">
                    <Bone className="h-4 w-32" />
                    <Bone className="h-4 w-28" />
                </div>
                <div className="flex flex-col gap-2 mb-6 max-w-xl">
                    <Bone className="h-3.5 w-full" />
                    <Bone className="h-3.5 w-full" />
                    <Bone className="h-3.5 w-2/3" />
                </div>
                <div className="flex items-center gap-3 mb-8">
                    <Bone className="w-9 h-9 rounded-full" />
                    <Bone className="w-9 h-9 rounded-full" />
                    <Bone className="w-9 h-9 rounded-full" />
                </div>
                <div className="rounded-xl p-5 mb-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Bone className="h-3.5 w-24 mb-4" />
                    <div className="flex flex-wrap gap-2">
                        <Bone className="h-7 w-20 rounded-lg" />
                        <Bone className="h-7 w-24 rounded-lg" />
                        <Bone className="h-7 w-16 rounded-lg" />
                    </div>
                </div>
                <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Bone className="h-3.5 w-24 mb-4" />
                    <div className="flex flex-wrap gap-2">
                        <Bone className="h-7 w-20 rounded-lg" />
                        <Bone className="h-7 w-24 rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Bone className="h-8 w-28 mb-1" />
                <Bone className="h-3.5 w-16 mb-5" />
                <Bone className="h-11 w-full rounded-lg mb-5" />
                <div className="flex flex-col gap-3">
                    <Bone className="h-4 w-full" />
                    <Bone className="h-4 w-full" />
                    <Bone className="h-4 w-full" />
                </div>
            </div>
        </div>
    </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────
const Mentor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { aMentor, isLoading } = useGetMentorProfile(id);
    const mentor = aMentor?.data;
    console.log('mentor', mentor);

    const mentorName = [mentor?.first_name, mentor?.last_name].filter(Boolean)
        .join(' ') || mentor?.nick_name || 'Mentor';
    const mentorAvatar: string | undefined = mentor?.avatar;

    const socialLink: SocialLink = mentor?.social_link ?? {};
    const activeSocials = (Object.keys(socialLink) as (keyof SocialLink)[]).filter(
        (platform) => !!socialLink[platform]
    );

    const location = [mentor?.address, mentor?.city, mentor?.country].filter(Boolean).join(', ');
    const categories: string[] = mentor?.categories ?? [];
    const expertise: string[] = mentor?.expertise ?? [];

    // The intro video lives in `video_link` (e.g. a youtube.com/shorts/ URL).
    const introVideo: string | null = mentor?.video_link ?? DUMMY_INTRO_VIDEO;
    const introVideoEmbedUrl = introVideo ? getYouTubeEmbedUrl(introVideo) : null;

    const reviews: MentorReview[] = mentor?.reviews ?? DUMMY_REVIEWS;
    const reviewCount: number = mentor?.review_count ?? reviews.length;
    const averageRating: number | null =
        typeof mentor?.rating === 'number' ? mentor.rating : reviews.length > 0 ? DUMMY_RATING : null;
    const sessionsCompleted: number | null =
        typeof mentor?.sessions_completed === 'number' ? mentor.sessions_completed : DUMMY_SESSIONS_COMPLETED;

    const products: MentorProduct[] =
        Array.isArray(mentor?.digital_products) && mentor.digital_products.length > 0
            ? mentor.digital_products.map(mapDigitalProduct)
            : [];

    const groupSessions: MentorPublicSession[] = Array.isArray(mentor?.group_sessions)
        ? mentor.group_sessions.map((session: any) => mapGroupSessionToPublicSession(session, mentor?.cover_images))
        : [];

    const individualSessions: MentorPublicSession[] = Array.isArray(mentor?.individual_sessions)
        ? mentor.individual_sessions.map((session: any) => mapIndividualSessionToPublicSession(session, mentor?.cover_images))
        : [];

    const [showShareModal, setShowShareModal] = useState(false);
    const [showFullBio, setShowFullBio] = useState(false);
    const [selectedSession, setSelectedSession] = useState<MentorPublicSession | null>(null);

    const maxBioLength = 180;
    const bio = mentor?.bio || '';
    const isLongBio = bio.length > maxBioLength;

    const displayedBio =
        showFullBio || !isLongBio
            ? bio
            : `${bio.slice(0, maxBioLength).trim()}...`;

    return (
        <div
            className="w-full min-h-screen"
            style={{
                background:
                    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
            }}
        >
            <ToastContainer theme="dark" />
            {isLoading ? (
                <MentorSkeleton />
            ) : (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    {/* Back link */}
                    <Link
                        to="/dashboard/explore"
                        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm font-semibold mb-6 transition-colors"
                    >
                        <FiArrowLeft size={14} />
                        Explore
                    </Link>

                    {/* Banner + avatar */}
                    <div className="relative mb-16 sm:mb-20">
                        <div className="rounded-lg overflow-hidden relative" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                            <img
                                src={mentor?.cover_images}
                                alt={mentorName}
                                className="w-full h-32 lg:h-40 object-cover"
                            />
                            <div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)' }}
                            />
                        </div>

                        <img
                            src={mentorAvatar}
                            alt={mentorName}
                            className="absolute lg:-bottom-10 -bottom-6 left-4 lg:w-20 lg:h-20 w-16 h-16 rounded-xl object-cover z-10"
                            style={{ border: '4px solid #05080e', boxShadow: '0 0 0 1px rgba(205,220,57,.2)' }}
                        />
                    </div>

                    {/* ── Two-column layout: main content + sticky booking sidebar ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10 items-start">

                        {/* ── Main column ── */}
                        <div>
                            <div className="flex items-start justify-between gap-3 mb-1">
                                <div>
                                    {mentor?.nick_name && (
                                        <p className="text-white/40 text-sm sm:text-sm pt-1.5">@{mentor?.nick_name}</p>
                                    )}
                                    <h1 className="text-white text-2xl sm:text-3xl font-black flex items-center gap-2 flex-wrap">
                                        {mentorName}
                                        {mentor?.is_approved && (
                                            <BsFillCheckCircleFill size={20} className="text-green-100 shrink-0" title="Verified mentor" />
                                        )}
                                    </h1>
                                </div>

                                {/* Share profile */}
                                <button
                                    onClick={() => setShowShareModal(true)}
                                    title="Share mentor profile"
                                    aria-label="Share mentor profile"
                                    className="cursor-pointer shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-neutral-100 transition-colors"
                                >
                                    <FiShare2 size={16} />
                                </button>
                            </div>

                            {/* Occupation + socials row */}
                            <div className="flex flex-wrap items-center gap-3 mt-1 mb-8">
                                {mentor?.occupation && (
                                    <div
                                        className="inline-block px-4 py-1.5 rounded-md text-sm font-semibold border border-neutral-700"
                                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}
                                    >
                                        {mentor?.occupation}
                                    </div>
                                )}

                                {activeSocials.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                        {activeSocials?.map((platform) => (
                                            <a
                                                key={platform}
                                                href={socialLink[platform]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={SOCIAL_LABEL_MAP[platform]}
                                                className="w-9 h-9 rounded-md flex items-center justify-center text-black bg-white transition-colors"
                                            >
                                                {SOCIAL_ICON_MAP[platform]}
                                            </a>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            {/* Credibility row */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                {typeof mentor?.years_of_experience === 'number' ? (
                                    <div className="flex items-center gap-1.5 text-white/80 text-sm">
                                        <div className="bg-white/10 p-2 rounded-md">
                                            <FiAward size={15} className="text-neutral-100 " />
                                        </div>
                                        {mentor?.years_of_experience}+ years of experience
                                    </div>
                                ) : (
                                    <FieldPlaceholder icon={<FiAward size={14} />} label="Experience not added yet" />
                                )}

                                {location ? (
                                    <div className="flex items-center gap-1.5 text-white/80 text-sm">
                                        <div className="bg-white/10 p-2  rounded-md">
                                            <FiMapPin size={15} className="text-neutral-100 " />
                                        </div>
                                        {location}
                                    </div>
                                ) : (
                                    <FieldPlaceholder icon={<FiMapPin size={14} />} label="Location not added yet" />
                                )}

                                {sessionsCompleted !== null ? (
                                    <div className="flex items-center gap-1.5 text-white/80 text-sm">
                                        <div className="bg-white/10 p-2 rounded-md">
                                            <FiUsers size={15} className="text-neutral-100 " />
                                        </div>
                                        {sessionsCompleted} session{sessionsCompleted === 1 ? '' : 's'} completed
                                    </div>
                                ) : (
                                    <FieldPlaceholder icon={<FiUsers size={14} />} label="No sessions yet" />
                                )}
                            </div>

                            <div className="mb-10 bg-[rgba(255,255,255,0.03)] rounded-md p-2">
                                {introVideo ? (
                                    <>
                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', aspectRatio: '16 / 9' }}>
                                            {introVideoEmbedUrl ? (
                                                <iframe
                                                    src={introVideoEmbedUrl}
                                                    title={`${mentorName} mentorship style intro`}
                                                    className="w-full h-full"
                                                    style={{ border: 0 }}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <video
                                                    src={introVideo}
                                                    poster={mentorAvatar}
                                                    controls
                                                    className="w-full h-full bg-black"
                                                />
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <SectionPlaceholder text="No introduction video added yet" />
                                )}
                            </div>

                            {/* Bio */}
                            <div className="border-t border-neutral-800 pb-3">
                                <p className="text-white/70 text-sm pb-2 pt-5">
                                    About Me:
                                </p>

                                {bio ? (
                                    <>
                                        <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
                                            {displayedBio}
                                        </p>

                                        {isLongBio && (
                                            <button
                                                onClick={() =>
                                                    setShowFullBio((prev) => !prev)
                                                }
                                                className="text-sm font-medium mt-2 hover:underline"
                                                style={{ color: '#a6ff00' }}
                                            >
                                                {showFullBio ? 'See Less' : 'See More'}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-white/25 italic text-sm">
                                        No bio added yet
                                    </p>
                                )}
                            </div>

                            {/* Focus Areas */}
                            <Panel icon={<FiTag size={14} className="text-neutral-600" />} title="Focus areas">
                                {categories.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <span
                                                key={cat}
                                                className="px-3 py-1.5 bg-white text-black rounded-md text-xs font-semibold capitalize"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <SectionPlaceholder text="No focus areas added yet" />
                                )}
                            </Panel>

                            {/* Expertise */}
                            <Panel icon={<FiBriefcase size={14} className="text-neutral-600" />} title="Expertise">
                                {expertise.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {expertise.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1.5 bg-white text-black rounded-md text-xs font-semibold bg"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <SectionPlaceholder text="No expertise added yet" />
                                )}
                            </Panel>

                            {/* Products uploaded by this mentor */}
                            <Panel
                                icon={<FiBookOpen size={14} className="text-neutral-600" />}
                                title={`Products by ${mentorName.split(' ')[0] || 'this mentor'}`}
                            >
                                {products.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {products.map((product) => (
                                            <MentorProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <SectionPlaceholder text="No courses or books uploaded yet" />
                                )}
                            </Panel>

                            {/* Reviews */}
                            <div id="reviews" className="scroll-mt-24">
                                <Panel icon={<FiStar size={14} className="text-neutral-600" />} title="What students say">
                                    {reviews.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                                {reviews.map((review) => (
                                                    <ReviewCard key={review.id} review={review} />
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <SectionPlaceholder text="No reviews yet" />
                                    )}
                                </Panel>
                            </div>
                        </div>

                        {/* ── Sidebar: mentor session cards ── */}
                        <div className="lg:sticky lg:top-8">
                            <div
                                className="rounded-xl p-4 sm:p-5 bg-neutral-950"
                            >
                                <div className="mb-4 flex items-center gap-2 text-white/80 text-[11px] font-bold uppercase tracking-wider">
                                    <FiCalendar size={13} />
                                    Sessions
                                </div>

                                {individualSessions.length > 0 && (
                                    <div className="mb-5">
                                        <div className="mb-2">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-white/70">1:1 Sessions</p>
                                            <p className="mt-1 text-[11px] text-white/45">Private mentoring tailored to your goals and growth plan.</p>
                                        </div>
                                        <div className="space-y-4">
                                            {individualSessions.map((session) => (
                                                <MentorSessionCard key={session.id} session={session} onSelect={setSelectedSession} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {groupSessions.length > 0 && (
                                    <div>
                                        <div className="mb-2">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-white/70">Group Sessions</p>
                                            <p className="mt-1 text-[11px] text-white/45">Collaborative sessions for learning, feedback, and community support.</p>
                                        </div>
                                        <div className="space-y-4">
                                            {groupSessions.map((session) => (
                                                <MentorSessionCard key={session.id} session={session} onSelect={setSelectedSession} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {individualSessions.length === 0 && groupSessions.length === 0 && (
                                    <div className="rounded-lg border border-dashed border-white/10 bg-white/3 px-3 py-6 text-center text-xs text-white/40">
                                        No sessions have been published yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showShareModal && (
                <ShareModal
                    mentorName={mentorName}
                    mentorAvatar={mentorAvatar}
                    rating={averageRating}
                    reviewCount={reviewCount}
                    isApproved={mentor?.is_approved}
                    onClose={() => setShowShareModal(false)}
                />
            )}

            {selectedSession && (
                <SessionDetailsModal
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                    onBook={() => {
                        setSelectedSession(null);
                        // TODO: wire to real booking flow when the session API is connected.
                    }}
                />
            )}

        </div>
    );
};

export default Mentor;
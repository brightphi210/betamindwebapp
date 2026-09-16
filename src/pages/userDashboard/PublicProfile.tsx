import React, { useState } from "react";
import { BsFillCheckCircleFill, BsStarFill } from "react-icons/bs";
import { FaFacebookF, FaLinkedinIn, FaRedditAlien, FaWhatsapp } from "react-icons/fa";
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
    FiUser,
    FiUsers,
    FiX
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import LoadingOverlay from "../../component/LoadingOverlay";
import { cardBg, cardBorder, pageBackground } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useBookMentorship } from "../../hooks/mutations/allMutation";
import { useGetMentorDigitalProduct, useGetMyMentorProfile, useGetMyUserProfile } from "../../hooks/queries/allQueriess";

type MentorReview = {
    id: string | number;
    reviewer_name: string;
    reviewer_avatar?: string;
    rating: number;
    comment: string;
    created_at: string;
};

type ApiDigitalProduct = {
    id: string;
    mentor: string;
    user_name: string;
    link: string;
    product_type: "course" | "book";
    title: string;
    description: string;
    course_content: { title: string; description: string }[] | null;
    cover_image: string | null;
    price: string;
    is_published: boolean;
    video: string | null;
    summary: string | null;
    created_at: string;
};

type Product = {
    id: string;
    type: "Course" | "Book";
    title: string;
    price: number;
    thumbnail: string | null;
    sold: number;
    rating: number;
    link: string;
};

type MentorPublicSession = {
    id: string;
    type: "one-on-one" | "group";
    title: string;
    description: string;
    price: number;
    startDate: string;
    endDate: string;
    dailyTime: string;
    image: string;
    capacity: number;
    spotsLeft: number;
    status: string;
    durationLabel: string;
};

type SocialLink = {
    linkedin?: string;
    twitter?: string;
    website?: string;
};

const DUMMY_INTRO_VIDEO = "https://youtu.be/BD8fDugktAE";
const DUMMY_SESSIONS_COMPLETED = 48;
const DUMMY_RATING = 5;

const DUMMY_REVIEWS: MentorReview[] = [
    {
        id: 1,
        reviewer_name: "Sarah K.",
        rating: 5,
        created_at: "Jul 23, 2026",
        comment:
            "Really helped me organize my thoughts and communicate more clearly. Sessions are practical and easy to follow, and always tailored to what I actually needed that week.",
    },
    {
        id: 2,
        reviewer_name: "Daniel O.",
        rating: 5,
        created_at: "Jul 18, 2026",
        comment: "Patient, encouraging, and always prepared. I noticed real improvement after just a few sessions.",
    },
    {
        id: 3,
        reviewer_name: "Amara N.",
        rating: 5,
        created_at: "Jul 11, 2026",
        comment: "Great mentor, gives honest feedback and genuinely wants you to improve.",
    },
    {
        id: 4,
        reviewer_name: "James T.",
        rating: 4,
        created_at: "Jul 5, 2026",
        comment: "Solid sessions overall, learned a lot about presenting my work with more confidence.",
    },
];

const DUMMY_MENTOR_SESSIONS: MentorPublicSession[] = [
    {
        id: "session-1",
        type: "one-on-one",
        title: "1:1 Career Mentorship",
        description: "A focused conversation to review your goals, strengths, and next steps for career growth.",
        price: 45000,
        startDate: "2026-09-18",
        endDate: "2026-09-25",
        dailyTime: "14:00",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
        capacity: 1,
        spotsLeft: 1,
        status: "open",
        durationLabel: "45 mins",
    },
    {
        id: "session-2",
        type: "group",
        title: "Product Design Critique Circle",
        description: "A small-group review session for portfolios, case studies, and design presentations.",
        price: 15000,
        startDate: "2026-09-20",
        endDate: "2026-09-27",
        dailyTime: "18:30",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
        capacity: 12,
        spotsLeft: 6,
        status: "open",
        durationLabel: "60 mins",
    },
];

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

const mapApiProductToProduct = (p: ApiDigitalProduct): Product => ({
    id: p.id,
    type: p.product_type === "course" ? "Course" : "Book",
    title: p.title,
    price: Number(p.price) || 0,
    thumbnail: p.cover_image,
    sold: 0,
    rating: 0,
    link: p.link,
});

const formatCurrency = (value: number) => `₦${value.toLocaleString()}`;
const formatDayDate = (value: string) => {
    if (!value) return "TBD";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
};
const formatTimeDisplay = (value: string) => {
    if (!value) return "TBD";
    const [hoursStr, minutesStr] = value.split(":");
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr ?? 0);
    const suffix = hours >= 12 ? "PM" : "AM";
    const normalizedHour = hours % 12 || 12;
    return `${normalizedHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const SOCIAL_ICON_MAP: Record<keyof SocialLink, React.ReactNode> = {
    linkedin: <FiLinkedin size={16} />,
    twitter: <FiTwitter size={16} />,
    website: <FiGlobe size={16} />,
};

const SOCIAL_LABEL_MAP: Record<keyof SocialLink, string> = {
    linkedin: "LinkedIn",
    twitter: "X (Twitter)",
    website: "Website",
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <a
        href={product.link || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col overflow-hidden rounded-xl transition-colors hover:bg-white/3"
        style={{ background: cardBg, border: cardBorder }}
    >
        <div className="relative">
            {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.title} className="h-40 w-full object-cover sm:h-48" />
            ) : (
                <div className="flex h-40 w-full items-center justify-center sm:h-48" style={{ background: "rgba(255,255,255,0.03)" }}>
                    {product.type === "Course" ? <FiPlayCircle size={28} className="text-white/15" /> : <FiBookOpen size={28} className="text-white/15" />}
                </div>
            )}
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold" style={{ background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(4px)" }}>
                {product.type === "Course" ? <FiPlayCircle size={13} /> : <FiBookOpen size={13} />}
                {product.type}
            </span>
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
            <h3 className="mb-1 wrap-break-words text-base font-bold text-white">{product.title}</h3>
            <p className="mb-3 text-sm text-white/40">{product.sold} sold</p>
            <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-white/60">
                    {product.rating > 0 ? (
                        <>
                            <BsStarFill size={13} className="fill-amber-400 text-amber-400" />
                            <p>{product.rating}</p>
                        </>
                    ) : (
                        <p className="text-white/30">No ratings yet</p>
                    )}
                </div>
                <span className="text-sm font-bold text-white">${product.price}</span>
            </div>
        </div>
    </a>
);

const Panel: React.FC<{ icon?: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }> = ({ icon, title, subtitle, children }) => (
    <div className="mb-5 rounded-xl p-4 sm:p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/90">
            {icon}
            {title}
        </div>
        {subtitle && <p className="mb-4 text-xs text-white/35">{subtitle}</p>}
        {children}
    </div>
);

const SectionPlaceholder: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center justify-center rounded-lg px-4 py-6 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
        <p className="text-xs italic text-white/25">{text}</p>
    </div>
);

const ReviewAvatar: React.FC<{ name: string; avatar?: string }> = ({ name, avatar }) => {
    const initials = name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return avatar ? (
        <img src={avatar} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
    ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
            {initials || "?"}
        </div>
    );
};

const ReviewCard: React.FC<{ review: MentorReview }> = ({ review }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = review.comment.length > 160;
    const displayText = expanded || !isLong ? review.comment : `${review.comment.slice(0, 160).trim()}…`;

    return (
        <div>
            <div className="mb-3 flex items-center gap-3">
                <ReviewAvatar name={review.reviewer_name} avatar={review.reviewer_avatar} />
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{review.reviewer_name}</p>
                    <p className="text-xs text-white/35">{review.created_at}</p>
                </div>
            </div>
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                    <FiStar
                        key={index}
                        size={13}
                        style={{
                            color: index < Math.round(review.rating) ? "black" : "rgba(255,255,255,0.15)",
                            fill: index < Math.round(review.rating) ? "#a6ff00" : "none",
                        }}
                    />
                ))}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white">
                {displayText}
                {isLong && (
                    <button onClick={() => setExpanded((prev) => !prev)} className="mt-1 block text-xs font-semibold hover:underline" style={{ color: "#a6ff00" }}>
                        {expanded ? "Show less" : "Show more"}
                    </button>
                )}
            </p>
        </div>
    );
};

const MentorSessionCard: React.FC<{ session: MentorPublicSession; onSelect: (session: MentorPublicSession) => void }> = ({ session, onSelect }) => (
    <div className="rounded-2xl bg-white/5 p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md sm:h-16 sm:w-16">
                <img src={session.image} alt={session.title} className="h-full w-full object-cover" />
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 text-base font-bold text-white">{session.title}</h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-white/55">{session.description}</p>
            </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/55">
            <span className="flex items-center gap-1.5">
                <FiClock size={13} />
                {session.dailyTime ? formatTimeDisplay(session.dailyTime) : "Flexible"}
            </span>
            <span className="text-white/40">
                {formatDayDate(session.startDate)} – {formatDayDate(session.endDate)}
            </span>
            <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold capitalize text-black">
                {session.type === "one-on-one" ? "1-1 Session" : "Group Session"}
            </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
            <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/40">
                    {session.type === "one-on-one" ? "Single mentor slot" : `${session.capacity} total · ${session.spotsLeft} left`}
                </span>
            </div>
            <p className="text-base font-bold text-white sm:text-lg">{formatCurrency(session.price)}</p>
        </div>

        <button type="button" onClick={() => onSelect(session)} className="mt-2 w-full rounded-md bg-white px-4 py-2.5 text-xs font-bold text-black">
            Book Session
        </button>
    </div>
);

const SessionDetailsModal: React.FC<{ session: MentorPublicSession; isClosing?: boolean; onClose: () => void; onBook: () => void }> = ({ session, isClosing = false, onClose, onBook }) => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} onClick={onClose} style={{ animation: isClosing ? 'modalFadeOut 0.22s ease-out forwards' : 'modalFadeIn 0.22s ease-out forwards' }}>
        <div className={`max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-5 shadow-2xl transition-all duration-300 ${isClosing ? 'translate-y-3 scale-[0.98] opacity-0' : 'translate-y-0 scale-100 opacity-100'}`} style={{ background: "rgba(10,13,9,0.9)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", animation: isClosing ? 'modalPanelOut 0.22s ease-out forwards' : 'modalPanelIn 0.22s ease-out forwards' }} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Session Details</h3>
                <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:text-white" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <FiX size={16} />
                </button>
            </div>

            <div className="mb-4 overflow-hidden rounded-xl">
                <img src={session.image} alt={session.title} className="h-44 w-full object-cover" />
            </div>

            <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-xl font-bold text-white">{session.title}</h4>
                <span className="rounded bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                    {session.type === "one-on-one" ? "1-1 Session" : "Group Session"}
                </span>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-white/65">{session.description}</p>

            <div className="grid grid-cols-2 gap-3 text-xs text-white/75">
                <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-white/40">Date</p>
                    <p className="mt-1 font-semibold text-white">
                        {formatDayDate(session.startDate)} – {formatDayDate(session.endDate)}
                    </p>
                </div>
                <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-white/40">Time</p>
                    <p className="mt-1 font-semibold text-white">{formatTimeDisplay(session.dailyTime)}</p>
                </div>
                <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-white/40">Duration</p>
                    <p className="mt-1 font-semibold text-white">{session.durationLabel}</p>
                </div>
                <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-white/40">Availability</p>
                    <p className="mt-1 font-semibold text-white">{session.spotsLeft > 0 ? `${session.spotsLeft} spots left` : "Sold out"}</p>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg px-3 py-3" style={{ background: "rgba(166,255,0,0.08)", border: "1px solid rgba(166,255,0,0.18)" }}>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Price</span>
                <span className="text-lg font-black text-white">{formatCurrency(session.price)}</span>
            </div>

            <div className="mt-5 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white/80" style={{ background: "rgba(255,255,255,0.06)" }}>
                    Close
                </button>
                <button type="button" onClick={onBook} className="flex-1 rounded-lg py-2.5 text-sm font-bold text-black" style={{ background: "#fff" }}>
                    Book Session
                </button>
            </div>
        </div>
    </div>
);

const ShareModal: React.FC<{ mentorName: string; mentorAvatar?: string; rating: number | null; reviewCount: number; isApproved?: boolean; isClosing?: boolean; onClose: () => void }> = ({ mentorName, mentorAvatar, rating, reviewCount, isApproved, isClosing = false, onClose }) => {
    const [copied, setCopied] = useState(false);
    const shareUrl = window.location.href;
    const shareTitle = mentorName ? `${mentorName} on Betamind` : "Mentor profile";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard blocked.
        }
    };

    const shareLinks = [
        { id: "whatsapp", label: "WhatsApp", icon: <FaWhatsapp size={16} />, href: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}` },
        { id: "reddit", label: "Reddit", icon: <FaRedditAlien size={16} />, href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}` },
        { id: "facebook", label: "Facebook", icon: <FaFacebookF size={16} />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
        { id: "email", label: "Email", icon: <FiMail size={16} />, href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}` },
        { id: "linkedin", label: "LinkedIn", icon: <FaLinkedinIn size={16} />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
        { id: "x", label: "X (Twitter)", icon: <FiTwitter size={16} />, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}` },
    ];

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} onClick={onClose} style={{ animation: isClosing ? 'modalFadeOut 0.22s ease-out forwards' : 'modalFadeIn 0.22s ease-out forwards' }}>
            <div className={`w-full max-w-md overflow-y-auto rounded-2xl p-6 shadow-2xl transition-all duration-300 ${isClosing ? 'translate-y-3 scale-[0.98] opacity-0' : 'translate-y-0 scale-100 opacity-100'}`} style={{ background: "rgba(10,13,9,0.55)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", animation: isClosing ? 'modalPanelOut 0.22s ease-out forwards' : 'modalPanelIn 0.22s ease-out forwards' }} onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">Share this mentor</h3>
                        <p className="mt-0.5 text-xs text-white/40">{mentorName}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 hover:text-white" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <FiX size={16} />
                    </button>
                </div>

                <div className="mb-6 flex items-center gap-3">
                    {mentorAvatar ? (
                        <img src={mentorAvatar} alt={mentorName} className="h-14 w-14 shrink-0 rounded-xl object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                    ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70"><FiUser size={18} /></div>
                    )}
                    <div className="min-w-0">
                        <p className="truncate text-base font-bold text-white">{mentorName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            {rating !== null && (
                                <span className="flex items-center gap-1 text-xs text-white/60">
                                    <FiStar size={12} style={{ color: "#a6ff00", fill: "#a6ff00" }} />
                                    {rating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? "" : "s"})
                                </span>
                            )}
                            {isApproved && (
                                <span className="flex items-center gap-1 text-xs text-white/60">
                                    <FiCheckCircle size={12} className="text-neutral-600" />
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="mb-2 block text-sm font-semibold text-white">Profile link</label>
                    <div className="flex items-center gap-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <input readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-xl bg-transparent px-4 py-3 text-sm text-white/70 outline-none" />
                        <button onClick={handleCopy} className="mr-1.5 shrink-0 rounded-lg px-3.5 py-2 text-xs font-bold transition-transform hover:scale-[1.02]" style={{ background: "#a6ff00", color: "#000" }}>
                            {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    {shareLinks.map((link) => (
                        <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:text-white" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            {link.icon}
                            {link.label}
                        </a>
                    ))}
                </div>

                <Button variant="white" className="mt-6 w-full py-3.5 text-xs" onClick={onClose}>
                    Done
                </Button>
            </div>
        </div>
    );
};

const PublicProfile = () => {
    const navigate = useNavigate();
    const { myProfile, isLoading: userLoading } = useGetMyUserProfile();
    const { myMentorProfile, isLoading: mentorLoading } = useGetMyMentorProfile();
    const { digitalProduct } = useGetMentorDigitalProduct();
    const { mutate: bookMentorship, isPending: isBooking } = useBookMentorship();

    const [showShareModal, setShowShareModal] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [showFullBio, setShowFullBio] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [selectedSession, setSelectedSession] = useState<MentorPublicSession | null>(null);
    const [bookingNote, setBookingNote] = useState('');
    const [shareModalClosing, setShareModalClosing] = useState(false);
    const [bookModalClosing, setBookModalClosing] = useState(false);
    const [sessionModalClosing, setSessionModalClosing] = useState(false);
    const rawProducts: ApiDigitalProduct[] = Array.isArray(digitalProduct?.data) ? digitalProduct.data : digitalProduct?.data?.results ?? [];
    const publishedProducts = rawProducts.filter((p) => p.is_published);
    const products: Product[] = publishedProducts.map(mapApiProductToProduct);

    const mentorProfile = myMentorProfile?.data;
    const userProfile = myProfile?.data;
    const mentorName = [mentorProfile?.nick_name, userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(" ") || "Mentor";
    const mentorAvatar = userProfile?.avatar || mentorProfile?.cover_images;
    const mentorSessions: MentorPublicSession[] = DUMMY_MENTOR_SESSIONS;
    const location = [mentorProfile?.state, mentorProfile?.country].filter(Boolean).join(", ") || "Location not added yet";
    const categories: string[] = Array.isArray(mentorProfile?.categories) ? mentorProfile.categories : [];
    const expertise: string[] = Array.isArray(mentorProfile?.expertise) ? mentorProfile.expertise : [];
    const socialLink: SocialLink = mentorProfile?.social_link ?? {};
    const activeSocials = (Object.keys(socialLink) as (keyof SocialLink)[]).filter((platform) => !!socialLink[platform]);
    const introVideo: string | null = mentorProfile?.video_link ?? DUMMY_INTRO_VIDEO;
    const introVideoEmbedUrl = introVideo ? getYouTubeEmbedUrl(introVideo) : null;
    const reviews: MentorReview[] = DUMMY_REVIEWS;
    const reviewCount: number = mentorProfile?.review_count ?? reviews.length;
    const averageRating: number | null = typeof mentorProfile?.rating === "number" ? mentorProfile.rating : reviews.length > 0 ? DUMMY_RATING : null;
    const sessionsCompleted: number | null = typeof mentorProfile?.sessions_completed === "number" ? mentorProfile.sessions_completed : DUMMY_SESSIONS_COMPLETED;

    const bio = mentorProfile?.bio || "";
    const maxBioLength = 180;
    const isLongBio = bio.length > maxBioLength;
    const displayedBio = showFullBio || !isLongBio ? bio : `${bio.slice(0, maxBioLength).trim()}...`;

    const handleBookMentorship = (session?: MentorPublicSession) => {
        setBookingError(null);
        setSelectedSession(session ?? null);
        setBookingNote('');
        setShowBookModal(Boolean(session));
    };

    const closeShareModal = () => {
        if (shareModalClosing) return;
        setShareModalClosing(true);
        window.setTimeout(() => {
            setShowShareModal(false);
            setShareModalClosing(false);
        }, 220);
    };

    const closeSessionModal = () => {
        if (sessionModalClosing) return;
        setSessionModalClosing(true);
        window.setTimeout(() => {
            setSelectedSession(null);
            setSessionModalClosing(false);
        }, 220);
    };

    const handleCloseBookModal = () => {
        if (isBooking) return;
        if (bookModalClosing) return;
        setBookModalClosing(true);
        window.setTimeout(() => {
            setShowBookModal(false);
            setSelectedSession(null);
            setBookingError(null);
            setBookingNote('');
            setBookModalClosing(false);
        }, 220);
    };

    const handleBookingSubmit = () => {
        const sessionToBook = selectedSession;
        if (!sessionToBook) {
            setBookingError("Please select a session before continuing.");
            return;
        }

        const trimmedNote = bookingNote.trim();
        const payload: Record<string, any> = {
            session_type: sessionToBook.type === "group" ? "group" : "individual",
            note: trimmedNote,
            gateway: "paystack",
        };

        if (sessionToBook.type === "group") {
            payload.group_session = Number(sessionToBook.id);
        } else {
            payload.individual_session = Number(sessionToBook.id);
        }

        if (!trimmedNote) {
            setBookingError("Please add a short note or description before continuing.");
            return;
        }

        setBookingError(null);
        bookMentorship(payload, {
            onSuccess: (response: any) => {
                const authorizationUrl = response?.data?.authorization_url || response?.authorization_url;
                if (authorizationUrl) {
                    setShowBookModal(false);
                    setSelectedSession(null);
                    setBookingNote('');
                    window.location.href = authorizationUrl;
                    return;
                }

                setShowBookModal(false);
                setSelectedSession(null);
                setBookingNote('');
                navigate('/dashboard/session-booked-success');
            },
            onError: (error: any) => {
                const message =
                    error?.response?.data?.message ||
                    error?.response?.detail ||
                    error?.response?.data?.detail ||
                    "Something went wrong while sending your request. Please try again.";
                setBookingError(message);
                toast(message, { type: "error" });
            },
        });
    };

    const loading = userLoading || mentorLoading;

    if (loading) {
        return (
            <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
                <LoadingOverlay visible={true} />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full" style={{ background: "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)" }}>
            <ToastContainer theme="dark" />
            {isBooking && <LoadingOverlay visible={true} />}

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 sm:py-14">
                <Link to="/dashboard/explore" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/40 transition-colors hover:text-white/70">
                    <FiArrowLeft size={14} />
                    Explore
                </Link>

                <div className="relative mb-16 sm:mb-20">
                    <div className="relative overflow-hidden rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                        {mentorProfile?.cover_images ? (
                            <img src={mentorProfile.cover_images} alt={mentorName} className="h-32 w-full object-cover lg:h-40" />
                        ) : (
                            <div className="h-32 w-full lg:h-40" style={{ background: "linear-gradient(90deg, #34d399 0%, #a3e635 45%, #000000 100%)" }} />
                        )}
                        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />
                    </div>

                    {mentorAvatar ? (
                        <img src={mentorAvatar} alt={mentorName} className="absolute -bottom-6 left-4 z-10 h-16 w-16 rounded-xl object-cover lg:-bottom-10 lg:h-20 lg:w-20" style={{ border: "4px solid #05080e", boxShadow: "0 0 0 1px rgba(205,220,57,.2)" }} />
                    ) : (
                        <div className="absolute -bottom-6 left-4 z-10 flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-white/70 lg:-bottom-10 lg:h-20 lg:w-20" style={{ border: "4px solid #05080e", boxShadow: "0 0 0 1px rgba(205,220,57,.2)" }}>
                            <FiUser size={24} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px] lg:gap-10">
                    <div>
                        <div className="mb-1 flex items-start justify-between gap-3">
                            <div>
                                {mentorProfile?.nick_name && <p className="pt-1.5 text-sm text-white/40">@{mentorProfile.nick_name}</p>}
                                <h1 className="flex flex-wrap items-center gap-2 text-2xl font-black text-white sm:text-3xl">
                                    {mentorName}
                                    {mentorProfile?.is_approved && <BsFillCheckCircleFill size={20} className="shrink-0 text-green-100" title="Verified mentor" />}
                                </h1>
                            </div>

                            <button onClick={() => setShowShareModal(true)} title="Share mentor profile" aria-label="Share mentor profile" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-neutral-100 transition-colors">
                                <FiShare2 size={16} />
                            </button>
                        </div>

                        <div className="mt-1 mb-8 flex flex-wrap items-center gap-3">
                            {mentorProfile?.occupation && (
                                <div className="inline-block rounded-md border border-neutral-700 px-4 py-1.5 text-sm font-semibold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)" }}>
                                    {mentorProfile.occupation}
                                </div>
                            )}

                            {activeSocials.length > 0 && (
                                <div className="flex items-center gap-2">
                                    {activeSocials.map((platform) => (
                                        <a key={platform} href={socialLink[platform]} target="_blank" rel="noopener noreferrer" title={SOCIAL_LABEL_MAP[platform]} className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-black transition-colors">
                                            {SOCIAL_ICON_MAP[platform]}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                            {typeof mentorProfile?.years_of_experience === "number" ? (
                                <div className="flex items-center gap-1.5 text-sm text-white/80">
                                    <div className="rounded-md bg-white/10 p-2">
                                        <FiAward size={15} className="text-neutral-100" />
                                    </div>
                                    {mentorProfile.years_of_experience}+ years of experience
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-sm italic text-white/25">
                                    <FiAward size={14} />
                                    Experience not added yet
                                </div>
                            )}

                            {location ? (
                                <div className="flex items-center gap-1.5 text-sm text-white/80">
                                    <div className="rounded-md bg-white/10 p-2">
                                        <FiMapPin size={15} className="text-neutral-100" />
                                    </div>
                                    {location}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-sm italic text-white/25">
                                    <FiMapPin size={14} />
                                    Location not added yet
                                </div>
                            )}

                            {sessionsCompleted !== null ? (
                                <div className="flex items-center gap-1.5 text-sm text-white/80">
                                    <div className="rounded-md bg-white/10 p-2">
                                        <FiUsers size={15} className="text-neutral-100" />
                                    </div>
                                    {sessionsCompleted} session{sessionsCompleted === 1 ? "" : "s"} completed
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-sm italic text-white/25">
                                    <FiUsers size={14} />
                                    No sessions yet
                                </div>
                            )}
                        </div>

                        <div className="mb-10 rounded-md bg-[rgba(255,255,255,0.03)] p-2">
                            {introVideo ? (
                                <div className="overflow-hidden rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.08)", aspectRatio: "16 / 9" }}>
                                    {introVideoEmbedUrl ? (
                                        <iframe
                                            src={introVideoEmbedUrl}
                                            title={`${mentorName} mentorship style intro`}
                                            className="h-full w-full"
                                            style={{ border: 0 }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video src={introVideo} poster={mentorAvatar || undefined} controls className="h-full w-full bg-black" />
                                    )}
                                </div>
                            ) : (
                                <SectionPlaceholder text="No introduction video added yet" />
                            )}
                        </div>

                        <div className="border-t border-neutral-800 pb-3">
                            <p className="pb-2 pt-5 text-sm text-white/70">About Me:</p>
                            {bio ? (
                                <>
                                    <p className="max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">{displayedBio}</p>
                                    {isLongBio && (
                                        <button onClick={() => setShowFullBio((prev) => !prev)} className="mt-2 text-sm font-medium hover:underline" style={{ color: "#a6ff00" }}>
                                            {showFullBio ? "See Less" : "See More"}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm italic text-white/25">No bio added yet</p>
                            )}
                        </div>

                        <Panel icon={<FiTag size={14} className="text-neutral-600" />} title="Focus areas">
                            {categories.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <span key={cat} className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold capitalize text-black">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <SectionPlaceholder text="No focus areas added yet" />
                            )}
                        </Panel>

                        <Panel icon={<FiBriefcase size={14} className="text-neutral-600" />} title="Expertise">
                            {expertise.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {expertise.map((skill) => (
                                        <span key={skill} className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <SectionPlaceholder text="No expertise added yet" />
                            )}
                        </Panel>

                        <Panel icon={<FiBookOpen size={14} className="text-neutral-600" />} title={`Products by ${mentorName.split(" ")[0] || "this mentor"}`}>
                            {products.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <SectionPlaceholder text="No courses or books uploaded yet" />
                            )}
                        </Panel>

                        <div id="reviews" className="scroll-mt-24">
                            <Panel icon={<FiStar size={14} className="text-neutral-600" />} title="What students say">
                                {reviews.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                        {reviews.map((review) => (
                                            <ReviewCard key={review.id} review={review} />
                                        ))}
                                    </div>
                                ) : (
                                    <SectionPlaceholder text="No reviews yet" />
                                )}
                            </Panel>
                        </div>
                    </div>

                    <div className="lg:sticky lg:top-8">
                        <div className="rounded-xl bg-neutral-950 p-4 sm:p-5">
                            <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/80">
                                <FiCalendar size={13} />
                                Sessions
                            </div>

                            <div className="space-y-4">
                                {mentorSessions.map((session) => (
                                    <MentorSessionCard key={session.id} session={session} onSelect={setSelectedSession} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showShareModal && (
                <ShareModal
                    mentorName={mentorName}
                    mentorAvatar={mentorAvatar}
                    rating={averageRating}
                    reviewCount={reviewCount}
                    isApproved={mentorProfile?.is_approved}
                    isClosing={shareModalClosing}
                    onClose={closeShareModal}
                />
            )}

            {selectedSession && (
                <SessionDetailsModal
                    session={selectedSession}
                    isClosing={sessionModalClosing}
                    onClose={closeSessionModal}
                    onBook={() => {
                        handleBookMentorship(selectedSession);
                        setSelectedSession(null);
                    }}
                />
            )}

            {showBookModal && selectedSession && (
                <div>
                    <div className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${bookModalClosing ? 'opacity-0' : 'opacity-100'}`} onClick={handleCloseBookModal} style={{ animation: bookModalClosing ? 'modalFadeOut 0.22s ease-out forwards' : 'modalFadeIn 0.22s ease-out forwards' }} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className={`w-full max-w-lg rounded-2xl bg-[#0a0f08] p-6 shadow-2xl transition-all duration-300 ${bookModalClosing ? 'translate-y-3 scale-[0.98] opacity-0' : 'translate-y-0 scale-100 opacity-100'}`} style={{ border: "1px solid rgba(255,255,255,0.1)", animation: bookModalClosing ? 'modalPanelOut 0.22s ease-out forwards' : 'modalPanelIn 0.22s ease-out forwards' }}>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">{selectedSession.type === "group" ? "Book group session" : "Book 1:1 session"}</h3>
                                <button type="button" onClick={handleCloseBookModal} className="rounded-lg p-2 text-white/70 hover:text-white" aria-label="Close">
                                    <FiX size={16} />
                                </button>
                            </div>

                            {bookingError && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{bookingError}</div>}

                            <div className="mb-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/75">
                                <p className="font-semibold text-white">{selectedSession.title}</p>
                                <p className="mt-1 text-xs text-white/55">{selectedSession.type === "group" ? "Group session" : "1:1 session"} · {formatCurrency(selectedSession.price)}</p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white">Note / description</label>
                                <textarea
                                    rows={5}
                                    value={bookingNote}
                                    onChange={(e) => setBookingNote(e.target.value)}
                                    placeholder={`Hi ${mentorName}, I'd love your help with...`}
                                    className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/25"
                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleBookingSubmit}
                                disabled={isBooking}
                                className="mt-5 w-full rounded-lg bg-white px-4 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isBooking ? "Processing..." : "Continue to Paystack"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalFadeOut { from { opacity: 1; } to { opacity: 0; } }
                @keyframes modalPanelIn { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes modalPanelOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(14px) scale(0.98); } }
            `}</style>
        </div>
    );
};

export default PublicProfile;

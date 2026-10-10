import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    FiAlertTriangle,
    FiBarChart2,
    FiBookOpen,
    FiBriefcase,
    FiCalendar,
    FiCamera,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiCode,
    FiDollarSign,
    FiEdit3,
    FiPackage,
    FiPenTool,
    FiPlayCircle,
    FiSearch,
    FiTag,
    FiTrendingUp,
    FiUser,
    FiUsers,
    FiX,
} from "react-icons/fi";
import { MdWork } from "react-icons/md";
import { Link } from "react-router-dom";
import DashFooter from "../../component/DashFooter";
import LoadingOverlay from "../../component/LoadingOverlay";
import { useGetAllEvents, useGetDigitalProduct, useGetMentors } from "../../hooks/queries/allQueriess";
import { formatNaira } from "../../utils/currency";
import { LocationIcon } from "./EventShared";
import {
    AvatarStack,
    EventMetaBadges,
    formatTicketPrice,
    mapApiEventToRegistered,
    type ApiEvent,
    type RegisteredEvent,
} from "./Overview";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface Topic {
    id: string;
    name: string;
    count: string;
    icon: React.ReactNode;
    color: string;
}

export interface MentorSocial {
    platform: "instagram" | "x" | "linkedin" | "youtube";
    url: string;
}

export interface Mentor {
    id: string;
    name: string;
    avatar: string;
    banner: string;
    bio: string;
    tag: string;
    title?: string;
    verified?: boolean;
    categories?: string[];
    socials?: MentorSocial[];
    yearsExperience?: number;
}

export interface ProductCreator {
    name: string;
    avatar: string | null;
}

export type ProductType = "Course" | "Book" | "Manual" | "Template" | "Workbook" | "Toolkit";
export type ApiProductType = "course" | "book" | "manual" | "template" | "workbook" | "toolkit";

export interface ApiDigitalProduct {
    id: string;
    mentor: string;
    user_name: string;
    link: string;
    product_type: ApiProductType;
    category?: string;
    title: string;
    description: string;
    course_content: { title: string; description: string }[] | null;
    cover_image: string | null;
    price: string;
    is_published: boolean;
    video: string | null;
    summary: string | null;
    created_at: string;
}

export interface DigitalProduct {
    id: string;
    type: ProductType;
    title: string;
    author: string;
    creator: ProductCreator;
    thumbnail: string | null;
    price: string;
    rating?: number;
    category?: string;
}

// Shape returned by every paginated endpoint
export interface Paginated<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// ─── Pagination config ──────────────────────────────────────────────────────
export const PAGE_SIZE = 4;

// How many topic cards are visible on mobile before "See all"
const TOPICS_VISIBLE_ON_MOBILE = 4;

// Waits until the value stops changing before returning it (used for search)
export const useDebouncedValue = <T,>(value: T, delay = 400): T => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
};

const formatPrice = (price: string) => formatNaira(price, "Free");

const toTitleCase = (s: string): ProductType =>
    (s.charAt(0).toUpperCase() + s.slice(1)) as ProductType;

const mapCreator = (p: any): ProductCreator => {
    const m = p.mentor;
    if (m && typeof m === "object") {
        const fullName = `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim();
        return { name: fullName || p.user_name, avatar: m.avatar ?? null };
    }
    return { name: p.user_name, avatar: null };
};

export const mapApiProductToCard = (p: ApiDigitalProduct): DigitalProduct => ({
    id: p.id,
    type: toTitleCase(p.product_type),
    title: p.title,
    author: p.user_name,
    creator: mapCreator(p),
    thumbnail: p.cover_image,
    price: formatPrice(p.price),
    category: p.category,
});

// ─── Topic derivation (unchanged) ───────────────────────────────────────────
const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; color: string }> = {
    design: { icon: <FiPenTool size={25} />, color: "#f472b6" },
    engineering: { icon: <FiCode size={25} />, color: "#facc15" },
    growth: { icon: <FiTrendingUp size={25} />, color: "#4ade80" },
    finance: { icon: <FiDollarSign size={25} />, color: "#a78bfa" },
    writing: { icon: <FiEdit3 size={25} />, color: "#60a5fa" },
    business: { icon: <FiBriefcase size={25} />, color: "#fb923c" },
    photography: { icon: <FiCamera size={25} />, color: "#5eead4" },
    product: { icon: <FiBarChart2 size={25} />, color: "#f87171" },
};
const DEFAULT_CATEGORY_STYLE = { icon: <FiTag size={25} />, color: "#94a3b8" };

export const buildTopicsFromMentors = (mentors: any[]): Topic[] => {
    const counts = new Map<string, number>();
    mentors.forEach((m) => {
        const categories: string[] = m?.categories ?? [];
        categories.forEach((raw) => {
            const name = raw?.trim();
            if (!name) return;
            counts.set(name, (counts.get(name) ?? 0) + 1);
        });
    });

    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => {
            const style = CATEGORY_STYLES[name.toLowerCase()] ?? DEFAULT_CATEGORY_STYLE;
            return {
                id: name.toLowerCase().replace(/\s+/g, "-"),
                name,
                count: `${count} Mentor${count === 1 ? "" : "s"}`,
                icon: style.icon,
                color: style.color,
            };
        });
};

// ─── Pagination helpers ─────────────────────────────────────────────────────
const getPageNumbers = (current: number, total: number): (number | "...")[] => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | "...")[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("...");
    pages.push(total);

    return pages;
};

export const Pagination: React.FC<{
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}> = ({ page, totalPages, onPageChange, disabled = false }) => {
    if (totalPages <= 1) return null;

    const navBtn =
        "flex h-9 w-9 items-center justify-center rounded-md text-white/70 transition-colors cursor-pointer hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-white/70";

    return (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-1.5">
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={disabled || page === 1}
                aria-label="Previous page"
                className={navBtn}
                style={{ background: "rgba(255,255,255,0.06)" }}
            >
                <FiChevronLeft size={16} />
            </button>

            {getPageNumbers(page, totalPages).map((p, i) =>
                p === "..." ? (
                    <span key={`dots-${i}`} className="w-6 text-center text-white/30 text-sm select-none">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        disabled={disabled}
                        aria-label={`Page ${p}`}
                        aria-current={p === page ? "page" : undefined}
                        className="flex h-9 min-w-9 px-2 items-center justify-center rounded-md text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                        style={{
                            background: p === page ? "white" : "rgba(255,255,255,0.06)",
                            color: p === page ? "black" : "rgba(255,255,255,0.7)",
                        }}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={disabled || page === totalPages}
                aria-label="Next page"
                className={navBtn}
                style={{ background: "rgba(255,255,255,0.06)" }}
            >
                <FiChevronRight size={16} />
            </button>
        </nav>
    );
};

// ─── Section header ─────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="mb-6">
        <h2 className="text-white text-xl sm:text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
    </div>
);

// ─── Topic card ─────────────────────────────────────────────────────────────
const TopicCard: React.FC<{ topic: Topic; hiddenOnMobile?: boolean }> = ({ topic, hiddenOnMobile = false }) => (
    <Link
        to={`/dashboard/search?category=${encodeURIComponent(topic.name)}`}
        className={`${hiddenOnMobile ? "hidden sm:flex" : "flex"} items-center gap-3 sm:gap-4 rounded-xl p-3 sm:p-5 text-left transition-colors hover:bg-white/4 cursor-pointer w-full`}
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
        <div style={{ color: topic.color }}>{topic.icon}</div>
        <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{topic.name?.toUpperCase()}</p>
            <p className="text-white/40 text-sm">{topic.count}</p>
        </div>
    </Link>
);

export const MentorCard: React.FC<{ mentor: any }> = ({ mentor }) => {
    const categories: string[] = mentor?.categories ?? [];

    return (
        <Link
            to={`/dashboard/mentors/${mentor.id}`}
            className="rounded-xl lg:p-5 p-3 flex bg-white/5 flex-col"
        >
            <div className="flex items-center justify-between mb-4">
                <img
                    src={mentor?.avatar} loading="lazy" decoding="async"
                    alt={mentor?.name}
                    className="w-14 h-14 rounded-xl object-cover"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <button
                    onClick={(e) => e.preventDefault()}
                    className="px-4 py-1.5 bg-white rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                    Follow
                </button>
            </div>

            <h3 className="text-white font-bold text-base mb-1 truncate">{mentor?.first_name + " " + mentor?.last_name || mentor?.nick_name || mentor?.name}</h3>

            {mentor?.occupation && (
                <p className="text-white/60 text-sm mb-2 flex gap-1 items-center min-w-0">
                    <MdWork className="shrink-0" />
                    <span className="truncate">{mentor.occupation}</span>
                </p>
            )}
            <p className="text-white text-sm rounded-lg leading-relaxed lg:mb-4 mb-2 line-clamp-2">{mentor?.bio}</p>

            {categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {categories.slice(0, 2).map((category) => (
                        <span
                            key={category}
                            className="inline-block truncate bg-white/20 text-white w-fit px-2.5 py-1 rounded-md text-xs font-semibold capitalize"
                        >
                            {category}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
};

const MentorCardSkeleton: React.FC = () => (
    <div
        className="rounded-2xl lg:p-5 p-3 flex flex-col"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(205,220,57,.08)" }}
    >
        <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/5" />
            <div className="w-16 h-7 rounded-full bg-white/5" />
        </div>
        <div className="h-4 w-2/3 rounded bg-white/5 mb-2" />
        <div className="h-3 w-full rounded bg-white/5 mb-1.5" />
        <div className="h-3 w-4/5 rounded bg-white/5" />
    </div>
);

const NoMentorsState: React.FC<{ query?: string }> = ({ query }) => (
    <div
        className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl col-span-full"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}
    >
        <FiUsers size={22} className="text-white/20 mb-3" />
        <p className="text-white/40 text-sm">
            {query ? `No mentors match "${query}"` : "No mentors available right now"}
        </p>
    </div>
);

// ─── Event card ─────────────────────────────────────────────────────────────
export const EventCard: React.FC<{ event: RegisteredEvent }> = ({ event }) => (
    <>
        {/* Mobile compact card (2 columns) */}
        <Link
            to={event.publicUrl}
            className="flex sm:hidden flex-col rounded-xl overflow-hidden cursor-pointer bg-white/5"
        >
            <div className="relative">
                <img
                    src={event.thumbnail} loading="lazy" decoding="async"
                    alt={event.title}
                    className="w-full h-28 object-cover"
                />
                <span
                    className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{ background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(4px)" }}
                >
                    <FiCalendar size={10} />
                    {event.dateLabel}
                </span>
                <span
                    className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{
                        background:
                            formatTicketPrice(event.ticketPrice) === "Free"
                                ? "rgba(0,0,0,0.55)"
                                : "rgba(166,255,0,0.9)",
                        color: formatTicketPrice(event.ticketPrice) === "Free" ? "#fff" : "#000",
                        backdropFilter: "blur(4px)",
                    }}
                >
                    {formatTicketPrice(event.ticketPrice)}
                </span>
            </div>

            <div className="p-3 flex flex-col flex-1">
                <h3 className="text-white font-bold text-sm mb-1.5 line-clamp-2 wrap-break-word">{event.title}</h3>

                <div className="flex items-center gap-1 text-white/40 text-[11px] mb-1">
                    <FiClock size={11} className="shrink-0" />
                    <span className="truncate">{event.time}</span>
                </div>

                {event.location ? (
                    <div className="flex items-center gap-1 text-white/40 text-[11px] min-w-0">
                        <span className="shrink-0 flex items-center">
                            <LocationIcon location={event.location} size={11} />
                        </span>
                        <span className="truncate">{event.location}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-amber-400 text-[11px]">
                        <FiAlertTriangle size={11} className="shrink-0" />
                        <span>Location Missing</span>
                    </div>
                )}

                <div className="mt-auto pt-2.5">
                    {event.attendees.length > 0 ? (
                        <AvatarStack attendees={event.attendees} total={event.registered} size={18} />
                    ) : event.registered > 0 ? (
                        <span className="flex items-center gap-1 text-white/40 text-[11px]">
                            <FiUsers size={11} />
                            {event.registered} registered
                        </span>
                    ) : (
                        <span className="text-white/30 text-[11px]">Be the first to join</span>
                    )}
                </div>
            </div>
        </Link>

        {/* Desktop/tablet */}
        <Link
            to={event.publicUrl}
            className="hidden sm:flex rounded-md overflow-hidden flex-col transition-colors bg-white/5 cursor-pointer"
        >
            <div className="relative">
                <img src={event.thumbnail} loading="lazy" decoding="async" alt={event.title} className="w-full h-40 sm:h-48 object-cover" />
                <span
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                    style={{ background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(4px)" }}
                >
                    <FiCalendar size={13} />
                    {event.dateLabel}
                </span>
                <span
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-semibold"
                    style={{
                        background:
                            formatTicketPrice(event.ticketPrice) === "Free"
                                ? "rgba(0,0,0,0.55)"
                                : "rgba(166,255,0,0.9)",
                        color: formatTicketPrice(event.ticketPrice) === "Free" ? "#fff" : "#000",
                        backdropFilter: "blur(4px)",
                    }}
                >
                    {formatTicketPrice(event.ticketPrice)}
                </span>
            </div>
            <div className="p-4 sm:p-5 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 text-white/40 text-xs mb-2 min-w-0">
                    <span className="flex items-center gap-1 shrink-0">
                        <FiClock size={12} />
                        {event.time}
                    </span>
                    {event.location ? (
                        <span className="flex items-center gap-1 min-w-0">
                            <span className="text-white/20 shrink-0">·</span>
                            <span className="shrink-0 flex items-center">
                                <LocationIcon location={event.location} size={12} />
                            </span>
                            <span className="truncate">{event.location}</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-amber-400 shrink-0">
                            <span className="text-white/20">·</span>
                            <FiAlertTriangle size={12} />
                            <span>Location Missing</span>
                        </span>
                    )}
                </div>

                <h3 className="text-white font-bold text-base mb-2 wrap-break-word line-clamp-2">{event.title}</h3>

                <div className="mb-3">
                    <EventMetaBadges event={event} size="sm" />
                </div>

                <div className="flex items-center mt-auto">
                    {event.attendees.length > 0 ? (
                        <AvatarStack attendees={event.attendees} total={event.registered} size={20} />
                    ) : event.registered > 0 ? (
                        <span className="flex items-center gap-1.5 text-white/40 text-xs">
                            <FiUsers size={12} />
                            {event.registered} registered
                        </span>
                    ) : (
                        <span className="text-white/30 text-xs">Be the first to join</span>
                    )}
                </div>
            </div>
        </Link>
    </>
);

const EventCardSkeleton: React.FC = () => (
    <>
        <div
            className="flex sm:hidden flex-col rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
            <div className="w-full h-28 bg-white/5" />
            <div className="p-3 space-y-2">
                <div className="h-4 w-4/5 rounded bg-white/5" />
                <div className="h-3 w-1/2 rounded bg-white/5" />
                <div className="h-3 w-2/3 rounded bg-white/5" />
            </div>
        </div>

        <div
            className="hidden sm:flex rounded-xl overflow-hidden flex-col"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
            <div className="w-full h-40 sm:h-48 bg-white/5" />
            <div className="p-4 sm:p-5 flex flex-col gap-2.5">
                <div className="h-3 w-1/2 rounded bg-white/5" />
                <div className="h-4 w-3/4 rounded bg-white/5" />
                <div className="h-3 w-2/3 rounded bg-white/5" />
            </div>
        </div>
    </>
);

const NoEventsState: React.FC<{ query?: string }> = ({ query }) => (
    <div
        className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl col-span-full"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}
    >
        <FiCalendar size={22} className="text-white/20 mb-3" />
        <p className="text-white/40 text-sm">
            {query ? `No events match "${query}"` : "No upcoming events right now"}
        </p>
    </div>
);

// ─── Digital product card ───────────────────────────────────────────────────
export const ProductCard: React.FC<{ product: DigitalProduct }> = ({ product }) => (
    <Link
        to={`/dashboard/products/${product.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md overflow-hidden flex flex-col transition-colors bg-white/5 cursor-pointer"
    >
        <div className="relative">
            {product.thumbnail ? (
                <img src={product.thumbnail} loading="lazy" decoding="async" alt={product.title} className="w-full h-40 sm:h-48 object-cover" />
            ) : (
                <div
                    className="w-full h-40 sm:h-48 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                >
                    {product.type === "Course" ? (
                        <FiPlayCircle size={28} className="text-white/15" />
                    ) : product.type === "Book" ? (
                        <FiBookOpen size={28} className="text-white/15" />
                    ) : (
                        <FiPackage size={28} className="text-white/15" />
                    )}
                </div>
            )}
            <span
                className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                style={{ background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(4px)" }}
            >
                {product.type === "Course" ? (
                    <FiPlayCircle size={13} />
                ) : product.type === "Book" ? (
                    <FiBookOpen size={13} />
                ) : (
                    <FiPackage size={13} />
                )}
                {product.type}
            </span>
        </div>
        <div className="p-3 sm:p-5 flex flex-col flex-1">
            <h3 className="text-white font-bold text-base mb-1 wrap-break-word">{product.title}</h3>
            <div className="flex justify-between items-center pt-3 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                        {product.creator.avatar ? (
                            <img
                                src={product.creator.avatar} loading="lazy" decoding="async"
                                alt={product.creator.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FiUser size={12} className="text-white/30" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white/30 text-[10px] uppercase tracking-wide leading-none mb-0.5">
                            Creator
                        </p>
                        <p className="text-white/60 text-xs truncate">{product.creator.name}</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-3 bg-neutral-900 p-1.5 px-3 rounded-md">
                <span className="text-white/50 font-medium text-xs shrink-0 ">Cost: </span>
                <span className="text-white font-bold text-sm shrink-0">{product.price}</span>
            </div>
            <div className="mt-3">
                <button className="cursor-pointer w-full text-center bg-white gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-black transition-transform hover:scale-[1.02]">
                    View Product
                </button>
            </div>
        </div>
    </Link>
);

const ProductCardSkeleton: React.FC = () => (
    <div
        className="rounded-md overflow-hidden flex flex-col"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
        <div className="w-full h-40 sm:h-48 bg-white/5" />
        <div className="p-4 sm:p-5 flex flex-col gap-2.5">
            <div className="h-4 w-3/4 rounded bg-white/5" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
    </div>
);

const NoProductsState: React.FC<{ query?: string }> = ({ query }) => (
    <div
        className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl col-span-full"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}
    >
        <FiBookOpen size={22} className="text-white/20 mb-3" />
        <p className="text-white/40 text-sm">
            {query ? `No products match "${query}"` : "No digital products available right now"}
        </p>
    </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────
const Explore: React.FC = () => {
    // ── Search (debounced so we don't hit the API on every keystroke) ───────
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search.trim(), 400);
    const searchParam = debouncedSearch || undefined;

    // ── Topics: mobile shows 4 until expanded ────────────────────────────────
    const [showAllTopics, setShowAllTopics] = useState(false);

    // ── Page state (one per section) ─────────────────────────────────────────
    const [mentorsPage, setMentorsPage] = useState(1);
    const [eventsPage, setEventsPage] = useState(1);
    const [productsPage, setProductsPage] = useState(1);

    // Back to page 1 whenever the search changes
    useEffect(() => {
        setMentorsPage(1);
        setEventsPage(1);
        setProductsPage(1);
    }, [debouncedSearch]);

    // ── Mentors (paginated) ──────────────────────────────────────────────────
    const {
        mentors,
        isLoading: mentorsLoading,
        isFetching: mentorsFetching,
    } = useGetMentors(mentorsPage, PAGE_SIZE, { search: searchParam });
    const mentorsData: Paginated<any> | undefined = mentors?.data;
    const mentorsList: any[] = mentorsData?.results ?? [];
    const mentorsTotalPages = Math.max(1, Math.ceil((mentorsData?.count ?? 0) / PAGE_SIZE));

    // Topics need ALL mentors' categories, not just the 4 on screen, so they
    // come from a separate, larger, unfiltered request.
    const { mentors: topicMentors, isLoading: topicsLoading } = useGetMentors(1, 100);
    const topics = useMemo(
        () => buildTopicsFromMentors(topicMentors?.data?.results ?? []),
        [topicMentors]
    );

    // ── Events (paginated) ───────────────────────────────────────────────────
    const {
        allEvents,
        isLoading: eventsLoading,
        isFetching: eventsFetching,
    } = useGetAllEvents(eventsPage, PAGE_SIZE, {
        status: "upcoming",
        ordering: "date",
        search: searchParam,
    });
    const eventsData: Paginated<ApiEvent> | undefined = allEvents?.data;
    const eventsList: RegisteredEvent[] = useMemo(
        () => (eventsData?.results ?? []).map(mapApiEventToRegistered),
        [eventsData]
    );
    const eventsTotalPages = Math.max(1, Math.ceil((eventsData?.count ?? 0) / PAGE_SIZE));

    // ── Digital products (paginated) ─────────────────────────────────────────
    const {
        digitalProduct,
        isLoading: productLoading,
        isFetching: productFetching,
    } = useGetDigitalProduct(productsPage, PAGE_SIZE, {
        is_published: true,
        search: searchParam,
    });
    const productsData: Paginated<ApiDigitalProduct> | undefined = digitalProduct?.data;
    const productsList: DigitalProduct[] = useMemo(
        () => (productsData?.results ?? []).map(mapApiProductToCard),
        [productsData]
    );
    const productsTotalPages = Math.max(1, Math.ceil((productsData?.count ?? 0) / PAGE_SIZE));

    // ── Scroll refs ──────────────────────────────────────────────────────────
    const mentorsSectionRef = useRef<HTMLElement>(null);
    const eventsSectionRef = useRef<HTMLElement>(null);
    const productsSectionRef = useRef<HTMLElement>(null);

    // Change page, then bring the top of that section back into view
    const changePage =
        (setPage: (p: number) => void, ref: React.RefObject<HTMLElement | null>) => (p: number) => {
            setPage(p);
            ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        };

    // Dim the grid while the next page is being fetched
    const fetchingClass = (fetching: boolean) =>
        `transition-opacity duration-200 ${fetching ? "opacity-50 pointer-events-none" : "opacity-100"}`;

    return (
        <div className="relative isolate flex w-full min-h-screen flex-col bg-black anim-fade-up">
            {/* Fixed background layer: painted once instead of re-painted while scrolling */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 -z-10"
                style={{ background: "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)" }}
            />
            <LoadingOverlay visible={mentorsLoading} />

            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="mb-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Explore</h1>
                            <p className="text-white/40 text-base max-w-2xl">
                                Find topics you care about, connect with mentors, or pick up a course or book to level up.
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-3 rounded-full px-4 py-3.5 mt-6 bg-neutral-900/40">
                        <FiSearch size={16} className="text-white/40 shrink-0" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search mentors, events, products..."
                            aria-label="Search Explore"
                            className="w-full bg-transparent outline-none text-sm text-white placeholder-white/30"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                                className="text-white/40 hover:text-white shrink-0 cursor-pointer"
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Topics */}
                <section className="mb-16">
                    <SectionHeader title="Browse by Topics" />
                    {topicsLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-16 rounded-xl ${i >= TOPICS_VISIBLE_ON_MOBILE ? "hidden sm:block" : ""}`}
                                    style={{
                                        background: "rgba(255,255,255,0.02)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                    }}
                                />
                            ))}
                        </div>
                    ) : topics.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {topics.map((topic, i) => (
                                    <TopicCard
                                        key={topic.id}
                                        topic={topic}
                                        hiddenOnMobile={!showAllTopics && i >= TOPICS_VISIBLE_ON_MOBILE}
                                    />
                                ))}
                            </div>
                            {topics.length > TOPICS_VISIBLE_ON_MOBILE && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllTopics((prev) => !prev)}
                                    className="sm:hidden mt-3 w-full rounded-xl py-2.5 text-xs font-semibold text-white/70 transition-colors hover:text-white cursor-pointer"
                                    style={{ background: "rgba(255,255,255,0.06)" }}
                                >
                                    {showAllTopics ? "Show less" : `See all ${topics.length} topics`}
                                </button>
                            )}
                        </>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center text-center py-8 px-4 rounded-xl"
                            style={{
                                background: "rgba(255,255,255,0.02)",
                                border: "1px dashed rgba(255,255,255,0.1)",
                            }}
                        >
                            <p className="text-white/40 text-sm">No categories yet</p>
                        </div>
                    )}
                </section>

                {/* Mentors */}
                <section ref={mentorsSectionRef} className="mb-16 scroll-mt-24">
                    <SectionHeader title="Featured Mentors" subtitle="Learn 1:1 from people who've done it" />
                    <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 ${fetchingClass(mentorsFetching && !mentorsLoading)}`}>
                        {mentorsLoading ? (
                            Array.from({ length: PAGE_SIZE }).map((_, i) => <MentorCardSkeleton key={i} />)
                        ) : mentorsList.length > 0 ? (
                            mentorsList.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)
                        ) : (
                            <NoMentorsState query={debouncedSearch} />
                        )}
                    </div>
                    {!mentorsLoading && (
                        <Pagination
                            page={mentorsPage}
                            totalPages={mentorsTotalPages}
                            disabled={mentorsFetching}
                            onPageChange={changePage(setMentorsPage, mentorsSectionRef)}
                        />
                    )}
                </section>

                {/* Events */}
                <section ref={eventsSectionRef} className="mb-16 scroll-mt-24">
                    <SectionHeader title="Events You Can Explore" subtitle="Join a session hosted by the community" />
                    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 ${fetchingClass(eventsFetching && !eventsLoading)}`}>
                        {eventsLoading ? (
                            Array.from({ length: PAGE_SIZE }).map((_, i) => <EventCardSkeleton key={i} />)
                        ) : eventsList.length > 0 ? (
                            eventsList.map((event) => <EventCard key={event.id} event={event} />)
                        ) : (
                            <NoEventsState query={debouncedSearch} />
                        )}
                    </div>
                    {!eventsLoading && (
                        <Pagination
                            page={eventsPage}
                            totalPages={eventsTotalPages}
                            disabled={eventsFetching}
                            onPageChange={changePage(setEventsPage, eventsSectionRef)}
                        />
                    )}
                </section>

                {/* Digital Products */}
                <section ref={productsSectionRef} className="scroll-mt-24">
                    <SectionHeader title="Digital Products" subtitle="Self-paced learning from top mentors" />
                    <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 ${fetchingClass(productFetching && !productLoading)}`}>
                        {productLoading ? (
                            Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductCardSkeleton key={i} />)
                        ) : productsList.length > 0 ? (
                            productsList.map((product) => <ProductCard key={product.id} product={product} />)
                        ) : (
                            <NoProductsState query={debouncedSearch} />
                        )}
                    </div>
                    {!productLoading && (
                        <Pagination
                            page={productsPage}
                            totalPages={productsTotalPages}
                            disabled={productFetching}
                            onPageChange={changePage(setProductsPage, productsSectionRef)}
                        />
                    )}
                </section>
            </div>

            <DashFooter />
        </div>
    );
};

export default Explore;
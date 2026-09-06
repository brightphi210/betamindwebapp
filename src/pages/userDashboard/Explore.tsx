import React, { useMemo } from 'react';
import {
    FiAlertTriangle,
    FiArrowRight,
    FiBarChart2,
    FiBookOpen,
    FiBriefcase,
    FiCalendar,
    FiCamera,
    FiClock,
    FiCode,
    FiDollarSign,
    FiEdit3,
    FiMapPin,
    FiPenTool,
    FiPlayCircle,
    FiTag,
    FiTrendingUp,
    FiUsers,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import LoadingOverlay from '../../component/LoadingOverlay';
import { useGetAllEvents, useGetDigitalProduct, useGetMentors } from '../../hooks/queries/allQueriess';
import {
    AvatarStack,
    EventMetaBadges,
    formatTicketPrice,
    mapApiEventToRegistered,
    type ApiEvent,
    type RegisteredEvent,
} from './Overview';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface Topic {
    id: string;
    name: string;
    count: string;
    icon: React.ReactNode;
    color: string;
}

export interface MentorSocial {
    platform: 'instagram' | 'x' | 'linkedin' | 'youtube';
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

// Shape returned by the digital-products endpoint (course_content is only
// populated for courses, summary only for books).
export interface ApiDigitalProduct {
    id: string;
    mentor: string;
    user_name: string;
    link: string;
    product_type: 'course' | 'book';
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

// Card-friendly shape ProductCard renders. Kept separate from
// ApiDigitalProduct so ProductCard doesn't need to know about the API's
// field names (cover_image vs thumbnail, product_type vs type, etc).
export interface DigitalProduct {
    id: string;
    type: 'Course' | 'Book';
    title: string;
    author: string;
    thumbnail: string | null;
    price: string;
    rating?: number;
}

const formatPrice = (price: string) => {
    const numeric = parseFloat(price);
    if (!numeric || numeric <= 0) return 'Free';
    const trimmed = numeric % 1 === 0 ? numeric.toString() : numeric.toFixed(2);
    return `$${trimmed}`;
};

export const mapApiProductToCard = (p: ApiDigitalProduct): DigitalProduct => ({
    id: p.id,
    type: p.product_type === 'course' ? 'Course' : 'Book',
    title: p.title,
    author: p.user_name,
    thumbnail: p.cover_image,
    price: formatPrice(p.price),
});

// ─── Real topic derivation ──────────────────────────────────────────────────
// Cosmetic icon/color per known category name — purely presentational, not
// data. Any category not in this map still renders, just with a neutral
// default look, so new categories mentors add never break the UI.
const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; color: string }> = {
    design: { icon: <FiPenTool size={25} />, color: '#f472b6' },
    engineering: { icon: <FiCode size={25} />, color: '#facc15' },
    growth: { icon: <FiTrendingUp size={25} />, color: '#4ade80' },
    finance: { icon: <FiDollarSign size={25} />, color: '#a78bfa' },
    writing: { icon: <FiEdit3 size={25} />, color: '#60a5fa' },
    business: { icon: <FiBriefcase size={25} />, color: '#fb923c' },
    photography: { icon: <FiCamera size={25} />, color: '#5eead4' },
    product: { icon: <FiBarChart2 size={25} />, color: '#f87171' },
};
const DEFAULT_CATEGORY_STYLE = { icon: <FiTag size={25} />, color: '#94a3b8' };

// Builds the "Browse by Topics" chips straight from real mentor data — counts
// are however many mentors actually carry each category, no placeholder
// numbers. Shared by Explore and Search so both pages list the same set.
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
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name,
                count: `${count} Mentor${count === 1 ? '' : 's'}`,
                icon: style.icon,
                color: style.color,
            };
        });
};

// ─── Section header ─────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="mb-6">
        <h2 className="text-white text-xl sm:text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
    </div>
);

// ─── Topic card ─────────────────────────────────────────────────────────────
const TopicCard: React.FC<{ topic: Topic }> = ({ topic }) => (
    <Link
        to={`/dashboard/search?category=${encodeURIComponent(topic.name)}`}
        className="flex items-center gap-4 rounded-xl p-3 sm:p-5 text-left transition-colors hover:bg-white/[0.04] cursor-pointer lg:w-full w-fit"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div style={{ color: topic.color }}>{topic.icon}</div>
        <div className="min-w-0">
            <p className="text-white font-bold text-base truncate">{topic.name}</p>
            <p className="text-white/40 text-sm">{topic.count}</p>
        </div>
    </Link>
);

export const MentorCard: React.FC<{ mentor: any }> = ({ mentor }) => {
    const categories: string[] = mentor?.categories ?? [];

    return (
        <Link
            to={`/dashboard/mentors/${mentor.id}`}
            className="rounded-xl lg:p-5 p-3 flex flex-col"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(205,220,57,.08)' }}
        >
            <div className="flex items-start justify-between mb-4">
                <img
                    src={mentor?.profile?.avatar}
                    alt={mentor?.name}
                    className="w-14 h-14 rounded-xl object-cover"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button
                    onClick={(e) => e.preventDefault()}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}
                >
                    Follow
                </button>
            </div>

            <h3 className="text-white font-bold text-base mb-1">{mentor?.nick_name || mentor?.name}</h3>

            {mentor?.occupation && (
                <p className="text-white/30 text-xs mb-2">{mentor.occupation}</p>
            )}

            <p className="text-white/40 text-sm leading-relaxed lg:mb-4 mb-2 line-clamp-2">{mentor?.bio}</p>

            {categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {categories.slice(0, 1).map((category) => (
                        <span
                            key={category}
                            className="inline-block w-fit px-2.5 py-1 rounded-md text-xs font-semibold capitalize"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
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
        className="rounded-2xl lg:p-5 p-3 flex flex-col animate-pulse"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(205,220,57,.08)' }}
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

const NoMentorsState: React.FC = () => (
    <div
        className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl col-span-full"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}
    >
        <FiUsers size={22} className="text-white/20 mb-3" />
        <p className="text-white/40 text-sm">No mentors available right now</p>
    </div>
);

// ─── Event card ─────────────────────────────────────────────────────────────
// Mobile: row layout matching the Events dashboard mobile card (time/title
// /location/price on the left, thumbnail on the right, action pill + guest
// avatars underneath). Desktop/tablet: unchanged vertical card, reusing
// formatTicketPrice / EventMetaBadges / AvatarStack from Overview.tsx so
// pricing, badges, and attendees stay in sync with the rest of the app.
export const EventCard: React.FC<{ event: RegisteredEvent }> = ({ event }) => (
    <>
        {/* ── Mobile row (matches Events dashboard mobile layout) ── */}
        <Link
            to={event.publicUrl}
            className="flex sm:hidden flex-col gap-0 rounded-xl p-4 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-sm mb-1">{event.time}</p>
                    <h3 className="text-white font-bold text-lg break-words mb-2 line-clamp-2">
                        {event.title}
                    </h3>

                    {event.location ? (
                        <div className="flex items-center gap-2 text-white/40 text-sm mb-1.5">
                            <FiMapPin size={15} />
                            <span className="truncate">{event.location}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-amber-400 text-sm mb-1.5">
                            <FiAlertTriangle size={15} />
                            <span>Location Missing</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-white/40 text-sm">
                        <FiTag size={15} />
                        <span>{formatTicketPrice(event.ticketPrice)}</span>
                    </div>
                </div>

                <img
                    src={event.thumbnail}
                    alt={event.title}
                    className="w-24 h-23 border-4 border-white/5 rounded-lg object-cover shrink-0"
                />
            </div>

            <div className="flex justify-between items-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold mt-3 bg-white text-black">
                    View Event
                    <FiArrowRight size={14} />
                </span>

                {event.attendees.length > 0 ? (
                    <AvatarStack attendees={event.attendees} total={event.registered} size={20} />
                ) : event.registered > 0 ? (
                    <span className="flex items-center gap-1.5 text-white/40 text-xs">
                        <FiUsers size={12} />
                        {event.registered} registered
                    </span>
                ) : null}
            </div>
        </Link>

        {/* ── Desktop/tablet card (unchanged) ── */}
        <Link
            to={event.publicUrl}
            className="hidden sm:flex rounded-md overflow-hidden flex-col transition-colors hover:bg-white/3 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
            <div className="relative">
                <img
                    src={event.thumbnail}
                    alt={event.title}
                    className="w-full h-40 sm:h-48 object-cover"
                />
                <span
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                    style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}
                >
                    <FiCalendar size={13} />
                    {event.dateLabel}
                </span>
                <span
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-semibold"
                    style={{
                        background: formatTicketPrice(event.ticketPrice) === 'Free' ? 'rgba(0,0,0,0.55)' : 'rgba(166,255,0,0.9)',
                        color: formatTicketPrice(event.ticketPrice) === 'Free' ? '#fff' : '#000',
                        backdropFilter: 'blur(4px)',
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
                    {event.location && (
                        <span className="flex items-center gap-1 min-w-0">
                            <span className="text-white/20 shrink-0">·</span>
                            <FiMapPin size={12} className="shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </span>
                    )}
                </div>

                <h3 className="text-white font-bold text-base mb-2 break-words line-clamp-2">{event.title}</h3>

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
        {/* Mobile row skeleton — mirrors the mobile EventCard shape so
            loading state doesn't jump when data arrives. */}
        <div
            className="flex sm:hidden flex-col gap-0 rounded-xl p-4 animate-pulse"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-3 w-12 rounded bg-white/5" />
                    <div className="h-5 w-3/4 rounded bg-white/5" />
                    <div className="h-3 w-2/3 rounded bg-white/5" />
                    <div className="h-3 w-1/3 rounded bg-white/5" />
                </div>
                <div className="w-24 h-23 rounded-lg bg-white/5 shrink-0" />
            </div>
            <div className="h-9 w-28 rounded-md bg-white/5 mt-3" />
        </div>

        {/* Desktop/tablet skeleton (unchanged) */}
        <div
            className="hidden sm:flex rounded-xl overflow-hidden flex-col animate-pulse"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
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

const NoEventsState: React.FC = () => (
    <div
        className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl col-span-full"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}
    >
        <FiCalendar size={22} className="text-white/20 mb-3" />
        <p className="text-white/40 text-sm">No upcoming events right now</p>
    </div>
);

// ─── Digital product card ───────────────────────────────────────────────────
export const ProductCard: React.FC<{ product: DigitalProduct }> = ({ product }) => (
    <Link
        to={`/dashboard/products/${product.id}`}
        className="rounded-md overflow-hidden flex flex-col transition-colors hover:bg-white/3 cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div className="relative">
            {product.thumbnail ? (
                <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-40 sm:h-48 object-cover"
                />
            ) : (
                <div
                    className="w-full h-40 sm:h-48 flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                    {product.type === 'Course' ? (
                        <FiPlayCircle size={28} className="text-white/15" />
                    ) : (
                        <FiBookOpen size={28} className="text-white/15" />
                    )}
                </div>
            )}
            <span
                className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}
            >
                {product.type === 'Course' ? <FiPlayCircle size={13} /> : <FiBookOpen size={13} />}
                {product.type}
            </span>
        </div>
        <div className="p-4 sm:p-5 flex flex-col flex-1">
            <h3 className="text-white font-bold text-base mb-1 break-words">{product.title}</h3>
            <div className='flex justify-between items-center pt-2'>
                <p className="text-white/40 text-xs">{product.author}</p>
                <span className="text-white font-bold text-sm">{product.price}</span>
            </div>
            <div className="mt-3">
                <button
                    className=" cursor-pointer w-full text-center tems-center bg-white gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-black transition-transform hover:scale-[1.02]"
                >
                    View Product
                </button>
            </div>
        </div>
    </Link>
);

const ProductCardSkeleton: React.FC = () => (
    <div
        className="rounded-md overflow-hidden flex flex-col animate-pulse"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div className="w-full h-40 sm:h-48 bg-white/5" />
        <div className="p-4 sm:p-5 flex flex-col gap-2.5">
            <div className="h-4 w-3/4 rounded bg-white/5" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
    </div>
);

const NoProductsState: React.FC = () => (
    <div
        className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl col-span-full"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}
    >
        <FiBookOpen size={22} className="text-white/20 mb-3" />
        <p className="text-white/40 text-sm">No courses or books available right now</p>
    </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────
const Explore: React.FC = () => {
    const { mentors, isLoading: mentorsLoading } = useGetMentors();
    const allMentors: any[] = mentors?.data?.results ?? [];
    const topics = useMemo(() => buildTopicsFromMentors(allMentors), [allMentors]);

    const { allEvents, isLoading: eventsLoading } = useGetAllEvents();

    const { digitalProduct, isLoading: productLoading } = useGetDigitalProduct();
    const rawProducts: ApiDigitalProduct[] = Array.isArray(digitalProduct?.data)
        ? digitalProduct.data
        : digitalProduct?.data?.results ?? [];
    const allProduct: DigitalProduct[] = rawProducts
        .filter((p) => p.is_published)
        .map(mapApiProductToCard);


    const rawEvents: ApiEvent[] = Array.isArray(allEvents?.data)
        ? allEvents.data
        : allEvents?.data?.results ?? [];

    const upcomingEvents = rawEvents
        .map(mapApiEventToRegistered)
        .filter((e) => e.status === 'upcoming')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div
            className="w-full min-h-screen"
            style={{
                background:
                    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
            }}
        >
            <LoadingOverlay visible={mentorsLoading} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                {/* Header */}
                <div className="mb-14">
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Explore</h1>
                    <p className="text-white/40 text-base max-w-2xl">
                        Find topics you care about, connect with mentors, or pick up a course or book to
                        level up.
                    </p>
                </div>

                {/* Browse by Topics — categories and counts computed live from
                    mentors' actual `categories` field, not placeholder data */}
                <section className="mb-16">
                    <SectionHeader title="Browse by Topics" />
                    {mentorsLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 rounded-xl animate-pulse"
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                                />
                            ))}
                        </div>
                    ) : topics.length > 0 ? (
                        <div className="flex sm:grid gap-2 overflow-x-auto sm:overflow-visible sm:grid-cols-2 lg:grid-cols-3 -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 topics-scroll">
                            {topics.map((topic) => (
                                <div key={topic.id} className="shrink-0 w-fit sm:w-auto sm:contents">
                                    <TopicCard topic={topic} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center text-center py-8 px-4 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}
                        >
                            <p className="text-white/40 text-sm">No categories yet</p>
                        </div>
                    )}
                </section>

                {/* Mentors — wired to real data via useGetMentors, same source Overview.tsx uses */}
                <section className="mb-16">
                    <SectionHeader title="Featured Mentors" subtitle="Learn 1:1 from people who've done it" />
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {mentorsLoading ? (
                            Array.from({ length: 6 }).map((_, i) => <MentorCardSkeleton key={i} />)
                        ) : allMentors.length > 0 ? (
                            allMentors.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)
                        ) : (
                            <NoMentorsState />
                        )}
                    </div>
                </section>

                {/* Events — card grid, below Mentors. Wired to real data via
                    useGetAllEvents; shares the ApiEvent/RegisteredEvent shape
                    and mapping used across the app. Mobile is single-column
                    since EventCard now renders a full-width row on mobile. */}
                <section className="mb-16">
                    <SectionHeader title="Events You Can Explore" subtitle="Join a session hosted by the community" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2">
                        {eventsLoading ? (
                            Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)
                        ) : upcomingEvents.length > 0 ? (
                            upcomingEvents.slice(0, 6).map((event) => <EventCard key={event.id} event={event} />)
                        ) : (
                            <NoEventsState />
                        )}
                    </div>
                </section>

                {/* Digital Products — wired to real data via useGetDigitalProduct;
                    only published products are shown to mentees. */}
                <section>
                    <SectionHeader title="Courses & Books" subtitle="Self-paced learning from top mentors" />
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {productLoading ? (
                            Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        ) : allProduct.length > 0 ? (
                            allProduct.map((product) => <ProductCard key={product.id} product={product} />)
                        ) : (
                            <NoProductsState />
                        )}
                    </div>
                </section>
            </div>

            <style>{`
        .topics-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .topics-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .topics-scroll::-webkit-scrollbar-thumb {
          background: rgba(205, 220, 57, 0.2);
          border-radius: 999px;
        }
        .topics-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(205, 220, 57, 0.2) transparent;
        }
      `}</style>
        </div>
    );
};

export default Explore;
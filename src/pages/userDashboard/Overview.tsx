import React, { useRef, useState } from 'react';
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import {
    FiArrowRight,
    FiCalendar,
    FiClock,
    FiCopy,
    FiExternalLink,
    FiMail,
    FiMapPin,
    FiMessageCircle,
    FiPlus,
    FiShare2,
    FiTag,
    FiUserCheck,
    FiUsers,
    FiX,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import LoadingOverlay from '../../component/LoadingOverlay';
import Button from '../../component/ui/Button';
import { useGetMentors, useGetMineEvents } from '../../hooks/queries/allQueriess';
import { type Mentor } from './Explore';

export interface Attendee {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
    phone_number?: string;
}

export interface RegisteredEvent {
    id: string;
    title: string;
    time: string;
    date: string;
    dateLabel: string;
    location?: string;
    registered: number;
    thumbnail: string;
    status: 'upcoming' | 'past';
    actionText: string;
    host?: string;
    hostAvatar?: string;
    hostEmail?: string;
    description?: string;
    attendees: Attendee[];
    publicUrl: string;
    meetingLink?: string;
    ticketPrice: string;
    requireApproval: boolean;
    capacity: number | null;
}

export interface ApiAttendee {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    event?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ApiEvent {
    id: string;
    user: {
        given_name: string;
        email: string
    };
    user_name: string;
    title: string;
    description: string;
    image: string;
    meeting_link?: string;
    start_date: string;
    end_date: string;
    location: string;
    ticket_price: string;
    require_approval: boolean;
    capacity: number | null;
    created_at: string;
    attendess_count?: number;
    attendees?: ApiAttendee[];
}

const formatTime = (iso: string) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
        return '';
    }
};

const formatDateLabel = (iso: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) return 'Today';

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    const diffDays = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'long' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const formatTicketPrice = (price: string) => {
    const numeric = parseFloat(price);
    if (!numeric || numeric <= 0) return 'Free';
    const trimmed = numeric % 1 === 0 ? numeric.toString() : numeric.toFixed(2);
    return `$${trimmed}`;
};

export const mapApiEventToRegistered = (event: ApiEvent): RegisteredEvent => {
    const isPast = new Date(event.end_date).getTime() < Date.now();
    const status: 'upcoming' | 'past' = isPast ? 'past' : 'upcoming';

    const attendees: Attendee[] = (event.attendees ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone_number: a.phone_number,
    }));
    const registered = event.attendess_count ?? attendees.length;

    return {
        id: event.id,
        title: event.title,
        time: formatTime(event.start_date),
        date: event.start_date,
        dateLabel: formatDateLabel(event.start_date),
        location: event.location,
        registered,
        thumbnail: event.image,
        status,
        actionText: status === 'upcoming' ? 'View Event' : 'View Details',
        host: event.user.given_name,
        hostEmail: event.user.email,
        description: event.description,
        attendees,
        publicUrl: `/events/${event.id}`,
        meetingLink: event.meeting_link,
        ticketPrice: event.ticket_price,
        requireApproval: event.require_approval,
        capacity: event.capacity,
    };
};


// ─── Skeleton primitives ────────────────────────────────────────────────────
const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
    className = '',
    style,
}) => (
    <div
        className={`animate-pulse rounded-md ${className}`}
        style={{ background: 'rgba(255,255,255,0.06)', ...style }}
    />
);

const EventHeroSkeleton: React.FC = () => (
    <div
        className="relative rounded-xl overflow-hidden mb-10"
        style={{ border: '1px solid rgba(205,220,57,.15)' }}
    >
        <SkeletonBlock className="w-full h-56 sm:h-72" style={{ borderRadius: 0 }} />
        <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 space-y-3">
            <SkeletonBlock className="h-3.5 w-40" />
            <SkeletonBlock className="h-7 sm:h-9 w-2/3" />
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="h-9 w-28" />
        </div>
    </div>
);

const EventRowSkeleton: React.FC = () => (
    <div
        className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-xl p-4 sm:p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(205,220,57,.08)' }}
    >
        <SkeletonBlock className="w-full h-full aspect-video sm:w-24 sm:h-24 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2.5">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-3 w-40" />
            <SkeletonBlock className="h-5 w-56" />
        </div>
        <SkeletonBlock className="h-9 w-full sm:w-24 shrink-0" />
    </div>
);

const EventsTimelineSkeleton: React.FC<{ groups?: number; rowsPerGroup?: number }> = ({
    groups = 2,
    rowsPerGroup = 2,
}) => (
    <div className="flex flex-col gap-10">
        {Array.from({ length: groups }).map((_, g) => (
            <div key={g} className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <div className="sm:w-28 shrink-0 pt-1">
                    <SkeletonBlock className="h-4 w-16" />
                </div>
                <div className="flex-1 flex flex-col gap-3">
                    {Array.from({ length: rowsPerGroup }).map((_, r) => (
                        <EventRowSkeleton key={r} />
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const EmptyState: React.FC<{ tab: 'upcoming' | 'past' }> = ({ tab }) => (
    <div className="flex flex-col items-center justify-center py-24 sm:py-32">
        <div
            className="relative w-28 h-28 rounded-2xl mb-8 flex items-center justify-center bg-white/5"
        >
            <FiCalendar size={44} className="text-white/20" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">
            No {tab === 'upcoming' ? 'Upcoming' : 'Past'} Events
        </h2>
        <p className="text-white/40 text-sm mb-8">
            {tab === 'upcoming'
                ? "You dont have any upcoming event"
                : "You don't have any past events."}
        </p>
        {tab === 'upcoming' && (
            <a
                href="/dashboard/events/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-transform hover:scale-[1.02]"
                style={{ background: '#a6ff00' }}
            >
                <FiPlus size={16} />
                Create Events
            </a>
        )}
    </div>
);

// ─── Attendee avatars ───────────────────────────────────────────────────────
const AVATAR_STYLES = [
    { bg: 'linear-gradient(135deg,#7b7fd6,#a58fe0)', text: '#1a1a2e' },
    { bg: 'linear-gradient(135deg,#f4a6c1,#f7c8a0)', text: '#3a1a1a' },
    { bg: 'linear-gradient(135deg,#6f9bd1,#8f7fe0)', text: '#1a1a2e' },
    { bg: 'linear-gradient(135deg,#f6d98f,#f2c14e)', text: '#3a2a10' },
    { bg: 'linear-gradient(135deg,#f2707a,#f4a0a8)', text: '#3a1010' },
    { bg: 'linear-gradient(135deg,#8fd6c1,#6fb8a0)', text: '#0f2a20' },
];

const getAvatarStyle = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_STYLES[Math.abs(hash) % AVATAR_STYLES.length];
};

const AttendeeAvatar: React.FC<{ name: string; avatar?: string; size?: number }> = ({
    name,
    avatar,
    size = 24,
}) => {
    if (avatar) {
        return (
            <img
                src={avatar}
                alt={name}
                title={name}
                className="rounded-full object-cover shrink-0"
                style={{
                    width: size,
                    height: size,
                    border: '2px solid #05080340',
                    boxShadow: '0 0 0 1.5px rgba(0,0,0,0.6)',
                }}
            />
        );
    }
    const style = getAvatarStyle(name || '?');
    return (
        <div
            title={name}
            className="rounded-full flex items-center justify-center font-semibold shrink-0"
            style={{
                width: size,
                height: size,
                background: style.bg,
                color: style.text,
                fontSize: size * 0.42,
                border: '2px solid #05080340',
                boxShadow: '0 0 0 1.5px rgba(0,0,0,0.6)',
            }}
        >
            {(name || '?').trim().charAt(0).toUpperCase()}
        </div>
    );
};

export const AvatarStack: React.FC<{
    attendees: Attendee[];
    total: number;
    size?: number;
    onOpenGuests?: () => void;
}> = ({ attendees, total, size = 24, onOpenGuests }) => {
    if (attendees.length === 0) return null;

    const visible = attendees.slice(0, 4);
    const extra = total - visible.length;

    const label =
        visible.length === 1
            ? visible[0].name
            : extra > 0
                ? `${visible[0].name}, ${visible[1]?.name ?? ''} and ${extra} other${extra === 1 ? '' : 's'}`
                : visible.length === 2
                    ? `${visible[0].name} and ${visible[1].name}`
                    : `${visible.slice(0, -1).map((a) => a.name).join(', ')} and ${visible[visible.length - 1].name}`;

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onOpenGuests?.();
            }}
            className="flex items-center gap-2 group cursor-pointer"
        >
            <div className="flex -space-x-2">
                {visible.map((a) => (
                    <AttendeeAvatar key={a.id} name={a.name} avatar={a.avatar} size={size} />
                ))}
            </div>
            <span
                className="text-white/50 group-hover:text-white/80 transition-colors text-left"
                style={{ fontSize: size <= 24 ? '0.7rem' : '0.8rem' }}
            >
                {label}
            </span>
        </button>
    );
};

export const EventMetaBadges: React.FC<{ event: RegisteredEvent; size?: 'sm' | 'md' }> = ({ event, size = 'sm' }) => {
    const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';
    const padding = size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-1.5';

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <span
                className={`inline-flex items-center gap-1 rounded-md font-semibold ${textSize} ${padding}`}
                style={{
                    background: formatTicketPrice(event.ticketPrice) === 'Free' ? 'rgba(255,255,255,0.06)' : 'rgba(166,255,0,0.1)',
                    color: formatTicketPrice(event.ticketPrice) === 'Free' ? 'rgba(255,255,255,0.6)' : '#a6ff00',
                }}
            >
                <FiTag size={size === 'sm' ? 11 : 13} />
                {formatTicketPrice(event.ticketPrice)}
            </span>

            {event.requireApproval && (
                <span
                    className={`inline-flex items-center gap-1 rounded-md font-semibold ${textSize} ${padding}`}
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                >
                    <FiUserCheck size={size === 'sm' ? 11 : 13} />
                    Approval Required
                </span>
            )}

            <span
                className={`inline-flex items-center gap-1 rounded-md font-semibold ${textSize} ${padding}`}
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
            >
                <FiUsers size={size === 'sm' ? 11 : 13} />
                {event.capacity === null || event.capacity === undefined ? 'Unlimited' : `Cap ${event.capacity}`}
            </span>
        </div>
    );
};

const LatestEventHero: React.FC<{
    event: RegisteredEvent;
    onView: (event: RegisteredEvent) => void;
    onOpenGuests: (event: RegisteredEvent) => void;
}> = ({ event, onView, onOpenGuests }) => (
    <div
        onClick={() => onView(event)}
        className="relative rounded-xl overflow-hidden mb-10 cursor-pointer group"
        style={{ border: '1px solid rgba(205,220,57,.15)' }}
    >
        <img
            src={event.thumbnail}
            alt={event.title}
            className="w-full h-full aspect-square lg:h-72 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.99) 100%)' }}
        />
        <div className="absolute lg:top-4 lg:left-4 right-4 top-4">
            <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'white', color: 'black', border: '1px solid rgba(166,255,0,.3)' }}
            >
                Next Up
            </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 lg:p-5 p-7 lg:pb-5 pb-10">
            <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm mb-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 shrink-0">
                    <FiClock size={13} />
                    <span>{event.dateLabel} · {event.time}</span>
                </div>
                {event.location && (
                    <div className="flex items-center gap-1.5 min-w-0 max-w-[65%] sm:max-w-[50%]">
                        <span className="text-white/30 shrink-0">·</span>
                        <FiMapPin size={13} className="shrink-0" />
                        <span className="truncate">{event.location}</span>
                    </div>
                )}
            </div>
            <h2 className="text-white text-xl sm:text-3xl font-black lg:mb-4 mb-2 max-w-xl break-words">
                {event.title}
            </h2>
            <div className="lg:mb-4 mb-2">
                <EventMetaBadges event={event} size="md" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onView(event);
                    }}
                    variant="green"
                >
                    {event.actionText}
                </Button>
                {event.attendees.length > 0 ? (
                    <AvatarStack
                        attendees={event.attendees}
                        total={event.registered}
                        size={24}
                        onOpenGuests={() => onOpenGuests(event)}
                    />
                ) : (
                    event.registered > 0 && (
                        <span className="flex items-center gap-1.5 text-white/60 text-xs sm:text-sm">
                            <FiUsers size={13} />
                            {event.registered} registered
                        </span>
                    )
                )}
            </div>
        </div>
    </div>
);

export const EventRow: React.FC<{
    event: RegisteredEvent;
    onView: (event: RegisteredEvent) => void;
    onOpenGuests: (event: RegisteredEvent) => void;
}> = ({ event, onView, onOpenGuests }) => (


    <div
        onClick={() => onView(event)}
        className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-xl p-4 sm:p-5 transition-colors hover:bg-white/[0.03] cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(205,220,57,.08)' }}
    >
        <img
            src={event.thumbnail}
            alt={event.title}
            className="w-full h-full aspect-square sm:w-24 sm:h-24 rounded-lg shrink-0 object-cover"
        />

        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-white/40 text-xs sm:text-sm mb-1.5">
                <FiClock size={13} />
                <span>{event.time}</span>
            </div>
            <h3 className="text-white font-bold text-base sm:text-lg break-words mb-2">
                {event.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/40 text-xs sm:text-sm mb-2">
                {event.location && (
                    <span className="flex items-center gap-1.5">
                        <FiMapPin size={13} />
                        {event.location}
                    </span>
                )}
                {event.attendees.length === 0 && (
                    <span className="flex items-center gap-1.5">
                        <FiUsers size={13} />
                        {event.registered} registered
                    </span>
                )}
            </div>
            <div className="mb-2">
                <EventMetaBadges event={event} size="sm" />
            </div>
            {event.attendees.length > 0 && (
                <AvatarStack
                    attendees={event.attendees}
                    total={event.registered}
                    size={24}
                    onOpenGuests={() => onOpenGuests(event)}
                />
            )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            <Button
                onClick={(e) => {
                    e.stopPropagation();
                    onView(event);
                }}
                variant="white"
                className="w-full sm:w-auto text-xs"
            >
                {event.actionText}
            </Button>
        </div>
    </div>
);

export const HostInitials: React.FC<{ name?: string }> = ({ name }) => {
    const initials = (name || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('');

    return (
        <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-neutral-800"
            style={{ color: '#a6ff00' }}
        >
            {initials}
        </div>
    );
};

const MentorCardCompact: React.FC<{ mentor: Mentor }> = ({ mentor }: any) => (
    <Link
        to={`/dashboard/mentors/${mentor.id}`}
        className="rounded-2xl lg:p-5 p-3 flex flex-col bg-[rgba(255,255,255,0.02)]"
    >
        <div className="flex items-start justify-between lg:mb-4 mb-2">
            <img
                src={mentor?.profile?.avatar}
                alt={mentor?.name}
                className="w-12 h-12 rounded-xl object-cover"
                style={{ border: '1px solid rgba(205,220,57,.15)' }}
            />
            <button
                className="px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}
            >
                Follow
            </button>
        </div>
        <h3 className="text-white font-bold text-base">{mentor.name}</h3>
        <p className="text-white/30 text-xs leading-relaxed lg:mb-3 mb-2">@{mentor.nick_name}</p>
        <p className="text-white/60 text-xs leading-relaxed lg:mb-3 mb-2 line-clamp-2">{mentor.bio}</p>
        <div className="flex flex-wrap gap-1">
            {mentor.categories?.slice(0, 1)?.map((category: any) => (
                <span
                    key={category}
                    className="w-fit px-2.5 py-1 rounded-md text-xs font-semibold text-white capitalize"
                    style={{ background: 'rgba(166,255,0,0.08)' }}
                >
                    {category}
                </span>
            ))}
        </div>
    </Link>
);

// ─── Guest list modal ───────────────────────────────────────────────────────
export const GuestsModal: React.FC<{ attendees: Attendee[]; onClose: () => void }> = ({ attendees, onClose }) => (
    <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl max-h-[80vh] flex flex-col"
            style={{
                background: 'rgba(10,13,9,0.55)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                    <FiUsers className="text-white/70" size={20} />
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white shrink-0"
                >
                    <FiX size={18} />
                </button>
            </div>
            <h3 className="text-white text-xl font-black mb-1">
                {attendees.length} Guest{attendees.length === 1 ? '' : 's'}
            </h3>
            <p className="text-white/40 text-xs mb-4">Everyone who has registered for this event.</p>
            <div className="overflow-y-auto flex-1 -mx-2 px-2 space-y-1">
                {attendees.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.03]">
                        <AttendeeAvatar name={a.name} avatar={a.avatar} size={36} />
                        <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{a.name}</p>
                            {a.email && <p className="text-white/35 text-xs truncate">{a.email}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ─── Invite / share modal ───────────────────────────────────────────────────
type InviteAction = {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
};

export const InviteFriendModal: React.FC<{
    url: string;
    title: string;
    onClose: () => void;
}> = ({ url, title, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard not available, fail silently
        }
    };

    const shareText = `You're invited: ${title}`;

    const actions: InviteAction[] = [
        {
            id: 'facebook',
            label: 'Share',
            icon: <FaFacebookF size={17} />,
            onClick: () =>
                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    '_blank',
                    'noopener,noreferrer'
                ),
        },
        {
            id: 'x',
            label: 'Post on X',
            icon: <FaXTwitter size={17} />,
            onClick: () =>
                window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
                    '_blank',
                    'noopener,noreferrer'
                ),
        },
        {
            id: 'linkedin',
            label: 'Post',
            icon: <FaLinkedinIn size={17} />,
            onClick: () =>
                window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                    '_blank',
                    'noopener,noreferrer'
                ),
        },
        {
            id: 'email',
            label: 'Email',
            icon: <FiMail size={17} />,
            onClick: () => {
                window.location.href = `mailto:?subject=${encodeURIComponent(
                    shareText
                )}&body=${encodeURIComponent(url)}`;
            },
        },
        {
            id: 'native-share',
            label: 'Share',
            icon: <FiShare2 size={17} />,
            onClick: async () => {
                if (navigator.share) {
                    try {
                        await navigator.share({ title: shareText, url });
                    } catch {
                        // user cancelled the native share sheet, ignore
                    }
                } else {
                    handleCopy();
                }
            },
        },
        {
            id: 'text',
            label: 'Text',
            icon: <FiMessageCircle size={17} />,
            onClick: () => {
                window.location.href = `sms:?body=${encodeURIComponent(`${shareText} ${url}`)}`;
            },
        },
    ];

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                style={{
                    background: 'rgba(10,13,9,0.75)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                        <FiShare2 className="text-white/70" size={20} />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white shrink-0"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                <h3 className="text-white text-xl font-black mb-1">Invite a Friend</h3>
                <p className="text-white/40 text-xs mb-6 leading-relaxed">
                    It's always more fun with friends. We'll let you know when your friends accept your invite.
                </p>

                <div className="grid grid-cols-3 gap-y-5 mb-6">
                    {actions.map((a) => (
                        <button
                            key={a.id}
                            type="button"
                            onClick={a.onClick}
                            className="flex flex-col items-center gap-2 cursor-pointer"
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
                                style={{ background: 'rgba(255,255,255,0.08)' }}
                            >
                                {a.icon}
                            </div>
                            <span className="text-white/70 text-xs">{a.label}</span>
                        </button>
                    ))}
                </div>

                <div className="h-px w-full mb-5" style={{ background: 'rgba(255,255,255,0.08)' }} />

                <p className="text-white text-sm font-bold mb-2">Share the link:</p>
                <div
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    <span className="text-white/60 text-xs truncate">{url}</span>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="text-xs font-semibold shrink-0 px-3 py-1.5 rounded-lg text-black cursor-pointer transition-colors"
                        style={{ background: copied ? 'rgba(255,255,255,0.6)' : '#a6ff00' }}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const EventDrawerContent: React.FC<{
    event: RegisteredEvent | null;
    onClose: () => void;
    onOpenGuests: (event: RegisteredEvent) => void;
}> = ({ event, onClose, onOpenGuests }) => {
    const [copied, setCopied] = useState(false);
    const [showInvite, setShowInvite] = useState(false);

    if (!event) return null;

    const handleCopyLink = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(window.location.origin + event.publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard not available, fail silently
        }
    };

    return (
        <div className="bg-[#0a0f08] min-h-full w-full sm:w-[480px] flex flex-col shadow-xl border-l border-[rgba(205,220,57,.1)]">
            <div className="flex items-center justify-between p-5 border-b border-[rgba(205,220,57,.08)] shrink-0 gap-2">
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleCopyLink}
                        variant="dark"
                        className="px-3 py-1.5 text-xs"
                    >
                        <FiCopy size={13} />
                        {copied ? 'Copied!' : 'Share Event Page'}
                    </Button>
                    <a
                        href={event.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors bg-[#010C06] text-white border border-white/10 hover:bg-[#0a140c]"
                    >
                        View Event Page
                        <FiExternalLink size={13} />
                    </a>
                </div>
                <button
                    type="button"
                    aria-label="close sidebar"
                    onClick={onClose}
                    className="cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                >
                    <FiX className="text-white/60 text-xl" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize mb-6"
                    style={{
                        background: event.status === 'upcoming' ? 'rgba(166,255,0,0.12)' : 'rgba(255,255,255,0.06)',
                        color: event.status === 'upcoming' ? '#a6ff00' : 'rgba(255,255,255,0.5)',
                    }}
                >
                    {event.status}
                </span>

                <img
                    src={event.thumbnail}
                    alt={event.title}
                    className="w-full aspect-square rounded-xl mb-6 object-cover"
                />

                <h2 className="text-white text-2xl font-black mb-3 break-words">{event.title}</h2>

                {event.host && (
                    <div className="mb-6 border-y border-neutral-200/10 py-2 pb-4 w-full">
                        <p className="text-white/50 text-sm pb-2">Hosted by </p>
                        <div className='flex items-center gap-2'>
                            <HostInitials name={event.host} />
                            <div className='flex flex-col gap-1 '>
                                <span className="text-white font-bold text-sm">@{event.host}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center gap-3 text-white/70 text-sm">
                        <FiCalendar className="text-[#a6ff00] shrink-0" size={18} />
                        <span>{event.dateLabel} · {event.time}</span>
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-3 text-white/70 text-sm">
                            <FiMapPin className="text-[#a6ff00] shrink-0" size={18} />
                            <span>{event.location}</span>
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">Event Details</h3>
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(205,220,57,.08)' }}
                    >
                        <div
                            className="flex items-center justify-between gap-3 px-4 py-3"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="flex items-center gap-2.5 text-white/70 text-sm">
                                <FiTag size={15} className="text-white/40" />
                                Ticket Price
                            </div>
                            <span
                                className="text-sm font-semibold"
                                style={{ color: formatTicketPrice(event.ticketPrice) === 'Free' ? 'rgba(255,255,255,0.7)' : '#a6ff00' }}
                            >
                                {formatTicketPrice(event.ticketPrice)}
                            </span>
                        </div>
                        <div
                            className="flex items-center justify-between gap-3 px-4 py-3"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="flex items-center gap-2.5 text-white/70 text-sm">
                                <FiUserCheck size={15} className="text-white/40" />
                                Requires Approval
                            </div>
                            <span className="text-sm font-semibold text-white/70">
                                {event.requireApproval ? 'Yes' : 'No'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="flex items-center gap-2.5 text-white/70 text-sm">
                                <FiUsers size={15} className="text-white/40" />
                                Capacity
                            </div>
                            <span className="text-sm font-semibold text-white/70">
                                {event.capacity === null || event.capacity === undefined ? 'Unlimited' : event.capacity}
                            </span>
                        </div>
                    </div>
                </div>

                {event.attendees.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                            Attendees · {event.registered}
                        </h3>
                        <div
                            className="flex items-center justify-between rounded-xl p-4"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(205,220,57,.08)' }}
                        >
                            <AvatarStack
                                attendees={event.attendees}
                                total={event.registered}
                                size={32}
                                onOpenGuests={() => onOpenGuests(event)}
                            />
                        </div>
                    </div>
                )}

                {event.description && (
                    <div className="mb-8">
                        <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">About</h3>
                        <p className="text-white/50 text-sm leading-relaxed">{event.description}</p>
                    </div>
                )}

                {event.meetingLink && (
                    <div className="mb-8">
                        <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">Meeting Link</h3>
                        <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between gap-3 rounded-md px-4 py-3 group"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(205,220,57,.08)' }}
                        >
                            <div className="flex items-center gap-2.5 text-sm min-w-0">
                                <FiExternalLink size={15} className="text-white/40 shrink-0" />
                                <span className="truncate text-white/70 group-hover:text-white transition-colors">
                                    {event.meetingLink}
                                </span>
                            </div>
                            <span className="text-xs font-semibold shrink-0" style={{ color: '#a6ff00' }}>
                                Join
                            </span>
                        </a>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                    <a
                        href={event.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center w-full justify-center gap-1.5 py-2.5 rounded-md text-xs font-semibold transition-colors bg-white/10 text-white"
                    >
                        View Event Page
                        <FiExternalLink size={13} />
                    </a>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowInvite(true);
                        }}
                        className="w-full bg-white text-black flex items-center justify-center gap-1.5 py-2.5 rounded-md font-semibold text-xs transition-colors cursor-pointer"
                    >
                        <FiShare2 size={13} />
                        Invite a Friend
                    </button>
                </div>
            </div>

            {showInvite && (
                <InviteFriendModal
                    url={window.location.origin + event.publicUrl}
                    title={event.title}
                    onClose={() => setShowInvite(false)}
                />
            )}
        </div>
    );
};

const Overview: React.FC = () => {
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedEvent, setSelectedEvent] = useState<RegisteredEvent | null>(null);
    const [guestsEvent, setGuestsEvent] = useState<RegisteredEvent | null>(null);
    const drawerCheckboxRef = useRef<HTMLInputElement>(null);

    const { mentors, isLoading } = useGetMentors()
    const allMentors = mentors?.data?.results


    const { mineEvents, isLoading: isLoadingEvents } = useGetMineEvents()

    const rawEvents: ApiEvent[] = Array.isArray(mineEvents?.data)
        ? mineEvents.data
        : mineEvents?.data?.results ?? [];

    const myEvents = rawEvents.map(mapApiEventToRegistered);

    const filtered = myEvents.filter((e) => e.status === tab);

    const grouped = filtered.reduce<Record<string, RegisteredEvent[]>>((acc, event) => {
        acc[event.dateLabel] = acc[event.dateLabel] || [];
        acc[event.dateLabel].push(event);
        return acc;
    }, {});

    const upcomingEvents = myEvents
        .filter((e) => e.status === 'upcoming')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestEvent = upcomingEvents[0];

    const openDrawer = (event: RegisteredEvent) => {
        setSelectedEvent(event);
        if (drawerCheckboxRef.current) {
            drawerCheckboxRef.current.checked = true;
        }
    };

    const closeDrawer = () => {
        if (drawerCheckboxRef.current) {
            drawerCheckboxRef.current.checked = false;
        }
        setSelectedEvent(null);
    };

    return (
        <div className="drawer drawer-end">
            <input
                ref={drawerCheckboxRef}
                id="event-drawer-toggle"
                type="checkbox"
                className="drawer-toggle"
            />
            <LoadingOverlay visible={isLoading} />

            <div className="drawer-content">
                <div
                    className="w-full min-h-screen"
                    style={{
                        background:
                            'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
                    }}
                >
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        {/* Latest upcoming event spotlight */}
                        {isLoadingEvents ? (
                            <EventHeroSkeleton />
                        ) : (
                            latestEvent && (
                                <LatestEventHero
                                    event={latestEvent}
                                    onView={openDrawer}
                                    onOpenGuests={setGuestsEvent}
                                />
                            )
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between mb-10 gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black text-white">Events</h1>

                            <div className="flex items-center gap-3">
                                <div
                                    className="flex items-center rounded-lg p-1"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(205,220,57,.1)' }}
                                >
                                    {(['upcoming', 'past'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTab(t)}
                                            className="px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors cursor-pointer"
                                            style={{
                                                background: tab === t ? 'rgba(166,255,0,0.12)' : 'transparent',
                                                color: tab === t ? '#a6ff00' : 'rgba(255,255,255,0.5)',
                                            }}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                <Link
                                    to="/dashboard/events"
                                    className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap"
                                    style={{ color: '#a6ff00' }}
                                >
                                    View All
                                    <FiArrowRight size={13} />
                                </Link>
                            </div>
                        </div>

                        {/* Content */}
                        {isLoadingEvents ? (
                            <EventsTimelineSkeleton groups={2} rowsPerGroup={2} />
                        ) : filtered.length === 0 ? (
                            <EmptyState tab={tab} />
                        ) : (
                            <div className="flex flex-col gap-10">
                                {Object.entries(grouped).map(([label, events]) => (
                                    <div key={label} className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                        <div className="sm:w-28 shrink-0 pt-1">
                                            <p className="text-white font-bold text-sm">{label}</p>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-3 relative">
                                            <div
                                                className="absolute left-[-1.25rem] sm:left-[-2rem] top-2 bottom-2 w-px hidden sm:block"
                                                style={{ background: 'rgba(205,220,57,.1)' }}
                                            />
                                            {events.map((event) => (
                                                <EventRow
                                                    key={event.id}
                                                    event={event}
                                                    onView={openDrawer}
                                                    onOpenGuests={setGuestsEvent}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex sm:hidden justify-center mt-6">
                            <Link
                                to="/dashboard/events"
                                className="flex items-center text-neutral-500 gap-1.5 text-sm font-semibold"
                            >
                                View All Events
                                <FiArrowRight size={13} />
                            </Link>
                        </div>

                        {/* Featured Mentors */}
                        <div className="mt-16">
                            <div className="flex items-center justify-between mb-6 gap-3">
                                <h2 className="text-white text-xl sm:text-2xl font-bold">Top Mentors</h2>
                                <Link
                                    to="/dashboard/explore"
                                    className="flex items-center text-neutral-500 gap-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap"
                                >
                                    View All Mentors
                                    <FiArrowRight size={13} />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {allMentors?.slice(0, 6).map((mentor: any) => (
                                    <MentorCardCompact key={mentor.id} mentor={mentor} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="drawer-side z-50">
                <div
                    aria-label="close sidebar"
                    className="drawer-overlay"
                    onClick={closeDrawer}
                />
                <EventDrawerContent
                    event={selectedEvent}
                    onClose={closeDrawer}
                    onOpenGuests={setGuestsEvent}
                />
            </div>

            {guestsEvent && (
                <GuestsModal attendees={guestsEvent.attendees} onClose={() => setGuestsEvent(null)} />
            )}
        </div>
    );
};

export default Overview;
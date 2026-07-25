import React, { useRef, useState } from 'react';
import {
    FiCalendar,
    FiClock,
    FiCopy,
    FiExternalLink,
    FiMapPin,
    FiPlus,
    FiTag,
    FiUserCheck,
    FiUsers,
    FiX,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Button from '../../component/ui/Button';
import { useGetMineEvents } from '../../hooks/queries/allQueriess';
import { HostInitials } from './Overview';

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

const formatTicketPrice = (price: string) => {
    const numeric = parseFloat(price);
    if (!numeric || numeric <= 0) return 'Free';
    const trimmed = numeric % 1 === 0 ? numeric.toString() : numeric.toFixed(2);
    return `$${trimmed}`;
};

const mapApiEventToRegistered = (event: ApiEvent): RegisteredEvent => {
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
        description: event.description,
        attendees,
        publicUrl: `/events/${event.id}`,
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

const EventRowSkeleton: React.FC = () => (
    <div
        className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-xl p-4 sm:p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(205,220,57,.08)' }}
    >
        <SkeletonBlock className="w-full h-28 sm:w-24 sm:h-24 shrink-0" />
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
    rowsPerGroup = 3,
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
            className="relative w-28 h-28 rounded-2xl mb-8 flex items-center justify-center"
            style={{ background: 'rgba(166,255,0,0.06)', border: '1px solid rgba(205,220,57,.12)' }}
        >
            <FiCalendar size={44} className="text-white/20" />
            <div
                className="absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(205,220,57,.15)' }}
            >
                0
            </div>
        </div>
        <h2 className="text-white text-xl font-bold mb-2">
            No {tab === 'upcoming' ? 'Upcoming' : 'Past'} Events
        </h2>
        <p className="text-white/40 text-sm mb-8">
            {tab === 'upcoming'
                ? "You haven't created any upcoming events yet."
                : "You don't have any past events."}
        </p>
        {tab === 'upcoming' && (
            <Link
                to="/dashboard/events/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-transform hover:scale-[1.02]"
                style={{ background: '#a6ff00' }}
            >
                <FiPlus size={16} />
                Create Event
            </Link>
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

const AvatarStack: React.FC<{
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

const EventMetaBadges: React.FC<{ event: RegisteredEvent; size?: 'sm' | 'md' }> = ({ event, size = 'sm' }) => {
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

const EventRow: React.FC<{
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
                {event.attendees.length === 0 && event.registered > 0 && (
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

// ─── Guest list modal ───────────────────────────────────────────────────────
const GuestsModal: React.FC<{ attendees: Attendee[]; onClose: () => void }> = ({ attendees, onClose }) => (
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

const EventDrawerContent: React.FC<{
    event: RegisteredEvent | null;
    onClose: () => void;
    onOpenGuests: (event: RegisteredEvent) => void;
}> = ({ event, onClose, onOpenGuests }) => {
    const [copied, setCopied] = useState(false);

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
                        {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <a
                        href={event.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors bg-[#010C06] text-white border border-white/10 hover:bg-[#0a140c]"
                    >
                        Event Page
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

                <div
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-8"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(205,220,57,.08)' }}
                >
                    <span className="text-white/40 text-xs truncate">{window.location.origin}{event.publicUrl}</span>
                    <button
                        onClick={handleCopyLink}
                        className="text-xs font-semibold shrink-0 cursor-pointer text-[#a6ff00]"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        variant="green"
                        className="w-full py-3.5 text-sm"
                    >
                        {event.actionText}
                    </Button>
                    <a
                        href={event.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-lg font-semibold text-sm transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(205,220,57,.15)' }}
                    >
                        View Event Page
                        <FiExternalLink size={13} />
                    </a>
                </div>
            </div>
        </div>
    );
};

const Events: React.FC = () => {
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedEvent, setSelectedEvent] = useState<RegisteredEvent | null>(null);
    const [guestsEvent, setGuestsEvent] = useState<RegisteredEvent | null>(null);
    const drawerCheckboxRef = useRef<HTMLInputElement>(null);

    const { mineEvents, isLoading } = useGetMineEvents();

    const rawEvents: ApiEvent[] = Array.isArray(mineEvents?.data)
        ? mineEvents.data
        : mineEvents?.data?.results ?? [];

    const allEvents = rawEvents.map(mapApiEventToRegistered);

    const filtered = allEvents.filter((e) => e.status === tab);

    const grouped = filtered.reduce<Record<string, RegisteredEvent[]>>((acc, event) => {
        acc[event.dateLabel] = acc[event.dateLabel] || [];
        acc[event.dateLabel].push(event);
        return acc;
    }, {});

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

            <div className="drawer-content">
                <div
                    className="w-full min-h-screen"
                    style={{
                        background:
                            'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
                    }}
                >
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
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
                                            className="px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer"
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
                                    to="/dashboard/events/create"
                                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-black transition-transform hover:scale-[1.02]"
                                    style={{ background: '#a6ff00' }}
                                >
                                    <FiPlus size={14} />
                                    Create Event
                                </Link>
                            </div>
                        </div>

                        {/* Content */}
                        {isLoading ? (
                            <EventsTimelineSkeleton groups={2} rowsPerGroup={3} />
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

export default Events;
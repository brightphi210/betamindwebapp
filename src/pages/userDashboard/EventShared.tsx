import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import {
    FiCalendar,
    FiCopy,
    FiEdit2,
    FiExternalLink,
    FiMail,
    FiMapPin,
    FiMessageCircle,
    FiSend,
    FiShare2,
    FiTag,
    FiTrash2,
    FiUserCheck,
    FiUsers,
    FiVideo,
    FiX
} from 'react-icons/fi';
import { SiGooglemeet } from 'react-icons/si';
import { formatNaira } from '../../utils/currency';

/* ═══════════════════════════ Types ═══════════════════════════ */
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
    tickets?: EventTicket[];
    requireApproval: boolean;
    capacity: number | null;
    isOnline: boolean;
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

export interface ApiEventUser {
    id?: string;
    email: string;
    given_name?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    avatar?: string | null;
    address?: string;
    city?: string;
    is_mentor?: boolean;
}

export interface EventTicket {
    id?: string | number | null;
    name: string;
    amount?: string | number | null;
    price?: string | number | null;
    image?: string | null;
    description?: string | null;
    created_at?: string | null;
}

export interface ApiEvent {
    id: string;
    user: ApiEventUser;
    user_name: string;
    title: string;
    description: string;
    tickets?: EventTicket[];
    image: string;
    online?: boolean;
    onsite?: boolean;
    meeting_link?: string | null;
    google_event_id?: string | null;
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

/* ═══════════════════════════ Helpers ═══════════════════════════ */

/** Always 12-hour, e.g. "3:00 PM" (forced en-US so 15:00 never shows). */
export const formatTime = (iso: string) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return '';
    }
};

export const formatDateLabel = (iso: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) return 'Today';

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    const diffDays = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatTicketPrice = (price?: string) => {
    const numeric = parseFloat(price || '0');
    if (!numeric || numeric <= 0) return 'Free';
    return 'Paid';
};

export const formatTicketAmount = (value?: string | number | null) => {
    return formatNaira(value, 'Free');
};

const RichText: React.FC<{ html: string }> = ({ html }) => (
    <>
        <div
            className="rich-text-content text-sm text-white/60 leading-relaxed wrap-break-word"
            dangerouslySetInnerHTML={{ __html: html }}
        />
        <style>{`
            .rich-text-content p { margin: 0 0 0.75em; }
            .rich-text-content p:last-child { margin-bottom: 0; }
            .rich-text-content strong { color: rgba(255,255,255,0.85); }
            .rich-text-content a { color: #a6ff00; text-decoration: underline; }
            .rich-text-content ul, .rich-text-content ol { margin: 0 0 0.75em; padding-left: 1.25em; }
            .rich-text-content li { margin-bottom: 0.25em; }
            .rich-text-content blockquote {
                margin: 0.75em 0; padding-left: 0.9em; border-left: 2px solid rgba(166,255,0,0.45); color: rgba(255,255,255,0.7);
            }
            .rich-text-content img { max-width: 100%; border-radius: 8px; margin: 0.5em 0; }
            .rich-text-content h1, .rich-text-content h2, .rich-text-content h3, .rich-text-content h4 {
                color: rgba(255,255,255,0.9); font-weight: 700; margin: 0 0 0.5em;
            }
            .rich-text-content pre {
                background: rgba(255,255,255,0.06); border-radius: 8px; padding: 0.75em; overflow-x: auto; color: rgba(255,255,255,0.8);
            }
        `}</style>
    </>
);

export const isGoogleMeet = (v?: string | null) => !!v && /google\s*meet|meet\.google\.com/i.test(v);

export const getHostName = (event: Pick<ApiEvent, 'user' | 'user_name'>) =>
    [event.user?.first_name, event.user?.last_name].filter(Boolean).join(' ').trim() ||
    event.user?.given_name ||
    event.user_name;

/** The API may send online:false + onsite:false with location "Google Meet",
 *  so don't trust the flag alone. */
export const getIsOnline = (event: Pick<ApiEvent, 'online' | 'meeting_link' | 'location'>) =>
    !!event.online || !!event.meeting_link || isGoogleMeet(event.location);

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
        host: getHostName(event),
        hostAvatar: event.user?.avatar ?? undefined,
        hostEmail: event.user?.email,
        description: event.description,
        attendees,
        publicUrl: `/events/${event.id}`,
        meetingLink: event.meeting_link ?? undefined,
        ticketPrice: event.ticket_price,
        tickets: Array.isArray(event.tickets) ? event.tickets : [],
        requireApproval: event.require_approval,
        capacity: event.capacity,
        isOnline: getIsOnline(event),
    };
};

/* ═══════════════════════════ Small UI pieces ═══════════════════════════ */

export const LocationIcon: React.FC<{
    location?: string | null;
    size?: number;
    className?: string;
}> = ({ location, size = 13, className = '' }) =>
        isGoogleMeet(location) ? (
            <SiGooglemeet size={size} className={`shrink-0 ${className}`} style={{ color: '#00ac47' }} />
        ) : (
            <FiMapPin size={size} className={`shrink-0 ${className}`} />
        );

/** Host avatar: image with initials fallback. */
export const HostInitials: React.FC<{
    name?: string;
    avatar?: string | null;
    size?: number;
}> = ({ name, avatar, size = 28 }) => {
    const [failed, setFailed] = useState(false);

    if (avatar && !failed) {
        return (
            <img
                src={avatar}
                alt={name}
                onError={() => setFailed(true)}
                className="rounded-full object-cover shrink-0"
                style={{ width: size, height: size }}
            />
        );
    }

    const initials = (name || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('');

    return (
        <div
            className="rounded-full flex items-center justify-center font-bold shrink-0 bg-neutral-800"
            style={{ width: size, height: size, fontSize: size * 0.4, color: '#a6ff00' }}
        >
            {initials}
        </div>
    );
};

export const OnlineBadge: React.FC<{ isOnline: boolean; className?: string; iconSize?: number }> = ({
    isOnline,
    className = '',
    iconSize = 13,
}) => (
    <span
        className={`inline-flex items-center gap-1 rounded-md font-semibold ${className}`}
        style={{
            background: isOnline ? 'rgba(0,172,71,0.12)' : 'rgba(255,255,255,0.06)',
            color: isOnline ? '#00ac47' : 'rgba(255,255,255,0.6)',
        }}
    >
        {isOnline ? <FiVideo size={iconSize} /> : <FiMapPin size={iconSize} />}
        {isOnline ? 'Online' : 'In Person'}
    </span>
);

/* ── Skeletons ── */
export const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
    className = '',
    style,
}) => (
    <div
        className={`rounded-md ${className}`}
        style={{ background: 'rgba(255,255,255,0.06)', ...style }}
    />
);

export const EventRowSkeleton: React.FC = () => (
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

export const EventsTimelineSkeleton: React.FC<{ groups?: number; rowsPerGroup?: number }> = ({
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

/* ── Attendee avatars ── */
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

export const AttendeeAvatar: React.FC<{ name: string; avatar?: string; size?: number }> = ({
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
                className="text-white/50 lg:block hidden group-hover:text-white/80 transition-colors text-left"
                style={{ fontSize: size <= 24 ? '0.7rem' : '0.8rem' }}
            >
                {label}
            </span>
        </button>
    );
};

export const EventMetaBadges: React.FC<{ event: RegisteredEvent; size?: 'sm' | 'md' }> = ({
    event,
    size = 'sm',
}) => {
    const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';
    const padding = size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-1.5';
    const iconSize = size === 'sm' ? 11 : 13;

    const ticketStatus = formatTicketPrice(event.ticketPrice);

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <OnlineBadge
                isOnline={event.isOnline}
                className={`${textSize} ${padding}`}
                iconSize={iconSize}
            />

            <span
                className={`inline-flex items-center gap-1 rounded-md font-semibold ${textSize} ${padding}`}
                style={{
                    background: ticketStatus === 'Free' ? 'rgba(255,255,255,0.06)' : 'rgba(166,255,0,0.12)',
                    color: ticketStatus === 'Free' ? 'rgba(255,255,255,0.6)' : '#a6ff00',
                }}
            >
                <FiTag size={iconSize} />
                {ticketStatus}
            </span>

            {event.requireApproval && (
                <span
                    className={`inline-flex items-center gap-1 rounded-md font-semibold ${textSize} ${padding}`}
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                >
                    <FiUserCheck size={iconSize} />
                    Approval Required
                </span>
            )}

            <span
                className={`inline-flex items-center gap-1 rounded-md font-semibold ${textSize} ${padding}`}
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
            >
                <FiUsers size={iconSize} />
                {event.capacity === null || event.capacity === undefined
                    ? 'Unlimited'
                    : `Cap ${event.capacity}`}
            </span>
        </div>
    );
};

/* ═══════════════════════════ Modal shell ═══════════════════════════ */
/**
 * Centered, portaled (to document.body), animated modal.
 * Portal matters: the drawer uses a CSS transform, which breaks position:fixed
 * for anything rendered inside it, so modals would drift off-center.
 */
export const ModalShell: React.FC<{
    onClose: () => void;
    maxWidth?: string;
    z?: string;
    className?: string;
    children: (close: () => void) => React.ReactNode;
}> = ({ onClose, maxWidth = 'max-w-sm', z = 'z-[100]', className = '', children }) => {
    const [show, setShow] = useState(false);
    const closing = useRef(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setShow(true));
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            cancelAnimationFrame(id);
            document.body.style.overflow = prev;
        };
    }, []);

    const close = useCallback(() => {
        if (closing.current) return;
        closing.current = true;
        setShow(false);
        setTimeout(onClose, 200); // matches duration-200
    }, [onClose]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [close]);

    return createPortal(
        <div
            className={`fixed inset-0 ${z} flex items-center justify-center px-4 transition-all duration-200 ease-out ${show ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
                }`}
            onClick={close}
        >
            <div
                className={`w-full bg-neutral-900/50 ${maxWidth} max-h-[85vh] rounded-2xl p-6 shadow-2xl transition-all duration-200 ease-out ${show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'
                    } ${className}`}
                style={{
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {children(close)}
            </div>
        </div>,
        document.body
    );
};

/* ═══════════════════════════ Guests modal ═══════════════════════════ */
export const GuestsModal: React.FC<{ attendees: Attendee[]; onClose: () => void }> = ({
    attendees,
    onClose,
}) => (
    <ModalShell onClose={onClose} className="flex flex-col">
        {(close) => (
            <>
                <div className="flex items-start justify-between mb-3 shrink-0">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                        <FiUsers className="text-white/70" size={20} />
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white shrink-0"
                    >
                        <FiX size={18} />
                    </button>
                </div>
                <h3 className="text-white text-xl font-black mb-1 shrink-0">
                    {attendees.length} Guest{attendees.length === 1 ? '' : 's'}
                </h3>
                <p className="text-white/40 text-xs mb-4 shrink-0">
                    Everyone who has registered for this event.
                </p>
                <div className="overflow-y-auto flex-1 min-h-0 -mx-2 px-2 space-y-1">
                    {attendees.map((a) => (
                        <div
                            key={a.id}
                            className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/3"
                        >
                            <AttendeeAvatar name={a.name} avatar={a.avatar} size={36} />
                            <div className="min-w-0">
                                <p className="text-white text-sm font-semibold truncate">{a.name}</p>
                                {a.email && <p className="text-white/35 text-xs truncate">{a.email}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}
    </ModalShell>
);

/* ═══════════════════════════ Invite modal ═══════════════════════════ */
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
            // clipboard not available
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
                        // user cancelled
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
        <ModalShell onClose={onClose}>
            {(close) => (
                <>
                    <div className="flex items-start justify-between mb-4">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                            <FiShare2 className="text-white/70" size={20} />
                        </div>
                        <button
                            type="button"
                            onClick={close}
                            className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white shrink-0"
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                    <h3 className="text-white text-xl font-black mb-1">Invite a Friend</h3>
                    <p className="text-white/40 text-xs mb-6 leading-relaxed">
                        It's always more fun with friends. We'll let you know when your friends accept
                        your invite.
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
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
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
                </>
            )}
        </ModalShell>
    );
};

/* ═══════════════════════════ Blast email modal (coming soon) ═══════════════════════════ */
export const BlastEmailModal: React.FC<{
    eventId: string;
    eventTitle: string;
    recipientCount: number;
    onClose: () => void;
}> = ({ onClose }) => (
    <ModalShell onClose={onClose} maxWidth="max-w-sm">
        {(close) => (
            <>
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(166,255,0,0.12)' }}
                    >
                        <FiSend size={20} style={{ color: '#a6ff00' }} />
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ background: 'rgba(166,255,0,0.12)', color: '#a6ff00' }}
                >
                    Coming soon
                </span>

                <h3 className="text-white text-xl font-black mb-2">Blast Email</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                    Soon you'll be able to send one email to everyone registered for your event, like
                    schedule changes, reminders or meeting links. We're still building it.
                </p>

                <button
                    type="button"
                    onClick={close}
                    className="w-full bg-white text-black py-2.5 rounded-md text-xs font-semibold cursor-pointer transition-transform hover:scale-[1.01]"
                >
                    Got it
                </button>
            </>
        )}
    </ModalShell>
);

/* ═══════════════════════════ Event drawer ═══════════════════════════ */
export const EventDrawerContent: React.FC<{
    event: RegisteredEvent | null;
    onClose: () => void;
    onOpenGuests: (event: RegisteredEvent) => void;
    onEdit: (event: RegisteredEvent) => void;
    onDelete: (event: RegisteredEvent) => void;
    onBlast: (event: RegisteredEvent) => void;
    isDeleting: boolean;
}> = ({ event, onClose, onOpenGuests, onEdit, onDelete, onBlast, isDeleting }) => {
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
            // clipboard not available
        }
    };

    return (
        <div className="bg-neutral-950 h-dvh w-full sm:w-[500px] flex flex-col shadow-xl overflow-hidden">
            <div className="flex flex-wrap items-center justify-between p-5 border-b border-[rgba(205,220,57,.08)] shrink-0 gap-4 bg-neutral-950 z-10">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleCopyLink}
                        className="px-4 py-2.5 text-xs bg-white cursor-pointer text-black rounded-md flex transition-colors gap-1.5 items-center justify-center hover:bg-white/90"
                    >
                        <FiCopy size={13} />
                        {copied ? 'Copied!' : 'Share'}
                    </button>
                    <a
                        href={event.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2.5 text-xs bg-white cursor-pointer text-black rounded-md flex transition-colors gap-1.5 items-center justify-center hover:bg-white/90"
                    >
                        View Page
                        <FiExternalLink size={13} />
                    </a>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onBlast(event);
                        }}
                        className="px-4 py-2.5 text-xs font-semibold cursor-pointer rounded-md flex gap-1.5 items-center justify-center text-black transition-transform hover:scale-[1.03]"
                        style={{ background: '#a6ff00' }}
                    >
                        <FiSend size={13} />
                        Blast
                    </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => onEdit(event)}
                        aria-label="Edit event"
                        className="p-2 rounded-lg bg-neutral-800 text-white/60 hover:text-white transition-colors"
                    >
                        <FiEdit2 size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(event)}
                        disabled={isDeleting}
                        aria-label="Delete event"
                        className="p-2 rounded-lg bg-neutral-800 text-red-400/80 hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                        <FiTrash2 size={18} />
                    </button>
                    <button
                        type="button"
                        aria-label="close sidebar"
                        onClick={onClose}
                        className="cursor-pointer p-2 rounded-lg bg-neutral-800 transition-colors shrink-0"
                    >
                        <FiX className="text-white/60 text-xl" />
                    </button>
                </div>
            </div>

            {/* Scrollable body (min-h-0 lets flex-1 actually scroll) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8">
                <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize mb-6"
                    style={{
                        background:
                            event.status === 'upcoming'
                                ? 'rgba(166,255,0,0.12)'
                                : 'rgba(255,255,255,0.06)',
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

                <h2 className="text-white text-2xl font-black mb-3 wrap-break-word">{event.title}</h2>

                {event.host && (
                    <div className="mb-6 border-y border-neutral-200/10 py-2 pb-4 w-full">
                        <p className="text-white/50 text-sm pb-2">Hosted by</p>
                        <div className="flex items-center gap-2.5">
                            <HostInitials name={event.host} avatar={event.hostAvatar} size={28} />
                            <span className="text-white font-bold text-sm">{event.host}</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center gap-3 text-white/70 text-sm">
                        <FiCalendar className="text-[#a6ff00] shrink-0" size={18} />
                        <span>
                            {event.dateLabel} · {event.time}
                        </span>
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-3 text-white/70 text-sm">
                            <LocationIcon
                                location={event.location}
                                size={18}
                                className="text-[#a6ff00]"
                            />
                            <span>{event.location}</span>
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                        Event Details
                    </h3>
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(205,220,57,.08)',
                        }}
                    >
                        <div
                            className="flex items-center justify-between gap-3 px-4 py-3"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="flex items-center gap-2.5 text-white/70 text-sm">
                                <FiVideo size={15} className="text-white/40" />
                                Format
                            </div>
                            <span
                                className="text-sm font-semibold"
                                style={{ color: event.isOnline ? '#00ac47' : 'rgba(255,255,255,0.7)' }}
                            >
                                {event.isOnline ? 'Online' : 'In Person'}
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
                        <div
                            className="flex items-center justify-between gap-3 px-4 py-3"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="flex items-center gap-2.5 text-white/70 text-sm">
                                <FiTag size={15} className="text-white/40" />
                                Tickets
                            </div>
                            <span className="text-sm font-semibold text-white/70">
                                {formatTicketPrice(event.ticketPrice)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="flex items-center gap-2.5 text-white/70 text-sm">
                                <FiUsers size={15} className="text-white/40" />
                                Capacity
                            </div>
                            <span className="text-sm font-semibold text-white/70">
                                {event.capacity === null || event.capacity === undefined
                                    ? 'Unlimited'
                                    : event.capacity}
                            </span>
                        </div>
                    </div>
                </div>

                {event.tickets && event.tickets.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                            Available Tickets
                        </h3>
                        <div className="flex flex-col gap-3">
                            {event.tickets.map((ticket, index) => {
                                const ticketPrice = Number(ticket.amount ?? ticket.price ?? 0) || 0;
                                const priceText = ticketPrice === 0 ? 'Free' : formatNaira(ticketPrice, 'Free');

                                return (
                                    <div
                                        key={ticket.id ?? `${ticket.name}-${index}`}
                                        className="w-full text-left rounded-xl p-2.5 transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(205,220,57,.08)',
                                        }}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div
                                                className="relative w-12 h-12 shrink-0 rounded overflow-hidden"
                                                style={{ background: 'rgba(255,255,255,0.06)' }}
                                            >
                                                {ticket.image ? (
                                                    <img
                                                        src={ticket.image}
                                                        alt={ticket.name || 'Ticket'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FiTag size={18} className="text-white/25" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-white text-sm font-semibold truncate">
                                                            {ticket.name || 'Ticket'}
                                                        </p>
                                                        {ticket.description && (
                                                            <p className="text-white/40 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                                                                {ticket.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <span
                                                        className="text-sm font-bold shrink-0"
                                                        style={{
                                                            color: ticketPrice === 0 ? 'rgba(255,255,255,0.5)' : '#a6ff00',
                                                        }}
                                                    >
                                                        {priceText}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {event.attendees.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                            Attendees · {event.registered}
                        </h3>
                        <div
                            className="flex items-center justify-between rounded-xl p-4"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(205,220,57,.08)',
                            }}
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
                        <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">
                            About
                        </h3>
                        <RichText html={event.description} />
                    </div>
                )}

                {event.meetingLink && (
                    <div className="mb-8">
                        <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                            Meeting Link
                        </h3>
                        <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between gap-3 rounded-md px-4 py-3 group"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(205,220,57,.08)',
                            }}
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
                        View Event
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



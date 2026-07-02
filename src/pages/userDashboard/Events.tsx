import React, { useRef, useState } from 'react';
import {
    FiCalendar,
    FiClock,
    FiCopy,
    FiExternalLink,
    FiMapPin,
    FiPlus,
    FiUsers,
    FiX,
} from 'react-icons/fi';
import type { Attendee, RegisteredEvent } from '../../component/dummyData/EventData';
import { EVENTS } from '../../component/dummyData/EventData';

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
                ? "You haven't registered for any upcoming events yet."
                : "You don't have any past events."}
        </p>
        {tab === 'upcoming' && (
            <a
                href="/dashboard/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-transform hover:scale-[1.02]"
                style={{ background: '#a6ff00' }}
            >
                <FiPlus size={16} />
                Explore Events
            </a>
        )}
    </div>
);

// ─── Overlapping avatar stack ──────────────────────────────────────────────
const AvatarStack: React.FC<{ attendees: Attendee[]; total: number; size?: number }> = ({
    attendees,
    total,
    size = 24,
}) => {
    const visible = attendees.slice(0, 4);
    const extra = total - visible.length;

    return (
        <div className="flex items-center">
            <div className="flex -space-x-2">
                {visible.map((a, i) => (
                    <img
                        key={i}
                        src={a.avatar}
                        alt={a.name}
                        title={a.name}
                        className="rounded-full object-cover shrink-0"
                        style={{
                            width: size,
                            height: size,
                            border: '2px solid #05080340',
                            boxShadow: '0 0 0 1.5px rgba(0,0,0,0.6)',
                        }}
                    />
                ))}
            </div>
            {extra > 0 && (
                <span
                    className="text-white/40 ml-2"
                    style={{ fontSize: size <= 24 ? '0.7rem' : '0.8rem' }}
                >
                    +{extra} more
                </span>
            )}
        </div>
    );
};

const EventRow: React.FC<{ event: RegisteredEvent; onView: (event: RegisteredEvent) => void }> = ({
    event,
    onView,
}) => (
    <div
        onClick={() => onView(event)}
        className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-xl p-4 sm:p-5 transition-colors hover:bg-white/[0.03] cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(205,220,57,.08)' }}
    >
        {/* Thumbnail */}
        <img
            src={event.thumbnail}
            alt={event.title}
            className="w-full h-28 sm:w-24 sm:h-24 rounded-lg shrink-0 object-cover"
        />

        {/* Info */}
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
                <span className="flex items-center gap-1.5">
                    <FiUsers size={13} />
                    {event.registered} registered
                </span>
            </div>
            <AvatarStack attendees={event.attendees} total={event.registered} size={24} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onView(event);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg font-semibold text-xs transition-colors bg-white text-black cursor-pointer"
            >
                {event.actionText}
            </button>
        </div>
    </div>
);

// ─── Event Detail Drawer Content ───────────────────────────────────────────
const EventDrawerContent: React.FC<{ event: RegisteredEvent | null; onClose: () => void }> = ({
    event,
    onClose,
}) => {
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
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[rgba(205,220,57,.08)] shrink-0 gap-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}
                    >
                        <FiCopy size={13} />
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a
                        href={event.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}
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
                {/* Status pill */}
                <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize mb-6"
                    style={{
                        background: event.status === 'upcoming' ? 'rgba(166,255,0,0.12)' : 'rgba(255,255,255,0.06)',
                        color: event.status === 'upcoming' ? '#a6ff00' : 'rgba(255,255,255,0.5)',
                    }}
                >
                    {event.status}
                </span>

                {/* Thumbnail */}
                <img
                    src={event.thumbnail}
                    alt={event.title}
                    className="w-full h-48 sm:h-56 rounded-2xl mb-6 object-cover"
                />

                <h2 className="text-white text-2xl font-black mb-3 break-words">{event.title}</h2>

                {event.host && (
                    <div className="flex items-center gap-2.5 mb-6">
                        {event.hostAvatar && (
                            <img
                                src={event.hostAvatar}
                                alt={event.host}
                                className="w-7 h-7 rounded-full object-cover"
                                style={{ border: '1px solid rgba(205,220,57,.2)' }}
                            />
                        )}
                        <p className="text-white/50 text-sm">Hosted by {event.host}</p>
                    </div>
                )}

                <div className="flex flex-col gap-4 mb-8">
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

                {/* Attendees */}
                <div className="mb-8">
                    <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                        Attendees · {event.registered}
                    </h3>
                    <div
                        className="flex items-center justify-between rounded-xl p-4"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(205,220,57,.08)' }}
                    >
                        <AvatarStack attendees={event.attendees} total={event.registered} size={32} />
                    </div>
                </div>

                {event.description && (
                    <div className="mb-8">
                        <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">About</h3>
                        <p className="text-white/50 text-sm leading-relaxed">{event.description}</p>
                    </div>
                )}

                {/* Public link box */}
                <div
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-8"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(205,220,57,.08)' }}
                >
                    <span className="text-white/40 text-xs truncate">{window.location.origin}{event.publicUrl}</span>
                    <button
                        onClick={handleCopyLink}
                        className="text-xs font-semibold shrink-0 cursor-pointer"
                        style={{ color: '#a6ff00' }}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        className="w-full py-3.5 rounded-lg font-semibold text-sm text-black transition-transform hover:scale-[1.01]"
                        style={{ background: '#a6ff00' }}
                    >
                        {event.actionText}
                    </button>
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
    const drawerCheckboxRef = useRef<HTMLInputElement>(null);

    const filtered = EVENTS.filter((e) => e.status === tab);

    // Group by dateLabel, preserving order
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
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-10">
                            <h1 className="text-2xl sm:text-3xl font-black text-white">Events</h1>

                            {/* Tabs */}
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
                        </div>

                        {/* Content */}
                        {filtered.length === 0 ? (
                            <EmptyState tab={tab} />
                        ) : (
                            <div className="flex flex-col gap-10">
                                {Object.entries(grouped).map(([label, events]) => (
                                    <div key={label} className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                        {/* Timeline label */}
                                        <div className="sm:w-28 shrink-0 pt-1">
                                            <p className="text-white font-bold text-sm">{label}</p>
                                        </div>

                                        {/* Timeline line + events */}
                                        <div className="flex-1 flex flex-col gap-3 relative">
                                            <div
                                                className="absolute left-[-1.25rem] sm:left-[-2rem] top-2 bottom-2 w-px hidden sm:block"
                                                style={{ background: 'rgba(205,220,57,.1)' }}
                                            />
                                            {events.map((event) => (
                                                <EventRow key={event.id} event={event} onView={openDrawer} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Event Detail Drawer */}
            <div className="drawer-side z-50">
                <div
                    aria-label="close sidebar"
                    className="drawer-overlay"
                    onClick={closeDrawer}
                />
                <EventDrawerContent event={selectedEvent} onClose={closeDrawer} />
            </div>
        </div>
    );
};

export default Events;
import React, { useRef, useState } from 'react';
import {
    FiArrowRight,
    FiCalendar,
    FiClock,
    FiCopy,
    FiExternalLink,
    FiMapPin,
    FiPlus,
    FiUsers,
    FiX,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Button from '../../component/ui/Button';
import { MENTORS, type Mentor } from './Explore';

export interface Attendee {
    name: string;
    avatar: string;
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
}

export const EVENTS: RegisteredEvent[] = [
    {
        id: '1',
        title: 'The Future of Quant Finance with AI',
        time: '2:00 PM',
        date: '2026-07-02',
        dateLabel: 'Today',
        location: 'Zoom',
        registered: 342,
        thumbnail: 'https://picsum.photos/seed/quantfinance/900/900',
        status: 'upcoming',
        actionText: 'Join Event',
        host: 'Quant Society',
        hostAvatar: 'https://i.pravatar.cc/64?img=12',
        hostEmail: 'hello@quantsociety.io',
        description: 'A deep dive into how AI is reshaping quantitative finance, from signal discovery to execution.',
        attendees: [
            { name: 'Ada Lovelace', avatar: 'https://i.pravatar.cc/64?img=5' },
            { name: 'Grace Hopper', avatar: 'https://i.pravatar.cc/64?img=9' },
            { name: 'Alan Turing', avatar: 'https://i.pravatar.cc/64?img=15' },
            { name: 'Katherine Johnson', avatar: 'https://i.pravatar.cc/64?img=25' },
            { name: 'John Nash', avatar: 'https://i.pravatar.cc/64?img=33' },
        ],
        publicUrl: '/events/1',
    },
    {
        id: '2',
        title: 'CyberSecurity Fundamentals for Developers',
        time: '10:00 AM',
        date: '2026-07-10',
        dateLabel: 'Friday',
        location: 'Main Auditorium',
        registered: 128,
        thumbnail: 'https://picsum.photos/seed/cybersecurity/900/900',
        status: 'upcoming',
        actionText: 'Join Event',
        host: 'DevSec Club',
        hostAvatar: 'https://i.pravatar.cc/64?img=18',
        hostEmail: 'contact@devsecclub.io',
        description: 'Hands-on session covering the security fundamentals every developer should know.',
        attendees: [
            { name: 'Linus Torvalds', avatar: 'https://i.pravatar.cc/64?img=22' },
            { name: 'Margaret Hamilton', avatar: 'https://i.pravatar.cc/64?img=28' },
            { name: 'Tim Berners-Lee', avatar: 'https://i.pravatar.cc/64?img=41' },
        ],
        publicUrl: '/events/2',
    },
    {
        id: '3',
        title: 'Global Economics Trends in the AI Era',
        time: '2:00 PM',
        date: '2026-06-18',
        dateLabel: 'Jun 18',
        location: 'Zoom',
        registered: 215,
        thumbnail: 'https://picsum.photos/seed/globaleconomics/900/900',
        status: 'past',
        actionText: 'View Recording',
        host: 'Econ Circle',
        hostAvatar: 'https://i.pravatar.cc/64?img=36',
        hostEmail: 'team@econcircle.io',
        description: 'A recap of the macro trends shaping global economics as AI adoption accelerates.',
        attendees: [
            { name: 'Adam Smith', avatar: 'https://i.pravatar.cc/64?img=47' },
            { name: 'Janet Yellen', avatar: 'https://i.pravatar.cc/64?img=44' },
            { name: 'Amartya Sen', avatar: 'https://i.pravatar.cc/64?img=51' },
            { name: 'Esther Duflo', avatar: 'https://i.pravatar.cc/64?img=29' },
        ],
        publicUrl: '/events/3',
    },
];

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


const LatestEventHero: React.FC<{ event: RegisteredEvent; onView: (event: RegisteredEvent) => void }> = ({
    event,
    onView,
}) => (
    <div
        onClick={() => onView(event)}
        className="relative rounded-xl overflow-hidden mb-10 cursor-pointer group"
        style={{ border: '1px solid rgba(205,220,57,.15)' }}
    >
        <img
            src={event.thumbnail}
            alt={event.title}
            className="w-full h-56 sm:h-72 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.95) 100%)' }}
        />
        <div className="absolute top-4 left-4">
            <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'white', color: 'black', border: '1px solid rgba(166,255,0,.3)' }}
            >
                Next Up
            </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
            <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm mb-2">
                <FiClock size={13} />
                <span>{event.dateLabel} · {event.time}</span>
                {event.location && (
                    <>
                        <span className="text-white/30">·</span>
                        <FiMapPin size={13} />
                        <span>{event.location}</span>
                    </>
                )}
            </div>
            <h2 className="text-white text-xl sm:text-3xl font-black mb-4 max-w-xl break-words">
                {event.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4">
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onView(event);
                    }}
                    variant="green"
                    className="text-xs sm:text-sm"
                >
                    {event.actionText}
                </Button>
                <span className="flex items-center gap-1.5 text-white/60 text-xs sm:text-sm">
                    <FiUsers size={13} />
                    {event.registered} registered
                </span>
            </div>
        </div>
    </div>
);

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
            className="w-full h-full aspect-video sm:w-24 sm:h-24 rounded-lg shrink-0 object-cover"
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

const MentorCardCompact: React.FC<{ mentor: Mentor }> = ({ mentor }) => (
    <div
        className="rounded-2xl lg:p-5 p-3 flex flex-col"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(205,220,57,.08)' }}
    >
        <div className="flex items-start justify-between lg:mb-4 mb-2">
            <img
                src={mentor.avatar}
                alt={mentor.name}
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
        <h3 className="text-white font-bold text-base mb-1">{mentor.name}</h3>
        <p className="text-white/40 text-xs leading-relaxed lg:mb-3 mb-2 line-clamp-2">{mentor.bio}</p>
        <span
            className="inline-block w-fit px-2.5 py-1 rounded-md text-xs font-semibold text-white"
            style={{ background: 'rgba(166,255,0,0.08)' }}
        >
            {mentor.tag}
        </span>
    </div>
);


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

                {/* Fixed: plain button instead of <label htmlFor> — avoids the race
                    between the native checkbox toggle and React unmounting this
                    component (which was leaving the drawer-overlay stuck visible). */}
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

const Overview: React.FC = () => {
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedEvent, setSelectedEvent] = useState<RegisteredEvent | null>(null);
    const drawerCheckboxRef = useRef<HTMLInputElement>(null);

    const filtered = EVENTS.filter((e) => e.status === tab);


    const grouped = filtered.reduce<Record<string, RegisteredEvent[]>>((acc, event) => {
        acc[event.dateLabel] = acc[event.dateLabel] || [];
        acc[event.dateLabel].push(event);
        return acc;
    }, {});

    // Soonest upcoming event, used for the spotlight hero
    const upcomingEvents = EVENTS.filter((e) => e.status === 'upcoming').sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const latestEvent = upcomingEvents[0];

    const openDrawer = (event: RegisteredEvent) => {
        setSelectedEvent(event);
        if (drawerCheckboxRef.current) {
            drawerCheckboxRef.current.checked = true;
        }
    };

    const closeDrawer = () => {
        // Uncheck first (synchronously) so the CSS-driven overlay is
        // guaranteed to hide, then clear the event data.
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
                        {/* Latest upcoming event spotlight */}
                        {latestEvent && <LatestEventHero event={latestEvent} onView={openDrawer} />}

                        {/* Header */}
                        <div className="flex items-center justify-between mb-10 gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black text-white">Events</h1>

                            <div className="flex items-center gap-3">
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

                        {/* Link visible on mobile since the header one is hidden below sm */}
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
                                {MENTORS.slice(0, 6).map((mentor) => (
                                    <MentorCardCompact key={mentor.id} mentor={mentor} />
                                ))}
                            </div>
                        </div>
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

export default Overview;
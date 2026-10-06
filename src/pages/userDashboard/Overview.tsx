import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    FiAlertTriangle,
    FiArrowRight,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiEdit2,
    FiPlus,
    FiTrash2,
    FiUsers,
    FiX
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import LoadingOverlay from '../../component/LoadingOverlay';
import Button from '../../component/ui/Button';
import { useDeleteEvent } from '../../hooks/mutations/allMutation';
import {
    useGetMentors,
    useGetMineEvents,
    useGetMyUserProfile,
} from '../../hooks/queries/allQueriess';
import { useGlobalContext } from '../../providers/GlobalContext';
import { type Mentor } from './Explore';

import { BsSendCheckFill } from 'react-icons/bs';
import upload from '../../assets/upload.jpg';
import ConfirmCreateEventModal from '../../component/Confirmcreateeventmodal';
import ConfirmDeleteModal from '../../component/ConfirmDeleteModal';
import DashFooter from '../../component/DashFooter';
import {
    type ApiEvent,
    type RegisteredEvent,
    AvatarStack,
    BlastEmailModal,
    EventDrawerContent,
    EventMetaBadges,
    EventsTimelineSkeleton,
    GuestsModal,
    LocationIcon,
    SkeletonBlock,
    mapApiEventToRegistered,
} from './EventShared';

// Keep these exports so other files importing from './Overview' keep working.
export {
    AvatarStack,
    EventDrawerContent,
    EventMetaBadges,
    GuestsModal,
    HostInitials,
    InviteFriendModal,
    formatTicketPrice,
    mapApiEventToRegistered
} from './EventShared';
export type { ApiAttendee, ApiEvent, Attendee, RegisteredEvent } from './EventShared';

// ─── Hero skeleton ──────────────────────────────────────────────────────────
const EventHeroSkeleton: React.FC = () => (
    <div
        className="relative rounded-xl overflow-hidden mb-10"
        style={{ border: '1px solid rgba(205,220,57,.15)' }}
    >
        <SkeletonBlock className="w-full h-56 sm:h-72" style={{ borderRadius: 0 }} />
        <div
            className="absolute inset-0"
            style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)',
            }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 space-y-3">
            <SkeletonBlock className="h-3.5 w-40" />
            <SkeletonBlock className="h-7 sm:h-9 w-2/3" />
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="h-9 w-28" />
        </div>
    </div>
);

const EmptyState: React.FC<{ tab: 'upcoming' | 'past' }> = ({ tab }) => (
    <div className="flex flex-col items-center justify-center py-10 sm:py-10">
        <div className="relative w-20 h-20 rounded-xl mb-4 flex items-center justify-center bg-neutral-900">
            <FiCalendar size={44} className="text-white" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">
            No {tab === 'upcoming' ? 'Upcoming' : 'Past'} Events
        </h2>
        <p className="text-white/40 text-sm mb-3">
            {tab === 'upcoming'
                ? "You don't have any upcoming events."
                : "You don't have any past events."}
        </p>
        {tab === 'upcoming' && (
            <a
                href="/dashboard/events/create"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md font-semibold text-sm text-black transition-transform hover:scale-[1.02]"
                style={{ background: '#a6ff00' }}
            >
                <FiPlus size={16} />
                Create Events
            </a>
        )}
    </div>
);

// ─── Hero ───────────────────────────────────────────────────────────────────
const LatestEventHero: React.FC<{
    event: RegisteredEvent;
    onView: (event: RegisteredEvent) => void;
    onOpenGuests: (event: RegisteredEvent) => void;
    onEdit: (event: RegisteredEvent) => void;
    onDelete: (event: RegisteredEvent) => void;
    onBlast: (event: RegisteredEvent) => void;
    isDeleting: boolean;
}> = ({ event, onView, onOpenGuests, onEdit, onDelete, onBlast, isDeleting }) => (
    <div
        onClick={() => onView(event)}
        className="relative rounded-xl overflow-hidden mb-10 cursor-pointer group bg-white/10"
    >
        <img
            src={event.thumbnail} decoding="async"
            alt={event.title}
            className="w-full h-full aspect-square lg:h-72 object-cover transition-transform duration-300 group-hover:scale-101"
        />
        <div
            className="absolute inset-0"
            style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.99) 100%)',
            }}
        />
        <div className="absolute lg:top-4 lg:left-4 right-4 top-4 flex items-center gap-2">
            <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                    background: 'white',
                    color: 'black',
                    border: '1px solid rgba(166,255,0,.3)',
                }}
            >
                Next Up
            </span>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onBlast(event);
                }}
                aria-label="Send blast email"
                className="flex h-8 w-8 items-center bg-white cursor-pointer justify-center rounded text-black backdrop-blur-sm"
            >
                <BsSendCheckFill size={13} />
            </button>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(event);
                }}
                aria-label="Edit event"
                className="flex h-8 w-8 items-center bg-white cursor-pointer justify-center rounded text-black backdrop-blur-sm"
            >
                <FiEdit2 size={13} />
            </button>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event);
                }}
                disabled={isDeleting}
                aria-label="Delete event"
                className="flex h-8 w-8 items-center justify-center rounded cursor-pointer text-red-400 bg-white backdrop-blur-sm disabled:opacity-40"
            >
                <FiTrash2 size={13} />
            </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 lg:p-5 p-7 lg:pb-5 pb-10">
            <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm mb-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 shrink-0">
                    <FiClock size={13} />
                    <span>
                        {event.dateLabel} · {event.time}
                    </span>
                </div>
                {event.location && (
                    <div className="flex items-center gap-1.5 min-w-0 max-w-[65%] sm:max-w-[50%]">
                        <span className="text-white/30 shrink-0">·</span>
                        <LocationIcon location={event.location} size={13} />
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

// ─── Row ────────────────────────────────────────────────────────────────────
const EventRow: React.FC<{
    event: RegisteredEvent;
    onView: (event: RegisteredEvent) => void;
    onOpenGuests: (event: RegisteredEvent) => void;
    onEdit: (event: RegisteredEvent) => void;
    onDelete: (event: RegisteredEvent) => void;
    onBlast: (event: RegisteredEvent) => void;
    isDeleting: boolean;
}> = ({ event, onView, onOpenGuests, onEdit, onDelete, onBlast, isDeleting }) => (
    <>
        {/* Mobile card */}
        <div
            onClick={() => onView(event)}
            className="flex sm:hidden flex-col gap-0 rounded-xl p-4 cursor-pointer bg-white/5"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-sm mb-1">{event.time}</p>
                    <h3 className="text-white font-bold text-lg break-words mb-2">{event.title}</h3>

                    {event.location ? (
                        <div className="flex items-center gap-2 text-white/40 text-sm mb-1.5">
                            <LocationIcon location={event.location} size={15} />
                            <span className="truncate">{event.location}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-amber-400 text-sm mb-1.5">
                            <FiAlertTriangle size={15} />
                            <span>Location Missing</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-white/40 text-sm">
                        <FiUsers size={15} />
                        <span>
                            {event.registered > 0
                                ? `${event.registered} guest${event.registered === 1 ? '' : 's'}`
                                : 'No guests'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    <img
                        src={event.thumbnail} loading="lazy" decoding="async"
                        alt={event.title}
                        className="w-28 h-24 border-4 border-white/5 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onBlast(event);
                            }}
                            aria-label="Send blast email"
                            className="flex h-8 w-8 items-center bg-white text-black justify-center rounded"
                        >
                            <BsSendCheckFill size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(event);
                            }}
                            aria-label="Edit event"
                            className="flex h-8 w-8 bg-white items-center justify-center rounded text-black"
                        >
                            <FiEdit2 size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(event);
                            }}
                            disabled={isDeleting}
                            aria-label="Delete event"
                            className="flex h-8 w-8 bg-white items-center justify-center rounded text-red-400/80 disabled:opacity-40"
                        >
                            <FiTrash2 size={13} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center gap-3">
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onView(event);
                    }}
                    variant="white"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm mt-3"
                >
                    Manage Event
                    <FiArrowRight size={14} />
                </Button>

                {event.attendees.length > 0 && (
                    <AvatarStack
                        attendees={event.attendees}
                        total={event.registered}
                        size={20}
                        onOpenGuests={() => onOpenGuests(event)}
                    />
                )}
            </div>
        </div>

        {/* Desktop row */}
        <div
            onClick={() => onView(event)}
            className="hidden sm:flex sm:items-center gap-6 rounded-xl p-5 transition-colors bg-white/5 cursor-pointer"
        >
            <img
                src={event.thumbnail} loading="lazy" decoding="async"
                alt={event.title}
                className="w-24 h-24 rounded-lg shrink-0 object-cover"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-white/40 text-sm mb-1.5">
                    <FiClock size={13} />
                    <span>{event.time}</span>
                </div>
                <h3 className="text-white font-bold text-lg break-words mb-2">{event.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/40 text-sm mb-2">
                    {event.location ? (
                        <span className="flex items-center gap-1.5">
                            <LocationIcon location={event.location} size={13} />
                            {event.location}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-amber-400">
                            <FiAlertTriangle size={13} />
                            Location Missing
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

            <div className="flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onBlast(event);
                    }}
                    aria-label="Send blast email"
                    title="Send blast email"
                    className="flex h-9 w-9 bg-neutral-900 cursor-pointer text-white items-center justify-center rounded transition-colors"
                >
                    <BsSendCheckFill size={14} />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(event);
                    }}
                    aria-label="Edit event"
                    className="flex h-9 w-9 bg-neutral-900 cursor-pointer items-center justify-center rounded text-white hover:text-white transition-colors"
                >
                    <FiEdit2 size={14} />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(event);
                    }}
                    disabled={isDeleting}
                    aria-label="Delete event"
                    className="flex h-9 w-9 bg-neutral-900 cursor-pointer items-center justify-center rounded text-red-400/80 hover:text-red-400 transition-colors disabled:opacity-40"
                >
                    <FiTrash2 size={14} />
                </button>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onView(event);
                    }}
                    variant="white"
                    className="text-xs"
                >
                    {event.actionText}
                    <FiArrowRight />
                </Button>
            </div>
        </div>
    </>
);

// ─── Mentor card ────────────────────────────────────────────────────────────
const MentorCardCompact: React.FC<{ mentor: Mentor }> = ({ mentor }: any) => (
    <Link
        to={`/dashboard/mentors/${mentor.id}`}
        className="rounded-2xl lg:p-5 p-3 flex flex-col bg-white/5"
    >
        <div className="flex items-start justify-between lg:mb-4 mb-2">
            <img
                src={mentor?.avatar} loading="lazy" decoding="async"
                alt={mentor?.first_name + ' ' + mentor?.last_name}
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
        <h3 className="text-white font-bold text-base">
            {mentor.first_name} {mentor.last_name}
        </h3>
        <p className="text-white/30 text-xs leading-relaxed lg:mb-3 mb-2">@{mentor.nick_name}</p>
        <p className="text-white/60 text-xs leading-relaxed lg:mb-3 mb-2 line-clamp-2">
            {mentor.bio}
        </p>
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

/* ─── Complete Profile Modal ─────────────────────────────────────────────── */
const PROFILE_FIELDS = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'phone_number', label: 'Phone Number' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'country', label: 'Country' },
] as const;

const getMissingFields = (profile: any): string[] => {
    if (!profile) return [];
    return PROFILE_FIELDS.filter(
        ({ key }) => !profile[key] || String(profile[key]).trim() === ''
    ).map(({ label }) => label);
};

const CompleteProfileModal: React.FC<{
    missingFields: string[];
    onClose: () => void;
    onGoToSettings: () => void;
}> = ({ missingFields, onClose, onGoToSettings }) => (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
        <div
            className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
            style={{
                background: 'rgba(10,12,9,0.98)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="relative w-full h-64 overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 80% at 50% 20%, rgba(166,255,0,0.18), transparent 60%), linear-gradient(180deg, #0f1a0c 0%, #0a0f08 100%)',
                    }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <img src={upload} alt="" />
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <FiX size={18} />
                </button>
            </div>

            <div className="p-6 sm:p-7">
                <h3 className="text-white text-xl sm:text-2xl font-black mb-2">
                    Complete your profile
                </h3>
                <p className="text-white/45 text-sm leading-relaxed mb-5">
                    A few details are still missing. Finish setting up your account so mentors and
                    mentees can find and trust you.
                </p>

                <div className="mb-6">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-3">
                        Still needed
                    </p>
                    <ul className="space-y-2">
                        {missingFields.map((field) => (
                            <li
                                key={field}
                                className="flex items-center gap-2.5 text-sm text-white/80"
                            >
                                <span
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                    style={{ background: 'rgba(166,255,0,0.12)' }}
                                >
                                    <FiCheckCircle size={12} className="text-[#a6ff00]" />
                                </span>
                                {field}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                    <Button variant="white" onClick={onGoToSettings} className="w-full sm:flex-1">
                        <span className="flex items-center justify-center gap-2">
                            Complete Profile
                            <FiArrowRight size={14} />
                        </span>
                    </Button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-semibold text-white/60 hover:text-white transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ─── Page ───────────────────────────────────────────────────────────────────
const Overview: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useGlobalContext();
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedEvent, setSelectedEvent] = useState<RegisteredEvent | null>(null);
    const [guestsEvent, setGuestsEvent] = useState<RegisteredEvent | null>(null);
    const [blastEvent, setBlastEvent] = useState<RegisteredEvent | null>(null);
    const [showCompleteProfile, setShowCompleteProfile] = useState(false);
    const [dismissedProfileModal, setDismissedProfileModal] = useState(false);
    const [showCreateConfirm, setShowCreateConfirm] = useState(false);
    const drawerCheckboxRef = useRef<HTMLInputElement>(null);

    const { mentors, isLoading } = useGetMentors();
    const allMentors = mentors?.data?.results;

    const { myProfile, isLoading: isLoadingProfile } = useGetMyUserProfile();
    const userProfile = myProfile?.data;

    const { mineEvents, isLoading: isLoadingEvents, refetch } = useGetMineEvents();
    const { mutate: deleteEvent, isPending: isDeleting, variables: deletingId } = useDeleteEvent();

    const myEvents = useMemo(() => {
        const raw: ApiEvent[] = Array.isArray(mineEvents?.data)
            ? mineEvents.data
            : mineEvents?.data?.results ?? [];
        return raw.map(mapApiEventToRegistered);
    }, [mineEvents]);

    const hasEvents = myEvents.length > 0;
    const filtered = useMemo(() => myEvents.filter((e) => e.status === tab), [myEvents, tab]);

    const grouped = useMemo(
        () =>
            filtered.reduce<Record<string, RegisteredEvent[]>>((acc, event) => {
                acc[event.dateLabel] = acc[event.dateLabel] || [];
                acc[event.dateLabel].push(event);
                return acc;
            }, {}),
        [filtered]
    );

    const latestEvent = useMemo(
        () =>
            myEvents
                .filter((e) => e.status === 'upcoming')
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0],
        [myEvents]
    );

    const missingFields = getMissingFields(userProfile);

    useEffect(() => {
        if (!isLoadingProfile && userProfile && missingFields.length > 0 && !dismissedProfileModal) {
            setShowCompleteProfile(true);
        }
    }, [isLoadingProfile, userProfile, missingFields.length, dismissedProfileModal]);

    const openDrawer = (event: RegisteredEvent) => {
        setSelectedEvent(event);
        if (drawerCheckboxRef.current) drawerCheckboxRef.current.checked = true;
    };

    const closeDrawer = () => {
        if (drawerCheckboxRef.current) drawerCheckboxRef.current.checked = false;
        setSelectedEvent(null);
    };

    const handleEdit = (event: RegisteredEvent) => {
        navigate(`/dashboard/events/edit/${event.id}`);
    };

    const [eventToDelete, setEventToDelete] = useState<RegisteredEvent | null>(null);
    const handleDelete = (event: RegisteredEvent) => setEventToDelete(event);

    const confirmDelete = () => {
        if (!eventToDelete) return;
        const target = eventToDelete;

        deleteEvent(target.id, {
            onSuccess: () => {
                addToast('Event deleted', 'success');
                setEventToDelete(null);
                if (selectedEvent?.id === target.id) closeDrawer();
                refetch?.();
            },
            onError: (error: any) => {
                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    'Could not delete event. Please try again.';
                addToast(message, 'error');
                setEventToDelete(null);
            },
        });
    };

    const confirmCreate = () => {
        setShowCreateConfirm(false);
        navigate('/dashboard/events/create');
    };

    const handleCloseProfileModal = () => {
        setShowCompleteProfile(false);
        setDismissedProfileModal(true);
    };

    return (
        <div className="drawer drawer-end ">
            <input
                ref={drawerCheckboxRef}
                id="event-drawer-toggle"
                type="checkbox"
                className="drawer-toggle"
            />
            <LoadingOverlay visible={isLoading || isLoadingProfile} />

            <div className="drawer-content">
                <div className="relative isolate flex w-full min-h-screen flex-col bg-black">
                    {/* Fixed background layer: painted once instead of re-painted while scrolling */}
                    <div
                        aria-hidden
                        className="pointer-events-none fixed inset-0 -z-10"
                        style={{ background: "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)" }}
                    />
                    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        {/* Latest upcoming event spotlight */}
                        {isLoadingEvents ? (
                            <EventHeroSkeleton />
                        ) : (
                            latestEvent && (
                                <LatestEventHero
                                    event={latestEvent}
                                    onView={openDrawer}
                                    onOpenGuests={setGuestsEvent}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onBlast={setBlastEvent}
                                    isDeleting={isDeleting && String(deletingId) === latestEvent.id}
                                />
                            )
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between mb-10 gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black text-white">Events</h1>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center rounded-lg p-1 bg-white/5 gap-1.5">
                                    {(['upcoming', 'past'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTab(t)}
                                            className="px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors cursor-pointer"
                                            style={{
                                                background: tab === t ? 'white' : 'transparent',
                                                color: tab === t ? 'black' : '#ffff',
                                            }}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                {hasEvents && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateConfirm(true)}
                                        aria-label="Create new event"
                                        title="Create new event"
                                        className="flex h-9 w-9 items-center justify-center rounded-full text-black cursor-pointer transition-transform hover:scale-105"
                                        style={{
                                            background: '#a6ff00',
                                            boxShadow: '0 0 12px rgba(166,255,0,0.35)',
                                        }}
                                    >
                                        <FiPlus size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        {isLoadingEvents ? (
                            <EventsTimelineSkeleton groups={2} rowsPerGroup={2} />
                        ) : filtered.length === 0 ? (
                            <EmptyState tab={tab} />
                        ) : (
                            <div className="flex flex-col lg:gap-10 gap-4">
                                {Object.entries(grouped).map(([label, events]) => (
                                    <div
                                        key={label}
                                        className="flex flex-col sm:flex-row gap-4 sm:gap-8"
                                    >
                                        <div className="sm:w-28 shrink-0 pt-1">
                                            <p className="text-white font-bold text-sm">{label}</p>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-3 relative">
                                            <div
                                                className="absolute -left-5 sm:-left-5 top-2 bottom-2 w-px hidden sm:block"
                                                style={{ background: 'rgba(205,220,57,.1)' }}
                                            />
                                            {events.map((event) => (
                                                <EventRow
                                                    key={event.id}
                                                    event={event}
                                                    onView={openDrawer}
                                                    onOpenGuests={setGuestsEvent}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                    onBlast={setBlastEvent}
                                                    isDeleting={
                                                        isDeleting && String(deletingId) === event.id
                                                    }
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
                                <h2 className="text-white text-xl sm:text-2xl font-bold">
                                    Top Mentors
                                </h2>
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

                    <DashFooter />
                </div>
            </div>

            <div className="drawer-side z-50">
                <div aria-label="close sidebar" className="drawer-overlay" onClick={closeDrawer} />
                <EventDrawerContent
                    event={selectedEvent}
                    onClose={closeDrawer}
                    onOpenGuests={setGuestsEvent}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onBlast={setBlastEvent}
                    isDeleting={isDeleting && String(deletingId) === selectedEvent?.id}
                />
            </div>

            {guestsEvent && (
                <GuestsModal
                    attendees={guestsEvent.attendees}
                    onClose={() => setGuestsEvent(null)}
                />
            )}

            {blastEvent && (
                <BlastEmailModal
                    eventId={blastEvent.id}
                    eventTitle={blastEvent.title}
                    recipientCount={blastEvent.registered}
                    onClose={() => setBlastEvent(null)}
                />
            )}

            {showCompleteProfile && missingFields.length > 0 && (
                <CompleteProfileModal
                    missingFields={missingFields}
                    onClose={handleCloseProfileModal}
                    onGoToSettings={() => {
                        handleCloseProfileModal();
                        navigate('/dashboard/setting');
                    }}
                />
            )}

            {eventToDelete && (
                <ConfirmDeleteModal
                    title={eventToDelete.title}
                    isDeleting={isDeleting}
                    onConfirm={confirmDelete}
                    onCancel={() => setEventToDelete(null)}
                />
            )}

            {showCreateConfirm && (
                <ConfirmCreateEventModal
                    onConfirm={confirmCreate}
                    onCancel={() => setShowCreateConfirm(false)}
                />
            )}
        </div>
    );
};

export default Overview;
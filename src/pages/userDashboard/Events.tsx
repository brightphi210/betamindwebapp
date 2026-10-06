import React, { useMemo, useRef, useState } from 'react';
import {
    FiAlertTriangle,
    FiArrowRight,
    FiCalendar,
    FiClock,
    FiEdit2,
    FiPlus,
    FiSend,
    FiTrash2,
    FiUsers,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmCreateEventModal from '../../component/Confirmcreateeventmodal';
import ConfirmDeleteModal from '../../component/ConfirmDeleteModal';
import DashFooter from '../../component/DashFooter';
import Button from '../../component/ui/Button';
import { useDeleteEvent } from '../../hooks/mutations/allMutation';
import { useGetMineEvents } from '../../hooks/queries/allQueriess';
import { useGlobalContext } from '../../providers/GlobalContext';
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
    mapApiEventToRegistered,
} from './EventShared';

const EmptyState: React.FC<{ tab: 'upcoming' | 'past' }> = ({ tab }) => (
    <div className="flex flex-col items-center justify-center py-24 sm:py-32">
        <div className="relative w-24 h-24 rounded-2xl mb-8 flex items-center justify-center bg-white/5">
            <FiCalendar size={44} className="text-white" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">
            No {tab === 'upcoming' ? 'Upcoming' : 'Past'} Events
        </h2>
        <p className="text-white/40 text-sm mb-2">
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
            className="flex sm:hidden flex-col gap-0 rounded-xl p-4 cursor-pointer bg-neutral-950 border border-neutral-900"
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
                        className="w-24 h-23 border-4 border-white/5 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onBlast(event);
                            }}
                            aria-label="Send blast email"
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: 'rgba(166,255,0,0.12)', color: '#a6ff00' }}
                        >
                            <FiSend size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(event);
                            }}
                            aria-label="Edit event"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
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
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/80 disabled:opacity-40"
                            style={{ background: 'rgba(248,113,113,0.1)' }}
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

            <div className="flex gap-2 shrink-0">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onBlast(event);
                    }}
                    aria-label="Send blast email"
                    title="Send blast email"
                    className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:brightness-125"
                    style={{ background: 'rgba(166,255,0,0.12)', color: '#a6ff00' }}
                >
                    <FiSend size={14} />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(event);
                    }}
                    aria-label="Edit event"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400/80 hover:text-red-400 transition-colors disabled:opacity-40"
                    style={{ background: 'rgba(248,113,113,0.1)' }}
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
                </Button>
            </div>
        </div>
    </>
);

const Events: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useGlobalContext();
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedEvent, setSelectedEvent] = useState<RegisteredEvent | null>(null);
    const [guestsEvent, setGuestsEvent] = useState<RegisteredEvent | null>(null);
    const [blastEvent, setBlastEvent] = useState<RegisteredEvent | null>(null);
    const [eventToDelete, setEventToDelete] = useState<RegisteredEvent | null>(null);
    const [showCreateConfirm, setShowCreateConfirm] = useState(false);
    const drawerCheckboxRef = useRef<HTMLInputElement>(null);

    const { mineEvents, isLoading, refetch } = useGetMineEvents();
    const { mutate: deleteEvent, isPending: isDeleting, variables: deletingId } = useDeleteEvent();

    const allEvents = useMemo(() => {
        const raw: ApiEvent[] = Array.isArray(mineEvents?.data)
            ? mineEvents.data
            : mineEvents?.data?.results ?? [];
        return raw.map(mapApiEventToRegistered);
    }, [mineEvents]);

    const filtered = useMemo(() => allEvents.filter((e) => e.status === tab), [allEvents, tab]);
    const hasEvents = allEvents.length > 0;

    const grouped = useMemo(
        () =>
            filtered.reduce<Record<string, RegisteredEvent[]>>((acc, event) => {
                acc[event.dateLabel] = acc[event.dateLabel] || [];
                acc[event.dateLabel].push(event);
                return acc;
            }, {}),
        [filtered]
    );

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

    // Row/drawer buttons only open the confirmation modal
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

    return (
        <div className="drawer drawer-end">
            <input
                ref={drawerCheckboxRef}
                id="event-drawer-toggle"
                type="checkbox"
                className="drawer-toggle"
            />

            <div className="drawer-content">
                <div className="relative isolate flex w-full min-h-screen flex-col bg-black">
                    {/* Fixed background layer: painted once instead of re-painted while scrolling */}
                    <div
                        aria-hidden
                        className="pointer-events-none fixed inset-0 -z-10"
                        style={{ background: "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)" }}
                    />
                    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                            <h1 className="text-2xl sm:text-3xl font-black text-white">Events</h1>

                            <div className="flex items-center gap-3">
                                <div
                                    className="flex items-center rounded-lg p-1"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(205,220,57,.1)',
                                    }}
                                >
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

                                {hasEvents ? (
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
                                ) : (
                                    <Link
                                        to="/dashboard/events/create"
                                        className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-black transition-transform hover:scale-[1.02]"
                                        style={{ background: '#a6ff00' }}
                                    >
                                        <FiPlus size={14} />
                                        Create Event
                                    </Link>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <EventsTimelineSkeleton groups={2} rowsPerGroup={3} />
                        ) : filtered.length === 0 ? (
                            <EmptyState tab={tab} />
                        ) : (
                            <div className="flex flex-col gap-10">
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
                                                className="absolute left-[-1.25rem] sm:left-[-2rem] top-2 bottom-2 w-px hidden sm:block"
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

export default Events;
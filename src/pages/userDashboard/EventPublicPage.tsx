import React, { useState } from 'react';
import {
    FiCheck,
    FiLoader,
    FiMail,
    FiMapPin,
    FiPhone,
    FiTag,
    FiUser,
    FiUserCheck,
    FiUsers,
    FiX,
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import Button from '../../component/ui/Button';
import { useRegisterEvents } from '../../hooks/mutations/allMutation';
import { useGetEvent } from '../../hooks/queries/allQueriess';
import { type ApiEvent, type Attendee, AvatarStack, GuestsModal } from './Overview';

const pageBg =
    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)';

const cardBg = 'rgba(255,255,255,0.02)';
const fieldClass =
    'w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none';

const formatTicketPrice = (price?: string) => {
    const numeric = parseFloat(price || '0');
    if (!numeric || numeric <= 0) return 'Free';
    const trimmed = numeric % 1 === 0 ? numeric.toString() : numeric.toFixed(2);
    return `$${trimmed}`;
};

const formatTime = (iso: string) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
        return '';
    }
};

// Simple initials avatar since the event payload only carries a host name, not an image
const HostInitials: React.FC<{ name?: string }> = ({ name }) => {
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

const PartyIcon = () => (
    <svg width="72" height="72" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M14 50L26 22L42 38L14 50Z"
            fill="#a6ff00"
            stroke="#a6ff00"
            strokeWidth="2"
            strokeLinejoin="round"
        />
        <path d="M30 18L34 10" stroke="#a6ff00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 14L42 6" stroke="#7ee6c0" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M46 24L54 22" stroke="#ff8fb0" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="22" cy="10" r="2" fill="#7ee6c0" />
        <circle cx="52" cy="34" r="2" fill="#8f8fff" />
        <path
            d="M32 30 L38 28 M35 36 L42 35 M38 42 L44"
            stroke="#a6ff00"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <circle cx="46" cy="12" r="1.6" fill="#ff8fb0" />
    </svg>
);

const PublicEventSkeleton: React.FC = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            <div>
                <div
                    className="w-full aspect-square rounded-2xl animate-pulse"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                />
                <div className="mt-6 space-y-3">
                    <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-px w-full" style={{ background: 'rgba(205,220,57,.1)' }} />
                    <div className="h-9 w-40 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="h-9 w-3/4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-14 w-56 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-14 w-64 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-56 w-full rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
        </div>
    </div>
);

const NotFoundState: React.FC = () => (
    <div className="flex items-center justify-center py-32">
        <div className="text-center">
            <p className="text-white text-base font-bold mb-2">Event not found</p>
            <Link to="/dashboard/overview" className="text-sm" style={{ color: '#a6ff00' }}>
                ← Back to Events
            </Link>
        </div>
    </div>
);

// ─── Registration modal ────────────────────────────────────────────────────
// Two internal steps: 'form' collects Name / Email / WhatsApp, 'success' shows
// a confirmation screen. Modeled after the MentorProducts create-product modal
// (glass card) and the EventCreate success screen (party icon + CTA).
type RegisterStep = 'form' | 'success';

type RegisterDraft = {
    name: string;
    email: string;
    whatsapp: string;
};

const emptyRegisterDraft: RegisterDraft = { name: '', email: '', whatsapp: '' };

const RegisterModal: React.FC<{
    eventId: string;
    eventTitle: string;
    onClose: () => void;
}> = ({ eventId, eventTitle, onClose }) => {
    const [step, setStep] = useState<RegisterStep>('form');
    const [draft, setDraft] = useState<RegisterDraft>(emptyRegisterDraft);
    const [error, setError] = useState('');

    const { mutateAsync: registerForEvent, isPending: isSubmitting } = useRegisterEvents();

    const isValid = !!(
        draft.name.trim() &&
        /\S+@\S+\.\S+/.test(draft.email) &&
        draft.whatsapp.trim().length >= 7
    );

    const handleSubmit = async () => {
        if (!isValid) return;
        setError('');
        try {
            await registerForEvent({
                name: draft.name.trim(),
                email: draft.email.trim(),
                phone_number: draft.whatsapp.trim(),
                event: eventId,
            });
            setStep('success');
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Could not register. Please try again.'
            );
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md overflow-y-auto rounded-2xl p-6 shadow-2xl"
                style={{
                    background: 'rgba(10,13,9,0.55)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {step === 'form' ? (
                    <>
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">Register</h3>
                                <p className="text-xs text-white/40 mt-0.5">{eventTitle}</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:text-white shrink-0"
                                style={{ background: 'rgba(255,255,255,0.06)' }}
                            >
                                <FiX size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white">Name</label>
                                <div className="flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem' }}>
                                    <span className="pl-4 text-white/40">
                                        <FiUser size={15} />
                                    </span>
                                    <input
                                        value={draft.name}
                                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                        placeholder="Your full name"
                                        className={`${fieldClass} bg-transparent`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white">Email</label>
                                <div className="flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem' }}>
                                    <span className="pl-4 text-white/40">
                                        <FiMail size={15} />
                                    </span>
                                    <input
                                        type="email"
                                        value={draft.email}
                                        onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                                        placeholder="you@example.com"
                                        className={`${fieldClass} bg-transparent`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white">WhatsApp Number</label>
                                <div className="flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem' }}>
                                    <span className="pl-4 text-white/40">
                                        <FiPhone size={15} />
                                    </span>
                                    <input
                                        type="tel"
                                        value={draft.whatsapp}
                                        onChange={(e) => setDraft((d) => ({ ...d, whatsapp: e.target.value }))}
                                        placeholder="+1 555 123 4567"
                                        className={`${fieldClass} bg-transparent`}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-xs text-red-400">{error}</p>}
                        </div>

                        <Button
                            variant="green"
                            className="mt-6 w-full"
                            disabled={!isValid || isSubmitting}
                            onClick={() => {
                                void handleSubmit();
                            }}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isSubmitting ? <FiLoader size={15} className="animate-spin" /> : <FiCheck size={15} />}
                                {isSubmitting ? 'Registering...' : 'Confirm Registration'}
                            </span>
                        </Button>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-center py-4">
                        <div className="mb-4 flex items-center justify-center">
                            <PartyIcon />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Congratulations, {draft.name.split(' ')[0]}! 🎉</h3>
                        <p className="text-white/50 text-sm max-w-xs mb-8">
                            You've successfully registered for{' '}
                            <span className="font-semibold text-white">{eventTitle}</span>. Keep an eye on your inbox
                            for updates.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 rounded-lg text-sm font-bold text-black transition-transform hover:scale-[1.005] cursor-pointer"
                            style={{ background: '#a6ff00' }}
                        >
                            Back to Event
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Public Event Page ─────────────────────────────────────────────────────
// Routed at e.g. /events/:id
const EventPublicPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { eventDetail, isLoading, isError, isFetched } = useGetEvent(id);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showGuestsModal, setShowGuestsModal] = useState(false);

    const event: ApiEvent | undefined = eventDetail?.data;
    console.log('Event', event)

    if (isLoading) {
        return (
            <div className="w-full min-h-screen" style={{ background: pageBg }}>
                <PublicEventSkeleton />
            </div>
        );
    }

    if (isError || (isFetched && !event)) {
        return (
            <div className="w-full min-h-screen" style={{ background: pageBg }}>
                <NotFoundState />
            </div>
        );
    }

    if (!event) return null;

    const dateObj = new Date(event.start_date);
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = dateObj.getDate();
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const time = formatTime(event.start_date);
    const ticketLabel = formatTicketPrice(event.ticket_price);

    // Map the raw API attendees into the shared Attendee shape used by
    // AvatarStack / GuestsModal (same components the Overview dashboard uses).
    const attendees: Attendee[] = (event.attendees ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone_number: a.phone_number,
    }));
    const registeredCount = event.attendess_count ?? attendees.length;

    return (
        <div className="w-full min-h-screen" style={{ background: pageBg }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
                    {/* Left column */}
                    <div>
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full aspect-square object-cover rounded-lg"
                            style={{ border: '1px solid rgba(205,220,57,.1)' }}
                        />

                        {/* Hosted By */}
                        <div className="mt-6">
                            <h3 className="text-white font-bold text-sm mb-3">Hosted By</h3>
                            <div
                                className="h-px w-full mb-4"
                                style={{ background: 'rgba(205,220,57,.1)' }}
                            />
                            <div className="flex items-center gap-3">
                                <HostInitials name={event.user.given_name} />
                                <div className='flex flex-col gap-1'>
                                    <span className="text-white font-bold text-base">@{event.user.given_name}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="lg:col-span-2">
                        <h1 className="text-white text-2xl sm:text-3xl font-black mb-6 break-words">
                            {event.title}
                        </h1>

                        {/* Date row */}
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="w-12 rounded-lg overflow-hidden text-center shrink-0"
                                style={{ border: '1px solid rgba(205,220,57,.15)' }}
                            >
                                <div
                                    className="text-[10px] font-bold py-0.5"
                                    style={{ background: 'rgba(166,255,0,0.12)', color: '#a6ff00' }}
                                >
                                    {month}
                                </div>
                                <div className="text-white font-bold text-base py-0.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    {day}
                                </div>
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{weekday}</p>
                                <p className="text-white/50 text-xs">{time}</p>
                            </div>
                        </div>

                        {/* Location row */}
                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                                style={{ border: '1px solid rgba(205,220,57,.15)' }}
                            >
                                <FiMapPin className="text-white/60" size={18} />
                            </div>
                            <p className="text-white font-bold text-sm truncate">
                                {event.location || 'Register to See Address'}
                            </p>
                        </div>

                        {/* Meta badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-8">
                            <span
                                className="inline-flex items-center gap-1 rounded-md font-semibold text-xs px-2.5 py-1.5"
                                style={{
                                    background: ticketLabel === 'Free' ? 'rgba(255,255,255,0.06)' : 'rgba(166,255,0,0.1)',
                                    color: ticketLabel === 'Free' ? 'rgba(255,255,255,0.6)' : '#a6ff00',
                                }}
                            >
                                <FiTag size={13} />
                                {ticketLabel}
                            </span>
                            {event.require_approval && (
                                <span
                                    className="inline-flex items-center gap-1 rounded-md font-semibold text-xs px-2.5 py-1.5"
                                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                                >
                                    <FiUserCheck size={13} />
                                    Approval Required
                                </span>
                            )}
                            <span
                                className="inline-flex items-center gap-1 rounded-md font-semibold text-xs px-2.5 py-1.5"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                            >
                                <FiUsers size={13} />
                                {event.capacity === null || event.capacity === undefined ? 'Unlimited' : `Cap ${event.capacity}`}
                            </span>
                        </div>

                        {/* Attendees */}
                        {attendees.length > 0 ? (
                            <div className="mb-8">
                                <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                                    Attendees · {registeredCount}
                                </h3>
                                <div
                                    className="flex items-center rounded-xl p-4"
                                    style={{ background: cardBg, border: '1px solid rgba(205,220,57,.1)' }}
                                >
                                    <AvatarStack
                                        attendees={attendees}
                                        total={registeredCount}
                                        size={28}
                                        onOpenGuests={() => setShowGuestsModal(true)}
                                    />
                                </div>
                            </div>
                        ) : (
                            registeredCount > 0 && (
                                <div className="flex items-center gap-1.5 text-white/50 text-sm mb-8">
                                    <FiUsers size={14} />
                                    {registeredCount} registered
                                </div>
                            )
                        )}

                        {event.description && (
                            <div className="mb-8">
                                <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">About</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{event.description}</p>
                            </div>
                        )}

                        {/* Registration card */}
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ background: cardBg, border: '1px solid rgba(205,220,57,.1)' }}
                        >
                            <div
                                className="px-6 py-3.5 text-sm font-bold text-white/70"
                                style={{ background: 'rgba(255,255,255,0.04)' }}
                            >
                                Registration
                            </div>
                            <div className="p-6">
                                <p className="text-white text-sm mb-5">
                                    To join this event, please register below.
                                </p>

                                <div className="flex items-center gap-2.5 mb-5">
                                    <HostInitials name={event.user_name} />
                                    <span className="text-white text-sm font-bold">{event.user_name}</span>
                                </div>

                                <Button
                                    variant="white"
                                    className="w-full py-3.5 text-xs"
                                    onClick={() => setShowRegisterModal(true)}
                                >
                                    {ticketLabel === 'Free' ? 'Click to Register' : `RSVP · ${ticketLabel}`}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showRegisterModal && (
                <RegisterModal
                    eventId={event.id}
                    eventTitle={event.title}
                    onClose={() => setShowRegisterModal(false)}
                />
            )}

            {showGuestsModal && (
                <GuestsModal attendees={attendees} onClose={() => setShowGuestsModal(false)} />
            )}
        </div>
    );
};

export default EventPublicPage;
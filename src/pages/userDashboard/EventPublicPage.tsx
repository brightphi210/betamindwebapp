import React, { useState } from 'react';
import {
    FiCheck,
    FiLoader,
    FiMail,
    FiPhone,
    FiShare2,
    FiTag,
    FiUser,
    FiUserCheck,
    FiUsers,
    FiX,
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PoweredByBadge from '../../component/PowereByBadge';
import PublicNavbar from '../../component/PublicNavbar';
import Button from '../../component/ui/Button';
import { usePayEventTicket, useRegisterEvents } from '../../hooks/mutations/allMutation';
import { useGetEvent } from '../../hooks/queries/allQueriess';
import { formatNaira } from '../../utils/currency';
import {
    type ApiEvent,
    type Attendee,
    AvatarStack,
    GuestsModal,
    HostInitials,
    InviteFriendModal,
    LocationIcon,
    ModalShell,
    OnlineBadge,
    formatTime,
    getHostName,
    getIsOnline
} from './EventShared';

const RichText: React.FC<{ html: string }> = ({ html }) => (
    <>
        <div
            className="rich-text-content text-sm text-white/50 leading-relaxed wrap-break-word"
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

const pageBg =
    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)';

const fieldClass =
    'w-full rounded-xl px-4 py-4 text-sm text-white placeholder-white/30 outline-none';

type PublicTicket = {
    id: string;
    name: string;
    price: number;
    description: string;
    image?: string | null;
};

const PartyIcon = () => (
    <svg
        width="72"
        height="72"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M14 50L26 22L42 38L14 50Z"
            fill="#a6ff00"
            stroke="#a6ff00"
            strokeWidth="2"
            strokeLinejoin="round"
        />
        <path
            d="M30 18L34 10"
            stroke="#a6ff00"
            strokeWidth="2.5"
            strokeLinecap="round"
        />
        <path
            d="M40 14L42 6"
            stroke="#7ee6c0"
            strokeWidth="2.5"
            strokeLinecap="round"
        />
        <path
            d="M46 24L54 22"
            stroke="#ff8fb0"
            strokeWidth="2.5"
            strokeLinecap="round"
        />
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 py-10 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            <div>
                <div
                    className="w-full aspect-square rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                />
                <div className="mt-6 space-y-3">
                    <div
                        className="h-4 w-24 rounded"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                    <div
                        className="h-px w-full"
                        style={{ background: 'rgba(205,220,57,.1)' }}
                    />
                    <div
                        className="h-9 w-40 rounded"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div
                    className="h-9 w-3/4 rounded"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                />
                <div
                    className="h-14 w-56 rounded"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                />
                <div
                    className="h-14 w-64 rounded"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                />
                <div
                    className="h-56 w-full rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                />
            </div>
        </div>
    </div>
);

const NotFoundState: React.FC = () => (
    <div className="flex items-center justify-center py-32">
        <div className="text-center">
            <p className="text-white text-base font-bold mb-2">
                Event not found
            </p>
            <Link
                to="/dashboard/overview"
                className="text-sm"
                style={{ color: '#a6ff00' }}
            >
                ← Back to Events
            </Link>
        </div>
    </div>
);

// ─── Registration modal ────────────────────────────────────────────────────
type RegisterStep = 'form' | 'success';

type RegisterDraft = {
    name: string;
    email: string;
    whatsapp: string;
};

const sanitizePhoneInput = (value: string) => value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

const validateRegistrationDraft = (draft: RegisterDraft): string => {
    if (!draft.name.trim()) return 'Full name is required.';
    if (!/\S+@\S+\.\S+/.test(draft.email.trim())) return 'Enter a valid email address.';

    const digits = draft.whatsapp.replace(/\D/g, '');
    if (!digits) return 'Phone number is required.';
    if (digits.length < 10) return 'Phone number must be at least 10 digits.';

    return '';
};

const emptyRegisterDraft: RegisterDraft = {
    name: '',
    email: '',
    whatsapp: '',
};

const RegisterModal: React.FC<{
    eventId: string;
    eventTitle: string;
    selectedTicket: PublicTicket | null;
    onClose: () => void;
}> = ({ eventId, eventTitle, selectedTicket, onClose }) => {
    const [step, setStep] = useState<RegisterStep>('form');
    const [draft, setDraft] = useState<RegisterDraft>(emptyRegisterDraft);
    const [error, setError] = useState('');

    const { mutateAsync: registerForEvent, isPending: isRegistering } =
        useRegisterEvents();
    const { mutateAsync: payEventTicket, isPending: isPaying } =
        usePayEventTicket();

    const validationError = validateRegistrationDraft(draft);
    const isValid = !validationError;

    const handleSubmit = async () => {
        const nextError = validateRegistrationDraft(draft);
        if (nextError) {
            setError(nextError);
            return;
        }
        setError('');

        const ticketPayload = {
            name: draft.name.trim(),
            email: draft.email.trim(),
            phone_number: draft.whatsapp.trim(),
        };

        try {
            const hasPaidTicket = !!selectedTicket && Number(selectedTicket.price) > 0;

            if (hasPaidTicket) {
                const response = await payEventTicket({
                    eventId,
                    data: {
                        ...ticketPayload,
                        ticket: selectedTicket.id,
                    },
                });

                const paymentResponse = response as any;
                const authUrl =
                    paymentResponse?.data?.authorization_url ||
                    paymentResponse?.authorization_url;

                if (authUrl) {
                    toast.success('Payment initiated successfully.');
                    window.location.href = authUrl;
                    return;
                }

                toast.success('Payment initiated successfully.');
                setStep('success');
                return;
            }

            await registerForEvent({
                ...ticketPayload,
                event: eventId,
                // ticket_id: selectedTicket?.id, // uncomment when backend supports it
            });
            setStep('success');
        } catch (err: any) {
            const data = err?.response?.data;
            const message =
                data?.message ||
                data?.detail ||
                data?.error ||
                (Array.isArray(data?.email) ? data.email[0] : undefined) ||
                (Array.isArray(data?.phone_number) ? data.phone_number[0] : undefined) ||
                (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : undefined) ||
                'Could not register. Please try again.';

            setError(Array.isArray(message) ? message[0] : message);
        }
    };

    const priceLabel =
        selectedTicket == null
            ? 'Free'
            : selectedTicket.price === 0
                ? 'Free'
                : formatNaira(selectedTicket.price, 'Free');

    return (
        <ModalShell onClose={onClose} maxWidth="max-w-md" className="overflow-y-auto">
            {(close) =>
                step === 'form' ? (
                    <>
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Register
                                </h3>
                                <p className="text-xs text-white/40 mt-0.5">
                                    {eventTitle}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={close}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:text-white shrink-0"
                                style={{ background: 'rgba(255,255,255,0.06)' }}
                            >
                                <FiX size={16} />
                            </button>
                        </div>

                        {/* Selected ticket summary */}
                        {selectedTicket && (
                            <div
                                className="mb-5 flex items-center gap-3 rounded-lg px-3 py-3"
                                style={{
                                    background: 'rgba(166,255,0,0.06)',
                                }}
                            >
                                {/* Ticket image */}
                                <div
                                    className="w-10 h-10 shrink-0 rounded overflow-hidden"
                                    style={{ background: 'rgba(255,255,255,0.06)' }}
                                >
                                    {selectedTicket.image ? (
                                        <img
                                            src={selectedTicket.image}
                                            alt={selectedTicket.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiTag size={16} className="text-white/25" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">
                                        {selectedTicket.name}
                                    </p>
                                    <p className="text-white/40 text-xs mt-0.5 line-clamp-1">
                                        {selectedTicket.description}
                                    </p>
                                </div>

                                <span
                                    className="text-sm text-white font-bold shrink-0"
                                >
                                    {priceLabel}
                                </span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white">
                                    Name
                                </label>
                                <div
                                    className="flex items-center gap-3 rounded-md"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                    }}
                                >
                                    <span className="pl-4 text-white/40">
                                        <FiUser size={15} />
                                    </span>
                                    <input
                                        value={draft.name}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                name: e.target.value,
                                            }))
                                        }
                                        placeholder="Your full name"
                                        className={`${fieldClass} bg-transparent`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white">
                                    Email
                                </label>
                                <div
                                    className="flex items-center gap-3 rounded-md"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                    }}
                                >
                                    <span className="pl-4 text-white/40">
                                        <FiMail size={15} />
                                    </span>
                                    <input
                                        type="email"
                                        value={draft.email}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                email: e.target.value,
                                            }))
                                        }
                                        placeholder="you@example.com"
                                        className={`${fieldClass} bg-transparent`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white">
                                    WhatsApp Number
                                </label>
                                <div
                                    className="flex items-center gap-3 rounded-md"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                    }}
                                >
                                    <span className="pl-4 text-white/40">
                                        <FiPhone size={15} />
                                    </span>
                                    <input
                                        type="tel"
                                        value={draft.whatsapp}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                whatsapp: sanitizePhoneInput(e.target.value),
                                            }))
                                        }
                                        placeholder="08012345678"
                                        className={`${fieldClass} bg-transparent`}
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-xs text-red-400">{error}</p>
                            )}
                        </div>

                        <Button
                            variant="green"
                            className="mt-6 w-full"
                            disabled={!isValid || isRegistering || isPaying}
                            onClick={() => {
                                void handleSubmit();
                            }}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isRegistering || isPaying ? (
                                    <FiLoader
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <FiCheck size={15} />
                                )}
                                {isRegistering || isPaying
                                    ? (selectedTicket && Number(selectedTicket.price) > 0 ? 'Processing payment...' : 'Registering...')
                                    : selectedTicket && Number(selectedTicket.price) > 0
                                        ? `Pay ${priceLabel} & Register`
                                        : 'Confirm Registration'}
                            </span>
                        </Button>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-center py-4">
                        <div className="mb-4 flex items-center justify-center">
                            <PartyIcon />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">
                            Congratulations, {draft.name.split(' ')[0]}! 🎉
                        </h3>
                        <p className="text-white/50 text-sm max-w-xs mb-8">
                            You've successfully registered for{' '}
                            <span className="font-semibold text-white/80">
                                {eventTitle}
                            </span>
                            {selectedTicket && (
                                <>
                                    {' '}
                                    with the{' '}
                                    <span className="font-semibold text-white/80">
                                        {selectedTicket.name}
                                    </span>{' '}
                                    ticket
                                </>
                            )}
                            . Keep an eye on your inbox for updates.
                        </p>
                        <Link
                            to="/dashboard/overview"
                            onClick={close}
                            className="w-full"
                        >
                            <button className="w-full bg-white px-6 py-3 font-normal rounded-md text-xs text-black transition-transform hover:scale-[1.005] cursor-pointer">
                                Continue Using Betamind
                            </button>
                        </Link>
                    </div>
                )
            }
        </ModalShell>
    );
};

// ─── Public Event Page ─────────────────────────────────────────────────────
const EventPublicPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { eventDetail, isLoading, isError, isFetched } = useGetEvent(id);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showGuestsModal, setShowGuestsModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
        null
    );

    const event: ApiEvent | undefined = eventDetail?.data;
    console.log('Event detail:', eventDetail?.data);

    if (isLoading) {
        return (
            <div className="w-full min-h-screen" style={{ background: pageBg }}>
                <PublicNavbar />
                <PublicEventSkeleton />
                <PoweredByBadge />
            </div>
        );
    }

    if (isError || (isFetched && !event)) {
        return (
            <div className="w-full min-h-screen" style={{ background: pageBg }}>
                <PublicNavbar />
                <NotFoundState />
                <PoweredByBadge />
            </div>
        );
    }

    if (!event) return null;

    const startDateObj = new Date(event.start_date);
    const endDateObj = new Date(event.end_date);
    const sameDay =
        startDateObj.toDateString() === endDateObj.toDateString();

    const month = startDateObj
        .toLocaleDateString('en-US', { month: 'short' })
        .toUpperCase();
    const day = startDateObj.getDate();
    const startWeekday = startDateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
    const endWeekday = endDateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
    const startTime = formatTime(event.start_date);
    const endTime = formatTime(event.end_date);
    const publicUrl =
        typeof window !== 'undefined'
            ? window.location.href
            : `/events/${event.id}`;

    const hostName = getHostName(event);
    const hostAvatar = event.user?.avatar ?? undefined;
    const hostCity = event.user?.city;
    const isOnline = getIsOnline(event);

    const attendees: Attendee[] = (event.attendees ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone_number: a.phone_number,
    }));
    const registeredCount = event.attendess_count ?? attendees.length;

    const apiTickets: PublicTicket[] = Array.isArray(event.tickets) && event.tickets.length > 0
        ? event.tickets.map((t: any) => ({
            id: String(t.id ?? `${t.name}-${Math.random()}`),
            name: t.name || 'Ticket',
            price: Number(t.amount ?? t.price ?? 0) || 0,
            description: t.description || '',
            image: t.image || null,
        }))
        : [];

    const tickets: PublicTicket[] = apiTickets;
    const hasMultipleTickets = tickets.length > 0;
    const selectedTicket =
        tickets.find((t) => t.id === selectedTicketId) ?? null;

    // Auto-select first ticket if only one or none selected yet
    const effectiveSelected =
        selectedTicket ?? (tickets.length === 1 ? tickets[0] : null);

    return (
        <div className="w-full min-h-screen" style={{ background: pageBg }}>
            <PublicNavbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:pt-28 pt-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
                    {/* Left column */}
                    <div>
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full aspect-square object-cover rounded-lg"
                            style={{
                                border: '1px solid rgba(205,220,57,.1)',
                            }}
                        />

                        <div className="mt-6">
                            <h3 className="text-white font-bold text-sm mb-3">
                                Hosted By
                            </h3>
                            <div
                                className="h-px w-full mb-4"
                                style={{
                                    background: 'rgba(205,220,57,.1)',
                                }}
                            />

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3 w-full">
                                    <HostInitials
                                        name={hostName}
                                        avatar={hostAvatar}
                                        size={40}
                                    />
                                    <div className="min-w-0">
                                        <p className="text-white text-sm font-semibold truncate">
                                            {hostName}
                                        </p>
                                        {hostCity && (
                                            <p className="text-white/40 text-xs truncate">
                                                {hostCity}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(true)}
                                    className="flex sm:hidden items-center bg-white text-black justify-center gap-1.5 w-fit px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    <FiShare2 size={13} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-start justify-between gap-3 mb-6">
                            <h1 className="text-white text-2xl sm:text-3xl font-black wrap-break-word">
                                {event.title}
                            </h1>
                            <button
                                type="button"
                                onClick={() => setShowInviteModal(true)}
                                className="hidden sm:flex items-center bg-white text-black gap-1.5 px-3 py-2 rounded-md text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                            >
                                <FiShare2 size={13} />
                                Invite a Friend
                            </button>
                        </div>

                        {/* Date row */}
                        <div className="flex items-start gap-4 mb-4">
                            <div
                                className="w-12 rounded-lg overflow-hidden text-center shrink-0"
                                style={{
                                    border: '1px solid rgba(205,220,57,.15)',
                                }}
                            >
                                <div
                                    className="text-[10px] font-bold py-0.5"
                                    style={{
                                        background: 'rgba(166,255,0,0.12)',
                                        color: '#a6ff00',
                                    }}
                                >
                                    {month}
                                </div>
                                <div
                                    className="text-white font-bold text-base py-0.5"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                    }}
                                >
                                    {day}
                                </div>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs">
                                    {sameDay
                                        ? `${startTime} – ${endTime}`
                                        : `Starts ${startTime}`}
                                </p>
                                <p className="text-white font-bold text-sm">
                                    {startWeekday}
                                </p>
                                {!sameDay && (
                                    <>
                                        <p className="text-white/30 text-[11px] mt-4 uppercase tracking-wide">
                                            Ends
                                        </p>
                                        <p className="text-white font-bold text-sm">
                                            {endWeekday}
                                        </p>
                                        <p className="text-white/50 text-xs">
                                            {endTime}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Location row */}
                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                    border: '1px solid rgba(205,220,57,.15)',
                                }}
                            >
                                <LocationIcon
                                    location={event.location}
                                    size={20}
                                    className="text-white/60"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-white font-bold text-sm truncate">
                                    {event.location ||
                                        'Register to See Address'}
                                </p>
                                <p className="text-white/40 text-xs">
                                    {isOnline
                                        ? 'Online event'
                                        : 'In-person event'}
                                </p>
                            </div>
                        </div>

                        {/* Meta badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-8">
                            <OnlineBadge
                                isOnline={isOnline}
                                className="text-xs px-2.5 py-1.5"
                            />
                            {event.require_approval && (
                                <span
                                    className="inline-flex items-center gap-1 rounded-md font-semibold text-xs px-2.5 py-1.5"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        color: 'rgba(255,255,255,0.6)',
                                    }}
                                >
                                    <FiUserCheck size={13} />
                                    Approval Required
                                </span>
                            )}
                            <span
                                className="inline-flex items-center gap-1 rounded-md font-semibold text-xs px-2.5 py-1.5"
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.6)',
                                }}
                            >
                                <FiUsers size={13} />
                                {event.capacity === null ||
                                    event.capacity === undefined
                                    ? 'Unlimited'
                                    : `Cap ${event.capacity}`}
                            </span>
                        </div>

                        {/* Attendees */}
                        {attendees.length > 0 ? (
                            <div className="mb-8">
                                <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                                    Registrants · {registeredCount}
                                </h3>
                                <div className="flex items-center rounded-xl p-4 bg-white/5">
                                    <AvatarStack
                                        attendees={attendees}
                                        total={registeredCount}
                                        size={28}
                                        onOpenGuests={() =>
                                            setShowGuestsModal(true)
                                        }
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
                            <div className="mb-8 bg-white/5 p-5 rounded-lg">
                                <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">
                                    About
                                </h3>
                                <RichText html={event.description} />
                            </div>
                        )}

                        {/* ─── Ticket Selection ─────────────────────────── */}
                        {hasMultipleTickets && (
                            <div className="mb-8">
                                <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                                    Choose a Ticket
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {tickets.map((ticket) => {
                                        const isSelected =
                                            (selectedTicketId ??
                                                (tickets.length === 1
                                                    ? tickets[0].id
                                                    : null)) === ticket.id;
                                        const priceText =
                                            ticket.price === 0
                                                ? 'Free'
                                                : formatNaira(ticket.price, 'Free');

                                        return (
                                            <button
                                                key={ticket.id}
                                                type="button"
                                                onClick={() => setSelectedTicketId(ticket.id)}
                                                className="w-full text-left rounded-xl p-2 sm:p-2 transition-all cursor-pointer"
                                                style={{
                                                    background: isSelected
                                                        ? 'rgba(166,255,0,0.08)'
                                                        : 'rgba(255,255,255,0.03)',
                                                }}
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    {/* Ticket image */}
                                                    <div
                                                        className="relative w-12 h-12 sm:w-12 sm:h-12 shrink-0 rounded overflow-hidden"
                                                        style={{
                                                            background: 'rgba(255,255,255,0.06)',
                                                        }}
                                                    >
                                                        {ticket.image ? (
                                                            <img
                                                                src={ticket.image}
                                                                alt={ticket.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <FiTag
                                                                    size={18}
                                                                    className="text-white/25"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <p className="text-white text-sm font-semibold truncate">
                                                                    {ticket.name}
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
                                                                    color:
                                                                        ticket.price === 0
                                                                            ? 'rgba(255,255,255,0.5)'
                                                                            : '#a6ff00',
                                                                }}
                                                            >
                                                                {priceText}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Radio indicator */}
                                                    <span
                                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                                        style={{
                                                            border: isSelected
                                                                ? '2px solid #a6ff00'
                                                                : '2px solid rgba(255,255,255,0.25)',
                                                            background: isSelected
                                                                ? '#a6ff00'
                                                                : 'transparent',
                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <span className="h-2 w-2 rounded-full bg-black" />
                                                        )}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Registration CTA */}
                        <div>
                            <p className="text-white/50 text-sm mb-4">
                                {hasMultipleTickets
                                    ? 'Select a ticket above, then register to join this event.'
                                    : 'To join this event, please register below.'}
                            </p>

                            <Button
                                variant="white"
                                className="w-full py-3.5 text-xs"
                                disabled={
                                    hasMultipleTickets && !effectiveSelected
                                }
                                onClick={() => setShowRegisterModal(true)}
                            >
                                {effectiveSelected
                                    ? effectiveSelected.price === 0
                                        ? `Register · ${effectiveSelected.name}`
                                        : `Get ${effectiveSelected.name} · ${formatNaira(effectiveSelected.price, 'Free')}`
                                    : hasMultipleTickets
                                        ? 'Select a ticket to continue'
                                        : 'Click to Register'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {showRegisterModal && (
                <RegisterModal
                    eventId={event.id}
                    eventTitle={event.title}
                    selectedTicket={effectiveSelected}
                    onClose={() => setShowRegisterModal(false)}
                />
            )}

            {showGuestsModal && (
                <GuestsModal
                    attendees={attendees}
                    onClose={() => setShowGuestsModal(false)}
                />
            )}

            {showInviteModal && (
                <InviteFriendModal
                    url={publicUrl}
                    title={event.title}
                    onClose={() => setShowInviteModal(false)}
                />
            )}

            <PoweredByBadge />
        </div>
    );
};

export default EventPublicPage;
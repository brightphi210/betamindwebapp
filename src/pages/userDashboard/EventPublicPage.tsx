import React, { useEffect, useRef, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa6';
import {
    FiLoader,
    FiMail,
    FiMinus,
    FiPhone,
    FiPlus,
    FiShare2,
    FiTag,
    FiUser,
    FiUserCheck,
    FiUsers,
    FiX
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

const EVENT_SUCCESS_URL = 'https://betamindwebapp.vercel.app/event/success';

/** Max tickets one person can buy in a single order */
const MAX_TICKETS_PER_ORDER = 10;

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
    'w-full rounded-xl px-3 py-4 text-sm text-white placeholder-white/30 outline-none';

type PublicTicket = {
    id: string;
    name: string;
    price: number;
    description: string;
    image?: string | null;
};

const formatPrice = (amount: number) =>
    amount === 0 ? 'Free' : formatNaira(amount, 'Free');

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

// ─── Animated image lightbox ───────────────────────────────────────────────
const LIGHTBOX_ANIMATION_MS = 260;

const ImageLightbox: React.FC<{
    src: string;
    alt: string;
    onClose: () => void;
}> = ({ src, alt, onClose }) => {
    const [visible, setVisible] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const handleClose = () => {
        if (closeTimer.current) return;
        setVisible(false);
        closeTimer.current = setTimeout(onClose, LIGHTBOX_ANIMATION_MS);
    };

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', onKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            if (closeTimer.current) clearTimeout(closeTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} full image`}
            className="fixed inset-0 z-120 flex items-center justify-center p-4 sm:p-8"
            onClick={handleClose}
            style={{
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
                opacity: visible ? 1 : 0,
                transition: `opacity ${LIGHTBOX_ANIMATION_MS}ms ease, backdrop-filter ${LIGHTBOX_ANIMATION_MS}ms ease`,
            }}
        >
            <button
                type="button"
                aria-label="Close image preview"
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15 cursor-pointer"
                style={{
                    transform: visible ? 'scale(1)' : 'scale(0.6)',
                    opacity: visible ? 1 : 0,
                    transition: `transform ${LIGHTBOX_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${LIGHTBOX_ANIMATION_MS}ms ease`,
                }}
            >
                <FiX size={18} />
            </button>

            <img
                src={src}
                alt={alt}
                className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
                style={{
                    transform: visible
                        ? 'scale(1) translateY(0)'
                        : 'scale(0.85) translateY(16px)',
                    opacity: visible ? 1 : 0,
                    transition: `transform ${LIGHTBOX_ANIMATION_MS + 60}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${LIGHTBOX_ANIMATION_MS}ms ease`,
                    willChange: 'transform, opacity',
                }}
            />
        </div>
    );
};

// ─── Quantity stepper ──────────────────────────────────────────────────────
const QuantityStepper: React.FC<{
    value: number;
    min?: number;
    max: number;
    onChange: (next: number) => void;
}> = ({ value, min = 1, max, onChange }) => (
    <div
        className="inline-flex items-center rounded-lg"
        style={{ background: 'rgba(255,255,255,0.06)' }}
    >
        <button
            type="button"
            aria-label="Decrease quantity"
            disabled={value <= min}
            onClick={() => onChange(Math.max(min, value - 1))}
            className="flex h-9 w-9 items-center justify-center text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
            <FiMinus size={14} />
        </button>
        <span
            className="min-w-8 text-center text-sm font-bold text-white tabular-nums"
            aria-live="polite"
        >
            {value}
        </span>
        <button
            type="button"
            aria-label="Increase quantity"
            disabled={value >= max}
            onClick={() => onChange(Math.min(max, value + 1))}
            className="flex h-9 w-9 items-center justify-center text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
            <FiPlus size={14} />
        </button>
    </div>
);

// ─── Registration modal ────────────────────────────────────────────────────
type RegisterStep = 'form' | 'confirm' | 'success';

type RegisterDraft = {
    name: string;
    email: string;
    confirmEmail: string;
    whatsapp: string;
    confirmWhatsapp: string;
};

const sanitizePhoneInput = (value: string) => value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

const digitsOnly = (value: string) => value.replace(/\D/g, '');

const emailsMatch = (a: string, b: string) =>
    a.trim().toLowerCase() === b.trim().toLowerCase();

const validateRegistrationDraft = (draft: RegisterDraft): string => {
    if (!draft.name.trim()) return 'Full name is required.';
    if (!/\S+@\S+\.\S+/.test(draft.email.trim())) return 'Enter a valid email address.';
    if (!emailsMatch(draft.email, draft.confirmEmail)) return 'Email addresses do not match.';

    const digits = digitsOnly(draft.whatsapp);
    if (!digits) return 'Phone number is required.';
    if (digits.length < 10) return 'Phone number must be at least 10 digits.';
    if (digits !== digitsOnly(draft.confirmWhatsapp)) return 'Phone numbers do not match.';

    return '';
};

const emptyRegisterDraft: RegisterDraft = {
    name: '',
    email: '',
    confirmEmail: '',
    whatsapp: '',
    confirmWhatsapp: '',
};

const TextField: React.FC<
    React.InputHTMLAttributes<HTMLInputElement> & {
        label: string;
        icon: React.ReactNode;
        hint?: string;
    }
> = ({ label, icon, hint, ...inputProps }) => (
    <div>
        <label className="mb-2 block text-sm font-semibold text-white">
            {label}
        </label>
        <div
            className="flex items-center gap-0 rounded-md"
            style={{ background: 'rgba(255,255,255,0.04)' }}
        >
            <span className="pl-4 text-white pr-0 mr-0">{icon}</span>
            <input {...inputProps} className={`${fieldClass} bg-transparent ml-0`} />
        </div>
        {hint && <p className="mt-1.5 text-xs text-red-400">{hint}</p>}
    </div>
);

const RegisterModal: React.FC<{
    eventId: string;
    eventTitle: string;
    selectedTicket: PublicTicket | null;
    quantity: number;
    onClose: () => void;
}> = ({ eventId, eventTitle, selectedTicket, quantity, onClose }) => {
    const [step, setStep] = useState<RegisterStep>('form');
    const [draft, setDraft] = useState<RegisterDraft>(emptyRegisterDraft);
    const [error, setError] = useState('');

    const { mutateAsync: registerForEvent, isPending: isRegistering } =
        useRegisterEvents();
    const { mutateAsync: payEventTicket, isPending: isPaying } =
        usePayEventTicket();

    const validationError = validateRegistrationDraft(draft);
    const isValid = !validationError;

    const hasPaidTicket = !!selectedTicket && Number(selectedTicket.price) > 0;

    const unitPrice = selectedTicket?.price ?? 0;
    const totalPrice = unitPrice * quantity;
    const unitPriceLabel = formatPrice(unitPrice);
    const totalLabel = formatPrice(totalPrice);

    // Inline mismatch hints (only once the user has typed in the confirm field)
    const emailMismatch =
        draft.confirmEmail.length > 0 &&
        !emailsMatch(draft.email, draft.confirmEmail);
    const phoneMismatch =
        draft.confirmWhatsapp.length > 0 &&
        digitsOnly(draft.whatsapp) !== digitsOnly(draft.confirmWhatsapp);

    /** Validate form → move to confirmation step */
    const handleGoToConfirm = () => {
        const nextError = validateRegistrationDraft(draft);
        if (nextError) {
            setError(nextError);
            return;
        }
        setError('');
        setStep('confirm');
    };

    /** Actually submit after user confirms */
    const handleSubmit = async () => {
        setError('');

        const ticketPayload = {
            name: draft.name.trim(),
            email: draft.email.trim(),
            phone_number: draft.whatsapp.trim(),
        };

        try {
            if (hasPaidTicket && selectedTicket) {
                const response = await payEventTicket({
                    eventId,
                    data: {
                        ...ticketPayload,
                        ticket: selectedTicket.id,
                        // NOTE: make sure the backend accepts `quantity`
                        quantity,
                        // Same pattern as mentor booking – redirect after Paystack
                        callback_url: EVENT_SUCCESS_URL,
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
                quantity, // NOTE: make sure the backend accepts `quantity`
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
            // Stay on confirm so user can retry or go back
        }
    };

    const stickyFooter =
        'max-sm:sticky max-sm:bottom-0 max-sm:-mx-1 max-sm:px-1 max-sm:pt-3 max-sm:pb-3 max-sm:bg-[#0a0d08] max-sm:border-t max-sm:border-white/10';

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
                                        <span className="text-white/50 font-normal">
                                            {' '}× {quantity}
                                        </span>
                                    </p>
                                    <p className="text-white/40 text-xs mt-0.5 line-clamp-1">
                                        {selectedTicket.description}
                                    </p>
                                </div>

                                <span className="text-sm text-white font-bold shrink-0">
                                    {totalLabel}
                                </span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <TextField
                                label="Name"
                                icon={<FiUser size={15} />}
                                value={draft.name}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, name: e.target.value }))
                                }
                                placeholder="Your full name"
                                autoComplete="name"
                            />

                            <TextField
                                label="Email"
                                icon={<FiMail size={15} />}
                                type="email"
                                value={draft.email}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, email: e.target.value }))
                                }
                                placeholder="you@example.com"
                                autoComplete="email"
                            />

                            <TextField
                                label="Confirm Email"
                                icon={<FiMail size={15} />}
                                type="email"
                                value={draft.confirmEmail}
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        confirmEmail: e.target.value,
                                    }))
                                }
                                placeholder="Re-enter your email"
                                autoComplete="off"
                                hint={emailMismatch ? 'Email addresses do not match.' : undefined}
                            />

                            <TextField
                                label="WhatsApp Number"
                                icon={<FiPhone size={15} />}
                                type="tel"
                                value={draft.whatsapp}
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        whatsapp: sanitizePhoneInput(e.target.value),
                                    }))
                                }
                                placeholder="08012345678"
                                autoComplete="tel"
                            />

                            <TextField
                                label="Confirm WhatsApp Number"
                                icon={<FiPhone size={15} />}
                                type="tel"
                                value={draft.confirmWhatsapp}
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        confirmWhatsapp: sanitizePhoneInput(e.target.value),
                                    }))
                                }
                                placeholder="Re-enter your number"
                                autoComplete="off"
                                hint={phoneMismatch ? 'Phone numbers do not match.' : undefined}
                            />

                            {error && !emailMismatch && !phoneMismatch && (
                                <p className="text-xs text-red-400">{error}</p>
                            )}
                        </div>

                        <div className={`mt-6 ${stickyFooter}`}>
                            <Button
                                variant="white"
                                className="w-full"
                                disabled={!isValid}
                                onClick={handleGoToConfirm}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {hasPaidTicket
                                        ? `Review & Pay`
                                        : 'Review Registration'}
                                </span>
                                <FaArrowRight size={15} />
                            </Button>
                        </div>
                    </>
                ) : step === 'confirm' ? (
                    <>
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Confirm registration
                                </h3>
                                <p className="text-xs text-white/40 mt-0.5">
                                    Please review your details before continuing
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

                        {/* Summary card */}
                        <div
                            className="mb-5 rounded-xl p-4 space-y-3"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                            }}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-white/40 text-xs">Event</span>
                                <span className="text-white text-xs font-normal text-right truncate max-w-[70%]">
                                    {eventTitle}
                                </span>
                            </div>
                            {selectedTicket && (
                                <>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-white/40 text-xs">Ticket</span>
                                        <span className="text-white text-xs font-normal">
                                            {selectedTicket.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-white/40 text-xs">Quantity</span>
                                        <span className="text-white text-xs font-normal">
                                            {quantity} × {unitPriceLabel}
                                        </span>
                                    </div>
                                </>
                            )}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-white/40 text-xs">Name</span>
                                <span className="text-white text-xs font-normal truncate max-w-[70%]">
                                    {draft.name.trim()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-white/40 text-xs">Email</span>
                                <span className="text-white text-xs font-normal truncate max-w-[70%]">
                                    {draft.email.trim()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-white/40 text-xs">WhatsApp</span>
                                <span className="text-white text-xs font-normal">
                                    {draft.whatsapp.trim()}
                                </span>
                            </div>
                            <div
                                className="flex items-center justify-between gap-2 pt-2"
                                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <span className="text-white/40 text-xs uppercase tracking-wide font-semibold">
                                    Total
                                </span>
                                <span
                                    className="text-base font-black"
                                    style={{ color: hasPaidTicket ? '#a6ff00' : 'rgba(255,255,255,0.9)' }}
                                >
                                    {totalLabel}
                                </span>
                            </div>
                        </div>

                        {hasPaidTicket && (
                            <p className="text-white/40 text-xs mb-4 leading-relaxed">
                                You will be redirected to a secure payment page. After payment you will return to the success page.
                            </p>
                        )}

                        {error && (
                            <p className="text-xs text-red-400 mb-4">{error}</p>
                        )}

                        <div className={`flex gap-3 ${stickyFooter}`}>
                            <button
                                type="button"
                                onClick={() => {
                                    setError('');
                                    setStep('form');
                                }}
                                disabled={isRegistering || isPaying}
                                className="flex-1 rounded-lg py-3 text-sm font-semibold text-white/80 disabled:opacity-50"
                                style={{ background: 'rgba(255,255,255,0.06)' }}
                            >
                                Back
                            </button>
                            <Button
                                variant="white"
                                className="flex-1"
                                disabled={isRegistering || isPaying}
                                onClick={() => {
                                    void handleSubmit();
                                }}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {isRegistering || isPaying
                                        ? hasPaidTicket
                                            ? 'Processing payment...'
                                            : 'Registering...'
                                        : hasPaidTicket
                                            ? `Pay ${totalLabel}`
                                            : 'Confirm Registration'}
                                    {isRegistering || isPaying ? (
                                        <FiLoader size={14} className="animate-spin" />
                                    ) : (
                                        <FaArrowRight size={14} />
                                    )}
                                </span>
                            </Button>
                        </div>
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
                                    with{' '}
                                    <span className="font-semibold text-white/80">
                                        {quantity} × {selectedTicket.name}
                                    </span>{' '}
                                    {quantity > 1 ? 'tickets' : 'ticket'}
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
        null
    );
    const [quantity, setQuantity] = useState(1);

    const event: ApiEvent | undefined = eventDetail?.data;

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

    const effectiveSelected =
        selectedTicket ?? (tickets.length === 1 ? tickets[0] : null);

    // Quantity limits: per-order cap, further limited by remaining capacity
    const remainingSpots =
        event.capacity === null || event.capacity === undefined
            ? null
            : Math.max(Number(event.capacity) - registeredCount, 0);
    const maxQuantity = Math.max(
        1,
        Math.min(MAX_TICKETS_PER_ORDER, remainingSpots ?? MAX_TICKETS_PER_ORDER)
    );
    const safeQuantity = Math.min(quantity, maxQuantity);

    const handleSelectTicket = (ticketId: string) => {
        if (ticketId !== selectedTicketId) {
            setSelectedTicketId(ticketId);
            setQuantity(1);
        }
    };

    const totalPrice = effectiveSelected
        ? effectiveSelected.price * safeQuantity
        : 0;
    const totalLabel = formatPrice(totalPrice);

    const ctaDisabled = hasMultipleTickets && !effectiveSelected;
    const ctaLabel = effectiveSelected
        ? effectiveSelected.price === 0
            ? `Register · ${effectiveSelected.name}${safeQuantity > 1 ? ` × ${safeQuantity}` : ''}`
            : `Get ${safeQuantity > 1 ? `${safeQuantity} × ` : ''}${effectiveSelected.name} · ${totalLabel}`
        : hasMultipleTickets
            ? 'Select a ticket to continue'
            : 'Click to Register';

    return (
        <div className="w-full min-h-screen" style={{ background: pageBg }}>
            <PublicNavbar />
            {/* Extra bottom padding on mobile so content isn't hidden behind the fixed bar */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 pb-40 lg:pb-28 lg:pt-28 pt-24">
                {selectedImage && (
                    <ImageLightbox
                        src={selectedImage}
                        alt={event.title}
                        onClose={() => setSelectedImage(null)}
                    />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
                    {/* Left column */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setSelectedImage(event.image || null)}
                            className="block w-full cursor-pointer rounded-lg overflow-hidden"
                            aria-label={`Open full image for ${event.title}`}
                        >
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full aspect-square object-cover rounded-lg transition-transform duration-200 hover:scale-[1.01]"
                                style={{
                                    border: '1px solid rgba(205,220,57,.1)',
                                }}
                            />
                        </button>

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

                        {/* Ticket Selection */}
                        {hasMultipleTickets && (
                            <div className="mb-8">
                                <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                                    Choose a Ticket
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {tickets.map((ticket) => {
                                        const isSelected =
                                            effectiveSelected?.id === ticket.id;
                                        const priceText = formatPrice(ticket.price);

                                        return (
                                            <button
                                                key={ticket.id}
                                                type="button"
                                                onClick={() => handleSelectTicket(ticket.id)}
                                                className="w-full text-left rounded-xl p-2 sm:p-2 transition-all cursor-pointer"
                                                style={{
                                                    background: isSelected
                                                        ? 'rgba(166,255,0,0.08)'
                                                        : 'rgba(255,255,255,0.03)',
                                                }}
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4">
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

                                {/* Quantity selector */}
                                {effectiveSelected && (
                                    <div
                                        className="mt-4 flex items-center justify-between gap-3 rounded-xl p-3"
                                        style={{ background: 'rgba(255,255,255,0.03)' }}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-semibold">
                                                Quantity
                                            </p>
                                            <p className="text-white/40 text-xs mt-0.5">
                                                {maxQuantity === 1
                                                    ? 'Only 1 ticket available'
                                                    : `Up to ${maxQuantity} per order`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <QuantityStepper
                                                value={safeQuantity}
                                                max={maxQuantity}
                                                onChange={setQuantity}
                                            />
                                            <span
                                                className="hidden sm:block min-w-20 text-right text-sm font-bold"
                                                style={{
                                                    color:
                                                        totalPrice === 0
                                                            ? 'rgba(255,255,255,0.5)'
                                                            : '#a6ff00',
                                                }}
                                            >
                                                {totalLabel}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Registration CTA – desktop / tablet (inline) */}
                        <div className="hidden lg:block">
                            <p className="text-white/50 text-sm mb-4">
                                {hasMultipleTickets
                                    ? 'Select a ticket above, then register to join this event.'
                                    : 'To join this event, please register below.'}
                            </p>

                            <Button
                                variant="white"
                                className="w-full py-3.5 text-xs"
                                disabled={ctaDisabled}
                                onClick={() => setShowRegisterModal(true)}
                            >
                                {ctaLabel}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration CTA – mobile / tablet (fixed bottom bar) */}
            <div
                className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                style={{
                    background: 'rgba(6,10,4,0.92)',
                    backdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(205,220,57,.15)',
                }}
            >
                <div className="mx-auto flex max-w-5xl items-center gap-3">

                    <Button
                        variant="white"
                        className="flex-1 py-3.5 text-xs"
                        disabled={ctaDisabled}
                        onClick={() => setShowRegisterModal(true)}
                    >
                        {effectiveSelected
                            ? totalPrice === 0
                                ? 'Register'
                                : `Pay ${totalLabel}`
                            : ctaLabel}
                    </Button>
                </div>
            </div>

            {showRegisterModal && (
                <RegisterModal
                    eventId={event.id}
                    eventTitle={event.title}
                    selectedTicket={effectiveSelected}
                    quantity={safeQuantity}
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
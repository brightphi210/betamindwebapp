import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BsMicrosoftTeams } from 'react-icons/bs';
import {
    FiCamera,
    FiClock,
    FiEdit2,
    FiImage,
    FiMapPin,
    FiPlus,
    FiTag,
    FiTrash2,
    FiUserCheck,
    FiUsers
} from 'react-icons/fi';
import { SiGooglemeet, SiZoom } from 'react-icons/si';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import MyButton from '../../component/ui/Button';
import { useCreateEvents } from '../../hooks/mutations/allMutation';
import { useGlobalContext } from '../../providers/GlobalContext';
import { compressImage, formatBytes } from '../../utils/compressimage';
import { formatNaira } from '../../utils/currency';
import {
    canUploadOriginal,
    getErrorMessage,
    getErrorMessages,
    isFileReadable,
    toStableFile,
    validateImageFile,
} from '../../utils/uploadhelpers';

/**
 * Set to true once useCreateEvents is updated to accept
 * `{ data, onUploadProgress }` (see the hook snippet). Until then the
 * submit modal shows a simulated counter that completes when the API responds.
 */
const USE_REAL_UPLOAD_PROGRESS = false;

const cardBg = 'rgba(255,255,255,0.02)';
const cardBorder = '1px solid rgba(255,255,255,0.08)';

/**
 * How tickets are sent to the backend. If tickets don't save, change this
 * value and try again (one of these will match your backend):
 *
 * 'bracket'     -> tickets[0]name, tickets[0].name, tickets[0][name] ... (multipart,
 *                  nested fields, DRF-style). Best for Django REST Framework nested
 *                  serializers, and lets ticket images upload as real files.
 * 'json-string' -> tickets = '[{"name":...}]' (multipart, one JSON string field)
 *                  Works only if the backend JSON-parses that field.
 * 'json-body'   -> whole request as application/json (matches your schema exactly).
 *                  NOTE: the cover image file and ticket images are NOT sent in this
 *                  mode, because JSON can't carry files. Needs useCreateEvents to
 *                  accept a plain object.
 */
type TicketMode = 'bracket' | 'json-string' | 'json-body';
const TICKET_MODE = { mode: 'bracket' as TicketMode };

// ─── Bubble splash background ─────────────────────────────────────────────
const BUBBLE_COLORS = ['#a6ff00', '#7ee6c0', '#ff8fb0', '#8f8fff'];

type Bubble = {
    id: number;
    left: number;
    size: number;
    color: string;
    duration: number;
    delay: number;
    drift: number;
    opacity: number;
};

const BUBBLE_COUNT = 26;

const makeBubbles = (): Bubble[] =>
    Array.from({ length: BUBBLE_COUNT }, (_, id) => ({
        id,
        left: Math.random() * 100,
        size: 6 + Math.random() * 16,
        color: BUBBLE_COLORS[id % BUBBLE_COLORS.length],
        duration: 9 + Math.random() * 10,
        delay: Math.random() * -14,
        drift: Math.random() * 60 - 30,
        opacity: 0.25 + Math.random() * 0.5,
    }));

const BubbleSplash: React.FC<{ bubbles: Bubble[] }> = ({ bubbles }) => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {bubbles.map((b) => (
            <span
                key={b.id}
                className="absolute rounded-full bubble-float"
                style={{
                    left: `${b.left}vw`,
                    bottom: '-10%',
                    width: b.size,
                    height: b.size,
                    background: b.color,
                    opacity: b.opacity,
                    boxShadow: `0 0 ${b.size}px ${b.color}55`,
                    ['--drift' as string]: `${b.drift}px`,
                    animationDuration: `${b.duration}s`,
                    animationDelay: `${b.delay}s`,
                }}
            />
        ))}
        <style>{`
            @keyframes bubbleFloat {
                0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
                10% { opacity: 1; }
                100% { transform: translate(var(--drift), -120vh) scale(1); opacity: 0; }
            }
            .bubble-float {
                animation-name: bubbleFloat;
                animation-timing-function: ease-in;
                animation-iteration-count: infinite;
            }
            @media (prefers-reduced-motion: reduce) {
                .bubble-float { animation: none; opacity: 0.15 !important; }
            }
        `}</style>
    </div>
);

// ─── Proper Toggle Switch ─────────────────────────────────────────────────
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({
    checked,
    onChange,
}) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a6ff00]/40"
        style={{
            background: checked ? '#a6ff00' : 'rgba(255,255,255,0.12)',
            border: checked
                ? '1px solid rgba(166,255,0,0.6)'
                : '1px solid rgba(255,255,255,0.1)',
        }}
    >
        <span
            className="pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-sm transition-transform duration-200 ease-in-out"
            style={{
                background: checked ? '#0a0a0a' : '#ffffff',
                transform: checked ? 'translateX(20px)' : 'translateX(0)',
                boxShadow: checked
                    ? '0 1px 3px rgba(0,0,0,0.35)'
                    : '0 1px 3px rgba(0,0,0,0.2)',
            }}
        />
    </button>
);

// ─── Progress UI ──────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ value: number; className?: string }> = ({
    value,
    className = '',
}) => (
    <div
        className={`h-1.5 w-full overflow-hidden rounded-full ${className}`}
        style={{ background: 'rgba(255,255,255,0.12)' }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
    >
        <div
            className="h-full rounded-full transition-[width] duration-200 ease-out"
            style={{ width: `${value}%`, background: '#a6ff00' }}
        />
    </div>
);

const SubmitProgressModal: React.FC<{
    open: boolean;
    progress: number;
    stage: string;
}> = ({ open, progress, stage }) => {
    if (!open) return null;
    const pct = Math.round(progress);
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-sm bg-black/60"
            role="alertdialog"
            aria-live="polite"
            aria-label="Creating event"
        >
            <div
                className="w-full max-w-sm rounded-xl p-6 sm:p-7 shadow-2xl"
                style={{
                    background: 'rgba(10,12,9,0.98)',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <h3 className="text-white text-lg font-black">
                            {pct >= 100 ? 'Event created' : 'Creating your event'}
                        </h3>
                        <p className="text-white/45 text-xs mt-1">{stage}</p>
                    </div>
                    <span className="text-[#a6ff00] text-3xl font-black tabular-nums">
                        {pct}%
                    </span>
                </div>
                <ProgressBar value={progress} />
                <p className="text-white/30 text-xs mt-3">
                    Please keep this page open until it finishes.
                </p>
            </div>
        </div>
    );
};

// ─── Rich text helpers ────────────────────────────────────────────────────
const getPlainText = (html: string) =>
    (html || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

const eventQuillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['blockquote', 'link'],
        ['clean'],
    ],
};

// ─── Tickets ──────────────────────────────────────────────────────────────
type TicketDraft = {
    id: string;
    name: string;
    price: string;
    description: string;
    imageFile: File | null;
    imagePreview: string | null;
    compressProgress: number | null; // null = not compressing
    imageInfo: string | null;
};

const makeTicketId = () => Math.random().toString(36).slice(2, 10);

const emptyTicket = (): TicketDraft => ({
    id: makeTicketId(),
    name: '',
    price: '',
    description: '',
    imageFile: null,
    imagePreview: null,
    compressProgress: null,
    imageInfo: null,
});

const fieldStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
};

const TicketsEditor: React.FC<{
    tickets: TicketDraft[];
    onChange: React.Dispatch<React.SetStateAction<TicketDraft[]>>;
    onError: (message: string) => void;
}> = ({ tickets, onChange, onError }) => {
    // Functional updates: compression is async, so never rely on a stale `tickets`.
    const updateTicket = (id: string, patch: Partial<TicketDraft>) =>
        onChange((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
        );

    const removeTicket = (id: string) =>
        onChange((prev) => prev.filter((t) => t.id !== id));

    const handleImage = async (
        id: string,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        const problem = validateImageFile(file);
        if (problem) {
            onError(problem);
            input.value = '';
            return;
        }

        updateTicket(id, { compressProgress: 0, imageInfo: null });
        try {
            // Copy into memory first so mobile browsers can't invalidate the file later
            const stable = await toStableFile(file);
            let finalFile: File = stable;
            try {
                const compressed = await compressImage(stable, {
                    maxDimension: 1200,
                    maxSizeMB: 0.5,
                    onProgress: (p) => updateTicket(id, { compressProgress: p }),
                });
                finalFile = await toStableFile(compressed);
            } catch (err) {
                console.error('Ticket image compression failed', err);
                if (!canUploadOriginal(stable)) {
                    onError('Could not process this image format. Please choose a JPG, PNG or WebP photo.');
                    updateTicket(id, { compressProgress: null });
                    return;
                }
                // else: fall back to the in-memory copy of the original
            }
            updateTicket(id, {
                imageFile: finalFile,
                imagePreview: URL.createObjectURL(finalFile),
                compressProgress: null,
                imageInfo: `${formatBytes(file.size)} → ${formatBytes(finalFile.size)}`,
            });
        } catch (err) {
            updateTicket(id, { compressProgress: null });
            onError(getErrorMessage(err));
        } finally {
            input.value = '';
        }
    };

    return (
        <div className="px-4 pb-4 flex flex-col gap-4">
            {tickets.map((t, i) => (
                <div
                    key={t.id}
                    className="rounded-xl overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.01)',
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{
                            background: 'rgba(255,255,255,0.01)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                                style={{
                                    background: 'rgba(166,255,0,0.15)',
                                    color: '#a6ff00',
                                }}
                            >
                                {i + 1}
                            </span>
                            <p className="text-white/60 text-xs font-semibold">
                                {t.name.trim() || `Ticket ${i + 1}`}
                            </p>
                        </div>
                        {tickets.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeTicket(t.id)}
                                className="p-1.5 rounded-md text-white/30 hover:text-red-400 hover:bg-red-400/10 cursor-pointer transition-colors"
                                title="Remove ticket"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        )}
                    </div>

                    {/* Body */}
                    <div className="p-4 flex flex-col gap-3">
                        <div className="flex gap-3">
                            {/* Image upload */}
                            <label
                                className="relative w-[72px] h-[72px] shrink-0 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center group"
                                style={{
                                    ...fieldStyle,
                                    border: '1px dashed rgba(255,255,255,0.18)',
                                }}
                                title="Add ticket image"
                            >
                                {t.compressProgress !== null ? (
                                    <div className="flex w-full flex-col items-center gap-1.5 px-2">
                                        <span className="text-[10px] font-semibold tabular-nums text-[#a6ff00]">
                                            {t.compressProgress}%
                                        </span>
                                        <ProgressBar value={t.compressProgress} />
                                    </div>
                                ) : t.imagePreview ? (
                                    <>
                                        <img
                                            src={t.imagePreview}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <FiCamera size={16} className="text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <span className="flex flex-col items-center gap-1 text-white/30">
                                        <FiImage size={18} />
                                        <span className="text-[10px]">Image</span>
                                    </span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={t.compressProgress !== null}
                                    onChange={(e) => handleImage(t.id, e)}
                                />
                            </label>

                            <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                                <input
                                    value={t.name}
                                    onChange={(e) =>
                                        updateTicket(t.id, { name: e.target.value })
                                    }
                                    placeholder="Ticket name (e.g. Early Bird)"
                                    className="w-full rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#a6ff00]/40 transition-colors"
                                    style={fieldStyle}
                                />
                                <div
                                    className="flex items-center gap-1.5 rounded-lg px-3 py-2.5"
                                    style={fieldStyle}
                                >
                                    <span className="text-white/40 text-sm font-medium">
                                        ₦
                                    </span>
                                    <input
                                        value={t.price}
                                        inputMode="decimal"
                                        onChange={(e) =>
                                            updateTicket(t.id, {
                                                price: e.target.value.replace(
                                                    /[^0-9.]/g,
                                                    ''
                                                ),
                                            })
                                        }
                                        placeholder="0.00"
                                        className="bg-transparent outline-none text-white text-sm placeholder-white/25 flex-1 min-w-0"
                                    />
                                    <span className="text-white/25 text-xs">
                                        {t.price === '0' || t.price === ''
                                            ? 'Free'
                                            : ''}
                                    </span>
                                </div>
                                {t.imageInfo && (
                                    <p className="text-[10px] text-white/30">
                                        Image compressed: {t.imageInfo}
                                    </p>
                                )}
                            </div>
                        </div>

                        <textarea
                            value={t.description}
                            onChange={(e) =>
                                updateTicket(t.id, { description: e.target.value })
                            }
                            placeholder="What's included with this ticket?"
                            rows={2}
                            className="w-full rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none resize-none focus:border-[#a6ff00]/40 transition-colors"
                            style={fieldStyle}
                        />
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={() => onChange([...tickets, emptyTicket()])}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                }}
            >
                <FiPlus size={15} />
                Add another ticket
            </button>
        </div>
    );
};

// ─── Page ────────────────────────────────────────────────────────────────
type Step = 'form' | 'success';
type LocationType = 'offline' | 'online';
type MeetingPlatform = 'google_meet' | 'zoom' | 'teams';

const MIN_DESCRIPTION_LENGTH = 30;
const COMMISSION_RATE = 0.03;

const TicketCommissionModal: React.FC<{
    open: boolean;
    ticketTotal: number;
    commission: number;
    onCancel: () => void;
    onConfirm: () => void;
}> = ({ open, ticketTotal, commission, onCancel, onConfirm }) => {
    const [visible, setVisible] = useState(false);
    const closingRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!open) return;
        // Reset so the modal works again after a previous cancel/confirm
        closingRef.current = false;
        setVisible(false);
        const frame = requestAnimationFrame(() => setVisible(true));
        return () => {
            cancelAnimationFrame(frame);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [open]);

    const closeThen = (action: () => void) => {
        if (closingRef.current) return;
        closingRef.current = true;
        setVisible(false);
        timeoutRef.current = setTimeout(action, 300);
    };

    useEffect(() => {
        if (!open) return;
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeThen(onCancel);
        };
        window.addEventListener('keydown', onEscape);
        return () => window.removeEventListener('keydown', onEscape);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            className={`fixed inset-0 z-[90] flex items-center justify-center px-4 backdrop-blur-sm transition-all duration-300 ease-out ${visible ? 'bg-black/50 opacity-100' : 'bg-black/0 opacity-0'
                }`}
            onClick={() => closeThen(onCancel)}
        >
            <div
                className={`w-full max-w-md rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ease-out ${visible
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 translate-y-4'
                    }`}
                style={{
                    background: 'rgba(10,12,9,0.98)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 sm:p-7">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                        style={{ background: 'rgba(166,255,0,0.12)' }}
                    >
                        <FiTag size={22} className="text-[#a6ff00]" />
                    </div>

                    <h3 className="text-white text-xl sm:text-2xl font-black mb-2">
                        3% platform fee
                    </h3>
                    <p className="text-white/45 text-sm leading-relaxed mb-6">
                        For events with tickets, Betamind takes a{' '}
                        <span className="font-semibold text-[#a6ff00]">3% commission</span>{' '}
                        on each ticket sold.
                    </p>

                    <div className="rounded-xl border border-white/10 bg-white/3 p-4 text-sm text-white/70 mb-6">
                        <div className="flex items-center justify-between gap-3 text-white/60">
                            <span>Ticket total</span>
                            <span className="font-semibold text-white">
                                {formatNaira(ticketTotal, '₦0.00')}
                            </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3 text-white/60">
                            <span>Betamind fee</span>
                            <span className="font-semibold text-[#a6ff00]">
                                {formatNaira(commission, '₦0.00')}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <MyButton variant="white" onClick={() => closeThen(onConfirm)} className="w-full sm:flex-1">
                            <span className="flex items-center justify-center gap-2">
                                Create Event
                            </span>
                        </MyButton>
                        <button
                            type="button"
                            onClick={() => closeThen(onCancel)}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EventCreate: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useGlobalContext();
    const { mutate, isPending } = useCreateEvents();

    const [step, setStep] = useState<Step>('form');
    const bubbles = useMemo(makeBubbles, []);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

    const [eventName, setEventName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('18:30');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('19:30');

    const [locationType, setLocationType] = useState<LocationType>('offline');
    const [location, setLocation] = useState('');
    const [meetingPlatform, setMeetingPlatform] =
        useState<MeetingPlatform>('google_meet');

    const [description, setDescription] = useState('');

    const [hasTickets, setHasTickets] = useState(false);
    const [tickets, setTickets] = useState<TicketDraft[]>([]);
    const [showCommissionModal, setShowCommissionModal] = useState(false);

    const [requireApproval, setRequireApproval] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

    const [editingCapacity, setEditingCapacity] = useState(false);
    const [capacityMode, setCapacityMode] = useState<'unlimited' | 'limited'>(
        'unlimited'
    );
    const [capacity, setCapacity] = useState('');

    // Cover image compression
    const [coverProgress, setCoverProgress] = useState<number | null>(null);
    const [coverInfo, setCoverInfo] = useState<string | null>(null);

    // Submit progress modal
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);
    const [submitStage, setSubmitStage] = useState('Preparing upload…');
    const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const finishRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const stopTrickle = () => {
        if (trickleRef.current) {
            clearInterval(trickleRef.current);
            trickleRef.current = null;
        }
    };

    useEffect(
        () => () => {
            stopTrickle();
            if (finishRef.current) clearTimeout(finishRef.current);
        },
        []
    );

    const stageFor = (p: number) =>
        p < 15
            ? 'Preparing upload…'
            : p < 90
                ? 'Uploading event details and images…'
                : p < 100
                    ? 'Finishing up…'
                    : 'Done!';

    const startSubmitProgress = () => {
        setSubmitProgress(0);
        setSubmitStage('Preparing upload…');
        setShowSubmitModal(true);
        if (USE_REAL_UPLOAD_PROGRESS) return;
        // Simulated: ease toward 90%, jump to 100% when the API responds.
        stopTrickle();
        trickleRef.current = setInterval(() => {
            setSubmitProgress((p) => {
                const next = p + Math.max(0.4, (90 - p) * 0.06);
                const capped = Math.min(next, 90);
                setSubmitStage(stageFor(capped));
                return capped;
            });
        }, 200);
    };

    const handleUploadProgress = (event: { loaded: number; total?: number }) => {
        if (!event.total) return;
        // Cap at 95 so 100 only shows once the server has actually replied.
        const p = Math.min(95, (event.loaded / event.total) * 95);
        setSubmitProgress(p);
        setSubmitStage(stageFor(p));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        const problem = validateImageFile(file);
        if (problem) {
            addToast(problem, 'error');
            input.value = '';
            return;
        }

        setCoverProgress(0);
        setCoverInfo(null);
        try {
            // Copy into memory first so mobile browsers can't invalidate the file later
            const stable = await toStableFile(file);
            let finalFile: File = stable;
            try {
                const compressed = await compressImage(stable, {
                    maxDimension: 1600,
                    maxSizeMB: 1,
                    onProgress: setCoverProgress,
                });
                finalFile = await toStableFile(compressed);
            } catch (err) {
                console.error('Cover compression failed', err);
                if (!canUploadOriginal(stable)) {
                    addToast(
                        'Could not process this image format. Please choose a JPG, PNG or WebP photo.',
                        'error'
                    );
                    return;
                }
                // else: fall back to the in-memory copy of the original
            }
            setCoverImage(URL.createObjectURL(finalFile));
            setCoverImageFile(finalFile);
            setCoverInfo(`${formatBytes(file.size)} → ${formatBytes(finalFile.size)}`);
        } catch (err) {
            addToast(getErrorMessage(err), 'error');
        } finally {
            setCoverProgress(null);
            input.value = '';
        }
    };

    const handleToggleTickets = () => {
        const next = !hasTickets;
        setHasTickets(next);
        if (next && tickets.length === 0) setTickets([emptyTicket()]);
    };

    const toIso = (date: string, time: string) => {
        if (!date) return '';
        const combined = new Date(`${date}T${time || '00:00'}:00`);
        return combined.toISOString();
    };

    const descriptionLength = getPlainText(description).length;

    useEffect(() => {
        setServerErrors({});
    }, [coverImageFile, description, endDate, endTime, eventName, hasTickets, location, locationType, startDate, startTime, tickets]);

    const localErrors = useMemo<Record<string, string[]>>(() => {
        const errors: Record<string, string[]> = {};

        if (!eventName.trim()) {
            errors.title = ['Event name is required.'];
        }

        if (!startDate) {
            errors.start_date = ['Start date is required.'];
        }

        if (!endDate) {
            errors.end_date = ['End date is required.'];
        }

        if (startDate && endDate) {
            const startAt = new Date(`${startDate}T${startTime || '00:00'}:00`);
            const endAt = new Date(`${endDate}T${endTime || '00:00'}:00`);

            if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
                errors.end_date = ['End date must be after start date.'];
            }
        }

        if (locationType === 'offline' && !location.trim()) {
            errors.location = ['Venue address is required for in-person events.'];
        }

        if (!coverImageFile) {
            errors.image = ['Cover image is required.'];
        }

        if (descriptionLength < MIN_DESCRIPTION_LENGTH) {
            errors.description = [`Description must be at least ${MIN_DESCRIPTION_LENGTH} characters.`];
        }

        if (hasTickets) {
            const ticketErrors: string[] = [];

            tickets.forEach((ticket, index) => {
                if (!ticket.name.trim()) {
                    ticketErrors.push(`Ticket ${index + 1} is missing a name.`);
                }

                if (ticket.price === '' || Number(ticket.price) < 0) {
                    ticketErrors.push(`Ticket ${index + 1} needs a valid price.`);
                }
            });

            if (ticketErrors.length > 0) {
                errors.tickets = ticketErrors;
            }
        }

        return errors;
    }, [coverImageFile, descriptionLength, endDate, endTime, eventName, hasTickets, location, locationType, startDate, startTime, tickets]);

    const ticketsValid =
        !hasTickets ||
        (tickets.length > 0 &&
            tickets.every(
                (t) => t.name.trim() && t.price !== '' && Number(t.price) >= 0
            ));

    const totalTicketValue = hasTickets
        ? tickets.reduce((sum, ticket) => sum + Number(ticket.price || 0), 0)
        : 0;
    const commissionEstimate = totalTicketValue * COMMISSION_RATE;

    const allErrors: Record<string, string[]> = {
        ...localErrors,
        ...serverErrors,
    };

    const visibleErrors = Object.entries(allErrors)
        .flatMap(([field, messages]) =>
            messages.map((message) => ({
                field:
                    field === 'title'
                        ? 'Event name'
                        : field === 'start_date'
                            ? 'Start date'
                            : field === 'end_date'
                                ? 'End date'
                                : field === 'location'
                                    ? 'Location'
                                    : field === 'image'
                                        ? 'Cover image'
                                        : field === 'description'
                                            ? 'Description'
                                            : field === 'tickets'
                                                ? 'Tickets'
                                                : field === 'submit'
                                                    ? 'Server'
                                                    : field,
                message,
            }))
        );

    const isCompressing =
        coverProgress !== null ||
        (hasTickets && tickets.some((t) => t.compressProgress !== null));

    const isValid = Object.keys(localErrors).length === 0 && ticketsValid;

    const handleSuccess = (response: unknown) => {
        console.log('Event created successfully:', response);
        stopTrickle();
        setSubmitProgress(100);
        setSubmitStage('Done!');
        // Let the user see 100% before switching screens.
        finishRef.current = setTimeout(() => {
            setShowSubmitModal(false);
            setStep('success');
        }, 600);
    };

    // Shows the backend's own error text, exactly as the server sent it
    // (plus the HTTP status). Network failures (no server reply) get a
    // clear explanation because there is no backend message to show.
    const handleError = (error: any) => {
        stopTrickle();
        setShowSubmitModal(false);
        setSubmitProgress(0);
        console.error('Error creating event:', error?.response?.status, error?.response?.data ?? error);

        const messages = getErrorMessages(error);
        setServerErrors({ submit: messages });
        addToast(messages.join(' • '), 'error');
    };

    const sendEvent = () => {
        // Clean ticket list (only tickets with a name)
        const cleanTickets = hasTickets
            ? tickets
                .filter((t) => t.name.trim())
                .map((t) => ({
                    name: t.name.trim(),
                    amount: String(Number(t.price || 0)),
                    description: t.description.trim(),
                    imageFile: t.imageFile,
                }))
            : [];

        const lowestPrice = cleanTickets.length
            ? Math.min(...cleanTickets.map((t) => Number(t.amount)))
            : 0;

        const locationValue =
            locationType === 'online' ? 'Google Meet' : location.trim();

        // ── JSON body mode (matches the schema exactly, no files) ──────────
        if (TICKET_MODE.mode === 'json-body') {
            const body = {
                title: eventName.trim(),
                description,
                location: locationValue,
                online: locationType === 'online',
                onsite: locationType === 'offline',
                start_date: toIso(startDate, startTime),
                end_date: toIso(endDate, endTime),
                require_approval: requireApproval,
                ticket_price: String(lowestPrice),
                tickets: cleanTickets.map(({ imageFile, ...rest }) => ({
                    ...rest,
                    image: '',
                })),
                ...(capacityMode === 'limited' && capacity
                    ? { capacity: Number(capacity) }
                    : {}),
            };
            startSubmitProgress();
            mutate(
                (USE_REAL_UPLOAD_PROGRESS
                    ? { data: body, onUploadProgress: handleUploadProgress }
                    : body) as any,
                { onSuccess: handleSuccess, onError: handleError }
            );
            return;
        }

        // ── Multipart modes ────────────────────────────────────────────────
        const formData = new FormData();
        formData.append('title', eventName.trim());
        formData.append('description', description);
        formData.append('location', locationValue);
        formData.append('online', String(locationType === 'online'));
        formData.append('onsite', String(locationType === 'offline'));
        formData.append('start_date', toIso(startDate, startTime));
        formData.append('end_date', toIso(endDate, endTime));
        formData.append('require_approval', String(requireApproval));
        formData.append('ticket_price', String(lowestPrice));

        if (cleanTickets.length > 0) {
            if (TICKET_MODE.mode === 'bracket') {
                // DRF parses nested lists from multipart as `tickets[0]name`.
                // We also send the `.name` and `[name]` spellings; backends
                // ignore keys they don't recognise, so this is harmless and
                // covers the common variants.
                // NOTE: ticket images are uploaded once per spelling (3x). Once you
                // know which spelling your backend uses, keep only that one.
                const keyStyles: Array<(i: number, f: string) => string> = [
                    (i, f) => `tickets[${i}]${f}`,
                    (i, f) => `tickets[${i}].${f}`,
                    (i, f) => `tickets[${i}][${f}]`,
                ];
                cleanTickets.forEach((t, i) => {
                    keyStyles.forEach((k) => {
                        formData.append(k(i, 'name'), t.name);
                        formData.append(k(i, 'amount'), t.amount);
                        formData.append(k(i, 'description'), t.description);
                        if (t.imageFile) {
                            formData.append(k(i, 'image'), t.imageFile);
                        }
                    });
                });
            } else {
                // 'json-string'
                formData.append(
                    'tickets',
                    JSON.stringify(
                        cleanTickets.map(({ imageFile, ...rest }) => ({
                            ...rest,
                            image: '',
                        }))
                    )
                );
            }
        }

        if (capacityMode === 'limited' && capacity) {
            formData.append('capacity', capacity);
        }

        if (coverImageFile) formData.append('image', coverImageFile);

        // Debug: see exactly what is being sent
        for (const [key, value] of formData.entries()) {
            console.log('formData >', key, value instanceof File ? `File(${value.name}, ${value.size} bytes, ${value.type})` : value);
        }

        startSubmitProgress();
        mutate(
            (USE_REAL_UPLOAD_PROGRESS
                ? { data: formData, onUploadProgress: handleUploadProgress }
                : formData) as any,
            { onSuccess: handleSuccess, onError: handleError }
        );
    };

    // Wrapper: makes sure every picked image is still readable (mobile browsers
    // can invalidate files), and catches local errors such as an invalid date.
    const submitEvent = async () => {
        try {
            const files = [
                coverImageFile,
                ...(hasTickets ? tickets.map((t) => t.imageFile) : []),
            ].filter(Boolean) as File[];

            for (const f of files) {
                if (!(await isFileReadable(f))) {
                    addToast(
                        'One of your images can no longer be read by the browser. Remove it, pick it again and retry.',
                        'error'
                    );
                    return;
                }
            }
            sendEvent();
        } catch (err) {
            stopTrickle();
            setShowSubmitModal(false);
            addToast(getErrorMessage(err), 'error');
        }
    };

    const handleCreate = () => {
        if (!isValid) return;

        if (hasTickets) {
            setShowCommissionModal(true);
            return;
        }

        submitEvent();
    };

    // ─── Success screen ─────────────────────────────────────────────────
    if (step === 'success') {
        return (
            <div
                className="relative min-h-screen w-full overflow-hidden text-white"
                style={{
                    background:
                        'radial-gradient(ellipse 500px 500px at 50% -100px, rgba(166, 255, 0, 0.10), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.9) 0%, #000000 60%)',
                }}
            >
                <BubbleSplash bubbles={bubbles} />

                <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pt-40 lg:pt-52 flex flex-col items-center text-center">
                    <h1 className="text-xl sm:text-xl font-black text-white mb-3">
                        You're live! 🎉
                    </h1>
                    <p className="text-white/80 font-extrabold text-3xl pt-5">
                        {eventName}
                    </p>
                    <p className="text-white/80 font-normal text-sm pt-2">
                        has been created and is ready to share with the world.
                    </p>

                    <div className="flex flex-row items-center gap-3 w-full max-w-xs pt-3">
                        <button
                            onClick={() => navigate('/dashboard/overview')}
                            className="flex-1 bg-white text-black px-4 py-3 rounded-md text-sm font-semibold w-[50%] transition-colors cursor-pointer"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Form ────────────────────────────────────────────────────────────
    return (
        <div
            className="w-full min-h-screen relative"
            style={{
                background:
                    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
            }}
        >
            <SubmitProgressModal
                open={showSubmitModal}
                progress={submitProgress}
                stage={submitStage}
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left: cover image upload */}
                    <div className="w-full lg:w-[300px] shrink-0">
                        <div
                            className="relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                            style={{ border: cardBorder }}
                            onClick={() => {
                                if (coverProgress === null) fileInputRef.current?.click();
                            }}
                        >
                            {coverImage ? (
                                <img
                                    src={coverImage}
                                    alt="Event cover"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center gap-2"
                                    style={{ background: cardBg }}
                                >
                                    <FiImage size={28} className="text-white/20" />
                                    <p className="text-white/30 text-xs">
                                        Add cover image
                                    </p>
                                </div>
                            )}
                            {coverProgress !== null && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-8 backdrop-blur-sm">
                                    <span className="text-2xl font-black tabular-nums text-[#a6ff00]">
                                        {coverProgress}%
                                    </span>
                                    <ProgressBar value={coverProgress} />
                                    <p className="text-xs text-white/60">
                                        Compressing image…
                                    </p>
                                </div>
                            )}
                            <button
                                type="button"
                                disabled={coverProgress !== null}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow cursor-pointer"
                            >
                                <FiCamera size={15} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                        {coverInfo && coverProgress === null && (
                            <p className="mt-2 text-center text-[11px] text-white/35">
                                Compressed: {coverInfo}
                            </p>
                        )}
                        {coverImage && (
                            <button
                                onClick={() => {
                                    setCoverImage(null);
                                    setCoverImageFile(null);
                                    setCoverInfo(null);
                                    if (fileInputRef.current)
                                        fileInputRef.current.value = '';
                                }}
                                className="mt-3 w-full text-xs text-white/40 hover:text-white/70 cursor-pointer transition-colors"
                            >
                                Remove image
                            </button>
                        )}
                    </div>

                    {/* Right: form */}
                    <div className="flex-1 min-w-0">
                        <input
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="Event Name"
                            className="w-full bg-white/5 p-3 pl-5 rounded-md outline-none text-white placeholder-white/45 text-3xl sm:text-4xl font-black mb-6"
                        />

                        {/* Start / End */}
                        <div className="flex gap-3 mb-4">
                            <div
                                className="flex-1 rounded-xl overflow-hidden"
                                style={{ background: cardBg, border: cardBorder }}
                            >
                                <div
                                    className="flex items-center gap-3 px-4 py-3"
                                    style={{
                                        borderBottom:
                                            '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <span className="w-2 h-2 rounded-full bg-white/40 shrink-0" />
                                    <span className="text-white/50 text-sm w-12 shrink-0">
                                        Start
                                    </span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="bg-transparent outline-none text-white text-sm flex-1 min-w-0"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) =>
                                            setStartTime(e.target.value)
                                        }
                                        className="bg-transparent outline-none text-white text-sm shrink-0"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{
                                            border: '1px solid rgba(255,255,255,0.4)',
                                        }}
                                    />
                                    <span className="text-white/50 text-sm w-12 shrink-0">
                                        End
                                    </span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        className="bg-transparent outline-none text-white text-sm flex-1 min-w-0"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) =>
                                            setEndTime(e.target.value)
                                        }
                                        className="bg-transparent outline-none text-white text-sm shrink-0"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>

                            <div
                                className="hidden sm:flex flex-col justify-center gap-1 rounded-xl px-4 py-3 w-40 shrink-0"
                                style={{ background: cardBg, border: cardBorder }}
                            >
                                <FiClock className="text-white/40" size={16} />
                                <p className="text-white text-sm font-semibold mt-1">
                                    GMT+01:00
                                </p>
                                <p className="text-white/40 text-xs">Lagos</p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="mb-3">
                            <div
                                className="w-full rounded-xl px-4 py-3.5"
                                style={{ background: cardBg, border: cardBorder }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-white/40 shrink-0">
                                        <FiMapPin size={17} />
                                    </span>
                                    <div
                                        className="flex rounded-lg overflow-hidden shrink-0"
                                        style={{
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        {(
                                            ['offline', 'online'] as LocationType[]
                                        ).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() =>
                                                    setLocationType(type)
                                                }
                                                className="px-3.5 py-1.5 text-xs font-semibold capitalize cursor-pointer"
                                                style={{
                                                    background:
                                                        locationType === type
                                                            ? '#a6ff00'
                                                            : 'transparent',
                                                    color:
                                                        locationType === type
                                                            ? '#000'
                                                            : 'rgba(255,255,255,0.5)',
                                                }}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {locationType === 'offline' ? (
                                    <div>
                                        <label className="block text-white/40 text-xs mb-1.5">
                                            Venue address or link
                                        </label>
                                        <input
                                            value={location}
                                            onChange={(e) =>
                                                setLocation(e.target.value)
                                            }
                                            placeholder="e.g. 14 Aba Road, Port Harcourt"
                                            className="w-full rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors focus:border-[#a6ff00]/50"
                                            style={fieldStyle}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-white/30 text-xs mb-2">
                                            Choose a video platform
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMeetingPlatform(
                                                        'google_meet'
                                                    )
                                                }
                                                className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                                            >
                                                <span className="flex items-center gap-2 text-sm text-white/80">
                                                    <SiGooglemeet
                                                        size={16}
                                                        color="#00AC47"
                                                    />
                                                    Google Meet
                                                </span>
                                                {meetingPlatform ===
                                                    'google_meet' && (
                                                        <span className="text-black text-[10px] rounded-full p-2 px-5 bg-white font-semibold">
                                                            Selected
                                                        </span>
                                                    )}
                                            </button>

                                            <button
                                                type="button"
                                                disabled
                                                className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-not-allowed opacity-70"
                                                style={{
                                                    background:
                                                        'rgba(255,255,255,0.03)',
                                                }}
                                            >
                                                <span className="flex items-center gap-2 text-sm text-white/50">
                                                    <SiZoom
                                                        size={16}
                                                        color="#2D8CFF"
                                                    />
                                                    Zoom
                                                </span>
                                                <span className="text-white/30 text-xs">
                                                    Coming soon
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                disabled
                                                className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-not-allowed opacity-70"
                                                style={{
                                                    background:
                                                        'rgba(255,255,255,0.03)',
                                                }}
                                            >
                                                <span className="flex items-center gap-2 text-sm text-white/50">
                                                    <BsMicrosoftTeams
                                                        size={16}
                                                        color="#6264A7"
                                                    />
                                                    Microsoft Teams
                                                </span>
                                                <span className="text-white/30 text-xs">
                                                    Coming soon
                                                </span>
                                            </button>
                                        </div>
                                        <p className="text-white/30 text-xs mt-2">
                                            A Google Meet link will be generated
                                            automatically when the event is
                                            created.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-white/40 text-xs">
                                    Description
                                </label>
                                <span
                                    className="text-xs"
                                    style={{
                                        color:
                                            descriptionLength >=
                                                MIN_DESCRIPTION_LENGTH
                                                ? '#a6ff00'
                                                : 'rgba(255,255,255,0.3)',
                                    }}
                                >
                                    {descriptionLength}/{MIN_DESCRIPTION_LENGTH}{' '}
                                    min
                                </span>
                            </div>
                            <div
                                className="quill-dark-wrapper rounded-xl overflow-hidden"
                                style={{ border: cardBorder }}
                            >
                                <ReactQuill
                                    theme="snow"
                                    value={description}
                                    onChange={setDescription}
                                    modules={eventQuillModules}
                                    placeholder="What's this event about? Share the agenda, what to expect, who it's for, and anything guests should know before they show up."
                                />
                            </div>
                            <p className="text-white/30 text-xs mt-1.5">
                                Write at least {MIN_DESCRIPTION_LENGTH} characters
                                so guests know what to expect.
                            </p>
                        </div>

                        {/* Event Options */}
                        <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-3">
                            Event Options
                        </h3>
                        <div
                            className="rounded-xl overflow-hidden mb-8"
                            style={{ background: cardBg, border: cardBorder }}
                        >
                            {/* Tickets */}
                            <div
                                style={{
                                    borderBottom:
                                        '1px solid rgba(255,255,255,0.06)',
                                }}
                            >
                                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                                    <div className="flex items-center gap-3 text-white/80 text-sm">
                                        <FiTag
                                            size={16}
                                            className="text-white/40"
                                        />
                                        <div>
                                            <p className="font-medium">
                                                Tickets
                                            </p>
                                            <p className="text-white/30 text-xs mt-0.5">
                                                {hasTickets
                                                    ? `${tickets.length} ticket type${tickets.length !== 1 ? 's' : ''}`
                                                    : 'Off — guests attend for free'}
                                            </p>
                                        </div>
                                    </div>
                                    <Toggle
                                        checked={hasTickets}
                                        onChange={handleToggleTickets}
                                    />
                                </div>
                                {hasTickets && (
                                    <TicketsEditor
                                        tickets={tickets}
                                        onChange={setTickets}
                                        onError={(m) => addToast(m, 'error')}
                                    />
                                )}
                            </div>

                            {/* Require approval */}
                            <div
                                className="flex items-center justify-between gap-3 px-4 py-3.5"
                                style={{
                                    borderBottom:
                                        '1px solid rgba(255,255,255,0.06)',
                                }}
                            >
                                <div className="flex items-center gap-3 text-white/80 text-sm">
                                    <FiUserCheck
                                        size={16}
                                        className="text-white/40"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            Require Approval
                                        </p>
                                        <p className="text-white/30 text-xs mt-0.5">
                                            Manually approve each registrant
                                        </p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={requireApproval}
                                    onChange={() =>
                                        setRequireApproval((v) => !v)
                                    }
                                />
                            </div>

                            {/* Capacity */}
                            <div>
                                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                                    <div className="flex items-center gap-3 text-white/80 text-sm">
                                        <FiUsers
                                            size={16}
                                            className="text-white/40"
                                        />
                                        <div>
                                            <p className="font-medium">
                                                Capacity
                                            </p>
                                            <p className="text-white/30 text-xs mt-0.5">
                                                {capacityMode === 'unlimited'
                                                    ? 'Unlimited spots'
                                                    : capacity
                                                        ? `${capacity} spots`
                                                        : 'Set a limit'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingCapacity((v) => !v)
                                        }
                                        className="text-white/40 hover:text-white cursor-pointer p-1.5 rounded-md hover:bg-white/5 transition-colors"
                                    >
                                        <FiEdit2 size={14} />
                                    </button>
                                </div>
                                {editingCapacity && (
                                    <div className="px-4 pb-4 flex items-center gap-3">
                                        <div
                                            className="flex rounded-lg overflow-hidden shrink-0"
                                            style={{
                                                border: '1px solid rgba(255,255,255,0.1)',
                                            }}
                                        >
                                            {(
                                                [
                                                    'unlimited',
                                                    'limited',
                                                ] as const
                                            ).map((mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() =>
                                                        setCapacityMode(mode)
                                                    }
                                                    className="px-3.5 py-1.5 text-xs font-semibold capitalize cursor-pointer"
                                                    style={{
                                                        background:
                                                            capacityMode ===
                                                                mode
                                                                ? '#a6ff00'
                                                                : 'transparent',
                                                        color:
                                                            capacityMode ===
                                                                mode
                                                                ? '#000'
                                                                : 'rgba(255,255,255,0.5)',
                                                    }}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                        {capacityMode === 'limited' && (
                                            <input
                                                value={capacity}
                                                onChange={(e) =>
                                                    setCapacity(
                                                        e.target.value.replace(
                                                            /[^0-9]/g,
                                                            ''
                                                        )
                                                    )
                                                }
                                                placeholder="e.g. 100"
                                                className="rounded-lg px-3 py-1.5 text-sm bg-transparent outline-none text-white flex-1 min-w-0"
                                                style={{
                                                    background:
                                                        'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {hasTickets && (
                            <div className="-mt-5 mb-4 rounded-xl border border-[#a6ff00]/20 bg-[#a6ff00]/6 p-3 text-xs text-white/70">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-semibold text-white">Ticket fee</span>
                                    <span className="text-[#a6ff00]">3% commission</span>
                                </div>
                                <p className="mt-1">
                                    Betamind will take <span className="font-semibold text-[#a6ff00]">{formatNaira(commissionEstimate, '₦0.00')}</span> from ticket sales for this event.
                                </p>
                            </div>
                        )}

                        {visibleErrors.length > 0 && (
                            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-left">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-300">
                                    Please fix the following
                                </p>
                                <ul className="space-y-1.5 text-xs text-red-200/90">
                                    {visibleErrors.map(({ field, message }, index) => (
                                        <li key={`${field}-${index}`} className="flex gap-2">
                                            <span className="mt-0.5 text-red-300">•</span>
                                            <span className="break-words min-w-0">
                                                <span className="font-semibold text-red-100">{field}:</span> {message}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {hasTickets && !ticketsValid && (
                            <p className="text-xs text-red-400/80 -mt-5 mb-4">
                                Every ticket needs a name and a price (use 0 for
                                free).
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={!isValid || isPending || isCompressing}
                            className="w-full px-6 py-3 bg-white rounded-md text-xs font-bold text-black transition-transform hover:scale-[1.005] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isCompressing
                                ? 'Compressing images…'
                                : isPending
                                    ? 'Creating...'
                                    : 'Create Event'}
                        </button>
                    </div>
                </div>
            </div>

            <TicketCommissionModal
                open={showCommissionModal}
                ticketTotal={totalTicketValue}
                commission={commissionEstimate}
                onCancel={() => setShowCommissionModal(false)}
                onConfirm={() => {
                    setShowCommissionModal(false);
                    submitEvent();
                }}
            />

            <style>{`
                .quill-dark-wrapper .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.02);
                    flex-wrap: wrap;
                }
                .quill-dark-wrapper .ql-container.ql-snow {
                    border: none;
                    background: rgba(255,255,255,0.02);
                    font-family: inherit;
                }
                .quill-dark-wrapper .ql-editor {
                    color: #fff;
                    min-height: 160px;
                    font-size: 0.875rem;
                    line-height: 1.6;
                }
                .quill-dark-wrapper .ql-editor.ql-blank::before {
                    color: rgba(255,255,255,0.3);
                    font-style: normal;
                }
                .quill-dark-wrapper .ql-editor blockquote {
                    border-left: 3px solid rgba(166,255,0,0.4);
                    padding-left: 0.75em;
                    color: rgba(255,255,255,0.6);
                }
                .quill-dark-wrapper .ql-snow .ql-stroke { stroke: rgba(255,255,255,0.55); }
                .quill-dark-wrapper .ql-snow .ql-fill { fill: rgba(255,255,255,0.55); }
                .quill-dark-wrapper .ql-snow .ql-picker { color: rgba(255,255,255,0.55); }
                .quill-dark-wrapper .ql-snow .ql-picker-options {
                    background: #171717;
                    border-color: rgba(255,255,255,0.1);
                }
                .quill-dark-wrapper .ql-snow .ql-picker.ql-expanded .ql-picker-label {
                    border-color: rgba(255,255,255,0.15);
                    color: #fff;
                }
                .quill-dark-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke,
                .quill-dark-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke {
                    stroke: #a6ff00;
                }
                .quill-dark-wrapper .ql-snow .ql-tooltip {
                    background: #171717;
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                }
                .quill-dark-wrapper .ql-snow .ql-tooltip input[type="text"] {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: #fff;
                }
                .quill-dark-wrapper .ql-snow .ql-tooltip a.ql-action::after,
                .quill-dark-wrapper .ql-snow .ql-tooltip a.ql-remove::before {
                    color: #a6ff00;
                }
            `}</style>
        </div>
    );
};

export default EventCreate;
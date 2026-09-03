import React, { useMemo, useRef, useState } from 'react';
import {
    FiAlignLeft,
    FiCamera,
    FiChevronDown,
    FiClock,
    FiEdit2,
    FiGlobe,
    FiImage,
    FiMapPin,
    FiTag,
    FiUserCheck,
    FiUsers
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../../component/LoadingOverlay';
import { useCreateEvents } from '../../hooks/mutations/allMutation';
import { useGlobalContext } from '../../providers/GlobalContext';

const cardBg = 'rgba(255,255,255,0.02)';
const cardBorder = '1px solid rgba(255,255,255,0.08)';

// ─── Bubble splash background (matches MentorOnboardingSuccess) ───────────
const BUBBLE_COLORS = ['#a6ff00', '#7ee6c0', '#ff8fb0', '#8f8fff'];

type Bubble = {
    id: number;
    left: number; // vw
    size: number; // px
    color: string;
    duration: number; // s
    delay: number; // s
    drift: number; // px, horizontal sway
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
                0% {
                    transform: translate(0, 0) scale(0.6);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                100% {
                    transform: translate(var(--drift), -120vh) scale(1);
                    opacity: 0;
                }
            }
            .bubble-float {
                animation-name: bubbleFloat;
                animation-timing-function: ease-in;
                animation-iteration-count: infinite;
            }
            @media (prefers-reduced-motion: reduce) {
                .bubble-float {
                    animation: none;
                    opacity: 0.15 !important;
                }
            }
        `}</style>
    </div>
);

// ─── Small building blocks matched to app styling ──────────────────────────
const IconInputRow: React.FC<{
    icon: React.ReactNode;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    subtext?: string;
}> = ({ icon, value, onChange, placeholder, subtext }) => (
    <div
        className="w-full rounded-xl px-4 py-3.5"
        style={{ background: cardBg, border: cardBorder }}
    >
        <div className="flex items-center gap-3">
            <span className="text-white/40 shrink-0">{icon}</span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/30"
            />
        </div>
        {subtext && <p className="text-white/30 text-xs mt-1 ml-7">{subtext}</p>}
    </div>
);

const IconTextAreaRow: React.FC<{
    icon: React.ReactNode;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}> = ({ icon, value, onChange, placeholder }) => (
    <div
        className="w-full rounded-xl px-4 py-3.5"
        style={{ background: cardBg, border: cardBorder }}
    >
        <div className="flex items-start gap-3">
            <span className="text-white/40 shrink-0 mt-0.5">{icon}</span>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/30 resize-none"
            />
        </div>
    </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
        onClick={onChange}
        className="relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer"
        style={{ background: checked ? '#a6ff00' : 'rgba(255,255,255,0.12)' }}
    >
        <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-black transition-transform"
            style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
        />
    </button>
);

// ─── Page ────────────────────────────────────────────────────────────────
type Step = 'form' | 'success';
type TicketMode = 'free' | 'paid';

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
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    const [editingTicket, setEditingTicket] = useState(false);
    const [ticketMode, setTicketMode] = useState<TicketMode>('free');
    const [price, setPrice] = useState('');

    const [requireApproval, setRequireApproval] = useState(false);

    const [editingCapacity, setEditingCapacity] = useState(false);
    const [capacityMode, setCapacityMode] = useState<'unlimited' | 'limited'>('unlimited');
    const [capacity, setCapacity] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(URL.createObjectURL(file));
            setCoverImageFile(file);
        }
    };

    // Combine a date input ("2026-07-21") and a time input ("18:30") into a
    // real Date so we can send a proper ISO string, matching the
    // "2026-07-21T00:38:46.614Z" shape the backend expects.
    const toIso = (date: string, time: string) => {
        if (!date) return '';
        const combined = new Date(`${date}T${time || '00:00'}:00`);
        return combined.toISOString();
    };

    const isValid = !!(eventName.trim() && startDate && endDate && location.trim());

    const handleCreate = () => {
        if (!isValid) return;

        const formData = new FormData();
        formData.append('title', eventName);
        formData.append('description', description);
        formData.append('location', location);
        formData.append('start_date', toIso(startDate, startTime));
        formData.append('end_date', toIso(endDate, endTime));
        formData.append('ticket_price', ticketMode === 'paid' ? (price || '0') : '0');
        formData.append('require_approval', String(requireApproval));

        // Capacity: only send a number when the host explicitly set a limit.
        // Leaving it unset for "unlimited" so the backend applies its own default.
        if (capacityMode === 'limited' && capacity) {
            formData.append('capacity', capacity);
        }

        if (coverImageFile) formData.append('image', coverImageFile);

        mutate(formData, {
            onSuccess: (response) => {
                console.log('Event created successfully:', response);
                setStep('success');
            },
            onError: (error: any) => {
                console.error('Error creating event:', error);
                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    'Something went wrong. Please try again.';
                addToast(message, 'error');
            },
        });
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
                    <h1 className="text-xl sm:text-xl font-black text-white mb-3">You're live! 🎉</h1>
                    <p className="text-white/80 font-extrabold text-3xl pt-5">{eventName}</p>
                    <p className="text-white/80 font-normal text-sm pt-2">has been created and is ready to share with the world.</p>


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
            <LoadingOverlay visible={isPending} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left: cover image upload */}
                    <div className="w-full lg:w-[300px] shrink-0">
                        <div
                            className="relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                            style={{ border: cardBorder }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {coverImage ? (
                                <img src={coverImage} alt="Event cover" className="w-full h-full object-cover" />
                            ) : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center gap-2"
                                    style={{ background: cardBg }}
                                >
                                    <FiImage size={28} className="text-white/20" />
                                    <p className="text-white/30 text-xs">Add cover image</p>
                                </div>
                            )}
                            <button
                                type="button"
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
                        {coverImage && (
                            <button
                                onClick={() => {
                                    setCoverImage(null);
                                    setCoverImageFile(null);
                                }}
                                className="mt-3 w-full text-xs text-white/40 hover:text-white/70 cursor-pointer transition-colors"
                            >
                                Remove image
                            </button>
                        )}
                    </div>

                    {/* Right: form */}
                    <div className="flex-1 min-w-0">
                        {/* Calendar + visibility */}
                        <div className="flex items-center justify-between gap-3 mb-6">
                            <button
                                className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm cursor-pointer"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}
                            >
                                Personal Calendar
                                <FiChevronDown size={14} className="text-white/40" />
                            </button>
                            <button
                                className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm cursor-pointer"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}
                            >
                                <FiGlobe size={14} />
                                Public
                                <FiChevronDown size={14} className="text-white/40" />
                            </button>
                        </div>

                        {/* Event name */}
                        <input
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="Event Name"
                            className="w-full bg-transparent outline-none text-white placeholder-white/25 text-3xl sm:text-4xl font-black mb-6"
                        />

                        {/* Start / End */}
                        <div className="flex gap-3 mb-4">
                            <div
                                className="flex-1 rounded-xl overflow-hidden"
                                style={{ background: cardBg, border: cardBorder }}
                            >
                                <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <span className="w-2 h-2 rounded-full bg-white/40 shrink-0" />
                                    <span className="text-white/50 text-sm w-12 shrink-0">Start</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-transparent outline-none text-white text-sm flex-1 min-w-0"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="bg-transparent outline-none text-white text-sm shrink-0"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ border: '1px solid rgba(255,255,255,0.4)' }}
                                    />
                                    <span className="text-white/50 text-sm w-12 shrink-0">End</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-transparent outline-none text-white text-sm flex-1 min-w-0"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
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
                                <p className="text-white text-sm font-semibold mt-1">GMT+01:00</p>
                                <p className="text-white/40 text-xs">Lagos</p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="mb-3">
                            <IconInputRow
                                icon={<FiMapPin size={17} />}
                                value={location}
                                onChange={setLocation}
                                placeholder="Add Event Location"
                                subtext="Offline location or virtual link"
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <IconTextAreaRow
                                icon={<FiAlignLeft size={17} />}
                                value={description}
                                onChange={setDescription}
                                placeholder="Add Description"
                            />
                        </div>

                        {/* Event Options */}
                        <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-3">Event Options</h3>
                        <div
                            className="rounded-xl overflow-hidden mb-8"
                            style={{ background: cardBg, border: cardBorder }}
                        >
                            {/* Ticket price */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                                    <div className="flex items-center gap-3 text-white/80 text-sm">
                                        <FiTag size={16} className="text-white/40" />
                                        Ticket Price
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/50 text-sm">
                                            {ticketMode === 'free' ? 'Free' : price ? `$${price}` : 'Set price'}
                                        </span>
                                        <button
                                            onClick={() => setEditingTicket((v) => !v)}
                                            className="text-white/40 hover:text-white cursor-pointer"
                                        >
                                            <FiEdit2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                {editingTicket && (
                                    <div className="px-4 pb-4 flex items-center gap-3">
                                        <div
                                            className="flex rounded-lg overflow-hidden shrink-0"
                                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                                        >
                                            {(['free', 'paid'] as TicketMode[]).map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setTicketMode(mode)}
                                                    className="px-3.5 py-1.5 text-xs font-semibold capitalize cursor-pointer"
                                                    style={{
                                                        background: ticketMode === mode ? '#a6ff00' : 'transparent',
                                                        color: ticketMode === mode ? '#000' : 'rgba(255,255,255,0.5)',
                                                    }}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                        {ticketMode === 'paid' && (
                                            <div
                                                className="flex items-center gap-1 rounded-lg px-3 py-1.5 flex-1"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                                            >
                                                <span className="text-white/40 text-sm">$</span>
                                                <input
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                                                    placeholder="0.00"
                                                    className="bg-transparent outline-none text-white text-sm flex-1 min-w-0"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Require approval */}
                            <div
                                className="flex items-center justify-between gap-3 px-4 py-3.5"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <div className="flex items-center gap-3 text-white/80 text-sm">
                                    <FiUserCheck size={16} className="text-white/40" />
                                    Require Approval
                                </div>
                                <Toggle checked={requireApproval} onChange={() => setRequireApproval((v) => !v)} />
                            </div>

                            {/* Capacity */}
                            <div>
                                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                                    <div className="flex items-center gap-3 text-white/80 text-sm">
                                        <FiUsers size={16} className="text-white/40" />
                                        Capacity
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/50 text-sm">
                                            {capacityMode === 'unlimited' ? 'Unlimited' : capacity || 'Set limit'}
                                        </span>
                                        <button
                                            onClick={() => setEditingCapacity((v) => !v)}
                                            className="text-white/40 hover:text-white cursor-pointer"
                                        >
                                            <FiEdit2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                {editingCapacity && (
                                    <div className="px-4 pb-4 flex items-center gap-3">
                                        <div
                                            className="flex rounded-lg overflow-hidden shrink-0"
                                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                                        >
                                            {(['unlimited', 'limited'] as const).map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setCapacityMode(mode)}
                                                    className="px-3.5 py-1.5 text-xs font-semibold capitalize cursor-pointer"
                                                    style={{
                                                        background: capacityMode === mode ? '#a6ff00' : 'transparent',
                                                        color: capacityMode === mode ? '#000' : 'rgba(255,255,255,0.5)',
                                                    }}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                        {capacityMode === 'limited' && (
                                            <input
                                                value={capacity}
                                                onChange={(e) => setCapacity(e.target.value.replace(/[^0-9]/g, ''))}
                                                placeholder="e.g. 100"
                                                className="rounded-lg px-3 py-1.5 text-sm bg-transparent outline-none text-white flex-1 min-w-0"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={!isValid || isPending}
                            className="w-full px-6 py-3 bg-white rounded-md text-xs font-bold text-black transition-transform hover:scale-[1.005] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isPending ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCreate;
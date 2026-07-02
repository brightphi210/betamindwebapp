import React, { useState } from 'react';
import {
    FiAlignLeft,
    FiCalendar,
    FiCheck,
    FiChevronDown,
    FiClock,
    FiCopy,
    FiEdit2,
    FiExternalLink,
    FiGlobe,
    FiMapPin,
    FiShuffle,
    FiTag,
    FiUserCheck,
    FiUsers,
} from 'react-icons/fi';

// ─── Cover art (deterministic "generated" mosaic, shuffle cycles through) ──
const COVER_THEMES: { name: string; palette: string[] }[] = [
    { name: 'Minimal', palette: ['#f0b429', '#8b7ec8', '#f4c9b8', '#3fa796', '#e6584f', '#4fa8c9'] },
    { name: 'Citrus', palette: ['#ffb703', '#fb8500', '#8ecae6', '#219ebc', '#023047', '#ffd166'] },
    { name: 'Botanic', palette: ['#a6ff00', '#2d5a27', '#e8e4d0', '#6b8f71', '#1a2e1a', '#c9d97a'] },
    { name: 'Dusk', palette: ['#f472b6', '#a78bfa', '#facc15', '#5eead4', '#fb923c', '#60a5fa'] },
];

const CoverArt: React.FC<{ palette: string[] }> = ({ palette }) => (
    <svg viewBox="0 0 300 300" className="w-full h-full">
        <rect width="300" height="300" fill="#0c0a06" />
        <rect x="15" y="20" width="55" height="55" fill={palette[0]} />
        <rect x="15" y="85" width="55" height="55" fill={palette[0]} />
        <polygon points="85,20 140,20 112,60" fill={palette[1]} />
        <polygon points="85,80 140,80 112,120" fill={palette[1]} />
        <rect x="155" y="20" width="30" height="115" fill={palette[2]} />
        <rect x="200" y="20" width="30" height="115" fill={palette[2]} />
        <polygon points="15,150 70,150 15,210" fill={palette[3]} />
        <polygon points="15,215 70,215 70,270 15,270" fill={palette[3]} opacity="0.5" />
        <circle cx="150" cy="150" r="40" fill={palette[4]} />
        <path d="M195,110 a40,40 0 0 1 0,80 Z" fill={palette[5]} />
        <path d="M195,110 a40,40 0 0 0 0,80 Z" fill={palette[5]} opacity="0.7" />
        <polygon points="85,150 140,180 85,210" fill={palette[1]} />
        <polygon points="60,215 115,215 87,255" fill={palette[0]} />
        <rect x="130" y="215" width="55" height="55" fill={palette[0]} />
        <path d="M200,215 a27.5,27.5 0 0 1 55,0 Z" fill={palette[3]} />
        <polygon points="235,245 265,245 250,215" fill={palette[1]} />
        <polygon points="250,270 265,245 280,270" fill={palette[4]} />
        <polygon points="220,270 235,245 250,270" fill={palette[4]} opacity="0.6" />
    </svg>
);

// ─── Small building blocks matched to app styling ──────────────────────────
const FieldRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    subtext?: string;
    onClick?: () => void;
}> = ({ icon, label, subtext, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04] cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <span className="text-white/40 shrink-0">{icon}</span>
        <div className="min-w-0">
            <p className="text-white/80 text-sm font-medium">{label}</p>
            {subtext && <p className="text-white/30 text-xs mt-0.5">{subtext}</p>}
        </div>
    </button>
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
    const [step, setStep] = useState<Step>('form');
    const [themeIndex, setThemeIndex] = useState(0);

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

    const [linkCopied, setLinkCopied] = useState(false);

    const theme = COVER_THEMES[themeIndex];
    const eventLink = `betamind.app/e/${eventName ? eventName.toLowerCase().replace(/\s+/g, '-') : 'your-event'}`;

    const handleCreate = () => {
        // TODO: wire up to create-event mutation
        setStep('success');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://${eventLink}`);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    // ─── Success screen ─────────────────────────────────────────────────
    if (step === 'success') {
        return (
            <div
                className="w-full min-h-screen"
                style={{
                    background:
                        'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
                }}
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col items-center text-center">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                        style={{ background: 'rgba(166,255,0,0.12)', border: '1px solid rgba(166,255,0,0.3)' }}
                    >
                        <FiCheck size={28} style={{ color: '#a6ff00' }} />
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">You're live! 🎉</h1>
                    <p className="text-white/40 text-base max-w-md mb-10">
                        {eventName || 'Your event'} has been created and is ready to share with the world.
                    </p>

                    <div
                        className="w-full max-w-lg rounded-xl overflow-hidden mb-8"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <div className="aspect-[2/1] w-full">
                            <CoverArt palette={theme.palette} />
                        </div>
                        <div className="p-5 text-left">
                            <h3 className="text-white font-bold text-lg mb-1">{eventName || 'Event Name'}</h3>
                            <p className="text-white/40 text-sm flex items-center gap-1.5">
                                <FiCalendar size={13} />
                                {startDate || 'Thu, Jul 2'} · {startTime}
                            </p>
                        </div>
                        <div
                            className="flex items-center justify-between gap-3 px-5 py-3"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <span className="text-white/50 text-sm truncate">{eventLink}</span>
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
                                style={{ color: '#a6ff00' }}
                            >
                                <FiCopy size={13} />
                                {linkCopied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg">
                        <button
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-black w-full transition-transform hover:scale-[1.01] cursor-pointer"
                            style={{ background: '#a6ff00' }}
                        >
                            <FiExternalLink size={15} />
                            View Event Page
                        </button>
                        <button
                            className="flex-1 px-6 py-3 rounded-lg text-sm font-semibold w-full transition-colors hover:bg-white/[0.04] cursor-pointer"
                            style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
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
            className="w-full min-h-screen"
            style={{
                background:
                    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
            }}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left: cover art + theme */}
                    <div className="w-full lg:w-[300px] shrink-0">
                        <div
                            className="w-full aspect-square rounded-2xl overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <CoverArt palette={theme.palette} />
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <div
                                className="flex-1 flex items-center justify-between gap-3 rounded-lg px-4 py-2.5"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <div>
                                    <p className="text-white/30 text-[11px]">Theme</p>
                                    <p className="text-white text-sm font-semibold">{theme.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setThemeIndex((i) => (i + 1) % COVER_THEMES.length)}
                                className="p-3 rounded-lg shrink-0 cursor-pointer transition-colors hover:bg-white/[0.06]"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                                title="Shuffle cover"
                            >
                                <FiShuffle size={16} className="text-white/60" />
                            </button>
                        </div>
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
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
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
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <FiClock className="text-white/40" size={16} />
                                <p className="text-white text-sm font-semibold mt-1">GMT+01:00</p>
                                <p className="text-white/40 text-xs">Lagos</p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="mb-3">
                            <FieldRow
                                icon={<FiMapPin size={17} />}
                                label={location || 'Add Event Location'}
                                subtext="Offline location or virtual link"
                                onClick={() => setLocation((v) => v || 'Virtual — link TBD')}
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <FieldRow
                                icon={<FiAlignLeft size={17} />}
                                label={description || 'Add Description'}
                                onClick={() => setDescription((v) => v)}
                            />
                        </div>

                        {/* Event Options */}
                        <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-3">Event Options</h3>
                        <div
                            className="rounded-xl overflow-hidden mb-8"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
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
                            disabled={!eventName.trim()}
                            className="w-full px-6 py-3.5 rounded-xl text-sm font-bold text-black transition-transform hover:scale-[1.005] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            style={{ background: '#a6ff00' }}
                        >
                            Create Event
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCreate;
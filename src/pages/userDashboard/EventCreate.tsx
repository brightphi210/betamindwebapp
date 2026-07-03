import React, { useRef, useState } from 'react';
import {
    FiAlignLeft,
    FiCalendar,
    FiCamera,
    FiCheck,
    FiChevronDown,
    FiClock,
    FiCopy,
    FiEdit2,
    FiExternalLink,
    FiGlobe,
    FiImage,
    FiMapPin,
    FiTag,
    FiUserCheck,
    FiUsers,
} from 'react-icons/fi';

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
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
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
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
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
    const [step, setStep] = useState<Step>('form');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);

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

    const eventLink = `betamind.app/e/${eventName ? eventName.toLowerCase().replace(/\s+/g, '-') : 'your-event'}`;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setCoverImage(URL.createObjectURL(file));
    };

    const handleCreate = () => {
        // TODO: wire up to create-event mutation (send coverImage file, not just the blob URL)
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
                            {coverImage ? (
                                <img src={coverImage} alt={eventName || 'Event cover'} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <FiImage size={28} className="text-white/20" />
                                </div>
                            )}
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
                    {/* Left: cover image upload */}
                    <div className="w-full lg:w-[300px] shrink-0">
                        <div
                            className="relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {coverImage ? (
                                <img src={coverImage} alt="Event cover" className="w-full h-full object-cover" />
                            ) : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center gap-2"
                                    style={{ background: 'rgba(255,255,255,0.02)' }}
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
                                onClick={() => setCoverImage(null)}
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
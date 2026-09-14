import { useState } from "react";
import {
    FiCheck,
    FiClock,
    FiEdit2,
    FiInfo,
    FiPlus,
    FiTrash2,
    FiUser,
    FiUsers,
    FiX
} from "react-icons/fi";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Availability = "weekdays" | "weekends";
type ResponseTime = "immediate" | number;

interface OneOnOneSession {
    id: string;
    type: "one-on-one";
    note: string;
    price: number;
    availability: Availability;
    responseTime: ResponseTime;
    durationMinutes: number;
    daysDuration: number;
    mentorAvatar: string;
}

interface Registrant {
    id: string;
    name: string;
    avatar: string;
}

interface GroupSession {
    id: string;
    type: "group";
    name: string;
    description: string;
    price: number;
    startDate: string;
    endDate: string;
    dailyTime: string;
    image: string;
    capacity: number;
    registrants: Registrant[];
}

// ─────────────────────────────────────────────
// Dummy data
// ─────────────────────────────────────────────
const DUMMY_ONE_ON_ONE: OneOnOneSession = {
    id: "oo1",
    type: "one-on-one",
    note: "Let's review your application strategy, identify the gaps that could weaken your case, and give you a clear action plan.",
    price: 40000,
    availability: "weekdays",
    responseTime: 4,
    durationMinutes: 30,
    daysDuration: 7,
    mentorAvatar: "https://i.pravatar.cc/150?img=68",
};

const DUMMY_GROUPS: GroupSession[] = [
    {
        id: "g1",
        type: "group",
        name: "Product Design Critique Circle",
        description: "Weekly group feedback sessions for mid-level product designers. Bring your latest work and get actionable feedback.",
        price: 15000,
        startDate: "2026-09-22",
        endDate: "2026-11-10",
        dailyTime: "18:00",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&q=80",
        capacity: 12,
        registrants: [
            { id: "r1", name: "Aisha Bello", avatar: "https://i.pravatar.cc/150?img=5" },
            { id: "r2", name: "David Okoro", avatar: "https://i.pravatar.cc/150?img=12" },
            { id: "r3", name: "Fatima Yusuf", avatar: "https://i.pravatar.cc/150?img=9" },
            { id: "r4", name: "Chidi Nwosu", avatar: "https://i.pravatar.cc/150?img=15" },
            { id: "r5", name: "Ngozi Eze", avatar: "https://i.pravatar.cc/150?img=20" },
            { id: "r6", name: "Tunde Ade", avatar: "https://i.pravatar.cc/150?img=33" },
            { id: "r7", name: "Amaka Joy", avatar: "https://i.pravatar.cc/150?img=47" },
        ],
    },
    {
        id: "g2",
        type: "group",
        name: "Frontend Performance Masterclass",
        description: "Deep dives into Core Web Vitals, bundle optimization and real-world case studies.",
        price: 25000,
        startDate: "2026-10-01",
        endDate: "2026-10-29",
        dailyTime: "16:30",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80",
        capacity: 20,
        registrants: [
            { id: "r8", name: "Ibrahim Sule", avatar: "https://i.pravatar.cc/150?img=11" },
            { id: "r9", name: "Blessing Okeke", avatar: "https://i.pravatar.cc/150?img=25" },
            { id: "r10", name: "Emeka Uche", avatar: "https://i.pravatar.cc/150?img=32" },
            { id: "r11", name: "Zainab Musa", avatar: "https://i.pravatar.cc/150?img=44" },
        ],
    },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
};
const formatPrice = (amount: number) => `₦${amount.toLocaleString()}`;

const EmptyState = ({ label, onCreate }: { label: string; onCreate?: () => void }) => (
    <div
        className="flex flex-col items-center justify-center rounded-xl px-4 py-12 text-center"
        style={{ background: cardBg, border: "1px dashed rgba(255,255,255,0.12)" }}
    >
        <p className="mb-4 text-sm text-white/40">{label}</p>
        {onCreate && (
            <button
                type="button"
                onClick={onCreate}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-black"
                style={{ background: "#a6ff00" }}
            >
                <FiPlus size={14} />
                Create session
            </button>
        )}
    </div>
);

/* ── One-on-One Card ── */
const OneOnOneCard = ({
    session,
    onEdit,
    onDelete,
}: {
    session: OneOnOneSession;
    onEdit: () => void;
    onDelete: () => void;
}) => (
    <div className="overflow-hidden rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
        <div className="p-4 sm:p-5">
            <div className="flex gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
                    <img src={session.mentorAvatar} alt="Mentor" className="h-full w-full object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="text-base font-bold text-white sm:text-lg line-clamp-1">BOOK A CALL</h3>
                            <p className="mt-1 text-sm leading-relaxed text-white/55 line-clamp-2">{session.note}</p>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                            <button type="button" onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" style={{ background: "rgba(255,255,255,0.05)" }}>
                                <FiEdit2 size={14} />
                            </button>
                            <button type="button" onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/80 hover:bg-red-500/10 hover:text-red-400" style={{ background: "rgba(255,255,255,0.05)" }}>
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                    <span className="flex items-center gap-1.5 text-white/50">
                        <FiClock size={13} />
                        {session.durationMinutes} mins
                    </span>
                    <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-white text-black"
                    >
                        1-1 Session
                    </span>
                    <span className="text-white/40">· {session.daysDuration} days</span>
                </div>
                <p className="text-base font-bold text-white sm:text-lg">{formatPrice(session.price)}</p>
            </div>
        </div>
    </div>
);

/* ── Group Card (styled like the uploaded image) ── */
const GroupCard = ({
    session,
    onEdit,
    onDelete,
}: {
    session: GroupSession;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const total = session.registrants.length;
    const visibleAvatars = session.registrants.slice(0, 4);
    const remaining = total - visibleAvatars.length;
    const spotsLeft = Math.max(0, session.capacity - total);

    return (
        <div className="overflow-hidden rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
            <div className="p-4 sm:p-5">
                {/* Top row: image + title/description + actions */}
                <div className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md sm:h-20 sm:w-20">
                        <img src={session.image} alt={session.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="text-base font-bold text-white sm:text-lg line-clamp-1">{session.name}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-white/55 line-clamp-2">{session.description}</p>
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                                <button
                                    type="button"
                                    onClick={onEdit}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >
                                    <FiEdit2 size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/80 hover:bg-red-500/10 hover:text-red-400"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meta row */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs w-full">
                        <p className="flex  items-center gap-1.5 text-white/50">
                            <FiClock size={13} />
                            {formatTime(session.dailyTime)}
                        </p>
                        <p className="text-white/40">
                            {formatDate(session.startDate)} – {formatDate(session.endDate)}
                        </p>
                        <p
                            className="rounded px-2  bg-white text-black py-0.5 text-[11px] font-semibold"
                        >
                            Group Session
                        </p>
                    </div>
                </div>

                {/* Registrants + capacity */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {visibleAvatars.map((r) => (
                                <img
                                    key={r.id}
                                    src={r.avatar}
                                    alt={r.name}
                                    title={r.name}
                                    className="h-7 w-7 rounded-full border-2 object-cover"
                                    style={{ borderColor: "rgba(10,13,9,0.95)" }}
                                />
                            ))}
                            {remaining > 0 && (
                                <div
                                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px] font-bold text-white/80"
                                    style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(10,13,9,0.95)" }}
                                >
                                    +{remaining}
                                </div>
                            )}
                        </div>
                        <span className="text-[11px] text-white/40">
                            {total}/{session.capacity} · {spotsLeft > 0 ? `${spotsLeft} left` : "Full"}
                        </span>
                    </div>

                    <p className="text-base font-bold text-white sm:text-lg">{formatPrice(session.price)}</p>

                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Animated Modal (better opacity + smooth transition)
// ─────────────────────────────────────────────
const AnimatedModal = ({
    children,
    onClose,
}: {
    children: React.ReactNode;
    onClose: () => void;
}) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.82)" }}
        onClick={onClose}
    >
        <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl"
            style={{
                background: "rgb(12, 15, 11)",
                border: "1px solid rgba(255,255,255,0.1)",
                animation: "modalIn 0.22s ease-out forwards",
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>

        {/* Keyframes (inject once) */}
        <style>{`
            @keyframes modalIn {
                from {
                    opacity: 0;
                    transform: scale(0.94) translateY(12px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
        `}</style>
    </div>
);

// ─────────────────────────────────────────────
// Forms
// ─────────────────────────────────────────────
const OneOnOneFormModal = ({
    initial,
    onClose,
    onSave,
}: {
    initial?: OneOnOneSession | null;
    onClose: () => void;
    onSave: (data: Omit<OneOnOneSession, "id" | "type" | "daysDuration" | "mentorAvatar">) => void;
}) => {
    const [note, setNote] = useState(initial?.note ?? "");
    const [price, setPrice] = useState(initial?.price?.toString() ?? "");
    const [availability, setAvailability] = useState<Availability>(initial?.availability ?? "weekdays");
    const [responseMode, setResponseMode] = useState<"immediate" | "hours">(
        initial?.responseTime === "immediate" ? "immediate" : "hours"
    );
    const [hours, setHours] = useState(
        typeof initial?.responseTime === "number" ? initial.responseTime.toString() : "2"
    );
    const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes?.toString() ?? "30");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim() || !price || !durationMinutes) return;
        onSave({
            note: note.trim(),
            price: Number(price),
            availability,
            responseTime: responseMode === "immediate" ? "immediate" : Number(hours) || 1,
            durationMinutes: Number(durationMinutes),
        });
    };

    return (
        <AnimatedModal onClose={onClose}>
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                    {initial ? "Edit" : "Create"} 1-1 Session
                </h3>
                <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <FiX size={16} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/70">
                        <FiInfo size={13} /> Note for mentees
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What should mentees know before booking you?"
                        rows={3}
                        required
                        className="w-full resize-none rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/70">
                            Price (₦)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="40000"
                            required
                            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/70">
                            <FiClock size={13} /> Duration
                        </label>
                        <select
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(e.target.value)}
                            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            <option value="15">15 mins</option>
                            <option value="30">30 mins</option>
                            <option value="45">45 mins</option>
                            <option value="60">60 mins</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">Availability</label>
                    <div className="flex gap-2">
                        {(["weekdays", "weekends"] as const).map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setAvailability(opt)}
                                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold capitalize transition-colors ${availability === opt ? "bg-[#a6ff00] text-black" : "text-white/70"}`}
                                style={availability === opt ? undefined : { background: "rgba(255,255,255,0.06)" }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">Response Time</label>
                    <div className="mb-2 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setResponseMode("immediate")}
                            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${responseMode === "immediate" ? "bg-[#a6ff00] text-black" : "text-white/70"}`}
                            style={responseMode === "immediate" ? undefined : { background: "rgba(255,255,255,0.06)" }}
                        >
                            Immediately
                        </button>
                        <button
                            type="button"
                            onClick={() => setResponseMode("hours")}
                            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${responseMode === "hours" ? "bg-[#a6ff00] text-black" : "text-white/70"}`}
                            style={responseMode === "hours" ? undefined : { background: "rgba(255,255,255,0.06)" }}
                        >
                            After X hours
                        </button>
                    </div>
                    {responseMode === "hours" && (
                        <input
                            type="number"
                            min="1"
                            max="72"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                    )}
                </div>

                <p className="text-[11px] text-white/35">Days duration is fixed at 7 days.</p>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white/70" style={{ background: "rgba(255,255,255,0.06)" }}>
                        Cancel
                    </button>
                    <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-black" style={{ background: "#a6ff00" }}>
                        <FiCheck size={14} />
                        {initial ? "Save changes" : "Create session"}
                    </button>
                </div>
            </form>
        </AnimatedModal>
    );
};

const GroupFormModal = ({
    initial,
    onClose,
    onSave,
}: {
    initial?: GroupSession | null;
    onClose: () => void;
    onSave: (data: Omit<GroupSession, "id" | "type" | "registrants">) => void;
}) => {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [price, setPrice] = useState(initial?.price?.toString() ?? "");
    const [startDate, setStartDate] = useState(initial?.startDate ?? "");
    const [endDate, setEndDate] = useState(initial?.endDate ?? "");
    const [dailyTime, setDailyTime] = useState(initial?.dailyTime ?? "14:00");
    const [image, setImage] = useState(initial?.image ?? "");
    const [capacity, setCapacity] = useState(initial?.capacity?.toString() ?? "15");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim() || !price || !startDate || !endDate || !dailyTime || !capacity) return;
        onSave({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            startDate,
            endDate,
            dailyTime,
            image: image.trim() || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&q=80",
            capacity: Number(capacity),
        });
    };

    return (
        <AnimatedModal onClose={onClose}>
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                    {initial ? "Edit" : "Create"} Group Session
                </h3>
                <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <FiX size={16} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">Session Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Product Design Critique Circle"
                        required
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What will participants learn or do?"
                        rows={3}
                        required
                        className="w-full resize-none rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">Session Image URL</label>
                    <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1.5 text-xs font-semibold text-white/70">Price (₦)</label>
                        <input
                            type="number"
                            min="1"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="15000"
                            required
                            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/70">
                            <FiUsers size={13} /> Capacity
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="100"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            placeholder="15"
                            required
                            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-white/70">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-white/70">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/70">
                        <FiClock size={13} /> Daily Time
                    </label>
                    <input
                        type="time"
                        value={dailyTime}
                        onChange={(e) => setDailyTime(e.target.value)}
                        required
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white/70" style={{ background: "rgba(255,255,255,0.06)" }}>
                        Cancel
                    </button>
                    <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-black" style={{ background: "#a6ff00" }}>
                        <FiCheck size={14} />
                        {initial ? "Save changes" : "Create session"}
                    </button>
                </div>
            </form>
        </AnimatedModal>
    );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const MentorSessions = () => {
    const [oneOnOne, setOneOnOne] = useState<OneOnOneSession | null>(DUMMY_ONE_ON_ONE);
    const [groups, setGroups] = useState<GroupSession[]>(DUMMY_GROUPS);

    const [showOneOnOneForm, setShowOneOnOneForm] = useState(false);
    const [editingOneOnOne, setEditingOneOnOne] = useState<OneOnOneSession | null>(null);

    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupSession | null>(null);

    const canCreateOneOnOne = !oneOnOne;
    const canCreateGroup = groups.length < 3;

    const handleSaveOneOnOne = (data: Omit<OneOnOneSession, "id" | "type" | "daysDuration" | "mentorAvatar">) => {
        if (editingOneOnOne) {
            setOneOnOne({ ...editingOneOnOne, ...data });
        } else {
            setOneOnOne({
                id: `oo-${Date.now()}`,
                type: "one-on-one",
                daysDuration: 7,
                mentorAvatar: "https://i.pravatar.cc/150?img=68",
                ...data,
            });
        }
        setShowOneOnOneForm(false);
        setEditingOneOnOne(null);
    };

    const handleSaveGroup = (data: Omit<GroupSession, "id" | "type" | "registrants">) => {
        if (editingGroup) {
            setGroups((prev) => prev.map((g) => (g.id === editingGroup.id ? { ...g, ...data } : g)));
        } else {
            setGroups((prev) => [
                ...prev,
                { id: `g-${Date.now()}`, type: "group", registrants: [], ...data },
            ]);
        }
        setShowGroupForm(false);
        setEditingGroup(null);
    };

    const handleDeleteOneOnOne = () => {
        if (window.confirm("Delete your 1-1 session?")) setOneOnOne(null);
    };

    const handleDeleteGroup = (id: string) => {
        if (window.confirm("Delete this Group session?")) {
            setGroups((prev) => prev.filter((g) => g.id !== id));
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-white sm:text-2xl">My Sessions</h2>
                <p className="text-sm text-white/40">
                    Create & manage your 1-1 and Group mentoring sessions.
                </p>
            </div>

            {/* One-on-One */}
            <section className="mb-10">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white/80">
                        <FiUser size={15} className="text-[#a6ff00]" />
                        1-1 Session
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white/50" style={{ background: "rgba(255,255,255,0.06)" }}>
                            {oneOnOne ? "1 / 1" : "0 / 1"}
                        </span>
                    </h3>
                    {canCreateOneOnOne && (
                        <button
                            type="button"
                            onClick={() => { setEditingOneOnOne(null); setShowOneOnOneForm(true); }}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-black"
                            style={{ background: "#a6ff00" }}
                        >
                            <FiPlus size={13} /> Create
                        </button>
                    )}
                </div>

                {oneOnOne ? (
                    <OneOnOneCard
                        session={oneOnOne}
                        onEdit={() => { setEditingOneOnOne(oneOnOne); setShowOneOnOneForm(true); }}
                        onDelete={handleDeleteOneOnOne}
                    />
                ) : (
                    <EmptyState
                        label="You haven't created a One-on-One session yet. Mentors can only have one."
                        onCreate={() => { setEditingOneOnOne(null); setShowOneOnOneForm(true); }}
                    />
                )}
            </section>

            {/* Group Sessions */}
            <section>
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white/80">
                        <FiUsers size={15} className="text-[#a6ff00]" />
                        Group Sessions
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white/50" style={{ background: "rgba(255,255,255,0.06)" }}>
                            {groups.length} / 3
                        </span>
                    </h3>
                    {canCreateGroup && (
                        <button
                            type="button"
                            onClick={() => { setEditingGroup(null); setShowGroupForm(true); }}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-black"
                            style={{ background: "#a6ff00" }}
                        >
                            <FiPlus size={13} /> Create
                        </button>
                    )}
                </div>

                {groups.length === 0 ? (
                    <EmptyState
                        label="No group sessions yet. You can create up to 3."
                        onCreate={() => { setEditingGroup(null); setShowGroupForm(true); }}
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {groups.map((g) => (
                            <GroupCard
                                key={g.id}
                                session={g}
                                onEdit={() => { setEditingGroup(g); setShowGroupForm(true); }}
                                onDelete={() => handleDeleteGroup(g.id)}
                            />
                        ))}
                    </div>
                )}

                {!canCreateGroup && groups.length > 0 && (
                    <p className="mt-3 text-center text-xs text-white/30">
                        Maximum of 3 group sessions reached.
                    </p>
                )}
            </section>

            {/* Modals */}
            {showOneOnOneForm && (
                <OneOnOneFormModal
                    initial={editingOneOnOne}
                    onClose={() => { setShowOneOnOneForm(false); setEditingOneOnOne(null); }}
                    onSave={handleSaveOneOnOne}
                />
            )}
            {showGroupForm && (
                <GroupFormModal
                    initial={editingGroup}
                    onClose={() => { setShowGroupForm(false); setEditingGroup(null); }}
                    onSave={handleSaveGroup}
                />
            )}
        </div>
    );
};

export default MentorSessions;
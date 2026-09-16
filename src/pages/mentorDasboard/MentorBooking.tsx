import { useEffect, useState } from "react";
import {
    FiCalendar,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiEdit2,
    FiExternalLink,
    FiInfo,
    FiLink,
    FiLock,
    FiMessageSquare,
    FiPlus,
    FiTrash2,
    FiUser,
    FiUsers,
    FiVideo,
    FiX
} from "react-icons/fi";
import LoadingOverlay from "../../component/LoadingOverlay";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import {
    useCreateGroupSession,
    useCreateIndividualSession,
    useDeleteGroupSession,
    useDeleteIndividualSession,
    useEditGroupSession,
    useEditIndividualSession,
} from "../../hooks/mutations/allMutation";
import { useGetMentorGroupSessions, useGetMentorIndividualSession, useGetMyUserProfile } from "../../hooks/queries/allQueriess";
import { useGlobalContext } from "../../providers/GlobalContext";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Availability = "weekdays" | "weekends";
type ResponseTime = "immediate" | number;
type BookingStatus = "pending_confirmation" | "confirmed";

interface Booking {
    id: string;
    menteeName: string;
    menteeAvatar: string;
    meetingLink: string;
    status: BookingStatus;
    bookedFor: string; // display date/time string
}

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
    meetingLink: string;
    booking: Booking | null;
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
    spotsLeft: number;
    status: string;
    meetingLink: string;
    registrants: Registrant[];
}

type GroupSessionFormValues = {
    name: string;
    description: string;
    price: number;
    startDate: string;
    endDate: string;
    dailyTime: string;
    image: string;
    capacity: number;
    imageFile?: File | null;
    spotsLeft?: number;
    status?: string;
    meetingLink?: string;
};

// ─────────────────────────────────────────────
// API shape (matches the /individual-sessions payload you shared)
// ─────────────────────────────────────────────
interface IndividualSessionApiResponse {
    id: number;
    mentor: string;
    mentor_name: string;
    mentee: string | null;
    mentee_name: string | null;
    duration_days: number;
    duration_minutes: number;
    price: string;
    response_time: "immediate" | number | string;
    status: "pending" | "confirmed" | "cancelled" | string;
    availability: Availability;
    meeting_link: string;
    notes: string;
    created_at: string;
    updated_at: string;
}

/**
 * The backend seems to return either a single object or a list (a mentor can
 * only ever have one individual session, so we defensively unwrap a list too).
 */
const unwrapIndividualSession = (
    raw: IndividualSessionApiResponse | IndividualSessionApiResponse[] | null | undefined
): IndividualSessionApiResponse | null => {
    if (!raw) return null;
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw;
};

const mapApiSessionToLocal = (
    api: IndividualSessionApiResponse,
    mentorAvatar = `https://i.pravatar.cc/150?u=${api.mentor}`
): OneOnOneSession => {
    const parsedPrice = Number(api.price);

    const booking: Booking | null = api.mentee
        ? {
            id: String(api.id),
            menteeName: api.mentee_name ?? "Mentee",
            menteeAvatar: `https://i.pravatar.cc/150?u=${api.mentee}`,
            meetingLink: api.meeting_link ?? "",
            status: api.status === "confirmed" ? "confirmed" : "pending_confirmation",
            bookedFor: new Date(api.created_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            }),
        }
        : null;

    return {
        id: String(api.id),
        type: "one-on-one",
        note: api.notes ?? "",
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        availability: api.availability,
        responseTime: api.response_time === "immediate" ? "immediate" : Number(api.response_time) || 1,
        durationMinutes: api.duration_minutes,
        daysDuration: api.duration_days,
        mentorAvatar: mentorAvatar || `https://i.pravatar.cc/150?u=${api.mentor}`,
        meetingLink: api.meeting_link ?? "",
        booking,
    };
};

const mapLocalToCreatePayload = (
    data: Omit<OneOnOneSession, "id" | "type" | "mentorAvatar" | "booking">
) => ({
    duration_days: data.daysDuration,
    duration_minutes: data.durationMinutes,
    price: data.price.toString(),
    response_time: data.responseTime,
    availability: data.availability,
    meeting_link: data.meetingLink,
    notes: data.note,
});

const mapApiGroupSessionToLocal = (api: any): GroupSession => {
    const rawDailyTime = api.daily_time ?? api.time ?? "14:00";
    const normalizedDailyTime = typeof rawDailyTime === "string"
        ? rawDailyTime.includes("T")
            ? rawDailyTime.split("T")[1]?.slice(0, 5) ?? rawDailyTime
            : rawDailyTime.slice(0, 5)
        : "14:00";

    const capacity = Number(api.max_participants ?? api.capacity ?? 0);
    const spotsLeft = Number(api.spots_left ?? Math.max(0, capacity));

    return {
        id: String(api.id ?? `g-${Date.now()}`),
        type: "group",
        name: api.name ?? "Group Session",
        description: api.description ?? "",
        price: Number(api.price_per_participant ?? api.price ?? 0),
        startDate: api.start_date ? String(api.start_date).split("T")[0] : "",
        endDate: api.end_date ? String(api.end_date).split("T")[0] : "",
        dailyTime: normalizedDailyTime,
        image: api.banner || api.image || api.cover_image || "",
        capacity,
        spotsLeft,
        status: api.status ?? "pending",
        meetingLink: api.meeting_link ?? "",
        registrants: Array.isArray(api.registrants)
            ? api.registrants.map((r: any) => ({
                id: String(r.id ?? `${api.id ?? "reg"}-${Math.random()}`),
                name: r.name ?? "Participant",
                avatar: r.avatar || r.image || `https://i.pravatar.cc/150?u=${r.id ?? Math.random()}`,
            }))
            : [],
    };
};

const flattenApiErrors = (data: unknown): string => {
    if (!data) return "Something went wrong. Please try again.";
    if (typeof data === "string") return data;

    if (Array.isArray(data)) {
        return data.map((item) => flattenApiErrors(item)).filter(Boolean).join(" \n ");
    }

    if (typeof data === "object") {
        const entries = Object.entries(data as Record<string, unknown>);
        const messages = entries.flatMap(([key, value]) => {
            if (key === "non_field_errors") return flattenApiErrors(value).split("\n").filter(Boolean);
            if (Array.isArray(value)) return flattenApiErrors(value).split("\n").filter(Boolean);
            if (typeof value === "object" && value !== null) {
                return flattenApiErrors(value).split("\n").filter(Boolean);
            }
            return typeof value === "string" ? [value] : [];
        });

        if (messages.length > 0) return messages.join(" \n ");
        return JSON.stringify(data);
    }

    return String(data);
};

const SUGGESTED_NOTES = [
    "Great session! Mentee is making good progress toward their goals.",
    "Covered the key concepts today — mentee should practice before the next call.",
    "Productive discussion on career direction and next steps.",
    "Mentee came prepared with clear questions; gave actionable feedback.",
    "Follow-up needed on action items discussed during the call.",
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

const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h} hr${h > 1 ? "s" : ""}` : `${h}h ${m}m`;
};

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

/* ── Booking status button for 1-1 card ── */
const BookingStatusButton = ({
    booking,
    onConfirm,
    onJoin,
    onSimulateBooking,
}: {
    booking: Booking | null;
    onConfirm: () => void;
    onJoin: () => void;
    onSimulateBooking: () => void;
}) => {
    if (!booking) {
        return (
            <div className="flex flex-col items-end gap-1">
                <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold text-white/35"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                    <FiLock size={12} />
                    Not Booked Yet
                </button>
                {/* Demo-only helper to simulate a mentee booking this slot */}
                <button
                    type="button"
                    onClick={onSimulateBooking}
                    className="text-[10px] w-full text-white/25 underline decoration-dotted hover:text-white/50"
                >
                    Simulate mentee booking (demo)
                </button>
            </div>
        );
    }

    if (booking.status === "pending_confirmation") {
        return (
            <button
                type="button"
                onClick={onConfirm}
                className="flex items-center gap-1.5 rounded px-3.5 py-2 text-xs font-bold text-black"
                style={{ background: "#a6ff00" }}
            >
                <FiCheckCircle size={13} />
                Confirm Booking
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onJoin}
            className="flex items-center gap-1.5 rounded px-3.5 py-2 text-xs font-bold text-black"
            style={{ background: "#ffffff" }}
        >
            <FiVideo size={13} />
            Join Class
        </button>
    );
};

/* ── One-on-One Card ── */
const OneOnOneCard = ({
    session,
    onEdit,
    onDelete,
    onConfirmBooking,
    onJoinClass,
    onSimulateBooking,
}: {
    session: OneOnOneSession;
    onEdit: () => void;
    onDelete: () => void;
    onConfirmBooking: () => void;
    onJoinClass: () => void;
    onSimulateBooking: () => void;
}) => (
    <div className="overflow-hidden rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
        <div className="p-4 sm:p-5">
            <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16">
                    <img src={session.mentorAvatar} alt="Mentor" className="h-full w-full object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="text-base font-bold text-white sm:text-lg line-clamp-1">SESSION IS LIVE</h3>
                            <p className="text-sm leading-relaxed text-white/55 line-clamp-2">{session.note}</p>
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
                        {formatDuration(session.durationMinutes)}
                    </span>
                    <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-white text-black">
                        1-1 Session
                    </span>
                    <span className="text-white/40">· {session.daysDuration} days</span>
                    {session.meetingLink && (
                        <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-white/40 hover:text-white/70"
                        >
                            <FiLink size={13} />
                            Meeting link
                        </a>
                    )}
                </div>
                <p className="text-base font-bold text-white sm:text-lg">{formatPrice(session.price)}</p>
            </div>

            <div className="mt-4 flex flex-wrap lg:items-center justify-between gap-3 border-t border-white/5 pt-4">
                <span className="text-[11px] text-white/40">
                    {!session.booking && "No mentee has booked this slot yet"}
                    {session.booking?.status === "pending_confirmation" && `${session.booking.menteeName} requested a booking`}
                    {session.booking?.status === "confirmed" && `Confirmed with ${session.booking.menteeName}`}
                </span>
                <BookingStatusButton
                    booking={session.booking}
                    onConfirm={onConfirmBooking}
                    onJoin={onJoinClass}
                    onSimulateBooking={onSimulateBooking}
                />
            </div>
        </div>
    </div>
);

/* ── Group Card (styled like the uploaded image) ── */
const GroupCard = ({
    session,
    onEdit,
    onDelete,
    onView,
}: {
    session: GroupSession;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
}) => {
    const total = session.registrants.length;
    const visibleAvatars = session.registrants.slice(0, 4);
    const remaining = total - visibleAvatars.length;
    const spotsLeft = session.spotsLeft;

    return (
        <div
            className="cursor-pointer overflow-hidden rounded-2xl transition-colors hover:border-white/20"
            style={{ background: cardBg, border: cardBorder }}
            onClick={onView}
        >
            <div className="p-4 sm:p-5">
                {/* Top row: image + title/description + actions */}
                <div className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md sm:h-20 sm:w-20">
                        {session.image ? (
                            <img src={session.image} alt={session.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/60" style={{ background: "rgba(255,255,255,0.08)" }}>
                                Group
                            </div>
                        )}
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
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >
                                    <FiEdit2 size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
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
                        <p className="rounded px-2 bg-white text-black py-0.5 text-[11px] font-semibold capitalize">
                            {session.status || "pending"}
                        </p>
                    </div>
                </div>

                {/* Registrants + capacity */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {visibleAvatars.length > 0 ? (
                                <>
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
                                </>
                            ) : (
                                <span className="text-[11px] text-white/35">No participants yet</span>
                            )}
                        </div>
                        <span className="text-[11px] text-white/40">
                            {session.capacity} total · {spotsLeft > 0 ? `${spotsLeft} left` : "Full"}
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
        style={{ background: "rgba(0,0,0,0.9)" }}
        onClick={onClose}
    >
        <div
            className="w-full max-w-md max-h-[90vh] bg-neutral-950 overflow-y-auto rounded-2xl p-6 shadow-2xl"
            style={{
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
// Shared modal button styles (white accent inside modals)
// ─────────────────────────────────────────────
const modalPrimaryBtn = "flex flex-1 items-center justify-center gap-2 rounded py-2.5 text-sm font-bold text-black";
const modalPrimaryBtnStyle = { background: "#ffffff" };
const modalSecondaryBtn = "flex-1 rounded-lg py-2.5 text-sm font-semibold text-white/70";
const modalSecondaryBtnStyle = { background: "rgba(255,255,255,0.06)" };

const RADIO_DURATIONS = [30, 45, 60, 90, 120, 150, 180];

// ─────────────────────────────────────────────
// Forms
// ─────────────────────────────────────────────
const OneOnOneFormModal = ({
    initial,
    onClose,
    onSave,
    isSaving,
}: {
    initial?: OneOnOneSession | null;
    onClose: () => void;
    onSave: (data: Omit<OneOnOneSession, "id" | "type" | "mentorAvatar" | "booking">) => void;
    isSaving?: boolean;
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
    const [daysDuration] = useState(initial?.daysDuration ?? 7);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim() || !price || !durationMinutes) return;
        onSave({
            note: note.trim(),
            price: Number(price),
            availability,
            responseTime: responseMode === "immediate" ? "immediate" : Number(hours) || 1,
            daysDuration,
            durationMinutes: Number(durationMinutes),
            meetingLink: '',
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
                        className="w-full bg-neutral-900 resize-none rounded-lg px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
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
                            placeholder="4,000"
                            required
                            className="w-full rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/70">
                            <FiClock size={13} /> Duration
                        </label>
                        <select
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(e.target.value)}
                            className="w-full rounded-lg px-3.5 bg-neutral-900 py-2.5 text-sm text-white/90 outline-none"
                        >
                            {RADIO_DURATIONS.map((d) => (
                                <option key={d} value={d}>{formatDuration(d)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 flex items-center  gap-1.5 text-xs font-semibold text-white/70">
                        <FiCalendar size={13} /> Days Duration
                    </label>
                    <input
                        type="text"
                        value={`${daysDuration} days`}
                        disabled
                        readOnly
                        className="w-full cursor-not-allowed bg-neutral-900 rounded-lg px-3.5 py-2.5 text-sm text-white/50 outline-none"
                    />
                    <p className="mt-1 text-[11px] text-white/35">This is fixed and can't be changed.</p>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">Availability</label>
                    <div className="flex gap-4">
                        {(["weekdays", "weekends"] as const).map((opt) => (
                            <label
                                key={opt}
                                className="flex cursor-pointer text-neutral-600 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold capitalize"
                            >
                                <input
                                    type="radio"
                                    name="availability"
                                    value={opt}
                                    checked={availability === opt}
                                    onChange={() => setAvailability(opt)}
                                    className="h-4.5 w-4.5  accent-green-400"
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">Response Time</label>
                    <div className="mb-2 flex gap-4">
                        <label
                            className="flex cursor-pointer text-neutral-600 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold capitalize"
                        >
                            <input
                                type="radio"
                                name="responseTime"
                                value="immediate"
                                checked={responseMode === "immediate"}
                                onChange={() => setResponseMode("immediate")}
                                className="h-4.5 w-4.5  accent-green-400"
                            />
                            Immediately
                        </label>
                        <label
                            className="flex cursor-pointer text-neutral-600 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold capitalize"
                        >
                            <input
                                type="radio"
                                name="responseTime"
                                value="hours"
                                checked={responseMode === "hours"}
                                onChange={() => setResponseMode("hours")}
                                className="h-4.5 w-4.5  accent-green-400"
                            />
                            Hours
                        </label>
                    </div>
                    {responseMode === "hours" && (
                        <input
                            type="number"
                            min="1"
                            max="72"
                            placeholder="e.g. 2"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full bg-neutral-900 rounded-lg px-3.5 py-2.5 text-sm text-white/90 outline-none"
                        />
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={isSaving} className={`${modalPrimaryBtn} disabled:opacity-60`} style={modalPrimaryBtnStyle}>
                        <FiCheck size={14} />
                        {isSaving ? "Saving..." : initial ? "Save changes" : "Create session"}
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
    isSaving = false,
}: {
    initial?: GroupSession | null;
    onClose: () => void;
    onSave: (data: GroupSessionFormValues) => void;
    isSaving?: boolean;
}) => {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [price, setPrice] = useState(initial?.price?.toString() ?? "");
    const [startDate, setStartDate] = useState(initial?.startDate ?? "");
    const [endDate, setEndDate] = useState(initial?.endDate ?? "");
    const [dailyTime, setDailyTime] = useState(initial?.dailyTime ?? "14:00");
    const [capacity, setCapacity] = useState(initial?.capacity?.toString() ?? "15");
    const [imagePreview, setImagePreview] = useState(initial?.image ?? "");
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

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
            image: imagePreview || "",
            capacity: Number(capacity),
            imageFile,
            spotsLeft: initial?.spotsLeft ?? Number(capacity),
            status: initial?.status ?? "pending",
            meetingLink: initial?.meetingLink ?? "",
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
                        className="w-full rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
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
                        className="w-full resize-none rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">Session Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white/90 outline-none file:mr-3 file:rounded file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-black"
                    />
                    {imagePreview && (
                        <img src={imagePreview} alt="Group session preview" className="mt-3 h-24 w-full rounded-lg object-cover" />
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-white/70">Price (₦)</label>
                        <input
                            type="number"
                            min="1"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="15000"
                            required
                            className="w-full rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
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
                            className="w-full rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
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
                            className="w-full rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white/90 outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-white/70">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className="w-full rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white/90 outline-none"
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
                        className="w-full rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white/90 outline-none"
                    />
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={isSaving} className={`${modalPrimaryBtn} w-full disabled:opacity-60`} style={modalPrimaryBtnStyle}>
                        <FiCheck size={14} />
                        {isSaving ? "Saving..." : initial ? "Save changes" : "Create Session"}
                    </button>
                </div>
            </form>
        </AnimatedModal>
    );
};

// ─────────────────────────────────────────────
// Join Class Modal
// ─────────────────────────────────────────────
const DeleteConfirmModal = ({
    onClose,
    onConfirm,
    isDeleting,
}: {
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
}) => (
    <AnimatedModal onClose={onClose}>
        <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Delete 1-1 Session</h3>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white" style={{ background: "rgba(255,255,255,0.06)" }}>
                <FiX size={16} />
            </button>
        </div>

        <div className="rounded-xl px-4 py-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-sm leading-relaxed text-white/70">
                This will permanently remove your one-on-one session from your public mentor profile.
            </p>
        </div>

        <div className="mt-5 flex gap-3">
            <button type="button" onClick={onClose} className={modalSecondaryBtn} style={modalSecondaryBtnStyle}>
                Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={isDeleting} className={`${modalPrimaryBtn} disabled:opacity-60`} style={{ ...modalPrimaryBtnStyle, background: "#f87171" }}>
                <FiTrash2 size={14} />
                {isDeleting ? "Deleting..." : "Delete"}
            </button>
        </div>
    </AnimatedModal>
);

const DeleteGroupSessionModal = ({
    onClose,
    onConfirm,
    isDeleting,
}: {
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
}) => (
    <AnimatedModal onClose={onClose}>
        <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Delete Group Session</h3>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white" style={{ background: "rgba(255,255,255,0.06)" }}>
                <FiX size={16} />
            </button>
        </div>

        <div className="rounded-xl px-4 py-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-sm leading-relaxed text-white/70">
                This will permanently remove this group session and make it unavailable to new registrations.
            </p>
        </div>

        <div className="mt-5 flex gap-3">
            <button type="button" onClick={onClose} className={modalSecondaryBtn} style={modalSecondaryBtnStyle}>
                Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={isDeleting} className={`${modalPrimaryBtn} disabled:opacity-60`} style={{ ...modalPrimaryBtnStyle, background: "#f87171" }}>
                <FiTrash2 size={14} />
                {isDeleting ? "Deleting..." : "Delete"}
            </button>
        </div>
    </AnimatedModal>
);

const JoinClassModal = ({
    booking,
    onClose,
    onDone,
}: {
    booking: Booking;
    onClose: () => void;
    onDone: () => void;
}) => (
    <AnimatedModal onClose={onClose}>
        <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Session Details</h3>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white" style={{ background: "rgba(255,255,255,0.06)" }}>
                <FiX size={16} />
            </button>
        </div>

        <div className="flex flex-col items-center rounded-xl px-4 py-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <img
                src={booking.menteeAvatar}
                alt={booking.menteeName}
                className="h-16 w-16 rounded-full object-cover"
                style={{ border: "2px solid rgba(255,255,255,0.15)" }}
            />
            <p className="mt-3 text-base font-bold text-white">{booking.menteeName}</p>
            <p className="text-xs text-white/40">{booking.bookedFor}</p>
        </div>

        <div className="mt-5 flex flex-col gap-3">
            <a
                href={booking.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`${modalPrimaryBtn} no-underline`}
                style={modalPrimaryBtnStyle}
            >
                <FiExternalLink size={14} />
                Open Meeting Link
            </a>
            <button type="button" onClick={onDone} className={modalSecondaryBtn} style={modalSecondaryBtnStyle}>
                Done with Session
            </button>
        </div>
    </AnimatedModal>
);

// ─────────────────────────────────────────────
// Done With Session Modal (add a note)
// ─────────────────────────────────────────────
const DoneSessionModal = ({
    menteeName,
    onClose,
    onSubmit,
}: {
    menteeName: string;
    onClose: () => void;
    onSubmit: (note: string) => void;
}) => {
    const [note, setNote] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim()) return;
        onSubmit(note.trim());
    };

    return (
        <AnimatedModal onClose={onClose}>
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Add Session Note</h3>
                <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <FiX size={16} />
                </button>
            </div>

            <p className="mb-3 text-xs text-white/40">
                Leave a quick note about your session with <span className="text-white/70">{menteeName}</span>. This helps you track progress over time.
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
                {SUGGESTED_NOTES.map((s, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setNote(s)}
                        className="flex items-center gap-1 rounded-full px-3 py-1.5 text-left text-[11px] text-white/60 hover:text-white"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                        <FiMessageSquare size={10} />
                        {s.length > 42 ? `${s.slice(0, 42)}…` : s}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write your note here..."
                    rows={4}
                    required
                    className="w-full resize-none rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />

                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} className={modalSecondaryBtn} style={modalSecondaryBtnStyle}>
                        Skip
                    </button>
                    <button type="submit" className={modalPrimaryBtn} style={modalPrimaryBtnStyle}>
                        <FiCheck size={14} />
                        Save Note
                    </button>
                </div>
            </form>
        </AnimatedModal>
    );
};

// ─────────────────────────────────────────────
// Group Details Modal
// ─────────────────────────────────────────────
const GroupDetailsModal = ({
    session,
    onClose,
}: {
    session: GroupSession;
    onClose: () => void;
}) => {
    const total = session.registrants.length;
    const spotsLeft = session.spotsLeft;

    return (
        <AnimatedModal onClose={onClose}>
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Group Session Details</h3>
                <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <FiX size={16} />
                </button>
            </div>

            <div className="mb-4 h-36 w-full overflow-hidden rounded-xl">
                <img src={session.image} alt={session.name} className="h-full w-full object-cover" />
            </div>

            <h4 className="text-base font-bold text-white">{session.name}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-white/55">{session.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="flex items-center gap-1.5 text-white/40"><FiCalendar size={12} /> Dates</p>
                    <p className="mt-1 font-semibold text-white/85">{formatDate(session.startDate)} – {formatDate(session.endDate)}</p>
                </div>
                <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="flex items-center gap-1.5 text-white/40"><FiClock size={12} /> Daily Time</p>
                    <p className="mt-1 font-semibold text-white/85">{formatTime(session.dailyTime)}</p>
                </div>
                <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-white/40">Price</p>
                    <p className="mt-1 font-semibold text-white/85">{formatPrice(session.price)}</p>
                </div>
                <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-white/40">Capacity</p>
                    <p className="mt-1 font-semibold text-white/85">{total}/{session.capacity} · {spotsLeft > 0 ? `${spotsLeft} left` : "Full"}</p>
                </div>
            </div>

            <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-white/70">Registrants ({total})</p>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {session.registrants.length === 0 && (
                        <p className="text-xs text-white/35">No one has registered yet.</p>
                    )}
                    {session.registrants.map((r) => (
                        <div key={r.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <img src={r.avatar} alt={r.name} className="h-8 w-8 rounded-full object-cover" />
                            <p className="text-sm text-white/80">{r.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-5">
                <button type="button" onClick={onClose} className={modalSecondaryBtn} style={{ ...modalSecondaryBtnStyle, width: "100%" }}>
                    Close
                </button>
            </div>
        </AnimatedModal>
    );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const MentorSessions = () => {
    // Individual (1-1) session now comes from the API instead of dummy data.
    const [oneOnOne, setOneOnOne] = useState<OneOnOneSession | null>(null);
    const [groups, setGroups] = useState<GroupSession[]>([]);
    const { addToast } = useGlobalContext();

    const { myProfile } = useGetMyUserProfile();
    const userProfile = myProfile?.data;

    const [showOneOnOneForm, setShowOneOnOneForm] = useState(false);
    const [editingOneOnOne, setEditingOneOnOne] = useState<OneOnOneSession | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupSession | null>(null);
    const [showGroupDeleteConfirm, setShowGroupDeleteConfirm] = useState(false);
    const [groupDeleteId, setGroupDeleteId] = useState("");

    const [viewingGroup, setViewingGroup] = useState<GroupSession | null>(null);

    const [showJoinClass, setShowJoinClass] = useState(false);
    const [showDoneSession, setShowDoneSession] = useState(false);

    const canCreateOneOnOne = !oneOnOne;
    const canCreateGroup = groups.length < 3;

    const { mutate: createIndividualSession, isPending: isCreatingIndividualSession } = useCreateIndividualSession();
    const { mutate: editIndividualSession, isPending: isEditingIndividualSession } = useEditIndividualSession(oneOnOne?.id ?? "");
    const { mutate: deleteIndividualSession, isPending: isDeletingIndividualSession } = useDeleteIndividualSession(oneOnOne?.id ?? "");
    const { mutate: createGroupSession, isPending: isCreatingGroupSession } = useCreateGroupSession();
    const { mutate: editGroupSession, isPending: isEditingGroupSession } = useEditGroupSession(editingGroup?.id ?? "");
    const { mutate: deleteGroupSession, isPending: isDeletingGroupSession } = useDeleteGroupSession(groupDeleteId);
    const { mentorIndividualSession, isLoading: isloadingMentorIndividualSession } = useGetMentorIndividualSession();
    const { mentorGroupSessions, isLoading: isLoadingMentorGroupSessions } = useGetMentorGroupSessions();

    console.log("mentorIndividualSession", mentorGroupSessions?.data?.results);

    const apiOneOnOneSession = unwrapIndividualSession(mentorIndividualSession?.data);

    useEffect(() => {
        if (!apiOneOnOneSession) {
            setOneOnOne(null);
            return;
        }

        setOneOnOne(mapApiSessionToLocal(apiOneOnOneSession, userProfile?.avatar ?? ""));
    }, [apiOneOnOneSession, userProfile?.avatar]);

    useEffect(() => {
        const apiGroupPayload = (mentorGroupSessions as any)?.data ?? mentorGroupSessions ?? {};
        const rawGroups = Array.isArray(apiGroupPayload?.results)
            ? apiGroupPayload.results
            : Array.isArray(apiGroupPayload?.data)
                ? apiGroupPayload.data
                : Array.isArray(apiGroupPayload)
                    ? apiGroupPayload
                    : [];

        setGroups(rawGroups.map((item: any) => mapApiGroupSessionToLocal(item)));
    }, [mentorGroupSessions]);


    const handleSaveOneOnOne = (data: Omit<OneOnOneSession, "id" | "type" | "mentorAvatar" | "booking">) => {
        const payload = mapLocalToCreatePayload(data);

        if (editingOneOnOne) {
            editIndividualSession(payload, {
                onSuccess: (response: any) => {
                    const updatedSession = unwrapIndividualSession(response?.data ?? response);
                    if (updatedSession) {
                        setOneOnOne(mapApiSessionToLocal(updatedSession, userProfile?.avatar ?? ""));
                    }
                    setShowOneOnOneForm(false);
                    setEditingOneOnOne(null);
                },
                onError: (error: unknown) => {
                    const apiError = error as any;
                    addToast(flattenApiErrors(apiError?.response?.data ?? error), "error");
                },
            });
            return;
        }

        createIndividualSession(payload, {
            onSuccess: (response: any) => {
                const createdSession = unwrapIndividualSession(response?.data ?? response);
                if (createdSession) {
                    setOneOnOne(mapApiSessionToLocal(createdSession, userProfile?.avatar ?? ""));
                }
                addToast("1:1 session created successfully", "success");
                setShowOneOnOneForm(false);
                setEditingOneOnOne(null);
            },
            onError: (error: unknown) => {
                const apiError = error as any;
                addToast(flattenApiErrors(apiError?.response?.data ?? error), "error");
            },
        });
    };

    const handleSaveGroup = (data: GroupSessionFormValues) => {
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price_per_participant", String(data.price));
        formData.append("start_date", data.startDate);
        formData.append("end_date", data.endDate);
        formData.append("daily_time", data.dailyTime);
        formData.append("max_participants", String(data.capacity));

        if (data.imageFile) {
            formData.append("banner", data.imageFile);
        }

        const requestFn = editingGroup
            ? () => editGroupSession(formData, {
                onSuccess: () => {
                    addToast("Group session updated", "success");
                    setShowGroupForm(false);
                    setEditingGroup(null);
                },
                onError: (error: any) => {
                    const apiError = error as any;
                    addToast(flattenApiErrors(apiError?.response?.data ?? error), "error");
                },
            })
            : () => createGroupSession(formData, {
                onSuccess: () => {
                    addToast("Group session created", "success");
                    setShowGroupForm(false);
                    setEditingGroup(null);
                },
                onError: (error: any) => {
                    const apiError = error as any;
                    addToast(flattenApiErrors(apiError?.response?.data ?? error), "error");
                },
            });

        requestFn();
    };

    const handleDeleteOneOnOne = () => {
        if (oneOnOne) {
            setShowDeleteConfirm(true);
        }
    };

    const confirmDeleteOneOnOne = () => {
        if (!oneOnOne) return;

        deleteIndividualSession(undefined, {
            onSuccess: () => {
                setOneOnOne(null);
                setEditingOneOnOne(null);
                setShowDeleteConfirm(false);
                addToast("1:1 session deleted", "success");
            },
            onError: (error: unknown) => {
                const apiError = error as any;
                addToast(flattenApiErrors(apiError?.response?.data ?? error), "error");
            },
        });
    };

    const handleDeleteGroup = (id: string) => {
        setGroupDeleteId(id);
        setShowGroupDeleteConfirm(true);
    };

    const confirmDeleteGroup = () => {
        if (!groupDeleteId) return;

        deleteGroupSession(undefined, {
            onSuccess: () => {
                setGroups((prev) => prev.filter((g) => g.id !== groupDeleteId));
                addToast("Group session deleted", "success");
                setGroupDeleteId("");
                setShowGroupDeleteConfirm(false);
            },
            onError: (error: any) => {
                const apiError = error as any;
                addToast(flattenApiErrors(apiError?.response?.data ?? error), "error");
                setGroupDeleteId("");
                setShowGroupDeleteConfirm(false);
            },
        });
    };

    // ── Booking flow handlers ──
    const handleSimulateBooking = () => {
        if (!oneOnOne) return;
        setOneOnOne({
            ...oneOnOne,
            booking: {
                id: `bk-${Date.now()}`,
                menteeName: "Zainab Musa",
                menteeAvatar: "https://i.pravatar.cc/150?img=44",
                meetingLink: oneOnOne.meetingLink || "https://meet.google.com/demo-link",
                status: "pending_confirmation",
                bookedFor: "Today, 3:00 PM",
            },
        });
    };

    const handleConfirmBooking = () => {
        if (!oneOnOne?.booking) return;
        setOneOnOne({
            ...oneOnOne,
            booking: { ...oneOnOne.booking, status: "confirmed" },
        });
    };

    const handleJoinClass = () => setShowJoinClass(true);

    const handleDoneWithSession = () => {
        setShowJoinClass(false);
        setShowDoneSession(true);
    };

    const handleSubmitNote = (_note: string) => {
        // In a real app this note would be persisted against the booking/session record.
        if (oneOnOne) {
            setOneOnOne({ ...oneOnOne, booking: null });
        }
        setShowDoneSession(false);
    };

    return (
        <div>
            <LoadingOverlay visible={
                isCreatingIndividualSession ||
                isEditingIndividualSession ||
                isDeletingIndividualSession ||
                isCreatingGroupSession ||
                isEditingGroupSession ||
                isDeletingGroupSession ||
                isloadingMentorIndividualSession ||
                isLoadingMentorGroupSessions
            } />
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
                        onConfirmBooking={handleConfirmBooking}
                        onJoinClass={handleJoinClass}
                        onSimulateBooking={handleSimulateBooking}
                    />
                ) : (
                    <EmptyState
                        label={
                            isloadingMentorIndividualSession
                                ? "Loading your 1-1 session..."
                                : "You haven't created a One-on-One session yet. Mentors can only have one."
                        }
                        onCreate={
                            isloadingMentorIndividualSession
                                ? undefined
                                : () => { setEditingOneOnOne(null); setShowOneOnOneForm(true); }
                        }
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
                            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold text-black"
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
                                onView={() => setViewingGroup(g)}
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
                    isSaving={isCreatingIndividualSession || isEditingIndividualSession}
                />
            )}
            {showDeleteConfirm && (
                <DeleteConfirmModal
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={confirmDeleteOneOnOne}
                    isDeleting={isDeletingIndividualSession}
                />
            )}
            {showGroupDeleteConfirm && (
                <DeleteGroupSessionModal
                    onClose={() => { setShowGroupDeleteConfirm(false); setGroupDeleteId(""); }}
                    onConfirm={confirmDeleteGroup}
                    isDeleting={isDeletingGroupSession}
                />
            )}
            {showGroupForm && (
                <GroupFormModal
                    initial={editingGroup}
                    onClose={() => { setShowGroupForm(false); setEditingGroup(null); }}
                    onSave={handleSaveGroup}
                    isSaving={isCreatingGroupSession || isEditingGroupSession}
                />
            )}
            {viewingGroup && (
                <GroupDetailsModal
                    session={viewingGroup}
                    onClose={() => setViewingGroup(null)}
                />
            )}
            {showJoinClass && oneOnOne?.booking && (
                <JoinClassModal
                    booking={oneOnOne.booking}
                    onClose={() => setShowJoinClass(false)}
                    onDone={handleDoneWithSession}
                />
            )}
            {showDoneSession && oneOnOne?.booking && (
                <DoneSessionModal
                    menteeName={oneOnOne.booking.menteeName}
                    onClose={() => setShowDoneSession(false)}
                    onSubmit={handleSubmitNote}
                />
            )}
        </div>
    );
};

export default MentorSessions;
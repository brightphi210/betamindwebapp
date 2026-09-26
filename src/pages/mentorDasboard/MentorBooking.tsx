import { useEffect, useState } from "react";
import {
    FiAlertTriangle,
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
    FiPlay,
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
    useAcceptBooking,
    useCreateGroupSession,
    useCreateIndividualSession,
    useDeleteGroupSession,
    useDeleteIndividualSession,
    useEditGroupSession,
    useEditIndividualSession,
    useRejectBooking,
    useStartGroupSession,
} from "../../hooks/mutations/allMutation";
import { useGetMentorGroupSessions, useGetMentorIndividualSession, useGetMyUserProfile } from "../../hooks/queries/allQueriess";
import { useGlobalContext } from "../../providers/GlobalContext";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Availability = "weekdays" | "weekends";
type ResponseTime = "immediate" | "within_24h" | "within_48h";
type BookingStatus = "pending" | "accepted";

interface Booking {
    id: string;
    menteeName: string;
    menteeFirstName: string;
    menteeLastName: string;
    menteeAvatar: string;
    meetingLink: string;
    status: BookingStatus;
    bookedFor: string;
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

interface MenteeApiObject {
    id?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string | null;
    [key: string]: unknown;
}

interface IndividualSessionApiResponse {
    id: number;
    mentor: string;
    mentor_name?: string;
    mentee: MenteeApiObject | string | null;
    mentee_name?: string | null;
    mentee_avatar?: string | null;
    duration_days: number;
    duration_minutes: number;
    price: string;
    response_time: ResponseTime | string | number;
    status: "pending" | "accepted" | "cancelled" | string;
    availability: Availability;
    meeting_link: string | null;
    notes: string;
    booked: boolean;
    booking_id?: number | string | null;
    booking?: {
        id?: number | string;
        status?: string;
        mentee_name?: string;
        mentee_avatar?: string;
        meeting_link?: string;
        created_at?: string;
        booked_for?: string;
        [key: string]: unknown;
    } | null;
    created_at: string;
    updated_at?: string;
}

const unwrapIndividualSession = (
    raw: IndividualSessionApiResponse | IndividualSessionApiResponse[] | null | undefined
): IndividualSessionApiResponse | null => {
    if (!raw) return null;
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw;
};

const resolveBookingId = (api: IndividualSessionApiResponse): string | null => {
    const nestedId = api.booking?.id;
    if (nestedId !== undefined && nestedId !== null && String(nestedId).trim() !== "") {
        return String(nestedId);
    }
    if (api.booking_id !== undefined && api.booking_id !== null && String(api.booking_id).trim() !== "") {
        return String(api.booking_id);
    }
    if (api.booked === true && api.id !== undefined && api.id !== null) {
        return String(api.id);
    }
    return null;
};

const resolveMenteeInfo = (api: IndividualSessionApiResponse) => {
    const nested = api.booking;
    const menteeObj =
        api.mentee && typeof api.mentee === "object" ? (api.mentee as MenteeApiObject) : null;

    const firstName =
        (typeof menteeObj?.first_name === "string" ? menteeObj.first_name : "") || "";
    const lastName =
        (typeof menteeObj?.last_name === "string" ? menteeObj.last_name : "") || "";

    const fullFromObject = [firstName, lastName].filter(Boolean).join(" ").trim();

    const menteeName =
        fullFromObject ||
        (typeof nested?.mentee_name === "string" ? nested.mentee_name : "") ||
        (typeof api.mentee_name === "string" ? api.mentee_name : "") ||
        "Mentee";

    const menteeAvatar =
        (typeof menteeObj?.avatar === "string" && menteeObj.avatar) ||
        (typeof nested?.mentee_avatar === "string" && nested.mentee_avatar) ||
        (typeof api.mentee_avatar === "string" && api.mentee_avatar) ||
        "";

    return {
        menteeName,
        menteeFirstName: firstName || menteeName.split(" ")[0] || "",
        menteeLastName: lastName || menteeName.split(" ").slice(1).join(" ") || "",
        menteeAvatar,
    };
};

const normalizeResponseTime = (raw: unknown): ResponseTime => {
    if (raw === "immediate" || raw === "within_24h" || raw === "within_48h") {
        return raw;
    }
    // Legacy number support (hours) → map to closest allowed value
    const n = Number(raw);
    if (Number.isFinite(n)) {
        if (n <= 0) return "immediate";
        if (n <= 24) return "within_24h";
        return "within_48h";
    }
    return "immediate";
};

const mapApiSessionToLocal = (
    api: IndividualSessionApiResponse,
    mentorAvatar = ""
): OneOnOneSession => {
    const parsedPrice = Number(api.price);
    const hasBooking = api.booked === true;
    const bookingId = resolveBookingId(api);
    const nested = api.booking;
    const statusRaw = nested?.status ?? api.status;
    const bookedForRaw = nested?.booked_for ?? nested?.created_at ?? api.created_at;
    const { menteeName, menteeFirstName, menteeLastName, menteeAvatar } = resolveMenteeInfo(api);

    const booking: Booking | null =
        hasBooking && bookingId
            ? {
                id: bookingId,
                menteeName,
                menteeFirstName,
                menteeLastName,
                menteeAvatar,
                meetingLink: nested?.meeting_link ?? api.meeting_link ?? "",
                status: statusRaw === "accepted" ? "accepted" : "pending",
                bookedFor: bookedForRaw
                    ? new Date(bookedForRaw).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                    })
                    : "",
            }
            : null;

    return {
        id: String(api.id),
        type: "one-on-one",
        note: api.notes ?? "",
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        availability: api.availability,
        responseTime: normalizeResponseTime(api.response_time),
        durationMinutes: api.duration_minutes,
        daysDuration: api.duration_days,
        mentorAvatar: mentorAvatar || "",
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
    response_time: data.responseTime, // "immediate" | "within_24h" | "within_48h"
    availability: data.availability,
    meeting_link: data.meetingLink,
    notes: data.note,
});

const mapApiGroupSessionToLocal = (api: any): GroupSession => {
    const rawDailyTime = api.daily_time ?? api.time ?? "14:00";
    const normalizedDailyTime =
        typeof rawDailyTime === "string"
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
                avatar: r.avatar || r.image || "",
            }))
            : [],
    };
};

// How many people have registered for a group session.
// Falls back to capacity - spotsLeft in case the API doesn't return the registrants list.
const getRegisteredCount = (session: GroupSession) =>
    Math.max(session.registrants.length, Math.max(0, session.capacity - session.spotsLeft));

// A group session can only be started while it's still pending and has at least one registrant.
const canStartGroupSession = (session: GroupSession) =>
    (session.status || "pending").toLowerCase() === "pending" && getRegisteredCount(session) > 0;

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

const formatModalValidationErrors = (data: unknown): string => {
    if (!data) return "Something went wrong. Please try again.";
    if (typeof data === "string") return data;
    if (Array.isArray(data)) {
        const formatted = data
            .map((item) => formatModalValidationErrors(item))
            .filter(Boolean)
            .flatMap((line) => line.split("\n"));
        return formatted.join("\n");
    }
    if (typeof data === "object") {
        const entries = Object.entries(data as Record<string, unknown>);
        const parts: string[] = [];
        for (const [key, value] of entries) {
            if (value === null || value === undefined) continue;
            if (key === "non_field_errors") {
                const message = formatModalValidationErrors(value).trim();
                if (message) parts.push(message);
                continue;
            }
            if (Array.isArray(value)) {
                const message = formatModalValidationErrors(value).trim();
                if (message) parts.push(`${key}: ${message}`);
                continue;
            }
            if (typeof value === "object") {
                const nested = formatModalValidationErrors(value).trim();
                if (nested) {
                    const normalized = nested
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .join("\n");
                    if (normalized) parts.push(`${key}:\n${normalized}`);
                }
                continue;
            }
            if (typeof value === "string" && value.trim()) {
                parts.push(`${key}: ${value}`);
            }
        }
        if (parts.length > 0) return parts.join("\n");
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

const formatDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

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

const RESPONSE_TIME_LABELS: Record<ResponseTime, string> = {
    immediate: "Immediately",
    within_24h: "Within 24 hours",
    within_48h: "Within 48 hours",
};

const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6 MB

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Booking Status Button
// ─────────────────────────────────────────────
const BookingStatusButton = ({
    booking,
    onAccept,
    onDecline,
    onJoin,
}: {
    booking: Booking | null;
    onAccept: () => void;
    onDecline: () => void;
    onJoin: () => void;
}) => {
    if (!booking) {
        return (
            <button
                type="button"
                disabled
                className="flex cursor-not-allowed items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold text-white/35"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
                <FiLock size={12} />
                Not Booked Yet
            </button>
        );
    }

    if (booking.status === "pending") {
        return (
            <div className="flex gap-2" style={{ minWidth: 220 }}>
                <button
                    type="button"
                    onClick={onAccept}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded px-3.5 py-2 text-xs font-bold text-black"
                    style={{ background: "#a6ff00" }}
                >
                    <FiCheckCircle size={13} />
                    Accept
                </button>
                <button
                    type="button"
                    onClick={onDecline}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded px-3.5 py-2 text-xs font-bold text-white"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                >
                    <FiX size={13} />
                    Decline
                </button>
            </div>
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

// ─────────────────────────────────────────────
// One-on-One Card
// ─────────────────────────────────────────────
const OneOnOneCard = ({
    session,
    onEdit,
    onDelete,
    onJoinClass,
    onAcceptBooking,
    onDeclineBooking,
}: {
    session: OneOnOneSession;
    onEdit: () => void;
    onDelete: () => void;
    onJoinClass: () => void;
    onAcceptBooking: () => void;
    onDeclineBooking: () => void;
}) => (
    <div className="overflow-hidden rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
        <div className="p-4 sm:p-5">
            <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16">
                    {session.mentorAvatar ? (
                        <img src={session.mentorAvatar} alt="Mentor" className="h-full w-full object-cover" />
                    ) : (
                        <div
                            className="flex h-full w-full items-center justify-center text-white/40"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                        >
                            <FiUser size={22} />
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="text-base font-bold text-white sm:text-lg line-clamp-1">SESSION IS LIVE</h3>
                            <p className="text-sm leading-relaxed text-white/55 line-clamp-2">{session.note}</p>
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
                    <span className="text-white/40">· {RESPONSE_TIME_LABELS[session.responseTime]}</span>
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
                    {session.booking?.status === "pending" && `${session.booking.menteeName} requested a booking`}
                    {session.booking?.status === "accepted" && `Accepted by ${session.booking.menteeName}`}
                </span>
                <BookingStatusButton
                    booking={session.booking}
                    onAccept={onAcceptBooking}
                    onDecline={onDeclineBooking}
                    onJoin={onJoinClass}
                />
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// Group Card
// ─────────────────────────────────────────────
const GroupCard = ({
    session,
    onEdit,
    onDelete,
    onView,
    onStart,
}: {
    session: GroupSession;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
    onStart: () => void;
}) => {
    const total = session.registrants.length;
    const visibleAvatars = session.registrants.slice(0, 4);
    const remaining = total - visibleAvatars.length;
    const spotsLeft = session.spotsLeft;

    const registeredCount = getRegisteredCount(session);
    const canStart = canStartGroupSession(session);

    return (
        <div
            className="cursor-pointer overflow-hidden rounded-2xl transition-colors hover:border-white/20"
            style={{ background: cardBg, border: cardBorder }}
            onClick={onView}
        >
            <div className="p-4 sm:p-5">
                <div className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md sm:h-20 sm:w-20">
                        {session.image ? (
                            <img src={session.image} alt={session.name} className="h-full w-full object-cover" />
                        ) : (
                            <div
                                className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/60"
                                style={{ background: "rgba(255,255,255,0.08)" }}
                            >
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >
                                    <FiEdit2 size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/80 hover:bg-red-500/10 hover:text-red-400"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs w-full">
                        <p className="flex items-center gap-1.5 text-white/50">
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

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {visibleAvatars.length > 0 ? (
                                <>
                                    {visibleAvatars.map((r) =>
                                        r.avatar ? (
                                            <img
                                                key={r.id}
                                                src={r.avatar}
                                                alt={r.name}
                                                title={r.name}
                                                className="h-7 w-7 rounded-full border-2 object-cover"
                                                style={{ borderColor: "rgba(10,13,9,0.95)" }}
                                            />
                                        ) : (
                                            <div
                                                key={r.id}
                                                title={r.name}
                                                className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px] font-bold text-white/80"
                                                style={{
                                                    background: "rgba(255,255,255,0.1)",
                                                    borderColor: "rgba(10,13,9,0.95)",
                                                }}
                                            >
                                                {(r.name || "?").charAt(0).toUpperCase()}
                                            </div>
                                        )
                                    )}
                                    {remaining > 0 && (
                                        <div
                                            className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px] font-bold text-white/80"
                                            style={{
                                                background: "rgba(255,255,255,0.1)",
                                                borderColor: "rgba(10,13,9,0.95)",
                                            }}
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

                {/* Start Session — only while pending and at least one person has registered */}
                {canStart && (
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                        <span className="text-[11px] text-white/40">
                            {registeredCount} registered · ready to start
                        </span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation(); // don't trigger the card's onView
                                onStart();
                            }}
                            className="flex items-center gap-1.5 rounded px-3.5 py-2 text-xs font-bold text-black"
                            style={{ background: "#a6ff00" }}
                        >
                            <FiPlay size={13} />
                            Start Session
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Animated Modal (enter + exit)
// ─────────────────────────────────────────────
const AnimatedModal = ({
    children,
    onClose,
}: {
    children: React.ReactNode;
    onClose: () => void;
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation on mount
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const handleClose = () => {
        setVisible(false);
        // Wait for exit animation before calling onClose
        setTimeout(onClose, 220);
    };

    return (
        <div
            className="fixed inset-0 z-30 flex items-center justify-center px-4 transition-opacity duration-200"
            style={{
                background: "rgba(0,0,0,0.9)",
                opacity: visible ? 1 : 0,
            }}
            onClick={handleClose}
        >
            <div
                className="w-full max-w-md max-h-[90vh] bg-neutral-950 overflow-y-auto rounded-2xl p-6 shadow-2xl transition-all duration-200"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "scale(1) translateY(0)" : "scale(0.94) translateY(12px)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Shared modal button styles
// ─────────────────────────────────────────────
const modalPrimaryBtn = "flex flex-1 items-center justify-center gap-2 rounded py-2.5 text-sm font-bold text-black";
const modalPrimaryBtnStyle = { background: "#ffffff" };
const modalSecondaryBtn = "flex-1 rounded-lg py-2.5 text-sm font-semibold text-white/70";
const modalSecondaryBtnStyle = { background: "rgba(255,255,255,0.06)" };

const RADIO_DURATIONS = [30, 45, 60, 90, 120, 150, 180];

// ─────────────────────────────────────────────
// Progress Bar (used while creating / editing)
// ─────────────────────────────────────────────
const ProgressBar = ({ label }: { label: string }) => (
    <div className="fixed inset-x-0 top-0 z-[60] px-4 pt-3">
        <div className="mx-auto max-w-md overflow-hidden rounded-full bg-white/10">
            <div
                className="h-1.5 rounded-full bg-[#a6ff00]"
                style={{
                    width: "100%",
                    animation: "progressIndeterminate 1.4s ease-in-out infinite",
                }}
            />
        </div>
        <p className="mt-2 text-center text-xs font-medium text-white/70">{label}</p>
        <style>{`
            @keyframes progressIndeterminate {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
            }
        `}</style>
    </div>
);

// ─────────────────────────────────────────────
// One-on-One Form Modal
// ─────────────────────────────────────────────
const OneOnOneFormModal = ({
    initial,
    onClose,
    onSave,
    isSaving,
    errorMessage,
}: {
    initial?: OneOnOneSession | null;
    onClose: () => void;
    onSave: (data: Omit<OneOnOneSession, "id" | "type" | "mentorAvatar" | "booking">) => void;
    isSaving?: boolean;
    errorMessage?: string | null;
}) => {
    const [note, setNote] = useState(initial?.note ?? "");
    const [price, setPrice] = useState(initial?.price?.toString() ?? "");
    const [availability, setAvailability] = useState<Availability>(initial?.availability ?? "weekdays");
    const [responseTime, setResponseTime] = useState<ResponseTime>(
        initial?.responseTime ?? "immediate"
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
            responseTime,
            daysDuration,
            durationMinutes: Number(durationMinutes),
            meetingLink: "",
        });
    };

    return (
        <AnimatedModal onClose={onClose}>
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                    {initial ? "Edit" : "Create"} 1-1 Session
                </h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                >
                    <FiX size={16} />
                </button>
            </div>

            {errorMessage && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-200 whitespace-pre-line">
                    {errorMessage}
                </div>
            )}

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
                                <option key={d} value={d}>
                                    {formatDuration(d)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/70">
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
                                    className="h-4.5 w-4.5 accent-green-400"
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">Response Time</label>
                    <div className="flex flex-col gap-2">
                        {(["immediate", "within_24h", "within_48h"] as const).map((opt) => (
                            <label
                                key={opt}
                                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-300"
                            >
                                <input
                                    type="radio"
                                    name="responseTime"
                                    value={opt}
                                    checked={responseTime === opt}
                                    onChange={() => setResponseTime(opt)}
                                    className="h-4.5 w-4.5 accent-green-400"
                                />
                                {RESPONSE_TIME_LABELS[opt]}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`${modalPrimaryBtn} disabled:opacity-60`}
                        style={modalPrimaryBtnStyle}
                    >
                        <FiCheck size={14} />
                        {isSaving ? "Saving..." : initial ? "Save changes" : "Create session"}
                    </button>
                </div>
            </form>
        </AnimatedModal>
    );
};

// ─────────────────────────────────────────────
// Group Form Modal
// ─────────────────────────────────────────────
const GroupFormModal = ({
    initial,
    onClose,
    onSave,
    isSaving = false,
    errorMessage,
}: {
    initial?: GroupSession | null;
    onClose: () => void;
    onSave: (data: GroupSessionFormValues) => void;
    isSaving?: boolean;
    errorMessage?: string | null;
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
    const [imageError, setImageError] = useState<string>("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_IMAGE_BYTES) {
            setImageError("Image must be 6 MB or smaller.");
            setImageFile(null);
            setImagePreview(initial?.image ?? "");
            e.target.value = "";
            return;
        }

        setImageError("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim() || !price || !startDate || !endDate || !dailyTime || !capacity) return;
        if (imageError) return;

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
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                >
                    <FiX size={16} />
                </button>
            </div>

            {errorMessage && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-200 whitespace-pre-line">
                    {errorMessage}
                </div>
            )}

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
                    <p className="mt-1 text-[11px] text-white/35">Max size: 6 MB</p>
                    {imageError && (
                        <p className="mt-1 text-xs text-red-400">{imageError}</p>
                    )}
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="Group session preview"
                            className="mt-3 h-24 w-full rounded-lg object-cover"
                        />
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
                    <button
                        type="submit"
                        disabled={isSaving || !!imageError}
                        className={`${modalPrimaryBtn} w-full disabled:opacity-60`}
                        style={modalPrimaryBtnStyle}
                    >
                        <FiCheck size={14} />
                        {isSaving ? "Saving..." : initial ? "Save changes" : "Create Session"}
                    </button>
                </div>
            </form>
        </AnimatedModal>
    );
};

// ─────────────────────────────────────────────
// Delete Confirm Modals
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
            <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"
                style={{ background: "rgba(255,255,255,0.06)" }}
            >
                <FiX size={16} />
            </button>
        </div>

        <div className="rounded-xl px-4 py-4 bg-neutral-900">
            <p className="text-sm leading-relaxed text-white/70">
                This will permanently remove your one-on-one session from your public mentor profile.
            </p>
        </div>

        <div className="mt-5 flex gap-3">
            <button type="button" onClick={onClose} className={modalSecondaryBtn} style={modalSecondaryBtnStyle}>
                Cancel
            </button>
            <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className={`${modalPrimaryBtn} disabled:opacity-60`}
                style={{ ...modalPrimaryBtnStyle, background: "#f87171" }}
            >
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
            <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"
                style={{ background: "rgba(255,255,255,0.06)" }}
            >
                <FiX size={16} />
            </button>
        </div>

        <div className="rounded-xl px-4 py-4 bg-neutral-900">
            <p className="text-sm leading-relaxed text-white/70">
                This will permanently remove this group session and make it unavailable to new registrations.
            </p>
        </div>

        <div className="mt-5 flex gap-3">
            <button type="button" onClick={onClose} className={modalSecondaryBtn} style={modalSecondaryBtnStyle}>
                Cancel
            </button>
            <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className={`${modalPrimaryBtn} disabled:opacity-60`}
                style={{ ...modalPrimaryBtnStyle, background: "#f87171" }}
            >
                <FiTrash2 size={14} />
                {isDeleting ? "Deleting..." : "Delete"}
            </button>
        </div>
    </AnimatedModal>
);

// ─────────────────────────────────────────────
// Start Group Session Modal
// ─────────────────────────────────────────────
const StartGroupSessionModal = ({
    session,
    onClose,
    onConfirm,
    isStarting,
}: {
    session: GroupSession | null;
    onClose: () => void;
    onConfirm: () => void;
    isStarting?: boolean;
}) => (
    <AnimatedModal onClose={onClose}>
        <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Start Group Session</h3>
            <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"
                style={{ background: "rgba(255,255,255,0.06)" }}
            >
                <FiX size={16} />
            </button>
        </div>

        {session && (
            <div className="mb-4 rounded-xl bg-neutral-900 px-4 py-3">
                <p className="text-sm font-bold text-white">{session.name}</p>
                <p className="mt-0.5 text-xs text-white/40">
                    {getRegisteredCount(session)} of {session.capacity} spots filled
                </p>
            </div>
        )}

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <FiAlertTriangle size={15} />
                Registration will close
            </p>
            <p className="mt-2 text-sm leading-relaxed text-amber-100/80">
                Once you start this session, no one else will be able to register for it, even if there are spots
                left. This action can't be undone.
            </p>
        </div>

        <div className="mt-5 flex gap-3">
            <button
                type="button"
                onClick={onClose}
                disabled={isStarting}
                className={modalSecondaryBtn}
                style={modalSecondaryBtnStyle}
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={onConfirm}
                disabled={isStarting}
                className={`${modalPrimaryBtn} disabled:opacity-60`}
                style={{ ...modalPrimaryBtnStyle, background: "#a6ff00" }}
            >
                <FiPlay size={14} />
                {isStarting ? "Starting..." : "Start Session"}
            </button>
        </div>
    </AnimatedModal>
);

// ─────────────────────────────────────────────
// Join / Done Session Modals
// ─────────────────────────────────────────────
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
            <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"
                style={{ background: "rgba(255,255,255,0.06)" }}
            >
                <FiX size={16} />
            </button>
        </div>

        <div className="flex flex-col items-center rounded-xl px-4 py-6 bg-neutral-900">
            {booking.menteeAvatar ? (
                <img
                    src={booking.menteeAvatar}
                    alt={booking.menteeName}
                    className="h-16 w-16 rounded-full object-cover"
                    style={{ border: "2px solid rgba(255,255,255,0.15)" }}
                />
            ) : (
                <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-white/50"
                    style={{ background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.15)" }}
                >
                    <FiUser size={28} />
                </div>
            )}
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
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                >
                    <FiX size={16} />
                </button>
            </div>

            <p className="mb-3 text-xs text-white/40">
                Leave a quick note about your session with <span className="text-white/70">{menteeName}</span>. This
                helps you track progress over time.
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
                    className="w-full resize-none rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25 bg-neutral-900"
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
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                >
                    <FiX size={16} />
                </button>
            </div>

            <div className="mb-4 h-36 w-full overflow-hidden rounded-xl">
                {session.image ? (
                    <img src={session.image} alt={session.name} className="h-full w-full object-cover" />
                ) : (
                    <div
                        className="flex h-full w-full items-center justify-center text-white/40"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        No image
                    </div>
                )}
            </div>

            <h4 className="text-base font-bold text-white">{session.name}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-white/55">{session.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg px-3 py-2.5 bg-neutral-900">
                    <p className="flex items-center gap-1.5 text-white/40">
                        <FiCalendar size={12} /> Dates
                    </p>
                    <p className="mt-1 font-semibold text-white/85">
                        {formatDate(session.startDate)} – {formatDate(session.endDate)}
                    </p>
                </div>
                <div className="rounded-lg px-3 py-2.5 bg-neutral-900">
                    <p className="flex items-center gap-1.5 text-white/40">
                        <FiClock size={12} /> Daily Time
                    </p>
                    <p className="mt-1 font-semibold text-white/85">{formatTime(session.dailyTime)}</p>
                </div>
                <div className="rounded-lg px-3 py-2.5 bg-neutral-900">
                    <p className="text-white/40">Price</p>
                    <p className="mt-1 font-semibold text-white/85">{formatPrice(session.price)}</p>
                </div>
                <div className="rounded-lg px-3 py-2.5 bg-neutral-900">
                    <p className="text-white/40">Capacity</p>
                    <p className="mt-1 font-semibold text-white/85">
                        {total}/{session.capacity} · {spotsLeft > 0 ? `${spotsLeft} left` : "Full"}
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-white/70">Registrants ({total})</p>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {session.registrants.length === 0 && (
                        <p className="text-xs text-white/35">No one has registered yet.</p>
                    )}
                    {session.registrants.map((r) => (
                        <div
                            key={r.id}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
                            style={{ background: "rgba(255,255,255,0.03)" }}
                        >
                            {r.avatar ? (
                                <img src={r.avatar} alt={r.name} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                                <div
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white/60"
                                    style={{ background: "rgba(255,255,255,0.08)" }}
                                >
                                    {(r.name || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <p className="text-sm text-white/80">{r.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-5">
                <button
                    type="button"
                    onClick={onClose}
                    className={modalSecondaryBtn}
                    style={{ ...modalSecondaryBtnStyle, width: "100%" }}
                >
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
    const [oneOnOne, setOneOnOne] = useState<OneOnOneSession | null>(null);
    const [groups, setGroups] = useState<GroupSession[]>([]);
    const { addToast } = useGlobalContext();

    const { myProfile } = useGetMyUserProfile();
    const userProfile = myProfile?.data;

    const [showOneOnOneForm, setShowOneOnOneForm] = useState(false);
    const [editingOneOnOne, setEditingOneOnOne] = useState<OneOnOneSession | null>(null);
    const [oneOnOneFormError, setOneOnOneFormError] = useState<string>("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupSession | null>(null);
    const [groupFormError, setGroupFormError] = useState<string>("");
    const [showGroupDeleteConfirm, setShowGroupDeleteConfirm] = useState(false);
    const [groupDeleteId, setGroupDeleteId] = useState("");

    const [showGroupStartConfirm, setShowGroupStartConfirm] = useState(false);
    const [groupStartId, setGroupStartId] = useState("");

    const [viewingGroup, setViewingGroup] = useState<GroupSession | null>(null);

    const [showJoinClass, setShowJoinClass] = useState(false);
    const [showDoneSession, setShowDoneSession] = useState(false);
    const [acceptOpen, setAcceptOpen] = useState(false);
    const [declineOpen, setDeclineOpen] = useState(false);
    const [acceptNote, setAcceptNote] = useState("");
    const [declineReason, setDeclineReason] = useState("");

    const canCreateOneOnOne = !oneOnOne;
    const canCreateGroup = groups.length < 3;

    const { mutate: createIndividualSession, isPending: isCreatingIndividualSession } = useCreateIndividualSession();
    const { mutate: editIndividualSession, isPending: isEditingIndividualSession } = useEditIndividualSession(
        oneOnOne?.id ?? ""
    );
    const { mutate: deleteIndividualSession, isPending: isDeletingIndividualSession } = useDeleteIndividualSession(
        oneOnOne?.id ?? ""
    );
    const { mutate: createGroupSession, isPending: isCreatingGroupSession } = useCreateGroupSession();
    const { mutate: editGroupSession, isPending: isEditingGroupSession } = useEditGroupSession(
        editingGroup?.id ?? ""
    );
    const { mutate: deleteGroupSession, isPending: isDeletingGroupSession } = useDeleteGroupSession(groupDeleteId);
    const { mutate: startGroupSession, isPending: isStartingGroupSession } = useStartGroupSession(groupStartId);
    const { mentorIndividualSession, isLoading: isloadingMentorIndividualSession } = useGetMentorIndividualSession();
    const { mentorGroupSessions, isLoading: isLoadingMentorGroupSessions } = useGetMentorGroupSessions();
    const bookingId = oneOnOne?.booking?.id ?? "";
    const { mutate: acceptBooking, isPending: isAcceptingBooking } = useAcceptBooking(bookingId);
    const { mutate: rejectBooking, isPending: isRejectingBooking } = useRejectBooking(bookingId);

    const apiOneOnOneSession = unwrapIndividualSession(mentorIndividualSession?.data);

    const startingGroup = groups.find((g) => g.id === groupStartId) ?? null;

    const isAnyMutationPending =
        isCreatingIndividualSession ||
        isEditingIndividualSession ||
        isDeletingIndividualSession ||
        isCreatingGroupSession ||
        isEditingGroupSession ||
        isDeletingGroupSession ||
        isStartingGroupSession ||
        isAcceptingBooking ||
        isRejectingBooking;

    const isCreatingOrEditing =
        isCreatingIndividualSession ||
        isEditingIndividualSession ||
        isCreatingGroupSession ||
        isEditingGroupSession;

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
                    setOneOnOneFormError("");
                    setShowOneOnOneForm(false);
                    setEditingOneOnOne(null);
                },
                onError: (error: unknown) => {
                    const apiError = error as any;
                    const message = formatModalValidationErrors(apiError?.response?.data ?? error);
                    setOneOnOneFormError(message);
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
                setOneOnOneFormError("");
                addToast("1:1 session created successfully", "success");
                setShowOneOnOneForm(false);
                setEditingOneOnOne(null);
            },
            onError: (error: unknown) => {
                const apiError = error as any;
                const message = formatModalValidationErrors(apiError?.response?.data ?? error);
                setOneOnOneFormError(message);
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
            ? () =>
                editGroupSession(formData, {
                    onSuccess: () => {
                        setGroupFormError("");
                        addToast("Group session updated", "success");
                        setShowGroupForm(false);
                        setEditingGroup(null);
                    },
                    onError: (error: any) => {
                        const apiError = error as any;
                        const message = formatModalValidationErrors(apiError?.response?.data ?? error);
                        setGroupFormError(message);
                        addToast(flattenApiErrors(apiError?.response?.data ?? error), "error");
                    },
                })
            : () =>
                createGroupSession(formData, {
                    onSuccess: () => {
                        setGroupFormError("");
                        addToast("Group session created", "success");
                        setShowGroupForm(false);
                        setEditingGroup(null);
                    },
                    onError: (error: any) => {
                        const apiError = error as any;
                        const message = formatModalValidationErrors(apiError?.response?.data ?? error);
                        setGroupFormError(message);
                        addToast(flattenApiErrors(apiError?.response?.data ?? error), "error");
                    },
                });

        requestFn();
    };

    const handleDeleteOneOnOne = () => {
        if (oneOnOne) setShowDeleteConfirm(true);
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

    const handleStartGroup = (id: string) => {
        setGroupStartId(id);
        setShowGroupStartConfirm(true);
    };

    const confirmStartGroup = () => {
        if (!groupStartId) return;

        startGroupSession(
            {},
            {
                onSuccess: () => {
                    // Optimistic update; the refetch will overwrite this with the server value.
                    // Change "ongoing" to whatever status your backend returns after a session starts.
                    setGroups((prev) =>
                        prev.map((g) => (g.id === groupStartId ? { ...g, status: "ongoing" } : g))
                    );
                    addToast("Group session started", "success");
                    setShowGroupStartConfirm(false);
                    setGroupStartId("");
                },
                onError: (error: unknown) => {
                    const apiError = error as any;
                    addToast(flattenApiErrors(apiError?.response?.data ?? error), "error");
                    setShowGroupStartConfirm(false);
                    setGroupStartId("");
                },
            }
        );
    };

    const handleOpenAccept = () => setAcceptOpen(true);
    const handleOpenDecline = () => setDeclineOpen(true);

    const handleConfirmAccept = () => {
        if (!oneOnOne?.booking || isAcceptingBooking || !bookingId) return;
        acceptBooking(
            { session_type: "individual", note: acceptNote },
            {
                onSuccess: () => {
                    setOneOnOne({
                        ...oneOnOne,
                        booking: { ...oneOnOne.booking!, status: "accepted" },
                    });
                    setAcceptOpen(false);
                    setAcceptNote("");
                    addToast("Booking accepted", "success");
                },
                onError: (err: unknown) => {
                    const apiError = err as any;
                    addToast(flattenApiErrors(apiError?.response?.data ?? err), "error");
                },
            }
        );
    };

    const handleConfirmDecline = () => {
        if (!oneOnOne?.booking || isRejectingBooking || !bookingId) return;
        rejectBooking(
            { session_type: "individual", reason: declineReason },
            {
                onSuccess: () => {
                    setOneOnOne({ ...oneOnOne, booking: null });
                    setDeclineOpen(false);
                    setDeclineReason("");
                    addToast("Booking declined", "success");
                },
                onError: (err: unknown) => {
                    const apiError = err as any;
                    addToast(flattenApiErrors(apiError?.response?.data ?? err), "error");
                },
            }
        );
    };

    const handleJoinClass = () => setShowJoinClass(true);

    const handleDoneWithSession = () => {
        setShowJoinClass(false);
        setShowDoneSession(true);
    };

    const handleSubmitNote = (_note: string) => {
        if (oneOnOne) {
            setOneOnOne({ ...oneOnOne, booking: null });
        }
        setShowDoneSession(false);
    };

    return (
        <div>
            <LoadingOverlay
                visible={
                    isAnyMutationPending ||
                    isloadingMentorIndividualSession ||
                    isLoadingMentorGroupSessions || isCreatingGroupSession ||
                    isCreatingIndividualSession
                }
            />

            {/* Progress bar while creating / editing */}
            {isCreatingOrEditing && (
                <ProgressBar
                    label={
                        isCreatingIndividualSession || isCreatingGroupSession
                            ? "Creating session..."
                            : "Saving changes..."
                    }
                />
            )}

            <div className="mb-6">
                <h2 className="text-xl font-bold text-white sm:text-2xl">My Sessions</h2>
                <p className="text-sm text-white/40">Create & manage your 1-1 and Group mentoring sessions.</p>
            </div>

            {/* One-on-One */}
            <section className="mb-10">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white/80">
                        <FiUser size={15} className="text-[#a6ff00]" />
                        1-1 Session
                        <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white/50"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                            {oneOnOne ? "1 / 1" : "0 / 1"}
                        </span>
                    </h3>
                    {canCreateOneOnOne && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingOneOnOne(null);
                                setShowOneOnOneForm(true);
                            }}
                            className="flex bg-white items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold text-black"
                        >
                            <FiPlus size={13} /> Create
                        </button>
                    )}
                </div>

                {oneOnOne ? (
                    <OneOnOneCard
                        session={oneOnOne}
                        onEdit={() => {
                            setEditingOneOnOne(oneOnOne);
                            setShowOneOnOneForm(true);
                        }}
                        onDelete={handleDeleteOneOnOne}
                        onAcceptBooking={handleOpenAccept}
                        onDeclineBooking={handleOpenDecline}
                        onJoinClass={handleJoinClass}
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
                                : () => {
                                    setEditingOneOnOne(null);
                                    setShowOneOnOneForm(true);
                                }
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
                        <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white/50"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                            {groups.length} / 3
                        </span>
                    </h3>
                    {canCreateGroup && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingGroup(null);
                                setShowGroupForm(true);
                            }}
                            className="flex bg-white items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold text-black"
                        >
                            <FiPlus size={13} /> Create
                        </button>
                    )}
                </div>

                {groups.length === 0 ? (
                    <EmptyState
                        label="No group sessions yet. You can create up to 3."
                        onCreate={() => {
                            setEditingGroup(null);
                            setShowGroupForm(true);
                        }}
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {groups.map((g) => (
                            <GroupCard
                                key={g.id}
                                session={g}
                                onEdit={() => {
                                    setEditingGroup(g);
                                    setShowGroupForm(true);
                                }}
                                onDelete={() => handleDeleteGroup(g.id)}
                                onView={() => setViewingGroup(g)}
                                onStart={() => handleStartGroup(g.id)}
                            />
                        ))}
                    </div>
                )}

                {!canCreateGroup && groups.length > 0 && (
                    <p className="mt-3 text-center text-xs text-white/30">Maximum of 3 group sessions reached.</p>
                )}
            </section>

            {/* Modals */}
            {showOneOnOneForm && (
                <OneOnOneFormModal
                    initial={editingOneOnOne}
                    onClose={() => {
                        setOneOnOneFormError("");
                        setShowOneOnOneForm(false);
                        setEditingOneOnOne(null);
                    }}
                    onSave={handleSaveOneOnOne}
                    isSaving={isCreatingIndividualSession || isEditingIndividualSession}
                    errorMessage={oneOnOneFormError}
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
                    onClose={() => {
                        setShowGroupDeleteConfirm(false);
                        setGroupDeleteId("");
                    }}
                    onConfirm={confirmDeleteGroup}
                    isDeleting={isDeletingGroupSession}
                />
            )}
            {showGroupStartConfirm && (
                <StartGroupSessionModal
                    session={startingGroup}
                    onClose={() => {
                        setShowGroupStartConfirm(false);
                        setGroupStartId("");
                    }}
                    onConfirm={confirmStartGroup}
                    isStarting={isStartingGroupSession}
                />
            )}
            {showGroupForm && (
                <GroupFormModal
                    initial={editingGroup}
                    onClose={() => {
                        setGroupFormError("");
                        setShowGroupForm(false);
                        setEditingGroup(null);
                    }}
                    onSave={handleSaveGroup}
                    isSaving={isCreatingGroupSession || isEditingGroupSession}
                    errorMessage={groupFormError}
                />
            )}
            {viewingGroup && (
                <GroupDetailsModal session={viewingGroup} onClose={() => setViewingGroup(null)} />
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
            {acceptOpen && oneOnOne?.booking && (
                <AnimatedModal onClose={() => setAcceptOpen(false)}>
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-base font-bold text-white">Accept Booking</h3>
                        <button
                            type="button"
                            onClick={() => setAcceptOpen(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                            <FiX size={16} />
                        </button>
                    </div>

                    <div className="mb-4 text-center gap-3 rounded-xl px-4 pt-4">
                        {oneOnOne.booking.menteeAvatar ? (
                            <img
                                src={oneOnOne.booking.menteeAvatar}
                                alt={oneOnOne.booking.menteeName}
                                className="h-24 w-24 shrink-0 p-1 border-3 border-neutral-800 rounded-full object-cover m-auto"
                            />
                        ) : (
                            <div
                                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-white/50 m-auto"
                                style={{ background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.15)" }}
                            >
                                <FiUser size={20} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-base font-bold text-white truncate pt-1">
                                {[oneOnOne.booking.menteeFirstName, oneOnOne.booking.menteeLastName]
                                    .filter(Boolean)
                                    .join(" ") || oneOnOne.booking.menteeName}
                            </p>
                            <p className="text-sm text-neutral-500">Mentee</p>
                        </div>
                    </div>

                    <textarea
                        value={acceptNote}
                        onChange={(e) => setAcceptNote(e.target.value)}
                        className="h-28 w-full rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white/90 outline-none"
                        placeholder="Optional note"
                    />
                    <p className="mt-1 text-xs text-white/40">Add an optional note for the mentee.</p>

                    <div className="mt-5 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setAcceptOpen(false)}
                            disabled={isAcceptingBooking}
                            className={modalSecondaryBtn}
                            style={modalSecondaryBtnStyle}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmAccept}
                            disabled={isAcceptingBooking}
                            className={`${modalPrimaryBtn} disabled:opacity-60`}
                            style={modalPrimaryBtnStyle}
                        >
                            {isAcceptingBooking ? "Accepting..." : "Confirm"}
                        </button>
                    </div>
                </AnimatedModal>
            )}

            {declineOpen && oneOnOne?.booking && (
                <AnimatedModal onClose={() => setDeclineOpen(false)}>
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Decline Booking</h3>
                        <button
                            type="button"
                            onClick={() => setDeclineOpen(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                            <FiX size={16} />
                        </button>
                    </div>

                    <p className="mb-3 text-xs text-white/40">Provide a reason for declining this booking.</p>

                    <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        className="h-28 w-full rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white/90 outline-none"
                        placeholder="Reason for declining"
                    />

                    <div className="mt-5 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setDeclineOpen(false)}
                            disabled={isRejectingBooking}
                            className={modalSecondaryBtn}
                            style={modalSecondaryBtnStyle}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDecline}
                            disabled={isRejectingBooking}
                            className={`${modalPrimaryBtn} disabled:opacity-60`}
                            style={{ ...modalPrimaryBtnStyle, background: "#f87171" }}
                        >
                            {isRejectingBooking ? "Declining..." : "Confirm"}
                        </button>
                    </div>
                </AnimatedModal>
            )}
        </div>
    );
};

export default MentorSessions;
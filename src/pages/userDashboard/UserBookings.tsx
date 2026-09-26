import { useMemo, useState } from "react";
import {
    FiCalendar,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiInfo,
    FiUser,
    FiUsers,
    FiVideo,
    FiX,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useGetUserSession } from "../../hooks/queries/allQueriess";
import type { ApiBooking, ApiBookingsResponse } from "../../types/bookingShare";
import { normalizeStatus } from "../../types/bookingShare";

const TABS = [
    { key: "pending", label: "Pending" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "declined", label: "Cancelled" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_STYLE: Record<TabKey, { color: string; bg: string; icon: React.ReactNode }> = {
    pending: { color: "#fbbf24", bg: "rgba(251,191,36,0.05)", icon: <FiClock size={12} /> },
    upcoming: { color: "#a6ff00", bg: "rgba(166,255,0,0.05)", icon: <FiVideo size={12} /> },
    completed: { color: "#7dd3fc", bg: "rgba(125,211,252,0.05)", icon: <FiCheckCircle size={12} /> },
    declined: { color: "#f87171", bg: "rgba(248,113,113,0.05)", icon: <FiX size={12} /> },
};

const toTabKey = (raw?: string | null): TabKey => {
    const value = String(raw ?? "").trim().toLowerCase();

    try {
        const normalized = normalizeStatus(raw as any);
        if (
            normalized === "pending" ||
            normalized === "upcoming" ||
            normalized === "completed" ||
            normalized === "declined"
        ) {
            if (value === "accepted" || value === "confirmed" || value === "active" || value === "ongoing") {
                return "upcoming";
            }
            return normalized as TabKey;
        }
    } catch {
        // fall through
    }

    if (value === "accepted" || value === "confirmed" || value === "upcoming" || value === "active") {
        return "upcoming";
    }
    if (value === "completed" || value === "done" || value === "finished") {
        return "completed";
    }
    if (value === "declined" || value === "cancelled" || value === "canceled" || value === "rejected") {
        return "declined";
    }
    return "pending";
};

const getRawStatus = (booking: any): string => {
    return booking?.session_status || booking?.status || booking?.status_display || "pending";
};

const getSessionType = (booking: any): "group" | "individual" => {
    const raw = String(
        booking?.session_type || booking?.session_type_display || booking?.type || "individual"
    )
        .trim()
        .toLowerCase();
    if (raw === "group" || raw === "group_session" || raw === "group session") return "group";
    return "individual";
};

const getBookingMentorName = (booking: any) => {
    if (booking?.mentor?.first_name || booking?.mentor?.last_name) {
        return `${booking.mentor.first_name ?? ""} ${booking.mentor.last_name ?? ""}`.trim();
    }
    if (typeof booking?.mentor_name === "string" && booking.mentor_name.trim()) {
        return booking.mentor_name.trim();
    }
    return "Mentor";
};

const getBookingMentorAvatar = (booking: any) => {
    if (booking?.mentor?.avatar) return booking.mentor.avatar;
    if (typeof booking?.mentor_avatar === "string") return booking.mentor_avatar;
    return null;
};

const getBookingSessionTitle = (booking: any) => {
    if (getSessionType(booking) === "group") {
        return (
            booking.session_name ||
            booking.name ||
            booking.title ||
            booking.group_session_name ||
            "Group Session"
        );
    }
    return (
        booking.session_name ||
        booking.title ||
        booking.notes ||
        booking.note ||
        "1:1 Session with Mentor"
    );
};

const getBookingStatusLabel = (booking: any) => {
    const raw = getRawStatus(booking);
    const tab = toTabKey(raw);
    if (tab === "upcoming" && String(raw).toLowerCase() === "accepted") return "Accepted";
    if (tab === "pending") return "Pending";
    if (tab === "upcoming") return "Upcoming";
    if (tab === "completed") return "Completed";
    if (tab === "declined") return "Cancelled";
    return raw || "Pending";
};

const getBookingTypeLabel = (booking: any) => {
    return getSessionType(booking) === "group" ? "Group session" : "1:1 session";
};

const formatPrice = (amount: unknown) => {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "---";
    return `₦${n.toLocaleString()}`;
};

const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = String(iso).includes("T") ? new Date(iso) : new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (t?: string | null) => {
    if (!t) return "—";
    const raw = String(t).includes("T") ? String(t).split("T")[1]?.slice(0, 5) : String(t).slice(0, 5);
    const [hStr, mStr] = (raw || "").split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    if (!Number.isFinite(h)) return String(t);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m || 0).padStart(2, "0")} ${ampm}`;
};

const formatDuration = (mins?: number | string | null) => {
    const n = Number(mins);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n < 60) return `${n} mins`;
    const h = Math.floor(n / 60);
    const m = n % 60;
    return m === 0 ? `${h} hr${h > 1 ? "s" : ""}` : `${h}h ${m}m`;
};

const getGroupMeta = (booking: any) => {
    const startDate =
        booking.start_date ||
        booking.session_start_date ||
        booking.group_start_date ||
        booking.booked_for ||
        null;
    const endDate =
        booking.end_date ||
        booking.session_end_date ||
        booking.group_end_date ||
        null;
    const dailyTime =
        booking.daily_time ||
        booking.session_time ||
        booking.time ||
        booking.group_daily_time ||
        null;
    const capacity = Number(
        booking.max_participants ?? booking.capacity ?? booking.group_capacity ?? 0
    );
    const spotsLeft = Number(
        booking.spots_left ?? (capacity > 0 ? capacity : 0)
    );
    return { startDate, endDate, dailyTime, capacity, spotsLeft };
};

const getIndividualMeta = (booking: any) => {
    const durationMinutes =
        booking.duration_minutes ?? booking.session_duration_minutes ?? booking.duration ?? null;
    const daysDuration =
        booking.duration_days ?? booking.days_duration ?? booking.session_days ?? 7;
    return {
        durationMinutes,
        daysDuration: Number(daysDuration) || 7,
        durationLabel: formatDuration(durationMinutes),
    };
};

const BookingRow: React.FC<{ booking: any; onClick: () => void }> = ({ booking, onClick }) => {
    const tabKey = toTabKey(getRawStatus(booking));
    const statusStyle = STATUS_STYLE[tabKey];
    const mentorName = getBookingMentorName(booking);
    const mentorAvatar = getBookingMentorAvatar(booking);
    const sessionType = getSessionType(booking);
    const isGroup = sessionType === "group";
    const price =
        booking.session_price ??
        booking.price ??
        booking.price_per_participant ??
        booking.amount;

    const groupMeta = isGroup ? getGroupMeta(booking) : null;
    const individualMeta = !isGroup ? getIndividualMeta(booking) : null;

    // Group sessions prefer session_image; 1:1 keeps mentor avatar
    const displayImage = isGroup
        ? booking.session_image ||
        booking.banner ||
        booking.banner_url ||
        booking.image ||
        mentorAvatar
        : mentorAvatar;

    return (
        <div
            className="overflow-hidden rounded-lg transition-colors hover:bg-white/5"
            style={{ background: cardBg, border: cardBorder }}
        >
            {/* Status bar */}
            <div
                className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold sm:px-5"
                style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                }}
            >
                {statusStyle.icon}
                {getBookingStatusLabel(booking)}
                <span
                    className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold capitalize"
                    style={{
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.7)",
                    }}
                >
                    {isGroup ? "Group" : "1:1"}
                </span>
                {tabKey === "pending" && (
                    <span className="ml-auto text-[11px] font-medium italic text-white/30">
                        Awaiting mentor
                    </span>
                )}
            </div>

            {/* Main content */}
            <div className="flex items-center gap-4 p-3 sm:gap-5 sm:p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
                    {displayImage ? (
                        <img
                            src={displayImage}
                            alt={isGroup ? getBookingSessionTitle(booking) : mentorName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div
                            className="flex h-full w-full items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.03)" }}
                        >
                            <span className="text-sm font-bold text-white/80">
                                {isGroup
                                    ? (getBookingSessionTitle(booking).charAt(0) || "G").toUpperCase()
                                    : mentorName.charAt(0).toUpperCase() || "M"}
                            </span>
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-white sm:text-base">
                        {isGroup ? getBookingSessionTitle(booking) : mentorName}
                    </h3>
                    <p className="truncate text-xs text-white/60 sm:text-sm">
                        {isGroup ? booking?.description : getBookingSessionTitle(booking)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                        {isGroup && groupMeta ? (
                            <>
                                <span className="flex items-center gap-1.5">
                                    <FiCalendar size={12} />
                                    {groupMeta.startDate
                                        ? `${formatDate(groupMeta.startDate)}${groupMeta.endDate
                                            ? ` – ${formatDate(groupMeta.endDate)}`
                                            : ""
                                        }`
                                        : "Dates TBA"}
                                </span>
                                {groupMeta.dailyTime && (
                                    <span className="flex items-center gap-1.5">
                                        <FiClock size={12} />
                                        {formatTime(groupMeta.dailyTime)}
                                    </span>
                                )}
                                {groupMeta.capacity > 0 && (
                                    <span className="flex items-center gap-1.5">
                                        <FiUsers size={12} />
                                        {groupMeta.spotsLeft > 0
                                            ? `${groupMeta.spotsLeft} spots left`
                                            : "Full"}
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                {individualMeta?.durationLabel && (
                                    <span className="flex items-center gap-1.5">
                                        <FiClock size={12} />
                                        {individualMeta.durationLabel}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <FiCalendar size={12} />
                                    {individualMeta?.daysDuration ?? 7} days
                                </span>
                            </>
                        )}
                        <span className="flex items-center gap-1.5 text-white">
                            {formatPrice(price)}
                        </span>
                    </div>
                </div>
            </div>

            {/* View button – full width below, white */}
            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                <button
                    type="button"
                    onClick={onClick}
                    className="flex lg:w-1/4 ml-auto w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-black transition-transform hover:scale-[1.01]"
                >
                    View
                    <FiChevronRight size={13} />
                </button>
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
    <div
        className="flex flex-col items-center justify-center rounded-xl px-4 py-12 text-center"
        style={{ background: cardBg, border: "1px dashed rgba(255,255,255,0.1)" }}
    >
        <p className="text-sm text-white/40">{label}</p>
    </div>
);

const RowSkeleton: React.FC = () => (
    <div
        className="flex items-center gap-4 rounded-xl p-3 sm:gap-5 sm:p-4"
        style={{ background: cardBg, border: cardBorder }}
    >
        <div
            className="h-16 w-16 shrink-0 animate-pulse rounded-lg sm:h-20 sm:w-20"
            style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div className="flex-1 space-y-2">
            <div className="h-3 w-16 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="h-4 w-40 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="h-3 w-56 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
    </div>
);

/* ─── Daily Check-in Modal (with open/close animation) ─── */
const DailyCheckInModal: React.FC<{
    open: boolean;
    isClosing?: boolean;
    onClose: () => void;
    onSubmit: (date: string, time: string) => void;
}> = ({ open, isClosing = false, onClose, onSubmit }) => {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    if (!open) return null;

    return (
        <div
            className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"
                }`}
            onClick={onClose}
            style={{
                animation: isClosing
                    ? "modalFadeOut 0.22s ease-out forwards"
                    : "modalFadeIn 0.22s ease-out forwards",
            }}
        >
            <div
                className={`w-full max-w-md rounded-2xl p-6 shadow-2xl transition-all duration-300 ${isClosing ? "translate-y-3 scale-[0.98] opacity-0" : "translate-y-0 scale-100 opacity-100"
                    }`}
                style={{
                    background: "rgba(10,13,9,0.55)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    animation: isClosing
                        ? "modalPanelOut 0.22s ease-out forwards"
                        : "modalPanelIn 0.22s ease-out forwards",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">Daily check-in</h3>
                        <p className="text-xs text-white/40">
                            Select the date and time you attended today’s class.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 hover:text-white"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-white/35">
                            Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
                            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-white/35">
                            Time
                        </label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
                            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-white/80"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (!date || !time) return;
                            onSubmit(date, time);
                            onClose();
                        }}
                        className="flex-1 rounded-lg px-4 py-3 text-sm font-bold text-black"
                        style={{ background: "#a6ff00" }}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

const BookingDetailModal: React.FC<{
    booking: any;
    isClosing?: boolean;
    onClose: () => void;
}> = ({ booking, isClosing = false, onClose }) => {
    const rawStatus = getRawStatus(booking);
    const tabKey = toTabKey(rawStatus);
    const statusStyle = STATUS_STYLE[tabKey];
    const mentorName = getBookingMentorName(booking);
    const mentorAvatar = getBookingMentorAvatar(booking);
    const sessionTitle = getBookingSessionTitle(booking);
    const sessionType = getSessionType(booking);
    const isGroup = sessionType === "group";
    const sessionTypeLabel = getBookingTypeLabel(booking);

    const [checkInOpen, setCheckInOpen] = useState(false);
    const [checkInClosing, setCheckInClosing] = useState(false);

    const groupMeta = isGroup ? getGroupMeta(booking) : null;
    const individualMeta = !isGroup ? getIndividualMeta(booking) : null;
    const price =
        booking.session_price ??
        booking.price ??
        booking.price_per_participant ??
        booking.amount;
    const meetingLink =
        booking.session_link ||
        booking.meeting_link ||
        booking.meetingLink ||
        null;
    const notes = booking.note || booking.notes || booking.session_notes || null;

    // Group description (shown under title instead of mentor name)
    const groupDescription =
        booking.description ||
        booking.session_description ||
        booking.group_description ||
        booking.notes ||
        booking.note ||
        null;

    // 1:1 time_duration field
    const timeDuration =
        booking.time_duration ||
        booking.duration_minutes ||
        booking.session_duration_minutes ||
        booking.duration ||
        null;
    const timeDurationLabel = formatDuration(timeDuration);

    // Group → session_image; 1:1 → mentor avatar (profile view only, no banner)
    const displayImage = isGroup
        ? booking.session_image ||
        booking.banner ||
        booking.banner_url ||
        booking.image ||
        mentorAvatar
        : mentorAvatar;

    const closeCheckIn = () => {
        if (checkInClosing) return;
        setCheckInClosing(true);
        window.setTimeout(() => {
            setCheckInOpen(false);
            setCheckInClosing(false);
        }, 220);
    };

    const handleCheckInSubmit = (date: string, time: string) => {
        toast(`Daily check-in saved for ${date} at ${time}.`, { type: "success" });
    };

    const isPending = tabKey === "pending";
    const isUpcoming = tabKey === "upcoming";
    const isDeclined = tabKey === "declined";
    const isCompleted = tabKey === "completed";

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"
                }`}
            onClick={onClose}
            style={{
                animation: isClosing
                    ? "modalFadeOut 0.22s ease-out forwards"
                    : "modalFadeIn 0.22s ease-out forwards",
            }}
        >
            <div
                className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl transition-all duration-300 ${isClosing
                    ? "translate-y-3 scale-[0.98] opacity-0"
                    : "translate-y-0 scale-100 opacity-100"
                    }`}
                style={{
                    background: "rgba(10,13,9,0.55)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    animation: isClosing
                        ? "modalPanelOut 0.22s ease-out forwards"
                        : "modalPanelIn 0.22s ease-out forwards",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: profile image + title (no large banner) */}
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            className="h-12 w-12 shrink-0 overflow-hidden rounded-xl"
                            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt={isGroup ? sessionTitle : mentorName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div
                                    className="flex h-full w-full items-center justify-center"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >
                                    <span className="text-sm font-bold text-white/80">
                                        {isGroup
                                            ? (sessionTitle.charAt(0) || "G").toUpperCase()
                                            : mentorName.charAt(0).toUpperCase() || "M"}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold leading-tight text-white">
                                {isGroup ? sessionTitle : mentorName}
                            </h3>
                            {/* Group: description · 1:1: occupation / type */}
                            <p className="truncate text-sm pt-1 text-white/40">
                                {isGroup
                                    ? groupDescription || mentorName
                                    : booking?.mentor?.occupation || sessionTypeLabel}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 hover:text-white"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Status + type pills */}
                <div className="mb-5 flex flex-wrap items-center gap-2">
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                        {statusStyle.icon}
                        {getBookingStatusLabel(booking)}
                    </span>
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.75)",
                        }}
                    >
                        {isGroup ? <FiUsers size={12} /> : <FiUser size={12} />}
                        {sessionTypeLabel}
                    </span>
                </div>

                {/* Title block for 1:1 */}
                {!isGroup && (
                    <>
                        <h4 className="mb-1 text-base font-bold text-white">{sessionTitle}</h4>
                        <p className="mb-4 text-sm text-white/50">{sessionTypeLabel}</p>
                    </>
                )}
                {isGroup && (
                    <p className="mb-4 text-sm text-white/50">{sessionTypeLabel}</p>
                )}

                {/* Meta grid */}
                <div className="mb-5 grid grid-cols-2 gap-3 text-xs">
                    {isGroup && groupMeta ? (
                        <>
                            <div className="rounded-lg px-3 py-2.5 bg-white/5">
                                <p className="flex items-center gap-1.5 text-white/40">
                                    <FiCalendar size={12} /> Start Date
                                </p>
                                <p className="mt-1 font-semibold text-white/85">
                                    {groupMeta.startDate ? formatDate(groupMeta.startDate) : "TBA"}
                                </p>
                            </div>
                            <div className="rounded-lg px-3 py-2.5 bg-white/5">
                                <p className="flex items-center gap-1.5 text-white/40">
                                    <FiCalendar size={12} /> End Date
                                </p>
                                <p className="mt-1 font-semibold text-white/85">
                                    {groupMeta.endDate ? formatDate(groupMeta.endDate) : "TBA"}
                                </p>
                            </div>
                            <div className="rounded-lg px-3 py-2.5 bg-white/5">
                                <p className="flex items-center gap-1.5 text-white/40">
                                    <FiClock size={12} /> Daily Time
                                </p>
                                <p className="mt-1 font-semibold text-white/85">
                                    {formatTime(groupMeta.dailyTime)}
                                </p>
                            </div>
                            <div className="rounded-lg px-3 py-2.5 bg-white/5">
                                <p className="flex items-center gap-1.5 text-white/40">
                                    <FiUsers size={12} /> Capacity
                                </p>
                                <p className="mt-1 font-semibold text-white/85">
                                    {groupMeta.capacity > 0
                                        ? groupMeta.spotsLeft > 0
                                            ? `${groupMeta.spotsLeft} left of ${groupMeta.capacity}`
                                            : "Full"
                                        : "—"}
                                </p>
                            </div>
                            <div className="rounded-lg px-3 py-2.5 bg-white/5 col-span-2">
                                <p className="text-white/40">Price</p>
                                <p className="mt-1 font-semibold text-white/85">
                                    {formatPrice(price)}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="rounded-lg px-3 py-2.5 bg-white/5">
                                <p className="flex items-center gap-1.5 text-white/40">
                                    <FiClock size={12} /> Time Duration
                                </p>
                                <p className="mt-1 font-semibold text-white/85">
                                    {timeDurationLabel ?? individualMeta?.durationLabel ?? "—"}
                                </p>
                            </div>
                            <div className="rounded-lg px-3 py-2.5 bg-white/5">
                                <p className="flex items-center gap-1.5 text-white/40">
                                    <FiCalendar size={12} /> Days
                                </p>
                                <p className="mt-1 font-semibold text-white/85">
                                    {individualMeta?.daysDuration ?? 7} days
                                </p>
                            </div>
                            <div className="rounded-lg px-3 py-2.5 bg-white/5 col-span-2">
                                <p className="text-white/40">Price</p>
                                <p className="mt-1 font-semibold text-white/85">
                                    {formatPrice(price)}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {notes && (
                    <div className="mb-6 overflow-hidden rounded-xl bg-white/5 p-4">
                        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                            <FiInfo size={12} />
                            Notes
                        </p>
                        <p className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap">
                            {notes}
                        </p>
                    </div>
                )}

                <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    {isPending && (
                        <div
                            className="m-auto flex items-center justify-center gap-2.5 rounded-lg px-3.5 py-3 text-sm font-medium"
                            style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24" }}
                        >
                            <FiClock size={15} className="shrink-0" />
                            Waiting for Mentor to accept payment.
                        </div>
                    )}

                    {isUpcoming && (
                        <div className="flex flex-col gap-3">
                            {meetingLink && (
                                <a
                                    href={meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-colors"
                                    style={{ background: "#a6ff00", color: "#000" }}
                                >
                                    <FiVideo size={14} />
                                    Join class
                                </a>
                            )}

                            <button
                                type="button"
                                onClick={() => setCheckInOpen(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-colors"
                                style={{
                                    background: "rgba(255,255,255,0.08)",
                                    color: "rgba(255,255,255,0.85)",
                                }}
                            >
                                <FiCalendar size={14} />
                                Daily check-in
                            </button>
                        </div>
                    )}

                    {isDeclined && (
                        <div
                            className="flex items-center gap-2.5 rounded-lg px-3.5 py-3 text-sm font-medium"
                            style={{
                                background: "rgba(248,113,113,0.08)",
                                border: "1px solid rgba(248,113,113,0.25)",
                                color: "#f87171",
                            }}
                        >
                            <FiX size={15} className="shrink-0" />
                            This session was cancelled or declined.
                        </div>
                    )}

                    {isCompleted && (
                        <div
                            className="flex items-center gap-2.5 rounded-lg px-3.5 py-3 text-sm font-medium"
                            style={{
                                background: "rgba(125,211,252,0.08)",
                                border: "1px solid rgba(125,211,252,0.25)",
                                color: "#7dd3fc",
                            }}
                        >
                            <FiCheckCircle size={15} className="shrink-0" />
                            This session has been completed.
                        </div>
                    )}
                </div>

                <DailyCheckInModal
                    open={checkInOpen}
                    isClosing={checkInClosing}
                    onClose={closeCheckIn}
                    onSubmit={handleCheckInSubmit}
                />
            </div>
        </div>
    );
};

const UserBookings = () => {
    const [tab, setTab] = useState<TabKey>("pending");
    const [selectedBooking, setSelectedBooking] = useState<ApiBooking | null>(null);
    const [detailModalClosing, setDetailModalClosing] = useState(false);
    const [typeFilter, setTypeFilter] = useState<"all" | "individual" | "group">("all");

    const { userSession, isLoading, isError, refetch } = useGetUserSession();

    console.log("This is One on One", userSession?.data?.results);

    const bookings = useMemo<ApiBooking[]>(() => {
        const payload: ApiBookingsResponse | undefined = userSession?.data;
        if (Array.isArray(payload)) {
            return payload;
        }
        if (Array.isArray(payload?.results)) {
            return payload.results;
        }
        if (Array.isArray(userSession?.data)) {
            return userSession.data;
        }
        return [];
    }, [userSession]);

    const filtered = useMemo(() => {
        return bookings.filter((booking) => {
            const matchesTab = toTabKey(getRawStatus(booking)) === tab;
            if (!matchesTab) return false;
            if (typeFilter === "all") return true;
            return getSessionType(booking) === typeFilter;
        });
    }, [bookings, tab, typeFilter]);

    const counts = useMemo(() => {
        let individual = 0;
        let group = 0;
        for (const b of bookings) {
            if (toTabKey(getRawStatus(b)) !== tab) continue;
            if (getSessionType(b) === "group") group += 1;
            else individual += 1;
        }
        return { individual, group, total: individual + group };
    }, [bookings, tab]);

    const closeDetailModal = () => {
        if (detailModalClosing) return;
        setDetailModalClosing(true);
        window.setTimeout(() => {
            setSelectedBooking(null);
            setDetailModalClosing(false);
        }, 220);
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <ToastContainer theme="dark" />
            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">My Bookings</h2>
            <p className="mb-6 text-sm text-white/40">
                Track sessions you&apos;ve booked with mentors. Separate 1:1 and group sessions.
            </p>

            {/* Status tabs */}
            <div className="mb-4 flex flex-wrap gap-2">
                {TABS.map((t) => {
                    const active = tab === t.key;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${active ? "bg-[#a6ff00] text-black" : "text-white/60 hover:text-white"
                                }`}
                            style={active ? undefined : { background: cardBg, border: cardBorder }}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Session type filter */}
            <div className="mb-6 flex flex-wrap gap-2">
                {(
                    [
                        { key: "all", label: `All (${counts.total})` },
                        { key: "individual", label: `1:1 (${counts.individual})` },
                        { key: "group", label: `Group (${counts.group})` },
                    ] as const
                ).map((f) => {
                    const active = typeFilter === f.key;
                    return (
                        <button
                            key={f.key}
                            type="button"
                            onClick={() => setTypeFilter(f.key)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${active ? "bg-white text-black" : "text-white/55 hover:text-white"
                                }`}
                            style={
                                active
                                    ? undefined
                                    : { background: "rgba(255,255,255,0.05)", border: cardBorder }
                            }
                        >
                            {f.key === "individual" && <FiUser size={12} />}
                            {f.key === "group" && <FiUsers size={12} />}
                            {f.label}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3">
                {isLoading ? (
                    <>
                        <RowSkeleton />
                        <RowSkeleton />
                        <RowSkeleton />
                    </>
                ) : isError ? (
                    <div
                        className="flex flex-col items-center justify-center rounded-xl px-4 py-12 text-center"
                        style={{ background: cardBg, border: cardBorder }}
                    >
                        <p className="mb-3 text-sm text-white/40">
                            Couldn&apos;t load your bookings.
                        </p>
                        <Button variant="white" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        label={
                            typeFilter === "all"
                                ? `No ${tab} sessions right now.`
                                : `No ${tab} ${typeFilter === "group" ? "group" : "1:1"} sessions right now.`
                        }
                    />
                ) : (
                    filtered.map((booking) => (
                        <BookingRow
                            key={booking.id}
                            booking={booking}
                            onClick={() => setSelectedBooking(booking)}
                        />
                    ))
                )}
            </div>

            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    isClosing={detailModalClosing}
                    onClose={closeDetailModal}
                />
            )}

            {/* Shared modal keyframes */}
            <style>{`
                @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalFadeOut { from { opacity: 1; } to { opacity: 0; } }
                @keyframes modalPanelIn { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes modalPanelOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(14px) scale(0.98); } }
            `}</style>
        </div>
    );
};

export default UserBookings;
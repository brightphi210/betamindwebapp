export type BookingMentee = {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    given_name: string | null;
    avatar: string | null;
    is_mentor: boolean;
    is_active: boolean;
    created_at: string;
};

export type BookingMentorProfile = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
    nick_name: string;
    occupation: string;
    hourly_rate: number | null;
};

export type ApiBooking = {
    id: number;
    mentee: BookingMentee;
    mentor_profile: BookingMentorProfile;
    title: string;
    description: string;
    subject: string;
    session_type: string;
    session_type_display: string;
    student_acknowledged: boolean;
    mentor_completed: boolean;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    status: string;
    status_display: string;
    session_link: string | null;
    duration: number;
    notes: string;
    total_amount: string;
    created_at: string;
};

export type ApiBookingsResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: ApiBooking[];
};

/**
 * Formats a "HH:MM" (24h) time string as a compact 12h clock time, e.g. "9:20pm".
 */
export const formatTime = (time: string) => {
    if (!time) return "";
    const [hStr, mStr] = time.split(":");
    let hours = parseInt(hStr, 10);
    const minutes = mStr ?? "00";
    const period = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes}${period}`;
};

/**
 * Short date, e.g. "Sep 14, 2026" — used for compact row summaries.
 */
export const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

/**
 * Full day label in the "DD Weekday - MM - YYYY" format used across booking detail views,
 * e.g. "14 Monday - 09 - 2026".
 */
export const formatDayLabel = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return formatSessionDateLabel(d);
};

/**
 * Same "DD Weekday - MM - YYYY" label, but takes a Date directly (used for computed
 * recurring-session dates rather than a raw date string).
 */
export const formatSessionDateLabel = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day} ${weekday} - ${month} - ${year}`;
};

/**
 * `duration` on a booking counts how many times the session recurs on the same weekday,
 * starting from `scheduled_date` (e.g. scheduled on a Monday with duration 4 = 4 Mondays).
 * This returns the actual Date for every occurrence, one week apart.
 */
export const getRecurringSessionDates = (scheduledDate: string, duration: number): Date[] => {
    if (!scheduledDate) return [];
    const base = new Date(`${scheduledDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) return [];
    const count = duration && duration > 0 ? duration : 1;
    const dates: Date[] = [];
    for (let i = 0; i < count; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i * 7);
        dates.push(d);
    }
    return dates;
};

/**
 * Human summary of the recurrence, e.g. "4 Mondays in September".
 */
export const formatRecurringSummary = (scheduledDate: string, duration: number): string => {
    if (!scheduledDate) return "";
    const base = new Date(`${scheduledDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) return "";
    const weekday = base.toLocaleDateString(undefined, { weekday: "long" });
    const month = base.toLocaleDateString(undefined, { month: "long" });
    const count = duration && duration > 0 ? duration : 1;
    return `${count} ${weekday}${count > 1 ? "s" : ""} in ${month}`;
};

export const mentorFullName = (m: BookingMentorProfile) =>
    [m.first_name, m.last_name].filter(Boolean).join(" ") || m.nick_name || "Mentor";

export const menteeDisplayName = (m: BookingMentee) =>
    [m.first_name, m.last_name].filter(Boolean).join(" ") || m.given_name || (m.email ? m.email.split("@")[0] : "Mentee");

// ASSUMPTION: confirm the real status enum against your backend and adjust.
export const normalizeStatus = (
    raw: string
): "pending" | "upcoming" | "completed" | "declined" => {
    const s = (raw || "").toLowerCase();
    if (s === "pending") return "pending";
    if (s === "accepted" || s === "confirmed" || s === "upcoming") return "upcoming";
    if (s === "completed") return "completed";
    if (s === "cancelled" || s === "rejected" || s === "declined") return "declined";
    return "pending";
};

export const flattenErrorMessages = (data: unknown): string => {
    if (!data) return "Something went wrong. Please try again.";
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data.map(flattenErrorMessages).filter(Boolean).join("\n");
    if (typeof data === "object") {
        const messages = Object.entries(data as Record<string, unknown>).flatMap(([key, value]) => {
            const label = key === "non_field_errors" || key === "detail" ? "" : `${key.replace(/_/g, " ")}: `;
            if (Array.isArray(value)) return value.map((v) => `${label}${v}`);
            if (typeof value === "object" && value !== null) return [`${label}${flattenErrorMessages(value)}`];
            return typeof value === "string" ? [`${label}${value}`] : [];
        });
        return messages.filter(Boolean).join("\n") || "Something went wrong. Please try again.";
    }
    return String(data);
};
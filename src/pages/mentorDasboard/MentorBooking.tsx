import { useState } from "react";
import { FiCalendar, FiCheck, FiCheckCircle, FiClock, FiUser, FiVideo, FiX } from "react-icons/fi";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import { useGetMentorSession } from "../../hooks/queries/allQueriess";


type Booking = {
    id: string;
    goal: string;
    description: string;
    mentee: {
        avatar: string;
        first_name: string;
        last_name: string
    }
    date: string;
    time: string;
    status: "incoming" | "upcoming" | "completed" | "declined";
};


const TABS = [
    { key: "incoming", label: "Incoming" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_MAP: Record<Booking["status"], { color: string; bg: string; label: string; icon: React.ReactNode }> = {
    incoming: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", label: "Pending", icon: <FiClock size={12} /> },
    upcoming: { color: "#a6ff00", bg: "rgba(166,255,0,0.1)", label: "Confirmed", icon: <FiVideo size={12} /> },
    completed: { color: "#7dd3fc", bg: "rgba(125,211,252,0.1)", label: "Completed", icon: <FiCheckCircle size={12} /> },
    declined: { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "Declined", icon: <FiX size={12} /> },
};

// ---------- Booking row (matches ProductRow layout from MentorProducts) ----------

const BookingRow: React.FC<{
    booking: Booking;
    onAccept?: () => void;
    onDecline?: () => void;
}> = ({ booking, onAccept, onDecline }) => {
    const statusStyle = STATUS_MAP[booking.status];

    const stop = (fn?: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        fn?.();
    };

    return (
        <div
            className="flex items-center gap-4 rounded-xl p-3 sm:gap-5 sm:p-4"
            style={{ background: cardBg, border: cardBorder }}
        >
            {/* Avatar */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
                {booking.mentee?.avatar ? (
                    <img
                        src={booking.mentee.avatar}
                        alt={booking.mentee.first_name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                        <FiUser size={20} className="text-white/15" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                        <span className="flex items-center gap-1">
                            {statusStyle.icon}
                            {statusStyle.label}
                        </span>
                    </span>
                </div>
                <h3 className="truncate text-sm font-bold text-white sm:text-base">
                    {booking.mentee?.first_name} {booking.mentee?.last_name}
                </h3>
                <p className="truncate text-xs text-white/60 sm:text-sm">{booking.goal}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                    <span className="flex items-center gap-1.5">
                        <FiCalendar size={12} />
                        {booking.date} · {booking.time}
                    </span>
                </div>
            </div>

            {/* Actions */}
            {booking.status === "incoming" && (
                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={stop(onDecline)}
                        aria-label="Decline booking"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/70 transition-colors hover:text-red-400 sm:h-9 sm:w-9"
                        style={{ background: "rgba(248,113,113,0.08)" }}
                    >
                        <FiX size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={stop(onAccept)}
                        aria-label="Accept booking"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a6ff00] transition-colors hover:text-white sm:h-9 sm:w-9"
                        style={{ background: "rgba(166,255,0,0.1)" }}
                    >
                        <FiCheck size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

const BookingRowSkeleton: React.FC = () => (
    <div
        className="flex animate-pulse items-center gap-4 rounded-xl p-3 sm:gap-5 sm:p-4"
        style={{ background: cardBg, border: cardBorder }}
    >
        <div className="h-16 w-16 shrink-0 rounded-lg bg-white/5 sm:h-20 sm:w-20" />
        <div className="flex-1 space-y-2.5">
            <div className="h-3 w-24 rounded bg-white/5" />
            <div className="h-4 w-1/2 rounded bg-white/5" />
            <div className="h-3 w-1/3 rounded bg-white/5" />
        </div>
    </div>
);

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
    <div
        className="flex flex-col items-center justify-center rounded-xl px-4 py-12 text-center"
        style={{ background: cardBg, border: "1px dashed rgba(255,255,255,0.1)" }}
    >
        <p className="text-sm text-white/40">{label}</p>
    </div>
);

const MentorBookings = () => {
    const [tab, setTab] = useState<TabKey>("incoming");

    const { mentorSession, isLoading } = useGetMentorSession();

    // Guard against `mentorSession` (or `.data`) being undefined on first
    // render / before the query resolves — this is what was throwing
    // "Cannot read properties of undefined (reading 'filter')".
    const mentorSessionData: Booking[] = Array.isArray(mentorSession?.data)
        ? mentorSession.data
        : mentorSession?.data?.results ?? [];

    console.log('mentorSessionData', mentorSessionData)

    const filtered = mentorSessionData.filter((b: Booking) => b.status === tab);

    const handleAccept = (id: string) => {
        console.log('id', id)
    };

    const handleDecline = (id: string) => {
        console.log('Id', id)
    };

    return (
        <div>
            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">Bookings</h2>
            <p className="mb-6 text-sm text-white/40">Manage your incoming, upcoming, and past sessions.</p>

            <div className="mb-6 flex flex-wrap gap-2">
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

            <div className="flex flex-col gap-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <BookingRowSkeleton key={i} />)
                ) : filtered.length === 0 ? (
                    <EmptyState label={`No ${tab} sessions right now.`} />
                ) : (
                    filtered.map((booking: Booking) => (
                        <BookingRow
                            key={booking.id}
                            booking={booking}
                            onAccept={() => handleAccept(booking.id)}
                            onDecline={() => handleDecline(booking.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default MentorBookings;
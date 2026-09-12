import { useState } from "react";
import { FiCalendar, FiCheckCircle, FiClock, FiUser, FiVideo, FiX } from "react-icons/fi";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";

type Booking = {
    id: string;
    goal: string;
    description: string;
    mentor: {
        avatar: string;
        first_name: string;
        last_name: string;
    };
    date: string;
    time: string;
    meeting_link?: string | null;
    status: "pending" | "upcoming" | "completed" | "cancelled";
};

// ---------- Dummy data ----------
// TODO: remove this once useGetUserSession (or the real hook) is wired back in.
const DUMMY_BOOKINGS: Booking[] = [
    {
        id: "b1",
        goal: "Career transition into product management",
        description: "First intro call to map out a 90-day plan.",
        mentor: { avatar: "", first_name: "Ada", last_name: "Chen" },
        date: "Sep 12, 2026",
        time: "3:00 PM",
        meeting_link: "https://meet.example.com/ada-chen-b1",
        status: "upcoming",
    },
    {
        id: "b2",
        goal: "Portfolio review",
        description: "Feedback on latest design case studies before job applications.",
        mentor: { avatar: "", first_name: "Marcus", last_name: "Ibe" },
        date: "Sep 15, 2026",
        time: "11:30 AM",
        meeting_link: "https://meet.example.com/marcus-ibe-b2",
        status: "upcoming",
    },
    {
        id: "b3",
        goal: "Mock system design interview",
        description: "Practice round ahead of on-site interviews next week.",
        mentor: { avatar: "", first_name: "Priya", last_name: "Nair" },
        date: "Sep 10, 2026",
        time: "9:00 AM",
        status: "pending",
    },
    {
        id: "b4",
        goal: "Salary negotiation strategy",
        description: "Went through comp bands and how to counter the initial offer.",
        mentor: { avatar: "", first_name: "James", last_name: "Okafor" },
        date: "Aug 29, 2026",
        time: "5:00 PM",
        status: "completed",
    },
    {
        id: "b5",
        goal: "Resume rewrite session",
        description: "Rescheduling conflict — mentor was unavailable.",
        mentor: { avatar: "", first_name: "Lena", last_name: "Fischer" },
        date: "Aug 20, 2026",
        time: "2:00 PM",
        status: "cancelled",
    },
];

const TABS = [
    { key: "pending", label: "Pending" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_MAP: Record<Booking["status"], { color: string; bg: string; label: string; icon: React.ReactNode }> = {
    pending: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", label: "Pending", icon: <FiClock size={12} /> },
    upcoming: { color: "#a6ff00", bg: "rgba(166,255,0,0.1)", label: "Confirmed", icon: <FiVideo size={12} /> },
    completed: { color: "#7dd3fc", bg: "rgba(125,211,252,0.1)", label: "Completed", icon: <FiCheckCircle size={12} /> },
    cancelled: { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "Cancelled", icon: <FiX size={12} /> },
};

// ---------- Booking row (matches ProductRow / MentorBookings layout) ----------

const BookingRow: React.FC<{
    booking: Booking;
    onCancel?: () => void;
    onJoin?: () => void;
}> = ({ booking, onCancel, onJoin }) => {
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
                {booking.mentor?.avatar ? (
                    <img
                        src={booking.mentor.avatar}
                        alt={booking.mentor.first_name}
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
                    {booking.mentor?.first_name} {booking.mentor?.last_name}
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
            <div className="flex shrink-0 items-center gap-2">
                {booking.status === "upcoming" && (
                    <>
                        <button
                            type="button"
                            onClick={stop(onCancel)}
                            aria-label="Cancel booking"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/70 transition-colors hover:text-red-400 sm:h-9 sm:w-9"
                            style={{ background: "rgba(248,113,113,0.08)" }}
                        >
                            <FiX size={14} />
                        </button>
                        <Button variant="green" className="text-xs" onClick={stop(onJoin)}>
                            <span className="flex items-center gap-1.5">
                                <FiVideo size={13} />
                                Join
                            </span>
                        </Button>
                    </>
                )}
                {booking.status === "pending" && (
                    <button
                        type="button"
                        onClick={stop(onCancel)}
                        aria-label="Cancel booking"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/70 transition-colors hover:text-red-400 sm:h-9 sm:w-9"
                        style={{ background: "rgba(248,113,113,0.08)" }}
                    >
                        <FiX size={14} />
                    </button>
                )}
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

const UserBookings = () => {
    const [tab, setTab] = useState<TabKey>("upcoming");
    const [bookings, setBookings] = useState<Booking[]>(DUMMY_BOOKINGS);
    const filtered = bookings.filter((b) => b.status === tab);

    const handleCancel = (id: string) => {
        setBookings((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
        );
    };

    const handleJoin = (booking: Booking) => {
        if (booking.meeting_link) {
            window.open(booking.meeting_link, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">My Bookings</h2>
            <p className="mb-6 text-sm text-white/40">Track sessions you've booked with mentors.</p>

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
                {filtered.length === 0 ? (
                    <EmptyState label={`No ${tab} sessions right now.`} />
                ) : (
                    filtered.map((booking) => (
                        <BookingRow
                            key={booking.id}
                            booking={booking}
                            onCancel={() => handleCancel(booking.id)}
                            onJoin={() => handleJoin(booking)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default UserBookings;
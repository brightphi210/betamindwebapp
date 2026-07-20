import { useState } from "react";
import { FiCalendar, FiCheck, FiCheckCircle, FiClock, FiUser, FiVideo, FiX } from "react-icons/fi";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";

// TODO: replace with a real bookings hook once the endpoint exists. Shape
// mirrors the likely response: mentee info, scheduled time, and status.
type Booking = {
    id: string;
    menteeName: string;
    menteeAvatar?: string;
    topic: string;
    date: string;
    time: string;
    status: "incoming" | "upcoming" | "completed" | "declined";
};

const MOCK_BOOKINGS: Booking[] = [
    { id: "b1", menteeName: "Ada Okafor", topic: "Career transition into product design", date: "Jul 22, 2026", time: "2:00 PM", status: "incoming" },
    { id: "b2", menteeName: "Chidi Eze", topic: "Portfolio review", date: "Jul 21, 2026", time: "10:00 AM", status: "incoming" },
    { id: "b3", menteeName: "Ngozi Bello", topic: "Resume & interview prep", date: "Jul 24, 2026", time: "4:30 PM", status: "upcoming" },
    { id: "b4", menteeName: "Tunde Alabi", topic: "System design deep dive", date: "Jul 26, 2026", time: "11:00 AM", status: "upcoming" },
    { id: "b5", menteeName: "Fatima Sani", topic: "Salary negotiation", date: "Jul 14, 2026", time: "3:00 PM", status: "completed" },
    { id: "b6", menteeName: "Emeka Uche", topic: "Mock technical interview", date: "Jul 9, 2026", time: "1:00 PM", status: "completed" },
];

const TABS = [
    { key: "incoming", label: "Incoming" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_MAP: Record<Booking["status"], { color: string; bg: string; label: string; icon: React.ReactNode }> = {
    incoming: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", label: "Awaiting response", icon: <FiClock size={12} /> },
    upcoming: { color: "#a6ff00", bg: "rgba(166,255,0,0.1)", label: "Confirmed", icon: <FiVideo size={12} /> },
    completed: { color: "#7dd3fc", bg: "rgba(125,211,252,0.1)", label: "Completed", icon: <FiCheckCircle size={12} /> },
    declined: { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "Declined", icon: <FiX size={12} /> },
};

const BookingCard: React.FC<{
    booking: Booking;
    onAccept?: () => void;
    onDecline?: () => void;
}> = ({ booking, onAccept, onDecline }) => {
    const statusStyle = STATUS_MAP[booking.status];
    return (
        <div className="rounded-xl p-4 sm:p-5" style={{ background: cardBg, border: cardBorder }}>
            <div className="flex items-start gap-3">
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                >
                    {booking.menteeAvatar ? (
                        <img src={booking.menteeAvatar} alt={booking.menteeName} className="h-full w-full rounded-full object-cover" />
                    ) : (
                        <FiUser size={18} className="text-white/40" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-white">{booking.menteeName}</p>
                        <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                            style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                            {statusStyle.icon}
                            {statusStyle.label}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-white/60">{booking.topic}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
                        <FiCalendar size={12} />
                        {booking.date} · {booking.time}
                    </div>
                </div>
            </div>

            {booking.status === "incoming" && (
                <div className="mt-4 flex gap-2 sm:justify-end">
                    <Button variant="white" className="text-xs" onClick={onDecline}>
                        <span className="flex items-center gap-1.5">
                            <FiX size={13} />
                            Decline
                        </span>
                    </Button>
                    <Button variant="green" className="text-xs" onClick={onAccept}>
                        <span className="flex items-center gap-1.5">
                            <FiCheck size={13} />
                            Accept
                        </span>
                    </Button>
                </div>
            )}
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

const MentorBookings = () => {
    const [tab, setTab] = useState<TabKey>("incoming");
    const [bookings, setBookings] = useState(MOCK_BOOKINGS);

    const filtered = bookings.filter((b) => b.status === tab);

    const handleAccept = (id: string) => {
        // TODO: call the accept-booking mutation, then update from the server response.
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "upcoming" } : b)));
    };

    const handleDecline = (id: string) => {
        // TODO: call the decline-booking mutation.
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "declined" } : b)));
    };

    return (
        <div>
            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">Bookings</h2>
            <p className="mb-6 text-sm text-white/40">Manage your incoming, upcoming, and past sessions.</p>

            <div className="mb-6 flex gap-2">
                {TABS.map((t) => {
                    const count = bookings.filter((b) => b.status === t.key).length;
                    const active = tab === t.key;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${active ? "bg-[#a6ff00] text-black" : "text-white/60 hover:text-white"
                                }`}
                            style={active ? undefined : { background: cardBg, border: cardBorder }}
                        >
                            {t.label}
                            <span className={active ? "text-black/60" : "text-white/30"}>({count})</span>
                        </button>
                    );
                })}
            </div>

            {filtered.length === 0 ? (
                <EmptyState label={`No ${tab} sessions right now.`} />
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onAccept={() => handleAccept(booking.id)}
                            onDecline={() => handleDecline(booking.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MentorBookings;
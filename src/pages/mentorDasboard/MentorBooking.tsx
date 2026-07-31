import { useState } from "react";
import { FiCalendar, FiCheck, FiCheckCircle, FiClock, FiUser, FiVideo, FiX } from "react-icons/fi";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
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
                    {booking.mentee?.avatar ? (
                        <img src={booking.mentee?.avatar} alt={booking.mentee?.first_name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                        <FiUser size={18} className="text-white/40" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-white">{booking.mentee?.first_name} {booking.mentee?.last_name}</p>
                        <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                            style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                            {statusStyle.icon}
                            {statusStyle.label}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-white/90">{booking.goal}</p>
                    <p className="mt-1 text-xs text-white/60">{booking.description}</p>
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

    const { mentorSession, isLoading } = useGetMentorSession()
    const mentorSessionData = mentorSession?.data
    console.log('Session data', mentorSessionData)

    const filtered = mentorSessionData.filter((b: any) => b.status === tab);

    const handleAccept = (id: string) => {
        // TODO: call the accept-booking mutation, then update from the server response.
    };

    const handleDecline = (id: string) => {
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
                            {/* <span className={active ? "text-black/60" : "text-white/30"}>({count})</span> */}
                        </button>
                    );
                })}
            </div>

            {filtered.length === 0 ? (
                <EmptyState label={`No ${tab} sessions right now.`} />
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map((booking: any) => (
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
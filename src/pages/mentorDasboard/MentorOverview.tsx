import {
    FiArrowUpRight,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiPlayCircle,
} from "react-icons/fi";
import { Link, useOutletContext } from "react-router-dom";
import LoadingOverlay from "../../component/LoadingOverlay";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import { useGetMentorStatistics } from "../../hooks/queries/allQueriess";
import { type MentorDashboardContext } from "./MentorDashboardLayout";

// TODO: replace with the real sessions hook once it exists.
type BookedSession = {
    id: string;
    mentee: string;
    topic: string;
    date: string;
    time: string;
    status: "upcoming" | "completed" | "cancelled";
};

const MOCK_SESSIONS: BookedSession[] = [
    { id: "s1", mentee: "Ada O.", topic: "Resume Review", date: "Aug 22, 2026", time: "3:00 PM", status: "upcoming" },
    { id: "s2", mentee: "Tunde A.", topic: "System Design Mock", date: "Aug 20, 2026", time: "11:00 AM", status: "upcoming" },
    { id: "s3", mentee: "Chinwe E.", topic: "Career Strategy", date: "Aug 15, 2026", time: "1:30 PM", status: "completed" },
    { id: "s4", mentee: "Bola S.", topic: "1:1 Mentorship", date: "Aug 10, 2026", time: "9:00 AM", status: "cancelled" },
];

const SESSION_STATUS_STYLES: Record<BookedSession["status"], { color: string; bg: string; label: string }> = {
    upcoming: { color: "#a6ff00", bg: "rgba(166,255,0,0.1)", label: "Upcoming" },
    completed: { color: "rgba(255,255,255,0.6)", bg: "rgba(255,255,255,0.06)", label: "Completed" },
    cancelled: { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "Cancelled" },
};

const SessionRow: React.FC<{ session: BookedSession }> = ({ session }) => {
    const statusStyle = SESSION_STATUS_STYLES[session.status];
    return (
        <div className="flex items-center gap-3 rounded-xl p-4 bg-white/5">
            <div
                className="flex h-9 w-9 shrink-0 bg-white/10 text-white items-center justify-center rounded-lg text-xs font-bold"
            >
                {session.mentee.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                    {session.mentee} — {session.topic}
                </p>
                <p className="text-xs text-white/40">
                    {session.date} · {session.time}
                </p>
            </div>
            <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
                {statusStyle.label}
            </span>
        </div>
    );
};

// ---------- Stat card ----------

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    loading?: boolean;
}> = ({ icon, label, value, loading }) => {
    return (
        <div className="rounded-xl p-5 bg-white/5">
            <div className="mb-4 flex items-center gap-2.5">
                <div className="flex shrink-0 items-center justify-center rounded-lg text-white/30">
                    {icon}
                </div>
                <span className="text-xs font-semibold text-white/50">{label}</span>
            </div>
            {loading ? (
                <div className="h-6 w-12 animate-pulse rounded bg-white/10 sm:h-7" />
            ) : (
                <p className="text-xl text-white/90 font-semibold sm:text-2xl">{value}</p>
            )}
        </div>
    );
};

const MentorOverview = () => {
    const { mentorProfile } = useOutletContext<MentorDashboardContext>();
    const { mentorStatistics, isLoading } = useGetMentorStatistics();
    const statsData = mentorStatistics?.data;

    const stats = [
        {
            key: "sessions",
            icon: <FiCheckCircle size={16} />,
            label: "Sessions Completed",
            value: String(statsData?.sessions_completed ?? 0),
        },
        {
            key: "upcoming",
            icon: <FiCalendar size={16} />,
            label: "Upcoming Sessions",
            value: String(statsData?.upcoming_sessions ?? 0),
        },
        {
            key: "courses",
            icon: <FiPlayCircle size={16} />,
            label: "Courses Sold",
            value: String(statsData?.courses_sold ?? 0),
        },
        {
            key: "books",
            icon: <FiBookOpen size={16} />,
            label: "Books Sold",
            // NOTE: API key is "ebooks_sold", not "books_sold".
            value: String(statsData?.ebooks_sold ?? 0),
        },
    ];

    return (
        <div>
            <LoadingOverlay visible={isLoading} />
            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">
                Welcome back{mentorProfile?.name ? `, ${mentorProfile.name}` : ""}
            </h2>
            <p className="mb-6 text-sm text-white/40">Here's how your mentorship is performing.</p>

            <div className="grid grid-cols-2 lg:gap-4 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.key}
                        icon={stat.icon}
                        label={stat.label}
                        value={stat.value}
                        loading={isLoading}
                    />
                ))}
            </div>

            <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Sessions Booked</h3>
                    <Link
                        to="../sessions"
                        className="flex items-center gap-1 text-xs font-semibold text-white/40 transition-colors hover:text-white"
                    >
                        View All
                        <FiArrowUpRight size={12} />
                    </Link>
                </div>
                <div className="flex flex-col gap-3">
                    {MOCK_SESSIONS.length === 0 ? (
                        <div
                            className="rounded-xl p-8 text-center text-sm text-white/40"
                            style={{ background: cardBg, border: cardBorder }}
                        >
                            No sessions booked yet.
                        </div>
                    ) : (
                        MOCK_SESSIONS.map((session) => (
                            <SessionRow key={session.id} session={session} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorOverview;
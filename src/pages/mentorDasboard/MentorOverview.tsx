import {
    FiArrowDownLeft,
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

// TODO: replace with the real wallet/transactions hook once it exists — this
// mirrors the same mock shape used in MentorWallet.tsx so the two stay
// consistent until a shared hook is wired up.
type Transaction = {
    id: string;
    type: "payout" | "earning";
    label: string;
    amount: number;
    status: "completed" | "pending" | "failed";
    date: string;
};

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: "t1", type: "earning", label: "Mentorship session — Ada O.", amount: 15000, status: "completed", date: "Jul 18, 2026" },
    { id: "t2", type: "payout", label: "Withdrawal to GTBank ••1234", amount: -50000, status: "completed", date: "Jul 12, 2026" },
    { id: "t3", type: "earning", label: "\"System Design Basics\" course sale", amount: 24000, status: "completed", date: "Jul 10, 2026" },
    { id: "t4", type: "payout", label: "Withdrawal to GTBank ••1234", amount: -20000, status: "pending", date: "Jul 6, 2026" },
];

const STATUS_STYLES: Record<Transaction["status"], { color: string; bg: string; label: string }> = {
    completed: { color: "#a6ff00", bg: "rgba(166,255,0,0.1)", label: "Completed" },
    pending: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", label: "Pending" },
    failed: { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "Failed" },
};

const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const isPayout = tx.type === "payout";
    const statusStyle = STATUS_STYLES[tx.status];
    return (
        <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: cardBg, border: cardBorder }}>
            <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: isPayout ? "rgba(248,113,113,0.05)" : "rgba(166,255,0,0.05)" }}
            >
                {isPayout ? (
                    <FiArrowUpRight size={15} className="text-red-600" />
                ) : (
                    <FiArrowDownLeft size={15} className="text-[#a6ff00]" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{tx.label}</p>
                <p className="text-xs text-white/40">{tx.date}</p>
            </div>
            <div className="shrink-0 text-right">
                <p className="text-sm font-bold">
                    {isPayout ? "-" : "+"}₦{Math.abs(tx.amount).toLocaleString()}
                </p>
                <span
                    className="mt-1 inline-block rounded-full text-white/40 px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                    {statusStyle.label}
                </span>
            </div>
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
        <div className="rounded-xl p-5" style={{ background: cardBg, border: cardBorder }}>
            <div className="mb-4 flex items-center gap-2.5">
                <div
                    className="flex shrink-0 items-center justify-center rounded-lg text-white/30"
                >
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

    // Map the API's snake_case response onto the stat cards. All numeric fields
    // come back as numbers except total_earnings, which is a numeric string
    // (e.g. "0.00").
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
                    <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
                    <Link
                        to="../wallet"
                        className="flex items-center gap-1 text-xs font-semibold text-white/40 transition-colors hover:text-white"
                    >
                        View Wallet
                        <FiArrowUpRight size={12} />
                    </Link>
                </div>
                <div className="flex flex-col gap-3">
                    {MOCK_TRANSACTIONS.map((tx) => (
                        <TransactionRow key={tx.id} tx={tx} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MentorOverview;
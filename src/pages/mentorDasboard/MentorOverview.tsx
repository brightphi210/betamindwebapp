import {
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiDollarSign,
    FiPlayCircle,
    FiTrendingUp,
    FiUsers,
} from "react-icons/fi";
import { useOutletContext } from "react-router-dom";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import { type MentorDashboardContext } from "./MentorDashboardLayout";

// TODO: replace with real data once the overview/analytics endpoint exists.
// Shape mirrors what the backend will likely return so swapping in a real
// hook later is a drop-in change.
const MOCK_OVERVIEW = {
    sessionsCompleted: 34,
    sessionsUpcoming: 5,
    coursesSold: 12,
    booksSold: 7,
    totalEarnings: 482500, // in kobo-free naira, matches bank_account currency: "NGN"
    monthlyChangePercent: 18,
    recentActivity: [
        { id: 1, label: "Session completed with Ada O.", time: "2 hours ago", icon: "session" },
        { id: 2, label: "\"System Design Basics\" course purchased", time: "Yesterday", icon: "course" },
        { id: 3, label: "Session completed with Chidi E.", time: "2 days ago", icon: "session" },
        { id: 4, label: "\"Product Thinking\" ebook purchased", time: "4 days ago", icon: "book" },
    ],
};

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    sublabel?: string;
}> = ({ icon, label, value, sublabel }) => (
    <div className="rounded-xl p-5" style={{ background: cardBg, border: cardBorder }}>
        <div
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#a6ff00]"
            style={{ background: "rgba(166,255,0,0.1)" }}
        >
            {icon}
        </div>
        <p className="text-2xl font-black text-white sm:text-3xl">{value}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p>
        {sublabel && <p className="mt-2 text-xs text-white/40">{sublabel}</p>}
    </div>
);

const ACTIVITY_ICON_MAP: Record<string, React.ReactNode> = {
    session: <FiCheckCircle size={14} className="text-[#a6ff00]" />,
    course: <FiPlayCircle size={14} className="text-[#a6ff00]" />,
    book: <FiBookOpen size={14} className="text-[#a6ff00]" />,
};

const MentorOverview = () => {
    const { mentorProfile } = useOutletContext<MentorDashboardContext>();
    const data = MOCK_OVERVIEW;

    return (
        <div>
            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">
                Welcome back{mentorProfile?.nick_name ? `, ${mentorProfile.nick_name}` : ""}
            </h2>
            <p className="mb-6 text-sm text-white/40">Here's how your mentorship is performing.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<FiCheckCircle size={17} />}
                    label="Sessions Completed"
                    value={String(data.sessionsCompleted)}
                />
                <StatCard
                    icon={<FiCalendar size={17} />}
                    label="Upcoming Sessions"
                    value={String(data.sessionsUpcoming)}
                />
                <StatCard icon={<FiPlayCircle size={17} />} label="Courses Sold" value={String(data.coursesSold)} />
                <StatCard icon={<FiBookOpen size={17} />} label="Books Sold" value={String(data.booksSold)} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl p-5 lg:col-span-1" style={{ background: cardBg, border: cardBorder }}>
                    <div
                        className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#a6ff00]"
                        style={{ background: "rgba(166,255,0,0.1)" }}
                    >
                        <FiDollarSign size={17} />
                    </div>
                    <p className="text-2xl font-black text-white sm:text-3xl">
                        ₦{data.totalEarnings.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/40">Total Earnings</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[#a6ff00]">
                        <FiTrendingUp size={13} />
                        {data.monthlyChangePercent}% vs last month
                    </div>
                </div>

                <div className="rounded-xl p-5 lg:col-span-2" style={{ background: cardBg, border: cardBorder }}>
                    <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                        <FiUsers size={15} className="text-[#a6ff00]" />
                        Recent Activity
                    </div>
                    <div className="flex flex-col gap-3">
                        {data.recentActivity.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                                <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                    style={{ background: "rgba(255,255,255,0.04)" }}
                                >
                                    {ACTIVITY_ICON_MAP[item.icon]}
                                </div>
                                <p className="flex-1 text-sm text-white/70">{item.label}</p>
                                <span className="shrink-0 text-xs text-white/30">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorOverview;
import { useState } from "react";
import {
    FiArrowUpRight,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiDollarSign,
    FiPlayCircle,
    FiTrendingUp
} from "react-icons/fi";
import { Link, useOutletContext } from "react-router-dom";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import { type MentorDashboardContext } from "./MentorDashboardLayout";

// TODO: replace with real data once the overview/analytics endpoint exists.
// Shapes mirror what the backend will likely return so swapping in a real
// hook later is a drop-in change.
const STATS = [
    { key: "sessions", icon: <FiCheckCircle size={16} />, label: "Sessions Completed", value: "34", trend: 16 },
    { key: "upcoming", icon: <FiCalendar size={16} />, label: "Upcoming Sessions", value: "5", trend: -8.4 },
    { key: "courses", icon: <FiPlayCircle size={16} />, label: "Courses Sold", value: "12", trend: 12.05 },
    { key: "books", icon: <FiBookOpen size={16} />, label: "Books Sold", value: "7", trend: 2 },
];

const TOTAL_EARNINGS = 482500;
const TOTAL_EARNINGS_TREND = 18;

// Last 7 days of earnings vs payouts — feeds the chart below.
const CHART_DATA = [
    { date: "Jul 15", earnings: 3200, payouts: 1400 },
    { date: "Jul 16", earnings: 3800, payouts: 1600 },
    { date: "Jul 17", earnings: 3500, payouts: 1750 },
    { date: "Jul 18", earnings: 4300, payouts: 1900 },
    { date: "Jul 19", earnings: 4600, payouts: 2050 },
    { date: "Jul 20", earnings: 5100, payouts: 2300 },
    { date: "Jul 21", earnings: 5400, payouts: 2600 },
];

const RECENT_ACTIVITY = [
    {
        id: 1,
        icon: <FiCheckCircle size={25} />,
        label: "Session completed with Ada O.",
        time: "2 hours ago",
        status: "Completed",
        statusColor: "#a6ff00",
    },
    {
        id: 2,
        icon: <FiPlayCircle size={25} />,
        label: '"System Design Basics" course purchased',
        time: "Yesterday",
        status: "Purchased",
        statusColor: "#7dd3fc",
    },
    {
        id: 3,
        icon: <FiCheckCircle size={25} />,
        label: "Session completed with Chidi E.",
        time: "2 days ago",
        status: "Completed",
        statusColor: "#a6ff00",
    },
    {
        id: 4,
        icon: <FiBookOpen size={25} />,
        label: '"Product Thinking" ebook purchased',
        time: "4 days ago",
        status: "Purchased",
        statusColor: "#7dd3fc",
    },
];

// ---------- Stat card ----------

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    trend: number;
}> = ({ icon, label, value }) => {
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
            <p className="text-xl text-white/90 font-semibold sm:text-2xl">{value}</p>
        </div>
    );
};

// ---------- Earnings chart (self-contained SVG, no chart library dependency) ----------

const CHART_WIDTH = 700;
const CHART_HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 26, left: 8 };

const EarningsChart: React.FC<{ data: typeof CHART_DATA }> = ({ data }) => {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    const maxVal = Math.max(...data.flatMap((d) => [d.earnings, d.payouts])) * 1.15;
    const innerWidth = CHART_WIDTH - PAD.left - PAD.right;
    const innerHeight = CHART_HEIGHT - PAD.top - PAD.bottom;
    const stepX = innerWidth / (data.length - 1);

    const toPoints = (key: "earnings" | "payouts") =>
        data.map((d, i) => ({
            x: PAD.left + i * stepX,
            y: PAD.top + (1 - d[key] / maxVal) * innerHeight,
        }));

    const earningsPts = toPoints("earnings");
    const payoutsPts = toPoints("payouts");

    const linePath = (pts: { x: number; y: number }[]) =>
        pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    const areaPath = (pts: { x: number; y: number }[]) =>
        `${linePath(pts)} L ${pts[pts.length - 1].x} ${CHART_HEIGHT - PAD.bottom} L ${pts[0].x} ${CHART_HEIGHT - PAD.bottom} Z`;

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
        y: PAD.top + (1 - t) * innerHeight,
        value: Math.round((maxVal * t) / 100) * 100,
    }));

    const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;
        const idx = Math.max(0, Math.min(data.length - 1, Math.round((relX - PAD.left) / stepX)));
        setHoverIdx(idx);
    };

    const tooltipLeftPct =
        hoverIdx !== null ? Math.min(85, Math.max(15, (earningsPts[hoverIdx].x / CHART_WIDTH) * 100)) : 0;

    return (
        <div className="rounded-xl p-5 sm:p-6" style={{ background: cardBg, border: cardBorder }}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/40">
                        <FiDollarSign size={13} className="text-[#a6ff00]" />
                        Total Earnings
                    </div>
                    <p className="mt-1 text-2xl font-black text-white sm:text-3xl">
                        ₦{TOTAL_EARNINGS.toLocaleString()}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#a6ff00]">
                        <FiTrendingUp size={12} />
                        {TOTAL_EARNINGS_TREND}%<span className="font-normal text-white/30">&nbsp;vs last month</span>
                    </div>
                </div>
                <Link
                    to="../wallet"
                    className="flex items-center gap-1 text-xs font-semibold text-white/40 transition-colors hover:text-white"
                >
                    View Wallet
                    <FiArrowUpRight size={12} />
                </Link>
            </div>

            <div className="mb-4 flex items-center gap-4 text-xs text-white/50">
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#a6ff00]" />
                    Earnings
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: "#7dd3fc" }} />
                    Payouts
                </span>
            </div>

            <div className="relative" onMouseLeave={() => setHoverIdx(null)}>
                <svg
                    viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                    className="w-full"
                    onMouseMove={handleMove}
                    role="img"
                    aria-label="Earnings and payouts over the last 7 days"
                >
                    <defs>
                        <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a6ff00" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#a6ff00" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="payoutsFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Gridlines + y-axis labels */}
                    {yTicks.map((tick) => (
                        <g key={tick.y}>
                            <line
                                x1={PAD.left}
                                x2={CHART_WIDTH - PAD.right}
                                y1={tick.y}
                                y2={tick.y}
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth="1"
                            />
                            <text x={PAD.left} y={tick.y - 4} fontSize="10" fill="rgba(255,255,255,0.25)">
                                {tick.value >= 1000 ? `${(tick.value / 1000).toFixed(0)}k` : tick.value}
                            </text>
                        </g>
                    ))}

                    <path d={areaPath(payoutsPts)} fill="url(#payoutsFill)" />
                    <path d={linePath(payoutsPts)} fill="none" stroke="#7dd3fc" strokeWidth="2" />

                    <path d={areaPath(earningsPts)} fill="url(#earningsFill)" />
                    <path d={linePath(earningsPts)} fill="none" stroke="#a6ff00" strokeWidth="2" />

                    {hoverIdx !== null && (
                        <>
                            <line
                                x1={earningsPts[hoverIdx].x}
                                x2={earningsPts[hoverIdx].x}
                                y1={PAD.top}
                                y2={CHART_HEIGHT - PAD.bottom}
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="1"
                            />
                            <circle cx={earningsPts[hoverIdx].x} cy={earningsPts[hoverIdx].y} r="4" fill="#a6ff00" />
                            <circle cx={payoutsPts[hoverIdx].x} cy={payoutsPts[hoverIdx].y} r="4" fill="#7dd3fc" />
                        </>
                    )}

                    {data.map((d, i) => (
                        <text
                            key={d.date}
                            x={PAD.left + i * stepX}
                            y={CHART_HEIGHT - 6}
                            fontSize="10"
                            fill="rgba(255,255,255,0.3)"
                            textAnchor="middle"
                        >
                            {d.date}
                        </text>
                    ))}
                </svg>

                {hoverIdx !== null && (
                    <div
                        className="pointer-events-none absolute rounded-xl px-3 py-2 text-xs shadow-xl"
                        style={{
                            left: `${tooltipLeftPct}%`,
                            top: 0,
                            transform: "translate(-50%, -100%)",
                            background: "#0a0d09",
                            border: cardBorder,
                            whiteSpace: "nowrap",
                        }}
                    >
                        <p className="mb-1 font-bold text-white">{data[hoverIdx].date}</p>
                        <p className="flex items-center gap-1.5">
                            <span className="font-bold text-[#a6ff00]">
                                ₦{data[hoverIdx].earnings.toLocaleString()}
                            </span>
                            <span className="text-white/40">Earnings</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                            <span className="font-bold" style={{ color: "#7dd3fc" }}>
                                ₦{data[hoverIdx].payouts.toLocaleString()}
                            </span>
                            <span className="text-white/40">Payouts</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};


const MentorOverview = () => {
    const { mentorProfile } = useOutletContext<MentorDashboardContext>();

    return (
        <div>
            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">
                Welcome back{mentorProfile?.nick_name ? `, ${mentorProfile.nick_name}` : ""}
            </h2>
            <p className="mb-6 text-sm text-white/40">Here's how your mentorship is performing.</p>

            <div className="grid grid-cols-2 lg:gap-4 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat) => (
                    <StatCard key={stat.key} icon={stat.icon} label={stat.label} value={stat.value} trend={stat.trend} />
                ))}
            </div>

            <div className="mt-4">
                <EarningsChart data={CHART_DATA} />
            </div>
        </div>
    );
};

export default MentorOverview;
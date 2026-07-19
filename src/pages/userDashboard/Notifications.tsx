import { useState } from "react";
import {
    FiArrowLeft,
    FiBell,
    FiCalendar,
    FiCheck,
    FiCheckCircle,
    FiDollarSign,
    FiMessageSquare,
    FiShield,
    FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// ---------- Design tokens (shared with MentorProfile / dashboard pages) ----------
const cardBg = "rgba(255,255,255,0.02)";
const cardBorder = "1px solid rgba(205,220,57,.08)";

const pageBackground =
    "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)";

// ---------- Types ----------

type NotificationType = "message" | "booking" | "payment" | "verification" | "system";

type Notification = {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    time: string;
    read: boolean;
};

type FilterTab = "all" | "unread";

// TODO: Replace with real data from your notifications hook/API,
// e.g. useGetMyNotifications(). Shape kept identical to the Notification type
// above so swapping the data source later is a one-line change.
const SAMPLE_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "booking",
        title: "New session booked",
        description: "Chidi Okafor booked a 1:1 mentoring session for Thursday, 2:00 PM.",
        time: "10m ago",
        read: false,
    },
    {
        id: "2",
        type: "message",
        title: "New message",
        description: "You have a new message from Amaka Johnson regarding your last session.",
        time: "1h ago",
        read: false,
    },
    {
        id: "3",
        type: "verification",
        title: "Profile verified",
        description: "Your mentor profile has been reviewed and approved. You're now visible to mentees.",
        time: "3h ago",
        read: false,
    },
    {
        id: "4",
        type: "payment",
        title: "Payout processed",
        description: "A payout of ₦45,000 was sent to your linked bank account.",
        time: "1d ago",
        read: true,
    },
    {
        id: "5",
        type: "system",
        title: "Profile reminder",
        description: "Add your years of experience to strengthen your mentor profile.",
        time: "2d ago",
        read: true,
    },
];

// ---------- Icon / color mapping per type ----------

const typeMeta: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
    message: {
        icon: <FiMessageSquare size={16} />,
        color: "#a6ff00",
        bg: "rgba(166,255,0,0.1)",
    },
    booking: {
        icon: <FiCalendar size={16} />,
        color: "#60a5fa",
        bg: "rgba(96,165,250,0.1)",
    },
    payment: {
        icon: <FiDollarSign size={16} />,
        color: "#34d399",
        bg: "rgba(52,211,153,0.1)",
    },
    verification: {
        icon: <FiShield size={16} />,
        color: "#a6ff00",
        bg: "rgba(166,255,0,0.1)",
    },
    system: {
        icon: <FiBell size={16} />,
        color: "#fbbf24",
        bg: "rgba(251,191,36,0.1)",
    },
};

// ---------- Row component ----------

const NotificationRow: React.FC<{
    notification: Notification;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ notification, onMarkRead, onDelete }) => {
    const meta = typeMeta[notification.type];

    return (
        <div
            className="group relative flex gap-3 rounded-xl px-4 py-4 transition-colors sm:gap-4"
            style={{
                background: notification.read ? cardBg : "rgba(166,255,0,0.03)",
                border: cardBorder,
            }}
        >
            {!notification.read && (
                <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#a6ff00]" />
            )}

            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: meta.bg, color: meta.color }}
            >
                {meta.icon}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{notification.title}</p>
                <p className="mt-1 text-sm text-white/50">{notification.description}</p>
                <p className="mt-2 text-xs text-white/30">{notification.time}</p>
            </div>

            <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!notification.read && (
                    <button
                        type="button"
                        onClick={() => onMarkRead(notification.id)}
                        title="Mark as read"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-[#a6ff00]"
                        style={{ background: cardBg, border: cardBorder }}
                    >
                        <FiCheck size={14} />
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onDelete(notification.id)}
                    title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-red-400"
                    style={{ background: cardBg, border: cardBorder }}
                >
                    <FiTrash2 size={14} />
                </button>
            </div>
        </div>
    );
};

// ---------- Empty state ----------

const EmptyState: React.FC<{ filter: FilterTab }> = ({ filter }) => (
    <div className="flex flex-col items-center justify-center rounded-2xl px-6 py-20 text-center" style={{ background: cardBg, border: cardBorder }}>
        <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: cardBg, border: cardBorder }}
        >
            <FiBell size={26} className="text-white/20" />
        </div>
        <p className="text-sm font-semibold text-white">
            {filter === "unread" ? "You're all caught up" : "No notifications yet"}
        </p>
        <p className="mt-1 text-xs text-white/40">
            {filter === "unread"
                ? "No unread notifications right now."
                : "We'll let you know when something needs your attention."}
        </p>
    </div>
);

// ---------- Main component ----------

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
    const [filter, setFilter] = useState<FilterTab>("all");

    const unreadCount = notifications.filter((n) => !n.read).length;
    const visible = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

    const markRead = (id: string) =>
        setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

    const deleteNotification = (id: string) =>
        setNotifications((list) => list.filter((n) => n.id !== id));

    const markAllRead = () =>
        setNotifications((list) => list.map((n) => ({ ...n, read: true })));

    return (
        <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/overview")}
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
                >
                    <FiArrowLeft size={15} />
                    Back to Dashboard
                </button>

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black leading-tight sm:text-4xl">Notifications</h1>
                        <p className="mt-3 text-sm text-white/40 sm:text-base">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
                                : "You're all caught up."}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllRead}
                            className="inline-flex items-center gap-2 self-start rounded-xl px-4 py-2 text-xs font-semibold text-white/70 transition-colors hover:text-[#a6ff00] sm:self-auto"
                            style={{ background: cardBg, border: cardBorder }}
                        >
                            <FiCheckCircle size={14} />
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="mb-6 flex items-center gap-6" style={{ borderBottom: cardBorder }}>
                    {(["all", "unread"] as FilterTab[]).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setFilter(tab)}
                            className={`border-b-2 pb-3 text-xs font-semibold capitalize transition-colors ${filter === tab
                                ? "border-[#a6ff00] text-white"
                                : "border-transparent text-white/40 hover:text-white"
                                }`}
                        >
                            {tab === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                        </button>
                    ))}
                </div>

                {visible.length > 0 ? (
                    <div className="space-y-3">
                        {visible.map((n) => (
                            <NotificationRow
                                key={n.id}
                                notification={n}
                                onMarkRead={markRead}
                                onDelete={deleteNotification}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState filter={filter} />
                )}
            </div>
        </div>
    );
};

export default Notifications;
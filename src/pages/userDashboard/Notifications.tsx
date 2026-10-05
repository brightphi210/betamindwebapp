import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
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
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingOverlay from "../../component/LoadingOverlay";
import { useMarkNotificationRead } from "../../hooks/mutations/allMutation";
import { useGetNotifications } from "../../hooks/queries/allQueriess";

// ---------- Design tokens ----------
const cardBg = "rgba(255,255,255,0.02)";
const cardBorder = "1px solid rgba(205,220,57,.08)";

const pageBackground =
    "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)";

// ---------- Types ----------
type NotificationType =
    | "message"
    | "booking"
    | "payment"
    | "verification"
    | "system";

type Notification = {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    time: string;
    read: boolean;
    link?: string;
};

type FilterTab = "all" | "unread";

const toArray = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.results)) return raw.results;
    if (Array.isArray(raw.data?.data)) return raw.data.data;
    return [];
};

const formatRelativeTime = (iso?: string) => {
    if (!iso) return "";
    const created = new Date(iso);
    if (Number.isNaN(created.getTime())) return "";
    const diffMs = Date.now() - created.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const mapNotification = (n: any): Notification => {
    const typeRaw = String(n.notification_type || "").toLowerCase();
    const typeMap: Record<string, NotificationType> = {
        message: "message",
        booking: "booking",
        payment: "payment",
        verification: "verification",
        system: "system",
    };
    const type = typeMap[typeRaw] ?? "system";

    return {
        id: String(n.id),
        type,
        title: n.title || "Notification",
        description: n.body || "",
        time: formatRelativeTime(n.created_at),
        read: !!n.is_read,
        link: n.link || undefined,
    };
};

// ---------- Icon / color mapping ----------
const typeMeta: Record<
    NotificationType,
    { icon: React.ReactNode; color: string; bg: string }
> = {
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

// ---------- Row ----------
const NotificationRow: React.FC<{
    notification: Notification;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClick: () => void;
}> = ({ notification, onMarkRead, onDelete, onClick }) => {
    const meta = typeMeta[notification.type];

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick();
                }
            }}
            className="group relative flex cursor-pointer gap-3 rounded-xl px-4 py-4 transition-colors sm:gap-4"
            style={{
                background: notification.read
                    ? cardBg
                    : "rgba(166,255,0,0.03)",
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
                <p className="text-sm font-semibold text-white">
                    {notification.title}
                </p>
                <p className="mt-1 text-sm text-white/50">
                    {notification.description}
                </p>
                <p className="mt-2 text-xs text-white/30">
                    {notification.time}
                </p>
            </div>

            <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!notification.read && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(notification.id);
                        }}
                        title="Mark as read"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-[#a6ff00]"
                        style={{ background: cardBg, border: cardBorder }}
                    >
                        <FiCheck size={14} />
                    </button>
                )}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                    }}
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
    <div
        className="flex flex-col items-center justify-center rounded-2xl px-6 py-20 text-center"
        style={{ background: cardBg, border: cardBorder }}
    >
        <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: cardBg, border: cardBorder }}
        >
            <FiBell size={26} className="text-white/20" />
        </div>
        <p className="text-sm font-semibold text-white">
            {filter === "unread"
                ? "You're all caught up"
                : "No notifications yet"}
        </p>
        <p className="mt-1 text-xs text-white/40">
            {filter === "unread"
                ? "No unread notifications right now."
                : "We'll let you know when something needs your attention."}
        </p>
    </div>
);

// ---------- Main ----------
const Notifications = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const focusId = searchParams.get("id");

    const { notificationsData, isLoading } = useGetNotifications();
    const { mutate: markReadMutation, isPending: isMarking } =
        useMarkNotificationRead();

    console.log('this is notifications', notificationsData?.data)

    const [filter, setFilter] = useState<FilterTab>("all");
    /** Optimistic read overrides: id → is_read */
    const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>(
        {}
    );
    /** Locally hidden (deleted) ids */
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

    const apiNotifications = useMemo(() => {
        const list = toArray(
            notificationsData?.data ?? notificationsData
        ).map(mapNotification);
        return list;
    }, [notificationsData]);

    const notifications = useMemo(() => {
        return apiNotifications
            .filter((n) => !hiddenIds.has(n.id))
            .map((n) =>
                readOverrides[n.id] !== undefined
                    ? { ...n, read: readOverrides[n.id] }
                    : n
            );
    }, [apiNotifications, readOverrides, hiddenIds]);

    const unreadCount = notifications.filter((n) => !n.read).length;
    const visible =
        filter === "unread"
            ? notifications.filter((n) => !n.read)
            : notifications;

    const markAsRead = (id: string, showToast = true) => {
        const current = notifications.find((n) => n.id === id);
        if (!current || current.read) return;

        setReadOverrides((prev) => ({ ...prev, [id]: true }));

        markReadMutation(id, {
            onSuccess: () => {
                if (showToast) toast.success("Notification Read");
            },
            onError: () => {
                setReadOverrides((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
                toast.error("Could not mark notification as read");
            },
        });
    };

    // Deep-link: /notifications?id=xxx → open page + mark that one read + toast
    useEffect(() => {
        if (!focusId || isLoading) return;
        const target = apiNotifications.find((n) => n.id === focusId);
        if (!target) return;
        if (!target.read && readOverrides[focusId] === undefined) {
            markAsRead(focusId, true);
        }
        // Clear ?id= so refresh doesn't re-toast
        searchParams.delete("id");
        setSearchParams(searchParams, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusId, isLoading, apiNotifications]);

    const handleRowClick = (n: Notification) => {
        if (!n.read) markAsRead(n.id, true);
        if (n.link) {
            if (n.link.startsWith("http")) {
                window.open(n.link, "_blank", "noopener,noreferrer");
            } else {
                navigate(n.link);
            }
        }
    };

    const handleDelete = (id: string) => {
        setHiddenIds((prev) => new Set(prev).add(id));
        // Optional: call DELETE notifications/{id}/ when you have the endpoint
    };

    const markAllRead = () => {
        notifications
            .filter((n) => !n.read)
            .forEach((n) => markAsRead(n.id, false));
        toast.success("All notifications marked as read");
    };

    return (
        <div
            className="min-h-screen w-full text-white"
            style={{ background: pageBackground }}
        >
            <LoadingOverlay visible={isLoading} />

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
                        <h1 className="text-3xl font-black leading-tight sm:text-4xl">
                            Notifications
                        </h1>
                        <p className="mt-3 text-sm text-white/40 sm:text-base">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"
                                }.`
                                : "You're all caught up."}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllRead}
                            disabled={isMarking}
                            className="inline-flex items-center gap-2 self-start rounded-xl px-4 py-2 text-xs font-semibold text-white/70 transition-colors hover:text-[#a6ff00] sm:self-auto disabled:opacity-50"
                            style={{ background: cardBg, border: cardBorder }}
                        >
                            <FiCheckCircle size={14} />
                            Mark all as read
                        </button>
                    )}
                </div>

                <div
                    className="mb-6 flex items-center gap-6"
                    style={{ borderBottom: cardBorder }}
                >
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
                            {tab === "all"
                                ? "All"
                                : `Unread${unreadCount > 0
                                    ? ` (${unreadCount})`
                                    : ""
                                }`}
                        </button>
                    ))}
                </div>

                {visible.length > 0 ? (
                    <div className="space-y-3">
                        {visible.map((n) => (
                            <NotificationRow
                                key={n.id}
                                notification={n}
                                onMarkRead={(id) => markAsRead(id, true)}
                                onDelete={handleDelete}
                                onClick={() => handleRowClick(n)}
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
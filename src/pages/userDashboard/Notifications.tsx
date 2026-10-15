import { useEffect, useMemo, useState } from "react";
import {
    FiArrowLeft,
    FiBell,
    FiCalendar,
    FiCheck,
    FiCheckCircle,
    FiChevronLeft,
    FiChevronRight,
    FiDollarSign,
    FiMessageSquare,
    FiShield,
    FiTrash2,
    FiUser,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingOverlay from "../../component/LoadingOverlay";
import { useMarkNotificationRead } from "../../hooks/mutations/allMutation";
import { useGetNotifications } from "../../hooks/queries/allQueriess";
import { useGlobalContext } from "../../providers/GlobalContext";

// ---------- Design tokens ----------
const cardBg = "rgba(255,255,255,0.02)";
const cardBorder = "1px solid rgba(205,220,57,.08)";

const pageBackground =
    "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)";

// ---------- Pagination config ----------
const PER_PAGE_DESKTOP = 4;
const PER_PAGE_MOBILE = 3;
/** Matches Tailwind's `lg` breakpoint */
const DESKTOP_QUERY = "(min-width: 1024px)";

const MENTOR_ROUTE = "/dashboard/mentor/overview";

/** 4 per page on laptop/desktop, 3 on smaller screens (updates on resize) */
const useItemsPerPage = () => {
    const getValue = () =>
        typeof window !== "undefined" &&
            window.matchMedia(DESKTOP_QUERY).matches
            ? PER_PAGE_DESKTOP
            : PER_PAGE_MOBILE;

    const [perPage, setPerPage] = useState(getValue);

    useEffect(() => {
        const mql = window.matchMedia(DESKTOP_QUERY);
        const onChange = () => setPerPage(getValue());
        onChange();
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return perPage;
};

/** e.g. [1, "...", 4, 5, 6, "...", 12] */
const getPageItems = (current: number, total: number): (number | "...")[] => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const items: (number | "...")[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) items.push("...");
    for (let p = start; p <= end; p++) items.push(p);
    if (end < total - 1) items.push("...");
    items.push(total);

    return items;
};

// ---------- Types ----------
type NotificationType =
    | "message"
    | "booking"
    | "payment"
    | "verification"
    | "mentor"
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
        mentor: "mentor",
        system: "system",
    };
    // Any type containing "mentor" (e.g. "mentor_request") is treated as mentor
    const type: NotificationType = typeRaw.includes("mentor")
        ? "mentor"
        : typeMap[typeRaw] ?? "system";

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
    mentor: {
        icon: <FiUser size={16} />,
        color: "#c084fc",
        bg: "rgba(192,132,252,0.1)",
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

// ---------- Pagination ----------
const Pagination: React.FC<{
    page: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    onChange: (page: number) => void;
}> = ({ page, totalPages, totalItems, perPage, onChange }) => {
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, totalItems);

    const navBtn =
        "flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:text-[#a6ff00] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-white/60";

    return (
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-white/40">
                Showing {from}–{to} of {totalItems}
            </p>

            <nav className="flex items-center gap-1.5" aria-label="Pagination">
                <button
                    type="button"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                    className={navBtn}
                    style={{ background: cardBg, border: cardBorder }}
                >
                    <FiChevronLeft size={15} />
                </button>

                {getPageItems(page, totalPages).map((item, idx) =>
                    item === "..." ? (
                        <span
                            key={`ellipsis-${idx}`}
                            className="flex h-9 w-6 items-center justify-center text-xs text-white/30"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            aria-label={`Page ${item}`}
                            aria-current={item === page ? "page" : undefined}
                            onClick={() => onChange(item)}
                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors ${item === page
                                ? "text-black"
                                : "text-white/60 hover:text-[#a6ff00]"
                                }`}
                            style={
                                item === page
                                    ? { background: "#a6ff00" }
                                    : { background: cardBg, border: cardBorder }
                            }
                        >
                            {item}
                        </button>
                    )
                )}

                <button
                    type="button"
                    aria-label="Next page"
                    disabled={page >= totalPages}
                    onClick={() => onChange(page + 1)}
                    className={navBtn}
                    style={{ background: cardBg, border: cardBorder }}
                >
                    <FiChevronRight size={15} />
                </button>
            </nav>
        </div>
    );
};

// ---------- Main ----------
const Notifications = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const focusId = searchParams.get("id");

    const { notificationsData, isLoading } = useGetNotifications();
    const { mutate: markReadMutation, isPending: isMarking } =
        useMarkNotificationRead();

    const [filter, setFilter] = useState<FilterTab>("all");
    const [page, setPage] = useState(1);
    const perPage = useItemsPerPage();
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

    const { addToast } = useGlobalContext();

    const unreadCount = notifications.filter((n) => !n.read).length;
    const filtered =
        filter === "unread"
            ? notifications.filter((n) => !n.read)
            : notifications;

    // Pagination (client-side: the API returns every notification in one response)
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    // Clamp so deleting / marking read / resizing never leaves us on an empty page
    const currentPage = Math.min(page, totalPages);
    const visible = filtered.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    const goToPage = (next: number) => {
        setPage(next);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const changeFilter = (tab: FilterTab) => {
        setFilter(tab);
        setPage(1);
    };

    const markAsRead = (id: string, showToast = true) => {
        const current = notifications.find((n) => n.id === id);
        if (!current || current.read) return;

        setReadOverrides((prev) => ({ ...prev, [id]: true }));

        markReadMutation(id, {
            onSuccess: () => {
                if (showToast) addToast("Notification read", "success");
            },
            onError: () => {
                setReadOverrides((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
                addToast("Could not mark notification as read", "error");
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

        // Mentor notifications always go to the mentor dashboard
        if (n.type === "mentor") {
            navigate(MENTOR_ROUTE);
            return;
        }

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
    };

    const markAllRead = () => {
        notifications
            .filter((n) => !n.read)
            .forEach((n) => markAsRead(n.id, false));
        addToast("All notifications marked as read", "success");

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
                            onClick={() => changeFilter(tab)}
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
                    <>
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

                        {totalPages > 1 && (
                            <Pagination
                                page={currentPage}
                                totalPages={totalPages}
                                totalItems={filtered.length}
                                perPage={perPage}
                                onChange={goToPage}
                            />
                        )}
                    </>
                ) : (
                    <EmptyState filter={filter} />
                )}
            </div>
        </div>
    );
};

export default Notifications;